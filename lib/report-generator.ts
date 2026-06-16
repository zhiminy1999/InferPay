/**
 * Pure TypeScript PDF Writer.
 * Generates a valid 1.4 PDF file representing the Monthly Treasury Report
 * without requiring native compiler bindings or heavyweight JS runtimes.
 */

export interface ReportData {
  timestamp: string
  treasury: {
    total: number
    usdcWallet: number
    eurcWallet: number
    usdcGateway: number
  }
  spending: {
    total: number
    bills: number
    payroll: number
    inference: number
    swaps: number
  }
  gas: {
    totalSpent: number
    txCount: number
  }
  bridge: {
    totalVolume: number
  }
  leaderboard: Array<{
    name: string
    capability: string
    reputation: number
    totalEarned: number
  }>
  alerts: Array<{
    type: string
    severity: string
    message: string
  }>
}

export function generateMonthlyTreasuryReportPDF(data: ReportData): Uint8Array {
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // PDF page text lines
  const lines: string[] = [
    'InferPay - Monthly Treasury & Compliance Audit Report',
    `Generated on: ${dateStr}`,
    '==================================================================',
    '',
    '1. TREASURY SUMMARY',
    '--------------------------------------------------',
    `Total Portfolio Value (USD Equivalent):  $${data.treasury.total.toLocaleString()} USD`,
    ` - USDC Wallet Balance:                  $${data.treasury.usdcWallet.toLocaleString()} USDC`,
    ` - EURC Wallet Balance:                  EUR ${data.treasury.eurcWallet.toLocaleString()}`,
    ` - USDC Gateway Micropayments Fuel:       $${data.treasury.usdcGateway.toLocaleString()} USDC`,
    '',
    '2. OPERATIONAL SPENDING BREAKDOWN',
    '--------------------------------------------------',
    `Total Spend (USDC Taker Value):          $${data.spending.total.toLocaleString()} USDC`,
    ` - Direct Smart Bill Payments:           $${data.spending.bills.toLocaleString()} USDC`,
    ` - AI Work Payroll / Escrows:            $${data.spending.payroll.toLocaleString()} USDC`,
    ` - x402 Micropayments / API Inference:   $${data.spending.inference.toLocaleString()} USDC`,
    ` - stableFX Treasury Conversion Swaps:   $${data.spending.swaps.toLocaleString()} USDC`,
    '',
    '3. NETWORK PERFORMANCE METRICS',
    '--------------------------------------------------',
    `Total Indexed Transactions:              ${data.gas.txCount} transactions`,
    `Accumulated Gas Fees (Arc Chain):        $${data.gas.totalSpent.toFixed(4)} USDC`,
    `Total CCTP Bridge Volume:                $${data.bridge.totalVolume.toLocaleString()} USDC`,
    '',
    '4. ACTIVE COMPLIANCE & SECURITY ALERTS',
    '--------------------------------------------------'
  ]

  // Add alerts
  if (data.alerts && data.alerts.length > 0) {
    data.alerts.forEach((alert, i) => {
      lines.push(`[${alert.severity}] ${alert.type}: ${alert.message}`)
    })
  } else {
    lines.push('No compliance flags or bypass warnings triggered in audit interval.')
  }

  lines.push('', '5. AGENT SERVICE LEADERBOARD', '--------------------------------------------------')
  
  if (data.leaderboard && data.leaderboard.length > 0) {
    data.leaderboard.slice(0, 5).forEach((agent, i) => {
      lines.push(`${i + 1}. ${agent.name} (${agent.capability})`)
      lines.push(`   Earned: $${agent.totalEarned.toFixed(2)} USDC | Reputation rating: ${agent.reputation.toFixed(1)}/10.0`)
    })
  } else {
    lines.push('No agent contractor operations recorded.')
  }

  lines.push('', '==================================================', 'End of Report - Audited by InferPay Compliance engine')

  // Build stream content
  let contentStream = 'BT\n/F1 9 Tf\n10 TL\n30 750 Td\n'
  
  lines.forEach(line => {
    // Escape parenthesis in PDF text
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    contentStream += `(${escaped}) Tj T*\n`
  })
  
  contentStream += 'ET\n'

  const contentStreamLen = contentStream.length

  // Construct PDF Objects list
  // Object 1: Catalog
  // Object 2: Pages
  // Object 3: Page definition
  // Object 4: Font
  // Object 5: Content stream

  const bodyParts: string[] = []
  
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>\nendobj\n'
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n'
  const obj5 = `5 0 obj\n<< /Length ${contentStreamLen} >>\nstream\n${contentStream}endstream\nendobj\n`

  const pdfHeader = '%PDF-1.4\n'
  
  bodyParts.push(obj1)
  bodyParts.push(obj2)
  bodyParts.push(obj3)
  bodyParts.push(obj4)
  bodyParts.push(obj5)

  // Calculate byte offsets for xref
  const xrefOffsets: number[] = []
  let currentOffset = pdfHeader.length

  bodyParts.forEach(part => {
    xrefOffsets.push(currentOffset)
    currentOffset += part.length
  })

  // Construct Xref Table
  let xref = 'xref\n0 6\n'
  xref += '0000000000 65535 f \n'
  
  xrefOffsets.forEach(offset => {
    const formatted = ('0000000000' + offset).slice(-10)
    xref += `${formatted} 00000 n \n`
  })

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`

  const fullPdfString = pdfHeader + bodyParts.join('') + xref + trailer
  
  // Convert string to Uint8Array binary
  const binary = new Uint8Array(fullPdfString.length)
  for (let i = 0; i < fullPdfString.length; i++) {
    binary[i] = fullPdfString.charCodeAt(i)
  }

  return binary
}
