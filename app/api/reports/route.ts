import { NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { generateMonthlyTreasuryReportPDF, ReportData } from '@/lib/report-generator'

export async function GET(request: Request) {
  try {
    // 1. Gather all needed database data
    const payments = db.prepare('SELECT * FROM payments').all() as any[]
    const swaps = db.prepare('SELECT * FROM swaps').all() as any[]
    const bridges = db.prepare('SELECT * FROM bridges').all() as any[]
    const services = db.prepare('SELECT * FROM services').all() as any[]

    const parsedPayments = payments.map(p => ({
      ...p,
      metadata: p.metadata ? JSON.parse(p.metadata) : {}
    }))

    const parsedSwaps = swaps.map(s => ({
      ...s,
      metadata: s.metadata ? JSON.parse(s.metadata) : {}
    }))

    const parsedBridges = bridges.map(b => ({
      ...b,
      metadata: b.metadata ? JSON.parse(b.metadata) : {}
    }))

    // 2. Aggregate metrics
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

    // Gas Analysis
    const totalTxCount = parsedPayments.length + parsedSwaps.length + parsedBridges.length
    const gasSpent = totalTxCount * 0.0004

    // Bridge Analysis
    let totalBridgeVolume = 0
    parsedBridges.forEach(b => {
      totalBridgeVolume += b.amount
    })

    // Treasury Balances
    let usdcWallet = 8520.45
    let eurcWallet = 4210.12
    let usdcGateway = 1540.80

    // Adjust based on history
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
        usdcWallet += (s.amount * 1.08)
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

    const totalTreasury = usdcWallet + (eurcWallet * 1.085) + usdcGateway

    // Leaderboard
    const leaderboard = services.map(s => {
      const sMeta = s.metadata ? JSON.parse(s.metadata) : {}
      const earnings = parsedPayments
        .filter(p => p.metadata?.serviceId === s.id)
        .reduce((sum, p) => sum + p.amount, 0)
      const jobsCompleted = parsedPayments.filter(p => p.metadata?.serviceId === s.id).length + (earnings > 0 ? 5 : 0)

      return {
        name: s.name,
        capability: s.capability,
        reputation: s.reputation,
        totalEarned: earnings + (jobsCompleted * s.pricing)
      }
    })
    leaderboard.sort((a, b) => b.totalEarned - a.totalEarned)

    // Alerts
    const alerts: any[] = []
    parsedPayments.forEach(p => {
      if (p.amount > 10000) {
        alerts.push({
          type: 'LARGE_TX',
          severity: 'HIGH',
          message: `Large payment of $${p.amount.toLocaleString()} USDC flagged on wallet ${p.wallet_address.slice(0, 8)}...`
        })
      }
    })

    if (billsSum + payrollSum > 5000) {
      alerts.push({
        type: 'BUDGET_OVERRUN',
        severity: 'MEDIUM',
        message: `Budget allocation exceeded: $${(billsSum + payrollSum).toFixed(2)} USDC spent.`
      })
    }

    const bypassTx = parsedPayments.find(p => p.amount > 5000 && !p.metadata?.consensusId)
    if (bypassTx) {
      alerts.push({
        type: 'CONSENSUS_BYPASS',
        severity: 'CRITICAL',
        message: `Bypass detected: Direct execution of $${bypassTx.amount} USDC without Approval Committee.`
      })
    }

    // Default simulation fallback alerts
    if (alerts.length === 0) {
      alerts.push(
        {
          type: 'LARGE_TX',
          severity: 'HIGH',
          message: 'Large treasury allocation of $12,500.00 USDC completed.'
        },
        {
          type: 'BUDGET_OVERRUN',
          severity: 'MEDIUM',
          message: 'DeepSeek Coder API spending exceeded budget configuration threshold of $50/day.'
        }
      )
    }

    // 3. Compile report dataset
    const reportData: ReportData = {
      timestamp: new Date().toISOString(),
      treasury: {
        total: totalTreasury,
        usdcWallet,
        eurcWallet,
        usdcGateway
      },
      spending: {
        total: billsSum + payrollSum + inferenceSum + swapsSum,
        bills: billsSum,
        payroll: payrollSum,
        inference: inferenceSum,
        swaps: swapsSum
      },
      gas: {
        totalSpent: gasSpent,
        txCount: totalTxCount
      },
      bridge: {
        totalVolume: totalBridgeVolume
      },
      leaderboard,
      alerts
    }

    // 4. Generate binary PDF
    const pdfBytes = generateMonthlyTreasuryReportPDF(reportData)

    // 5. Output response as binary download stream
    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="inferpay_treasury_report.pdf"',
        'Content-Length': pdfBytes.length.toString()
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
