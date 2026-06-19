'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { ActivityLog } from '@/types'
import { BrandIcon } from './BrandIcon'

interface ActivityFeedProps {
  activities: ActivityLog[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <aside className="app-assistant-feed">
      <div className="feed-header">
        <Sparkles size={16} />
        <span>Recent Activity</span>
      </div>

      <div className="feed-list">
        {activities.map((act, idx) => {
          const variant = act.type === 'success' ? 'green' : act.type === 'danger' ? 'coral' : act.type === 'warning' ? 'yellow' : 'default'
          return (
            <div key={idx} className={`feed-card ${idx === 0 ? 'highlight' : ''}`} style={{ animation: 'slideDown 0.2s' }}>
              <div className="feed-card-header">
                <span style={{ 
                  fontWeight: 700, 
                  color: act.type === 'success' ? 'var(--accent-coral)' : act.type === 'danger' ? 'var(--accent-pink)' : act.type === 'warning' ? 'var(--accent-yellow)' : 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <BrandIcon name={act.emoji || 'droplet'} size={14} variant={variant} />
                  <span>{act.title}</span>
                </span>
                <span className="feed-card-time">{act.time}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '12px' }}>{act.desc}</div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
export default ActivityFeed
