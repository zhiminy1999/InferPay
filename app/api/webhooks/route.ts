import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, type, data } = body

    // Store Circle webhook payload into activity_log
    const stmt = db.prepare(`
      INSERT INTO activity_log (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const txHash = data?.txHash || data?.transactionHash || ''
    const walletAddress = data?.walletAddress || data?.address || ''
    const amount = data?.amount ? parseFloat(data.amount) : 0
    const status = data?.status || 'SUCCESS'
    
    const metadataObj = {
      webhookType: type,
      event_id: id,
      payload: data || {}
    }

    stmt.run(
      id || Date.now().toString(),
      txHash,
      0, // block_number
      Math.floor(Date.now() / 1000),
      walletAddress,
      amount,
      status,
      JSON.stringify(metadataObj)
    )

    return NextResponse.json({ success: true, message: 'Circle Webhook logged persistently' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM activity_log ORDER BY timestamp DESC').all()
    const parsed = rows.map((r: any) => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : {}
    }))
    return NextResponse.json({ data: parsed })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
