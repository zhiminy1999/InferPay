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
      <div style={{
        border: '1px solid',
        borderColor: stepStatus === 'running' ? 'var(--accent-coral)' :
                     stepStatus === 'success' ? 'var(--accent-green)' :
                     stepStatus === 'error' ? '#f43f5e' :
                     'var(--border)',
        backgroundColor: stepStatus === 'running' ? '#fff1f2' :
                         stepStatus === 'success' ? '#f0fdf4' :
                         stepStatus === 'error' ? '#fef2f2' :
                         'var(--bg-inner)',
        color: stepStatus === 'pending' ? 'var(--text-light)' : 'var(--text-main)',
        padding: '12px',
        fontSize: '12px',
        fontFamily: 'monospace',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {stepStatus === 'success' && <span style={{ color: 'var(--accent-green)' }}>✓</span>}
            {stepStatus === 'running' && <span className="inline-block animate-pulse" style={{ color: 'var(--accent-coral)' }}>●</span>}
            {stepStatus === 'error' && <span style={{ color: '#f43f5e' }}>✗</span>}
            {stepStatus === 'pending' && <span style={{ color: 'var(--text-light)' }}>○</span>}
            <span style={{ color: stepStatus === 'pending' ? 'var(--text-light)' : 'var(--text-main)' }}>
              {label}
            </span>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-light)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
          
          {txHash && (
            <a
              href={`${explorerBaseUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '9px',
                color: 'var(--accent-coral)',
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                marginTop: '4px'
              }}
            >
              Tx: {txHash.slice(0, 10)}... {txHash.slice(-8)} <ExternalLink size={8} />
            </a>
          )}
        </div>

        <div>
          <span style={{
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            border: '1px solid',
            backgroundColor: stepStatus === 'success' ? '#dcfce7' :
                             stepStatus === 'running' ? '#ffe4e6' :
                             stepStatus === 'error' ? '#fee2e2' :
                             'var(--bg-inner)',
            borderColor: stepStatus === 'success' ? 'var(--accent-green)' :
                         stepStatus === 'running' ? 'var(--accent-coral)' :
                         stepStatus === 'error' ? '#f43f5e' :
                         'var(--border)',
            color: stepStatus === 'success' ? '#15803d' :
                   stepStatus === 'running' ? '#b91c1c' :
                   stepStatus === 'error' ? '#b91c1c' :
                   'var(--text-light)',
          }}>
            {stepStatus}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container animate-slideDown" style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="badge-brutalist pink animate-pulse">CCTP V2</span>
            <span>Cross-Chain <i>USDC Bridge</i></span>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {status === 'idle' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Bridge USDC from Ethereum Sepolia or Base Sepolia to Arc Testnet using Circle's native burn-and-mint protocol (CCTP). Funds arrive with zero slippage.
              </p>

              {/* Source Chain Selector */}
              <div>
                <label className="brutalist-label">Select Source Chain</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <button
                    onClick={() => setSourceChain('ethereum_sepolia')}
                    className="btn-brutalist"
                    style={{
                      height: 'auto',
                      padding: '12px',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      backgroundColor: sourceChain === 'ethereum_sepolia' ? 'var(--bg-card)' : 'var(--bg-inner)',
                      borderColor: sourceChain === 'ethereum_sepolia' ? 'var(--accent-coral)' : 'var(--border)',
                      color: sourceChain === 'ethereum_sepolia' ? 'var(--text-main)' : 'var(--text-light)',
                      boxShadow: sourceChain === 'ethereum_sepolia' ? 'var(--shadow-hover)' : 'none',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>Ethereum Sepolia</span>
                    <span style={{ fontSize: '10px', marginTop: '6px', opacity: 0.8 }}>
                      Balance: ${parseFloat(balances.ethereum_sepolia).toFixed(2)} USDC
                    </span>
                  </button>

                  <button
                    onClick={() => setSourceChain('base_sepolia')}
                    className="btn-brutalist"
                    style={{
                      height: 'auto',
                      padding: '12px',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      backgroundColor: sourceChain === 'base_sepolia' ? 'var(--bg-card)' : 'var(--bg-inner)',
                      borderColor: sourceChain === 'base_sepolia' ? 'var(--accent-coral)' : 'var(--border)',
                      color: sourceChain === 'base_sepolia' ? 'var(--text-main)' : 'var(--text-light)',
                      boxShadow: sourceChain === 'base_sepolia' ? 'var(--shadow-hover)' : 'none',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>Base Sepolia</span>
                    <span style={{ fontSize: '10px', marginTop: '6px', opacity: 0.8 }}>
                      Balance: ${parseFloat(balances.base_sepolia).toFixed(2)} USDC
                    </span>
                  </button>
                </div>
              </div>

              {/* Destination (Locked) */}
              <div style={{
                border: '1px dashed var(--border)',
                padding: '12px',
                backgroundColor: 'var(--bg-inner)',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ color: 'var(--text-light)' }}>Destination Blockchain</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>ARC TESTNET</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-light)' }}>Bridging Mode</span>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>CCTP NATIVE MINT</div>
                </div>
              </div>

              {/* Amount input */}
              <div className="brutalist-form-group">
                <label className="brutalist-label">USDC Amount to Bridge</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="brutalist-input"
                    placeholder="10.00"
                    style={{ paddingRight: '60px' }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text-light)'
                  }}>
                    USDC
                  </span>
                </div>
                {parseFloat(inputAmount) > parseFloat(sourceBalance) && (
                  <p style={{ fontSize: '10px', color: '#f43f5e', marginTop: '4px' }}>
                    ⚠️ Amount exceeds source chain USDC balance (${parseFloat(sourceBalance).toFixed(2)})
                  </p>
                )}
              </div>

              {/* Estimate Details */}
              <div style={{
                backgroundColor: 'var(--bg-inner)',
                padding: '12px 15px',
                border: '1px solid var(--border)',
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Standard Confirmation Time:</span>
                  <strong style={{ color: 'var(--text-main)' }}>~30 seconds (Testnet)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CCTP Fee:</span>
                  <strong style={{ color: 'var(--accent-green)' }}>Free (Circle sponsored)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Source Gas Fee:</span>
                  <strong style={{ color: 'var(--text-main)' }}>~0.002 ETH</strong>
                </div>
              </div>

              <button
                onClick={handleStartBridge}
                disabled={parseFloat(inputAmount) <= 0 || parseFloat(inputAmount) > parseFloat(sourceBalance)}
                className="btn-brutalist btn-brutalist-pink"
                style={{ width: '100%', padding: '12px', height: '45px', justifyContent: 'center' }}
              >
                Initiate CCTP Bridge Transfer
              </button>
            </div>
          ) : (
            // Bridging in progress
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border)',
                padding: '15px',
                backgroundColor: 'var(--bg-inner)',
                fontSize: '13px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-light)' }}>Bridging Amount</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{inputAmount} USDC</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-light)' }}>Estimated remaining time</span>
                  <div style={{ fontWeight: 700, color: 'var(--accent-coral)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                    {status === 'success' ? (
                      <span style={{ color: 'var(--accent-green)' }}>Complete</span>
                    ) : (
                      <>
                        <RefreshCw size={12} className="spin" />
                        <span>{timeRemaining}s</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  color: '#991b1b',
                  padding: '15px',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={16} />
                    <span>Bridge Process Interrupted</span>
                  </div>
                  <p style={{ color: '#7f1d1d', margin: 0 }}>{errorMessage}</p>
                  <button
                    onClick={handleRetry}
                    className="btn-brutalist"
                    style={{
                      backgroundColor: '#ef4444',
                      borderColor: '#dc2626',
                      color: 'white',
                      padding: '8px',
                      fontSize: '11px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Retry Failed Step
                  </button>
                </div>
              )}

              {/* Progress Steps list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {renderStepRow('approve', '1. Approve USDC Allowance', 'Authorize CCTP TokenMessenger to spend your USDC.', 'approve')}
                {renderStepRow('burn', '2. Burn USDC on Source Chain', 'USDC is burned. The transmitter registers the transaction.', 'burn')}
                {renderStepRow('attest', '3. Fetch Circle Attestation', 'Poll Attestation API for Circle verification signature.', 'attest')}
                {renderStepRow('mint', '4. Mint USDC on Arc', 'Claim the USDC to credit your Arc Testnet account.', 'mint', BRIDGE_CHAINS.arc_testnet)}
              </div>

              {status === 'success' && (
                <div style={{
                  border: '1px solid var(--accent-green)',
                  backgroundColor: '#f0fdf4',
                  padding: '20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '15px' }}>
                    <CheckCircle size={18} />
                    <span>BRIDGE SUCCESSFUL!</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    USDC has successfully been minted on Arc Testnet.
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-brutalist btn-brutalist-pink"
                    style={{ padding: '8px 20px', alignSelf: 'center' }}
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
