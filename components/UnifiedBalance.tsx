import React from 'react'
import { useBridge } from '../hooks/useBridge'
import { Coins, Layers, ArrowRight } from 'lucide-react'

export const UnifiedBalance: React.FC = () => {
  const { balances } = useBridge()
  
  // Compute cumulative Unified USDC balance
  const unifiedTotal = (
    parseFloat(balances.ethereum_sepolia) +
    parseFloat(balances.base_sepolia) +
    parseFloat(balances.arc_testnet)
  ).toFixed(2)

  return (
    <div className="brutalist-card accent-purple">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <Layers style={{ color: 'var(--accent-coral)' }} size={18} />
        <span className="brutalist-label" style={{ marginBottom: 0 }}>Your Unified Stablecoin Treasury Balance</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-6)' }}>
        <div>
          <div className="brutalist-label" style={{ marginBottom: '4px' }}>Total Cumulative USDC Balance</div>
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
            minWidth: '120px'
          }}>
            <div className="brutalist-label" style={{ marginBottom: '2px' }}>Ethereum Sepolia</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>${parseFloat(balances.ethereum_sepolia).toFixed(2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>Domain ID: 0</div>
          </div>

          {/* Base Sepolia Balance card */}
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
            minWidth: '120px'
          }}>
            <div className="brutalist-label" style={{ marginBottom: '2px' }}>Base Sepolia</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>${parseFloat(balances.base_sepolia).toFixed(2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>Domain ID: 6</div>
          </div>

          {/* Arc Testnet Balance card */}
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent-green)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
            minWidth: '120px'
          }}>
            <div className="brutalist-label" style={{ marginBottom: '2px', color: 'var(--accent-green)' }}>Arc Testnet</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>${parseFloat(balances.arc_testnet).toFixed(2)}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>Domain ID: 26</div>
          </div>
        </div>
      </div>
    </div>
  )
}
