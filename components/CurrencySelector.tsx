import React from 'react'

interface CurrencySelectorProps {
  selected: 'USDC' | 'EURC'
  onChange: (currency: 'USDC' | 'EURC') => void
  disabled?: boolean
  label?: string
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selected,
  onChange,
  disabled = false,
  label = 'Select Currency',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label className="brutalist-label">
          {label}
        </label>
      )}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--bg-inner)',
        padding: '4px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        maxWidth: '240px'
      }}>
        <button
          type="button"
          onClick={() => !disabled && onChange('USDC')}
          disabled={disabled}
          className={`btn-brutalist ${selected === 'USDC' ? 'btn-brutalist-pink' : 'btn-brutalist-muted'}`}
          style={{
            flex: 1,
            padding: '6px 12px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-sm)',
            border: selected === 'USDC' ? undefined : '1px solid transparent'
          }}
        >
          <span>🇺🇸</span>
          <span>USDC</span>
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange('EURC')}
          disabled={disabled}
          className={`btn-brutalist ${selected === 'EURC' ? 'btn-brutalist-pink' : 'btn-brutalist-muted'}`}
          style={{
            flex: 1,
            padding: '6px 12px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-sm)',
            border: selected === 'EURC' ? undefined : '1px solid transparent'
          }}
        >
          <span>🇪🇺</span>
          <span>EURC</span>
        </button>
      </div>
    </div>
  )
}
