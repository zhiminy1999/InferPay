import React from 'react'

interface SpendingBreakdownProps {
  bills: number
  payroll: number
  inference: number
  swaps: number
  total: number
}

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  bills,
  payroll,
  inference,
  swaps,
  total
}) => {
  const categories = [
    { name: 'Bills', value: bills, color: '#ff5d4b' },
    { name: 'Payroll', value: payroll, color: '#34d399' },
    { name: 'Inference', value: inference, color: '#a78bfa' },
    { name: 'Swaps', value: swaps, color: '#67e8f9' }
  ]

  // Filter out zero categories and calculate percentages
  const activeCategories = categories.map(c => {
    const pct = total > 0 ? (c.value / total) * 100 : 0
    return { ...c, pct }
  })

  return (
    <div className="brutalist-card" style={{ padding: 'var(--space-4)' }}>
      <div className="brutalist-label" style={{ marginBottom: 'var(--space-3)' }}>Operational Spending Breakdown</div>
      
      {/* Total spend summary */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.1em', fontWeight: 700 }}>Total Consolidated Spend</span>
        <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-main)', marginTop: '4px' }}>${total.toLocaleString()} USDC</div>
      </div>

      {/* Horizontal Stacked Bar */}
      <div style={{
        width: '100%',
        height: '20px',
        backgroundColor: 'var(--bg-inner)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        display: 'flex',
        marginBottom: 'var(--space-4)',
        border: '1px solid var(--border)'
      }}>
        {total === 0 ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-light)' }}>
            No spending recorded in this date range.
          </div>
        ) : (
          activeCategories.map(c => {
            if (c.pct === 0) return null
            return (
              <div
                key={c.name}
                style={{
                  height: '100%',
                  width: `${c.pct}%`,
                  backgroundColor: c.color,
                  transition: 'width 0.5s ease'
                }}
                title={`${c.name}: $${c.value.toFixed(2)} (${c.pct.toFixed(1)}%)`}
              />
            )
          })
        )}
      </div>

      {/* Legend & Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeCategories.map(c => (
          <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: c.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)' }}>{c.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>${c.value.toLocaleString()} USDC</span>
              <span style={{ color: 'var(--text-light)', fontSize: '10px', marginLeft: '6px' }}>({c.pct.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default SpendingBreakdown
