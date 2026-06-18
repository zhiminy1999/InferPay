'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Lock, 
  ArrowRight, 
  ArrowRightLeft, 
  Coins, 
  FileText, 
  Shield, 
  Zap, 
  Users, 
  Briefcase, 
  ExternalLink,
  Check,
  CheckCircle2,
  Menu,
  X,
  Play,
  Cpu
} from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [activeFeatureTab, setActiveFeatureTab] = useState<'escrow' | 'intent' | 'yield' | 'nanopay'>('escrow')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Simulator States
  const [simState, setSimState] = useState<'idle' | 'executing'>('idle')
  const [simAction, setSimAction] = useState<'swap' | 'invoice' | null>(null)
  const [simLogs, setSimLogs] = useState<string[]>([
    'SYSTEM: InferPay Agent Node v1.0.4 initialized.',
    'NETWORK: Connected to Arc Testnet. Gas settings locked.',
    'POLICY: Operational AI Vault active. Standing by for instructions...'
  ])
  const [simBalance, setSimBalance] = useState(12450.80)

  const runSimSwap = () => {
    if (simState === 'executing') return
    setSimState('executing')
    setSimAction('swap')
    setSimLogs(['[0.0s] 🛰️ Initiating atomic treasury auto-swap...'])
    
    const steps = [
      { time: 400, log: '[0.4s] 🔑 Checking Permit2 spending allowance: 500 USDC limit...' },
      { time: 800, log: '[0.8s] 📝 Constructing signature verification request...' },
      { time: 1200, log: '[1.2s] ⛓️ Submitting swap execution to Arc Testnet...' },
      { time: 1600, log: '[1.6s] 🔄 Swapping 150.00 USDC to 139.50 EURC (Rate: 0.9300)' },
      { time: 2000, log: '[2.0s] 🏁 Atomic settlement complete! Block #849104' },
      { time: 2400, log: 'POLICY: Operational AI Vault standing by.' }
    ]

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, step.log])
        if (idx === 4) {
          setSimBalance(prev => prev - 150.00)
        }
        if (idx === steps.length - 1) {
          setSimState('idle')
          setSimAction(null)
        }
      }, step.time)
    })
  }

  const runSimInvoice = () => {
    if (simState === 'executing') return
    setSimState('executing')
    setSimAction('invoice')
    setSimLogs(['[0.0s] 📥 Triaging agent billing invoice #841...'])

    const steps = [
      { time: 400, log: '[0.4s] 🛡️ Checking AgentRegistry ERC-8004 capabilities & reputation score: 98/100...' },
      { time: 800, log: '[0.8s] 💸 Verifying daily spending limits... Approved (120 USDC < 500 USDC limit).' },
      { time: 1200, log: '[1.2s] ⚡ Dispensing atomic payout on Arc chain...' },
      { time: 1600, log: '[1.6s] 🔒 Payment dispatched to agent 0x9f12...3e4f. Transaction hash logged.' },
      { time: 2000, log: 'POLICY: Operational AI Vault standing by.' }
    ]

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimLogs(prev => [...prev, step.log])
        if (idx === 3) {
          setSimBalance(prev => prev - 120.00)
        }
        if (idx === steps.length - 1) {
          setSimState('idle')
          setSimAction(null)
        }
      }, step.time)
    })
  }

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setWaitlistStatus('loading')
    setTimeout(() => {
      setWaitlistStatus('success')
      setEmail('')
    }, 800)
  }

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-main)', 
      minHeight: '100vh', 
      color: 'var(--text-main)',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Dynamic Grid Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.25,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(251, 250, 248, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--space-6)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-coral)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: 'white',
            fontSize: '14px',
            boxShadow: 'var(--shadow-soft)'
          }}>IP</div>
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '18px', 
            fontWeight: 700, 
            letterSpacing: '-0.02em',
            color: 'var(--text-main)' 
          }}>
            Infer<i>Pay</i>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', gap: '30px', alignItems: 'center' }} className="hidden md:flex">
          <a href="#features" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Features</a>
          <Link href="/docs" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Docs</Link>
          <Link href="/faq" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>FAQ</Link>
          <Link href="/about" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>About</Link>
          <Link href="/contact" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Contact</Link>
        </nav>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/dashboard" className="btn-brutalist btn-brutalist-pink" style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Launch App <ArrowRight size={14} />
          </Link>
          
          {/* Mobile hamburger menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--bg-main)',
          zIndex: 99,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderBottom: '1px solid var(--border)',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>Features</a>
          <Link href="/docs" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>Docs</Link>
          <Link href="/faq" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>FAQ</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>About</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>Contact</Link>
        </div>
      )}

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        
        {/* HERO SECTION */}
        <section style={{
          padding: '80px 24px 60px',
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* Badge alert */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            borderRadius: '100px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent-coral)'
          }}>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-coral)',
              display: 'inline-block'
            }} className="blink"></span>
            <span>Live on Arc Testnet — Powering AI Economy</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontFamily: 'var(--font-serif)',
            lineHeight: '1.05',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: 0,
            color: 'var(--text-main)'
          }}>
            Autonomous Stablecoin Payments for <i>AI Agents</i>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: 500
          }}>
            Give your AI assistants dedicated wallets. Automate spending limits, smart bill payments, real-time APY optimization, and multi-agent payroll with sub-second finality.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '10px'
          }}>
            <Link href="/dashboard" className="btn-brutalist btn-brutalist-pink" style={{
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Launch Application <ArrowRight size={16} />
            </Link>
            
            <a href="#demo" className="btn-brutalist" style={{
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Play size={15} style={{ fill: 'currentColor' }} /> Watch Demo
            </a>
          </div>

          {/* Trust badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            marginTop: '40px',
            flexWrap: 'wrap',
            opacity: 0.65
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700 }}>
              <span style={{ color: 'var(--accent-coral)' }}>●</span> Powered by ARC Chain
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700 }}>
              <span style={{ color: 'var(--accent-green)' }}>●</span> Circle CCTP Native
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700 }}>
              <span style={{ color: 'var(--accent-pink)' }}>●</span> ERC-8004 Identity
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEMO SHOWCASE SECTION */}
        <section id="demo" style={{
          padding: '20px 24px 80px',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          <div className="brutalist-card" style={{
            backgroundColor: 'var(--bg-card)',
            padding: 0,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-soft)',
            borderWidth: '2px'
          }}>
            {/* Terminal Top Ribbon (No browser dots, no url bar) */}
            <div style={{
              backgroundColor: 'var(--bg-inner)',
              borderBottom: '2px solid var(--border)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'monospace',
              fontSize: '11.5px',
              fontWeight: 750,
              letterSpacing: '0.03em',
              color: 'var(--text-main)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: simState === 'executing' ? 'var(--accent-coral)' : 'var(--accent-green)', 
                  display: 'inline-block' 
                }} className={simState === 'executing' ? 'blink' : ''}></span>
                <span>NODE: 0x9f12...3e4f</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} className="hidden sm:flex">
                <span>CHAIN: ARC-TESTNET</span>
                <span style={{ color: 'var(--text-light)' }}>|</span>
                <span>STATUS: OPERATIONAL</span>
              </div>
              <div>
                <span className="badge-brutalist green" style={{ fontSize: '9.5px', padding: '2px 8px', textTransform: 'uppercase' }}>
                  Live blockfeed
                </span>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              minHeight: '440px',
              backgroundColor: 'var(--bg-main)'
            }} className="flex flex-col md:grid">
              
              {/* Left Control Panel: Status & Simulation Triggers */}
              <div style={{
                padding: '30px',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 800 }}>
                        Operational <i>AI Vault</i>
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        Automated policy parameters enforced via Arc smart contracts.
                      </p>
                    </div>
                  </div>

                  {/* Operational Settings Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                    <div style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      padding: '14px 18px', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Spending Limit</div>
                        <div style={{ fontSize: '18px', fontWeight: 850, marginTop: '2px' }}>500.00 USDC</div>
                      </div>
                      <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Permit2 Guarded</span>
                    </div>

                    <div style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      padding: '14px 18px', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vault Available Balance</div>
                        <div style={{ fontSize: '18px', fontWeight: 850, color: 'var(--accent-green)', marginTop: '2px' }}>
                          {simBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                        </div>
                      </div>
                      <span className="badge-brutalist green" style={{ fontSize: '10px' }}>Liquid</span>
                    </div>
                  </div>
                </div>

                {/* Simulation Action Box */}
                <div style={{ 
                  padding: '20px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)', 
                  backgroundColor: 'var(--bg-inner)',
                  boxShadow: '3px 3px 0px var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <strong style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={14} style={{ color: 'var(--accent-coral)' }} />
                      <span>Simulate Intent Execution:</span>
                    </strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', fontFamily: 'monospace' }}>ARC consensus</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }} className="flex flex-col sm:flex-row">
                    <button 
                      onClick={runSimSwap}
                      disabled={simState === 'executing'}
                      className="btn-brutalist btn-brutalist-pink" 
                      style={{ 
                        padding: '10px 15px', 
                        fontSize: '12.5px', 
                        flex: 1, 
                        justifyContent: 'center',
                        opacity: simState === 'executing' && simAction !== 'swap' ? 0.5 : 1
                      }}
                    >
                      {simState === 'executing' && simAction === 'swap' ? 'Swapping...' : 'Trigger Auto-Swap'}
                    </button>
                    <button 
                      onClick={runSimInvoice}
                      disabled={simState === 'executing'}
                      className="btn-brutalist" 
                      style={{ 
                        padding: '10px 15px', 
                        fontSize: '12.5px', 
                        backgroundColor: 'var(--bg-card)', 
                        color: 'var(--text-main)', 
                        flex: 1,
                        justifyContent: 'center',
                        opacity: simState === 'executing' && simAction !== 'invoice' ? 0.5 : 1
                      }}
                    >
                      {simState === 'executing' && simAction === 'invoice' ? 'Dispensing...' : 'Approve Invoice'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel: Live Blockchain Node Console logs */}
              <div style={{
                padding: '30px',
                backgroundColor: '#0c0a09',
                color: '#34d399',
                fontFamily: 'monospace',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '320px' }}>
                  <div style={{ borderBottom: '1px dashed #1e293b', paddingBottom: '8px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>AGENT INSTANCE LOG FEED</span>
                    <span>v1.0.4</span>
                  </div>
                  
                  {simLogs.map((log, index) => {
                    let logColor = '#34d399' // default console green
                    if (log.startsWith('SYSTEM')) logColor = '#a855f7' // purple
                    if (log.startsWith('NETWORK')) logColor = '#38bdf8' // blue
                    if (log.startsWith('POLICY')) logColor = '#eab308' // yellow
                    if (log.includes('complete') || log.includes('dispatched')) logColor = '#f472b6' // pink
                    
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          lineHeight: '1.5', 
                          color: logColor,
                          animation: 'slideUp 0.15s ease-out'
                        }}
                      >
                        {log}
                      </div>
                    )
                  })}
                </div>

                <div style={{ 
                  borderTop: '1px solid #1e293b', 
                  paddingTop: '12px', 
                  color: '#64748b', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }} className="blink"></span>
                    <span>Node latency: ~12ms</span>
                  </div>
                  <span>Gas: 0.0004 USDC (98% saving)</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID SECTION */}
        <section id="features" style={{
          padding: '60px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: 0 }}>
                Designed for the <i>Autonomous Web</i>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '10px', maxWidth: '600px', margin: '10px auto 0' }}>
                Every tool needed to handle finance, trust, and operations without developer friction.
              </p>
            </div>

            {/* Bento Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }} className="flex flex-col md:grid">
              {/* Card 1: 2/3 width */}
              <div className="brutalist-card" style={{ gridColumn: 'span 2', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>

              

                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-inner)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px'
                  }}>
                    <Lock size={18} style={{ color: 'var(--accent-coral)' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, margin: '0 0 10px' }}>
                    Non-Custodial Spending Rules
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    Keep ultimate control of your capital. Enforce strict daily, weekly, or transactional spending rules via gasless cryptographically signed permits directly on the Arc ledger.
                  </p>
                </div>
              </div>

              {/* Card 2: 1/3 width */}
              <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-inner)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px'
                }}>
                  <Zap size={18} style={{ color: 'var(--accent-pink)' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
                  x402 Nanopayments
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
                  Enable real-time micropayments for API inference. Agents pay cents dynamically per query.
                </p>
              </div>

              {/* Card 3: 1/3 width */}
              <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-inner)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px'
                }}>
                  <Shield size={18} style={{ color: 'var(--accent-green)' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
                  ERC-8004 Identity
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
                  Verifiable reputations on-chain for AI contractors. Choose agents based on audited compliance records.
                </p>
              </div>

              {/* Card 4: 2/3 width */}
              <div className="brutalist-card" style={{ gridColumn: 'span 2', backgroundColor: 'var(--bg-card)' }}>
                <div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-inner)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px'
                  }}>
                    <Coins size={18} style={{ color: 'var(--accent-coral)' }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, margin: '0 0 10px' }}>
                    StableFX Yield & FX Arbitrage
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    Maximize yields on dormant idle corporate cash. Automated algorithms swap balances between USDC and EURC based on real-time on-chain RFQ price quotes and yield opportunities.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section style={{
          padding: '80px 24px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: 0 }}>
              How it works in <i>3 Simple Steps</i>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '10px' }}>
              Launch your autonomous treasury stack in minutes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px',
            position: 'relative'
          }} className="flex flex-col md:grid">
            
            {/* Step 1 */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-main)',
                color: 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
                boxShadow: 'var(--shadow-soft)'
              }}>1</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Connect & Fund</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', margin: 0, maxWidth: '280px' }}>
                Securely log in via Passkeys or MetaMask and fund your account with USDC or EURC.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-main)',
                color: 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
                boxShadow: 'var(--shadow-soft)'
              }}>2</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Provision AI Rules</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', margin: 0, maxWidth: '280px' }}>
                Define spending limits, gas sponsorships, or assign task contracts to designated AI Agents.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-main)',
                color: 'var(--bg-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
                boxShadow: 'var(--shadow-soft)'
              }}>3</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Automate Payments</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', margin: 0, maxWidth: '280px' }}>
                Your AI works and processes bills instantly. Transactions verify on Arc with USDC gas.
              </p>
            </div>

          </div>
        </section>

        {/* FINAL CONVERSION CALL TO ACTION */}
        <section style={{
          padding: '40px 24px 80px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div className="bg-inner" style={{
            padding: '50px 30px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-inner)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: 0 }}>
              Join the <i>Autonomous Stablecoins</i> Waitlist
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '500px', margin: 0 }}>
              Get early beta access to developer SDKs, token models, and exclusive gas sponsorships on the Arc testnet.
            </p>

            <form onSubmit={handleJoinWaitlist} style={{
              display: 'flex',
              gap: '10px',
              width: '100%',
              maxWidth: '420px',
              marginTop: '10px'
            }} className="flex flex-col sm:flex-row">
              <input 
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="brutalist-input"
                style={{ flex: 1, backgroundColor: 'var(--bg-card)' }}
                required
                disabled={waitlistStatus === 'success'}
              />
              <button 
                type="submit" 
                className="btn-brutalist btn-brutalist-pink"
                style={{ padding: '0 24px', height: '42px', fontWeight: 700, whiteSpace: 'nowrap' }}
                disabled={waitlistStatus !== 'idle'}
              >
                {waitlistStatus === 'idle' && 'Join Waitlist'}
                {waitlistStatus === 'loading' && 'Joining...'}
                {waitlistStatus === 'success' && '✓ You\'re on the list'}
              </button>
            </form>

            {waitlistStatus === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '13px', fontWeight: 700, animation: 'fadeIn 0.2s' }}>
                <CheckCircle2 size={16} />
                <span>Thank you! We\'ve saved your email. Invitation will follow.</span>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '50px 24px 40px',
        color: 'var(--text-muted)',
        fontSize: '13px'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr repeat(3, 1fr)', gap: '40px' }} className="flex flex-col md:grid">
          
          {/* Logo brand info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                backgroundColor: 'var(--accent-coral)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: 'white',
                fontSize: '11px'
              }}>IP</div>
              <span style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--text-main)' 
              }}>
                Infer<i>Pay</i>
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: '1.5', maxWidth: '240px' }}>
              Autonomous stablecoin stack for AI agents on the Arc chain. Secured by Circle USDC.
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-light)' }}>
              © 2026 InferPay. Created for ARC Stablecoins Challenge.
            </p>
          </div>

          {/* Links 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources</span>
            <Link href="/docs" style={{ textDecoration: 'none', color: 'inherit' }}>Documentation</Link>
            <Link href="/faq" style={{ textDecoration: 'none', color: 'inherit' }}>FAQ Support</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
              GitHub Repo <ExternalLink size={12} />
            </a>
          </div>

          {/* Links 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</span>
            <Link href="/about" style={{ textDecoration: 'none', color: 'inherit' }}>About Us</Link>
            <Link href="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>Get Support</Link>
            <a href="https://circle.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Circle Global <ExternalLink size={12} />
            </a>
          </div>

          {/* Links 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal</span>
            <Link href="/security" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>🛡️ Security Hub</Link>
            <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Terms of Service</Link>
          </div>

        </div>
      </footer>
    </div>
  )
}
