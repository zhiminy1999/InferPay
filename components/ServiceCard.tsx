import React from 'react'
import { Star, Shield, HelpCircle, ArrowRight } from 'lucide-react'
import { AIService } from '@/hooks/useMarketplace'

interface ServiceCardProps {
  service: AIService
  onExecute: (service: AIService) => void
  isExecuting: boolean
  hasLowBalance: boolean
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onExecute,
  isExecuting,
  hasLowBalance
}) => {
  const completionRatePercent = Math.round((service.metadata?.completionRate || 0.95) * 100)

  return (
    <div className="brutalist-card" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      <div>
        {/* Header containing name and score */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: 'var(--space-3)' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>{service.name}</h4>
            <span className="brutalist-label" style={{ marginBottom: 0 }}>{service.capability}</span>
          </div>
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>{service.reputation.toFixed(1)}</span>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', lineHeight: '1.5' }}>
          {service.metadata?.description || 'No description provided for this agent service.'}
        </p>

        {/* Tags */}
        {service.metadata?.tags && service.metadata.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--space-4)' }}>
            {service.metadata.tags.map(tag => (
              <span key={tag} className="badge-brutalist cyan">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: 'var(--space-3) 0', width: '100%' }} />

        {/* Bottom footer with pricing and execution trigger */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div>
            <div className="brutalist-label" style={{ marginBottom: '2px' }}>Cost Per Request</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-coral)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              ${service.pricing.toFixed(3)} <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'normal' }}>USDC</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>{completionRatePercent}% Job Success</div>
          </div>

          <div className="bracket-button-wrap">
            <button
              className="btn-brutalist btn-brutalist-pink"
              onClick={() => onExecute(service)}
              disabled={isExecuting || hasLowBalance}
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Run Request</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
