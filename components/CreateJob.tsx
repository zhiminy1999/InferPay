'use client'

import React, { useState, useEffect } from 'react'
import { PlusCircle, Info, Calendar, UserCheck } from 'lucide-react'
import { useAgentRegistry, AgentInfo } from '@/hooks/useAgentRegistry'

interface CreateJobProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  createJob: (
    provider: string,
    evaluator: string,
    expiredAt: number,
    description: string
  ) => Promise<any>
  loading: boolean
  onSuccess: () => void
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function CreateJob({
  isConnected,
  address,
  walletClient,
  publicClient,
  createJob,
  loading,
  onSuccess,
  addActivity
}: CreateJobProps) {
  const [description, setDescription] = useState('')
  const [provider, setProvider] = useState('')
  const [evaluator, setEvaluator] = useState('')
  const [deadlineDays, setDeadlineDays] = useState(7)
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { getAllAgents } = useAgentRegistry({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  useEffect(() => {
    const loadAgents = async () => {
      if (!publicClient) return
      try {
        const data = await getAllAgents()
        setAgents(data)
      } catch (err) {
        console.error('Error loading registered agents:', err)
      }
    }
    loadAgents()
  }, [isConnected, address, publicClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!provider || !evaluator || !description) {
      setErrorMsg('All fields are required')
      return
    }

    if (provider.toLowerCase() === evaluator.toLowerCase()) {
      setErrorMsg('Provider and Evaluator agents cannot be the same address')
      return
    }

    try {
      const durationSeconds = deadlineDays * 24 * 60 * 60
      const expiredAt = Math.floor(Date.now() / 1000) + durationSeconds

      await createJob(provider, evaluator, expiredAt, description)
      
      setDescription('')
      setProvider('')
      setEvaluator('')
      onSuccess()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.shortMessage || err.message || 'On-chain creation error')
    }
  }

  return (
    <div className="brutalist-card accent-coral" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <PlusCircle size={22} style={{ color: 'var(--accent-coral)' }} />
        <h3 className="card-title" style={{ margin: 0 }}>Establish On-Chain ERC-8183 Job</h3>
      </div>

      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: 'rgba(255,107,107,0.08)', padding: '10px', borderLeft: '4px solid var(--accent-coral)' }}>
        <Info size={16} style={{ color: 'var(--accent-coral)', flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          To maintain security under ERC-8183, both the <strong>Provider agent</strong> and the <strong>Evaluator agent</strong> must have pre-registered identity metadata on the ERC-8004 Agent Directory.
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="brutalist-form-group">
          <label className="brutalist-label">
            Job Description & Deliverables
          </label>
          <textarea
            className="brutalist-input"
            placeholder="Describe the job goals, requirements, outputs, and format required..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%', resize: 'vertical' }}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="brutalist-form-group">
            <label className="brutalist-label">
              Service Provider (Agent Wallet)
            </label>
            <select
              className="brutalist-input"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
              required
            >
              <option value="" style={{ color: 'var(--text-main)' }}>Select Provider Agent...</option>
              {agents.map((agent) => (
                <option key={`prov-${agent.wallet}`} value={agent.wallet} style={{ color: 'var(--text-main)' }}>
                  {agent.name} ({agent.wallet.substring(0, 8)}...{agent.wallet.substring(38)})
                </option>
              ))}
            </select>
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-light)' }}>
              Agent performing the tasks. Will set the job budget request.
            </div>
          </div>

          <div className="brutalist-form-group">
            <label className="brutalist-label">
              Job Evaluator / Auditor (Agent/Human)
            </label>
            <select
              className="brutalist-input"
              value={evaluator}
              onChange={(e) => setEvaluator(e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
              required
            >
              <option value="" style={{ color: 'var(--text-main)' }}>Select Evaluator Agent...</option>
              {agents.map((agent) => (
                <option key={`eval-${agent.wallet}`} value={agent.wallet} style={{ color: 'var(--text-main)' }}>
                  {agent.name} ({agent.wallet.substring(0, 8)}...{agent.wallet.substring(38)})
                </option>
              ))}
            </select>
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-light)' }}>
              Evaluates final deliverables and releases the USDC escrow payment.
            </div>
          </div>
        </div>

        <div className="brutalist-form-group">
          <label className="brutalist-label">
            Job Delivery Expiration Days
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Calendar size={18} style={{ color: 'var(--text-light)' }} />
            <input
              type="range"
              min="1"
              max="30"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(Number(e.target.value))}
              className="slider-brutalist"
              style={{ flex: 1 }}
            />
            <span style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right', color: 'var(--text-main)' }}>
              {deadlineDays} Days
            </span>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#b91c1c',
            padding: '12px',
            fontSize: '13px',
            borderRadius: 'var(--radius-sm)'
          }}>
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          className="btn-brutalist btn-brutalist-pink"
          disabled={loading || !isConnected}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? 'Submitting to Blockchain...' : 'Post Job Contract & Invite Provider'}
        </button>
      </form>
    </div>
  )
}
