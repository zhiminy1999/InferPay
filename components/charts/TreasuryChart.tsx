import React from 'react'

interface TreasuryChartProps {
  history: Array<{ date: string; value: number }>
}

export const TreasuryChart: React.FC<TreasuryChartProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: 'var(--space-4)' }}>No historical records found.</div>
  }

  // Find min and max to scale coordinates
  const values = history.map(h => h.value)
  const maxValue = Math.max(...values) * 1.1 // Add 10% breathing room
  const minValue = Math.min(...values) * 0.9 // Subtract 10% breathing room
  
  const width = 500
  const height = 220
  const padding = 35

  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Generate points
  const points = history.map((item, idx) => {
    const x = padding + (idx / (history.length - 1)) * chartWidth
    // Prevent divide by zero if min === max
    const valueRange = maxValue - minValue || 1
    const y = height - padding - ((item.value - minValue) / valueRange) * chartHeight
    return { x, y, value: item.value, date: item.date }
  })

  // Build SVG path
  const linePath = points.length > 0 
    ? points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''

  // Build area path underneath line
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : ''

  return (
    <div className="brutalist-card" style={{ padding: 'var(--space-4)' }}>
      <div className="brutalist-label" style={{ marginBottom: 'var(--space-3)' }}>Treasury Valuation Over Time (USD Equivalent)</div>
      
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {/* Grids */}
          {Array.from({ length: 4 }).map((_, idx) => {
            const yVal = padding + (idx / 3) * chartHeight
            return (
              <line
                key={idx}
                x1={padding}
                y1={yVal}
                x2={width - padding}
                y2={yVal}
                stroke="#e2dfd9"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            )
          })}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#treasuryGrad)"
              opacity={0.12}
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#ff5d4b"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 12}
              fill="#8c898f"
              fontSize={8.5}
              textAnchor="middle"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            >
              {p.date}
            </text>
          ))}

          {/* Dots on line with tooltips */}
          {points.map((p, idx) => (
            <g key={idx} className="group" style={{ cursor: 'pointer' }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill="#ffffff"
                stroke="#ff5d4b"
                strokeWidth={2}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={8}
                fill="#ff5d4b"
                opacity={0}
              >
                <title>${Math.round(p.value).toLocaleString()}</title>
              </circle>
              {/* Tooltip Label */}
              <text
                x={p.x}
                y={p.y - 12}
                fill="#ff5d4b"
                fontSize={9}
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="'Lora', serif"
              >
                ${Math.round(p.value).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="treasuryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5d4b" />
              <stop offset="100%" stopColor="#fbfaf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
export default TreasuryChart
