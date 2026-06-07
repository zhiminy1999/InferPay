import { NextRequest, NextResponse } from 'next/server'
import { getAddress } from 'viem'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const checkOnly = body?.checkOnly === true

    // Payment configuration
    const price = '0.001' // $0.001 USDC per inference call
    const destination = '0x8e50b1f2bc88bcf040523db42095f9c464e8e81d' // Mock merchant vault receiver

    // 1. If checking support or no payment signature present, negotiate 402 Payment Required
    const signature = req.headers.get('PAYMENT-SIGNATURE')
    const buyerAddress = req.headers.get('PAYMENT-BUYER-ADDRESS')

    if (checkOnly || !signature || !buyerAddress) {
      const response = NextResponse.json(
        { error: 'Payment Required', code: 402 },
        { status: 402 }
      )
      response.headers.set(
        'PAYMENT-REQUIRED',
        JSON.stringify({
          scheme: 'exact',
          price,
          currency: 'USDC',
          destination,
          network: 'arcTestnet',
        })
      )
      return response
    }

    // 2. We have a signature and buyer address, simulate high-performance offchain EIP-3009 verification
    console.log(`Gateway: Verified offchain EIP-3009 signature ${signature.slice(0, 10)}... from ${buyerAddress} for ${price} USDC`)

    // Sample inference answers for different AI models
    const modelAnswers: Record<string, string[]> = {
      llm_llama: [
        "Based on sentiment analysis of USDC flows on Arc, volatility will remain under 1.2% this week.",
        "Consensus threshold of 2/3 agents met. Allocating treasury swap triggers to EURC balances.",
        "Smart contracts audits completed. AgentEscrow is secured and certified for deployment."
      ],
      vision_gpu: [
        "Invoice matching detects 100% item matching. Safe to disburse $250 SaaS payout.",
        "Treasury Optimizer alerts: Yield rates on EURC decreased to 3.8%. Commencing swap back to USDC.",
        "GPU scaling invoice matches active session log. Approving Smart Bill Pay 90% payout."
      ],
      stable_fx: [
        "Circle StableFX quote fetched: 1.0924 EURC per USDC. Executed trade successfully on-chain.",
        "Crosschain balance aggregation finalized: $12,450 cumulative treasury USDC identified.",
        "Treasury reserves rebalanced. Yield optimized and registered."
      ]
    }

    const modelId = body?.modelId || 'llm_llama'
    const answers = modelAnswers[modelId] || modelAnswers.llm_llama
    const resultText = answers[Math.floor(Math.random() * answers.length)]

    // Return resource and PAYMENT-RESPONSE header confirming success
    const response = NextResponse.json({
      success: true,
      modelId,
      result: resultText,
      billed: price,
      timestamp: Date.now(),
      status: 'verified',
    })

    response.headers.set(
      'PAYMENT-RESPONSE',
      JSON.stringify({
        status: 'success',
        amount: price,
        recipient: destination,
        settlement: 'aggregated-batch',
      })
    )

    return response
  } catch (err: any) {
    console.error('Inference API error:', err)
    return NextResponse.json({ error: err.message || 'Error processing inference' }, { status: 500 })
  }
}
