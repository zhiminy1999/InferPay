import React from 'react'
import { Award, Star } from 'lucide-react'

interface LeaderboardAgent {
  id: string
  name: string
  capability: string
  reputation: number
  completionRate: number
  totalEarned: number
  jobsCompleted: number
}

interface AgentLeaderboardProps {
  agents: LeaderboardAgent[]
}

export const AgentLeaderboard: React.FC<AgentLeaderboardProps> = ({ agents }) => {
  return (
    <div className="brutalist-card" style={{ padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={14} style={{ color: '#f59e0b' }} />
          <span className="brutalist-label" style={{ marginBottom: 0 }}>Agent Contractor Leaderboard</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Ranked by volume</span>
      </div>

      <div className="table-responsive">
        <table className="brutalist-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Agent / Capability</th>
              <th style={{ textAlign: 'right' }}>Reputation</th>
              <th style={{ textAlign: 'right' }}>Success</th>
              <th style={{ textAlign: 'right' }}>Jobs</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(!agents || agents.length === 0) ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No agent revenue recorded.
                </td>
              </tr>
            ) : (
              agents.map((agent, index) => {
                const rankColors = ['#f59e0b', '#94a3b8', '#d97706']
                const isTopThree = index < 3
                return (
                  <tr key={agent.id}>
                    <td style={{ fontWeight: 700, color: isTopThree ? rankColors[index] : 'var(--text-muted)' }}>
                      #{index + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>{agent.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{agent.capability}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                        <Star size={10} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <span>{agent.reputation.toFixed(1)}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-green)', fontWeight: 700 }}>
                      {Math.round(agent.completionRate * 100)}%
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {agent.jobsCompleted}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-coral)', fontWeight: 700, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                      ${agent.totalEarned.toFixed(2)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default AgentLeaderboard
