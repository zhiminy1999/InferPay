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
    <div className="space-y-6">
      {/* Nanopayments Balance Panel */}
      <div className="brutalist-card p-6 bg-dark-card border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {isLowBalance && (
          <div className="absolute top-0 right-0 left-0 bg-red-600 text-white text-xs uppercase font-mono py-1 px-4 text-center font-bold animate-pulse">
            ⚠️ Low Nanopayments Balance! Please Deposit USDC to Prevent Inference Interruption.
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-3 md:mt-0 gap-4">
          <div>
            <h3 className="text-zinc-500 text-xs uppercase font-mono tracking-wider">Gateway Nanopayments Balance</h3>
            <div className="text-3xl font-black font-mono tracking-tighter mt-1 text-white">
              {parseFloat(gatewayBalanceFormatted).toFixed(4)}{' '}
              <span className="text-sm font-bold text-accent-green">USDC</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 border-l border-zinc-800 pl-6">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Total Spend</div>
              <div className="text-md font-bold font-mono text-zinc-300">${spendRate}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">API Requests</div>
              <div className="text-md font-bold font-mono text-zinc-300">{inferenceCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Gas Saved</div>
              <div className="text-md font-bold font-mono text-accent-green">${gasSaved}</div>
            </div>
          </div>
        </div>
      </div>

      {/* x402 Live Simulation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="brutalist-card p-6 bg-dark-card border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold uppercase mb-2 tracking-wide text-zinc-300">Nanopayed AI Inference Simulator</h3>
            <p className="text-xs text-zinc-500 font-mono mb-4">
              Trigger sub-cent pay-per-request calls using native x402 HTTP headers.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-mono uppercase mb-1 text-zinc-400">Select Inference Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-black border border-black p-2 font-mono text-white text-sm"
                >
                  <option value="llm_llama">Llama 3.1 8B Sentiment Analysis ($0.0010/call)</option>
                  <option value="vision_gpu">NVIDIA GPU Vision Payout Matcher ($0.0010/call)</option>
                  <option value="stable_fx">Circle StableFX FX Quote Tracker ($0.0010/call)</option>
                </select>
              </div>

              {lastResponse && (
                <div className="border border-black p-3 bg-zinc-900 font-mono text-xs">
                  <div className="text-accent-green uppercase font-bold mb-1">Inference Response:</div>
                  <div className="text-white italic">"{lastResponse.result}"</div>
                  <div className="text-[10px] text-zinc-500 mt-2 flex justify-between">
                    <span>Billed: {lastResponse.billed} USDC</span>
                    <span>Status: {lastResponse.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleTriggerInference}
            disabled={isLoading}
            className="w-full bg-accent-green text-black uppercase font-bold text-sm py-3 border-2 border-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing Gasless Nanopayment...' : 'Call API ($0.0010 USDC)'}
          </button>
        </div>

        {/* Header Negotiation Logs */}
        <div className="brutalist-card p-6 bg-zinc-950 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xs font-bold uppercase font-mono mb-2 tracking-wider text-zinc-400">x402 Protocol Headers Negotiation Logs</h3>
          <div className="bg-black border border-zinc-900 p-4 h-64 overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1">
            {executionLogs.map((log, i) => (
              <div key={i} className={log.includes('PAYMENT-SIGNATURE') ? 'text-zinc-300' : log.includes('Success') || log.includes('200') ? 'text-accent-green' : log.includes('402') ? 'text-amber-500' : ''}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlement History */}
      <div className="brutalist-card p-6 bg-dark-card border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-lg font-bold uppercase mb-4 tracking-wider text-zinc-300">Gateway Settlement History</h3>
        {history.length === 0 ? (
          <div className="text-zinc-500 text-xs font-mono py-4 text-center">No transaction logs available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-zinc-800 text-zinc-500 uppercase">
                  <th className="py-2">Type</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Activity Description</th>
                  <th className="py-2">Settlement Mode</th>
                  <th className="py-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40">
                    <td className="py-3 font-bold">
                      <span className={`px-2 py-0.5 text-[10px] uppercase border ${
                        item.type === 'deposit' ? 'bg-emerald-950/50 border-accent-green text-accent-green' :
                        item.type === 'withdrawal' ? 'bg-zinc-800 border-zinc-600 text-zinc-300' :
                        'bg-blue-950/50 border-blue-500 text-blue-400'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 text-white font-bold">{item.amount} USDC</td>
                    <td className="py-3 text-zinc-400">{item.description || (item.type === 'deposit' ? 'Vault Funding Transfer' : 'Withdrawal Cashout')}</td>
                    <td className="py-3">
                      <span className="text-zinc-500">
                        {item.type === 'spend' ? '⚡ Gasless Offchain' : '⛓️ On-Chain (1s Finality)'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-[10px] text-zinc-500 block">
                        {item.txHash ? `Tx: ${item.txHash.slice(0, 10)}...` : item.payoutHash ? `Batch: ${item.payoutHash.slice(0, 10)}...` : ''}
                      </span>
                      <span className="text-[9px] text-zinc-600 block">
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
