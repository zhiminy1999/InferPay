import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const rows = db.prepare('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 50').all()
    const parsed = rows.map((r: any) => ({
      time: new Date(r.timestamp * 1000).toLocaleTimeString('en-US', { hour12: false }),
      emoji: r.tx_hash || 'lightning', // Re-use standard schema fields: tx_hash represents emoji
      title: r.status || 'System Log', // status represents title
      desc: r.metadata ? JSON.parse(r.metadata).desc : '', // metadata contains desc
      type: r.metadata ? JSON.parse(r.metadata).type : 'default'
    }))
    return NextResponse.json({ data: parsed })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, desc, emoji, type } = body

    const stmt = db.prepare(`
      INSERT INTO activity_log (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
      emoji || 'lightning',
      0,
      Math.floor(Date.now() / 1000),
      'system',
      0,
      title || 'Log',
      JSON.stringify({ desc, type })
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
