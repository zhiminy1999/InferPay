'use client'

import React from 'react'
import { Download, Calendar, ShieldAlert, Cpu, Landmark, RefreshCw, BarChart2 } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { TreasuryChart } from './charts/TreasuryChart'
import { SpendingBreakdown } from './charts/SpendingBreakdown'
import { AgentLeaderboard } from './charts/AgentLeaderboard'
import { ComplianceAlerts } from './ComplianceAlerts'
import { MetricsSkeleton, Skeleton } from './LoadingSystem'

export const AnalyticsDashboard: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    refreshAnalytics,
    downloadPDFReport
  } = useAnalytics()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dashboard Top Header bar */}
      <div className="brutalist-card accent-purple" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <BarChart2 size={16} style={{ color: 'var(--accent-coral)' }} />
            <span>Treasury Analytics & <i>Compliance Audit</i></span>
          </h3>
          <p className="card-desc" style={{ marginBottom: 0 }}>
            Real-time portfolio valuations, bridge volumes, cumulative gas overheads, and active regulatory compliance alerts.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {/* Refresh Button */}
          <button
            onClick={refreshAnalytics}
            className="btn-brutalist btn-brutalist-muted"
            title="Refresh Analytics Data"
            style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          </button>
          
          {/* Export Report Button */}
          <div className="bracket-button-wrap">
            <button
              onClick={downloadPDFReport}
              className="btn-brutalist btn-brutalist-pink"
              disabled={isLoading || !data}
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Export PDF Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Selection Bar */}
      <div style={{
        backgroundColor: 'var(--bg-inner)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={14} style={{ color: 'var(--accent-coral)' }} />
          <span className="brutalist-label" style={{ marginBottom: 0 }}>Audit Window:</span>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {(['7days', '30days', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => {
                  setCustomStartDate('')
                  setCustomEndDate('')
                  setDateRange(range)
                }}
                className={`btn-brutalist ${dateRange === range && !customStartDate ? 'btn-brutalist-pink' : 'btn-brutalist-muted'}`}
                style={{
                  padding: '6px 12px',
                  fontSize: '10px',
                  borderRadius: 0,
                  borderRight: range !== 'all' ? '1px solid var(--border)' : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="date"
            className="brutalist-input"
            style={{ padding: '6px 8px', fontSize: '11px', width: '140px' }}
            value={customStartDate}
            onChange={e => setCustomStartDate(e.target.value)}
          />
          <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>to</span>
          <input
            type="date"
            className="brutalist-input"
            style={{ padding: '6px 8px', fontSize: '11px', width: '140px' }}
            value={customEndDate}
            onChange={e => setCustomEndDate(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.25s ease-out' }}>
          <MetricsSkeleton />
          <div className="brutalist-split">
            <div className="brutalist-card" style={{ padding: '20px', height: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton variant="title" width="40%" />
              <Skeleton variant="rect" style={{ flex: 1 }} />
            </div>
            <div className="brutalist-card" style={{ padding: '20px', height: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton variant="title" width="30%" />
              <Skeleton variant="rect" style={{ flex: 1 }} />
            </div>
          </div>
          <div className="brutalist-split">
            <div className="brutalist-card" style={{ padding: '20px', height: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton variant="title" width="50%" />
              <Skeleton variant="text" width="95%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="85%" />
            </div>
            <div className="brutalist-card" style={{ padding: '20px', height: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton variant="title" width="35%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="85%" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="brutalist-card" style={{ padding: '48px', textAlign: 'center', color: '#9f1239', fontSize: '13px', backgroundColor: '#fff1f2', borderColor: '#ffe4e6' }}>
          Error parsing analytics data: {error}
        </div>
      ) : !data ? (
        <div className="brutalist-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No metrics compiled. Check database connectivity.
        </div>
      ) : (
        <>
          {/* Key Metrics Widgets Grid */}
          <div className="metrics-grid-brutalist">
            {/* Total Treasury */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span className="brutalist-label" style={{ marginBottom: '4px' }}>Total Portfolio Valuation</span>
                <span style={{ display: 'block', fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-main)', marginTop: '4px' }}>
                  ${data.treasury.total.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-light)', fontStyle: 'normal' }}>USD</span>
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Wallet: ${(data.treasury.usdcWallet + data.treasury.eurcInUsd).toLocaleString()}</span>
                <span>Gateway: ${data.treasury.usdcGateway.toLocaleString()}</span>
              </div>
            </div>

            {/* Spent Category Sum */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span className="brutalist-label" style={{ marginBottom: '4px' }}>Operational Spending</span>
                <span style={{ display: 'block', fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent-coral)', marginTop: '4px' }}>
                  ${data.spending.total.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-light)', fontStyle: 'normal' }}>USDC</span>
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Bills: ${data.spending.bills}</span>
                <span>Payroll: ${data.spending.payroll}</span>
              </div>
            </div>

            {/* Gas Overheads */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span className="brutalist-label" style={{ marginBottom: '4px' }}>Predictable Gas Overheads</span>
                <span style={{ display: 'block', fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent-green)', marginTop: '4px' }}>
                  ${data.gas.totalSpent.toFixed(4)} <span style={{ fontSize: '10px', color: 'var(--text-light)', fontStyle: 'normal' }}>USDC</span>
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Tx Count: {data.gas.txCount}</span>
                <span>Avg: ${data.gas.averagePerTx.toFixed(4)}</span>
              </div>
            </div>

            {/* Bridge Volume */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span className="brutalist-label" style={{ marginBottom: '4px' }}>CCTP Bridge Volume</span>
                <span style={{ display: 'block', fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: '#3b82f6', marginTop: '4px' }}>
                  ${data.bridge.totalVolume.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-light)', fontStyle: 'normal' }}>USDC</span>
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Bridge Fee: ${data.bridge.totalVolume * 0.001}</span>
                <span>Chain: Arc Testnet</span>
              </div>
            </div>
          </div>

          {/* Charts Display Grid */}
          <div className="brutalist-split">
            <TreasuryChart history={data.treasury.history} />
            <SpendingBreakdown
              bills={data.spending.bills}
              payroll={data.spending.payroll}
              inference={data.spending.inference}
              swaps={data.spending.swaps}
              total={data.spending.total}
            />
          </div>

          {/* Leaderboard and Alerts */}
          <div className="brutalist-split">
            <AgentLeaderboard agents={data.leaderboard} />
            <ComplianceAlerts alerts={data.alerts} />
          </div>
        </>
      )}
    </div>
  )
}
export default AnalyticsDashboard
