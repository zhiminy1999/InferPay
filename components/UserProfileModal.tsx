'use client'

import React, { useState, useEffect } from 'react'
import { X, Copy, Check, ExternalLink, Shield, Fingerprint, User, Settings, LogOut, Info } from 'lucide-react'
import { USDCIcon, EURCIcon } from './Icons'
import { StableFXClient } from '@/lib/stablefx'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  address: string | null
  usdcBalance: string
  eurcBalance: string
  walletType: 'metamask' | 'passkey' | null
  disconnect: () => void
  rate?: number
}

export function UserProfileModal({
  isOpen,
  onClose,
  address,
  usdcBalance,
  eurcBalance,
  walletType,
  disconnect,
  rate = 1.08
}: UserProfileModalProps) {
  const [copied, setCopied] = useState<boolean>(false)
  const [autoApprove, setAutoApprove] = useState<boolean>(true)
  const [emailLogs, setEmailLogs] = useState<boolean>(false)
  const [gasSponsor, setGasSponsor] = useState<boolean>(true)
  const [exchangeRate, setExchangeRate] = useState<number>(rate)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    const fetchRate = async () => {
      try {
        const val = await StableFXClient.fetchExchangeRate('EURC', 'USDC')
        if (active) {
          setExchangeRate(val)
        }
      } catch (err) {
        console.error('Failed to fetch EURC/USDC rate in profile modal:', err)
      }
    }
    fetchRate()
    const interval = setInterval(fetchRate, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen || !address) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const combinedValuation = (parseFloat(usdcBalance || '0') + parseFloat(eurcBalance || '0') * exchangeRate).toFixed(2)

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div 
        className="modal-container animate-slideDown" 
        style={{ 
          maxWidth: '520px', 
          width: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--accent-coral)' }} />
            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operator Profile</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close Profile">
            <X size={18} />
          </button>
        </div>

        {/* Profile Info Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          
          {/* Avatar & User Details */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px',
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)'
          }}>
            {/* Elegant Procedural Gradient Avatar */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-coral) 0%, var(--accent-pink) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--text-main)',
              boxShadow: '3px 3px 0px rgba(0,0,0,0.15)',
              flexShrink: 0
            }}>
              {walletType === 'passkey' ? (
                <Fingerprint size={28} style={{ color: 'white' }} />
              ) : (
                <User size={28} style={{ color: 'white' }} />
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>InferPay Operator</span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  padding: '2px 6px',
                  backgroundColor: walletType === 'passkey' ? 'var(--accent-green)' : 'var(--accent-peach)',
                  color: 'var(--text-main)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  {walletType === 'passkey' ? 'Passkey' : 'MetaMask'}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                operator@inferpay.io
              </div>
            </div>
          </div>

          {/* Wallet Address Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em' }}>
              Associated Wallet Address
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <code style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-inner)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                color: 'var(--text-main)'
              }}>
                {address}
              </code>
              <button 
                onClick={handleCopy}
                className="btn-brutalist btn-brutalist-cyan"
                style={{ padding: '0 12px', height: '38px', flexShrink: 0 }}
                title="Copy Address"
              >
                {copied ? <Check size={16} style={{ color: 'var(--accent-green)' }} /> : <Copy size={16} />}
              </button>
              <a 
                href={`https://explorer.testnet.arc.network/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brutalist btn-brutalist-muted"
                style={{ padding: '0 12px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                title="View on Block Explorer"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Stablecoin Asset Balances */}
          <div style={{ 
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
          }}>
            {/* Header / Combined valuation */}
            <div style={{ 
              padding: '16px', 
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-inner)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)' }}>Combined Treasury Value</span>
                <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-main)', marginTop: '2px' }}>
                  ${combinedValuation} <span style={{ fontSize: '14px', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-light)' }}>USD</span>
                </div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span>Rate Sponsored by Oracle</span>
                <strong>1 EURC = {rate.toFixed(3)} USDC</strong>
              </div>
            </div>

            {/* Token List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {/* USDC */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <USDCIcon size={28} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--text-main)' }}>USD Coin (USDC)</strong>
                    <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700 }}>Native Gas Asset</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>
                    {parseFloat(usdcBalance).toFixed(2)}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                    ${parseFloat(usdcBalance).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* EURC */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '14px 16px',
                backgroundColor: 'var(--bg-card)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <EURCIcon size={28} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--text-main)' }}>Euro Coin (EURC)</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>ERC-20 Stablecoin</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>
                    {parseFloat(eurcBalance).toFixed(2)}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                    ${(parseFloat(eurcBalance) * rate).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription / Plan Info */}
          <div style={{ 
            padding: '14px 16px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            color: '#78350f',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
            <div style={{ fontSize: '12.5px', lineHeight: '1.4' }}>
              <strong style={{ display: 'block', marginBottom: '2px' }}>Developer Sandbox Plan</strong>
              Your account is active on the <strong>Arc Devnet / Testnet</strong>. Smart transactions are gas-sponsored and secure keys are kept local.
            </div>
          </div>

          {/* Settings Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
              <Settings size={14} style={{ color: 'var(--text-light)' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em' }}>
                Account & Agent Settings
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Setting 1: Auto-approve nanopayments */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Auto-approve Nanopayments (&lt; $1.00)</span>
                <input 
                  type="checkbox" 
                  checked={autoApprove} 
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  style={{
                    accentColor: 'var(--accent-coral)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
              </label>

              {/* Setting 2: Email Logs */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Email Weekly Treasury Audit Reports</span>
                <input 
                  type="checkbox" 
                  checked={emailLogs} 
                  onChange={(e) => setEmailLogs(e.target.checked)}
                  style={{
                    accentColor: 'var(--accent-coral)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
              </label>

              {/* Setting 3: Gas Sponsor Override */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>Enable Circle CCTP Gas Sponsorship</span>
                <input 
                  type="checkbox" 
                  checked={gasSponsor} 
                  onChange={(e) => setGasSponsor(e.target.checked)}
                  style={{
                    accentColor: 'var(--accent-coral)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            marginTop: '8px'
          }}>
            <button 
              className="btn-brutalist btn-brutalist-muted"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '12px' }}
            >
              Keep Profile Open
            </button>
            <button 
              className="btn-brutalist btn-brutalist-pink"
              onClick={() => {
                disconnect()
                onClose()
              }}
              style={{ 
                padding: '8px 16px', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} />
              <span>Disconnect Wallet</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
export default UserProfileModal
