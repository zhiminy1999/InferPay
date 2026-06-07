import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet_address')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let rows: any[] = []
    if (walletAddress) {
      rows = db.prepare('SELECT * FROM proposals WHERE wallet_address = ? ORDER BY timestamp DESC').all(walletAddress)
    } else {
      rows = db.prepare('SELECT * FROM proposals ORDER BY timestamp DESC').all()
    }

    const total = rows.length
    const paginated = rows.slice(offset, offset + limit).map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }))

    return NextResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata } = body

    const stmt = db.prepare(`
      INSERT INTO proposals (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id || Date.now().toString(),
      tx_hash || '',
      block_number || 0,
      timestamp || Math.floor(Date.now() / 1000),
      wallet_address || '',
      amount || 0,
      status || 'PENDING',
      metadata ? JSON.stringify(metadata) : '{}'
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
