'use client'

import React, { useState } from 'react'
import { Droplet, RefreshCw } from 'lucide-react'

interface FaucetModalProps {
  isOpen: boolean
  onClose: () => void
  address: string | null
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function FaucetModal({ isOpen, onClose, address, addActivity }: FaucetModalProps) {
  const [copied, setCopied] = useState<boolean>(false)

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <Droplet size={18} style={{ stroke: 'var(--accent-coral)' }} />
            <span>Get Free Test Funds</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <RefreshCw size={16} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Your account is connected to the live test network. To add real test funds that persist even after you refresh the page, you’ll need to request them from Circle’s official faucet. It takes about 30 seconds.
          </p>

          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span className="brutalist-label" style={{ marginBottom: 0 }}>Your Account Address</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <code style={{
                flex: 1,
                fontSize: '12px',
                fontFamily: 'monospace',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                wordBreak: 'break-all',
                color: 'var(--text-main)'
              }}>
                {address}
              </code>
              <button 
                className="btn-brutalist btn-brutalist-cyan"
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address)
                    setCopied(true)
                    addActivity('Address copied', 'Your account address is ready to paste into the faucet page.', '📋', 'info')
                    setTimeout(() => setCopied(false), 2000)
                  }
                }}
                style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>1.</span>
              <span>Click <strong>Copy</strong> above to save your address.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>2.</span>
              <span>Click <strong>Go to Faucet</strong> below — it will open in a new tab.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>3.</span>
              <span>On the faucet page, choose <strong>Arc Testnet</strong>, paste your address, and hit send.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>4.</span>
              <span>Come back here — your balance will update automatically within a few seconds!</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <div className="bracket-button-wrap" style={{ flex: 1 }}>
              <a 
                href="https://faucet.circle.com/" 
                target="_blank" 
                rel="noreferrer"
                className="btn-brutalist btn-brutalist-pink"
                style={{ display: 'flex', width: '100%', textDecoration: 'none', justifyContent: 'center', alignItems: 'center' }}
              >
                <span>Go to Faucet ↗</span>
              </a>
            </div>
            <button 
              className="btn-brutalist btn-brutalist-muted" 
              onClick={onClose}
              style={{ flex: 0.5 }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default FaucetModal
