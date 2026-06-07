import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet_address')

    const tables = ['sessions', 'proposals', 'jobs', 'payments', 'swaps', 'bridges']
    let allTx: any[] = []

    for (const table of tables) {
      try {
        let rows: any[] = []
        if (walletAddress) {
          rows = db.prepare(`SELECT * FROM ${table} WHERE wallet_address = ?`).all(walletAddress)
        } else {
          rows = db.prepare(`SELECT * FROM ${table}`).all()
        }

        const mapped = rows.map(r => ({
          id: r.id,
          tx_hash: r.tx_hash,
          block_number: r.block_number,
          timestamp: r.timestamp,
          wallet_address: r.wallet_address,
          amount: r.amount,
          status: r.status,
          type: table.slice(0, -1),
          metadata: r.metadata ? r.metadata.replace(/"/g, '""') : '{}'
        }))

        allTx = allTx.concat(mapped)
      } catch (err) {
        console.warn(`Could not read transactions from table ${table} for CSV export:`, err)
      }
    }

    // Sort by timestamp DESC
    allTx.sort((a, b) => b.timestamp - a.timestamp)

    // Build CSV Content
    let csvContent = 'ID,Type,Tx Hash,Block Number,Date,Wallet Address,Amount,Status,Metadata\n'
    
    for (const tx of allTx) {
      const dateString = new Date(tx.timestamp * 1000).toISOString()
      const row = [
        `"${tx.id}"`,
        `"${tx.type}"`,
        `"${tx.tx_hash}"`,
        `"${tx.block_number}"`,
        `"${dateString}"`,
        `"${tx.wallet_address}"`,
        `"${tx.amount}"`,
        `"${tx.status}"`,
        `"${tx.metadata}"`
      ].join(',')
      csvContent += row + '\n'
    }

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="inferpay_transactions.csv"'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
