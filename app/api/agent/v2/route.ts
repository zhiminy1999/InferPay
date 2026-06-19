import { NextRequest, NextResponse } from 'next/server'
import { agentExecutor } from '../../../../src/workflows/swarm-graph'
import { HumanMessage } from '@langchain/core/messages'
import { db } from '../../../../lib/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { task, threadId, walletAddress } = body

    if (!task || !walletAddress) {
      return NextResponse.json({ error: 'Missing task or walletAddress parameters' }, { status: 400 })
    }

    const targetThreadId = threadId || 'session_' + Date.now()
    console.log(`[LangGraph Swarm v2]: Initiating execution for thread ${targetThreadId}: "${task}"`)

    // Invoke stateful LangGraph agent
    const result = await agentExecutor.invoke(
      {
        messages: [new HumanMessage(task)],
        walletAddress: walletAddress,
        status: 'pending'
      },
      {
        configurable: {
          thread_id: targetThreadId
        }
      }
    )

    // Save activity logs to local/Supabase database
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
          task,
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
      message: `Analyzing task "${task}" with stateful LangGraph. Generated execution graph: [${result.plannerSteps.join(' -> ')}].`,
      timestamp: new Date().toLocaleTimeString()
    })

    return NextResponse.json({
      success: true,
      threadId: targetThreadId,
      steps,
      plannerSteps: result.plannerSteps,
      status: 'completed'
    })
  } catch (error: any) {
    console.error('[LangGraph Swarm v2 Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
