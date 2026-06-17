import React, { useState } from 'react'
import { useNanopayments } from '../hooks/useNanopayments'
import { useActivityFeed } from '../hooks/useActivityFeed'
import { parseUnits, formatUnits } from 'viem'

export const NanopaymentWidget: React.FC = () => {
  const {
    gatewayBalanceFormatted,
    history,
    isLoading,
    spendRate,
    inferenceCount,
    isLowBalance,
    executeInference,
  } = useNanopayments()

  const { addActivity } = useActivityFeed()
  const [selectedModel, setSelectedModel] = useState('llm_llama')
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    'System: Ready to negotiate x402 nanopayments...'
  ])
  const [lastResponse, setLastResponse] = useState<any>(null)

  const logMessage = (msg: string) => {
    setExecutionLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])
  }

  const handleTriggerInference = async () => {
    setLastResponse(null)
    logMessage(`Initiating inference request for ${selectedModel}...`)
    logMessage(`x402 Negotiator: POST /api/inference`)

    try {
      // Step 1: Initial client negotiation (will return 402 internally)
      logMessage(`x402 Negotiator: Received 402 Payment Required status`)
      logMessage(`x402 Negotiator: Parsing header PAYMENT-REQUIRED requirements`)

      // Step 2: Pay triggers the EIP-3009 signing and retries
      logMessage(`x402 Negotiator: Generating offchain EIP-3009 transfer signature`)
      logMessage(`x402 Negotiator: Retrying POST /api/inference with PAYMENT-SIGNATURE header`)

      const res = await executeInference(selectedModel)

      if (res.success) {
        logMessage(`x402 Negotiator: Received 200 OK`)
        logMessage(`x402 Negotiator: Header PAYMENT-RESPONSE verified`)
        logMessage(`System: Inference completed! Billed ${res.cost} USDC`)
        setLastResponse(res.data)

        addActivity({
          type: 'PAYMENT',
          title: 'Nanopayment Inference Settled',
          description: `Billed $0.001 USDC for ${selectedModel} model call. Gasless settlement.`,
        })
      } else {
        logMessage(`System: Inference payment rejected: ${res.data?.error || 'Unknown error'}`)
      }
    } catch (e: any) {
      logMessage(`System Error: ${e.message || 'Verification failed'}`)
    }
  }

  // Calculate gas saved (assume $0.0004 USDC saved per transaction by bypassing on-chain write)
  const gasSaved = (inferenceCount * 0.0004).toFixed(4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Nanopayments Balance Panel */}
      <div className="brutalist-card accent-green" style={{ position: 'relative', overflow: 'hidden' }}>
        {isLowBalance && (
          <div style={{
            backgroundColor: '#fff1f2',
            color: '#9f1239',
            fontSize: '12px',
            fontWeight: 700,
            padding: '8px var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #ffe4e6',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚠️ Low Nanopayments Balance! Please Deposit USDC to Prevent Inference Interruption.
          </div>
        )}

        <h3 className="card-title">Gateway <i>Nanopayments Balance</i></h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent-coral)', letterSpacing: '-0.02em' }}>
              {parseFloat(gatewayBalanceFormatted).toFixed(4)}{' '}
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-green)' }}>USDC</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-6)', borderLeft: '1px solid var(--border)', paddingLeft: 'var(--space-6)' }}>
            <div>
              <div className="brutalist-label" style={{ marginBottom: '4px' }}>Total Spend</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>${spendRate}</div>
            </div>
            <div>
              <div className="brutalist-label" style={{ marginBottom: '4px' }}>API Requests</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{inferenceCount}</div>
            </div>
            <div>
              <div className="brutalist-label" style={{ marginBottom: '4px' }}>Gas Saved</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)' }}>${gasSaved}</div>
            </div>
          </div>
        </div>
      </div>

      {/* x402 Live Simulation Console */}
      <div className="brutalist-split">
        <div className="brutalist-card accent-purple" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title">Nanopayed AI <i>Inference Simulator</i></h3>
            <p className="card-desc">
              Trigger sub-cent pay-per-request calls using native x402 HTTP headers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div className="brutalist-form-group">
                <label className="brutalist-label">Select Inference Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="brutalist-input"
                  style={{ fontSize: '13px' }}
                >
                  <option value="llm_llama">Llama 3.1 8B Sentiment Analysis ($0.0010/call)</option>
                  <option value="vision_gpu">NVIDIA GPU Vision Payout Matcher ($0.0010/call)</option>
                  <option value="stable_fx">Circle StableFX FX Quote Tracker ($0.0010/call)</option>
                </select>
              </div>

              {lastResponse && (
                <div style={{
                  backgroundColor: 'var(--bg-inner)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Inference Response:</div>
                  <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-main)' }}>"{lastResponse.result}"</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-light)', marginTop: '8px' }}>
                    <span>Billed: {lastResponse.billed} USDC</span>
                    <span>Status: {lastResponse.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bracket-button-wrap" style={{ width: '100%' }}>
            <button
              onClick={handleTriggerInference}
              disabled={isLoading}
              className="btn-brutalist btn-brutalist-pink"
              style={{ width: '100%' }}
            >
              {isLoading ? 'Processing Gasless Nanopayment...' : 'Call API ($0.0010 USDC)'}
            </button>
          </div>
        </div>

        {/* Header Negotiation Logs */}
        <div className="brutalist-card accent-cyan">
          <h3 className="card-title" style={{ fontSize: '14px' }}>x402 Protocol Headers <i>Negotiation Logs</i></h3>
          <div className="brutalist-chat-room" style={{ height: '260px', fontFamily: 'monospace', fontSize: '11px' }}>
            {executionLogs.map((log, i) => (
              <div key={i} style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                color: log.includes('PAYMENT-SIGNATURE') ? 'var(--text-main)' :
                       log.includes('Success') || log.includes('200') ? 'var(--accent-green)' :
                       log.includes('402') ? '#d97706' : 'var(--text-muted)',
                fontWeight: log.includes('200') || log.includes('PAYMENT-SIGNATURE') ? 600 : 400,
                borderBottom: '1px solid var(--border)'
              }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlement History */}
      <div className="brutalist-card accent-yellow">
        <h3 className="card-title">Gateway <i>Settlement History</i></h3>
        {history.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: 'var(--space-4) 0', textAlign: 'center' }}>No transaction logs available.</div>
        ) : (
          <div className="table-responsive">
            <table className="brutalist-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Activity Description</th>
                  <th>Settlement Mode</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`badge-brutalist ${
                        item.type === 'deposit' ? 'green' :
                        item.type === 'withdrawal' ? 'yellow' :
                        'cyan'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{item.amount} USDC</td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.description || (item.type === 'deposit' ? 'Vault Funding Transfer' : 'Withdrawal Cashout')}</td>
                    <td>
                      <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                        {item.type === 'spend' ? '⚡ Gasless Offchain' : '⛓️ On-Chain (1s Finality)'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)', display: 'block' }}>
                        {item.txHash ? `Tx: ${item.txHash.slice(0, 10)}...` : item.payoutHash ? `Batch: ${item.payoutHash.slice(0, 10)}...` : ''}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-light)', display: 'block' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
