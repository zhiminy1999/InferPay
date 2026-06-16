'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
            Infer<i>Pay</i> Terms
          </span>
        </div>
      </header>

      <main style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '60px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 800, margin: 0 }}>
          Terms of <i>Service</i>
        </h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
          <p>Last updated: June 16, 2026</p>
          
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '10px 0 0' }}>1. Acceptance of Terms</h3>
          <p>
            By accessing or using the InferPay decentralized platform (including but not limited to the treasury dashboards, x402 gateways, or simulated APIs), you agree to be bound by these terms. If you do not agree, please do not use the application.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '10px 0 0' }}>2. Disclaimers & Risks</h3>
          <p>
            All deployments and features of InferPay are currently on the Arc Testnet. No real-world assets are traded or held by the platform. You acknowledge that blockchain smart contract interactions carry inherent technology risks, and the platform is provided 'as is' without warranty.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '10px 0 0' }}>3. Govering Law</h3>
          <p>
            Any disputes arising from your use of this software will be resolved in accordance with relevant decentralized protocol standards and open-source licensing principles.
          </p>
        </div>
      </main>
    </div>
  )
}
