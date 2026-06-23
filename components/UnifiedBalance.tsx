import React from 'react'
import { useBridge } from '../hooks/useBridge'
import { Layers, Info } from 'lucide-react'
import { EthereumIcon, BaseIcon, ArcIcon, USDCIcon } from './Icons'
import { BrandIcon } from './BrandIcon'

export const UnifiedBalance: React.FC = () => {
  const { balances } = useBridge()
  const [showTooltip, setShowTooltip] = React.useState(false)
  
  // Compute cumulative Unified USDC balance
  const unifiedTotal = (
    parseFloat(balances.ethereum_sepolia) +
    parseFloat(balances.base_sepolia) +
    parseFloat(balances.arc_testnet)
  ).toFixed(2)

  return (
    <div className="brutalist-card accent-purple" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Layers style={{ color: 'var(--accent-coral)' }} size={18} />
          <span className="brutalist-label" style={{ marginBottom: 0 }}>Your Unified Stablecoin Treasury Balance</span>
          <span className="badge-brutalist" style={{ backgroundColor: 'var(--accent-purple)', color: 'white', border: '1px solid black', padding: '1px 5px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 800, marginLeft: '6px' }}>Unified Balance SDK</span>
        </div>
        <div style={{ position: 'relative' }}>
          <button 
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', color: 'var(--text-light)' }}
          >
            <Info size={14} />
          </button>
          {showTooltip && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '22px',
              backgroundColor: 'var(--bg-inner)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              width: '260px',
              zIndex: 99,
              fontSize: '11px',
              color: 'var(--text-main)',
              lineHeight: '1.4',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <BrandIcon name="idea" size={13} variant="yellow" style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }} /> <strong>Unified Reserves:</strong> Cumulative company funds aggregate across Ethereum Sepolia, Base Sepolia, and Arc Testnet. Maintain positive balances to fund multi-agent execution budgets.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <USDCIcon size={18} />
            <span className="brutalist-label" style={{ marginBottom: 0 }}>Total Cumulative USDC Balance</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent-coral)', letterSpacing: '-0.02em' }}>
            ${unifiedTotal} <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>USDC</span>
          </div>
        </div>

        {/* Breakdown details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {/* Ethereum Sepolia Balance card */}
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
            minWidth: '130px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <EthereumIcon size={16} />
              <span className="brutalist-label" style={{ marginBottom: 0 }}>Ethereum Sepolia</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>${parseFloat(balances.ethereum_sepolia).toFixed(2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>Domain ID: 0</div>
          </div>

          {/* Base Sepolia Balance card */}
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
            minWidth: '130px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <BaseIcon size={16} />
              <span className="brutalist-label" style={{ marginBottom: 0 }}>Base Sepolia</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>${parseFloat(balances.base_sepolia).toFixed(2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>Domain ID: 6</div>
          </div>

          {/* Arc Testnet Balance card */}
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent-green)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
            minWidth: '130px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ArcIcon size={16} />
              <span className="brutalist-label" style={{ marginBottom: 0, color: 'var(--accent-green)' }}>Arc Testnet</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>${parseFloat(balances.arc_testnet).toFixed(2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>Domain ID: 26</div>
          </div>
        </div>
      </div>
    </div>
  )
}
