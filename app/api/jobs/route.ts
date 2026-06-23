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
      rows = db.prepare('SELECT * FROM jobs WHERE wallet_address = ? ORDER BY timestamp DESC').all(walletAddress)
    } else {
      rows = db.prepare('SELECT * FROM jobs ORDER BY timestamp DESC').all()
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
      INSERT INTO jobs (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status, amount, metadata } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing job id' }, { status: 400 })
    }

    if (status !== undefined) {
      db.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, id)
    }
    if (amount !== undefined) {
      db.prepare('UPDATE jobs SET amount = ? WHERE id = ?').run(amount, id)
    }
    if (metadata !== undefined) {
      const existing = db.prepare('SELECT metadata FROM jobs WHERE id = ?').get(id) as any
      let merged = metadata
      if (existing && existing.metadata) {
        try {
          const parsedExisting = JSON.parse(existing.metadata)
          const parsedNew = typeof metadata === 'string' ? JSON.parse(metadata) : metadata
          merged = { ...parsedExisting, ...parsedNew }
        } catch (e) {
          // Fallback if parsing fails
        }
      }
      const metaStr = typeof merged === 'string' ? merged : JSON.stringify(merged)
      db.prepare('UPDATE jobs SET metadata = ? WHERE id = ?').run(metaStr, id)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
