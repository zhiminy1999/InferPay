'use client'

import React, { useState } from 'react'
import { Droplet, RefreshCw } from 'lucide-react'

interface FaucetModalProps {
  isOpen: boolean
  onClose: () => void
  address: string | null
  onOpenBridge: () => void
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function FaucetModal({ isOpen, onClose, address, onOpenBridge, addActivity }: FaucetModalProps) {
  const [copied, setCopied] = useState<boolean>(false)

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Droplet size={18} style={{ stroke: 'var(--accent-coral)' }} />
            <span>Treasury Funding Options</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <RefreshCw size={16} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            To perform on-chain AI activities, your wallet needs USDC on Arc Testnet. Choose an option to fund your account:
          </p>

          {/* Option 1: Bridge */}
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span className="badge-brutalist pink" style={{ alignSelf: 'flex-start' }}>Option A: Native Bridge</span>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', margin: '4px 0 2px 0' }}>Bridge USDC via Circle CCTP</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Transfer USDC instantly from Ethereum Sepolia or Base Sepolia with zero slippage.
            </p>
            <button 
              className="btn-brutalist btn-brutalist-pink"
              onClick={() => {
                onClose()
                onOpenBridge()
              }}
              style={{ padding: '8px 14px', fontSize: '12px', marginTop: '6px' }}
            >
              🌉 Open Cross-Chain Bridge
            </button>
          </div>

          {/* Option 2: Faucet */}
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span className="badge-brutalist green" style={{ alignSelf: 'flex-start' }}>Option B: Testnet Faucet</span>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', margin: '4px 0 2px 0' }}>Circle Official Faucet</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Request free testnet tokens directly to your connected address.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
              <code style={{
                flex: 1,
                fontSize: '11px',
                fontFamily: 'monospace',
                padding: '6px 10px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                wordBreak: 'break-all',
                color: 'var(--text-main)'
              }}>
                {address?.slice(0, 18)}...{address?.slice(-12)}
              </code>
              <button 
                className="btn-brutalist btn-brutalist-cyan"
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address)
                    setCopied(true)
                    addActivity('Address copied', 'Your address is ready to paste into the faucet page.', '📋', 'info')
                    setTimeout(() => setCopied(false), 2000)
                  }
                }}
                style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
              >
                {copied ? 'Copied! ✓' : 'Copy Address'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <a 
                href="https://faucet.circle.com/" 
                target="_blank" 
                rel="noreferrer"
                className="btn-brutalist btn-brutalist-green"
                style={{ flex: 1, display: 'flex', textDecoration: 'none', justifyContent: 'center', alignItems: 'center', fontSize: '12px', padding: '8px' }}
              >
                <span>Go to Faucet ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default FaucetModal
