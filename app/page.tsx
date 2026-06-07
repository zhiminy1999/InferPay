'use client'

import { useState } from 'react'
import { Lock, ArrowRightLeft, Coins, FileText, Shield, Briefcase, Users } from 'lucide-react'
import { useWeb3 } from '@/lib/web3-provider'
import { useActivityFeed } from '@/hooks/useActivityFeed'
import { useBalances } from '@/hooks/useBalances'
import { useModularWallet } from '@/hooks/useModularWallet'
import AuthModal from '@/components/AuthModal'

// Decomposed Components
import TopBar from '@/components/TopBar'
import Sidebar from '@/components/Sidebar'
import ActivityFeed from '@/components/ActivityFeed'
import FaucetModal from '@/components/FaucetModal'
import SpendingBudget from '@/components/SpendingBudget'
import SmartBillPay from '@/components/SmartBillPay'
import SavingsOptimizer from '@/components/SavingsOptimizer'
import AIWorkReview from '@/components/AIWorkReview'
import ApprovalCommittee from '@/components/ApprovalCommittee'
import AgentDirectory from '@/components/AgentDirectory'
import JobBoard from '@/components/JobBoard'

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
  const [activeTab, setActiveTab] = useState<'escrow' | 'intent' | 'yield' | 'payroll' | 'consensus' | 'directory' | 'jobs'>('escrow')
  
  // Faucet and Auth modal states
  const [showFaucetModal, setShowFaucetModal] = useState<boolean>(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)

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
        disconnect={handleDisconnectAll}
      />

      {/* Main Workspace */}
      <div className="app-workspace">
        {/* Left Menu Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Center Panel */}
        <main className="app-content">
          <div className="content-header">
            <div className="content-title">
              {activeTab === 'escrow' && <><Lock size={17} /><span>Set a <i>Spending Budget</i> for Your AI</span></>}
              {activeTab === 'intent' && <><ArrowRightLeft size={17} /><span>Incoming Bills — <i>Auto-Pay & Save</i></span></>}
              {activeTab === 'yield' && <><Coins size={17} /><span>Grow Your <i>Idle Cash</i> Automatically</span></>}
              {activeTab === 'payroll' && <><FileText size={17} /><span>Review What Your <i>AI Assistants</i> Did</span></>}
              {activeTab === 'consensus' && <><Shield size={17} /><span>Big Payments Need <i>Team Approval</i></span></>}
              {activeTab === 'directory' && <><Users size={17} /><span>ERC-8004 Agent <i>Identity & Reputation Directory</i></span></>}
              {activeTab === 'jobs' && <><Briefcase size={17} /><span>ERC-8183 <i>Autonomous Job Market</i></span></>}
            </div>
            <div>
              <span className="badge-brutalist cyan">Business Ready</span>
            </div>
          </div>

          <div className="content-body">
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
          </div>
        </main>

        {/* Right Info Box */}
        <ActivityFeed activities={activities} />
      </div>

      <FaucetModal
        isOpen={showFaucetModal}
        onClose={() => setShowFaucetModal(false)}
        address={address}
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
    </div>
  )
}
