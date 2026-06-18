'use client'

import React, { useState, useEffect } from 'react'
import { Cpu, RefreshCw, Droplet, Key, Fingerprint, ShieldCheck, ArrowLeftRight, Menu, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { StableFXClient } from '@/lib/stablefx'
import { USDCIcon, EURCIcon, ArcIcon } from './Icons'

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
  onToggleSidebar?: () => void
  onOpenHelpGuide?: () => void
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
  onOpenBridge,
  disconnect,
  onToggleSidebar,
  onOpenHelpGuide
}: TopBarProps) {
  const [rate, setRate] = useState<number>(1.08)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const val = await StableFXClient.fetchExchangeRate('EURC', 'USDC')
        setRate(val)
      } catch (err) {
        console.error('Failed to update TopBar exchange rate:', err)
      }
    }
    fetchRate()
    const interval = setInterval(fetchRate, 15000)
    return () => clearInterval(interval)
  }, [])

  const combinedValuation = (parseFloat(usdcBalance || '0') + parseFloat(eurcBalance || '0') * rate).toFixed(2)

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {isConnected && (
          <button 
            className="btn-brutalist btn-brutalist-pink" 
            onClick={onOpenBridge}
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <ArrowLeftRight size={11} />
            <span>Bridge USDC via CCTP</span>
          </button>
        )}

        {onOpenHelpGuide && (
          <button 
            className="btn-brutalist btn-brutalist-muted" 
            onClick={onOpenHelpGuide} 
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <HelpCircle size={11} />
            <span>Interactive Guide</span>
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
          <span>Get Free Test Funds</span>
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
              <div style={{ fontSize: '12px', fontWeight: 650, color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <span>Balance:</span>
                <USDCIcon size={13} style={{ display: 'inline' }} />
                <span>{usdcBalance} USD</span>
                <span>·</span>
                <EURCIcon size={13} style={{ display: 'inline' }} />
                <span>{eurcBalance} EUR</span>
                <span style={{ color: 'var(--text-light)', fontSize: '10px', fontWeight: 500 }}>(Combined: ${combinedValuation} USD @ 1 EUR = {rate.toFixed(3)} USD)</span>
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
