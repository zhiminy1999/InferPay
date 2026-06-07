'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Sparkles, Lock, EyeOff, Eye, AlertTriangle, Play, ExternalLink } from 'lucide-react'
import { useAgentEscrow } from '@/hooks/useAgentEscrow'

interface SpendingBudgetProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function SpendingBudget({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: SpendingBudgetProps) {
  // Local States
  const [pocketMoney, setPocketMoney] = useState<number>(50)
  const [safePeriod, setSafePeriod] = useState<string>('12h')
  const [whitelistServices, setWhitelistServices] = useState({
    openai: true,
    together: true,
    huggingface: false,
    anthropic: true
  })
  
  const [piggyBankStatus, setPiggyBankStatus] = useState<'INACTIVE' | 'ACTIVE' | 'SWEPT'>('INACTIVE')
  const [piggyBankAddress, setPiggyBankAddress] = useState<string>('')
  const [ephemeralPrivateKey, setEphemeralPrivateKey] = useState<string>('')
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false)
  const [piggyBankSpent, setPiggyBankSpent] = useState<number>(0)
  const [showOverspentWarning, setShowOverspentWarning] = useState(false)

  // Real AgentEscrow contract integration hook
  const {
    isEscrowLoading,
    txHash,
    txStatus,
    errorMsg,
    ephemeralUsdcBal,
    ephemeralGasBal,
    createSession,
    executeSpend,
    sweepSession,
    updateEphemeralBalances
  } = useAgentEscrow({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  // Synchronize balances if connected and session is active
  useEffect(() => {
    if (isConnected && piggyBankStatus === 'ACTIVE' && piggyBankAddress) {
      const interval = setInterval(() => {
        updateEphemeralBalances(piggyBankAddress as `0x${string}`)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isConnected, piggyBankStatus, piggyBankAddress])

  const handleCreateEphemeral = async () => {
    setShowOverspentWarning(false)

    if (isConnected && walletClient && address) {
      // Real On-chain mode
      try {
        const keypair = await createSession(pocketMoney, safePeriod, whitelistServices)
        if (keypair) {
          setPiggyBankAddress(keypair.address)
          setEphemeralPrivateKey(keypair.privateKey)
          setPiggyBankStatus('ACTIVE')
          setPiggyBankSpent(0)
          setShowPrivateKey(false)
        }
      } catch (err) {
        console.error("Session activation failed:", err)
      }
    } else {
      // Demo Mode
      addActivity('Setting up AI budget (Demo)', 'Creating a separate simulated spending account.', '🔑', 'info')
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
      const mockPrivateKey = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
      
      setPiggyBankAddress(mockAddress)
      setEphemeralPrivateKey(mockPrivateKey)
      setPiggyBankStatus('ACTIVE')
      setPiggyBankSpent(0)
      setShowPrivateKey(false)
      
      addActivity('AI budget active (Demo)', `Your AI can spend up to $${pocketMoney} for the next ${safePeriod}.`, '🤖', 'success')
    }
  }

  const handleExecuteSpend = async () => {
    setShowOverspentWarning(false)
    
    // Check local limit first
    if (piggyBankSpent + 5 > pocketMoney) {
      setShowOverspentWarning(true)
      addActivity('Budget limit reached', `Your AI tried to spend more than its $${pocketMoney} limit.`, '⚠️', 'danger')
      return
    }

    if (isConnected && ephemeralPrivateKey && piggyBankAddress) {
      // Real On-chain mode
      try {
        const hash = await executeSpend(ephemeralPrivateKey as `0x${string}`, 'openai', 5)
        if (hash) {
          setPiggyBankSpent(prev => prev + 5)
        }
      } catch (err) {
        console.error("Spend execution failed:", err)
      }
    } else {
      // Demo Mode
      setPiggyBankSpent(prev => prev + 5)
      addActivity('AI made a purchase (Demo)', 'Used $5 from its budget to pay for an OpenAI task.', '💸', 'success')
    }
  }

  const handleSweepEscrow = async () => {
    if (isConnected && piggyBankAddress) {
      // Real On-chain mode
      try {
        const hash = await sweepSession(piggyBankAddress as `0x${string}`)
        if (hash) {
          setPiggyBankStatus('SWEPT')
          setEphemeralPrivateKey('')
          setShowPrivateKey(false)
        }
      } catch (err) {
        console.error("Sweep failed:", err)
      }
    } else {
      // Demo Mode
      const remainder = pocketMoney - piggyBankSpent
      setPiggyBankStatus('SWEPT')
      setEphemeralPrivateKey('')
      setShowPrivateKey(false)
      addActivity('Funds returned (Demo)', `$${remainder} was safely returned to your main account.`, '🛡️', 'success')
    }
  }

  return (
    <div>
      <div className="brutalist-card accent-purple">
        <h3 className="card-title">Give Your AI a <i>Spending Allowance</i></h3>
        <p className="card-desc">Your AI assistant sometimes needs to buy things — like cloud services or software licenses. Instead of giving it access to your full account, set a small, safe budget it can spend on its own.</p>
        
        <div className="brutalist-split">
          <div>
            <div className="brutalist-form-group">
              <label className="brutalist-label">How much can your AI spend? (up to $500)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  value={pocketMoney} 
                  onChange={(e) => setPocketMoney(Number(e.target.value))} 
                  className="slider-brutalist"
                  disabled={piggyBankStatus === 'ACTIVE'}
                />
                <span style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', width: '90px', textAlign: 'right', color: 'var(--accent-coral)' }}>${pocketMoney}</span>
              </div>
            </div>

            <div className="brutalist-form-group">
              <label className="brutalist-label">Return unspent money after</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {['12h', '1d', '7d'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setSafePeriod(time)}
                    className={`btn-brutalist ${safePeriod === time ? 'btn-brutalist-pink' : 'btn-brutalist-muted'}`}
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                    disabled={piggyBankStatus === 'ACTIVE'}
                  >
                    {time === '12h' ? '12 Hours' : time === '1d' ? '1 Day' : '1 Week'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="brutalist-form-group">
              <label className="brutalist-label">Approved services (your AI can only pay these)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={whitelistServices.openai}
                    onChange={(e) => setWhitelistServices({...whitelistServices, openai: e.target.checked})}
                    style={{ width: '16px', height: '16px' }}
                    disabled={piggyBankStatus === 'ACTIVE'}
                  />
                  <span>OpenAI (ChatGPT)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={whitelistServices.together}
                    onChange={(e) => setWhitelistServices({...whitelistServices, together: e.target.checked})}
                    style={{ width: '16px', height: '16px' }}
                    disabled={piggyBankStatus === 'ACTIVE'}
                  />
                  <span>Together AI (Computing Power)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={whitelistServices.huggingface}
                    onChange={(e) => setWhitelistServices({...whitelistServices, huggingface: e.target.checked})}
                    style={{ width: '16px', height: '16px' }}
                    disabled={piggyBankStatus === 'ACTIVE'}
                  />
                  <span>Hugging Face (AI Models)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="bracket-button-wrap">
              <button 
                className="btn-brutalist btn-brutalist-pink" 
                onClick={handleCreateEphemeral} 
                disabled={isEscrowLoading || piggyBankStatus === 'ACTIVE'}
              >
                {isEscrowLoading ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                <span>Activate Spending Budget</span>
              </button>
            </div>

            {piggyBankStatus === 'ACTIVE' && (
              <button 
                className="btn-brutalist btn-brutalist-muted" 
                onClick={handleSweepEscrow}
                disabled={isEscrowLoading}
              >
                {isEscrowLoading ? <RefreshCw size={14} className="spin" /> : <RefreshCw size={14} />}
                <span>Get Back Unspent Funds (${pocketMoney - piggyBankSpent})</span>
              </button>
            )}
          </div>

          {isConnected && (
            <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 550 }}>
              💡 Estimated transaction fee: <strong>~0.0004 USDC</strong> (USDC native gas on Arc)
            </div>
          )}
        </div>
      </div>

      {/* Transaction status and Arcscan link feedback */}
      {isConnected && txStatus !== 'idle' && (
        <div className="brutalist-card accent-yellow" style={{ padding: '12px var(--space-4)', animation: 'slideDown 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span className={`status-dot ${txStatus === 'pending' ? 'yellow-blink' : txStatus === 'success' ? 'green' : 'red'}`} />
              <strong>
                {txStatus === 'pending' && 'Transaction Pending...'}
                {txStatus === 'success' && 'Transaction Confirmed!'}
                {txStatus === 'error' && 'Transaction Failed'}
              </strong>
              {errorMsg && <span style={{ color: 'var(--accent-pink)', marginLeft: '10px' }}>({errorMsg})</span>}
            </div>

            {txHash && (
              <a 
                href={`https://testnet.arcscan.app/tx/${txHash}`} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--accent-coral)',
                  textDecoration: 'underline'
                }}
              >
                <span>View on Arcscan</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Simulated/Real AI flow visualizer */}
      {piggyBankStatus !== 'INACTIVE' && (
        <div className="brutalist-card accent-cyan" style={{ animation: 'slideDown 0.3s' }}>
          <h3 className="card-title">How Your Money Flows</h3>
          
          <div className="non-tech-flow-wrap">
            <div className={`flow-node-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}>
              🏢 Your Company Account
            </div>
            
            <div className={`flow-connector-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}></div>
            
            <div className={`flow-node-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}>
              🐷 AI Spending Allowance
              <div style={{ fontSize: '9px', fontWeight: 'normal', color: 'var(--text-muted)' }}>Budget: ${pocketMoney}</div>
            </div>

            <div className={`flow-connector-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}></div>

            <div className={`flow-node-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}>
              🤖 AI Assistant
            </div>

            <div className="flow-connector-brutalist"></div>

            <div className="flow-node-brutalist">
              🔒 Approved Service
            </div>
          </div>

          {/* Ephemeral Private Key and Balances Viewer */}
          {piggyBankStatus === 'ACTIVE' && (
            <div style={{
              backgroundColor: 'var(--bg-inner)',
              border: '1px solid var(--border)',
              padding: '12px var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700 }}>
                    <Lock size={14} style={{ color: 'var(--accent-coral)' }} />
                    <span>AI’s Ephemeral Account: <code style={{ fontSize: '11px', backgroundColor: '#e2dfd9', padding: '2px 6px', borderRadius: '4px' }}>{piggyBankAddress.slice(0, 10)}...{piggyBankAddress.slice(-6)}</code></span>
                  </div>
                  {isConnected && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ⛽ Gas Balance: <strong>{ephemeralGasBal} USDC</strong> (native gas) · USDC Token Balance: <strong>{ephemeralUsdcBal} USDC</strong>
                    </div>
                  )}
                </div>
                
                <button 
                  className="btn-brutalist btn-brutalist-muted" 
                  onClick={() => setShowPrivateKey(prev => !prev)}
                  style={{ padding: '4px 10px', fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {showPrivateKey ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showPrivateKey ? 'Hide Private Key' : 'Reveal Private Key'}</span>
                </button>
              </div>
              
              {showPrivateKey && (
                <div style={{
                  marginTop: '6px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fef3c7',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  wordBreak: 'break-all',
                  color: '#92400e',
                  lineHeight: '1.4'
                }}>
                  <strong>🔒 Session Private Key:</strong> {ephemeralPrivateKey}
                  <div style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', fontFamily: 'var(--font-sans)', fontWeight: 550 }}>
                    ⚠️ This private key is stored ONLY in memory. It will be destroyed immediately when the session is swept. Do not share it.
                  </div>
                </div>
              )}
            </div>
          )}

          {showOverspentWarning && (
            <div style={{
              backgroundColor: '#fff1f2',
              color: '#9f1239',
              padding: '12px',
              border: '1px solid #ffe4e6',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '15px',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertTriangle size={18} />
              <span>⚠️ Budget limit reached! Your AI tried to make a purchase but the spending cap stopped it. You can get your remaining funds back or increase the budget.</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              AI has spent: <span style={{ color: 'var(--accent-coral)', fontSize: '20px', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>${piggyBankSpent}</span> out of ${pocketMoney} budget
            </div>
            
            {piggyBankStatus === 'ACTIVE' && (
              <button 
                className="btn-brutalist btn-brutalist-cyan" 
                onClick={handleExecuteSpend}
                disabled={isEscrowLoading}
              >
                {isEscrowLoading ? <RefreshCw size={12} className="spin" /> : <Play size={12} />}
                <span>Simulate: AI Buys a $5 Service</span>
              </button>
            )}

            {piggyBankStatus === 'SWEPT' && (
              <div className="badge-brutalist green" style={{ padding: '8px 15px', fontSize: '12px' }}>
                 All done — remaining funds safely returned to your account
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default SpendingBudget
