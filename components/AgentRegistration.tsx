'use client'

import React, { useState } from 'react'
import { Plus, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react'
import { useAgentRegistry } from '@/hooks/useAgentRegistry'

interface AgentRegistrationProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
  onSuccess: () => void
}

export function AgentRegistration({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity,
  onSuccess
}: AgentRegistrationProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capabilities, setCapabilities] = useState('')
  const [serviceEndpoint, setServiceEndpoint] = useState('')

  const {
    isRegistryLoading,
    txHash,
    txStatus,
    errorMsg,
    registerAgent
  } = useAgentRegistry({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !capabilities || !serviceEndpoint) {
      addActivity('Validation Error', 'All metadata fields are required for Agent registration.', 'warning', 'warning')
      return
    }

    if (!serviceEndpoint.startsWith('http://') && !serviceEndpoint.startsWith('https://')) {
      addActivity('Validation Error', 'Service endpoint must start with http:// or https://', 'warning', 'warning')
      return
    }

    try {
      const hash = await registerAgent(name, description, capabilities, serviceEndpoint)
      if (hash) {
        setName('')
        setDescription('')
        setCapabilities('')
        setServiceEndpoint('')
        onSuccess()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="brutalist-card accent-yellow" style={{ marginBottom: '20px' }}>
      <h3 className="card-title">Register <i>Your AI Agent</i></h3>
      <p className="card-desc">Assign your autonomous agent a verifiable identity on Arc Testnet via ERC-8004. This enables secure session allowances, consensus participation, and reputation tracking.</p>

      {!isConnected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 'var(--radius-sm)', color: '#92400e', fontSize: '13px' }}>
          <AlertTriangle size={16} />
          <span>Please connect your MetaMask wallet to register an agent.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <div className="brutalist-split" style={{ gap: '15px' }}>
            <div className="brutalist-form-group">
              <label className="brutalist-label">Agent Name</label>
              <input 
                type="text" 
                className="brutalist-input" 
                placeholder="e.g. GPT-4o Allocations Broker" 
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={isRegistryLoading}
                required
              />
            </div>

            <div className="brutalist-form-group">
              <label className="brutalist-label">Service Endpoint (API)</label>
              <input 
                type="text" 
                className="brutalist-input" 
                placeholder="e.g. https://api.agent.io/v1/mcp" 
                value={serviceEndpoint}
                onChange={e => setServiceEndpoint(e.target.value)}
                disabled={isRegistryLoading}
                required
              />
            </div>
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">Agent Description</label>
            <textarea 
              className="brutalist-input" 
              placeholder="Describe the agent's objective, authorization boundaries, and core operational responsibilities." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ minHeight: '80px', fontFamily: 'inherit' }}
              disabled={isRegistryLoading}
              required
            />
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">Agent Capabilities (Comma-separated)</label>
            <input 
              type="text" 
              className="brutalist-input" 
              placeholder="e.g. LLM Inference, Financial Settlement, Smart Routing" 
              value={capabilities}
              onChange={e => setCapabilities(e.target.value)}
              disabled={isRegistryLoading}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="bracket-button-wrap">
              <button 
                type="submit" 
                className="btn-brutalist btn-brutalist-pink" 
                disabled={isRegistryLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isRegistryLoading ? <RefreshCw size={14} className="spin" /> : <Plus size={14} />}
                <span>Register Agent On-chain</span>
              </button>
            </div>

            <div style={{ fontSize: '12.5px', color: 'var(--text-light)' }}>
              Target address: <code style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{address}</code>
              <br />
              Est. Gas Fee: <strong style={{ color: 'var(--text-main)' }}>~0.0004 USDC</strong>
            </div>
          </div>
        </form>
      )}

      {txStatus !== 'idle' && (
        <div style={{ marginTop: '15px', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-inner)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span className={`status-dot ${txStatus === 'pending' ? 'yellow-blink' : txStatus === 'success' ? 'green' : 'red'}`} />
              <strong>
                {txStatus === 'pending' && 'On-chain Agent Registration Pending...'}
                {txStatus === 'success' && 'Agent Registered Successfully!'}
                {txStatus === 'error' && 'Agent Registration Failed'}
              </strong>
              {errorMsg && <span style={{ color: 'var(--accent-pink)', marginLeft: '10px' }}>({errorMsg})</span>}
            </div>

            {txHash && (
              <a 
                href={`https://testnet.arcscan.app/tx/${txHash}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: 'var(--accent-coral)', textDecoration: 'underline' }}
              >
                <span>Receipt ↗</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default AgentRegistration
