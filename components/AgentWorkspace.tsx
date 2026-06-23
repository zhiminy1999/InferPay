'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Terminal, Cpu, CheckCircle, AlertCircle, TrendingUp, Sparkles, RefreshCw, MessageSquare, Compass, Zap, ArrowRight, User } from 'lucide-react'
import { useWeb3 } from '../lib/web3-provider'

interface ChatMessage {
  id: string
  sender: 'user' | 'agent'
  agentName?: string
  agentRole?: string
  text: string
  timestamp: string
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
}

export default function AgentWorkspace() {
  const { isConnected, address } = useWeb3()
  const [taskInput, setTaskInput] = useState('')
  const [threadId, setThreadId] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'agent',
        agentName: 'Coordinator Agent v2',
        agentRole: 'ROUTING & PLANNING',
        status: 'completed',
        text: 'Multi-Agent Swarm initialized on Arc Testnet. I am ready to coordinate stablecoin operations on your behalf. Select a suggested action or type a custom command below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getAgentTheme = (agentName: string) => {
    switch (agentName) {
      case 'Coordinator Agent v2':
        return {
          bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
          border: '2px solid #8b5cf6',
          text: '#1e1b4b',
          badgeBg: '#8b5cf6',
          badgeText: '#ffffff',
          iconColor: '#8b5cf6',
          shadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
        }
      case 'Balance Inquirer Agent':
        return {
          bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #10b981',
          text: '#052e16',
          badgeBg: '#10b981',
          badgeText: '#ffffff',
          iconColor: '#10b981',
          shadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
        }
      case 'Trading Swarm Agent':
        return {
          bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '2px solid #f59e0b',
          text: '#451a03',
          badgeBg: '#f59e0b',
          badgeText: '#ffffff',
          iconColor: '#f59e0b',
          shadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
        }
      case 'Bridge Operator Agent':
        return {
          bg: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          border: '2px solid #ec4899',
          text: '#500724',
          badgeBg: '#ec4899',
          badgeText: '#ffffff',
          iconColor: '#ec4899',
          shadow: '0 4px 12px rgba(236, 72, 153, 0.1)'
        }
      case 'Ledger Auditor Agent':
        return {
          bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
          border: '2px solid #06b6d4',
          text: '#083344',
          badgeBg: '#06b6d4',
          badgeText: '#ffffff',
          iconColor: '#06b6d4',
          shadow: '0 4px 12px rgba(6, 182, 212, 0.1)'
        }
      case 'Swarm Exception Handler':
        return {
          bg: '#fef2f2',
          border: '2px solid #ef4444',
          text: '#991b1b',
          badgeBg: '#ef4444',
          badgeText: '#ffffff',
          iconColor: '#ef4444',
          shadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
        }
      default:
        return {
          bg: '#f9fafb',
          border: '2px solid #6b7280',
          text: '#111827',
          badgeBg: '#6b7280',
          badgeText: '#ffffff',
          iconColor: '#6b7280',
          shadow: '0 4px 12px rgba(107, 114, 128, 0.1)'
        }
    }
  }

  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case 'Coordinator Agent v2':
        return <Cpu size={14} />
      case 'Balance Inquirer Agent':
        return <Compass size={14} />
      case 'Trading Swarm Agent':
        return <RefreshCw size={14} />
      case 'Bridge Operator Agent':
        return <Zap size={14} />
      case 'Ledger Auditor Agent':
        return <Terminal size={14} />
      default:
        return <Sparkles size={14} />
    }
  }

  const handleRunTask = async (e?: React.FormEvent, customTask?: string) => {
    if (e) e.preventDefault()
    const currentTask = customTask || taskInput
    if (!currentTask.trim()) return

    setIsRunning(true)
    if (!customTask) {
      setTaskInput('')
    }

    const userMsgId = 'user-' + Date.now()
    const coordMsgId = 'coord-' + Date.now()
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Add user message & Coordinator initial planning message
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: currentTask,
        timestamp
      },
      {
        id: coordMsgId,
        sender: 'agent',
        agentName: 'Coordinator Agent v2',
        agentRole: 'ROUTING & PLANNING',
        status: 'processing',
        text: `Analyzing task "${currentTask}" and building execution state graph...`,
        timestamp
      }
    ])

    setActiveAgent('Coordinator Agent v2')

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
        
        const finalSteps = data.steps
        const coordStep = finalSteps[0]
        
        // 1. Update Coordinator planning message with final plan summary
        setMessages(prev => prev.map(m => 
          m.id === coordMsgId 
            ? { ...m, status: 'completed', text: coordStep.message } 
            : m
        ))

        // 2. Play worker agents sequence sequentially
        for (let i = 1; i < finalSteps.length; i++) {
          const step = finalSteps[i]
          const stepMsgId = `step-${i}-${Date.now()}`
          
          setActiveAgent(step.agent)

          // Add worker step as processing
          setMessages(prev => [
            ...prev,
            {
              id: stepMsgId,
              sender: 'agent',
              agentName: step.agent,
              agentRole: step.agent === 'Balance Inquirer Agent' ? 'QUERY' 
                         : step.agent === 'Trading Swarm Agent' ? 'SWAP' 
                         : step.agent === 'Bridge Operator Agent' ? 'BRIDGE' 
                         : 'LEDGER',
              status: 'processing',
              text: 'Orchestrating agent action and preparing contract queries...',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ])

          // Artificial delay so user can observe the active agent on the topology map
          await new Promise(r => setTimeout(r, 1500))

          // Complete worker step
          setMessages(prev => prev.map(m => 
            m.id === stepMsgId 
              ? { ...m, status: 'completed', text: step.message } 
              : m
          ))
        }
      } else {
        throw new Error(data.error || 'Swarm execution failed')
      }
    } catch (err: any) {
      setMessages(prev => {
        const updated = prev.map(m => m.status === 'processing' ? { ...m, status: 'failed' as const } : m)
        updated.push({
          id: 'err-' + Date.now(),
          sender: 'agent',
          agentName: 'Swarm Exception Handler',
          agentRole: 'ERROR SYSTEM',
          status: 'failed',
          text: err.message || 'An unexpected error occurred during execution.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        return updated
      })
    } finally {
      setIsRunning(false)
      setActiveAgent(null)
    }
  }

  const renderMessageContent = (message: string) => {
    const txRegex = /0x[a-fA-F0-9]{64}/g
    const match = message.match(txRegex)
    if (match) {
      const txHash = match[0]
      const parts = message.split(txHash)
      return (
        <span>
          {parts[0]}
          <a 
            href={`https://testnet.arcscan.app/tx/${txHash}`} 
            target="_blank" 
            rel="noreferrer"
            style={{ color: 'var(--accent-coral)', textDecoration: 'underline', fontWeight: 'bold' }}
          >
            {txHash.slice(0, 10)}...{txHash.slice(-6)}
          </a>
          {parts[1]}
        </span>
      )
    }
    return message
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
          boxShadow: 'var(--shadow-soft)'
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
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Active Session</span>
            <Terminal size={16} style={{ color: 'var(--accent-pink)' }} />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-main)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {threadId ? threadId : 'No Active Thread'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Checkpoint state saved locally
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
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Agent Hit Rate</span>
            <TrendingUp size={16} style={{ color: 'var(--accent-green)' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)' }}>78.4% Cache Hit</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Optimized using disk context caching
          </div>
        </div>
      </div>

      {/* 2. Main Chat Playground & Topology */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        
        {/* Chat Console Panel */}
        <div style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-hard)',
          display: 'flex',
          flexDirection: 'column',
          height: '650px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '15px 20px',
            borderBottom: '2px solid var(--border)',
            background: 'var(--bg-inner)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={18} style={{ color: 'var(--accent-coral)' }} />
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '15px', textTransform: 'uppercase' }}>Swarm AI Chat Console</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isRunning ? 'var(--accent-coral)' : '#10b981', animation: isRunning ? 'pulse 1.5s infinite' : 'none' }}></span>
              <span>{isRunning ? 'Swarm Running...' : 'Connected'}</span>
            </div>
          </div>

          {/* Messages Logs */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            background: '#fafafa'
          }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              const theme = isUser ? null : getAgentTheme(msg.agentName || '')
              
              return (
                <div 
                  key={msg.id} 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    width: 'auto',
                    animation: 'fadeIn 0.25s ease-out'
                  }}
                >
                  {/* Sender Title / Badge info */}
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {isUser ? (
                      <>
                        <span>You</span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span>{msg.timestamp}</span>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--text-main)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <User size={12} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: theme?.badgeBg,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}>
                          {getAgentIcon(msg.agentName || '')}
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{msg.agentName}</span>
                        <span style={{
                          fontSize: '8px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          backgroundColor: theme?.badgeBg,
                          color: '#ffffff',
                          fontWeight: 900
                        }}>
                          {msg.agentRole}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  {isUser ? (
                    <div style={{
                      background: 'var(--text-main)',
                      color: 'var(--bg-card)',
                      padding: '12px 16px',
                      borderRadius: '16px 16px 2px 16px',
                      border: '1.5px solid var(--border)',
                      boxShadow: 'var(--shadow-soft)',
                      fontSize: '13px',
                      fontWeight: 600,
                      lineHeight: '1.4'
                    }}>
                      {msg.text}
                    </div>
                  ) : (
                    <div style={{
                      background: theme?.bg,
                      color: theme?.text,
                      border: theme?.border,
                      borderRadius: '16px 16px 16px 2px',
                      boxShadow: theme?.shadow,
                      padding: '14px 16px',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {msg.status === 'processing' && (
                          <RefreshCw size={14} className="animate-spin" style={{ color: theme?.iconColor }} />
                        )}
                        {msg.status === 'completed' && (
                          <CheckCircle size={14} style={{ color: '#10b981' }} />
                        )}
                        {msg.status === 'failed' && (
                          <AlertCircle size={14} style={{ color: '#ef4444' }} />
                        )}
                        <span style={{ fontWeight: 550 }}>
                          {renderMessageContent(msg.text)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Form input and suggested commands */}
          <div style={{
            padding: '15px 20px',
            borderTop: '2px solid var(--border)',
            background: 'var(--bg-inner)'
          }}>
            {/* Suggested commands */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '10px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Compass size={11} />
                <span>Suggestions:</span>
              </span>
              <button 
                onClick={() => handleRunTask(undefined, 'Check my USDC balance on Arc Testnet')}
                className="btn-brutalist btn-brutalist-small"
                disabled={isRunning}
                style={{ fontSize: '10.5px', padding: '3px 8px' }}
              >
                "Check Balance"
              </button>
              <button 
                onClick={() => handleRunTask(undefined, 'Swap 25 USDC to EURC using StableFX')}
                className="btn-brutalist btn-brutalist-small"
                disabled={isRunning}
                style={{ fontSize: '10.5px', padding: '3px 8px' }}
              >
                "Swap 25 USDC"
              </button>
              <button 
                onClick={() => handleRunTask(undefined, 'Bridge 15 USDC to Arbitrum using CCTP')}
                className="btn-brutalist btn-brutalist-small"
                disabled={isRunning}
                style={{ fontSize: '10.5px', padding: '3px 8px' }}
              >
                "Bridge to Arbitrum"
              </button>
            </div>

            <form onSubmit={handleRunTask} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Enter instructions for the Swarm..."
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
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
                <span>{isRunning ? 'Running' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Swarm Topology & Network Diagram Panel */}
        <div style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-hard)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <h3 style={{ margin: 0, fontWeight: 950, fontSize: '14px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} style={{ color: 'var(--accent-coral)' }} />
            <span>Agent Swarm Topology</span>
          </h3>

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Stateful orchestration graph representing the active LangGraph execution network. Real-time active nodes are highlighted below:
          </p>

          <div style={{
            flex: 1,
            border: '2px solid var(--border)',
            background: 'var(--bg-inner)',
            borderRadius: 'var(--radius-sm)',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* 1. Coordinator Node */}
            <div style={{
              alignSelf: 'center',
              border: activeAgent === 'Coordinator Agent v2' ? '2.5px solid var(--accent-coral)' : '1.5px solid var(--border)',
              background: 'var(--bg-card)',
              boxShadow: activeAgent === 'Coordinator Agent v2' ? '0 0 10px rgba(255, 110, 74, 0.4)' : 'var(--shadow-soft)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 15px',
              width: '85%',
              textAlign: 'center',
              zIndex: 2,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>ROUTING & PLANNING</div>
              <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>Coordinator Agent v2</strong>
              {activeAgent === 'Coordinator Agent v2' && (
                <div style={{ fontSize: '9px', color: 'var(--accent-coral)', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <RefreshCw size={8} className="animate-spin" />
                  <span>PLANNING ACTIVE</span>
                </div>
              )}
            </div>

            {/* Connecting lines container (aesthetic lines) */}
            <div style={{
              position: 'absolute',
              top: '75px',
              bottom: '190px',
              left: '50%',
              width: '2px',
              backgroundColor: 'var(--border)',
              transform: 'translateX(-50%)',
              zIndex: 1
            }} />

            {/* Sub-agents columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              zIndex: 2,
              marginTop: '25px',
              marginBottom: '10px'
            }}>
              
              {/* Balance Inquirer */}
              <div style={{
                border: activeAgent === 'Balance Inquirer Agent' ? '2.5px solid #10b981' : '1.5px solid var(--border)',
                background: 'var(--bg-card)',
                boxShadow: activeAgent === 'Balance Inquirer Agent' ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'var(--shadow-soft)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>QUERY</div>
                <strong style={{ fontSize: '11px', color: 'var(--text-main)' }}>Balance Inquirer</strong>
                {activeAgent === 'Balance Inquirer Agent' && (
                  <div style={{ fontSize: '8px', color: '#10b981', fontWeight: 700, marginTop: '2px' }}>ACTIVE</div>
                )}
              </div>

              {/* Trading Swarm */}
              <div style={{
                border: activeAgent === 'Trading Swarm Agent' ? '2.5px solid var(--accent-coral)' : '1.5px solid var(--border)',
                background: 'var(--bg-card)',
                boxShadow: activeAgent === 'Trading Swarm Agent' ? '0 0 10px rgba(255, 110, 74, 0.4)' : 'var(--shadow-soft)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>SWAP</div>
                <strong style={{ fontSize: '11px', color: 'var(--text-main)' }}>Trading Swarm</strong>
                {activeAgent === 'Trading Swarm Agent' && (
                  <div style={{ fontSize: '8px', color: 'var(--accent-coral)', fontWeight: 700, marginTop: '2px' }}>ACTIVE</div>
                )}
              </div>

              {/* Bridge Operator */}
              <div style={{
                border: activeAgent === 'Bridge Operator Agent' ? '2.5px solid var(--accent-pink)' : '1.5px solid var(--border)',
                background: 'var(--bg-card)',
                boxShadow: activeAgent === 'Bridge Operator Agent' ? '0 0 10px rgba(236, 72, 153, 0.4)' : 'var(--shadow-soft)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>BRIDGE</div>
                <strong style={{ fontSize: '11px', color: 'var(--text-main)' }}>Bridge Operator</strong>
                {activeAgent === 'Bridge Operator Agent' && (
                  <div style={{ fontSize: '8px', color: 'var(--accent-pink)', fontWeight: 700, marginTop: '2px' }}>ACTIVE</div>
                )}
              </div>

              {/* Ledger Auditor */}
              <div style={{
                border: activeAgent === 'Ledger Auditor Agent' ? '2.5px solid var(--accent-green)' : '1.5px solid var(--border)',
                background: 'var(--bg-card)',
                boxShadow: activeAgent === 'Ledger Auditor Agent' ? '0 0 10px rgba(34, 197, 94, 0.4)' : 'var(--shadow-soft)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>LEDGER</div>
                <strong style={{ fontSize: '11px', color: 'var(--text-main)' }}>Ledger Auditor</strong>
                {activeAgent === 'Ledger Auditor Agent' && (
                  <div style={{ fontSize: '8px', color: 'var(--accent-green)', fontWeight: 700, marginTop: '2px' }}>ACTIVE</div>
                )}
              </div>

            </div>

            {/* Connecting lines to bottom node */}
            <div style={{
              position: 'absolute',
              bottom: '58px',
              top: '190px',
              left: '50%',
              width: '2px',
              backgroundColor: 'var(--border)',
              transform: 'translateX(-50%)',
              zIndex: 1
            }} />

            {/* 3. Consensus/Escrow Settlement Node */}
            <div style={{
              alignSelf: 'center',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-soft)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 15px',
              width: '85%',
              textAlign: 'center',
              zIndex: 2
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>SETTLEMENT ENGINE</div>
              <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>Arc Escrow Contract</strong>
              <div style={{ fontSize: '8.5px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                0x6ac15aadcd3b3c80db04a9cf9b92f3f6967af9cd
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
