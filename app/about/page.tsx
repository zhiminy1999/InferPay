'use client'

import Link from 'next/link'
import { ArrowLeft, Users, Shield, Target, Award, Github, Twitter } from 'lucide-react'

export default function AboutPage() {
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-main)', 
      minHeight: '100vh', 
      color: 'var(--text-main)',
      fontFamily: 'var(--font-sans)',
      position: 'relative'
    }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700
          }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
          <span style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '17px', 
            fontWeight: 700, 
            letterSpacing: '-0.02em',
            color: 'var(--text-main)' 
          }}>
            Infer<i>Pay</i> About
          </span>
        </div>

        <Link href="/dashboard" className="btn-brutalist btn-brutalist-pink" style={{
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 700,
          textDecoration: 'none'
        }}>
          Launch App
        </Link>
      </header>

      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        
        {/* Story Intro */}
        <section style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 800, margin: 0 }}>
            Who We Are & <i>Why We Build</i>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '12px', lineHeight: '1.6' }}>
            We are building the trust layer for machine-to-machine stablecoin payments.
          </p>
        </section>

        {/* Narrative / Mission */}
        <section className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)', padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <Target size={20} style={{ color: 'var(--accent-coral)' }} />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700 }}>Our Mission</h3>
          </div>
          <p style={{ margin: 0, fontSize: '14.5px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
            Traditional financial infrastructure is built for human speed and compliance checks. As AI agents start autonomously taking over software tasks, API calling, and operational processes, they require an entirely different payment architecture: micro-cent transaction limits, zero-gas friction, automated bill processing, and cryptographic team-based consensus policies. InferPay was built to solve these challenges natively on the Arc Testnet.
          </p>
        </section>

        {/* Story Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: 0 }}>
            The <i>Hackathon Origins</i>
          </h2>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            InferPay was originally conceived during the Circle Stablecoins Commerce Challenge. We noticed that Web3 developer tooling lacks intuitive non-custodial delegation wrappers for AI wallets. We set out to create a modular smart-contract ecosystem leveraging Uniswap\'s Permit2 standards, Circle\'s cross-chain CCTP bridges, and Arc\'s native gas-token optimization, packaging it into a beautiful, human-first warm minimalist interface.
          </p>
        </section>

        {/* Core Values */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="flex flex-col sm:grid">
          <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
              <Shield size={16} style={{ color: 'var(--accent-green)' }} /> Security-First
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5', margin: 0 }}>
              All wallet session permits are non-custodial. Cryptographic spend limits prevent rogue agents from draining balances.
            </p>
          </div>

          <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
              <Award size={16} style={{ color: 'var(--accent-pink)' }} /> Standardized Protocol
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5', margin: 0 }}>
              Built using standard Ethereum proposals (ERC-8004 agent registries & ERC-8183 job contracts) for total wallet interoperability.
            </p>
          </div>
        </section>

        {/* Simple Team Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, margin: 0 }}>
            Meet the <i>Founders</i>
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="flex flex-col sm:grid">
            {/* Team Member 1 */}
            <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-inner)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-muted)'
              }}>Z</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Zhimin Y.</h4>
                <p style={{ margin: '2px 0 6px', fontSize: '12px', color: 'var(--text-muted)' }}>Core Protocol Architect</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="https://github.com" style={{ color: 'var(--text-light)' }}><Github size={13} /></a>
                  <a href="https://twitter.com" style={{ color: 'var(--text-light)' }}><Twitter size={13} /></a>
                </div>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-inner)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-muted)'
              }}>E</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Eric L.</h4>
                <p style={{ margin: '2px 0 6px', fontSize: '12px', color: 'var(--text-muted)' }}>Lead UI / UX Engineer</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="https://github.com" style={{ color: 'var(--text-light)' }}><Github size={13} /></a>
                  <a href="https://twitter.com" style={{ color: 'var(--text-light)' }}><Twitter size={13} /></a>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  )
}
