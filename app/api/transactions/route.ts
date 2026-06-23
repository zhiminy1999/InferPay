import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { indexOnChainEvents } from '@/lib/event-indexer'

export async function GET(request: Request) {
  try {
    // Dynamically poll contract events asynchronously to index latest block actions
    try {
      await indexOnChainEvents()
    } catch (e) {
      console.warn('Background event indexing encountered an error:', e)
    }

    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet_address')
    const type = searchParams.get('type') // e.g. session, proposal, job, payment, swap, bridge
    const status = searchParams.get('status') // e.g. SUCCESS, PENDING, FAILED
    const minAmount = searchParams.get('min_amount') ? parseFloat(searchParams.get('min_amount')!) : null
    const maxAmount = searchParams.get('max_amount') ? parseFloat(searchParams.get('max_amount')!) : null
    const startDate = searchParams.get('start_date') ? parseInt(searchParams.get('start_date')!) : null
    const endDate = searchParams.get('end_date') ? parseInt(searchParams.get('end_date')!) : null
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const tables = ['sessions', 'proposals', 'jobs', 'payments', 'swaps', 'bridges']
    let allTx: any[] = []

    // Fetch and combine rows
    for (const table of tables) {
      // If a specific type is requested, skip other tables
      if (type && type !== table.slice(0, -1) && type !== table) {
        continue
      }

      try {
        let rows: any[] = []
        if (walletAddress) {
          const realRows = db.prepare(`SELECT * FROM ${table} WHERE wallet_address = ?`).all(walletAddress)
          const sampleWallet = '0x7a304A671e21b79528659dC0D775e53FE233b2B0'
          
          if (walletAddress.toLowerCase() === sampleWallet.toLowerCase()) {
            rows = realRows
          } else {
            const sampleRows = db.prepare(`SELECT * FROM ${table} WHERE wallet_address = ?`).all(sampleWallet)
            
            const mappedReal = realRows.map((r: any) => ({
              id: r.id,
              tx_hash: r.tx_hash,
              block_number: r.block_number,
              timestamp: r.timestamp,
              wallet_address: r.wallet_address,
              amount: r.amount,
              status: r.status,
              type: table.slice(0, -1),
              metadata: r.metadata ? JSON.parse(r.metadata) : {}
            }))
            
            const mappedSample = sampleRows.map((r: any) => {
              const meta = r.metadata ? JSON.parse(r.metadata) : {}
              meta.isSample = true
              return {
                id: r.id,
                tx_hash: r.tx_hash,
                block_number: r.block_number,
                timestamp: r.timestamp,
                wallet_address: walletAddress,
                amount: r.amount,
                status: r.status,
                type: table.slice(0, -1),
                metadata: meta
              }
            })

            const targetCount = 10
            const sampleSlice = mappedSample.slice(0, Math.max(0, targetCount - mappedReal.length))
            allTx = allTx.concat(mappedReal).concat(sampleSlice)
            continue
          }
        } else {
          rows = db.prepare(`SELECT * FROM ${table}`).all()
        }

        const mapped = rows.map((r: any) => {
          const meta = r.metadata ? JSON.parse(r.metadata) : {}
          if (r.wallet_address?.toLowerCase() === '0x7a304a671e21b79528659dc0d775e53fe233b2b0') {
            meta.isSample = true
          }
          return {
            id: r.id,
            tx_hash: r.tx_hash,
            block_number: r.block_number,
            timestamp: r.timestamp,
            wallet_address: r.wallet_address,
            amount: r.amount,
            status: r.status,
            type: table.slice(0, -1), // singular
            metadata: meta
          }
        })

        allTx = allTx.concat(mapped)
      } catch (err) {
        console.warn(`Could not read transactions from table ${table}:`, err)
      }
    }

    // Apply filters in memory
    let filtered = allTx

    if (status) {
      filtered = filtered.filter(tx => tx.status.toUpperCase() === status.toUpperCase())
    }
    if (minAmount !== null) {
      filtered = filtered.filter(tx => tx.amount >= minAmount)
    }
    if (maxAmount !== null) {
      filtered = filtered.filter(tx => tx.amount <= maxAmount)
    }
    if (startDate !== null) {
      filtered = filtered.filter(tx => tx.timestamp >= startDate)
    }
    if (endDate !== null) {
      filtered = filtered.filter(tx => tx.timestamp <= endDate)
    }

    // Sort by timestamp DESC
    filtered.sort((a, b) => b.timestamp - a.timestamp)

    const total = filtered.length
    const paginated = filtered.slice(offset, offset + limit)

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
