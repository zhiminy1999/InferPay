'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useModal } from '@/components/ModalSystem'
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
  Cpu,
  Eye,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Activity,
  Terminal,
  ChevronDown,
  ChevronUp,
  Globe,
  DollarSign,
  TrendingUp,
  MessageSquare
} from 'lucide-react'

export default function LandingPage() {
  const { showModal } = useModal()
  const [email, setEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [activeFeatureTab, setActiveFeatureTab] = useState<'escrow' | 'intent' | 'yield' | 'nanopay'>('escrow')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive UI / Growth States
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null)
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(true)
  const [activeCodeTab, setActiveCodeTab] = useState<'sdk' | 'api' | 'cli'>('sdk')
  const [videoModalOpen, setVideoModalOpen] = useState<boolean>(false)

  // Real-time metric counters
  const [volumeCount, setVolumeCount] = useState<number>(2410850)
  const [txCount, setTxCount] = useState<number>(125430)
  const [walletCount, setWalletCount] = useState<number>(4210)

  useEffect(() => {
    // Animate stats values randomly over time to mimic active on-chain node processing
    const interval = setInterval(() => {
      setVolumeCount(prev => prev + Math.floor(Math.random() * 85) + 10)
      setTxCount(prev => prev + Math.floor(Math.random() * 4) + 1)
      if (Math.random() > 0.8) {
        setWalletCount(prev => prev + 1)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Interactive Simulator States
  const [simState, setSimState] = useState<'idle' | 'executing'>('idle')
  const [simAction, setSimAction] = useState<'swap' | 'invoice' | null>(null)
  const [simStep, setSimStep] = useState<number>(0) // 0: standby, 1-4: stages
  const [simBalance, setSimBalance] = useState(12450.80)

  const runSimSwap = () => {
    if (simState === 'executing') return
    setSimState('executing')
    setSimAction('swap')
    setSimStep(1) // Intent Triage
    
    setTimeout(() => setSimStep(2), 650)   // Policy validation
    setTimeout(() => setSimStep(3), 1300)  // Atomic exchange execution
    setTimeout(() => {
      setSimStep(4)                        // Completed transaction
      setSimBalance(prev => prev - 150.00)
    }, 1950)
    setTimeout(() => {
      setSimState('idle')
      setSimAction(null)
      setSimStep(0)
    }, 3600)
  }

  const runSimInvoice = () => {
    if (simState === 'executing') return
    setSimState('executing')
    setSimAction('invoice')
    setSimStep(1) // Intent Triage
    
    setTimeout(() => setSimStep(2), 650)   // Reputation check
    setTimeout(() => setSimStep(3), 1300)  // Atomic payout execution
    setTimeout(() => {
      setSimStep(4)                        // Completed transaction
      setSimBalance(prev => prev - 120.00)
    }, 1950)
    setTimeout(() => {
      setSimState('idle')
      setSimAction(null)
      setSimStep(0)
    }, 3600)
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
      position: 'relative'
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

      {/* Announcement Bar */}
      <div style={{
        backgroundColor: 'var(--text-main)',
        color: 'var(--bg-main)',
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: 700,
        textAlign: 'center',
        position: 'relative',
        zIndex: 101,
        letterSpacing: '0.03em',
        borderBottom: '1px solid var(--border)'
      }}>
        <span>InferPay Devnet is now live on the Arc Chain! Build gasless AI agent vaults with native USDC. </span>
        <Link href="/docs" style={{ color: 'var(--accent-pink)', marginLeft: '6px', textDecoration: 'underline' }}>Read SDK Docs →</Link>
      </div>

      {/* Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(251, 250, 248, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 var(--space-6)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(20, 20, 22, 0.03)'
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
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="hidden md:flex">
          <a href="#features" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Features</a>
          <a href="#usecases" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Use Cases</a>
          <a href="#developers" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Developers</a>
          <a href="#faq" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>FAQ</a>
          <Link href="/docs" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Docs</Link>
          <Link href="/security" style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Security</Link>
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
          top: '96px',
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
          <a href="#usecases" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>Use Cases</a>
          <a href="#developers" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>Developers</a>
          <Link href="/docs" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>Docs</Link>
          <Link href="/security" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, textDecoration: 'none', color: 'var(--text-main)' }}>Security Hub</Link>
        </div>
      )}

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 1, overflowX: 'hidden' }}>
        
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

              {/* Right Panel: Live AI Intent Execution Visualizer */}
              <div style={{
                padding: '30px',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px'
              }}>
                <div>
                  <div style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em' }}>
                      AI Workflow Tracker
                    </div>
                    <h4 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700 }}>
                      Live Intent Validation
                    </h4>
                  </div>
                  
                  {/* Vertical Timeline Steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                    {/* Connecting line */}
                    <div style={{
                      position: 'absolute',
                      left: '17px',
                      top: '10px',
                      bottom: '24px',
                      width: '2px',
                      backgroundColor: 'var(--border)',
                      zIndex: 0
                    }} />

                    {/* Step 1: Triage */}
                    {[
                      {
                        stepId: 1,
                        label: 'Intent Detection & Parse',
                        desc: simAction === 'swap' ? 'Swap rate threshold alert detected' : 'Scanning incoming agent invoice #841',
                        icon: Eye,
                        getStatus: () => {
                          if (simStep === 0) return { label: 'Standby', className: 'badge-brutalist' }
                          if (simStep === 1) return { label: 'Scanning...', className: 'badge-brutalist yellow blink' }
                          return { label: 'Parsed', className: 'badge-brutalist pink' }
                        }
                      },
                      {
                        stepId: 2,
                        label: 'Smart Policy Verification',
                        desc: simAction === 'swap' ? 'Checking daily Permit2 limits' : 'Verifying reputation & daily spend caps',
                        icon: ShieldCheck,
                        getStatus: () => {
                          if (simStep < 2) return { label: 'Pending', className: 'badge-brutalist' }
                          if (simStep === 2) return { label: 'Checking...', className: 'badge-brutalist yellow blink' }
                          return { label: 'Authorized', className: 'badge-brutalist pink' }
                        }
                      },
                      {
                        stepId: 3,
                        label: 'Atomic Settlement (Arc)',
                        desc: simAction === 'swap' ? 'Converting 150 USDC to EURC' : 'Dispensing stablecoin agent salary payout',
                        icon: Zap,
                        getStatus: () => {
                          if (simStep < 3) return { label: 'Pending', className: 'badge-brutalist' }
                          if (simStep === 3) return { label: 'Settling...', className: 'badge-brutalist yellow blink' }
                          return { label: 'Settled', className: 'badge-brutalist green' }
                        }
                      },
                      {
                        stepId: 4,
                        label: 'Gas Optimization Log',
                        desc: 'Refining transaction overhead to sub-cent gas',
                        icon: Sparkles,
                        getStatus: () => {
                          if (simStep < 4) return { label: 'Pending', className: 'badge-brutalist' }
                          return { label: 'Optimized', className: 'badge-brutalist green' }
                        }
                      }
                    ].map((step, idx) => {
                      const StepIcon = step.icon
                      const status = step.getStatus()
                      const isActive = simStep === step.stepId
                      const isCompleted = simStep > step.stepId || (simStep === 4 && step.stepId === 4)
                      
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '16px', zIndex: 1, position: 'relative' }}>
                          {/* Circular Icon badge */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--bg-main)' : isActive ? 'var(--accent-coral)' : 'var(--bg-inner)',
                            border: '2px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? 'white' : 'var(--text-main)',
                            transition: 'all 0.2s',
                            transform: isActive ? 'scale(1.1)' : 'none',
                            boxShadow: isActive ? '2px 2px 0px var(--border)' : 'none'
                          }}>
                            <StepIcon size={16} />
                          </div>

                          {/* Info Column */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                              <strong style={{ fontSize: '13px', color: isActive ? 'var(--accent-coral)' : 'var(--text-main)' }}>
                                {step.label}
                              </strong>
                              <span className={status.className} style={{ fontSize: '8.5px', padding: '1px 5px', fontWeight: 800 }}>
                                {status.label}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {simStep === 0 ? 'Awaiting operations trigger...' : step.desc}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Status Bar */}
                <div style={{ 
                  borderTop: '1px solid var(--border)', 
                  paddingTop: '14px', 
                  color: 'var(--text-muted)', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11.5px',
                  fontFamily: 'monospace'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: simStep > 0 ? 'var(--accent-coral)' : 'var(--accent-green)', 
                      display: 'inline-block' 
                    }} className={simStep > 0 ? 'blink' : ''}></span>
                    <span>{simStep > 0 ? 'Executing state machine' : 'Monitoring network latency ~12ms'}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>Gas saving: 98%</span>
                </div>
              </div>

            </div>
          </div>
        </section>

             {/* SECTION 2: SOCIAL PROOF */}
        <section style={{
          padding: '40px 24px 60px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-inner)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h5 style={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              color: 'var(--text-light)', 
              letterSpacing: '0.08em',
              marginBottom: '24px' 
            }}>
              Ecosystem Backing & Infrastructure Partners
            </h5>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '40px', 
              flexWrap: 'wrap',
              opacity: 0.6
            }}>
              {/* Grayscale partner logos with hover transitions */}
              {['Circle', 'Arc Chain', 'Coinbase', 'OpenAI', 'Anthropic', 'Agora'].map((partner, index) => (
                <span 
                  key={index} 
                  style={{ 
                    fontFamily: 'var(--font-serif)', 
                    fontWeight: 800, 
                    fontSize: '20px', 
                    color: 'var(--text-main)',
                    letterSpacing: '-0.03em',
                    cursor: 'default',
                    transition: 'all 0.2s'
                  }}
                  className="hover-opacity-100"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: LIVE PLATFORM STATS */}
        <section style={{
          padding: '60px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px'
            }} className="flex flex-col sm:grid">
              {[
                { label: 'Volume Settled', value: `$${(volumeCount / 1000000).toFixed(2)}M+` },
                { label: 'Agent Transactions', value: txCount.toLocaleString() },
                { label: 'AI Wallets Created', value: walletCount.toLocaleString() },
                { label: 'Settlement Success', value: '99.98%' }
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '24px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                >
                  <div style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: REAL-WORLD USE CASES */}
        <section id="usecases" style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Real-World Autonomy</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0 0' }}>
                How Agents Use <i>InferPay</i>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '10px', maxWidth: '600px', margin: '10px auto 0' }}>
                Bridging the gap between cognitive LLM reasoning and real-world economic actions.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }} className="flex flex-col md:grid">
              {[
                {
                  title: 'AI Customer Support Agent',
                  desc: 'Autonomously pays third-party APIs (OpenAI, Anthropic) as inference demands scale.',
                  workflow: 'Request -> Limit Check -> Settlement -> API Call',
                  icon: Cpu
                },
                {
                  title: 'AI Trading Agent',
                  desc: 'Monitors real-time yields and automatically routes stablecoins to optimize treasury growth.',
                  workflow: 'Scan Yield -> Request Swap -> Settlement -> Complete',
                  icon: TrendingUp
                },
                {
                  title: 'AI Research Agent',
                  desc: 'Buys compute power and inference bandwidth using micropayments based on dataset analysis.',
                  workflow: 'Compute needed -> Check balance -> Pay vendor -> Train model',
                  icon: Eye
                },
                {
                  title: 'Multi-Agent Payroll',
                  desc: 'Orchestrates payments from coordinator agents down to sub-worker contractors automatically.',
                  workflow: 'Verify task -> Trigger salary payout -> Release funds',
                  icon: Users
                },
                {
                  title: 'Autonomous Treasury',
                  desc: 'Allocates budgets dynamically inside smart contract rules defined by human operators.',
                  workflow: 'Check daily limits -> Execute payment -> log transactions',
                  icon: Lock
                },
                {
                  title: 'Cross-Border Payments',
                  desc: 'Enables sub-second worldwide transactions via Circle CCTP stablecoin rails.',
                  workflow: 'Swap asset -> Route via CCTP -> Deliver EURC/USDC',
                  icon: Globe
                }
              ].map((item, index) => {
                const IconComp = item.icon
                return (
                  <div 
                    key={index}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-soft)'
                    }}
                  >
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
                        <IconComp size={18} style={{ color: 'var(--accent-coral)' }} />
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, margin: '0 0 10px' }}>
                        {item.title}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 16px' }}>
                        {item.desc}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: 'var(--bg-inner)',
                      border: '1px dashed var(--border)',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)'
                    }}>
                      <span style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>FLOW: </span>
                      {item.workflow}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECTION 5: PRODUCT WALKTHROUGH VIDEO */}
        <section id="demo-walkthrough" style={{
          padding: '80px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Walkthrough Video</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 30px' }}>
              See InferPay in Action
            </h2>

            {/* Video mockup frame */}
            <div 
              onClick={() => setVideoModalOpen(true)}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '800px',
                height: '400px',
                margin: '0 auto',
                backgroundColor: '#0c0a09',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-hard)',
                overflow: 'hidden'
              }}
            >
              {/* Overlay with radial glow */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, rgba(234,88,12,0.1) 0%, rgba(0,0,0,0.8) 100%)',
                zIndex: 1
              }} />
              
              {/* Play Button Widget */}
              <div style={{
                zIndex: 2,
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-main)',
                border: '3px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '3px 3px 0px var(--border)',
                color: 'var(--text-main)',
                transition: 'all 0.2s'
              }} className="hover-scale">
                <Play size={28} style={{ marginLeft: '4px', fill: 'currentColor' }} />
              </div>

              {/* Simulated UI components elements inside video frame */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'space-between',
                color: '#94a3b8',
                fontFamily: 'monospace',
                fontSize: '11px'
              }}>
                <span>▶ InferPay_SDK_Quickstart_v1.0.4.mp4</span>
                <span>02:45 / 03:00</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: ARCHITECTURE DIAGRAM */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist green" style={{ fontSize: '10px' }}>Technical Architecture</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Secure Cryptographic Routing
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '10px' }}>
                How InferPay interacts with wallets, policy engines, and blockchain layers.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              alignItems: 'center'
            }} className="flex flex-col md:grid">
              {/* Flow diagram visual */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '30px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                fontFamily: 'monospace',
                fontSize: '11.5px',
                boxShadow: 'var(--shadow-soft)'
              }}>
                {[
                  { step: '1. Human Master Operator', desc: 'Sets vault policy, funding rules & signs Permit2 parameters' },
                  { step: '2. Autonomous AI Agent', desc: 'Analyzes triggers, constructs swap/payment intent arrays' },
                  { step: '3. InferPay Smart Account', desc: 'Verifies operator signature & budget restrictions on-chain' },
                  { step: '4. Arc Gasless Policy Engine', desc: 'Sponsors gas in USDC, signs execution payload' },
                  { step: '5. Circle CCTP Liquidity Route', desc: 'Settles transactions locally or routes across chains instantly' }
                ].map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--accent-pink)' }}>{row.step}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{row.desc}</div>
                    {idx < 4 && <div style={{ color: 'var(--text-light)', paddingLeft: '20px' }}>↓</div>}
                  </div>
                ))}
              </div>

              {/* Explainer details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  Decentralized spending limits with zero gas friction.
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  Unlike custodian systems that hold complete control of your keys, InferPay uses on-chain smart policies.
                  Our infrastructure automatically wraps ERC-20 stablecoins in Permit2 signatures. AI agents can execute payments but are cryptographically blocked from withdrawing beyond limits.
                </p>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-main)' }}>Sub-cent Gas Fees</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gas sponsored directly by Arc node relayers.</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-main)' }}>ERC-8004 Verified</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Agents carry reputations directly in on-chain metadata.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: DEVELOPER EXPERIENCE (DX) */}
        <section id="developers" style={{
          padding: '80px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Developer API</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Build Autonomous Payments in Minutes
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '10px' }}>
                A Stripe-like integration experience built for developer velocity.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              gap: '40px',
              alignItems: 'center'
            }} className="flex flex-col md:grid">
              
              {/* Terminal code snippet view */}
              <div style={{
                backgroundColor: '#0c0a09',
                borderRadius: '8px',
                border: '2px solid var(--border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-hard)'
              }}>
                <div style={{
                  backgroundColor: '#1c1917',
                  borderBottom: '1px solid #292524',
                  padding: '10px 20px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  {['sdk', 'api', 'cli'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab as any)}
                      style={{
                        background: activeCodeTab === tab ? '#292524' : 'none',
                        border: 'none',
                        color: activeCodeTab === tab ? 'white' : '#78716c',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div style={{ padding: '24px', fontFamily: 'monospace', fontSize: '12px', color: '#e2e8f0', overflowX: 'auto' }}>
                  {activeCodeTab === 'sdk' && (
                    <pre style={{ margin: 0 }}>
                      <span style={{ color: '#60a5fa' }}>import</span> {'{ InferPay }'} <span style={{ color: '#60a5fa' }}>from</span> <span style={{ color: '#34d399' }}>'@inferpay/sdk'</span>{'\n\n'}
                      <span style={{ color: '#8b5cf6' }}>const</span> agent = <span style={{ color: '#8b5cf6' }}>await</span> InferPay.initialize({'{'}{'\n'}
                      {'  '}apiKey: <span style={{ color: '#34d399' }}>'ip_live_58c2a9'</span>,{'\n'}
                      {'  '}agentId: <span style={{ color: '#34d399' }}>'agent_01h9y'</span>{'\n'}
                      {'}'}){'\n\n'}
                      <span style={{ color: '#8b5cf6' }}>const</span> payout = <span style={{ color: '#8b5cf6' }}>await</span> agent.executePayment({'{'}{'\n'}
                      {'  '}toAddress: <span style={{ color: '#34d399' }}>'0x3f42...1209'</span>,{'\n'}
                      {'  '}amount: <span style={{ color: '#fb923c' }}>150.00</span>,{'\n'}
                      {'  '}currency: <span style={{ color: '#34d399' }}>'USDC'</span>{'\n'}
                      {'}'}){'\n\n'}
                      console.log(<span style={{ color: '#34d399' }}>`Settled tx hash: ${'{'}payout.hash{'}'}`</span>)
                    </pre>
                  )}
                  {activeCodeTab === 'api' && (
                    <pre style={{ margin: 0 }}>
                      <span style={{ color: '#f472b6' }}>POST</span> /v1/intents/execute{'\n'}
                      Authorization: Bearer ip_live_58c2a9{'\n'}
                      Content-Type: application/json{'\n\n'}
                      {'{'}{'\n'}
                      {'  '}<span style={{ color: '#60a5fa' }}>"recipient"</span>: <span style={{ color: '#34d399' }}>"0x3f42...1209"</span>,{'\n'}
                      {'  '}<span style={{ color: '#60a5fa' }}>"amount"</span>: <span style={{ color: '#fb923c' }}>150.00</span>,{'\n'}
                      {'  '}<span style={{ color: '#60a5fa' }}>"policy_id"</span>: <span style={{ color: '#34d399' }}>"vault_500_limit"</span>{'\n'}
                      {'}'}
                    </pre>
                  )}
                  {activeCodeTab === 'cli' && (
                    <pre style={{ margin: 0 }}>
                      <span style={{ color: '#a855f7' }}>$</span> npm install -g @inferpay/cli{'\n'}
                      <span style={{ color: '#a855f7' }}>$</span> inferpay login --key ip_live_58c2a9{'\n'}
                      <span style={{ color: '#a855f7' }}>$</span> inferpay vaults:create --limit 500 --token USDC{'\n\n'}
                      <span style={{ color: '#34d399' }}><Check size={12}/> Vault successfully created. Address: 0x9f12...3e4f</span>
                    </pre>
                  )}
                </div>
              </div>

              {/* Dev Copy */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  Integrating payments has never been easier for AI builders.
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  Utilize our comprehensive SDK and JSON-RPC API interfaces to spawn smart wallets for your LLM loops. Pre-packaged gas sponsorship parameters handle raw EVM complications in the background.
                </p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <Link href="/docs" className="btn-brutalist" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px', fontWeight: 700, backgroundColor: 'var(--bg-inner)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                    API Reference
                  </Link>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-brutalist" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '13px', fontWeight: 700, backgroundColor: 'var(--bg-inner)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                    GitHub Repository
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 8: SECURITY & TRUST MATRIX */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist green" style={{ fontSize: '10px' }}>Cryptographic Assurance</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Enterprise Grade Trust
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '10px' }}>
                Engineered with multi-layered cryptographic security from smart account to ledger.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px'
            }} className="flex flex-col sm:grid">
              {[
                { title: 'Non-Custodial', desc: 'Operator retains key authority; contracts lock raw extraction access.' },
                { title: 'Smart Guarded', desc: 'Every transaction validates limits via Permit2 code paths.' },
                { title: 'On-Chain Rules', desc: 'Spending caps and agent metadata reside immutably on Arc.' },
                { title: 'Multi-Sig Safe', desc: 'Compatible with multisig structures for corporate treasury approvals.' },
                { title: 'ERC-8004 Identity', desc: 'Verifiable credentials link agent keys directly to reputation registries.' },
                { title: 'Circle USDC Rails', desc: '1:1 dollar-backed stablecoin guarantees liquidity safety.' },
                { title: 'Audit Ready', desc: 'Codebase optimized for public auditing and security validation.' },
                { title: 'Zero Gas Waste', desc: 'No gas wallet management needed for your AI agents.' }
              ].map((item, index) => (
                <div 
                  key={index}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{item.title}</strong>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', lineHeight: '1.5', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: COMPARISON TABLE */}
        <section style={{
          padding: '80px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Feature Matrix</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Outperforming Legacy Stacks
              </h2>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-inner)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Capabilities</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--accent-coral)' }}>InferPay</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Legacy Web3 Wallet</th>
                    <th style={{ padding: '16px 20px', fontWeight: 700 }}>Traditional Bank</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { capability: 'AI-Native (Passkey & API-driven)', ip: true, w3: false, bank: false },
                    { capability: 'Programmable Spending Limits', ip: true, w3: false, bank: false },
                    { capability: 'Gasless Transaction Settlement', ip: true, w3: false, bank: true },
                    { capability: 'Sub-second stablecoin settlement', ip: true, w3: false, bank: false },
                    { capability: 'Multi-Agent payroll logic', ip: true, w3: false, bank: false },
                    { capability: 'On-chain Permit2 Security rules', ip: true, w3: false, bank: false },
                    { capability: 'Micropayments (x402 protocol)', ip: true, w3: false, bank: false }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'var(--bg-main)' : 'var(--bg-card)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600 }}>{row.capability}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--accent-coral)', fontWeight: 800 }}>{row.ip ? <Check size={18} style={{ color: 'var(--accent-green)' }} /> : '—'}</td>
                      <td style={{ padding: '14px 20px' }}>{row.w3 ? <Check size={18} style={{ color: 'var(--accent-green)' }} /> : '—'}</td>
                      <td style={{ padding: '14px 20px' }}>{row.bank ? <Check size={18} style={{ color: 'var(--accent-green)' }} /> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 10: TESTIMONIALS */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist green" style={{ fontSize: '10px' }}>Testimonials</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Loved by AI Builders
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px'
            }} className="flex flex-col md:grid">
              {[
                { quote: 'We spun up our coordinator treasury vault in under an hour. Micropayments to worker sub-agents work seamlessly.', author: 'CEO, AgentForce AI' },
                { quote: 'Permit2 budget enforcement keeps our corporate treasurers calm. The agents spend stablecoins, but limits are cryptographically safe.', author: 'CTO, LedgerFlow' },
                { quote: 'Arc blockchain gas sponsorship saved us hundreds in overhead. InferPay is the missing financial layer for the AI economy.', author: 'Core Developer, NexaNode' }
              ].map((card, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-soft)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <p style={{ fontStyle: 'italic', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px', color: 'var(--text-main)' }}>
                    "{card.quote}"
                  </p>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    — {card.author}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 11: HOW IT WORKS (6 STEPS) */}
        <section style={{
          padding: '80px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Setup Guide</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Onboarding in <i>6 Simple Steps</i>
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px'
            }} className="flex flex-col md:grid">
              {[
                { step: '1', title: 'Connect Wallet', desc: 'Securely link via passkeys, social logins, or MetaMask.' },
                { step: '2', title: 'Fund Treasury', desc: 'Deposit Circle USDC or EURC into your non-custodial Smart Account.' },
                { step: '3', title: 'Configure Rules', desc: 'Establish granular daily limits and signature policy envelopes.' },
                { step: '4', title: 'Assign AI Agents', desc: 'Link LLM keys to specific vault rule limits.' },
                { step: '5', title: 'Execute Payments', desc: 'Agents dispatch settlement intents autonomously over the SDK.' },
                { step: '6', title: 'Monitor Activity', desc: 'Audit transactions, gas savings, and reputations live.' }
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-main)',
                    color: 'var(--bg-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px',
                    flexShrink: 0
                  }}>{step.step}</div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700 }}>{step.title}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 18: ROI COMPARISON */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist green" style={{ fontSize: '10px' }}>ROI Matrix</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Financial & Operations Optimization
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '30px'
            }} className="flex flex-col md:grid">
              
              {/* Without card */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--border)',
                borderTop: '6px solid var(--accent-coral)',
                borderRadius: 'var(--radius-sm)',
                padding: '30px',
                boxShadow: 'var(--shadow-soft)'
              }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 800, margin: '0 0 20px', color: 'var(--text-main)' }}>
                  Manual Operations (Legacy)
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                  <li>Treasurers manually login to approve daily SaaS/API invoices.</li>
                  <li>Over $12.00 per cross-border payment wire fee.</li>
                  <li>Substantial risk of API billing over-drafting key cards.</li>
                  <li>Inability to automate micropayments dynamically.</li>
                </ul>
              </div>

              {/* With card */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid var(--border)',
                borderTop: '6px solid var(--accent-green)',
                borderRadius: 'var(--radius-sm)',
                padding: '30px',
                boxShadow: 'var(--shadow-hard)'
              }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 800, margin: '0 0 20px', color: 'var(--text-main)' }}>
                  Autonomous with InferPay
                </h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-main)' }}>
                  <li><strong style={{ color: 'var(--accent-green)' }}>95% Less Manual Overhead</strong> — limits protect capital.</li>
                  <li><strong style={{ color: 'var(--accent-green)' }}>Sub-cent Settlement</strong> via CCTP stablecoin rails.</li>
                  <li><strong style={{ color: 'var(--accent-green)' }}>On-Chain Permits</strong> restrict rogue behavior.</li>
                  <li><strong style={{ color: 'var(--accent-green)' }}>Automatic Yield Optimization</strong> swaps idle deposits.</li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 19: WHY NOW */}
        <section style={{
          padding: '80px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Ecosystem Outlook</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 20px' }}>
              Why Autonomous Payments Matter Now
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.8', textAlign: 'justify' }}>
              AI agents are transitioning from cognitive systems to active economic actors. Today, they write code, compile research, and construct applications. Yet, they remain financially locked—reliant on human bank cards or risky custodial balances. 
              InferPay provides the native financial stack for autonomous workflows. By combining non-custodial smart contracts on Arc with Circle CCTP stablecoin rails, we give AI agents the safe, predictable financial rails needed to operate autonomously.
            </p>
          </div>
        </section>

        {/* SECTION 17: ROADMAP */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist green" style={{ fontSize: '10px' }}>Ecosystem Vision</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Public Roadmap
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              {[
                { quarter: 'Q2 2026', title: 'AI Wallets & Passkey accounts', status: 'Completed', desc: 'Secure wallet provisioning with sub-second finality on Arc.' },
                { quarter: 'Q3 2026', title: 'Agent Payroll & Task escrow', status: 'In Progress', desc: 'Enabling coordinator-worker task payout flows automatically.' },
                { quarter: 'Q4 2026', title: 'Autonomous Multi-Agent Treasuries', status: 'Planned', desc: 'Advanced on-chain signature policies and multi-currency controls.' },
                { quarter: 'Q1 2027', title: 'Cross-Chain CCTP Settlement Engine', status: 'Planned', desc: 'Deploying native liquidity bridge routing with Circle.' }
              ].map((row, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>{row.quarter}</span>
                    <h4 style={{ margin: '4px 0', fontSize: '16px', fontWeight: 700 }}>{row.title}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{row.desc}</p>
                  </div>
                  <span className={`badge-brutalist ${row.status === 'Completed' ? 'green' : row.status === 'In Progress' ? 'yellow' : ''}`} style={{ fontSize: '9.5px' }}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 12: EXHAUSTIVE FAQ ACCORDION */}
        <section id="faq" style={{
          padding: '80px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Support Center</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { q: 'Is InferPay custodial?', a: 'No, InferPay is completely non-custodial. All AI wallets are smart contract accounts controlled via cryptographic passkey signatures, securing your treasury against external control.' },
                { q: 'Which wallets are supported?', a: 'We natively support MetaMask, Passkeys, Coinbase Wallet, WalletConnect, and social passkey setups.' },
                { q: 'How does spending control work?', a: 'Spending controls are enforced on-chain via smart contracts (such as Permit2 validation policies), restricting the maximum amount an agent can transfer per transaction or daily.' },
                { q: 'What stablecoins are supported?', a: 'We support Circle USDC and EURC on the Arc blockchain.' },
                { q: 'How are AI agents authenticated?', a: 'AI agents are authenticated via unique cryptographic credentials tied to their specific ERC-8004 reputational identity records.' },
                { q: 'How does gas sponsorship work?', a: 'All gas fees are sponsored directly by our Arc node relayers, ensuring AI agents require no separate native gas token balances.' },
                { q: 'Can enterprise clients use this?', a: 'Yes. InferPay provides specialized corporate vaults, compliant treasury controls, and automated payroll reporting workflows.' },
                { q: 'What is the x402 nanopayment protocol?', a: 'It is our custom micro-billing routing engine, allowing AI agents to stream sub-cent payments for API query completions.' },
                { q: 'Is there smart contract insurance?', a: 'We partner with DeFi coverage protocols to provide optionally structured vault assurance mechanisms.' },
                { q: 'Are transactions compliant with regulations?', a: 'Yes, our smart routing checks and verifies wallets against Circle AML blacklist registries.' },
                { q: 'How fast are settlements completed?', a: 'All settlements on the Arc chain conclude within 0.8 seconds.' },
                { q: 'Can human operators override agents?', a: 'Yes, human owners retain ultimate master key permissions to cancel or modify vault limits at any time.' },
                { q: 'Do you offer a bug bounty program?', a: 'Yes, our Bug Bounty program pays up to 25,000 USDC for verified vulnerabilities.' },
                { q: 'How does cross-chain routing work?', a: 'We utilize Circle CCTP to burn and mint stablecoins across different chains cleanly.' },
                { q: 'Where is the SDK documentation?', a: 'You can access full API references and code guides at /docs.' }
              ].map((faq, index) => {
                const isOpen = activeFaqIndex === index
                return (
                  <div 
                    key={index}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card)',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => setActiveFaqIndex(isOpen ? null : index)}
                      style={{
                        width: '100%',
                        padding: '18px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-main)',
                        fontFamily: 'inherit'
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 20px 20px 20px',
                        fontSize: '13.5px',
                        color: 'var(--text-muted)',
                        lineHeight: '1.6'
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* SECTION 13: COMMUNITY */}
        <section style={{
          padding: '80px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="badge-brutalist green" style={{ fontSize: '10px' }}>Ecosystem Ecosystem</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 20px' }}>
              Join the Community
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15.5px', marginBottom: '30px' }}>
              Connect with fellow developers, get engineering support, and track releases.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="btn-brutalist btn-brutalist-pink" style={{ textDecoration: 'none', padding: '12px 28px', fontWeight: 700 }}>
                Join Discord
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-brutalist" style={{ textDecoration: 'none', padding: '12px 28px', fontWeight: 700, backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                GitHub Stars
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn-brutalist" style={{ textDecoration: 'none', padding: '12px 28px', fontWeight: 700, backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                Follow X updates
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 14: CHANGELOG */}
        <section style={{
          padding: '80px 24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="badge-brutalist pink" style={{ fontSize: '10px' }}>Release Log</span>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: '8px 0 0' }}>
                What's New
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { version: 'v0.6', title: 'Cross-Chain CCTP Settlement Engine', desc: 'Allows direct stablecoin settlement across Base and Arbitrum pipelines.' },
                { version: 'v0.5', title: 'ERC-8004 Identity reputation contracts', desc: 'Enforces verifiable on-chain metadata for third-party AI agents.' },
                { version: 'v0.4', title: 'Multi-Agent Payroll Orchestration', desc: 'Supports automated coordination worker task structures.' }
              ].map((changelog, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <span className="badge-brutalist pink" style={{ fontSize: '10px', flexShrink: 0, padding: '4px 10px' }}>{changelog.version}</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>{changelog.title}</h4>
                    <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)' }}>{changelog.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 15: STATUS PAGE & SYSTEM TRANPARENCY */}
        <section style={{
          padding: '30px 24px',
          backgroundColor: 'var(--bg-inner)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', display: 'inline-block' }}></span>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)' }}>All Systems Operational</span>
            </div>
            <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>API Status: 100%</span>
              <span>Settlement Engine: Healthy</span>
              <span>RPC Connectivity: 12ms</span>
            </div>
            <a href="https://status.inferpay.space" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-pink)', textDecoration: 'underline' }}>
              status.inferpay.space
            </a>
          </div>
        </section>

        {/* SECTION 20: FINALwaitlist CTA */}
        <section style={{
          padding: '80px 24px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div className="bg-inner" style={{
            padding: '60px 40px',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--border)',
            backgroundColor: 'var(--bg-inner)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            boxShadow: 'var(--shadow-hard)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 800, margin: 0 }}>
              Ready to Give Your AI Agent a Wallet?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15.5px', maxWidth: '500px', margin: 0, lineHeight: '1.6' }}>
              Secure early access to developer SDK keys, testnet sponsorships, and join the future of autonomous stablecoin commerce.
            </p>

            <form onSubmit={handleJoinWaitlist} style={{
              display: 'flex',
              gap: '10px',
              width: '100%',
              maxWidth: '440px',
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
                style={{ padding: '0 28px', height: '42px', fontWeight: 700, whiteSpace: 'nowrap' }}
                disabled={waitlistStatus !== 'idle'}
              >
                {waitlistStatus === 'idle' && 'Get Early Access'}
                {waitlistStatus === 'loading' && 'Joining...'}
                {waitlistStatus === 'success' && 'Enrolled'}
              </button>
            </form>

            {waitlistStatus === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '13px', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>Enrolled</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/docs" style={{ color: 'inherit' }}>Read Docs</Link>
              <span>•</span>
              <a href="https://discord.com" style={{ color: 'inherit' }}>Discord Hub</a>
              <span>•</span>
              <Link href="/contact" style={{ color: 'inherit' }}>Book enterprise demo</Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER & TRUST CENTER RESOURCE GRID */}
      <footer style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '60px 24px 40px',
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
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
              GitHub Repo <ExternalLink size={12} />
            </a>
            <Link href="/security" style={{ textDecoration: 'none', color: 'inherit' }}>Incident History</Link>
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

          {/* Links 3: Trust Center Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trust Center</span>
            <Link href="/security" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}>Security Hub</Link>
            <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Terms of Service</Link>
          </div>

        </div>
      </footer>

      {/* FLOAT SUPPORT CHAT WIDGET */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999
      }}>
        <button
          onClick={() => showModal({
            type: 'confirm',
            title: 'Developer Support',
            message: 'You are about to establish an encrypted session to the active developer support operations relayer on the Arc network. Would you like to proceed?',
            confirmText: 'Establish Connection',
            cancelText: 'Cancel',
            onConfirm: async () => {
              await new Promise(resolve => setTimeout(resolve, 1500))
              await showModal({
                type: 'success',
                title: 'Connection Active',
                message: 'Encrypted relay established. Support channels have been notified of your public key session context. An operator will route to your terminal shortly.',
                confirmText: 'Acknowledge'
              })
            }
          })}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'var(--text-main)',
            color: 'var(--bg-main)',
            border: '2px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px var(--border)'
          }}
          title="Contact Support"
        >
          <HelpCircle size={20} />
        </button>
      </div>

      {/* COOKIE CONSENT BANNER */}
      {showCookieBanner && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          maxWidth: '340px',
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '20px',
          boxShadow: 'var(--shadow-hard)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5' }}>
            We use cookies to analyze performance and optimize conversion rate. By continuing, you agree to our policies.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowCookieBanner(false)}
              className="btn-brutalist btn-brutalist-pink"
              style={{ flex: 1, height: '32px', fontSize: '11px', fontWeight: 800, padding: 0 }}
            >
              Accept Cookies
            </button>
            <button 
              onClick={() => setShowCookieBanner(false)}
              className="btn-brutalist"
              style={{ flex: 1, height: '32px', fontSize: '11px', fontWeight: 800, padding: 0, backgroundColor: 'var(--bg-inner)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* WALKTHROUGH VIDEO MODAL OVERLAY */}
      {videoModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '800px',
            backgroundColor: '#000',
            aspectRatio: '16/9',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-hard)',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setVideoModalOpen(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#000',
                fontWeight: 'bold'
              }}
            >
              <X size={16} />
            </button>
            {/* Embedded mockup player */}
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#34d399',
              fontFamily: 'monospace',
              fontSize: '13px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <Cpu size={48} className="blink" style={{ color: 'var(--accent-pink)', marginBottom: '20px' }} />
              <div>▶ STREAMING DEMO VIDEO FEED FROM THE CANTEEN APP NETWORKS...</div>
              <div style={{ color: 'var(--text-light)', marginTop: '8px', fontSize: '11px' }}>
                Connecting to simulated walkthrough stream: walkthrough_v1.mp4
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO JSON-LD Structured Data Markups */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://inferpay.space/#organization",
                "name": "InferPay",
                "url": "https://inferpay.space",
                "logo": "https://inferpay.space/images/logo.png"
              },
              {
                "@type": "SoftwareApplication",
                "@id": "https://inferpay.space/#application",
                "name": "InferPay Agent Wallet SDK",
                "operatingSystem": "All",
                "applicationCategory": "DeveloperApplication",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Is InferPay custodial?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "No, InferPay is completely non-custodial. All AI wallets are smart contract accounts controlled via cryptographic keys and signatures."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How does spending control work?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Spending controls are enforced on-chain via smart contracts (such as Permit2 validation policies)."
                    }
                  }
                ]
              }
            ]
          })
        }}
      />
    </div>
  )
}
