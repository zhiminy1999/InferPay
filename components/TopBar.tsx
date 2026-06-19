import React, { useState, useEffect } from 'react'
import { Cpu, RefreshCw, Droplet, Key, Fingerprint, ArrowLeftRight, Menu, HelpCircle, User } from 'lucide-react'
import Link from 'next/link'
import { StableFXClient } from '@/lib/stablefx'
import { ArcIcon } from './Icons'

interface TopBarProps {
  isConnected: boolean
  address: string | null
  usdcBalance: string
  eurcBalance: string
  isFaucetLoading: boolean
  handleFaucet: () => void
  walletType: 'metamask' | 'passkey' | null
  onOpenAuthModal: () => void
  onOpenBridge: () => void
  disconnect: () => void
  onOpenProfileModal: () => void
  onToggleSidebar?: () => void
  onOpenHelpGuide?: () => void
}

export function TopBar({
  isConnected,
  address,
  isFaucetLoading,
  handleFaucet,
  walletType,
  onOpenAuthModal,
  onOpenBridge,
  onOpenProfileModal,
  onToggleSidebar,
  onOpenHelpGuide
}: TopBarProps) {
  return (
    <header className="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="mobile-menu-toggle btn-brutalist btn-brutalist-muted"
            style={{
              padding: '6px',
              display: 'none', // Controlled by CSS media queries
              alignItems: 'center',
              justifyContent: 'center',
              height: '32px',
              width: '32px'
            }}
          >
            <Menu size={16} />
          </button>
        )}
        <Link href="/" className="topbar-logo" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <Cpu size={22} style={{ strokeWidth: 2 }} />
          <span>Infer<i>Pay</i></span>
        </Link>
        <div className="network-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArcIcon size={14} />
          <span>Live on Arc Network (Test Mode)</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isConnected && (
          <button 
            className="btn-brutalist btn-brutalist-pink" 
            onClick={onOpenBridge}
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <ArrowLeftRight size={11} />
            <span className="hide-mobile">Bridge USDC via CCTP</span>
          </button>
        )}

        {onOpenHelpGuide && (
          <button 
            className="btn-brutalist btn-brutalist-muted" 
            onClick={onOpenHelpGuide} 
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <HelpCircle size={11} />
            <span className="hide-mobile">Interactive Guide</span>
          </button>
        )}

        {/* Feature A: Faucet for judges */}
        <button 
          className="btn-brutalist btn-brutalist-green" 
          onClick={handleFaucet} 
          disabled={isFaucetLoading}
          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          {isFaucetLoading ? <RefreshCw size={11} className="spin" /> : <Droplet size={11} />}
          <span className="hide-mobile">Get Free Test Funds</span>
        </button>

        {isConnected ? (
          <button 
            className="btn-brutalist btn-brutalist-muted" 
            onClick={onOpenProfileModal}
            style={{ 
              padding: '6px 12px', 
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-coral) 0%, var(--accent-pink) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {walletType === 'passkey' ? (
                <Fingerprint size={10} style={{ color: 'white' }} />
              ) : (
                <User size={10} style={{ color: 'white' }} />
              )}
            </div>
            <span style={{ fontWeight: 700 }}>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </button>
        ) : (
          <div className="bracket-button-wrap">
            <button className="btn-brutalist btn-brutalist-pink" onClick={onOpenAuthModal} style={{ padding: '6px 14px' }}>
              <Key size={14} style={{ strokeWidth: 2.5 }} />
              <span>Sign In <span className="hide-mobile">with Wallet</span></span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
export default TopBar
