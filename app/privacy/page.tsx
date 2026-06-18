'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
            Infer<i>Pay</i> Privacy
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
          Privacy <i>Policy</i>
        </h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
          <p>Last updated: June 16, 2026</p>
          
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '10px 0 0' }}>1. Data Collection</h3>
          <p>
            InferPay is a non-custodial decentralized application. We do not require or collect personal identity credentials (such as real names, physical addresses, or phone numbers). We only collect public cryptocurrency wallet addresses that you choose to connect, and emails provided voluntarily for waitlist registry.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '10px 0 0' }}>2. Cookies & Analytics</h3>
          <p>
            We use minimal cookies necessary to persist session state. Local browser storage is utilized to temporarily store user preference states (like dark mode preference, active tab selection) and simulated test balances.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '10px 0 0' }}>3. Contact Information</h3>
          <p>
            If you have questions regarding this privacy policy, please contact our team via support@inferpay.space.
          </p>
        </div>
      </main>
    </div>
  )
}
