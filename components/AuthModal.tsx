'use client'

import React, { useState } from 'react'
import { Key, ShieldAlert, Fingerprint, Chrome, RefreshCw, X } from 'lucide-react'
import { ButtonLoading } from './LoadingSystem'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onConnectMetaMask: () => Promise<void>
  onRegisterPasskey: (username: string) => Promise<boolean>
  onLoginPasskey: (username: string) => Promise<boolean>
  loading: boolean
}

export function AuthModal({
  isOpen,
  onClose,
  onConnectMetaMask,
  onRegisterPasskey,
  onLoginPasskey,
  loading
}: AuthModalProps) {
  const [username, setUsername] = useState<string>('')
  const [authMode, setAuthMode] = useState<'select' | 'passkey_reg' | 'passkey_login'>('select')

  if (!isOpen) return null

  const handleMetaMaskConnect = async () => {
    await onConnectMetaMask()
    onClose()
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return
    const success = await onRegisterPasskey(username)
    if (success) onClose()
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return
    const success = await onLoginPasskey(username)
    if (success) onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container animate-slideDown" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Fingerprint size={18} style={{ stroke: 'var(--accent-coral)' }} />
            <span>Gatekeeper <i>Authentication</i></span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {authMode === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
              Select your preferred method to authenticate with InferPay. Smart Contract Accounts (SCA) support biometric passkeys with sponsored gas.
            </p>

            <ButtonLoading
              onClick={handleMetaMaskConnect}
              isLoading={loading}
              loadingText="Connecting MetaMask..."
              variantClass="btn-brutalist btn-brutalist-pink"
              style={{ justifyContent: 'center', height: '48px', fontWeight: 800, width: '100%' }}
            >
              <Chrome size={18} />
              <span>Connect MetaMask</span>
            </ButtonLoading>

            <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
              <span style={{ padding: '0 10px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 800 }}>OR SIGN IN GASLESS</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
            </div>

            <div className="grid-2-col">
              <button
                onClick={() => setAuthMode('passkey_reg')}
                className="btn-brutalist btn-brutalist-muted"
                style={{ justifyContent: 'center' }}
                disabled={loading}
              >
                <span>Create Passkey</span>
              </button>

              <button
                onClick={() => setAuthMode('passkey_login')}
                className="btn-brutalist btn-brutalist-muted"
                style={{ justifyContent: 'center' }}
                disabled={loading}
              >
                <span>Login Passkey</span>
              </button>
            </div>
          </div>
        )}

        {authMode === 'passkey_reg' && (
          <form onSubmit={handleRegisterSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '15px' }}>
              Enter a username to register a brand new biometric passkey stored directly on your device.
            </p>

            <div className="brutalist-form-group" style={{ marginBottom: '15px' }}>
              <label className="brutalist-label">Username</label>
              <input
                type="text"
                className="brutalist-input"
                placeholder="e.g. agent_alice"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', fontSize: '15px' }}
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-brutalist btn-brutalist-muted"
                onClick={() => setAuthMode('select')}
                disabled={loading}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Back
              </button>
              <ButtonLoading
                type="submit"
                isLoading={loading}
                loadingText="Registering..."
                variantClass="btn-brutalist btn-brutalist-pink"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <Key size={14} />
                <span>Register Biometrics</span>
              </ButtonLoading>
            </div>
          </form>
        )}

        {authMode === 'passkey_login' && (
          <form onSubmit={handleLoginSubmit}>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '15px' }}>
              Enter your username to log in using your existing registered device passkey.
            </p>

            <div className="brutalist-form-group" style={{ marginBottom: '15px' }}>
              <label className="brutalist-label">Username</label>
              <input
                type="text"
                className="brutalist-input"
                placeholder="e.g. agent_alice"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', fontSize: '15px' }}
                required
                disabled={loading}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-brutalist btn-brutalist-muted"
                onClick={() => setAuthMode('select')}
                disabled={loading}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Back
              </button>
              <ButtonLoading
                type="submit"
                isLoading={loading}
                loadingText="Authenticating..."
                variantClass="btn-brutalist btn-brutalist-pink"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <Fingerprint size={14} />
                <span>Authenticate</span>
              </ButtonLoading>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
export default AuthModal
