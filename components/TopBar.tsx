'use client'

import React from 'react'
import { Cpu, RefreshCw, Droplet, Key, Fingerprint, ShieldCheck } from 'lucide-react'

interface TopBarProps {
  isConnected: boolean
  address: string | null
  usdcBalance: string
  eurcBalance: string
  isFaucetLoading: boolean
  handleFaucet: () => void
  walletType: 'metamask' | 'passkey' | null
  onOpenAuthModal: () => void
  disconnect: () => void
}

export function TopBar({
  isConnected,
  address,
  usdcBalance,
  eurcBalance,
  isFaucetLoading,
  handleFaucet,
  walletType,
  onOpenAuthModal,
  disconnect
}: TopBarProps) {
  return (
    <header className="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="topbar-logo">
          <Cpu size={22} style={{ strokeWidth: 2 }} />
          <span>Infer<i>Pay</i></span>
        </div>
        <div className="network-badge">
          <div className="network-dot"></div>
          <span>Live on Arc Network (Test Mode)</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Feature A: Faucet for judges */}
        <button 
          className="btn-brutalist btn-brutalist-green" 
          onClick={handleFaucet} 
          disabled={isFaucetLoading}
          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          {isFaucetLoading ? <RefreshCw size={11} className="spin" /> : <Droplet size={11} />}
          <span>💰 Get Free Test Funds</span>
        </button>

        {isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                {walletType === 'passkey' ? (
                  <>
                    <Fingerprint size={12} className="accent-color" />
                    <span>Passkey Smart Account:</span>
                  </>
                ) : (
                  <span>Connected Account:</span>
                )}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                {walletType === 'passkey' && (
                  <ShieldCheck size={14} style={{ color: 'var(--accent-green)' }} />
                )}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-coral)' }}>
                Balance: ${usdcBalance} USD · €{eurcBalance} EUR
              </div>
            </div>
            <button className="btn-brutalist btn-brutalist-muted" onClick={disconnect} style={{ padding: '6px 12px', fontSize: '11px' }}>
              Disconnect
            </button>
          </div>
        ) : (
          <div className="bracket-button-wrap">
            <button className="btn-brutalist btn-brutalist-pink" onClick={onOpenAuthModal} style={{ padding: '6px 14px' }}>
              <Key size={14} style={{ strokeWidth: 2.5 }} />
              <span>Sign In with Wallet</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
export default TopBar
