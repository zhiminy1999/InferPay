'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BookOpen, 
  Terminal, 
  Cpu, 
  Key, 
  Zap, 
  Shield, 
  Copy, 
  Check,
  ChevronRight
} from 'lucide-react'

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'intro' | 'quickstart' | 'x402' | 'identity'>('intro')

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  const quickStartSnippet = `import { InferPaySDK } from '@inferpay/sdk'
import { ethers } from 'ethers'

// 1. Initialize client on Arc Testnet (USDC as Gas)
const client = new InferPaySDK({
  apiKey: process.env.INFERPAY_API_KEY,
  rpcUrl: 'https://arc-testnet.circle.com/v1'
})

// 2. Set gasless permission limit for autonomous agent
const session = await client.createSession({
  agentAddress: '0x8004...agent',
  limitUsdc: '500.00',
  expiresInSeconds: 86400 // 24 hours
})

console.log('Session established:', session.sessionId)`

  const x402Snippet = `// 3. Initiate client-side x402 micropayment query challenge
const response = await fetch('https://api.inferpay.xyz/gateway/inference', {
  headers: {
    'X-402-Service-Id': 'gpt-4o-custom-agent',
    'X-402-Payment-Proof': session.paymentProof
  }
})

const data = await response.json()`

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
            Infer<i>Pay</i> Docs
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

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: '40px'
      }} className="flex flex-col md:grid">
        
        {/* Sidebar Navigation */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Core Guides
            </div>
            
            <button 
              onClick={() => setActiveSubTab('intro')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: activeSubTab === 'intro' ? '1px solid var(--border)' : '1px solid transparent',
                backgroundColor: activeSubTab === 'intro' ? 'var(--bg-card)' : 'transparent',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: activeSubTab === 'intro' ? 700 : 500,
                color: activeSubTab === 'intro' ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <BookOpen size={14} /> Introduction
            </button>

            <button 
              onClick={() => setActiveSubTab('quickstart')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: activeSubTab === 'quickstart' ? '1px solid var(--border)' : '1px solid transparent',
                backgroundColor: activeSubTab === 'quickstart' ? 'var(--bg-card)' : 'transparent',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: activeSubTab === 'quickstart' ? 700 : 500,
                color: activeSubTab === 'quickstart' ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <Terminal size={14} /> Quick Start
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Advanced Protocols
            </div>

            <button 
              onClick={() => setActiveSubTab('x402')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: activeSubTab === 'x402' ? '1px solid var(--border)' : '1px solid transparent',
                backgroundColor: activeSubTab === 'x402' ? 'var(--bg-card)' : 'transparent',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: activeSubTab === 'x402' ? 700 : 500,
                color: activeSubTab === 'x402' ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <Zap size={14} /> x402 Micropayments
            </button>

            <button 
              onClick={() => setActiveSubTab('identity')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: activeSubTab === 'identity' ? '1px solid var(--border)' : '1px solid transparent',
                backgroundColor: activeSubTab === 'identity' ? 'var(--bg-card)' : 'transparent',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: activeSubTab === 'identity' ? 700 : 500,
                color: activeSubTab === 'identity' ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <Cpu size={14} /> ERC-8004 Identity
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main>
          {activeSubTab === 'intro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: 0 }}>
                Introduction
              </h1>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-muted)', margin: 0 }}>
                InferPay is a decentralized, autonomous treasury commerce stack built specifically for artificial intelligence agents and automated micro-economies. Powered by Circle USDC/EURC stablecoins and deployed on the ultra-fast, zero-gas-friction Arc chain, InferPay provides the secure rails for machine-to-machine financial operations.
              </p>
              
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, margin: '10px 0 0' }}>
                Why InferPay?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="flex flex-col sm:grid">
                <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} style={{ color: 'var(--accent-coral)' }} /> Gasless Friction
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5', margin: 0 }}>
                    Transactions utilize USDC natively for gas. Through sponsor paymasters, end-users pay $0 in gas fees.
                  </p>
                </div>
                <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} style={{ color: 'var(--accent-green)' }} /> Smart Policies
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5', margin: 0 }}>
                    Permit2 session keys restrict agent budgets. Agents cannot overspend, steal, or bypass multi-key team approval limits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'quickstart' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: 0 }}>
                Quick Start
              </h1>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-muted)', margin: 0 }}>
                Configure your agent budget session using our lightweight SDK in under 5 minutes.
              </p>

              {/* Code Snippet Box */}
              <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)', padding: 0 }}>
                <div style={{
                  backgroundColor: 'var(--bg-inner)',
                  borderBottom: '1px solid var(--border)',
                  padding: '10px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>sdk-init.ts</span>
                  <button 
                    onClick={() => copyToClipboard(quickStartSnippet, 'snippet1')}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {copiedCode === 'snippet1' ? <Check size={11} /> : <Copy size={11} />}
                    {copiedCode === 'snippet1' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre style={{
                  padding: '20px',
                  margin: 0,
                  overflowX: 'auto',
                  fontSize: '12.5px',
                  lineHeight: '1.5',
                  color: 'var(--text-main)',
                  fontFamily: 'monospace'
                }}>
                  <code>{quickStartSnippet}</code>
                </pre>
              </div>
            </div>
          )}

          {activeSubTab === 'x402' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: 0 }}>
                x402 Micropayments Protocol
              </h1>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-muted)', margin: 0 }}>
                The x402 protocol is a HTTP-level payment challenge standard that enables APIs to return a <code>402 Payment Required</code> challenge status header. AI Agents automatically settle these challenges in real time using their pre-authorized Gateway Nanopayment balances.
              </p>

              {/* Code Snippet Box */}
              <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)', padding: 0 }}>
                <div style={{
                  backgroundColor: 'var(--bg-inner)',
                  borderBottom: '1px solid var(--border)',
                  padding: '10px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>x402-fetch.ts</span>
                  <button 
                    onClick={() => copyToClipboard(x402Snippet, 'snippet2')}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {copiedCode === 'snippet2' ? <Check size={11} /> : <Copy size={11} />}
                    {copiedCode === 'snippet2' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre style={{
                  padding: '20px',
                  margin: 0,
                  overflowX: 'auto',
                  fontSize: '12.5px',
                  lineHeight: '1.5',
                  color: 'var(--text-main)',
                  fontFamily: 'monospace'
                }}>
                  <code>{x402Snippet}</code>
                </pre>
              </div>
            </div>
          )}

          {activeSubTab === 'identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 700, margin: 0 }}>
                ERC-8004 Identity & Reputation
              </h1>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-muted)', margin: 0 }}>
                Every agent registering on the InferPay ecosystem obtains a cryptographic ERC-8004 identity certificate. This token captures audit scores, historic payment completion rates, consensus approval ratios, and client testimonials.
              </p>
              <div className="bg-inner" style={{ padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-inner)' }}>
                <h4 style={{ margin: '0 0 8px', fontWeight: 700 }}>Security Compliance Standards:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <li>All agent identity certificates reside on-chain on the Arc ledger.</li>
                  <li>Reputations update asynchronously after job verification routines.</li>
                  <li>Malicious agent accounts can be blacklisted by consensus committee votes.</li>
                </ul>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}
