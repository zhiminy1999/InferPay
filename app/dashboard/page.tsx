'use client'

import { useState } from 'react'
import { Lock, ArrowRightLeft, Coins, FileText, Shield, Briefcase, Users, History, Zap, Cpu, X, HelpCircle } from 'lucide-react'
import { useWeb3 } from '@/lib/web3-provider'
import { useActivityFeed } from '@/hooks/useActivityFeed'
import { useBalances } from '@/hooks/useBalances'
import { useModularWallet } from '@/hooks/useModularWallet'
import AuthModal from '@/components/AuthModal'

// Decomposed Components
import TopBar from '@/components/TopBar'
import Sidebar from '@/components/Sidebar'
import FaucetModal from '@/components/FaucetModal'
import { UserProfileModal } from '@/components/UserProfileModal'
import SpendingBudget from '@/components/SpendingBudget'
import SmartBillPay from '@/components/SmartBillPay'
import SavingsOptimizer from '@/components/SavingsOptimizer'
import AIWorkReview from '@/components/AIWorkReview'
import ApprovalCommittee from '@/components/ApprovalCommittee'
import AgentDirectory from '@/components/AgentDirectory'
import JobBoard from '@/components/JobBoard'
import { NanopaymentWidget } from '@/components/NanopaymentWidget'
import { NanopaymentDeposit } from '@/components/NanopaymentDeposit'
import { BridgeModal } from '@/components/BridgeModal'
import { UnifiedBalance } from '@/components/UnifiedBalance'
import { TransactionHistory } from '@/components/TransactionHistory'
import Marketplace from '@/components/Marketplace'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import AgentWorkspace from '@/components/AgentWorkspace'

