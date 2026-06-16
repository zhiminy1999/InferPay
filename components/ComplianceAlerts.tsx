import React from 'react'
import { AlertTriangle, AlertOctagon, Info, ShieldCheck } from 'lucide-react'

export interface ComplianceAlert {
  id: string
  type: string
  severity: string
  message: string
  timestamp: number
}

interface ComplianceAlertsProps {
  alerts: ComplianceAlert[]
}

export const ComplianceAlerts: React.FC<ComplianceAlertsProps> = ({ alerts }) => {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: '#fff1f2',
          border: '#ffe4e6',
          text: '#9f1239',
          icon: <AlertOctagon size={16} style={{ color: '#9f1239', flexShrink: 0 }} />
        }
      case 'HIGH':
        return {
          bg: '#fff7ed',
          border: '#ffedd5',
          text: '#c2410c',
          icon: <AlertTriangle size={16} style={{ color: '#c2410c', flexShrink: 0 }} />
        }
      case 'MEDIUM':
        return {
          bg: '#fffbeb',
          border: '#fef3c7',
          text: '#92400e',
          icon: <AlertTriangle size={16} style={{ color: '#92400e', flexShrink: 0 }} />
        }
      default:
        return {
          bg: 'var(--bg-inner)',
          border: 'var(--border)',
          text: 'var(--text-muted)',
          icon: <Info size={16} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
        }
    }
  }

  return (
    <div className="brutalist-card" style={{ padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertOctagon size={14} style={{ color: 'var(--accent-coral)' }} />
          <span className="brutalist-label" style={{ marginBottom: 0 }}>Active Compliance Feed</span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Real-Time Auditing</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
        {(!alerts || alerts.length === 0) ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 0',
            textAlign: 'center',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <ShieldCheck size={24} style={{ color: 'var(--accent-green)', marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Zero Flags Active</div>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>All treasury transfers conform to compliance templates.</div>
          </div>
        ) : (
          alerts.map(alert => {
            const styles = getSeverityStyles(alert.severity)
            return (
              <div
                key={alert.id}
                style={{
                  padding: 'var(--space-3)',
                  border: `1px solid ${styles.border}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: styles.bg,
                  display: 'flex',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s ease'
                }}
              >
                {styles.icon}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <span style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 700,
                      color: styles.text
                    }}>
                      {alert.severity} • {alert.type.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>
                      {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5' }}>
                    {alert.message}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
export default ComplianceAlerts
