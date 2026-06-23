'use client'

import React from 'react'
import { Lock, ArrowRightLeft, Coins, FileText, Shield, Zap, Users, Briefcase, History, Sparkles, X, Cpu } from 'lucide-react'

interface SidebarProps {
  activeTab: 'agents' | 'escrow' | 'intent' | 'yield' | 'payroll' | 'consensus' | 'directory' | 'jobs' | 'nanopayments' | 'marketplace' | 'analytics' | 'history'
  setActiveTab: (tab: 'agents' | 'escrow' | 'intent' | 'yield' | 'payroll' | 'consensus' | 'directory' | 'jobs' | 'nanopayments' | 'marketplace' | 'analytics' | 'history') => void
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export function Sidebar({ activeTab, setActiveTab, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const handleItemClick = (tab: any) => {
    setActiveTab(tab)
    if (onCloseMobile) {
      onCloseMobile()
    }
  }

  return (
    <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Mobile Close Button */}
      {onCloseMobile && (
        <button 
          onClick={onCloseMobile}
          className="sidebar-mobile-close btn-brutalist btn-brutalist-muted"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '6px',
            display: 'none' // Controlled by CSS media queries
          }}
        >
          <X size={15} />
        </button>
      )}

      <div className="sidebar-section">
        <div className="sidebar-label">Your Tools</div>
        
        <div 
          className={`sidebar-menu-item ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => handleItemClick('agents')}
        >
          <div className="sidebar-icon-wrap" style={activeTab === 'agents' ? { color: 'var(--accent-coral)' } : undefined}>
            <Cpu size={15} />
            <span>AI Agent Workspace</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'escrow' ? 'active' : ''}`}
          onClick={() => handleItemClick('escrow')}
        >
          <div className="sidebar-icon-wrap">
            <Lock size={15} />
            <span>AI Spending Budget</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'intent' ? 'active' : ''}`}
          onClick={() => handleItemClick('intent')}
        >
          <div className="sidebar-icon-wrap">
            <ArrowRightLeft size={15} />
            <span>Smart Bill Pay</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'yield' ? 'active' : ''}`}
          onClick={() => handleItemClick('yield')}
        >
          <div className="sidebar-icon-wrap">
            <Coins size={15} />
            <span>Savings Optimizer</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'payroll' ? 'active' : ''}`}
          onClick={() => handleItemClick('payroll')}
        >
          <div className="sidebar-icon-wrap">
            <FileText size={15} />
            <span>Review & Pay AI Work</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'consensus' ? 'active' : ''}`}
          onClick={() => handleItemClick('consensus')}
        >
          <div className="sidebar-icon-wrap">
            <Shield size={15} />
            <span>Approval Committee</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => handleItemClick('directory')}
        >
          <div className="sidebar-icon-wrap">
            <Users size={15} />
            <span>Agent Directory</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => handleItemClick('jobs')}
        >
          <div className="sidebar-icon-wrap">
            <Briefcase size={15} />
            <span>Autonomous Jobs</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'nanopayments' ? 'active' : ''}`}
          onClick={() => handleItemClick('nanopayments')}
        >
          <div className="sidebar-icon-wrap">
            <Zap size={15} />
            <span>Gateway Nanopayments</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => handleItemClick('marketplace')}
        >
          <div className="sidebar-icon-wrap">
            <Sparkles size={15} style={{ color: 'var(--accent-pink)' }} />
            <span>Agent Marketplace</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleItemClick('analytics')}
        >
          <div className="sidebar-icon-wrap">
            <Coins size={15} style={{ color: 'var(--accent-green)' }} />
            <span>Treasury Analytics</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleItemClick('history')}
        >
          <div className={`sidebar-icon-wrap ${activeTab === 'history' ? 'text-accent-pink font-bold' : ''}`}>
            <History size={15} />
            <span>Transaction Audit Trail</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 var(--space-4)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* System Status card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '6px' }}>Protection Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '12px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
            <span>All Systems Protected</span>
          </div>
        </div>

        {/* Feature B: Arc Predictable Gas Fee Meter */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={12} style={{ color: 'var(--accent-coral)' }} />
            <span>Transaction Costs</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cost per action:</span>
              <strong style={{ color: 'var(--text-main)' }}>0.0004 USDC</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Confirmation time:</span>
              <strong style={{ color: 'var(--text-main)' }}>Under 1 second</strong>
            </div>
            <div style={{ 
              marginTop: '4px',
              padding: '6px', 
              backgroundColor: 'var(--bg-inner)', 
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)', 
              fontSize: '11px', 
              color: 'var(--text-muted)',
              lineHeight: '1.3'
            }}>
              With just <strong>$1</strong> in fees, your AI assistant can handle <strong>2,500 tasks</strong> automatically.
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
export default Sidebar
