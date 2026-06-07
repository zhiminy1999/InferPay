'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Users } from 'lucide-react'
import { useAgentRegistry, AgentInfo } from '@/hooks/useAgentRegistry'
import { AgentProfileCard } from './AgentProfileCard'
import { AgentRegistration } from './AgentRegistration'

interface AgentDirectoryProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function AgentDirectory({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: AgentDirectoryProps) {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [loading, setLoading] = useState(false)

  const { getAllAgents } = useAgentRegistry({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  const loadAgents = async () => {
    setLoading(true)
    try {
      const data = await getAllAgents()
      setAgents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [isConnected, address, publicClient])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Registration Section */}
      <AgentRegistration
        isConnected={isConnected}
        address={address}
        walletClient={walletClient}
        publicClient={publicClient}
        addActivity={addActivity}
        onSuccess={loadAgents}
      />

      {/* Directory Section */}
      <div className="brutalist-card accent-cyan">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={22} style={{ color: 'var(--accent-coral)' }} />
            <h3 className="card-title" style={{ margin: 0 }}>Registered Agent Directory</h3>
          </div>
          <button 
            className="btn-brutalist btn-brutalist-muted" 
            onClick={loadAgents} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Sync Registry</span>
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '40px 0' }}>
            <RefreshCw size={24} className="spin text-coral" />
            <span style={{ fontWeight: 650 }}>Syncing ERC-8004 registries...</span>
          </div>
        ) : agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No agents registered on-chain yet. Use the form above to register your wallet address!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {agents.map((agent, index) => (
              <AgentProfileCard key={index} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default AgentDirectory
