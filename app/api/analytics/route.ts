import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = parseInt(searchParams.get('startDate') || '0')
    const endDate = parseInt(searchParams.get('endDate') || Date.now().toString())

    // Fetch all tables
    const payments = db.prepare('SELECT * FROM payments').all() as any[]
    const swaps = db.prepare('SELECT * FROM swaps').all() as any[]
    const bridges = db.prepare('SELECT * FROM bridges').all() as any[]
    const services = db.prepare('SELECT * FROM services').all() as any[]

    // Parse metadata
    const parsedPayments = payments.map(p => ({
      ...p,
      metadata: p.metadata ? JSON.parse(p.metadata) : {}
    })).filter(p => p.timestamp * 1000 >= startDate && p.timestamp * 1000 <= endDate)

    const parsedSwaps = swaps.map(s => ({
      ...s,
      metadata: s.metadata ? JSON.parse(s.metadata) : {}
    })).filter(s => s.timestamp * 1000 >= startDate && s.timestamp * 1000 <= endDate)

    const parsedBridges = bridges.map(b => ({
      ...b,
      metadata: b.metadata ? JSON.parse(b.metadata) : {}
    })).filter(b => b.timestamp * 1000 >= startDate && b.timestamp * 1000 <= endDate)

    // Calculate Category Spending
    let billsSum = 0
    let payrollSum = 0
    let inferenceSum = 0
    let swapsSum = 0

    parsedPayments.forEach(p => {
      const type = p.metadata?.type || 'BILL'
      if (type === 'BILL') {
        billsSum += p.amount
      } else if (type === 'PAYROLL') {
        payrollSum += p.amount
      } else if (type === 'X402' || type === 'NANOPAYMENT') {
        inferenceSum += p.amount
      }
    })

    parsedSwaps.forEach(s => {
      swapsSum += s.amount
    })

    // Gas Analysis (Mock Arc gas fee is 0.0004 USDC per transaction)
    const totalTxCount = parsedPayments.length + parsedSwaps.length + parsedBridges.length
    const gasSpent = totalTxCount * 0.0004
    const avgGasPerTx = totalTxCount > 0 ? 0.0004 : 0

    // Bridge Analysis
    let totalBridgeVolume = 0
    let totalBridgeFees = 0
    parsedBridges.forEach(b => {
      totalBridgeVolume += b.amount
      totalBridgeFees += (b.metadata?.fee || (b.amount * 0.001)) // 0.1% bridge fee mock
    })

    // Treasury Value (Get current wallet balance and gateway balances)
    // Seed standard mock starting balances
    let usdcWallet = 8520.45
    let eurcWallet = 4210.12
    let usdcGateway = 1540.80

    // Adjust based on transaction history
    parsedPayments.forEach(p => {
      if (p.metadata?.currency === 'EURC') {
        eurcWallet -= p.amount
      } else {
        usdcWallet -= p.amount
      }
    })

    parsedSwaps.forEach(s => {
      if (s.metadata?.fromToken === 'EURC') {
        eurcWallet -= s.amount
        usdcWallet += (s.amount * 1.08) // Mock rate
      } else {
        usdcWallet -= s.amount
        eurcWallet += (s.amount / 1.08)
      }
    })

    parsedBridges.forEach(b => {
      if (b.status === 'SUCCESS') {
        usdcWallet += b.amount
      }
    })

    const eurcInUsd = eurcWallet * 1.085 // Current EURC/USDC FX Rate
    const totalTreasury = usdcWallet + eurcInUsd + usdcGateway

    // Treasury Value Over Time (Generate 7 historical data points based on actual transaction deltas)
    const treasuryHistory = Array.from({ length: 7 }, (_, i) => {
      const dayOffset = (6 - i) * 24 * 60 * 60 * 1000
      const date = new Date(Date.now() - dayOffset)
      const dayLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const timestampCutoff = Math.floor(date.getTime() / 1000)

      let delta = 0
      parsedPayments.forEach(p => {
        if (p.timestamp > timestampCutoff) {
          delta -= p.amount
        }
      })
      parsedSwaps.forEach(s => {
        if (s.timestamp > timestampCutoff) {
          if (s.metadata?.fromToken === 'EURC') {
            delta += s.amount * 1.08
            delta -= s.amount * 1.085
          } else {
            delta -= s.amount
            delta += (s.amount / 1.08) * 1.085
          }
        }
      })
      parsedBridges.forEach(b => {
        if (b.timestamp > timestampCutoff && b.status === 'SUCCESS') {
          delta += b.amount
        }
      })

      const historicalValue = totalTreasury - delta
      return {
        date: dayLabel,
        value: parseFloat(Math.max(0, historicalValue).toFixed(2))
      }
    })

    // Agent Leaderboard (Combine registry services and earnings metadata)
    const leaderboard = services.map(s => {
      const sMeta = s.metadata ? JSON.parse(s.metadata) : {}
      // Calculate how much they earned from x402 payments
      const earnings = parsedPayments
        .filter(p => p.metadata?.serviceId === s.id)
        .reduce((sum, p) => sum + p.amount, 0)

      const jobsCompleted = parsedPayments.filter(p => p.metadata?.serviceId === s.id).length

      return {
        id: s.id,
        name: s.name,
        capability: s.capability,
        reputation: s.reputation,
        completionRate: sMeta.completionRate || 0.95,
        totalEarned: earnings,
        jobsCompleted
      }
    })

    // Sort by weighted rank
    leaderboard.sort((a, b) => b.totalEarned - a.totalEarned)

    // Generate Compliance Alerts
    const alerts: any[] = []

    // 1. Large Transactions Alert (>$10,000)
    parsedPayments.forEach(p => {
      if (p.amount > 10000) {
        alerts.push({
          id: 'alert-large-' + p.id,
          type: 'LARGE_TX',
          severity: 'HIGH',
          message: `Large on-chain payment of $${p.amount.toLocaleString()} USDC flagged on wallet ${p.wallet_address.slice(0, 8)}...`,
          timestamp: p.timestamp
        })
      }
    })

    // 2. Budget Overrun Alert (mock rule)
    if (billsSum + payrollSum > 5000) {
      alerts.push({
        id: 'alert-budget-overrun',
        type: 'BUDGET_OVERRUN',
        severity: 'MEDIUM',
        message: `Monthly operational budget allocation exceeded 80% limit. Current spend: $${(billsSum + payrollSum).toFixed(2)} USDC`,
        timestamp: Math.floor(Date.now() / 1000)
      })
    }

    // 3. Consensus Bypass Alert (flag transaction executed without multisig)
    const bypassTx = parsedPayments.find(p => p.metadata?.type === 'BYPASS' || p.amount > 5000 && !p.metadata?.consensusId)
    if (bypassTx) {
      alerts.push({
        id: 'alert-bypass-' + bypassTx.id,
        type: 'CONSENSUS_BYPASS',
        severity: 'CRITICAL',
        message: `Consensus Bypass Event: Direct execution detected for transfer of $${bypassTx.amount} USDC without Approval Committee signature verification.`,
        timestamp: bypassTx.timestamp
      })
    }

    return NextResponse.json({
      treasury: {
        total: parseFloat(totalTreasury.toFixed(2)),
        usdcWallet: parseFloat(usdcWallet.toFixed(2)),
        eurcWallet: parseFloat(eurcWallet.toFixed(2)),
        usdcGateway: parseFloat(usdcGateway.toFixed(2)),
        eurcInUsd: parseFloat(eurcInUsd.toFixed(2)),
        history: treasuryHistory
      },
      spending: {
        bills: parseFloat(billsSum.toFixed(2)),
        payroll: parseFloat(payrollSum.toFixed(2)),
        inference: parseFloat(inferenceSum.toFixed(2)),
        swaps: parseFloat(swapsSum.toFixed(2)),
        total: parseFloat((billsSum + payrollSum + inferenceSum + swapsSum).toFixed(2))
      },
      gas: {
        totalSpent: parseFloat(gasSpent.toFixed(5)),
        averagePerTx: avgGasPerTx,
        txCount: totalTxCount
      },
      bridge: {
        totalVolume: totalBridgeVolume,
        totalFees: totalBridgeFees
      },
      leaderboard,
      alerts
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
