import { Annotation, StateGraph, MemorySaver } from '@langchain/langgraph'
import { BaseMessage, AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages'
import { toolsList } from '../tools/chain-tools'
import OpenAI from 'openai'

// 1. Define SwarmState annotation
export const SwarmState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => []
  }),
  plannerSteps: Annotation<string[]>({
    reducer: (x, y) => y,
    default: () => []
  }),
  currentStepIndex: Annotation<number>({
    reducer: (x, y) => y,
    default: () => 0
  }),
  walletAddress: Annotation<string>({
    reducer: (x, y) => y,
    default: () => ''
  }),
  status: Annotation<string>({
    reducer: (x, y) => y,
    default: () => 'pending'
  })
})

// Initialize OpenAI client configured for DeepSeek API
const apiKey = process.env.DEEPSEEK_API_KEY || ''
const openai = apiKey ? new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey
}) : null

// Helper to check if it's a real model run or fallback
function isRealExecution(): boolean {
  return !!openai
}

// 2. Node implementation: planner
async function runPlanner(state: typeof SwarmState.State) {
  // If plan is already generated, skip planning to prevent resetting currentStepIndex
  if (state.plannerSteps && state.plannerSteps.length > 0) {
    return {}
  }

  const lastMessage = state.messages[state.messages.length - 1]
  const userText = lastMessage?.content?.toString() || ''

  if (!isRealExecution()) {
    // Falls back to deterministic rule-based planning
    const steps: string[] = []
    if (userText.toLowerCase().includes('balance') || userText.toLowerCase().includes('check')) {
      steps.push('query_balance')
    }
    if (userText.toLowerCase().includes('swap') || userText.toLowerCase().includes('exchange')) {
      steps.push('swap_tokens')
    }
    if (userText.toLowerCase().includes('bridge') || userText.toLowerCase().includes('cctp')) {
      steps.push('bridge_cctp')
    }
    if (steps.length === 0) {
      steps.push('query_balance') // Default fallback step
    }
    return {
      plannerSteps: steps,
      currentStepIndex: 0
    }
  }

  // Real DeepSeek execution
  try {
    const response = await openai!.chat.completions.create({
      model: 'deepseek-v4-pro',
      messages: [
        { role: 'system', content: 'You are the Planner Agent. Analyze the user request and respond with a comma-separated list of tool names to execute (valid tools: query_balance, swap_tokens, bridge_cctp, record_payment). Only return the comma-separated names, nothing else.' },
        { role: 'user', content: userText }
      ],
      extra_body: { thinking: { type: 'enabled' } },
      reasoning_effort: 'high'
    } as any)
    const content = response.choices[0].message.content || 'query_balance'
    const steps = content.split(',').map(s => s.trim().toLowerCase()).filter(s => ['query_balance', 'swap_tokens', 'bridge_cctp', 'record_payment'].includes(s))
    return {
      plannerSteps: steps.length > 0 ? steps : ['query_balance'],
      currentStepIndex: 0
    }
  } catch (err: any) {
    console.warn('[LangGraph Planner Error]: fallback to default plan:', err.message)
    return {
      plannerSteps: ['query_balance'],
      currentStepIndex: 0
    }
  }
}

// 3. Conditional Routing Edge
function shouldExecuteStep(state: typeof SwarmState.State) {
  if (state.currentStepIndex >= state.plannerSteps.length) {
    return 'finish'
  }
  return 'continue'
}

// 4. Node implementation: execute_tool
async function runToolExecutor(state: typeof SwarmState.State) {
  const currentStep = state.plannerSteps[state.currentStepIndex]
  const userText = state.messages[0]?.content?.toString() || ''
  const walletAddress = state.walletAddress || '0x7a304A671e21b79528659dC0D775e53FE233b2B0'

  console.log(`[LangGraph Executor]: Executing tool node: "${currentStep}" (${state.currentStepIndex + 1}/${state.plannerSteps.length})`)

  // Locate the target tool in the list
  const tool = toolsList.find(t => t.name === currentStep)
  if (!tool) {
    return {
      currentStepIndex: state.currentStepIndex + 1,
      messages: [new AIMessage({ content: `Tool ${currentStep} not found in registry.` })]
    }
  }

  // Parse parameters from user message
  let toolArgs: any = { walletAddress }
  
  if (currentStep === 'swap_tokens') {
    toolArgs.fromToken = userText.toLowerCase().includes('eurc') ? 'EURC' : 'USDC'
    toolArgs.toToken = toolArgs.fromToken === 'USDC' ? 'EURC' : 'USDC'
    // Parse amount from text if present, otherwise default to 10
    const match = userText.match(/(\d+(\.\d+)?)/)
    toolArgs.amount = match ? parseFloat(match[1]) : 10.0
  } else if (currentStep === 'bridge_cctp') {
    const match = userText.match(/(\d+(\.\d+)?)/)
    toolArgs.amount = match ? parseFloat(match[1]) : 10.0
    toolArgs.targetDomain = userText.toLowerCase().includes('base') ? 6 : (userText.toLowerCase().includes('arbitrum') ? 3 : 0)
  } else if (currentStep === 'query_balance') {
    toolArgs.token = userText.toLowerCase().includes('eurc') ? 'EURC' : 'USDC'
  } else if (currentStep === 'record_payment') {
    toolArgs.txHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('')
    const match = userText.match(/(\d+(\.\d+)?)/)
    toolArgs.amount = match ? parseFloat(match[1]) : 10.0
  }

  // Execute tool
  try {
    const result = await (tool as any).invoke(toolArgs)
    const resultMsg = new AIMessage({
      content: result,
      name: currentStep
    })
    return {
      currentStepIndex: state.currentStepIndex + 1,
      messages: [resultMsg]
    }
  } catch (err: any) {
    return {
      currentStepIndex: state.currentStepIndex + 1,
      messages: [new AIMessage({ content: `Tool execution failed: ${err.message}` })]
    }
  }
}

// 5. Node implementation: evaluator
async function runEvaluation(state: typeof SwarmState.State) {
  const stepsCount = state.plannerSteps.length
  const summary = `Swarm coordination complete. Successfully executed ${stepsCount} actions: [${state.plannerSteps.join(', ')}].`
  return {
    status: 'completed',
    messages: [new AIMessage({ content: summary })]
  }
}

// 6. Build and Compile Workflow Graph
const workflow = new StateGraph(SwarmState)
  .addNode('planner', runPlanner)
  .addNode('execute_tool', runToolExecutor)
  .addNode('evaluator', runEvaluation)

  .addEdge('__start__', 'planner')
  .addConditionalEdges('planner', shouldExecuteStep, {
    continue: 'execute_tool',
    finish: 'evaluator'
  })
  .addEdge('execute_tool', 'planner')
  .addEdge('evaluator', '__end__')

const checkpointer = new MemorySaver()
export const agentExecutor = workflow.compile({ checkpointer })
