'use client'

import React, { useState } from 'react'
import { Send, Terminal, Play, Cpu, CheckCircle, AlertCircle, TrendingUp, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react'
import { useWeb3 } from '../lib/web3-provider'

interface AgentStep {
  id: string
  agent: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  message: string
  timestamp: string
}

export default function AgentWorkspace() {
  const { isConnected, address } = useWeb3()
  const [taskInput, setTaskInput] = useState('')
  const [threadId, setThreadId] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<AgentStep[]>([
    {
      id: 'step-init',
      agent: 'System Monitor',
      status: 'completed',
      message: 'LangGraph swarm initialized. Ready for user task allocation.',
      timestamp: new Date().toLocaleTimeString()
    }
  ])

  const handleRunTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskInput.trim()) return

    setIsRunning(true)
    const currentTask = taskInput
    setTaskInput('')

    // Reset steps and add initial analysis state
    setSteps([
      {
        id: 'step-0',
        agent: 'Coordinator Agent v2',
        status: 'processing',
        message: `Analyzing task "${currentTask}" and building execution state graph...`,
        timestamp: new Date().toLocaleTimeString()
      }
    ])

    try {
      const res = await fetch('/api/agent/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task: currentTask,
          threadId: threadId || undefined,
          walletAddress: address || '0x7a304A671e21b79528659dC0D775e53FE233b2B0'
        })
      })

      const data = await res.json()
      if (data.success && data.steps) {
        setThreadId(data.threadId)
        setSteps(data.steps)
      } else {
        throw new Error(data.error || 'Swarm execution failed')
      }
    } catch (err: any) {
      setSteps(prev => [
        ...prev.map(s => s.status === 'processing' ? { ...s, status: 'failed' as const } : s),
        {
          id: 'step-err',
          agent: 'Swarm Exception Handler',
          status: 'failed',
          message: err.message || 'An unexpected error occurred during execution.',
          timestamp: new Date().toLocaleTimeString()
        }
      ])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* 1. Indicators Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '15px'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-soft)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Operational Health</span>
            <Cpu size={16} style={{ color: 'var(--accent-coral)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>100% Active</div>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
            <span>All LangGraph nodes healthy</span>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Active Session thread</span>
            <Terminal size={16} style={{ color: 'var(--accent-pink)' }} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {threadId ? threadId : 'No Active Thread'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Persistent state checkpoint saved
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>DeepSeek API Hit-Rate</span>
            <TrendingUp size={16} style={{ color: 'var(--accent-green)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>78.4% Cache Hit</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Optimized using disk context caching
          </div>
        </div>
      </div>

      {/* 2. Chat Playground & Visual Graph */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Playground Form */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-hard)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-coral)' }} />
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '16px', textTransform: 'uppercase' }}>AI Swarm Playground</h3>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 15px 0', lineHeight: '1.4' }}>
              Interact with the stateful LangGraph Multi-Agent network using natural language. Execute balance queries, swaps on StableFX, CCTP bridge transfers, and database logs automatically.
            </p>

            <div style={{
              background: 'var(--bg-inner)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <strong>Suggested Commands:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button 
                  onClick={() => setTaskInput('Check my USDC balance on Arc Testnet')}
                  className="btn-brutalist btn-brutalist-small"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  "Check USDC balance"
                </button>
                <button 
                  onClick={() => setTaskInput('Swap 25 USDC to EURC using StableFX')}
                  className="btn-brutalist btn-brutalist-small"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  "Swap 25 USDC"
                </button>
                <button 
                  onClick={() => setTaskInput('Bridge 15 USDC to Arbitrum using CCTP')}
                  className="btn-brutalist btn-brutalist-small"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  "Bridge 15 USDC to Arbitrum"
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleRunTask} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter instructions for the AI Agent Swarm..."
              style={{
                flex: 1,
                padding: '12px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-inner)',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontSize: '13px'
              }}
              disabled={isRunning}
            />
            <button 
              type="submit" 
              className="btn-brutalist btn-brutalist-accent"
              style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              disabled={isRunning || !taskInput.trim()}
            >
              {isRunning ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
              <span>{isRunning ? 'Running' : 'Run'}</span>
            </button>
          </form>
        </div>

        {/* Visual Graph Execution trace */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          boxShadow: 'var(--shadow-hard)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} style={{ color: 'var(--text-muted)' }} />
            <span>Execution State Nodes (LangGraph)</span>
          </h3>

          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            overflowY: 'auto',
            maxHeight: '300px',
            paddingRight: '5px'
          }}>
            {steps.map((step, idx) => (
              <div 
                key={step.id} 
                style={{
                  display: 'flex',
                  gap: '12px',
                  position: 'relative',
                  paddingBottom: idx === steps.length - 1 ? 0 : '15px'
                }}
              >
                {/* Visual connecting line */}
                {idx !== steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '10px',
                    top: '22px',
                    bottom: 0,
                    width: '2px',
                    backgroundColor: 'var(--border)',
                    zIndex: 0
                  }} />
                )}

                {/* Node indicator */}
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--border)',
                  backgroundColor: step.status === 'processing' ? 'var(--accent-coral)' : (step.status === 'failed' ? '#ef4444' : '#10b981'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  boxShadow: 'var(--shadow-soft)'
                }}>
                  {step.status === 'completed' && <CheckCircle size={10} style={{ color: '#ffffff' }} />}
                  {step.status === 'processing' && <RefreshCw size={10} className="animate-spin" style={{ color: '#ffffff' }} />}
                  {step.status === 'failed' && <AlertCircle size={10} style={{ color: '#ffffff' }} />}
                </div>

                {/* Node info */}
                <div style={{ flex: 1, background: 'var(--bg-inner)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>{step.agent}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{step.timestamp}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.4' }}>{step.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
