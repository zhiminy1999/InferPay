import { NextRequest, NextResponse } from 'next/server'
import { agentExecutor } from '../../../src/workflows/swarm-graph'
import { HumanMessage } from '@langchain/core/messages'
import { db } from '../../../lib/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { task, capability, userAddress } = body

    if (!task && !capability) {
      return NextResponse.json({ error: 'Missing task or capability parameters' }, { status: 400 })
    }

    const targetTask = task || `Gather and verify research reports matching capability: ${capability || 'coding'}`
    const walletAddress = userAddress || '0x7a304A671e21b79528659dC0D775e53FE233b2B0'

    console.log(`[LangGraph Swarm Coordinator]: Executing task "${targetTask}" for user ${walletAddress}`)

    const targetThreadId = 'session_' + Date.now()

    // Invoke stateful LangGraph agent
    const result = await agentExecutor.invoke(
      {
        messages: [new HumanMessage(targetTask)],
        walletAddress: walletAddress,
        status: 'pending'
      },
      {
        configurable: {
          thread_id: targetThreadId
        }
      }
    )

    // Save activity logs to database
    try {
      const logId = 'log_' + Date.now()
      db.prepare(`
        INSERT INTO activity_log (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(''),
        0,
        Math.floor(Date.now() / 1000),
        walletAddress,
        0,
        'COMPLETED',
        JSON.stringify({
          task: targetTask,
          threadId: targetThreadId,
          steps: result.plannerSteps
        })
      )
    } catch (dbErr: any) {
      console.warn('[Database Logging Error]:', dbErr.message)
    }

    // Format steps tracing output for the client visualization interface
    const steps = result.plannerSteps.map((stepName: string, index: number) => {
      let agent = 'Tool Execution Agent'
      
      // Find the AIMessage returned by the specific tool node execution
      const toolMsg = result.messages.find((msg: any) => msg.name === stepName)
      let message = toolMsg ? toolMsg.content : `Executed task tool: "${stepName}".`
      
      if (stepName === 'query_balance') {
        agent = 'Balance Inquirer Agent'
      } else if (stepName === 'swap_tokens') {
        agent = 'Trading Swarm Agent'
      } else if (stepName === 'bridge_cctp') {
        agent = 'Bridge Operator Agent'
      } else if (stepName === 'record_payment') {
        agent = 'Ledger Auditor Agent'
      }

      return {
        id: `step-${index + 1}`,
        agent,
        status: 'completed',
        message,
        timestamp: new Date().toLocaleTimeString()
      }
    })

    // Add Coordinator Agent initial planning step
    steps.unshift({
      id: 'step-0',
      agent: 'Coordinator Agent v2',
      status: 'completed',
      message: `Analyzing task "${targetTask}" with stateful LangGraph. Generated execution graph: [${result.plannerSteps.join(' -> ')}].`,
      timestamp: new Date().toLocaleTimeString()
    })

    let query = 'USDC'
    if (targetTask.toLowerCase().includes('eurc') || targetTask.toLowerCase().includes('euro')) {
      query = 'EURC'
    } else if (targetTask.toLowerCase().includes('cctp') || targetTask.toLowerCase().includes('bridge')) {
      query = 'CCTP'
    } else if (targetTask.toLowerCase().includes('permit2') || targetTask.toLowerCase().includes('signature')) {
      query = 'Permit2'
    } else if (targetTask.toLowerCase().includes('agent')) {
      query = 'Agent'
    }

    return NextResponse.json({
      success: true,
      query,
      steps,
      royaltyReceiver: '0x7a304A671e21b79528659dC0D775e53FE233b2B0',
      royaltyAmount: '0.0004 USDC (20% of 0.002 USDC)'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
