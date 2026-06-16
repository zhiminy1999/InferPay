'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react'

interface FAQItem {
  id: number
  question: string
  answer: string
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "What is InferPay?",
      answer: "InferPay is a decentralized payment and treasury management stack built for autonomous AI agents. It enables users to deposit stablecoins (USDC/EURC), set strict programmatic spending limits, automate bill payments, and hire AI contractors safely on the Arc Testnet without direct developer custom integration."
    },
    {
      id: 2,
      question: "How do AI agents spend money without keys?",
      answer: "InferPay uses EIP-2612 Permit2 session signatures. You grant permission for specific amounts (e.g. up to 100 USDC per day) for specific contract destinations. The agent requests execution, and the payment settles through non-custodial smart contracts. The agent never gains access to your wallet private key."
    },
    {
      id: 3,
      question: "What stablecoins are supported?",
      answer: "Currently, InferPay natively supports Circle USDC and EURC. You can easily deposit on other networks and swap between them in real time using the Savings Optimizer's integrated StableFX quotes."
    },
    {
      id: 4,
      question: "What is the x402 Micropayments Protocol?",
      answer: "The x402 protocol is a new machine-to-machine payment flow. When an AI agent triggers an API query, the API can return a '402 Payment Required' HTTP header. InferPay automatically signs and settles the fractional payment, providing a seamless transaction receipt instantly."
    },
    {
      id: 5,
      question: "Is there any gas cost?",
      answer: "On the Arc blockchain, gas is denominated in USDC, yielding highly predictable, micro-cent costs (~0.0004 USDC per transaction). Through our gas paymaster sponsorship module, we sponsor transaction gas completely for active users."
    },
    {
      id: 6,
      question: "Are the smart contracts audited?",
      answer: "Yes. InferPay is built on audited open-source standards including Uniswap's Permit2, Circle's CCTP bridging contracts, and custom security multi-signature controls. All code is public and reviewable on our GitHub repository."
    }
  ]

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
    }
  }

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            Infer<i>Pay</i> FAQ
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
        maxWidth: '720px',
        margin: '0 auto',
        padding: '60px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, margin: 0 }}>
            Frequently Asked <i>Questions</i>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '10px' }}>
            Find answers to commonly asked questions about agent payments, setup, and protocol limits.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '15px',
            color: 'var(--text-muted)'
          }} />
          <input 
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="brutalist-input"
            style={{
              paddingLeft: '42px',
              width: '100%',
              backgroundColor: 'var(--bg-card)'
            }}
          />
        </div>

        {/* FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div 
                key={faq.id}
                className="brutalist-card"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => toggleExpand(faq.id)}
              >
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '14.5px',
                  backgroundColor: expandedId === faq.id ? 'var(--bg-inner)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HelpCircle size={16} style={{ color: 'var(--accent-coral)' }} />
                    <span>{faq.question}</span>
                  </div>
                  {expandedId === faq.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {expandedId === faq.id && (
                  <div style={{
                    padding: '20px',
                    borderTop: '1px solid var(--border)',
                    fontSize: '13.5px',
                    lineHeight: '1.6',
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-card)',
                    animation: 'slideDown 0.2s ease-out'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)'
            }}>
              No matching answers found. Try searching for different keywords or contact us directly.
            </div>
          )}
        </div>

        {/* Contact info box */}
        <div className="bg-inner" style={{
          padding: '25px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-inner)',
          textAlign: 'center',
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Still have questions?</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            We're here to help you get integrated with Arc chain agent wallets.
          </p>
          <Link href="/contact" className="btn-brutalist btn-brutalist-pink" style={{
            padding: '8px 20px',
            fontSize: '12.5px',
            fontWeight: 700,
            textDecoration: 'none',
            marginTop: '5px'
          }}>
            Contact Team
          </Link>
        </div>
      </main>
    </div>
  )
}
