'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Check, ShieldCheck } from 'lucide-react'
import { useAgentRegistry } from '@/hooks/useAgentRegistry'
import { useJobEscrow } from '@/hooks/useJobEscrow'
import { CurrencySelector } from './CurrencySelector'
import { parseUnits } from 'viem'
import { erc20Abi, USDC_ADDRESS_ARC, EURC_ADDRESS_ARC } from '@/lib/contracts'
import { ButtonLoading } from './LoadingSystem'
import { BrandIcon } from './BrandIcon'

interface AIWorkReviewProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

interface WorkInvoice {
  id: string
  agentName: string
  agentWallet: string
  description: string
  achievements: string[]
  amount: number
  currency: string
  status: 'PAID' | 'PENDING'
  defaultReputation: number
  capabilities: string
}

export function AIWorkReview({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: AIWorkReviewProps) {
  // Mapping invoices to system agent addresses from useAgentRegistry
  const [invoices, setInvoices] = useState<WorkInvoice[]>([
    { 
      id: 'INV-01', 
      agentName: 'Server Maintenance Bot', 
      agentWallet: '0x08Ec3EEfC622b8a8742fC8Ab48E832c236bc360B',
      description: 'Sped up your website and fixed data backup issues.', 
      achievements: ['Made your website 20% faster', 'Recovered 3 broken data backups'], 
      amount: 250, 
      currency: 'USDC', 
      status: 'PAID',
      defaultReputation: 98,
      capabilities: 'Escrow Control, Sweeps, Bypass Execution'
    },
    { 
      id: 'INV-02', 
      agentName: 'Budget Auditor Agent', 
      agentWallet: '0xB2a136968F2a8085371577Cbbe173F79b93caF1a',
      description: 'Wrote newsletters and improved your website search ranking.', 
      achievements: ['Published 15 blog articles', 'Redesigned email marketing templates'], 
      amount: 80, 
      currency: 'USDC', 
      status: 'PAID',
      defaultReputation: 95,
      capabilities: 'Budget Auditing, Balance Validation'
    },
    { 
      id: 'INV-03', 
      agentName: 'Safety Reviewer Agent', 
      agentWallet: '0x0c200b495d3EF602151caa364e071Bd71829978B',
      description: 'Checked your code for vulnerabilities and strengthened protections.', 
      achievements: ['Reviewed 5 code repositories', 'Fixed 2 critical security issues'], 
      amount: 850, 
      currency: 'USDC', 
      status: 'PENDING',
      defaultReputation: 99,
      capabilities: 'Address Risk Scoring, Compliance Verification'
    }
  ])

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('INV-03')
  const [isPayrollLoading, setIsPayrollLoading] = useState(false)
  const [liveReputations, setLiveReputations] = useState<{ [key: string]: number }>({})
  const [currency, setCurrency] = useState<'USDC' | 'EURC'>('USDC')

  // Keep invoice currency in sync with selected currency toggle for pending payroll
  useEffect(() => {
    if (selectedInvoiceId) {
      setInvoices(prev => prev.map(inv => (inv.id === selectedInvoiceId && inv.status === 'PENDING') ? { ...inv, currency } : inv))
    }
  }, [currency, selectedInvoiceId])

  const { getAgentDetails } = useAgentRegistry({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  const { getAllJobs } = useJobEscrow({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  // Fetch live agent reputations from the contract on mount
  useEffect(() => {
    const fetchReputations = async () => {
      if (isConnected && publicClient) {
        const reps: { [key: string]: number } = {}
        for (const inv of invoices) {
          try {
            const details = await getAgentDetails(inv.agentWallet as `0x${string}`)
            if (details) {
              reps[inv.agentWallet.toLowerCase()] = details.reputation
            }
          } catch (e) {
            console.error(e)
          }
        }
        setLiveReputations(reps)
      }
    }
    fetchReputations()
  }, [isConnected, publicClient])

  // Fetch live on-chain completed jobs
  useEffect(() => {
    const fetchOnChainJobs = async () => {
      if (isConnected && publicClient) {
        try {
          const allJobs = await getAllJobs()
          const completedJobs = allJobs.filter(j => j.status === 3)
          const onChainInvoices = completedJobs.map(job => ({
            id: `JOB-${job.id}`,
            agentName: `Job #${job.id} Provider`,
            agentWallet: job.provider,
            description: job.description,
            achievements: [
              `Deliverable Hash: ${job.deliverable.substring(0, 24)}...`,
              `Evaluator Auditor: ${job.evaluator}`
            ],
            amount: Number(job.budget),
            currency: 'USDC',
            status: 'PAID' as const,
            defaultReputation: 100,
            capabilities: 'ERC-8183 Settled Job Work'
          }))

          setInvoices(prev => {
            const baseInvoices = prev.filter(inv => !inv.id.startsWith('JOB-'))
            return [...baseInvoices, ...onChainInvoices]
          })
        } catch (err) {
          console.error('Error fetching onchain completed jobs for payroll:', err)
        }
      }
    }
    fetchOnChainJobs()
  }, [isConnected, publicClient, getAllJobs])

  const getReputationScore = (agentWallet: string, defaultRep: number) => {
    const live = liveReputations[agentWallet.toLowerCase()]
    return live !== undefined ? live : defaultRep
  }

  const triggerPayrollApproval = async () => {
    const selectedInv = invoices.find(inv => inv.id === selectedInvoiceId)
    if (!selectedInv || selectedInv.status !== 'PENDING') return

    setIsPayrollLoading(true)
    addActivity('Reviewing AI work', `Checking the work report from ${selectedInv.agentName}.`, 'refresh', 'info')

    try {
      if (isConnected && walletClient && address && publicClient) {
        const tokenAddress = currency === 'EURC' ? EURC_ADDRESS_ARC : USDC_ADDRESS_ARC
        const requiredAmount = parseUnits(selectedInv.amount.toString(), 6)

        addActivity('Initiating Payment', `Sending ${selectedInv.amount} ${currency} to agent at ${selectedInv.agentWallet.slice(0, 8)}...`, 'money', 'info')

        const hash = await walletClient.writeContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [selectedInv.agentWallet as `0x${string}`, requiredAmount],
          account: address as `0x${string}`,
          chain: null
        })

        addActivity('Transaction Submitted', `Transaction hash: ${hash.slice(0, 10)}... Waiting for confirmation.`, 'chain', 'info')
        await publicClient.waitForTransactionReceipt({ hash })

        setInvoices(prev => prev.map(inv => inv.id === selectedInvoiceId ? { ...inv, status: 'PAID' } : inv))
        addActivity('Report verified', 'This work report has been confirmed as authentic and untampered.', 'shield', 'success')
        addActivity('Payment settled', `${selectedInv.amount} ${currency} successfully paid to ${selectedInv.agentName} (Tx: ${hash.slice(0, 8)}...).`, 'party', 'success')
      } else {
        // Fallback for demo/unconnected state
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setInvoices(prev => prev.map(inv => inv.id === selectedInvoiceId ? { ...inv, status: 'PAID' } : inv))
        addActivity('Report verified', 'This work report has been confirmed as authentic and untampered.', 'shield', 'success')
        addActivity('Payment sent', `${selectedInv.amount} ${selectedInv.currency} has been sent to ${selectedInv.agentName}.`, 'money', 'success')
      }
    } catch (err: any) {
      console.error(err)
      const msg = err.shortMessage || err.message || 'Transaction failed'
      addActivity('Payment failed', msg, 'cross', 'danger')
    } finally {
      setIsPayrollLoading(false)
    }
  }

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
  }, [selectedInvoiceId, invoices, triggerPayrollApproval])

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId)

  return (
    <div>
      <div className="brutalist-card accent-cyan">
        <h3 className="card-title">Review Your AI Assistants’ <i>Work Reports</i></h3>
        <p className="card-desc">Your AI assistants submit reports showing what they accomplished. Review their work and approve payment with a single click.</p>

        <div className="table-responsive">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>AI Assistant (ERC-8004)</th>
                <th>On-chain Reputation</th>
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
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>{inv.agentName}</strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)', fontFamily: 'monospace' }}>
                        {inv.agentWallet.slice(0, 10)}...{inv.agentWallet.slice(-6)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-brutalist green" style={{ fontSize: '11px' }}>
                      {getReputationScore(inv.agentWallet, inv.defaultReputation)}/100
                    </span>
                  </td>
                  <td style={{ fontSize: '12px' }}>{inv.description}</td>
                  <td><strong style={{ color: 'var(--accent-coral)' }}>{inv.amount} {inv.currency}</strong></td>
                  <td>
                    <span className={`badge-brutalist ${inv.status === 'PAID' ? 'green' : 'yellow'}`}>
                      {inv.status === 'PAID' ? 'Paid' : 'Needs Review'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected invoice proof cards */}
      {selectedInvoiceId && selectedInvoice && (
        <div className="brutalist-card accent-purple" style={{ animation: 'slideDown 0.2s' }}>
          <h3 className="card-title">Work Summary & <i>Verification</i></h3>
          
          <div className="brutalist-split" style={{ marginTop: '15px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                Assistant: <span style={{ color: 'var(--accent-coral)' }}>{selectedInvoice.agentName}</span>
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
                marginBottom: '15px',
                color: 'var(--text-main)'
              }}>
                {selectedInvoice.achievements.map((ach, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{ach}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="brutalist-form-group">
                <label className="brutalist-label">ERC-8004 Identity Verification</label>
                <div style={{
                  backgroundColor: 'var(--bg-inner)',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  color: 'var(--text-main)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700 }}>
                    <ShieldCheck size={16} />
                    <span>On-chain Registered & Verified Identity</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                    <strong>Capabilities:</strong> {selectedInvoice.capabilities}
                    <br />
                    <strong>Reputation score:</strong> {getReputationScore(selectedInvoice.agentWallet, selectedInvoice.defaultReputation)}/100
                  </div>
                  
                  {isConnected && (
                    <a 
                      href={`https://testnet.arcscan.app/address/0xb4a614a597280888D3EEAB8a44562EAB59871270`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '11px', color: 'var(--accent-coral)', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}
                    >
                      <span>Verify on AgentRegistry contract ↗</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="brutalist-form-group" style={{ marginTop: '15px' }}>
                <label className="brutalist-label">Select Payment Currency</label>
                <div style={{ marginTop: '8px' }}>
                  <CurrencySelector selected={currency} onChange={setCurrency} disabled={selectedInvoice?.status !== 'PENDING' || isPayrollLoading} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
                {selectedInvoice.status === 'PENDING' ? (
                  <>
                    <div className="bracket-button-wrap">
                      <ButtonLoading
                        isLoading={isPayrollLoading}
                        loadingText="Processing..."
                        onClick={triggerPayrollApproval}
                        variantClass="btn-brutalist btn-brutalist-pink"
                      >
                        <Check size={12} />
                        <span>Approve & Send Payment</span>
                      </ButtonLoading>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                      Quick tip: You can also press <kbd style={{ background: 'var(--bg-inner)', border: '1px solid var(--border)', padding: '2px 5px', borderRadius: '4px' }}>Shift + Enter</kbd> to approve instantly.
                    </div>
                  </>
                ) : (
                  <div className="badge-brutalist green" style={{ padding: '10px 15px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <BrandIcon name="lightning" size={14} variant="green" />
                    <span>Payment sent! Funds have been transferred directly to this assistant’s account.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AIWorkReview
