import React, { useState } from 'react'
import { useBridge, BridgeStep } from '../hooks/useBridge'
import { BRIDGE_CHAINS } from '../lib/bridge-config'
import { X, ArrowRight, RefreshCw, CheckCircle, ShieldAlert, ExternalLink, HelpCircle } from 'lucide-react'

interface BridgeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BridgeModal: React.FC<BridgeModalProps> = ({ isOpen, onClose }) => {
  const {
    sourceChain,
    setSourceChain,
    amount,
    setAmount,
    balances,
    status,
    currentStep,
    errorMessage,
    txHashes,
    timeRemaining,
    startBridge,
    retryBridge,
  } = useBridge()

  const [inputAmount, setInputAmount] = useState('10')

  if (!isOpen) return null

  const selectedSourceConfig = BRIDGE_CHAINS[sourceChain]
  const sourceBalance = balances[sourceChain as keyof typeof balances]

  const handleStartBridge = () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return
    startBridge(inputAmount)
  }

  const handleRetry = () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return
    retryBridge(inputAmount)
  }

  // Visual status details per CCTP step
  const renderStepRow = (step: BridgeStep, label: string, desc: string, hashKey: string, chainConfig?: typeof BRIDGE_CHAINS[keyof typeof BRIDGE_CHAINS]) => {
    const stepsOrder: BridgeStep[] = ['approve', 'burn', 'attest', 'mint', 'complete']
    const currentIndex = stepsOrder.indexOf(currentStep)
    const thisIndex = stepsOrder.indexOf(step)
    
    let stepStatus: 'pending' | 'running' | 'success' | 'error' = 'pending'
    
    if (status === 'error' && currentStep === step) {
      stepStatus = 'error'
    } else if (status === 'loading' && currentStep === step) {
      stepStatus = 'running'
    } else if (thisIndex < currentIndex || status === 'success') {
      stepStatus = 'success'
    }

    const txHash = txHashes[hashKey]
    const explorerBaseUrl = chainConfig?.explorerUrl || selectedSourceConfig.explorerUrl

    return (
      <div className={`border p-3 font-mono text-xs flex justify-between items-start gap-4 ${
        stepStatus === 'running' ? 'border-accent-pink bg-zinc-900/60' :
        stepStatus === 'success' ? 'border-zinc-800 bg-zinc-950/20' :
        stepStatus === 'error' ? 'border-red-600 bg-red-950/20' :
        'border-zinc-900 bg-black/40 text-zinc-600'
      }`}>
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wider flex items-center gap-1.5">
            {stepStatus === 'success' && <span className="text-accent-green">✓</span>}
            {stepStatus === 'running' && <span className="inline-block animate-pulse text-accent-pink">●</span>}
            {stepStatus === 'error' && <span className="text-red-500">✗</span>}
            {stepStatus === 'pending' && <span className="text-zinc-700">○</span>}
            <span className={stepStatus === 'pending' ? 'text-zinc-600' : 'text-zinc-200'}>
              {label}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-snug">{desc}</p>
          
          {txHash && (
            <a
              href={`${explorerBaseUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[9px] text-accent-pink underline hover:text-rose-400 inline-flex items-center gap-0.5 mt-1"
            >
              Tx: {txHash.slice(0, 10)}... {txHash.slice(-8)} <ExternalLink size={8} />
            </a>
          )}
        </div>

        <div>
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
            stepStatus === 'success' ? 'bg-emerald-950/30 border-accent-green text-accent-green' :
            stepStatus === 'running' ? 'bg-rose-950/30 border-accent-pink text-accent-pink' :
            stepStatus === 'error' ? 'bg-red-950 border-red-500 text-red-400' :
            'bg-zinc-900 border-zinc-800 text-zinc-600'
          }`}>
            {stepStatus}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="brutalist-card bg-dark-card border-2 border-black w-full max-w-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black p-4 bg-zinc-950">
          <div className="flex items-center gap-2">
            <span className="badge-brutalist pink animate-pulse">CCTP V2</span>
            <h3 className="text-md font-bold uppercase tracking-wider text-white">Cross-Chain USDC Bridge</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {status === 'idle' ? (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Bridge USDC from Ethereum Sepolia or Base Sepolia to Arc Testnet using Circle's native burn-and-mint protocol (CCTP). Funds arrive with zero slippage.
              </p>

              {/* Source Chain Selector */}
              <div>
                <label className="block text-xs font-mono uppercase mb-1 text-zinc-400">Select Source Chain</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSourceChain('ethereum_sepolia')}
                    className={`p-3 font-mono text-xs text-left border-2 uppercase font-bold flex flex-col justify-between ${
                      sourceChain === 'ethereum_sepolia'
                        ? 'bg-zinc-900 border-accent-pink text-white'
                        : 'bg-black border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span>Ethereum Sepolia</span>
                    <span className="text-[10px] font-normal text-zinc-500 mt-2">
                      Balance: ${parseFloat(balances.ethereum_sepolia).toFixed(2)} USDC
                    </span>
                  </button>

                  <button
                    onClick={() => setSourceChain('base_sepolia')}
                    className={`p-3 font-mono text-xs text-left border-2 uppercase font-bold flex flex-col justify-between ${
                      sourceChain === 'base_sepolia'
                        ? 'bg-zinc-900 border-accent-pink text-white'
                        : 'bg-black border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span>Base Sepolia</span>
                    <span className="text-[10px] font-normal text-zinc-500 mt-2">
                      Balance: ${parseFloat(balances.base_sepolia).toFixed(2)} USDC
                    </span>
                  </button>
                </div>
              </div>

              {/* Destination (Locked) */}
              <div className="border border-dashed border-zinc-800 p-3 bg-zinc-950/60 font-mono text-xs flex justify-between items-center">
                <div>
                  <span className="text-zinc-500">Destination Blockchain</span>
                  <div className="font-bold text-white mt-0.5">ARC TESTNET</div>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500">Bridging Mode</span>
                  <div className="font-bold text-accent-green mt-0.5">CCTP NATIVE MINT</div>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-mono uppercase mb-1 text-zinc-400">USDC Amount to Bridge</label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="w-full bg-black border-2 border-black p-3 font-mono text-white text-sm"
                    placeholder="10.00"
                  />
                  <span className="absolute right-4 top-3.5 font-mono text-zinc-500 text-xs font-bold">USDC</span>
                </div>
                {parseFloat(inputAmount) > parseFloat(sourceBalance) && (
                  <p className="text-[10px] text-red-400 font-mono mt-1">
                    ⚠️ Amount exceeds source chain USDC balance (${parseFloat(sourceBalance).toFixed(2)})
                  </p>
                )}
              </div>

              {/* Estimate Details */}
              <div className="bg-zinc-950 p-4 border border-black space-y-2 font-mono text-[10px] text-zinc-500">
                <div className="flex justify-between">
                  <span>Standard Confirmation Time:</span>
                  <span className="text-zinc-300 font-bold">~30 seconds (Testnet)</span>
                </div>
                <div className="flex justify-between">
                  <span>CCTP Fee:</span>
                  <span className="text-accent-green font-bold">Free (Circle sponsored)</span>
                </div>
                <div className="flex justify-between">
                  <span>Source Gas Fee:</span>
                  <span className="text-zinc-300 font-bold">~0.002 ETH</span>
                </div>
              </div>

              <button
                onClick={handleStartBridge}
                disabled={parseFloat(inputAmount) <= 0 || parseFloat(inputAmount) > parseFloat(sourceBalance)}
                className="w-full bg-accent-pink text-white uppercase font-bold text-sm py-3 border-2 border-black hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                Initiate CCTP Bridge Transfer
              </button>
            </div>
          ) : (
            // Bridging in progress
            <div className="space-y-4">
              <div className="flex items-center justify-between border border-zinc-800 p-4 bg-zinc-950 font-mono text-xs">
                <div>
                  <span className="text-zinc-500">Bridging Amount</span>
                  <div className="font-bold text-white mt-0.5">{inputAmount} USDC</div>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500">Estimated remaining time</span>
                  <div className="font-bold text-accent-pink mt-0.5 flex items-center gap-1 justify-end">
                    {status === 'success' ? (
                      <span className="text-accent-green">Complete</span>
                    ) : (
                      <>
                        <RefreshCw size={11} className="spin" />
                        <span>{timeRemaining}s</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-950/40 border border-red-500 text-red-200 px-4 py-3 text-xs uppercase font-mono space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-red-500" />
                    <span>Bridge Process Interrupted</span>
                  </div>
                  <p className="normal-case text-zinc-300">{errorMessage}</p>
                  <button
                    onClick={handleRetry}
                    className="w-full bg-red-900 border border-red-500 text-white font-bold py-1.5 px-3 uppercase text-[10px] hover:bg-red-800 transition-colors"
                  >
                    Retry Failed Step
                  </button>
                </div>
              )}

              {/* Progress Steps list */}
              <div className="space-y-3">
                {renderStepRow('approve', '1. Approve USDC Allowance', 'Authorize CCTP TokenMessenger to spend your USDC.', 'approve')}
                {renderStepRow('burn', '2. Burn USDC on Source Chain', 'USDC is burned. The transmitter registers the transaction.', 'burn')}
                {renderStepRow('attest', '3. Fetch Circle Attestation', 'Poll Attestation API for Circle verification signature.', 'attest')}
                {renderStepRow('mint', '4. Mint USDC on Arc', 'Claim the USDC to credit your Arc Testnet account.', 'mint', BRIDGE_CHAINS.arc_testnet)}
              </div>

              {status === 'success' && (
                <div className="border border-accent-green bg-emerald-950/10 p-4 font-mono text-xs text-center space-y-3">
                  <div className="font-bold text-accent-green flex items-center justify-center gap-1.5">
                    <CheckCircle size={16} />
                    <span>BRIDGE SUCCESSFUL!</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    USDC has successfully been minted on Arc Testnet.
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-accent-green text-black uppercase font-bold text-[10px] py-1.5 px-6 border border-black hover:bg-emerald-400 transition-colors"
                  >
                    Close & Check Balances
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
