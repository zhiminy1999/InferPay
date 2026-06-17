'use client'

import React, { useState } from 'react'
import { Search, Plus, ListFilter, Cpu, PlusCircle, History, Sparkles, X, Brain } from 'lucide-react'
import { useMarketplace, AIService } from '@/hooks/useMarketplace'
import { ServiceCard } from './ServiceCard'
import { AutonomousAgent } from './AutonomousAgent'
import { AgentSwarmControl } from './AgentSwarmControl'
import { useNanopayments } from '@/hooks/useNanopayments'
import { CardSkeleton } from './LoadingSystem'

export const Marketplace: React.FC = () => {
  const {
    services,
    searchQuery,
    setSearchQuery,
    minReputation,
    setMinReputation,
    isLoading,
    isRegistering,
    recentPayments,
    registerService,
    payAndRunService,
  } = useMarketplace()

  const { gatewayBalance, gatewayBalanceFormatted, isLowBalance } = useNanopayments()

  // Registration modal/form state
  const [showRegForm, setShowRegForm] = useState(false)
  const [regName, setRegName] = useState('')
  const [regCapability, setRegCapability] = useState('')
  const [regPricing, setRegPricing] = useState('0.02')
  const [regDescription, setRegDescription] = useState('')
  const [regTags, setRegTags] = useState('')
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null)
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null)

  // Execution modal state
  const [executingService, setExecutingService] = useState<AIService | null>(null)
  const [executionResult, setExecutionResult] = useState<string | null>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegSuccessMsg(null)
    setRegErrorMsg(null)

    if (!regName || !regCapability || !regPricing || !regDescription) {
      setRegErrorMsg('Please fill in all required fields.')
      return
    }

    try {
      const tagsArray = regTags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0)

      const serviceId = await registerService({
        name: regName,
        capability: regCapability,
        pricing: parseFloat(regPricing),
        description: regDescription,
        tags: tagsArray,
      })

      setRegSuccessMsg(`Service registered successfully! ID: ${serviceId}`)
      // Reset form
      setRegName('')
      setRegCapability('')
      setRegPricing('0.02')
      setRegDescription('')
      setRegTags('')
      setTimeout(() => {
        setShowRegForm(false)
        setRegSuccessMsg(null)
      }, 2000)
    } catch (err: any) {
      setRegErrorMsg(err.message || 'Failed to register service provider profile.')
    }
  }

  const handleExecute = async (service: AIService) => {
    setExecutingService(service)
    setExecutionResult(null)
    setExecutionError(null)
    setIsExecuting(true)

    try {
      const res = await payAndRunService(service)
      if (res.success && res.result) {
        setExecutionResult(res.result)
      } else {
        setExecutionError(res.error || 'Failed to execute service request.')
      }
    } catch (err: any) {
      setExecutionError(err.message || 'Execution error.')
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Intro alert — Agent Marketplace Header */}
      <div className="brutalist-card accent-pink" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-coral)' }} />
            <span>Agent Service <i>Marketplace (x402 Protocol)</i></span>
          </h3>
          <p className="card-desc" style={{ marginBottom: 0 }}>
            AI agents can autonomously query capability directories, verify reputation scores, pay micro-USDC bills via x402 headers, and execute tasks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px var(--space-3)',
            textAlign: 'right'
          }}>
            <span className="brutalist-label" style={{ marginBottom: '2px', display: 'block' }}>Available Agent Fuel</span>
            <span style={{
              fontSize: '14px',
              fontWeight: 800,
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: isLowBalance ? 'var(--accent-coral)' : 'var(--accent-green)'
            }}>
              {gatewayBalanceFormatted} USDC
            </span>
          </div>
          <div className="bracket-button-wrap">
            <button 
              className="btn-brutalist btn-brutalist-pink"
              onClick={() => setShowRegForm(true)}
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>Register Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* Autonomous execution playground */}
      <AutonomousAgent />

      {/* ERC-8004 AI Swarm Orchestration */}
      <AgentSwarmControl />

      {/* Main Directory & Grid */}
      <div className="marketplace-split">
        {/* Left Side: Directory & Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
            backgroundColor: 'var(--bg-inner)',
            padding: 'var(--space-4)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Search capabilities (e.g. vision, coding)..."
                className="brutalist-input"
                style={{ paddingRight: '32px', fontSize: '12px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search style={{ position: 'absolute', right: '10px', top: '10px', color: 'var(--text-light)' }} size={14} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="brutalist-label" style={{ marginBottom: 0 }}>Min Reputation:</span>
              <select
                className="brutalist-input"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
                value={minReputation}
                onChange={e => setMinReputation(parseFloat(e.target.value))}
              >
                <option value="0">All Ratings</option>
                <option value="9.0">⭐ 9.0+ Rating</option>
                <option value="9.5">⭐ 9.5+ Rating</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid-2-col" style={{ width: '100%' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={`market-skel-${i}`} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="brutalist-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No service matching your search criteria was discovered.
            </div>
          ) : (
            <div className="grid-2-col">
              {services.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onExecute={handleExecute}
                  isExecuting={isExecuting}
                  hasLowBalance={isLowBalance}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Payment logs */}
        <div>
          <div className="brutalist-card accent-pink">
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
              color: 'var(--text-main)'
            }}>
              <History size={16} style={{ color: 'var(--accent-coral)' }} />
              <span>x402 Micropayment <i>Audits</i></span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
              {recentPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No billing history recorded on-chain yet.
                </div>
              ) : (
                recentPayments.map(p => (
                  <div key={p.id} style={{
                    backgroundColor: 'var(--bg-inner)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{p.metadata?.serviceName || 'AI Service'}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-green)' }}>${parseFloat(p.amount).toFixed(4)} USDC</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '10px', color: 'var(--text-light)' }}>
                      <span>x402 Receipt Hash: {p.tx_hash.slice(0, 8)}...</span>
                      <span>{new Date(p.timestamp * 1000).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Register <i>Compute Service</i></h3>
              <button className="modal-close-btn" onClick={() => setShowRegForm(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="brutalist-form-group">
                <label className="brutalist-label">Service Agent Name</label>
                <input
                  type="text"
                  placeholder="e.g. GPT-4 Vision Agent"
                  className="brutalist-input"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="brutalist-form-group">
                <label className="brutalist-label">Core Capability Descriptor</label>
                <input
                  type="text"
                  placeholder="e.g. Image Analysis & OCR"
                  className="brutalist-input"
                  value={regCapability}
                  onChange={e => setRegCapability(e.target.value)}
                  required
                />
              </div>

              <div className="brutalist-form-group">
                <label className="brutalist-label">Cost Per Request (USDC)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="1.0"
                  className="brutalist-input"
                  value={regPricing}
                  onChange={e => setRegPricing(e.target.value)}
                  required
                />
              </div>

              <div className="brutalist-form-group">
                <label className="brutalist-label">Service Description</label>
                <textarea
                  placeholder="Summarize what output results are returned by your service..."
                  className="brutalist-input"
                  style={{ height: '80px', resize: 'vertical' }}
                  value={regDescription}
                  onChange={e => setRegDescription(e.target.value)}
                  required
                />
              </div>

              <div className="brutalist-form-group">
                <label className="brutalist-label">Categorization Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. vision, ocr, compute"
                  className="brutalist-input"
                  value={regTags}
                  onChange={e => setRegTags(e.target.value)}
                />
              </div>

              {regSuccessMsg && (
                <div className="badge-brutalist green" style={{ padding: '10px', fontSize: '12px', display: 'block' }}>
                  {regSuccessMsg}
                </div>
              )}

              {regErrorMsg && (
                <div className="badge-brutalist pink" style={{ padding: '10px', fontSize: '12px', display: 'block' }}>
                  {regErrorMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn-brutalist btn-brutalist-muted"
                  onClick={() => setShowRegForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-brutalist btn-brutalist-pink"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execution Progress Modal */}
      {executingService && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Cpu size={16} style={{ color: 'var(--accent-coral)' }} />
                <span>Executing: <i>{executingService.name}</i></span>
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  if (!isExecuting) setExecutingService(null)
                }}
                disabled={isExecuting}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{
                backgroundColor: 'var(--bg-inner)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Capability:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{executingService.capability}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Handshake Handled:</span>
                  <span style={{ color: 'var(--accent-coral)', fontWeight: 700 }}>x402 Protocol Challenge</span>
                </div>
              </div>

              {isExecuting && (
                <div style={{
                  padding: 'var(--space-5)',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-inner)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <Brain style={{ color: 'var(--accent-coral)', margin: '0 auto 8px' }} size={20} className="spin" />
                  Deducting nanopayment and resolving verification headers...
                </div>
              )}

              {executionResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ color: 'var(--accent-green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>✓ Succeeded</span>
                  </div>
                  <div style={{
                    backgroundColor: 'var(--bg-inner)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                    color: 'var(--text-main)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '13px'
                  }}>
                    {executionResult}
                  </div>
                </div>
              )}

              {executionError && (
                <div style={{
                  padding: 'var(--space-3)',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #ffe4e6',
                  borderRadius: 'var(--radius-sm)',
                  color: '#9f1239',
                  fontSize: '13px',
                  fontWeight: 600
                }}>
                  Error during handshake: {executionError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button
                  className="btn-brutalist btn-brutalist-pink"
                  onClick={() => setExecutingService(null)}
                  disabled={isExecuting}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Marketplace
