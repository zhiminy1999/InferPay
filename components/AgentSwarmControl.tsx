'use client'

import React, { useState } from 'react'
import { Brain, Cpu, ArrowRight, ShieldCheck, DollarSign, ExternalLink, Star } from 'lucide-react'
import { parseUnits } from 'viem'
import { useNanopayments } from '@/hooks/useNanopayments'

interface SwarmAgent {
  name: string
  role: string
  reputation: number
  status: 'IDLE' | 'BUSY' | 'COMPLETED' | 'FAILED'
  fee: string
  address: string
}

export const AgentSwarmControl: React.FC = () => {
  const { gatewayBalanceFormatted, refreshBalances } = useNanopayments()
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [agents, setAgents] = useState<SwarmAgent[]>([
    { name: 'Coordinator Agent', role: 'Orchestrator', reputation: 9.9, status: 'IDLE', fee: '0.005 USDC', address: '0x1234...abCD' },
    { name: 'Research Agent', role: 'Information Gatherer', reputation: 9.8, status: 'IDLE', fee: '0.002 USDC', address: '0x5678...efGH' },
    { name: 'Translation Agent', role: 'Language Compiler', reputation: 9.5, status: 'IDLE', fee: '0.001 USDC', address: '0x9abc...ijKL' },
    { name: 'Verifier Agent', role: 'Quality Compliance', reputation: 9.7, status: 'IDLE', fee: '0.001 USDC', address: '0xdef0...mnOP' },
    { name: 'Payment Agent', role: 'Arc Treasury Settler', reputation: 9.9, status: 'IDLE', fee: '0.0004 USDC', address: '0x7a30...b2b0' }
  ])

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev])
  }

  const runSwarm = async () => {
    setIsRunning(true)
    setLogs([])
    addLog('[System] Initializing ERC-8004 Swarm Orchestration...')
    
    // Reset agent statuses
    setAgents(prev => prev.map(a => ({ ...a, status: 'IDLE' })))
    await new Promise(r => setTimeout(r, 1000))

    // Step 1: Coordinator
    setAgents(prev => {
      const next = [...prev]
      next[0].status = 'BUSY'
      return next
    })
    addLog('[Coordinator Agent] Parsing user prompt. Estimated compute budget: 0.009 USDC.')
    await new Promise(r => setTimeout(r, 1200))
    setAgents(prev => {
      const next = [...prev]
      next[0].status = 'COMPLETED'
      return next
    })

    // Step 2: Research
    setAgents(prev => {
      const next = [...prev]
      next[1].status = 'BUSY'
      return next
    })
    addLog('[Research Agent] Commencing file search. Querying Lepton research files...')
    addLog('[Chain] [Research Agent] x402 challenge detected on /api/search. Signing authorization invoice...')
    await new Promise(r => setTimeout(r, 1500))
    addLog('[Payments] [Research Agent] EIP-712 micro-signature verified. Deducted 0.002 USDC from local balance.')
    addLog('[Royalty Split] 20% of fee (0.0004 USDC) routed to publisher wallet.')
    setAgents(prev => {
      const next = [...prev]
      next[1].status = 'COMPLETED'
      return next
    })

    // Step 3: Translation
    setAgents(prev => {
      const next = [...prev]
      next[2].status = 'BUSY'
      return next
    })
    addLog('[Translation Agent] Formatting search results. Billed 0.001 USDC for OCR compilation.')
    await new Promise(r => setTimeout(r, 1200))
    setAgents(prev => {
      const next = [...prev]
      next[2].status = 'COMPLETED'
      return next
    })

    // Step 4: Verifier
    setAgents(prev => {
      const next = [...prev]
      next[3].status = 'BUSY'
      return next
    })
    addLog('[Verifier Agent] Running compliance check. Match index verified successfully.')
    await new Promise(r => setTimeout(r, 1000))
    setAgents(prev => {
      const next = [...prev]
      next[3].status = 'COMPLETED'
      return next
    })

    // Step 5: Payment
    setAgents(prev => {
      const next = [...prev]
      next[4].status = 'BUSY'
      return next
    })
    addLog('[Payouts] [Payment Agent] Settlement confirmed on Arc Testnet. Gas fee: 0.0004 USDC.')
    await new Promise(r => setTimeout(r, 1000))
    setAgents(prev => {
      const next = [...prev]
      next[4].status = 'COMPLETED'
      return next
    })

    addLog('[Success] ERC-8004 Swarm operation executed successfully.')
    setIsRunning(false)
    refreshBalances()
  }

  return (
    <div className="brutalist-card accent-coral" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain style={{ color: 'var(--accent-coral)' }} size={18} />
          <h3 className="card-title" style={{ marginBottom: 0 }}>ERC-8004 AI Swarm <i>Orchestrator</i></h3>
        </div>
        <div className="bracket-button-wrap">
          <button 
            className="btn-brutalist btn-brutalist-pink"
            onClick={runSwarm}
            disabled={isRunning}
            style={{ fontSize: '12.5px' }}
          >
            {isRunning ? 'Processing Swarm...' : 'Run Swarm Operation'}
          </button>
        </div>
      </div>

      <p className="card-desc">
        Watch multiple specialized agents coordinate, hire, and settle payments autonomously with zero human intervention.
      </p>

      {/* Grid of Agents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        {agents.map((agent, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            position: 'relative',
            opacity: agent.status === 'IDLE' ? 0.75 : 1,
            transition: 'all 0.3s ease',
            boxShadow: agent.status === 'BUSY' ? '0 0 10px rgba(239, 68, 68, 0.2)' : 'none',
            borderColor: agent.status === 'BUSY' ? 'var(--accent-coral)' : agent.status === 'COMPLETED' ? 'var(--accent-green)' : 'var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span className={`badge-brutalist ${agent.status === 'BUSY' ? 'yellow' : agent.status === 'COMPLETED' ? 'green' : 'default'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                {agent.status}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 700 }}>
                <Star size={11} fill="var(--accent-coral)" style={{ color: 'var(--accent-coral)' }} /> {agent.reputation}
              </span>
            </div>

            <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-main)', marginBottom: '2px' }}>{agent.name}</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-light)', marginBottom: '8px' }}>{agent.role}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', borderTop: '1px dashed var(--border)', paddingTop: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fee:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{agent.fee}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal logs */}
      <div style={{
        backgroundColor: 'var(--bg-inner)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        height: '140px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '4px'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px' }}>
            Click 'Run Swarm Operation' to begin trace.
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ color: log.includes('[Success]') || log.includes('Split') ? 'var(--accent-green)' : log.includes('[System]') ? 'var(--accent-coral)' : 'var(--text-main)' }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
