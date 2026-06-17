'use client'

import React from 'react'
import { SwapHistoryRecord } from '@/hooks/useStableFX'
import { ArrowRightLeft, ExternalLink, Activity } from 'lucide-react'

interface SwapHistoryProps {
  history: SwapHistoryRecord[]
}

export function SwapHistory({ history }: SwapHistoryProps) {
  return (
    <div className="brutalist-card accent-purple" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
        <Activity size={20} className="accent-color" />
        <h3 className="card-title" style={{ margin: 0 }}>On-Chain Swap Ledger</h3>
      </div>
      
      {history.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
          No FX trades executed yet. Optimize funds to record transactions on the ledger.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Swap Pair</th>
                <th>In</th>
                <th>Out</th>
                <th>FX Rate</th>
                <th>Inbound Tx</th>
                <th>Payout Tx</th>
                <th>Arbitrage P&L</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id}>
                  <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{record.timestamp}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <span className="badge-brutalist green" style={{ fontSize: '10px', padding: '2px 4px' }}>{record.fromCurrency}</span>
                      <ArrowRightLeft size={10} style={{ color: 'var(--text-light)' }} />
                      <span className="badge-brutalist pink" style={{ fontSize: '10px', padding: '2px 4px' }}>{record.toCurrency}</span>
                    </div>
                  </td>
                  <td><strong>{Number(record.amountIn).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                  <td><strong>{Number(record.amountOut).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{record.rate}</td>
                  <td>
                    <a
                      href={`https://testnet.arcscan.app/tx/${record.inboundTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-brutalist"
                      style={{ fontSize: '11px', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <span>{record.inboundTxHash.slice(0, 6)}...{record.inboundTxHash.slice(-4)}</span>
                      <ExternalLink size={10} />
                    </a>
                  </td>
                  <td>
                    <a
                      href={`https://testnet.arcscan.app/tx/${record.outboundTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-brutalist"
                      style={{ fontSize: '11px', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <span>{record.outboundTxHash.slice(0, 6)}...{record.outboundTxHash.slice(-4)}</span>
                      <ExternalLink size={10} />
                    </a>
                  </td>
                  <td>
                    <span className="badge-brutalist green" style={{ fontSize: '11px', fontWeight: 800 }}>
                      +{record.pnl} USDC
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
export default SwapHistory
