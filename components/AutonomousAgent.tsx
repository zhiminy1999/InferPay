'use client'

import React, { useState, useEffect } from 'react'
import { Play, RotateCcw, Shield, Terminal, DollarSign, Brain, Search, HelpCircle } from 'lucide-react'
import { useMarketplace, AIService } from '@/hooks/useMarketplace'
import { useNanopayments } from '@/hooks/useNanopayments'
import { parseUnits } from 'viem'

interface AgentLog {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'header'
}

export const AutonomousAgent: React.FC = () => {
  const { services, payAndRunService } = useMarketplace()
  const { gatewayBalanceFormatted, refreshBalances } = useNanopayments()

  // Agent configuration
  const [capability, setCapability] = useState('coding')
  const [minReputation, setMinReputation] = useState(9.0)
  const [maxBudget, setMaxBudget] = useState(0.04)

  // Simulation state
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [logs, setLogs] = useState<AgentLog[]>([])
  
  // Selected service and execution output
  const [chosenService, setChosenService] = useState<AIService | null>(null)
  const [serviceOutput, setServiceOutput] = useState<string | null>(null)

  const addLog = (message: string, type: AgentLog['type'] = 'info') => {
    const newLog: AgentLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }
    setLogs(prev => [newLog, ...prev])
  }

  const runSimulation = async () => {
    setIsRunning(true)
    setCurrentStep(1)
    setLogs([])
    setChosenService(null)
    setServiceOutput(null)

    addLog('🚀 Initializing Autonomous AI Agent...', 'header')
    addLog(`Configured Policies: Capability [${capability}] | Min Reputation [${minReputation.toFixed(1)}] | Max Budget [$${maxBudget.toFixed(3)}]`, 'info')

    await new Promise(r => setTimeout(r, 1200))

    // Step 1: DISCOVER SERVICES
    addLog('🔍 Step 1: Discovering AI services from registry matching capability criteria...', 'info')
    const candidates = services.filter(s => {
      const search = capability.toLowerCase()
      return s.capability.toLowerCase().includes(search) || 
             s.name.toLowerCase().includes(search) ||
             (s.metadata?.tags && s.metadata.tags.some(t => t.toLowerCase().includes(search)))
    })

    await new Promise(r => setTimeout(r, 1200))

    if (candidates.length === 0) {
      addLog('❌ Discovery failed: No registered services match capability keywords.', 'error')
      setIsRunning(false)
      setCurrentStep(0)
      return
    }

    addLog(`Found ${candidates.length} potential providers in directory registry.`, 'success')
    for (const c of candidates) {
      addLog(` - Found: ${c.name} (Capability: "${c.capability}", Cost: $${c.pricing.toFixed(3)} USDC, Reputation: ${c.reputation.toFixed(1)})`, 'info')
    }

    setCurrentStep(2)
    await new Promise(r => setTimeout(r, 1500))

    // Step 2: EVALUATE TRUST & SELECT PROVIDER
    addLog('🧠 Step 2: Evaluating provider trust and budget thresholds...', 'info')
    
    // Filter candidates by budget & min reputation
    const compliant = candidates.filter(c => c.pricing <= maxBudget && c.reputation >= minReputation)

    if (compliant.length === 0) {
      addLog(`❌ Evaluation failed: Found services but none meet both Budget <= $${maxBudget} and Reputation >= ${minReputation.toFixed(1)}.`, 'error')
      setIsRunning(false)
      setCurrentStep(0)
      return
    }

    // Weight and sort compliant providers: Score = reputation * completionRate
    const sorted = [...compliant].sort((a, b) => {
      const aScore = a.reputation * (a.metadata?.completionRate || 1)
      const bScore = b.reputation * (b.metadata?.completionRate || 1)
      return bScore - aScore
    })

    const selected = sorted[0]
    setChosenService(selected)
    
    addLog(`Selected Best Trust Provider: ${selected.name}`, 'success')
    addLog(` - Cost: $${selected.pricing.toFixed(3)} USDC`, 'info')
    addLog(` - Reputation Score: ${selected.reputation.toFixed(1)}`, 'info')
    addLog(` - Historic Job Completion Rate: ${Math.round((selected.metadata?.completionRate || 0.95) * 100)}%`, 'info')

    setCurrentStep(3)
    await new Promise(r => setTimeout(r, 1500))

    // Step 3: TRIGGER X402 CHALLENGE
    addLog(`⛓️ Step 3: Initializing x402 HTTP challenge handshake with ${selected.name}...`, 'info')
    addLog(` - GET request sent to /api/service/${selected.id}`, 'info')
    addLog(' - Received Response: Status 402 (Payment Required)', 'warning')
    addLog(` - Challenge Headers: [X-402-Price: ${selected.pricing.toFixed(4)}] | [X-402-Payment-Token: USDC]`, 'warning')

    setCurrentStep(4)
    await new Promise(r => setTimeout(r, 1500))

    // Step 4: SOLVE CHALLENGE VIA GATEWAY
    addLog(`💳 Step 4: Resolving x402 payment challenge via Gateway Nanopayments...`, 'info')
    addLog(` - Checking local Gateway Balance: ${gatewayBalanceFormatted} USDC`, 'info')

    const priceUnits = parseUnits(selected.pricing.toFixed(4), 6)
    const currentBalUnits = parseUnits(gatewayBalanceFormatted, 6)

    if (currentBalUnits < priceUnits) {
      addLog(`❌ Payment failed: Insufficient Gateway balance. Please deposit funds on the Nanopayments tab.`, 'error')
      setIsRunning(false)
      setCurrentStep(0)
      return
    }

    addLog(' - Executing nanopayment allocation and signing EIP-712 challenge receipt...', 'info')
    
    const settle = await payAndRunService(selected)
    
    if (!settle.success || !settle.proof) {
      addLog(`❌ Challenge settlement failed: ${settle.error}`, 'error')
      setIsRunning(false)
      setCurrentStep(0)
      return
    }

    addLog(' - Gateway settled. Deducted micropayment successfully.', 'success')
    addLog(` - Generated payment receipt: ${settle.proof['X-402-Receipt']}`, 'success')

    setCurrentStep(5)
    await new Promise(r => setTimeout(r, 1500))

    // Step 5: RECEIVE SERVICE RESULT
    addLog('🚀 Step 5: Resubmitting request with payment receipt header...', 'info')
    addLog(` - Attached: [X-402-Receipt: ${settle.proof['X-402-Receipt']}]`, 'info')
    addLog(' - Provider status: 200 OK (Payment Verified)', 'success')
    
    if (settle.result) {
      setServiceOutput(settle.result)
      addLog('Result Payload: ' + settle.result, 'success')
    }

    addLog('✅ Autonomous task execution complete!', 'success')
    setIsRunning(false)
    setCurrentStep(0)
    refreshBalances()
  }

  const getStepStyle = (stepNum: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 12px',
      border: '1px solid var(--border)',
      backgroundColor: 'var(--bg-inner)',
      borderRadius: 'var(--radius-sm)',
      transition: 'all 0.3s ease',
      opacity: 0.5
    }
    if (currentStep === stepNum) {
      return {
        ...base,
        borderColor: 'var(--accent-coral)',
        backgroundColor: 'rgba(255, 93, 75, 0.04)',
        opacity: 1,
        boxShadow: '0 0 12px rgba(255, 93, 75, 0.1)'
      }
    }
    if (currentStep > stepNum) {
      return {
        ...base,
        borderColor: 'var(--accent-green)',
        backgroundColor: 'rgba(52, 211, 153, 0.04)',
        opacity: 0.9
      }
    }
    return base
  }

  const getStepNumStyle = (stepNum: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-inner)',
      fontSize: '10px',
      fontWeight: 700,
      color: 'var(--text-light)',
      border: '1px solid var(--border)',
      flexShrink: 0
    }
    if (currentStep === stepNum) {
      return { ...base, backgroundColor: 'var(--accent-coral)', color: '#ffffff', borderColor: 'var(--accent-coral)' }
    }
    if (currentStep > stepNum) {
      return { ...base, backgroundColor: 'var(--accent-green)', color: '#ffffff', borderColor: 'var(--accent-green)' }
    }
    return base
  }

  const getLogStyle = (type: AgentLog['type']): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '6px 8px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid transparent',
      fontSize: '11px',
      lineHeight: '1.4'
    }
    switch (type) {
      case 'header':
        return { ...base, backgroundColor: 'var(--bg-inner)', borderColor: 'var(--border)', color: 'var(--accent-coral)', fontWeight: 700, fontSize: '12px' }
      case 'success':
        return { ...base, backgroundColor: '#f0fdf4', borderColor: '#dcfce7', color: '#166534' }
      case 'warning':
        return { ...base, backgroundColor: '#fffbeb', borderColor: '#fef3c7', color: '#92400e' }
      case 'error':
        return { ...base, backgroundColor: '#fff1f2', borderColor: '#ffe4e6', color: '#9f1239', fontWeight: 600 }
      default:
        return { ...base, color: 'var(--text-muted)' }
    }
  }

  return (
    <div className="brutalist-card accent-cyan">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <Brain style={{ color: 'var(--accent-coral)' }} size={18} />
        <h3 className="card-title" style={{ marginBottom: 0 }}>Autonomous Agent <i>Simulator (x402 Protocol)</i></h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-5)' }}>
        {/* Left pane: configs */}
        <div style={{
          backgroundColor: 'var(--bg-inner)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-main)' }}>Agent <i>Policies</i></h4>

            <div className="brutalist-form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="brutalist-label">Target Capability / Service</label>
              <select 
                className="brutalist-input"
                style={{ fontSize: '12px' }}
                value={capability} 
                onChange={(e) => setCapability(e.target.value)}
                disabled={isRunning}
              >
                <option value="coding">Code Generation & Dev</option>
                <option value="vision">Vision OCR & Image AI</option>
                <option value="search">RAG Search & Web AI</option>
                <option value="audio">Audio Speech & Voice AI</option>
              </select>
            </div>

            <div className="brutalist-form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="brutalist-label">Minimum Reputation: {minReputation.toFixed(1)}</label>
              <input 
                type="range" 
                min="8.0" 
                max="9.9" 
                step="0.1"
                value={minReputation}
                onChange={(e) => setMinReputation(parseFloat(e.target.value))}
                className="slider-brutalist"
                disabled={isRunning}
              />
            </div>

            <div className="brutalist-form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="brutalist-label">Max Cost per request: ${maxBudget.toFixed(3)}</label>
              <input 
                type="range" 
                min="0.01" 
                max="0.10" 
                step="0.01"
                value={maxBudget}
                onChange={(e) => setMaxBudget(parseFloat(e.target.value))}
                className="slider-brutalist"
                disabled={isRunning}
              />
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-4)'
            }}>
              <div className="brutalist-label" style={{ marginBottom: '2px' }}>Agent Micropayment Fuel</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                {gatewayBalanceFormatted} USDC
              </div>
            </div>
          </div>

          <div className="bracket-button-wrap" style={{ width: '100%' }}>
            <button
              className="btn-brutalist btn-brutalist-pink"
              style={{ width: '100%', fontSize: '13px' }}
              onClick={runSimulation}
              disabled={isRunning}
            >
              {isRunning ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Brain size={14} className="spin" />
                  <span>Simulating...</span>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Play size={14} />
                  <span>Run Agent Autonomously</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Middle pane: visual loop state */}
        <div style={{
          backgroundColor: 'var(--bg-inner)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-main)' }}>Handshake <i>Stage Flow</i></h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', flex: 1 }}>
            {[
              { num: 1, text: 'Discover Service Directory' },
              { num: 2, text: 'Evaluate Trust & Compare' },
              { num: 3, text: 'Trigger x402 HTTP Challenge' },
              { num: 4, text: 'Solve Nanopayment Challenge' },
              { num: 5, text: 'Receive Signed Result' }
            ].map(step => (
              <div key={step.num} style={getStepStyle(step.num)}>
                <div style={getStepNumStyle(step.num)}>{step.num}</div>
                <div style={{
                  fontSize: '12px',
                  color: currentStep === step.num ? 'var(--text-main)' : currentStep > step.num ? 'var(--text-muted)' : 'var(--text-light)',
                  fontWeight: currentStep === step.num ? 700 : 400
                }}>{step.text}</div>
              </div>
            ))}
          </div>

          {chosenService && (
            <div style={{
              marginTop: 'var(--space-4)',
              border: '2px solid var(--accent-coral)',
              backgroundColor: 'rgba(255, 93, 75, 0.03)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)'
            }}>
              <div className="brutalist-label" style={{ marginBottom: '2px' }}>Selected Contractor</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{chosenService.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Paid Cost: ${chosenService.pricing.toFixed(3)} USDC</div>
            </div>
          )}
        </div>

        {/* Right pane: console logs */}
        <div style={{
          backgroundColor: 'var(--bg-inner)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          height: '380px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h4 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-main)'
            }}>
              <Terminal size={12} style={{ color: 'var(--accent-coral)' }} />
              <span>Agent Console <i>Output</i></span>
            </h4>
            {logs.length > 0 && (
              <button 
                onClick={() => setLogs([])}
                className="btn-brutalist btn-brutalist-muted"
                style={{ padding: '2px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={10} />
                Clear
              </button>
            )}
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '6px',
            paddingRight: '4px',
            fontFamily: 'monospace'
          }}>
            {logs.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '12px', textAlign: 'center', padding: 'var(--space-4)' }}>
                Configure your agent and click 'Run Agent Autonomously' to start the execution trace.
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} style={getLogStyle(log.type)}>
                  <span style={{ color: 'var(--text-light)', marginRight: '6px' }}>[{log.timestamp}]</span>
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {serviceOutput && (
        <div style={{
          marginTop: 'var(--space-5)',
          backgroundColor: 'var(--bg-inner)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)'
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.1em', marginBottom: '8px' }}>Final Payload Output</div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-main)',
            lineHeight: '1.6',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)'
          }}>
            {serviceOutput}
          </div>
        </div>
      )}
    </div>
  )
}
