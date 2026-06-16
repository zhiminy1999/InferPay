import React, { useState } from 'react'
import { useTransactionHistory, TransactionRecord } from '../hooks/useTransactionHistory'
import { Download, RefreshCw, Filter, Calendar, ExternalLink, Info, Database } from 'lucide-react'

export const TransactionHistory: React.FC = () => {
  const {
    transactions,
    loading,
    error,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    page,
    setPage,
    totalPages,
    totalRecords,
    fetchTransactions,
    exportCSV,
  } = useTransactionHistory()

  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null)

  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'swap': return 'badge-brutalist pink'
      case 'payment': return 'badge-brutalist green'
      case 'job': return 'badge-brutalist cyan'
      case 'session': return 'badge-brutalist yellow'
      case 'proposal': return 'badge-brutalist cyan'
      case 'bridge': return 'badge-brutalist green'
      default: return 'badge-brutalist'
    }
  }

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s = status.toUpperCase()
    if (s === 'SUCCESS' || s === 'APPROVED' || s === 'COMPLETED' || s === 'PAID') {
      return { color: 'var(--accent-green)', fontWeight: 700 }
    }
    if (s === 'PENDING' || s === 'OPEN') {
      return { color: '#d97706', fontWeight: 700 }
    }
    return { color: '#dc2626', fontWeight: 700 }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* DB Indexer Status Bar */}
      <div style={{
        backgroundColor: 'var(--bg-inner)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--space-4)',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} style={{ color: 'var(--accent-coral)' }} />
          <span>Database Engine: <strong style={{ color: 'var(--text-main)' }}>SQLite (better-sqlite3)</strong></span>
          <span style={{ color: 'var(--text-light)' }}>|</span>
          <span>Storage: <strong style={{ color: 'var(--text-main)' }}>data/inferpay.db</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Live indexing active on Arc Testnet</span>
          <button
            onClick={() => fetchTransactions()}
            className="btn-brutalist btn-brutalist-muted"
            style={{ padding: '4px 10px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={11} className={loading ? 'spin' : ''} />
            Sync Chain Events
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="brutalist-card accent-pink">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <Filter style={{ color: 'var(--accent-coral)' }} size={16} />
          <h3 className="card-title" style={{ marginBottom: 0, fontSize: '15px' }}>Transaction History <i>Filters</i></h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-4)' }}>
          {/* Type */}
          <div className="brutalist-form-group">
            <label className="brutalist-label">Module / Type</label>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="brutalist-input"
              style={{ fontSize: '12px' }}
            >
              <option value="">All Transactions</option>
              <option value="session">Budget (AgentEscrow)</option>
              <option value="proposal">Consensus (AgentConsensus)</option>
              <option value="job">Jobs (ERC-8183)</option>
              <option value="payment">Payments (Bill Pay)</option>
              <option value="swap">Swaps (StableFX)</option>
              <option value="bridge">Bridges (CCTP)</option>
            </select>
          </div>

          {/* Status */}
          <div className="brutalist-form-group">
            <label className="brutalist-label">Execution Status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="brutalist-input"
              style={{ fontSize: '12px' }}
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success / Paid</option>
              <option value="PENDING">Pending / Open</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Min Amount */}
          <div className="brutalist-form-group">
            <label className="brutalist-label">Min Amount (USDC)</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
              placeholder="e.g. 10"
              className="brutalist-input"
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Max Amount */}
          <div className="brutalist-form-group">
            <label className="brutalist-label">Max Amount (USDC)</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
              placeholder="e.g. 1000"
              className="brutalist-input"
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Export button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div className="bracket-button-wrap" style={{ width: '100%' }}>
              <button
                onClick={exportCSV}
                className="btn-brutalist btn-brutalist-pink"
                style={{ width: '100%', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={13} />
                Export CSV Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="brutalist-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Wallet Address</th>
              <th>Tx Hash</th>
              <th>Block</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw className="spin" size={14} style={{ display: 'inline-block', marginRight: '8px' }} />
                  Loading persistent transaction registry...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#9f1239' }}>
                  ⚠️ Error loading logs: {error}
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No transaction records found matching your filters.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span className={getBadgeClass(tx.type)}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    ${tx.amount.toFixed(2)} <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>USDC</span>
                  </td>
                  <td>
                    <span style={getStatusStyle(tx.status)}>
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {tx.wallet_address ? `${tx.wallet_address.slice(0, 6)}...${tx.wallet_address.slice(-4)}` : '-'}
                  </td>
                  <td>
                    {tx.tx_hash ? (
                      <a
                        href={`https://testnet.arcscan.app/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-coral)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        {tx.tx_hash.slice(0, 6)}... <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-light)' }}>-</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {tx.block_number || '-'}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="btn-brutalist btn-brutalist-muted"
                      style={{ padding: '2px 8px', fontSize: '10px' }}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-inner)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-4)'
        }}>
          <div>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} records)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-brutalist btn-brutalist-muted"
              style={{ padding: '4px 12px', fontSize: '12px' }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-brutalist btn-brutalist-muted"
              style={{ padding: '4px 12px', fontSize: '12px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Inspector Modal */}
      {selectedTx && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Inspect Transaction <i>#{selectedTx.id.slice(0, 8)}</i></h3>
              <button className="modal-close-btn" onClick={() => setSelectedTx(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-4)' }}>
                <div>
                  <span className="brutalist-label">Type</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', fontSize: '13px' }}>{selectedTx.type}</div>
                </div>
                <div>
                  <span className="brutalist-label">Amount</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '13px' }}>${selectedTx.amount.toFixed(2)} USDC</div>
                </div>
                <div>
                  <span className="brutalist-label">Status</span>
                  <div style={getStatusStyle(selectedTx.status)}>{selectedTx.status}</div>
                </div>
                <div>
                  <span className="brutalist-label">Date</span>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(selectedTx.timestamp * 1000).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <span className="brutalist-label" style={{ display: 'block', marginBottom: '6px' }}>Raw Payload (Metadata)</span>
                <pre style={{
                  backgroundColor: 'var(--bg-inner)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)',
                  overflowX: 'auto',
                  fontSize: '10px',
                  color: 'var(--accent-green)',
                  maxHeight: '200px',
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(selectedTx.metadata, null, 2)}
                </pre>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedTx(null)}
                className="btn-brutalist btn-brutalist-pink"
                style={{ fontSize: '11px' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
