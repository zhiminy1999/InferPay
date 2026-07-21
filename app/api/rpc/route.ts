import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'
    
    // Sanitize in case of duplicate env naming
    let targetUrl = rpcUrl
    if (targetUrl.startsWith('NEXT_PUBLIC_ARC_RPC_URL=')) {
      targetUrl = targetUrl.replace('NEXT_PUBLIC_ARC_RPC_URL=', '')
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.warn(`[RPC Proxy Remote Error]: ${response.status} - ${errText}`)
      return new NextResponse(errText, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[RPC Proxy Internal Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
