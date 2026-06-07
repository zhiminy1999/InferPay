'use client'

import React from 'react'
import { Lock, ArrowRightLeft, Coins, FileText, Shield, Zap, Users, Briefcase, History } from 'lucide-react'

interface SidebarProps {
  activeTab: 'escrow' | 'intent' | 'yield' | 'payroll' | 'consensus' | 'directory' | 'jobs' | 'nanopayments' | 'history'
  setActiveTab: (tab: 'escrow' | 'intent' | 'yield' | 'payroll' | 'consensus' | 'directory' | 'jobs' | 'nanopayments' | 'history') => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Your Tools</div>
        
        <div 
          className={`sidebar-menu-item ${activeTab === 'escrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('escrow')}
        >
          <div className="sidebar-icon-wrap">
            <Lock size={15} />
            <span>1. AI Spending Budget</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'intent' ? 'active' : ''}`}
          onClick={() => setActiveTab('intent')}
        >
          <div className="sidebar-icon-wrap">
            <ArrowRightLeft size={15} />
            <span>2. Smart Bill Pay</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'yield' ? 'active' : ''}`}
          onClick={() => setActiveTab('yield')}
        >
          <div className="sidebar-icon-wrap">
            <Coins size={15} />
            <span>3. Savings Optimizer</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'payroll' ? 'active' : ''}`}
          onClick={() => setActiveTab('payroll')}
        >
          <div className="sidebar-icon-wrap">
            <FileText size={15} />
            <span>4. Review & Pay AI Work</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'consensus' ? 'active' : ''}`}
          onClick={() => setActiveTab('consensus')}
        >
          <div className="sidebar-icon-wrap">
            <Shield size={15} />
            <span>5. Approval Committee</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          <div className="sidebar-icon-wrap">
            <Users size={15} />
            <span>6. Agent Directory</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <div className="sidebar-icon-wrap">
            <Briefcase size={15} />
            <span>7. Autonomous Jobs</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'nanopayments' ? 'active' : ''}`}
          onClick={() => setActiveTab('nanopayments')}
        >
          <div className="sidebar-icon-wrap">
            <Zap size={15} />
            <span>8. Gateway Nanopayments</span>
          </div>
        </div>

        <div 
          className={`sidebar-menu-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <div className="sidebar-icon-wrap text-accent-pink font-bold">
            <History size={15} />
            <span>9. Transaction Audit Trail</span>
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
              💡 With just <strong>$1</strong> in fees, your AI assistant can handle <strong>2,500 tasks</strong> automatically.
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
export default Sidebar
