'use client'

import React from 'react'
import { Shield, Sparkles, Activity, Globe } from 'lucide-react'
import { AgentInfo } from '@/hooks/useAgentRegistry'

interface AgentProfileCardProps {
  agent: AgentInfo
}

export function AgentProfileCard({ agent }: AgentProfileCardProps) {
  const getReputationBadgeColor = (score: number) => {
    if (score >= 95) return 'green'
    if (score >= 80) return 'yellow'
    return 'pink'
  }

  return (
    <div className="brutalist-card accent-cyan" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '220px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
          {agent.name}
        </h4>
        <span className={`badge-brutalist ${getReputationBadgeColor(agent.reputation)}`} style={{ fontSize: '11px', fontWeight: 700 }}>
          Reputation: {agent.reputation}/100
        </span>
      </div>

      <p style={{ fontSize: '12.5px', color: 'var(--text-main)', margin: '0 0 12px 0', flexGrow: 1, lineHeight: '1.4' }}>
        {agent.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-light)' }}>
          <Sparkles size={12} />
          <strong>Capabilities:</strong> <span style={{ color: 'var(--text-main)' }}>{agent.capabilities}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-light)' }}>
          <Globe size={12} />
          <strong>Endpoint:</strong> <span style={{ color: 'var(--accent-coral)', textDecoration: 'underline', wordBreak: 'break-all' }}>{agent.serviceEndpoint}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-light)' }}>
          <Shield size={12} />
          <strong>On-chain Wallet:</strong> <span style={{ color: 'var(--text-main)', wordBreak: 'break-all', fontFamily: 'monospace' }}>{agent.wallet}</span>
        </div>

        {agent.isSystem && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', marginTop: '4px' }}>
            <span className="badge-brutalist yellow" style={{ padding: '2px 6px', fontSize: '9px' }}>SYSTEM AGENT</span>
          </div>
        )}
      </div>
    </div>
  )
}
export default AgentProfileCard
