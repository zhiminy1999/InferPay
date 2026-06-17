import { NextRequest, NextResponse } from 'next/server'
import { getAddress } from 'viem'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { task, capability, userAddress } = body

    if (!task || !userAddress) {
      return NextResponse.json({ error: 'Missing task or userAddress parameters' }, { status: 400 })
    }

    console.log(`[Swarm Coordinator]: Executing task "${task}" for user ${userAddress}`)

    // Formulate search query based on capability
    let query = 'USDC'
    if (task.toLowerCase().includes('eurc') || task.toLowerCase().includes('euro')) {
      query = 'EURC'
    } else if (task.toLowerCase().includes('cctp') || task.toLowerCase().includes('bridge')) {
      query = 'CCTP'
    } else if (task.toLowerCase().includes('permit2') || task.toLowerCase().includes('signature')) {
      query = 'Permit2'
    } else if (task.toLowerCase().includes('agent')) {
      query = 'Agent'
    }

    // Step-by-step trace simulation to return to frontend for live visualization
    const steps = [
      {
        id: 'step-1',
        agent: 'Coordinator Agent',
        status: 'completed',
        message: `Analyzing user task: "${task}". Dispatching sub-task to Research Agent with target keyword: "${query}".`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 'step-2',
        agent: 'Research Agent',
        status: 'completed',
        message: `Hiring Search Service via x402 Protocol. Generating payment request header for "/api/search".`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 'step-3',
        agent: 'Search Service',
        status: 'completed',
        message: `HTTP 402 Challenge resolved. Cryptographic signature verified. Billed 0.002 USDC from Gateway.`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 'step-4',
        agent: 'Translation Agent',
        status: 'completed',
        message: `Translating raw search snippets into clean documentation. Billed 0.001 USDC.`,
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 'step-5',
        agent: 'Verifier Agent',
        status: 'completed',
        message: `Performing ERC-8004 identity matching. Task completed safely under policy guidelines.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]

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
