'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Bug, Lightbulb, Mail } from 'lucide-react'

export default function ContactPage() {
  const [formType, setFormType] = useState<'general' | 'bug' | 'feature'>('general')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !message) return
    setStatus('loading')
    setTimeout(() => {
      setStatus('success')
      setEmail('')
      setMessage('')
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
            Infer<i>Pay</i> Contact
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
        maxWidth: '600px',
        margin: '0 auto',
        padding: '60px 24px 80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 800, margin: 0 }}>
            Get in <i>Touch</i>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '10px' }}>
            Report bugs, request protocol features, or make general integrations inquiries.
          </p>
        </div>

        {/* Contact Form Container */}
        <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)', padding: '30px' }}>
          {status === 'success' ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px',
              padding: '40px 0',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={40} style={{ color: 'var(--accent-green)' }} />
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700 }}>Message Sent!</h3>
                <p style={{ margin: '8px 0 0', fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '300px' }}>
                  Thank you for reaching out. A team member will reply to you within 24 hours.
                </p>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="btn-brutalist"
                style={{ padding: '8px 20px', fontSize: '12.5px', marginTop: '10px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Type Selectors */}
              <div>
                <label className="brutalist-label">Feedback Type</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }} className="flex flex-col sm:flex-row">
                  <button 
                    type="button"
                    onClick={() => setFormType('general')}
                    className="btn-brutalist"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      backgroundColor: formType === 'general' ? 'var(--bg-inner)' : 'var(--bg-card)',
                      border: formType === 'general' ? '1px solid var(--text-main)' : '1px solid var(--border)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <MessageSquare size={13} /> General
                  </button>

                  <button 
                    type="button"
                    onClick={() => setFormType('bug')}
                    className="btn-brutalist"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      backgroundColor: formType === 'bug' ? 'var(--bg-inner)' : 'var(--bg-card)',
                      border: formType === 'bug' ? '1px solid var(--text-main)' : '1px solid var(--border)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Bug size={13} /> Report Bug
                  </button>

                  <button 
                    type="button"
                    onClick={() => setFormType('feature')}
                    className="btn-brutalist"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      backgroundColor: formType === 'feature' ? 'var(--bg-inner)' : 'var(--bg-card)',
                      border: formType === 'feature' ? '1px solid var(--text-main)' : '1px solid var(--border)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Lightbulb size={13} /> Feature Request
                  </button>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="brutalist-label" htmlFor="email-input">Your Email Address</label>
                <input 
                  id="email-input"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="brutalist-input"
                  style={{ width: '100%', marginTop: '6px', backgroundColor: 'var(--bg-card)' }}
                  required
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="brutalist-label" htmlFor="message-input">Message Details</label>
                <textarea 
                  id="message-input"
                  placeholder={
                    formType === 'general' ? "How can we help you today?" :
                    formType === 'bug' ? "Please provide steps to reproduce the issue..." :
                    "Describe the feature you would like to see implemented..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="brutalist-input"
                  style={{ width: '100%', height: '120px', marginTop: '6px', resize: 'vertical', backgroundColor: 'var(--bg-card)' }}
                  required
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-brutalist btn-brutalist-pink"
                style={{
                  width: '100%',
                  height: '42px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                disabled={status === 'loading'}
              >
                <Send size={15} /> {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Social / Discord Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }} className="flex flex-col sm:grid">
          <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-inner)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--accent-coral)'
            }}>@</div>
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Follow on X</h4>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12.5px', color: 'var(--text-light)', textDecoration: 'none' }}>@InferPayProtocol</a>
            </div>
          </div>

          <div className="brutalist-card" style={{ backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-inner)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={18} style={{ color: 'var(--accent-green)' }} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Email Support</h4>
              <a href="mailto:support@inferpay.xyz" style={{ fontSize: '12.5px', color: 'var(--text-light)', textDecoration: 'none' }}>support@inferpay.xyz</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
