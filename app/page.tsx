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
  Play
} from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [activeFeatureTab, setActiveFeatureTab] = useState<'escrow' | 'intent' | 'yield' | 'nanopay'>('escrow')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            boxShadow: 'var(--shadow-soft)'
          }}>
            {/* Window bar */}
            <div style={{
              backgroundColor: 'var(--bg-inner)',
              borderBottom: '1px solid var(--border)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#eab308', display: 'block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'block' }}></span>
              </div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-card)',
                padding: '3px 20px',
                borderRadius: '100px',
                border: '1px solid var(--border)',
                letterSpacing: '0.05em'
              }}>
                app.inferpay.xyz/dashboard
              </div>
              <div style={{ width: '40px' }} />
            </div>

            {/* Dashboard Mockup Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              minHeight: '420px',
              backgroundColor: 'var(--bg-main)'
            }} className="flex flex-col md:grid">
              
              {/* Fake Sidebar */}
              <div style={{
                borderRight: '1px solid var(--border)',
                padding: '20px 15px',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }} className="hidden md:flex">
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em' }}>Agent Systems</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-inner)', border: '1px solid var(--border)', fontSize: '12.5px', fontWeight: 700 }}>
                    <Lock size={14} style={{ color: 'var(--accent-coral)' }} />
                    <span>AI Spending Budget</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-muted)' }}>
                    <ArrowRightLeft size={14} />
                    <span>Smart Bill Pay</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-muted)' }}>
                    <Coins size={14} />
                    <span>Savings Optimizer</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-muted)' }}>
                    <Shield size={14} />
                    <span>Approval Committee</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', padding: '10px', backgroundColor: 'var(--bg-inner)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    <Zap size={11} style={{ color: 'var(--accent-coral)' }} /> Gas Costs
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>0.0004 USDC</div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-light)', marginTop: '2px' }}>Sub-second finality on Arc</div>
                </div>
              </div>

              {/* Fake Dashboard Body */}
              <div style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700 }}>
                      Operational <i>AI Vault</i>
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Policy rules enforced by Arc smart contracts</p>
                  </div>
                  <span className="badge-brutalist success">● Active Policy</span>
                </div>

                {/* Simulated Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }} className="flex flex-col md:grid">
                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Daily Spend Limit</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>500.00 USDC</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Available Balance</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>12,450.80 USDC</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase' }}>Gas Savings (Arc)</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-coral)', marginTop: '4px' }}>98.4% Less</div>
                  </div>
                </div>

                {/* Simulated Interactive action box */}
                <div className="bg-inner" style={{ padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-inner)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700 }}>Simulate AI Intent execution:</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Requires Permit2 signatures</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }} className="flex flex-col sm:flex-row">
                    <button className="btn-brutalist btn-brutalist-pink" style={{ padding: '8px 15px', fontSize: '12px', flex: 1 }}>
                      Trigger Auto-Swap to EURC
                    </button>
                    <button className="btn-brutalist" style={{ padding: '8px 15px', fontSize: '12px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', flex: 1 }}>
                      Approve Agent Invoice
                    </button>
                  </div>
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
            <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Terms of Service</Link>
          </div>

        </div>
      </footer>
    </div>
  )
}
