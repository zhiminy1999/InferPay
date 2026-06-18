'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  FileText, 
  Database, 
  AlertTriangle, 
  Terminal, 
  Mail, 
  CheckCircle, 
  ExternalLink,
  ShieldCheck,
  Eye,
  Key,
  Layers,
  Fingerprint,
  FileSpreadsheet,
  Cpu
} from 'lucide-react'
import { ButtonLoading } from '../../components/LoadingSystem'
import { useModal } from '../../components/ModalSystem'

type SecuritySection = 
  | 'overview' 
  | 'privacy' 
  | 'cookie' 
  | 'processing' 
  | 'compliance' 
  | 'practices' 
  | 'disclosure' 
  | 'report'
  | 'modal_showcase'

export default function SecurityHubPage() {
  const { showModal, showTransactionModal, updateTransactionStatus, hideModal } = useModal()
  const [activeTab, setActiveTab] = useState<SecuritySection>('overview')
  const [copiedKey, setCopiedKey] = useState(false)
  
  // Vulnerability reporting form state
  const [email, setEmail] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [component, setComponent] = useState('smart_contracts')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [ticketId, setTicketId] = useState('')

  const handleCopyPGP = () => {
    const pgpKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v4.10.10
Comment: InferPay Security Disclosures Key

mQENBF+G7lMBCADp3xYgX0zK4R8hJ5/vCjU1o1h/lC9Z7B8P9T+3sJ+Q3N4eD+9A
K6Qh8X0W9zK4R8hJ5/vCjU1o1h/lC9Z7B8P9T+3sJ+Q3N4eD+9AK6Qh8X0W9zK4
... [TRUNCATED FOR DISCLOSURE COMPLIANCE] ...
=v8XZ
-----END PGP PUBLIC KEY BLOCK-----`
    navigator.clipboard.writeText(pgpKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !title || !description) return

    setIsSubmitting(true)
    
    // Simulate reporting API submission to internal secure backend
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    const randomTicket = 'INF-SEC-' + Math.floor(100000 + Math.random() * 900000)
    setTicketId(randomTicket)
    setIsSubmitting(false)
    setSubmitSuccess(true)
    
    // Clear form
    setEmail('')
    setTitle('')
    setDescription('')
    setSteps('')
  }

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-main)', 
      minHeight: '100vh', 
      color: 'var(--text-main)',
      fontFamily: 'var(--font-sans)',
      position: 'relative'
    }}>
      {/* Header */}
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
            Infer<i>Pay</i> Trust Center
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-brutalist green" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800 }}>
            🛡️ SOC-2 Compliance Roadmap
          </span>
        </div>
      </header>

      {/* Main Page Layout */}
      <div className="security-hub-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px 80px',
      }}>
        {/* Title Banner */}
        <div style={{
          borderBottom: '2px solid var(--border)',
          paddingBottom: '30px',
          marginBottom: '40px'
        }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 900, margin: '0 0 10px 0', lineHeight: 1.1 }}>
            Security, Privacy & <i>Compliance Hub</i>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0, maxWidth: '800px' }}>
            We design, develop, and deploy InferPay to meet the highest security standards in decentralized finance. Explore our institutional security architecture, policies, compliance protocols, and reporting workflows.
          </p>
        </div>

        {/* Dynamic Split Layout */}
        <div className="security-split" style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Navigation Sidebar */}
          <aside style={{
            position: 'sticky',
            top: '104px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderRight: '1px solid var(--border)',
            paddingRight: '20px'
          }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              color: 'var(--text-light)', 
              letterSpacing: '0.05em',
              marginBottom: '8px',
              paddingLeft: '10px'
            }}>
              Trust Resources
            </span>
            
            {[
              { id: 'overview', label: 'Security Overview', icon: Shield },
              { id: 'privacy', label: 'Privacy Policy', icon: Lock },
              { id: 'cookie', label: 'Cookie Policy', icon: FileSpreadsheet },
              { id: 'processing', label: 'Data Processing', icon: Database },
              { id: 'compliance', label: 'Compliance & AML', icon: ShieldCheck },
              { id: 'practices', label: 'Security Practices', icon: Layers },
              { id: 'disclosure', label: 'Responsible Disclosure', icon: Terminal },
              { id: 'report', label: 'Vulnerability Reporting', icon: AlertTriangle },
              { id: 'modal_showcase', label: 'Modal System Showcase', icon: Cpu }
            ].map((tab) => {
              const IconComp = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as SecuritySection)
                    setSubmitSuccess(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border)' : 'transparent',
                    backgroundColor: isActive ? 'var(--bg-inner)' : 'transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    fontFamily: 'inherit',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 750 : 600,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '2px 2px 0px var(--border)' : 'none',
                    transform: isActive ? 'translate(-2px, -2px)' : 'none'
                  }}
                >
                  <IconComp size={16} style={{ color: isActive ? 'var(--accent-coral)' : 'var(--text-light)' }} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </aside>

          {/* Detailed Content Panel */}
          <main style={{ minHeight: '500px' }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Security <i>Overview</i>
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="brutalist-card accent-green" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Fingerprint size={20} style={{ color: 'var(--accent-green)' }} />
                      <strong style={{ fontSize: '15px' }}>Non-Custodial Architecture</strong>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      InferPay does not hold or store private keys or mnemonic phrases. All transactions are constructed client-side and dispatched directly to the user’s web3 wallet providers.
                    </p>
                  </div>

                  <div className="brutalist-card accent-green" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={20} style={{ color: 'var(--accent-green)' }} />
                      <strong style={{ fontSize: '15px' }}>Permit2 & Safe Integrations</strong>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Token transfer execution limits are governed securely using Permit2 signature schemes, allowing users to define strict biometrically secured spending thresholds and session budgets.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    1. Cloudflare Security Shielding
                  </h3>
                  <p>
                    Our platform utilizes Cloudflare Enterprise-grade Web Application Firewall (WAF) routing, DDoS mitigation layers, and rate limiters to protect web hooks, inference request APIs, and client dashboards from network interference and denial of service.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    2. Cryptographic Security Standards
                  </h3>
                  <p>
                    All API communications between the UI and database nodes utilize strict Transport Layer Security (TLS 1.3). Database tables storing transaction hashes, session registries, and billing logs are encrypted at rest using AES-256 standard protocols.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    3. No Third-Party Analytics Trackers
                  </h3>
                  <p>
                    To ensure corporate data confidentiality, we exclude heavy advertising, social network, or behavioral analytical tracking scripts.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Privacy <i>Policy</i>
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '13px', fontStyle: 'italic' }}>Last Updated: June 18, 2026</p>
                  
                  <p>
                    This Privacy Policy outlines how InferPay handles data throughout our non-custodial decentralized application.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    1. Information We Do Not Collect
                  </h3>
                  <p>
                    Because InferPay interacts directly with EVM smart contracts, we do not collect, request, or store your real name, mailing address, government identity documents, or email (unless voluntarily provided for our waitlist program). We do not track your IP address across the web.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    2. Information We Record
                  </h3>
                  <ul>
                    <li><strong>Connected Address:</strong> The public cryptographic wallet address you use to sign transactions.</li>
                    <li><strong>Transaction Hash Registry:</strong> Publicly available transactions linked to CCTP bridges, stablecoin swaps, or job contracts.</li>
                    <li><strong>Agent Metadata:</strong> Configured Swarm settings, compute capabilities, and billing rates that you register in the registry.</li>
                  </ul>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    3. Data Retention
                  </h3>
                  <p>
                    Waitlist emails are stored securely on insulated nodes. Transaction data is indexed directly from the public blockchain ledger (Arc Testnet and EVM chains) and cannot be deleted as it resides on decentralized blocks.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'cookie' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Cookie <i>Policy</i>
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <p>
                    InferPay believes in data minimalism. We do not use advertising, marketing, or profiling cookies to trace your interactions or profile your browsing behaviors.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    First-Party Essential Storage
                  </h3>
                  <p>
                    We use browser `localStorage` and `sessionStorage` strictly to persist critical session choices:
                  </p>
                  
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    marginTop: '15px',
                    fontSize: '13px',
                    border: '1px solid var(--border)'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-inner)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Storage Key</th>
                        <th style={{ padding: '10px' }}>Purpose</th>
                        <th style={{ padding: '10px' }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>theme</td>
                        <td style={{ padding: '10px' }}>Stores user color preference (dark/light theme).</td>
                        <td style={{ padding: '10px' }}>Persistent</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>connected_address</td>
                        <td style={{ padding: '10px' }}>Stores the active Web3 session address to maintain login.</td>
                        <td style={{ padding: '10px' }}>Session only</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px', fontFamily: 'monospace' }}>sim_usdc_*</td>
                        <td style={{ padding: '10px' }}>Persists mock wallet balances for simulation testing.</td>
                        <td style={{ padding: '10px' }}>Persistent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'processing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Data <i>Processing Agreement</i>
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <p>
                    To comply with the General Data Protection Regulation (GDPR) and the Swiss Federal Act on Data Protection (FADP), InferPay acts as a **Data Controller** for public ledger indexers and waitlist registries.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    1. Lawful Basis for Processing
                  </h3>
                  <p>
                    Our processing relies on:
                  </p>
                  <ul>
                    <li><strong>Consent:</strong> When you provide waitlist emails.</li>
                    <li><strong>Legitimate Interest:</strong> Preventing sybil attacks on API calls and maintaining transaction history logs.</li>
                  </ul>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    2. Rights of Data Subjects
                  </h3>
                  <p>
                    Users have the right to access, export, or request deletion of waitlist details. However, please note that we do not have the technical authority or ability to redact, remove, or modify any transactions registered on public blockchain nets (like Ethereum, Base, or Arc Testnet).
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    3. Cross-Border Data Flows
                  </h3>
                  <p>
                    Our secure server nodes reside in Switzerland and compliant European Union data clusters. Data flows are encrypted end-to-end to prevent malicious interception.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Compliance & <i>AML Policies</i>
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <p>
                    InferPay integrates robust, automated compliance structures to satisfy international regulations while preserving decentralization values.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    1. Circle Compliance Alignment
                  </h3>
                  <p>
                    We strictly interact with Circle's EURC and USDC ERC-20 standard smart contract rules, which feature blacklisting controls to lock funds flag-labeled as sanctioned or tied to illegal exploits.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    2. On-chain Sanctions Screening
                  </h3>
                  <p>
                    Our dApp filters wallet interactions through public OFAC lists and smart contract blocklists. Any address associated with known malicious hacks or sanctioned organizations will automatically be denied access to the interface.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    3. Travel Rule & Privacy Shields
                  </h3>
                  <p>
                    InferPay operates strictly on a non-custodial peer-to-peer structure. As we do not manage, hold, or store funds on our servers, transactions execute atomically via user-signed smart contract pathways.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'practices' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Security <i>Practices</i>
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <p>
                    Our security program utilizes continuous integration checks, audits, and automated defenses to protect the commerce stack.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    1. Code Audits
                  </h3>
                  <p>
                    All smart contracts are scheduled for security verification audits prior to mainnet launch. Static code analysers such as Slither and Mythril are run as mandatory triggers in our build pipelines.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    2. Automated Test Coverage
                  </h3>
                  <p>
                    We enforce strict test coverage standards. All critical math and logic inside CCTP bridging controllers, swap hooks, and transaction registries must pass comprehensive local simulation testing.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    3. Vault & Access Control
                  </h3>
                  <p>
                    We enforce Multi-Signature configurations (Gnosis Safe) for protocol parameters and upgrade privileges, ensuring that single keys can never alter codebase logic or withdraw deposits.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'disclosure' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Responsible <i>Disclosure</i>
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  <p>
                    We welcome reports from independent security researchers to safeguard the decentralized commerce ecosystem.
                  </p>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    Bounty Scope & Rules
                  </h3>
                  <ul>
                    <li>Provide detailed steps to reproduce the exploit.</li>
                    <li>Do not perform load testing, DDoS attacks, or spam automated forms.</li>
                    <li>Do not leak the vulnerability publicly until it has been patched.</li>
                  </ul>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '15px 0 5px' }}>
                    Reward Tiers (USDC)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                    <div style={{ padding: '15px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-inner)' }}>
                      <strong style={{ color: '#dc2626' }}>Critical Severity</strong>
                      <div style={{ fontSize: '18px', fontWeight: 900, margin: '5px 0' }}>Up to 50,000 USDC</div>
                      <span style={{ fontSize: '11px' }}>Loss of user deposits, private execution manipulation.</span>
                    </div>

                    <div style={{ padding: '15px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-inner)' }}>
                      <strong style={{ color: '#d97706' }}>High/Medium Severity</strong>
                      <div style={{ fontSize: '18px', fontWeight: 900, margin: '5px 0' }}>Up to 10,000 USDC</div>
                      <span style={{ fontSize: '11px' }}>Oracle frontrunning, rate limit bypass, persistent session hijack.</span>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-main)', fontSize: '18px', fontWeight: 700, margin: '20px 0 5px' }}>
                    Secure PGP Communication
                  </h3>
                  <p>
                    Encrypt sensitive messages before submitting. Use our PGP public key.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={handleCopyPGP}
                      className="btn-brutalist btn-brutalist-pink"
                      style={{ fontSize: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Key size={14} />
                      <span>{copiedKey ? 'PGP Public Key Copied!' : 'Copy Security PGP Public Key'}</span>
                    </button>
                    <a
                      href="mailto:security@inferpay.space"
                      className="btn-brutalist"
                      style={{ fontSize: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-inner)', color: 'var(--text-main)' }}
                    >
                      <Mail size={14} />
                      <span>Email Security Team</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'report' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Vulnerability <i>Reporting</i>
                </h2>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.6', margin: 0 }}>
                  Found a vulnerability? Submit a report below to our security triage unit.
                </p>

                {submitSuccess ? (
                  <div style={{
                    border: '1px solid var(--accent-green)',
                    backgroundColor: '#f0fdf4',
                    padding: '24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    animation: 'slideDown 0.3s'
                  }}>
                    <div style={{ 
                      fontWeight: 900, 
                      color: 'var(--accent-green)', 
                      fontSize: '18px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px' 
                    }}>
                      <CheckCircle size={22} />
                      <span>REPORT FILED SECURELY!</span>
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      Your disclosure ticket has successfully been received by the InferPay Security Team under ID: 
                      <strong style={{ display: 'block', fontFamily: 'monospace', fontSize: '16px', margin: '8px 0', color: 'var(--text-main)' }}>
                        {ticketId}
                      </strong>
                      We triage all reports in less than 6 hours. Thank you for securing our network.
                    </p>
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="btn-brutalist btn-brutalist-pink"
                      style={{ padding: '8px 24px', alignSelf: 'center', fontSize: '12px' }}
                    >
                      Submit Another Report
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="grid-2-col">
                      <div className="brutalist-form-group">
                        <label className="brutalist-label">Security Email Contact</label>
                        <input
                          type="email"
                          required
                          className="brutalist-input"
                          placeholder="reporter@cybersec.org"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="brutalist-form-group">
                        <label className="brutalist-label">Affected Component</label>
                        <select
                          className="brutalist-input"
                          value={component}
                          onChange={(e) => setComponent(e.target.value)}
                          style={{ height: '42px', fontWeight: 700 }}
                        >
                          <option value="smart_contracts">Smart Contracts (.sol / .vy)</option>
                          <option value="cctp_bridge">Circle CCTP Integration Bridge</option>
                          <option value="dashboard_ui">Dashboard Front-End UI</option>
                          <option value="inference_api">AI Swarm Inference API</option>
                          <option value="permit2_budget">Permit2 Signature Budgets</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-2-col">
                      <div className="brutalist-form-group">
                        <label className="brutalist-label">Severity Assessment</label>
                        <select
                          className="brutalist-input"
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value)}
                          style={{ height: '42px', fontWeight: 700 }}
                        >
                          <option value="low">Low (UI styling flaws, non-impactful bugs)</option>
                          <option value="medium">Medium (Bypass limits, oracle frontrun risk)</option>
                          <option value="high">High (Wallet session hijack, data exposure)</option>
                          <option value="critical">Critical (Funds drainage, key exploitation)</option>
                        </select>
                      </div>
                      <div className="brutalist-form-group">
                        <label className="brutalist-label">Disclosure Title</label>
                        <input
                          type="text"
                          required
                          className="brutalist-input"
                          placeholder="Re-entrancy vector in AgentEscrow payment execution"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="brutalist-form-group">
                      <label className="brutalist-label">Exploit Description</label>
                      <textarea
                        required
                        className="brutalist-input"
                        rows={5}
                        placeholder="Provide details of the bug, potential impact, and system status..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ fontFamily: 'inherit', padding: '10px' }}
                      />
                    </div>

                    <div className="brutalist-form-group">
                      <label className="brutalist-label">Steps to Reproduce (Optional)</label>
                      <textarea
                        className="brutalist-input"
                        rows={4}
                        placeholder="1. Deploy mock contract...&#10;2. Call execute() with payload..."
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                        style={{ fontFamily: 'monospace', padding: '10px', fontSize: '12px' }}
                      />
                    </div>

                    <ButtonLoading
                      type="submit"
                      isLoading={isSubmitting}
                      loadingText="Encrypting & Submitting..."
                      variantClass="btn-brutalist btn-brutalist-pink"
                      style={{ padding: '12px 24px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ShieldCheck size={16} />
                      <span>Submit Secure Vulnerability Report</span>
                    </ButtonLoading>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'modal_showcase' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                  Modal System <i>Showcase</i>
                </h2>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.6', margin: 0 }}>
                  Interactive playground to test the unified modal architecture. Explore variant states, async handling, and blockchain transaction flows.
                </p>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '20px', 
                  marginTop: '10px' 
                }}>
                  {/* Confirm Modal */}
                  <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <strong style={{ fontSize: '15px' }}>1. Action Confirmation</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Request explicit user approval before executing tasks (e.g. authorization, wallet disconnect).
                    </span>
                    <button
                      onClick={() => showModal({
                        type: 'confirm',
                        title: 'Authorize AI Agent Vault',
                        message: 'Are you sure you want to authorize the autonomous AI agent to deploy contracts and spend up to 500 USDC per day from your treasury balance?',
                        confirmText: 'Authorize Agent',
                        cancelText: 'Cancel'
                      })}
                      className="btn-brutalist btn-brutalist-pink"
                      style={{ fontSize: '12px', padding: '8px 12px', marginTop: 'auto', alignSelf: 'flex-start' }}
                    >
                      Trigger Confirm Modal
                    </button>
                  </div>

                  {/* Loading / Processing */}
                  <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <strong style={{ fontSize: '15px' }}>2. Loading / Processing</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Display block sync progression or async task delays. Blocks user interactions to prevent double-submits.
                    </span>
                    <button
                      onClick={() => {
                        showModal({
                          type: 'loading',
                          title: 'Syncing Agent Memory',
                          message: 'Connecting to decentralized storage node network and pulling updated policy state parameters. Please wait...',
                          preventCloseOnOverlayClick: true,
                          showCloseButton: false
                        });
                        setTimeout(() => hideModal(), 3000);
                      }}
                      className="btn-brutalist btn-brutalist-pink"
                      style={{ fontSize: '12px', padding: '8px 12px', marginTop: 'auto', alignSelf: 'flex-start' }}
                    >
                      Trigger Loading (3s)
                    </button>
                  </div>

                  {/* Success Modal */}
                  <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <strong style={{ fontSize: '15px' }}>3. Action Success</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Positive user feedback on transaction block finality or successful deployment actions.
                    </span>
                    <button
                      onClick={() => showModal({
                        type: 'success',
                        title: 'Vault Deployed Successfully',
                        message: 'Your new AI agent treasury vault is live at address 0x9f12...3e4f on Arc Testnet. Gas policies have been successfully registered.',
                        confirmText: 'Back to Dashboard'
                      })}
                      className="btn-brutalist btn-brutalist-pink"
                      style={{ fontSize: '12px', padding: '8px 12px', marginTop: 'auto', alignSelf: 'flex-start' }}
                    >
                      Trigger Success Modal
                    </button>
                  </div>

                  {/* Error / Retry Flow */}
                  <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <strong style={{ fontSize: '15px' }}>4. Error & Retry Flow</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Human-readable error explanation with fallback retry button triggers.
                    </span>
                    <button
                      onClick={() => showModal({
                        type: 'error',
                        title: 'API Connection Refused',
                        message: 'Unable to communicate with the Circle CCTP token swap router API due to network rate limits. Would you like to retry?',
                        confirmText: 'Retry Connection',
                        cancelText: 'Close',
                        onConfirm: async () => {
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          await showModal({
                            type: 'success',
                            title: 'Connection Restored',
                            message: 'Successfully established contact with the swap routing nodes.',
                            confirmText: 'Dismiss'
                          });
                        }
                      })}
                      className="btn-brutalist btn-brutalist-pink"
                      style={{ fontSize: '12px', padding: '8px 12px', marginTop: 'auto', alignSelf: 'flex-start' }}
                    >
                      Trigger Retry Flow
                    </button>
                  </div>

                  {/* Warning / Security Caps */}
                  <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <strong style={{ fontSize: '15px' }}>5. Risk Warning</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      Alert users of high-risk actions, limit breaches, or parameter deviations.
                    </span>
                    <button
                      onClick={() => showModal({
                        type: 'warning',
                        title: 'Security Limit Exceeded',
                        message: 'The current transaction exceeds your daily spending policy cap of 250 USDC. Continuing requires multi-signature key confirmation.',
                        confirmText: 'Request Signature',
                        cancelText: 'Decline'
                      })}
                      className="btn-brutalist btn-brutalist-pink"
                      style={{ fontSize: '12px', padding: '8px 12px', marginTop: 'auto', alignSelf: 'flex-start' }}
                    >
                      Trigger Warning Modal
                    </button>
                  </div>

                  {/* Destructive Confirmation */}
                  <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderColor: '#dc2626' }}>
                    <strong style={{ fontSize: '15px', color: '#dc2626' }}>6. Destructive Action</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      High-severity actions (e.g. revoking agent permissions, clearing treasury balance).
                    </span>
                    <button
                      onClick={() => showModal({
                        type: 'destructive',
                        title: 'Revoke Agent Authority',
                        message: 'WARNING: Revoking agent authority will cancel all pending swap intents and instantly freeze the smart account budget allocations. This action cannot be undone.',
                        confirmText: 'Revoke Instantly',
                        cancelText: 'Keep Authorized'
                      })}
                      className="btn-brutalist"
                      style={{ fontSize: '12px', padding: '8px 12px', marginTop: 'auto', alignSelf: 'flex-start', backgroundColor: '#dc2626', color: '#ffffff', border: '1px solid #dc2626' }}
                    >
                      Trigger Destructive Modal
                    </button>
                  </div>

                  {/* Transaction status */}
                  <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <strong style={{ fontSize: '15px' }}>7. Async Tx lifecycle</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {'Follows a simulated Circle CCTP stablecoin transfer from Pending -> Confirming -> Success.'}
                    </span>
                    <button
                      onClick={() => {
                        const id = showTransactionModal('0x7c73a812b189873a4b92b67f1b1b110a12e2f3d4567c9c0b11a2b3c4d5e6f7a8', 'pending');
                        setTimeout(() => updateTransactionStatus(id, 'confirming'), 2000);
                        setTimeout(() => updateTransactionStatus(id, 'success'), 4500);
                      }}
                      className="btn-brutalist btn-brutalist-pink"
                      style={{ fontSize: '12px', padding: '8px 12px', marginTop: 'auto', alignSelf: 'flex-start' }}
                    >
                      Trigger Tx Lifecycle (4.5s)
                    </button>
                  </div>

                  {/* Global Insufficient balance */}
                  <div className="brutalist-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <strong style={{ fontSize: '15px' }}>8. Global Error / Balance</strong>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      API timeout, network disconnected, insufficient gas/token balances.
                    </span>
                    <button
                      onClick={() => showModal({
                        type: 'destructive',
                        title: 'Insufficient Vault Balance',
                        message: 'Your smart account balance is 0.00 USDC. You must bridge funds or request faucet tokens to execute autonomous tasks.',
                        confirmText: 'Open Bridge Faucet',
                        cancelText: 'Cancel'
                      })}
                      className="btn-brutalist"
                      style={{ fontSize: '12px', padding: '8px 12px', marginTop: 'auto', alignSelf: 'flex-start', backgroundColor: 'var(--text-main)', color: '#ffffff' }}
                    >
                      Trigger Balance Alert
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