export default function InferPayDashboard() {
  const {
    isConnected,
    address,
    walletClient,
    publicClient,
    walletType,
    connectMetaMask,
    connectPasskey,
    disconnect
  } = useWeb3()

  // Tab views
  const [activeTab, setActiveTab] = useState<'agents' | 'escrow' | 'intent' | 'yield' | 'payroll' | 'consensus' | 'directory' | 'jobs' | 'nanopayments' | 'marketplace' | 'analytics' | 'history'>('agents')
  
  // Faucet, Auth, and Bridge modal states
  const [showFaucetModal, setShowFaucetModal] = useState<boolean>(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [showBridgeModal, setShowBridgeModal] = useState<boolean>(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false)
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false)
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false)

  // Shared hooks
  const { activities, addActivity } = useActivityFeed()
  
  const { usdcBalance, eurcBalance, setUsdcBalance, setEurcBalance } = useBalances({
    isConnected,
    address,
    publicClient,
    addActivity
  })

  // Modular Wallet Hook
  const {
    loading: modularWalletLoading,
    registerWallet,
    loginWallet,
    disconnectWallet
  } = useModularWallet({ addActivity })

  // Faucet state (Feature A)
  const [isFaucetLoading, setIsFaucetLoading] = useState(false)

  // --- Passkey Handlers ---
  const handleRegisterPasskey = async (username: string) => {
    const res = await registerWallet(username)
    if (res.success && res.address && res.walletClient) {
      connectPasskey(res.address, res.walletClient)
      return true
    }
    return false
  }

  const handleLoginPasskey = async (username: string) => {
    const res = await loginWallet(username)
    if (res.success && res.address && res.walletClient) {
      connectPasskey(res.address, res.walletClient)
      return true
    }
    return false
  }

  const handleDisconnectAll = () => {
    disconnect()
    disconnectWallet()
  }

  // --- Feature A: Faucet for stablecoins ---
  const handleFaucet = async () => {
    setIsFaucetLoading(true)
    if (isConnected && address) {
      addActivity('Requesting faucet funds', 'Transferring 10 USDC & 10 EURC on Arc Testnet...', 'faucet', 'info')
      try {
        const res = await fetch('/api/faucet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetAddress: address }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          addActivity('Faucet funded', 'Received 10 USDC & 10 EURC on Arc Testnet!', 'party', 'success')
          
          // Fetch new balances
          if (setUsdcBalance && setEurcBalance) {
            setUsdcBalance((Number(usdcBalance) + 10).toFixed(2))
            setEurcBalance((Number(eurcBalance) + 10).toFixed(2))
          }
        } else {
          throw new Error(data.error || 'Faucet request failed')
        }
      } catch (err: any) {
        addActivity('Faucet failed', err.message || 'Could not fund wallet.', 'cross', 'danger')
      } finally {
        setIsFaucetLoading(false)
      }
    } else {
      addActivity('Faucet request blocked', 'Please connect your wallet first to request testnet faucet funds.', 'lock', 'warning')
      setIsFaucetLoading(false)
      setIsAuthModalOpen(true)
    }
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <TopBar
        isConnected={isConnected}
        address={address}
        usdcBalance={usdcBalance}
        eurcBalance={eurcBalance}
        isFaucetLoading={isFaucetLoading}
        handleFaucet={handleFaucet}
        walletType={walletType}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenBridge={() => setShowBridgeModal(true)}
        disconnect={handleDisconnectAll}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenHelpGuide={() => setShowHelpModal(true)}
      />

      {/* Mobile Sidebar backdrop overlay */}
      {mobileSidebarOpen && (
        <div 
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 20, 22, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Main Workspace */}
      <div className="app-workspace">
        {/* Left Menu Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Center Panel */}
        <main className="app-content">
          <div className="content-header">
            <div className="content-title">
              {activeTab === 'agents' && <><Cpu size={17} /><span>Stateful Multi-Agent <i>Autonomous Workspace</i></span></>}
              {activeTab === 'escrow' && <><Lock size={17} /><span>Set a <i>Spending Budget</i> for Your AI</span></>}
              {activeTab === 'intent' && <><ArrowRightLeft size={17} /><span>Incoming Bills — <i>Auto-Pay & Save</i></span></>}
              {activeTab === 'yield' && <><Coins size={17} /><span>Grow Your <i>Idle Cash</i> Automatically</span></>}
              {activeTab === 'payroll' && <><FileText size={17} /><span>Review What Your <i>AI Assistants</i> Did</span></>}
              {activeTab === 'consensus' && <><Shield size={17} /><span>Big Payments Need <i>Team Approval</i></span></>}
              {activeTab === 'directory' && <><Users size={17} /><span>ERC-8004 Agent <i>Identity & Reputation Directory</i></span></>}
              {activeTab === 'jobs' && <><Briefcase size={17} /><span>ERC-8183 <i>Autonomous Job Market</i></span></>}
              {activeTab === 'nanopayments' && <><Zap size={17} /><span>Circle Gateway <i>Nanopayments (x402 Protocol)</i></span></>}
              {activeTab === 'history' && <><History size={17} /><span>Audit Trail & <i>Transaction Registry</i></span></>}
            </div>
            <div>
              <span className="badge-brutalist cyan">Business Ready</span>
            </div>
          </div>

          <div className="content-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isConnected && <UnifiedBalance />}

            {activeTab === 'agents' && (
              <AgentWorkspace />
            )}

            {activeTab === 'escrow' && (
              <SpendingBudget
                isConnected={isConnected}
                address={address}
                walletClient={walletClient}
                publicClient={publicClient}
                addActivity={addActivity}
              />
            )}

            {activeTab === 'intent' && (
              <SmartBillPay
                isConnected={isConnected}
                address={address}
                walletClient={walletClient}
                publicClient={publicClient}
                addActivity={addActivity}
              />
            )}

            {activeTab === 'yield' && (
              <SavingsOptimizer
                isConnected={isConnected}
                address={address}
                walletClient={walletClient}
                publicClient={publicClient}
                usdcBalance={usdcBalance}
                eurcBalance={eurcBalance}
                setUsdcBalance={setUsdcBalance}
                setEurcBalance={setEurcBalance}
                addActivity={addActivity}
              />
            )}

            {activeTab === 'payroll' && (
              <AIWorkReview
                isConnected={isConnected}
                address={address}
                walletClient={walletClient}
                publicClient={publicClient}
                addActivity={addActivity}
              />
            )}

            {activeTab === 'consensus' && (
              <ApprovalCommittee
                isConnected={isConnected}
                address={address}
                walletClient={walletClient}
                publicClient={publicClient}
                addActivity={addActivity}
              />
            )}

            {activeTab === 'directory' && (
              <AgentDirectory
                isConnected={isConnected}
                address={address}
                walletClient={walletClient}
                publicClient={publicClient}
                addActivity={addActivity}
              />
            )}

            {activeTab === 'jobs' && (
              <JobBoard
                isConnected={isConnected}
                address={address}
                walletClient={walletClient}
                publicClient={publicClient}
                addActivity={addActivity}
              />
            )}

            {activeTab === 'nanopayments' && (
              <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <NanopaymentWidget />
                <NanopaymentDeposit />
              </div>
            )}

            {activeTab === 'marketplace' && (
              <Marketplace />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard />
            )}

            {activeTab === 'history' && (
              <TransactionHistory />
            )}
          </div>
        </main>
      </div>

      <FaucetModal
        isOpen={showFaucetModal}
        onClose={() => setShowFaucetModal(false)}
        address={address}
        onOpenBridge={() => setShowBridgeModal(true)}
        addActivity={addActivity}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConnectMetaMask={connectMetaMask}
        onRegisterPasskey={handleRegisterPasskey}
        onLoginPasskey={handleLoginPasskey}
        loading={modularWalletLoading}
      />

      <BridgeModal
        isOpen={showBridgeModal}
        onClose={() => setShowBridgeModal(false)}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        address={address}
        usdcBalance={usdcBalance}
        eurcBalance={eurcBalance}
        walletType={walletType}
        disconnect={handleDisconnectAll}
      />

      {showHelpModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-container" style={{ maxWidth: '640px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} style={{ color: 'var(--accent-coral)' }} />
                <span>Interactive Onboarding & <i>System Guide</i></span>
              </h3>
              <button className="modal-close-btn" onClick={() => setShowHelpModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px', fontSize: '13px', lineHeight: '1.5' }}>
              <div style={{ backgroundColor: 'var(--bg-inner)', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Welcome to InferPay Space!</strong>
                <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)' }}>
                  This dashboard is a fully realized stablecoin treasury operations center on Arc Testnet, featuring real-time AI swarms, programmable spending limits, and automated yield sweeps.
                </p>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                  Core Testing Workflows
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <strong>1. Refill Test Assets:</strong> Click the droplet icon (<strong>Get Free Test Funds</strong>) on the top bar. In Live mode, this deposits native gas USDC (18 decimals) and ERC-20 stablecoins directly into your connected MetaMask. In Demo mode, it adds $1,000 to your simulated balance instantly.
                  </div>
                  <div>
                    <strong>2. Execute AI Tasks:</strong> Go to the <strong>AI Agent Workspace</strong>. Click any suggested command (e.g. <i>"Swap 25 USDC"</i>) and press <strong>Run</strong>. The LangGraph agent swarm coordinates token swaps or balance checks, logging each step in real time.
                  </div>
                  <div>
                    <strong>3. Define Spending Budgets:</strong> Select <strong>AI Spending Budget</strong> to lock stablecoins in an ephemeral escrow wallet with preset spending limits, whitelisted addresses, and expiration times.
                  </div>
                  <div>
                    <strong>4. Approve High-Value Invoices:</strong> Go to the <strong>Approval Committee</strong>. Propose a payment (e.g., $25,000) and watch the three-party AI audit swarm deliberate. Toggle compliance flags to test rejection scenarios and manual human overrides.
                  </div>
                  <div>
                    <strong>5. Perform Micro-billing:</strong> Go to <strong>Gateway Nanopayments</strong>. Authorize off-chain EIP-712 signatures to pay fractions-of-a-cent for compute queries on the Fly.
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#fef3c7', color: '#78350f', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                <strong>Under the Hood:</strong> We sponsor all transactions on Arc Testnet using a server-side relayer. The USDC stablecoin acts directly as the native gas asset, meaning you never need separate gas tokens to test!
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border)', marginTop: '12px' }}>
              <button className="btn-brutalist btn-brutalist-pink" onClick={() => setShowHelpModal(false)}>
                Got It, Let's Go!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
