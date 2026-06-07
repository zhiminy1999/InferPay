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
      case 'proposal': return 'badge-brutalist purple'
      case 'bridge': return 'badge-brutalist blue'
      default: return 'badge-brutalist'
    }
  }

  const getStatusClass = (status: string) => {
    const s = status.toUpperCase()
    if (s === 'SUCCESS' || s === 'APPROVED' || s === 'COMPLETED' || s === 'PAID') {
      return 'text-accent-green font-bold'
    }
    if (s === 'PENDING' || s === 'OPEN') {
      return 'text-yellow-400 font-bold'
    }
    return 'text-red-500 font-bold'
  }

  return (
    <div className="space-y-6">
      {/* DB Indexer Status Bar */}
      <div className="bg-zinc-950 p-4 border border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-accent-pink" />
          <span>Database Engine: <b className="text-white">SQLite (better-sqlite3)</b></span>
          <span className="text-zinc-600">|</span>
          <span>Storage: <b className="text-white">data/inferpay.db</b></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-500">Live indexing active on Arc Testnet</span>
          <button
            onClick={() => fetchTransactions()}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white text-[10px]"
          >
            <RefreshCw size={11} className={loading ? 'spin' : ''} />
            Sync Chain Events
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="brutalist-card bg-zinc-900 border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-accent-pink" size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Transaction History Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Type */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Module / Type</label>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="w-full bg-black border border-zinc-800 p-2 font-mono text-xs text-white"
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
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Execution Status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full bg-black border border-zinc-800 p-2 font-mono text-xs text-white"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success / Paid</option>
              <option value="PENDING">Pending / Open</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Min Amount (USDC)</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
              placeholder="e.g. 10"
              className="w-full bg-black border border-zinc-800 p-2 font-mono text-xs text-white"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">Max Amount (USDC)</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
              placeholder="e.g. 1000"
              className="w-full bg-black border border-zinc-800 p-2 font-mono text-xs text-white"
            />
          </div>

          {/* Export button */}
          <div className="flex items-end">
            <button
              onClick={exportCSV}
              className="w-full bg-accent-pink hover:bg-rose-600 text-white font-mono text-xs py-2 px-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              Export CSV Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="border-2 border-black overflow-x-auto bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-zinc-950 text-zinc-400 border-b-2 border-black uppercase text-[10px]">
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Wallet Address</th>
              <th className="p-3">Tx Hash</th>
              <th className="p-3">Block</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
                  <RefreshCw className="spin inline-block mr-2" size={14} />
                  Loading persistent transaction registry...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-red-400">
                  ⚠️ Error loading logs: {error}
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-zinc-500">
                  No transaction records found matching your filters.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-900/40 text-zinc-300">
                  <td className="p-3">
                    <span className={getBadgeClass(tx.type)}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">
                    ${tx.amount.toFixed(2)} <span className="text-[10px] text-zinc-500">USDC</span>
                  </td>
                  <td className="p-3">
                    <span className={getStatusClass(tx.status)}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">
                    {tx.wallet_address ? `${tx.wallet_address.slice(0, 6)}...${tx.wallet_address.slice(-4)}` : '-'}
                  </td>
                  <td className="p-3">
                    {tx.tx_hash ? (
                      <a
                        href={`https://testnet.arcscan.app/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-pink hover:underline inline-flex items-center gap-0.5"
                      >
                        {tx.tx_hash.slice(0, 6)}... <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="p-3 text-zinc-500">
                    {tx.block_number || '-'}
                  </td>
                  <td className="p-3 text-zinc-400">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] uppercase font-bold text-zinc-300"
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
        <div className="flex justify-between items-center font-mono text-xs text-zinc-500 bg-zinc-950 p-4 border border-zinc-900">
          <div>
            Showing Page <b>{page}</b> of <b>{totalPages}</b> ({totalRecords} records)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-white disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Inspector Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="brutalist-card bg-zinc-900 border-2 border-black w-full max-w-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-mono text-xs">
            <div className="flex justify-between items-center border-b-2 border-black p-4 bg-zinc-950">
              <span className="font-bold text-white uppercase tracking-wider">Inspect Transaction #{selectedTx.id.slice(0, 8)}</span>
              <button onClick={() => setSelectedTx(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-zinc-500 uppercase text-[10px]">Type</span>
                  <div className="font-bold text-white uppercase">{selectedTx.type}</div>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[10px]">Amount</span>
                  <div className="font-bold text-white">${selectedTx.amount.toFixed(2)} USDC</div>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[10px]">Status</span>
                  <div className={getStatusClass(selectedTx.status)}>{selectedTx.status}</div>
                </div>
                <div>
                  <span className="text-zinc-500 uppercase text-[10px]">Date</span>
                  <div className="text-zinc-300">{new Date(selectedTx.timestamp * 1000).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <span className="text-zinc-500 uppercase text-[10px] block mb-1">Raw Payload (Metadata)</span>
                <pre className="bg-black border border-zinc-800 p-3 overflow-x-auto text-[10px] text-accent-green max-h-[200px]">
                  {JSON.stringify(selectedTx.metadata, null, 2)}
                </pre>
              </div>
            </div>
            <div className="border-t-2 border-black p-4 bg-zinc-950 text-right">
              <button
                onClick={() => setSelectedTx(null)}
                className="bg-accent-pink text-white font-bold py-1.5 px-4 border border-black uppercase text-[10px]"
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
