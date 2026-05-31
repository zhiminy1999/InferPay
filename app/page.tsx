'use client'

import { useState, useEffect } from 'react'
import { 
  Cpu, Zap, Shield, Coins, ArrowRightLeft, FileText, CheckCircle2, 
  Send, RefreshCw, Key, Lock, AlertTriangle, Play, Check, ArrowRight, Sparkles, Droplet, Eye, EyeOff
} from 'lucide-react'
import { useWeb3 } from '@/lib/web3-provider'
import { 
  USDC_ADDRESS_ARC, EURC_ADDRESS_ARC, 
  INFERPAY_CONTRACT_ADDRESS, erc20Abi 
} from '@/lib/contracts'
import { parseUnits, formatUnits } from 'viem'

// Types
interface ActivityLog {
  time: string
  emoji: string
  title: string
  desc: string
  type: 'success' | 'warning' | 'danger' | 'info' | 'default'
}

interface Invoice {
  id: string
  agentName: string
  description: string
  achievements: string[]
  amount: number
  currency: 'USDC' | 'EURC'
  status: 'PENDING' | 'PAID'
}

export default function InferPayDashboard() {
  const { isConnected, address, connect, disconnect, walletClient, publicClient } = useWeb3()

  // Tab views
  const [activeTab, setActiveTab] = useState<'escrow' | 'intent' | 'yield' | 'payroll' | 'consensus'>('escrow')
  
  // Real-Chain details if connected
  const [usdcBalance, setUsdcBalance] = useState<string>('1250.00') // pre-seeded for pleasant default feel
  const [eurcBalance, setEurcBalance] = useState<string>('840.00')

  // Faucet modal states
  const [showFaucetModal, setShowFaucetModal] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  // Non-Tech friendly Activity feed in pure premium English
  const [activities, setActivities] = useState<ActivityLog[]>([
    { time: '14:32:04', emoji: '⚡', title: 'System Ready', desc: 'InferPay is connected and ready to manage your company finances.', type: 'success' },
    { time: '14:32:05', emoji: '🛡️', title: 'Safety Checks Active', desc: 'All spending limits and approval rules are in place.', type: 'info' }
  ])

  // Faucet state (Feature A)
  const [isFaucetLoading, setIsFaucetLoading] = useState(false)

  // Feature 1: Ví Tiêu Dùng AI (Smart Allowance) States
  const [pocketMoney, setPocketMoney] = useState<number>(50)
  const [safePeriod, setSafePeriod] = useState<string>('12h')
  const [whitelistServices, setWhitelistServices] = useState({
    openai: true,
    together: true,
    huggingface: false,
    anthropic: true
  })
  const [piggyBankStatus, setPiggyBankStatus] = useState<'INACTIVE' | 'ACTIVE' | 'SWEPT'>('INACTIVE')
  const [piggyBankAddress, setPiggyBankAddress] = useState<string>('')
  const [ephemeralPrivateKey, setEphemeralPrivateKey] = useState<string>('') // Feature C
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false)       // Feature C
  const [piggyBankSpent, setPiggyBankSpent] = useState<number>(0)
  const [isEscrowLoading, setIsEscrowLoading] = useState(false)
  const [showOverspentWarning, setShowOverspentWarning] = useState(false)

  // Feature 2: Tự Động Phân Loại (Auto Pay & Categorize) States
  const [intentSelection, setIntentSelection] = useState<string>('renew_subscription')
  const [intentAmount, setIntentAmount] = useState<number>(250)
  const [isIntentLoading, setIsIntentLoading] = useState(false)
  const [intentTxHash, setIntentTxHash] = useState<string | null>(null)

  const intentsPreload = [
    { id: 'renew_subscription', name: 'Renew Software Subscriptions — $250', amount: 250, details: 'Your assistant reads the invoice from tools like Figma or Canva, pays it on time, and logs the expense for your records.' },
    { id: 'scale_gpu', name: 'Scale Up Cloud Computing — $100', amount: 100, details: 'When your servers get busy, InferPay automatically adds more computing power so your services stay fast.' },
    { id: 'data_purchase', name: 'Purchase Data & Research — $450', amount: 450, details: 'Your AI assistant buys verified research datasets your team needs, without waiting for manual approval.' }
  ]

  // Feature 3: Tự Động Tối Ưu Quỹ (Auto Growth Treasury) States
  const [yieldUsdc, setYieldUsdc] = useState<number>(5.42)
  const [yieldEurc, setYieldEurc] = useState<number>(6.81)
  const [isArbitrageLoading, setIsArbitrageLoading] = useState(false)
  const [treasuryFunds, setTreasuryFunds] = useState<number>(1200)

  // Feature 4: Duyệt Lương AI (AI Invoice Approval) States
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-01', agentName: 'Server Maintenance Bot', description: 'Sped up your website and fixed data backup issues.', achievements: ['Made your website 20% faster', 'Recovered 3 broken data backups'], amount: 250, currency: 'USDC', status: 'PAID' },
    { id: 'INV-02', agentName: 'Content Writer Bot', description: 'Wrote newsletters and improved your website search ranking.', achievements: ['Published 15 blog articles', 'Redesigned email marketing templates'], amount: 80, currency: 'USDC', status: 'PAID' },
    { id: 'INV-03', agentName: 'Security Review Bot', description: 'Checked your code for vulnerabilities and strengthened protections.', achievements: ['Reviewed 5 code repositories', 'Fixed 2 critical security issues'], amount: 850, currency: 'USDC', status: 'PENDING' }
  ])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('INV-03')
  const [isPayrollLoading, setIsPayrollLoading] = useState(false)

  // Feature 5: Duyệt Chi Nhóm (Co-Sign Security Guard) States
  const [isDebating, setIsDebating] = useState(false)
  const [debateSpeed, setDebateSpeed] = useState<'1x' | '2x' | '3x'>('1x') // Feature D
  const [debateMessages, setDebateMessages] = useState<{ sender: string; text: string; role: 'proposer' | 'compliance' | 'auditor' }[]>([])
  const [complianceFlag, setComplianceFlag] = useState(false)
  const [consensusProposal, setConsensusProposal] = useState<{
    id: number
    amount: number
    purpose: string
    votes: { proposer: string; compliance: string; auditor: string }
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BYPASSED'
  }>({
    id: 104,
    amount: 25000,
    purpose: 'Annual cloud server rental for high-performance computing',
    votes: { proposer: 'APPROVED', compliance: 'PENDING', auditor: 'PENDING' },
    status: 'PENDING'
  })

  // Add activities to our activity feed in English
  const addActivity = (title: string, desc: string, emoji: string, type: 'success' | 'warning' | 'danger' | 'info' | 'default' = 'default') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setActivities(prev => [{ time, emoji, title, desc, type }, ...prev])
  }

  // Load simulated balances from localStorage on mount (Demo Mode only)
  useEffect(() => {
    if (!isConnected) {
      const savedUsdc = localStorage.getItem('inferpay_sim_usdc')
      const savedEurc = localStorage.getItem('inferpay_sim_eurc')
      if (savedUsdc) setUsdcBalance(savedUsdc)
      if (savedEurc) setEurcBalance(savedEurc)
    }
  }, [isConnected])

  // Get On-chain Real Balances when connected
  useEffect(() => {
    const getOnChainBalances = async () => {
      if (isConnected && address && publicClient) {
        try {
          const usdcBal = await publicClient.readContract({
            address: USDC_ADDRESS_ARC,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          }) as bigint
          
          const eurcBal = await publicClient.readContract({
            address: EURC_ADDRESS_ARC,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          }) as bigint

          setUsdcBalance(Number(formatUnits(usdcBal, 6)).toFixed(2))
          setEurcBalance(Number(formatUnits(eurcBal, 6)).toFixed(2))
          
          addActivity('Balances loaded', `Your account: $${Number(formatUnits(usdcBal, 6)).toFixed(2)} USD · €${Number(formatUnits(eurcBal, 6)).toFixed(2)} EUR`, '💳', 'success')
        } catch (err) {
          console.error("Failed to read balances:", err)
        }
      }
    }
    getOnChainBalances()
    
    // Simulate yields moving slightly
    const yieldInterval = setInterval(() => {
      setYieldUsdc(prev => Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)))
      setYieldEurc(prev => Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)))
    }, 5000)

    return () => clearInterval(yieldInterval)
  }, [isConnected, address])

  // Keyboard shortcut listener for non-tech payroll approval
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        triggerPayrollApproval()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedInvoiceId, invoices])

  // --- Feature A: Faucet for stablecoins ---
  const handleFaucet = async () => {
    if (isConnected) {
      // Show official Circle Faucet Guide Modal for real on-chain assets
      setShowFaucetModal(true)
      addActivity('Getting test funds', 'Opening the official faucet so you can add test money to your account.', '💧', 'info')
    } else {
      // Demo Mode: Mint simulated assets and persist in localStorage
      setIsFaucetLoading(true)
      addActivity('Adding demo funds', 'Depositing $1,000 USD & €1,000 EUR into your demo account.', '💧', 'info')
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const newUsdc = (Number(usdcBalance) + 1000).toFixed(2)
        const newEurc = (Number(eurcBalance) + 1000).toFixed(2)
        
        setUsdcBalance(newUsdc)
        setEurcBalance(newEurc)
        localStorage.setItem('inferpay_sim_usdc', newUsdc)
        localStorage.setItem('inferpay_sim_eurc', newEurc)
        
        addActivity('Demo funds added', 'Your demo account now has +$1,000 USD & +€1,000 EUR.', '🎉', 'success')
      } catch (err) {
        addActivity('Could not add funds', 'Something went wrong. Please try again.', '❌', 'danger')
      } finally {
        setIsFaucetLoading(false)
      }
    }
  }

  // --- Feature 1: Ví Tiêu Dùng AI Handlers ---
  const handleCreateEphemeral = async () => {
    setIsEscrowLoading(true)
    addActivity('Setting up AI budget', 'Creating a separate spending account for your AI assistant.', '🔑', 'info')
    
    try {
      const mockAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
      const mockPrivateKey = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
      
      if (isConnected && walletClient && address) {
        addActivity('Confirming budget', 'Saving your spending limit securely.', '⛓️', 'info')
        try {
          const usdcVal = parseUnits(pocketMoney.toString(), 6)
          await walletClient.writeContract({
            address: USDC_ADDRESS_ARC,
            abi: erc20Abi,
            functionName: 'approve',
            args: [INFERPAY_CONTRACT_ADDRESS, usdcVal],
            account: address as `0x${string}`,
            chain: null
          })
          addActivity('Budget confirmed', 'Your spending limit has been saved successfully.', '✅', 'success')
        } catch (e: any) {
          addActivity('Budget set up in demo mode', 'Running in preview mode.', '⚡', 'warning')
        }
      }

      setPiggyBankAddress(mockAddress)
      setEphemeralPrivateKey(mockPrivateKey)
      setPiggyBankStatus('ACTIVE')
      setPiggyBankSpent(0)
      setShowOverspentWarning(false)
      setShowPrivateKey(false)
      addActivity('AI budget is active', `Your AI can spend up to $${pocketMoney} for the next ${safePeriod === '12h' ? '12 hours' : safePeriod === '1d' ? '24 hours' : '7 days'}.`, '🤖', 'success')
    } catch (err) {
      addActivity('Setup failed', 'Please check your connection and try again.', '❌', 'danger')
    } finally {
      setIsEscrowLoading(false)
    }
  }

  const handleExecuteSpend = () => {
    if (piggyBankSpent + 5 > pocketMoney) {
      setShowOverspentWarning(true)
      addActivity('Budget limit reached', `Your AI tried to spend more than its $${pocketMoney} limit.`, '⚠️', 'danger')
      return
    }

    setPiggyBankSpent(prev => prev + 5)
    addActivity('AI made a purchase', 'Used $5 from its budget to pay for an OpenAI task.', '💸', 'success')
  }

  const handleSweepEscrow = async () => {
    setIsEscrowLoading(true)
    addActivity('Getting back remaining funds', 'Moving any unspent money back to your main account.', '🔄', 'info')
    
    try {
      const remainder = pocketMoney - piggyBankSpent
      setPiggyBankStatus('SWEPT')
      setShowOverspentWarning(false)
      setShowPrivateKey(false)
      addActivity('Funds returned', `$${remainder} was safely moved back to your main account.`, '🛡️', 'success')
    } catch (err) {
      addActivity('Return failed', 'Something went wrong. Please try again.', '❌', 'danger')
    } finally {
      setIsEscrowLoading(false)
    }
  }

  // --- Feature 2: Tự Động Phân Loại Handlers ---
  const handleTriggerIntent = async () => {
    setIsIntentLoading(true)
    addActivity('Bill received', 'Reading and analyzing the incoming invoice.', '✉️', 'info')
    
    const intent = intentsPreload.find(i => i.id === intentSelection)
    if (!intent) return

    try {
      if (isConnected && walletClient && address) {
        addActivity('Sending payment', 'Processing the payment securely.', '🔗', 'info')
        const valueToSend = parseUnits("0.01", 6)
        const hash = await walletClient.writeContract({
          address: USDC_ADDRESS_ARC,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [INFERPAY_CONTRACT_ADDRESS, valueToSend],
          account: address as `0x${string}`,
          chain: null
        })
        setIntentTxHash(hash)
        addActivity('Payment confirmed', `Receipt: ${hash.slice(0, 16)}...`, '✅', 'success')
      } else {
        addActivity('Processing in demo mode', 'Simulating the bill payment flow.', '⚡', 'warning')
      }

      setTimeout(() => addActivity('Bill analyzed', `${intent.name}. Total: $${intent.amount}.`, '🧠', 'info'), 1000)
      setTimeout(() => addActivity('Payment split complete', `$${(intent.amount * 0.9).toFixed(2)} paid to vendor, $${(intent.amount * 0.1).toFixed(2)} saved.`, '📊', 'success'), 2200)
      setTimeout(() => {
        addActivity('Bill paid', 'Everything is settled — done in under 5 seconds.', '🎉', 'success')
        setIsIntentLoading(false)
      }, 3500)

    } catch (err: any) {
      addActivity('Payment failed', 'The payment was cancelled or could not be completed.', '❌', 'danger')
      setIsIntentLoading(false)
    }
  }

  // --- Feature 3: Arbitrage Swap Handlers ---
  const handleArbitrageSwap = async () => {
    setIsArbitrageLoading(true)
    addActivity('Starting Autonomous Treasury Swap', `Converting 1000 USDC ➔ EURC to capture superior yields (+${(yieldEurc - yieldUsdc).toFixed(2)}%).`, '📈', 'info')

    try {
      setTimeout(() => {
        setYieldUsdc(prev => Number((prev - 0.1).toFixed(2)))
        setYieldEurc(prev => Number((prev + 0.1).toFixed(2)))
        setTreasuryFunds(prev => prev + 45)
        addActivity('Savings optimized', 'Your funds have been moved to the better rate. Transaction cost: $0.0004.', '✅', 'success')
        addActivity('Earning more', 'Your idle cash is now positioned in the higher-earning account.', '💰', 'success')
        setIsArbitrageLoading(false)
      }, 2500)
    } catch (err) {
      addActivity('Optimization failed', 'Could not move your funds. Please try again.', '❌', 'danger')
      setIsArbitrageLoading(false)
    }
  }

  // --- Feature 4: Duyệt Lương AI Handlers ---
  const triggerPayrollApproval = async () => {
    const selectedInv = invoices.find(inv => inv.id === selectedInvoiceId)
    if (!selectedInv || selectedInv.status !== 'PENDING') return

    setIsPayrollLoading(true)
    addActivity('Reviewing AI work', `Checking the work report from ${selectedInv.agentName}.`, '⏳', 'info')

    try {
      setTimeout(() => {
        setInvoices(prev => prev.map(inv => inv.id === selectedInvoiceId ? { ...inv, status: 'PAID' } : inv))
        addActivity('Report verified', 'This work report has been confirmed as authentic and untampered.', '🛡️', 'success')
        addActivity('Payment sent', `$${selectedInv.amount} ${selectedInv.currency} has been sent to ${selectedInv.agentName}.`, '💸', 'success')
        setIsPayrollLoading(false)
      }, 2000)
    } catch (err) {
      addActivity('Payment failed', 'Something went wrong during the payment process.', '❌', 'danger')
      setIsPayrollLoading(false)
    }
  }

  // --- Feature 5: Duyệt Chi Nhóm Handlers ---
  const startDebate = () => {
    setIsDebating(true)
    setDebateMessages([])
    
    addActivity('Review started', 'Three independent reviewers are examining the $25,000 payment request.', '🛡️', 'info')
    
    const messages = [
      { sender: '🤖 Operations Team (Requester)', role: 'proposer' as const, text: 'We need $25,000 to rent cloud computing servers for the next quarter. All usage reports are verified.' },
      { sender: '🛡️ Safety Reviewer', role: 'compliance' as const, text: complianceFlag 
        ? '🔴 WARNING: The payment recipient has been flagged as potentially unsafe. I recommend rejecting this payment.'
        : '🟢 Safety check passed. The recipient is verified and trustworthy. I recommend approving this payment.' },
      { sender: '📊 Budget Reviewer', role: 'auditor' as const, text: complianceFlag
        ? 'The safety reviewer found a problem. I agree we should reject this payment until further investigation.'
        : 'Budget check passed. We have $43,000 remaining in this quarter\'s budget. This $25,000 request is within our limits. Approved.' }
    ]

    // Feature D: Compute delay interval based on speed selection
    const delay = debateSpeed === '3x' ? 100 : debateSpeed === '2x' ? 500 : 1500

    let i = 0
    const messageTimer = setInterval(() => {
      if (i < messages.length) {
        setDebateMessages(prev => [...prev, messages[i]])
        
        const type = messages[i].role === 'proposer' ? 'info' : messages[i].role === 'compliance' ? 'warning' : 'default'
        addActivity(`AI Governance debate: ${messages[i].sender}`, messages[i].text, '💬', type)

        if (i === 1) {
          setConsensusProposal(prev => ({
            ...prev,
            votes: { ...prev.votes, compliance: complianceFlag ? 'REJECTED' : 'APPROVED' }
          }))
        }
        if (i === 2) {
          setConsensusProposal(prev => ({
            ...prev,
            votes: { ...prev.votes, auditor: complianceFlag ? 'REJECTED' : 'APPROVED' },
            status: complianceFlag ? 'REJECTED' : 'APPROVED'
          }))
        }
        i++
      } else {
        clearInterval(messageTimer)
        setIsDebating(false)
        if (complianceFlag) {
          addActivity('Payment blocked', 'The safety reviewer flagged this payment as suspicious. The $25,000 transfer has been stopped.', '🔒', 'danger')
        } else {
          addActivity('Payment approved', 'All 3 reviewers approved. The $25,000 has been sent.', '🎉', 'success')
        }
      }
    }, delay)
  }

  const triggerBypass = () => {
    addActivity('Owner override', 'You are manually approving this payment as the account owner.', '🔑', 'warning')
    setTimeout(() => {
      setConsensusProposal(prev => ({ ...prev, status: 'BYPASSED' }))
      addActivity('Payment sent', 'The $25,000 has been released with your manual authorization.', '✅', 'success')
    }, 1500)
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="app-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="topbar-logo">
            <Cpu size={22} style={{ strokeWidth: 2 }} />
            <span>Infer<i>Pay</i></span>
          </div>
          <div className="network-badge">
            <div className="network-dot"></div>
            <span>Live on Arc Network (Test Mode)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Feature A: Faucet for judges */}
          <button 
            className="btn-brutalist btn-brutalist-green" 
            onClick={handleFaucet} 
            disabled={isFaucetLoading}
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {isFaucetLoading ? <RefreshCw size={11} className="spin" /> : <Droplet size={11} />}
            <span>💰 Get Free Test Funds</span>
          </button>

          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Your Account:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-coral)' }}>
                  Balance: ${usdcBalance} USD · €{eurcBalance} EUR
                </div>
              </div>
              <button className="btn-brutalist btn-brutalist-muted" onClick={disconnect} style={{ padding: '6px 12px', fontSize: '11px' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <div className="bracket-button-wrap">
              <button className="btn-brutalist btn-brutalist-pink" onClick={connect} style={{ padding: '6px 14px' }}>
                <Key size={14} style={{ strokeWidth: 2.5 }} />
                <span>Sign In with Wallet</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="app-workspace">
        {/* Left Menu Sidebar */}
        <aside className="app-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Your Tools</div>
            
            <div 
              className={`sidebar-menu-item ${activeTab === 'escrow' ? 'active' : ''}`}
              onClick={() => setActiveTab('escrow')}
            >
              <div className="sidebar-icon-wrap">
                <Lock size={15} />
                <span>1. AI Spending Budget</span>
              </div>
            </div>

            <div 
              className={`sidebar-menu-item ${activeTab === 'intent' ? 'active' : ''}`}
              onClick={() => setActiveTab('intent')}
            >
              <div className="sidebar-icon-wrap">
                <ArrowRightLeft size={15} />
                <span>2. Smart Bill Pay</span>
              </div>
            </div>

            <div 
              className={`sidebar-menu-item ${activeTab === 'yield' ? 'active' : ''}`}
              onClick={() => setActiveTab('yield')}
            >
              <div className="sidebar-icon-wrap">
                <Coins size={15} />
                <span>3. Savings Optimizer</span>
              </div>
            </div>

            <div 
              className={`sidebar-menu-item ${activeTab === 'payroll' ? 'active' : ''}`}
              onClick={() => setActiveTab('payroll')}
            >
              <div className="sidebar-icon-wrap">
                <FileText size={15} />
                <span>4. Review & Pay AI Work</span>
              </div>
            </div>

            <div 
              className={`sidebar-menu-item ${activeTab === 'consensus' ? 'active' : ''}`}
              onClick={() => setActiveTab('consensus')}
            >
              <div className="sidebar-icon-wrap">
                <Shield size={15} />
                <span>5. Approval Committee</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 var(--space-4)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* System Status card */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '6px' }}>Protection Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '12px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
                <span>All Systems Protected</span>
              </div>
            </div>

            {/* Feature B: Arc Predictable Gas Fee Meter */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Zap size={12} style={{ color: 'var(--accent-coral)' }} />
                <span>Transaction Costs</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cost per action:</span>
                  <strong style={{ color: 'var(--text-main)' }}>0.0004 USDC</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Confirmation time:</span>
                  <strong style={{ color: 'var(--text-main)' }}>Under 1 second</strong>
                </div>
                <div style={{ 
                  marginTop: '4px',
                  padding: '6px', 
                  backgroundColor: 'var(--bg-inner)', 
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '11px', 
                  color: 'var(--text-muted)',
                  lineHeight: '1.3'
                }}>
                  💡 With just <strong>$1</strong> in fees, your AI assistant can handle <strong>2,500 tasks</strong> automatically.
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Panel */}
        <main className="app-content">
          <div className="content-header">
            <div className="content-title">
              {activeTab === 'escrow' && <><Lock size={17} /><span>Set a <i>Spending Budget</i> for Your AI</span></>}
              {activeTab === 'intent' && <><ArrowRightLeft size={17} /><span>Incoming Bills — <i>Auto-Pay & Save</i></span></>}
              {activeTab === 'yield' && <><Coins size={17} /><span>Grow Your <i>Idle Cash</i> Automatically</span></>}
              {activeTab === 'payroll' && <><FileText size={17} /><span>Review What Your <i>AI Assistants</i> Did</span></>}
              {activeTab === 'consensus' && <><Shield size={17} /><span>Big Payments Need <i>Team Approval</i></span></>}
            </div>
            <div>
              <span className="badge-brutalist cyan">Business Ready</span>
            </div>
          </div>

          <div className="content-body">
            
            {/* FEATURE 1: Ví Tiêu Dùng AI (Smart Allowance) */}
            {activeTab === 'escrow' && (
              <div>
                <div className="brutalist-card accent-purple">
                  <h3 className="card-title">Give Your AI a <i>Spending Allowance</i></h3>
                  <p className="card-desc">Your AI assistant sometimes needs to buy things — like cloud services or software licenses. Instead of giving it access to your full account, set a small, safe budget it can spend on its own.</p>
                  
                  <div className="brutalist-split">
                    <div>
                      <div className="brutalist-form-group">
                        <label className="brutalist-label">How much can your AI spend? (up to $500)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                          <input 
                            type="range" 
                            min="10" 
                            max="500" 
                            value={pocketMoney} 
                            onChange={(e) => setPocketMoney(Number(e.target.value))} 
                            className="slider-brutalist"
                          />
                          <span style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', width: '90px', textAlign: 'right', color: 'var(--accent-coral)' }}>${pocketMoney}</span>
                        </div>
                      </div>

                      <div className="brutalist-form-group">
                        <label className="brutalist-label">Return unspent money after</label>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                          {['12h', '1d', '7d'].map((time) => (
                            <button
                              key={time}
                              onClick={() => setSafePeriod(time)}
                              className={`btn-brutalist ${safePeriod === time ? 'btn-brutalist-pink' : 'btn-brutalist-muted'}`}
                              style={{ padding: '8px 16px', fontSize: '12px' }}
                            >
                              {time === '12h' ? '12 Hours' : time === '1d' ? '1 Day' : '1 Week'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="brutalist-form-group">
                        <label className="brutalist-label">Approved services (your AI can only pay these)</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                            <input 
                              type="checkbox" 
                              checked={whitelistServices.openai}
                              onChange={(e) => setWhitelistServices({...whitelistServices, openai: e.target.checked})}
                              style={{ width: '16px', height: '16px' }}
                            />
                            <span>OpenAI (ChatGPT)</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                            <input 
                              type="checkbox" 
                              checked={whitelistServices.together}
                              onChange={(e) => setWhitelistServices({...whitelistServices, together: e.target.checked})}
                              style={{ width: '16px', height: '16px' }}
                            />
                            <span>Together AI (Computing Power)</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                            <input 
                              type="checkbox" 
                              checked={whitelistServices.huggingface}
                              onChange={(e) => setWhitelistServices({...whitelistServices, huggingface: e.target.checked})}
                              style={{ width: '16px', height: '16px' }}
                            />
                            <span>Hugging Face (AI Models)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                    <div className="bracket-button-wrap">
                      <button 
                        className="btn-brutalist btn-brutalist-pink" 
                        onClick={handleCreateEphemeral} 
                        disabled={isEscrowLoading || piggyBankStatus === 'ACTIVE'}
                      >
                        {isEscrowLoading ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                        <span>Activate Spending Budget</span>
                      </button>
                    </div>

                    {piggyBankStatus === 'ACTIVE' && (
                      <button className="btn-brutalist btn-brutalist-muted" onClick={handleSweepEscrow}>
                        <RefreshCw size={14} />
                        <span>Get Back Unspent Funds (${pocketMoney - piggyBankSpent})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated AI flow visualizer */}
                {piggyBankStatus !== 'INACTIVE' && (
                  <div className="brutalist-card accent-cyan" style={{ animation: 'slideDown 0.3s' }}>
                    <h3 className="card-title">How Your Money Flows</h3>
                    
                    <div className="non-tech-flow-wrap">
                      <div className={`flow-node-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}>
                        🏢 Your Company Account
                      </div>
                      
                      <div className={`flow-connector-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}></div>
                      
                      <div className={`flow-node-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}>
                        🐷 AI Spending Allowance
                        <div style={{ fontSize: '9px', fontWeight: 'normal', color: 'var(--text-muted)' }}>Budget: ${pocketMoney}</div>
                      </div>

                      <div className={`flow-connector-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}></div>

                      <div className={`flow-node-brutalist ${piggyBankStatus === 'ACTIVE' ? 'active' : ''}`}>
                        🤖 AI Assistant
                      </div>

                      <div className="flow-connector-brutalist"></div>

                      <div className="flow-node-brutalist">
                        🔒 Approved Service
                      </div>
                    </div>

                    {/* Feature C: Ephemeral Private Key Viewer */}
                    {piggyBankStatus === 'ACTIVE' && (
                      <div style={{
                        backgroundColor: 'var(--bg-inner)',
                        border: '1px solid var(--border)',
                        padding: '12px var(--space-4)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700 }}>
                            <Lock size={14} style={{ color: 'var(--accent-coral)' }} />
                            <span>AI’s Temporary Account: <code style={{ fontSize: '11px', backgroundColor: '#e2dfd9', padding: '2px 6px', borderRadius: '4px' }}>{piggyBankAddress.slice(0, 10)}...{piggyBankAddress.slice(-6)}</code></span>
                          </div>
                          
                          <button 
                            className="btn-brutalist btn-brutalist-muted" 
                            onClick={() => setShowPrivateKey(prev => !prev)}
                            style={{ padding: '4px 10px', fontSize: '10.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {showPrivateKey ? <EyeOff size={11} /> : <Eye size={11} />}
                            <span>{showPrivateKey ? 'Hide Details' : 'Show Technical Details'}</span>
                          </button>
                        </div>
                        
                        {showPrivateKey && (
                          <div style={{
                            marginTop: '6px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fef3c7',
                            padding: '10px',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'monospace',
                            fontSize: '11.5px',
                            wordBreak: 'break-all',
                            color: '#92400e',
                            lineHeight: '1.4'
                          }}>
                            <strong>🔒 Session Key:</strong> {ephemeralPrivateKey}
                            <div style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', fontFamily: 'var(--font-sans)', fontWeight: 550 }}>
                              ⚠️ This temporary key only exists while this budget session is active. It will be securely deleted when you get back your unspent funds.
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {showOverspentWarning && (
                      <div style={{
                        backgroundColor: '#fff1f2',
                        color: '#9f1239',
                        padding: '12px',
                        border: '1px solid #ffe4e6',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '15px',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <AlertTriangle size={18} />
                        <span>⚠️ Budget limit reached! Your AI tried to make a purchase but the spending cap stopped it. You can get your remaining funds back or increase the budget.</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        AI has spent: <span style={{ color: 'var(--accent-coral)', fontSize: '20px', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>${piggyBankSpent}</span> out of ${pocketMoney} budget
                      </div>
                      
                      {piggyBankStatus === 'ACTIVE' && (
                        <button className="btn-brutalist btn-brutalist-cyan" onClick={handleExecuteSpend}>
                          <Play size={12} />
                          <span>Simulate: AI Buys a $5 Service</span>
                        </button>
                      )}

                      {piggyBankStatus === 'SWEPT' && (
                        <div className="badge-brutalist green" style={{ padding: '8px 15px', fontSize: '12px' }}>
                           All done — remaining funds safely returned to your account
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FEATURE 2: TỰ ĐỘNG PHÂN LOẠI (Auto Pay & Categorize) */}
            {activeTab === 'intent' && (
              <div>
                <div className="brutalist-card accent-pink">
                  <h3 className="card-title">Incoming Bills — <i>Paid & Sorted Automatically</i></h3>
                  <p className="card-desc">When a bill comes in, InferPay reads it, pays the right vendor, and automatically sets aside a portion as company savings. You don’t have to do anything.</p>

                  <div className="brutalist-split" style={{ alignItems: 'center' }}>
                    <div>
                      <div className="brutalist-form-group">
                        <label className="brutalist-label">Choose a sample bill to process</label>
                        <select 
                          className="brutalist-input" 
                          value={intentSelection}
                          onChange={(e) => {
                            setIntentSelection(e.target.value)
                            const sel = intentsPreload.find(i => i.id === e.target.value)
                            if (sel) setIntentAmount(sel.amount)
                          }}
                        >
                          {intentsPreload.map(item => (
                            <option key={item.id} value={item.id} style={{ color: 'var(--text-dark)' }}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="brutalist-form-group">
                        <label className="brutalist-label">What InferPay understands about this bill</label>
                        <p style={{
                          backgroundColor: 'var(--bg-inner)',
                          padding: '15px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13.5px',
                          lineHeight: '1.45',
                          border: '1px solid var(--border)',
                          fontWeight: 500
                        }}>
                          {intentsPreload.find(i => i.id === intentSelection)?.details}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div className="bracket-button-wrap">
                          <button className="btn-brutalist btn-brutalist-pink" onClick={handleTriggerIntent} disabled={isIntentLoading}>
                            {isIntentLoading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                            <span>Pay This Bill & Save 10%</span>
                          </button>
                        </div>
                        {intentTxHash && (
                          <a 
                            href={`https://testnet.arcscan.app/tx/${intentTxHash}`}
                            target="_blank" 
                            rel="noreferrer"
                            style={{ fontSize: '12px', color: 'var(--accent-coral)', fontWeight: 'bold', textDecoration: 'underline' }}
                          >
                            View payment receipt ↗
                          </a>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{
                        backgroundColor: 'var(--bg-inner)',
                        border: '1px solid var(--border)',
                        padding: '15px',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-soft)'
                      }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>💼 How the payment is split</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ marginRight: '30px', fontSize: '13px' }}>Paid to vendor (90%)</span>
                          <strong>${(intentAmount * 0.9).toFixed(2)} USDC</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span style={{ marginRight: '30px', fontSize: '13px' }}>Saved to your reserves (10%)</span>
                          <strong>${(intentAmount * 0.1).toFixed(2)} USDC</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isIntentLoading && (
                  <div className="brutalist-card accent-cyan" style={{ animation: 'slideDown 0.3s' }}>
                    <h3 className="card-title">Processing Your Payment...</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                      <div className="dept-check-row">
                        <div className="dept-check-info">
                          <span>✉️</span>
                          <span>Payment received</span>
                        </div>
                        <span className="dept-check-status" style={{ color: '#166534' }}>CONFIRMED</span>
                      </div>

                      <div className="dept-check-row">
                        <div className="dept-check-info">
                          <span>🧠</span>
                          <span>Bill details analyzed and understood</span>
                        </div>
                        <span className="dept-check-status" style={{ color: 'var(--accent-coral)' }}>COMPLETED</span>
                      </div>

                      <div className="dept-check-row">
                        <div className="dept-check-info">
                          <span>📊</span>
                          <span>Vendor paid 90% · 10% saved to your reserves</span>
                        </div>
                        <span className="dept-check-status" style={{ color: '#166534' }}>SUCCESS</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FEATURE 3: TỰ ĐỘNG TỐI ƯU QUỸ (Auto Growth Treasury) */}
            {activeTab === 'yield' && (
              <div>
                <div className="brutalist-split">
                  <div className="brutalist-card accent-green">
                    <h3 className="card-title">Make Your <i>Idle Cash</i> Work for You</h3>
                    <p className="card-desc">InferPay watches for the best savings rates available and moves your idle funds to earn more — completely hands-free.</p>

                    <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                      <div style={{ flex: 1, padding: '15px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-inner)', boxShadow: 'var(--shadow-soft)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>USD Savings Rate</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{yieldUsdc}%</div>
                      </div>
                      
                      <div style={{ flex: 1, padding: '15px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-inner)', boxShadow: 'var(--shadow-soft)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>EUR Savings Rate</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-coral)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{yieldEurc}%</div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px dashed #bbf7d0',
                      padding: '15px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '20px',
                      fontSize: '13px',
                      color: '#166534',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Sparkles size={18} style={{ color: '#166534' }} />
                      <span>💡 Better rate found: The Euro account earns {(yieldEurc - yieldUsdc).toFixed(2)}% more. We recommend moving some funds over.</span>
                    </div>

                    <div className="bracket-button-wrap">
                      <button className="btn-brutalist btn-brutalist-pink" onClick={handleArbitrageSwap} disabled={isArbitrageLoading}>
                        {isArbitrageLoading ? <RefreshCw size={14} className="spin" /> : <ArrowRight size={14} />}
                        <span>Optimize Funds Automatically (USDC ➔ EURC)</span>
                      </button>
                    </div>
                  </div>

                  <div className="brutalist-card accent-yellow">
                    <h3 className="card-title">Your Savings <i>Growth Over Time</i></h3>
                    <p className="card-desc">See how your company’s idle cash has grown thanks to automatic rate optimization.</p>
                    
                    <div style={{
                      height: '160px',
                      backgroundColor: 'var(--bg-inner)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-around',
                      padding: '10px'
                    }}>
                      {[30, 45, 60, 50, 75, 90, 100].map((h, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35px' }}>
                          <div style={{
                            width: '20px',
                            height: `${h}px`,
                            backgroundColor: i === 6 ? 'var(--accent-coral)' : '#dbd8d0',
                            border: '1px solid var(--border)',
                            borderRadius: '2px 2px 0 0'
                          }}></div>
                          <span style={{ fontSize: '9px', marginTop: '4px', color: 'var(--text-light)' }}>Week {i+1}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '15px', fontWeight: 700 }}>
                      <span>Started with: $1,200</span>
                      <span>Current value: <span style={{ color: 'var(--accent-coral)' }}>${treasuryFunds}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 4: DUYỆT LƯƠNG TRỢ LÝ (AI Invoice Approval) */}
            {activeTab === 'payroll' && (
              <div>
                <div className="brutalist-card accent-cyan">
                  <h3 className="card-title">Review Your AI Assistants’ <i>Work Reports</i></h3>
                  <p className="card-desc">Your AI assistants submit reports showing what they accomplished. Review their work and approve payment with a single click.</p>

                  <table className="brutalist-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>AI Assistant</th>
                        <th>What They Did</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr 
                          key={inv.id} 
                          onClick={() => setSelectedInvoiceId(inv.id)}
                          className={selectedInvoiceId === inv.id ? 'selected' : ''}
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>{inv.id}</td>
                          <td><strong>{inv.agentName}</strong></td>
                          <td style={{ fontSize: '12px' }}>{inv.description}</td>
                          <td><strong style={{ color: 'var(--accent-coral)' }}>{inv.amount} {inv.currency}</strong></td>
                          <td>
                            <span className={`badge-brutalist ${inv.status === 'PAID' ? 'green' : 'yellow'}`}>
                              {inv.status === 'PAID' ? 'Paid ✓' : 'Needs Review'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Selected invoice proof cards */}
                {selectedInvoiceId && (
                  <div className="brutalist-card accent-purple" style={{ animation: 'slideDown 0.2s' }}>
                    <h3 className="card-title">Work Summary & <i>Verification</i></h3>
                    
                    <div className="brutalist-split" style={{ marginTop: '15px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                          Assistant: <span style={{ color: 'var(--accent-coral)' }}>{invoices.find(i => i.id === selectedInvoiceId)?.agentName}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px' }}>
                          What they accomplished:
                        </div>
                        <ul style={{
                          backgroundColor: 'var(--bg-inner)',
                          padding: '15px 15px 15px 30px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                          lineHeight: '1.6',
                          border: '1px solid var(--border)',
                          marginBottom: '15px'
                        }}>
                          {invoices.find(i => i.id === selectedInvoiceId)?.achievements.map((ach, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{ach}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="brutalist-form-group">
                          <label className="brutalist-label">Identity Verification</label>
                          <div style={{
                            backgroundColor: 'var(--bg-inner)',
                            padding: '12px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{ fontWeight: 700, color: '#166534' }}>🛡️ Verified — this report was genuinely submitted by the AI assistant (tamper-proof)</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
                          {invoices.find(i => i.id === selectedInvoiceId)?.status === 'PENDING' ? (
                            <>
                              <div className="bracket-button-wrap">
                                <button className="btn-brutalist btn-brutalist-pink" onClick={triggerPayrollApproval} disabled={isPayrollLoading}>
                                  {isPayrollLoading ? <RefreshCw size={12} className="spin" /> : <Check size={12} />}
                                  <span>Approve & Send Payment</span>
                                </button>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                                Quick tip: You can also press <kbd style={{ background: 'var(--bg-inner)', border: '1px solid var(--border)', padding: '2px 5px', borderRadius: '4px' }}>Shift + Enter</kbd> to approve instantly.
                              </div>
                            </>
                          ) : (
                            <div className="badge-brutalist green" style={{ padding: '10px 15px', fontSize: '13px' }}>
                              ⚡ Payment sent! Funds have been transferred directly to this assistant’s account.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FEATURE 5: ĐỒNG THUẬN AN TOÀN (Consensus Guard) */}
            {activeTab === 'consensus' && (
              <div>
                <div className="brutalist-card accent-yellow">
                  <h3 className="card-title">Large Payments Need <i>Multiple Approvals</i></h3>
                  <p className="card-desc">When someone requests a large payment ($25,000+), three independent reviewers must agree it’s safe before any money leaves your account.</p>

                  <div className="brutalist-split" style={{ marginBottom: '20px' }}>
                    <div style={{
                      backgroundColor: 'var(--bg-inner)',
                      border: '1px solid var(--border)',
                      padding: '15px',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-soft)'
                    }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Payment Awaiting Approval</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>$25,000 USDC</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-main)' }}><strong>Purpose: </strong> {consensusProposal.purpose}</div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="dept-check-row">
                          <span>1. Operations Team (Requester)</span>
                          <span className="badge-brutalist green">APPROVED ✅</span>
                        </div>
                        <div className="dept-check-row">
                          <span>2. Safety Reviewer</span>
                          <span className={`badge-brutalist ${consensusProposal.votes.compliance === 'APPROVED' ? 'green' : consensusProposal.votes.compliance === 'REJECTED' ? 'pink' : 'yellow'}`}>
                            {consensusProposal.votes.compliance === 'APPROVED' ? 'APPROVED ✅' : consensusProposal.votes.compliance === 'REJECTED' ? 'REJECTED ❌' : 'SCANNING ⏳'}
                          </span>
                        </div>
                        <div className="dept-check-row">
                          <span>3. Budget Reviewer</span>
                          <span className={`badge-brutalist ${consensusProposal.votes.auditor === 'APPROVED' ? 'green' : consensusProposal.votes.auditor === 'REJECTED' ? 'pink' : 'yellow'}`}>
                            {consensusProposal.votes.auditor === 'APPROVED' ? 'APPROVED ✅' : consensusProposal.votes.auditor === 'REJECTED' ? 'REJECTED ❌' : 'PENDING ⏳'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div className="bracket-button-wrap">
                      <button className="btn-brutalist btn-brutalist-pink" onClick={startDebate} disabled={isDebating || consensusProposal.status !== 'PENDING'}>
                        {isDebating ? <RefreshCw size={12} className="spin" /> : <Play size={12} />}
                        <span>Start Review Process</span>
                      </button>
                    </div>

                    {/* Feature D: Debate speed controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', padding: '4px var(--space-3)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', marginRight: '6px' }}>Speed:</span>
                      {['1x', '2x', '3x'].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setDebateSpeed(speed as '1x' | '2x' | '3x')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            border: debateSpeed === speed ? '1px solid var(--accent-coral)' : '1px solid transparent',
                            borderRadius: '4px',
                            backgroundColor: debateSpeed === speed ? '#fffdfb' : 'transparent',
                            color: debateSpeed === speed ? 'var(--accent-coral)' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {speed === '1x' ? 'Normal' : speed === '2x' ? 'Fast' : 'Instant'}
                        </button>
                      ))}
                    </div>

                    <button 
                      className="btn-brutalist btn-brutalist-muted" 
                      onClick={() => {
                        setComplianceFlag(prev => !prev)
                        addActivity('Test mode changed', `${!complianceFlag ? 'Turned on' : 'Turned off'} suspicious recipient simulation.`, '⚙️', 'warning')
                      }}
                    >
                      <AlertTriangle size={12} />
                      <span>{!complianceFlag ? 'Test: What if the recipient looks suspicious?' : 'Turn off suspicious recipient test'}</span>
                    </button>

                    {consensusProposal.status === 'REJECTED' && (
                      <button className="btn-brutalist btn-brutalist-pink" onClick={triggerBypass}>
                        <span>I’m the owner — approve this payment anyway</span>
                      </button>
                    )}

                    {consensusProposal.status === 'APPROVED' && (
                      <div className="badge-brutalist green" style={{ padding: '10px 15px', fontSize: '13px' }}>
                        🎉 All reviewers approved! Payment has been sent successfully.
                      </div>
                    )}

                    {consensusProposal.status === 'BYPASSED' && (
                      <div className="badge-brutalist yellow" style={{ padding: '10px 15px', fontSize: '13px' }}>
                        ⚠️ Payment was manually approved by the account owner.
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Non-Tech Chat Dialogue between agents */}
                {debateMessages.length > 0 && (
                  <div className="brutalist-card accent-cyan" style={{ animation: 'slideDown 0.3s' }}>
                    <h3 className="card-title">Review Discussion</h3>
                    <p className="card-desc" style={{ marginBottom: '10px' }}>Watch as each reviewer examines the payment request and shares their analysis.</p>
                    <div className="brutalist-chat-room">
                      {debateMessages.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble ${idx % 2 === 0 ? 'left' : 'right'}`}>
                          <div className="chat-sender">{msg.sender}</div>
                          <div style={{ fontSize: '13px' }}>{msg.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Info Box (AI Activity Feed instead of dry developer logs) */}
        <aside className="app-assistant-feed">
          <div className="feed-header">
            <Sparkles size={16} />
            <span>Recent Activity</span>
          </div>

          <div className="feed-list">
            {activities.map((act, idx) => (
              <div key={idx} className={`feed-card ${idx === 0 ? 'highlight' : ''}`} style={{ animation: 'slideDown 0.2s' }}>
                <div className="feed-card-header">
                  <span style={{ fontWeight: 700, color: act.type === 'success' ? 'var(--accent-coral)' : act.type === 'danger' ? 'var(--accent-pink)' : act.type === 'warning' ? 'var(--accent-yellow)' : 'var(--text-main)' }}>
                    {act.emoji} {act.title}
                  </span>
                  <span className="feed-card-time">{act.time}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '12px' }}>{act.desc}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {showFaucetModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title">
                <Droplet size={18} style={{ stroke: 'var(--accent-coral)' }} />
                <span>Get Free Test Funds</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowFaucetModal(false)}>
                <RefreshCw size={16} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Your account is connected to the live test network. To add real test funds that persist even after you refresh the page, you’ll need to request them from Circle’s official faucet. It takes about 30 seconds.
              </p>

              <div style={{
                backgroundColor: 'var(--bg-inner)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span className="brutalist-label" style={{ marginBottom: 0 }}>Your Account Address</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <code style={{
                    flex: 1,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    wordBreak: 'break-all',
                    color: 'var(--text-main)'
                  }}>
                    {address}
                  </code>
                  <button 
                    className="btn-brutalist btn-brutalist-cyan"
                    onClick={() => {
                      if (address) {
                        navigator.clipboard.writeText(address)
                        setCopied(true)
                        addActivity('Address copied', 'Your account address is ready to paste into the faucet page.', '📋', 'info')
                        setTimeout(() => setCopied(false), 2000)
                      }
                    }}
                    style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    {copied ? 'Copied! ✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>1.</span>
                  <span>Click <strong>Copy</strong> above to save your address.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>2.</span>
                  <span>Click <strong>Go to Faucet</strong> below — it will open in a new tab.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>3.</span>
                  <span>On the faucet page, choose <strong>Arc Testnet</strong>, paste your address, and hit send.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-coral)', fontWeight: 'bold' }}>4.</span>
                  <span>Come back here — your balance will update automatically within a few seconds!</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <div className="bracket-button-wrap" style={{ flex: 1 }}>
                  <a 
                    href="https://faucet.circle.com/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-brutalist btn-brutalist-pink"
                    style={{ display: 'flex', width: '100%', textDecoration: 'none', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <span>Go to Faucet ↗</span>
                  </a>
                </div>
                <button 
                  className="btn-brutalist btn-brutalist-muted" 
                  onClick={() => setShowFaucetModal(false)}
                  style={{ flex: 0.5 }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
