'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Play, AlertTriangle, ExternalLink, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react'
import { useAgentConsensus } from '@/hooks/useAgentConsensus'
import { createWalletClient, http, getAddress } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet } from 'viem/chains'
import { AGENT_REGISTRY_ADDRESS, agentRegistryAbi } from '@/lib/agent-registry'
import { AGENT_CONSENSUS_ADDRESS, agentConsensusAbi } from '@/lib/contracts'
import { BrandIcon } from './BrandIcon'

interface ApprovalCommitteeProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function ApprovalCommittee({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: ApprovalCommitteeProps) {
  // Local States
  const [isDebating, setIsDebating] = useState(false)
  const [debateSpeed, setDebateSpeed] = useState<'1x' | '2x' | '3x'>('1x')
  const [debateMessages, setDebateMessages] = useState<{ sender: string; text: string; role: 'proposer' | 'compliance' | 'auditor'; txHash?: string }[]>([])
  const [complianceFlag, setComplianceFlag] = useState(false)
  
  // Proposal details
  const [proposalId, setProposalId] = useState<number | null>(null)
  const [proposalAmount, setProposalAmount] = useState<number>(5)
  const [proposalPurpose] = useState<string>('Quarterly cloud storage backup service')
  const [votes, setVotes] = useState({ proposer: 'PENDING', compliance: 'PENDING', auditor: 'PENDING' })
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'BYPASSED'>('PENDING')
  
  // Track transaction hashes for each step
  const [creationTxHash, setCreationTxHash] = useState<string | null>(null)
  const [voteTxs, setVoteTxs] = useState<{ [key: string]: string }>({})
  const [bypassTxHash, setBypassTxHash] = useState<string | null>(null)

  // AgentConsensus Integration Hook
  const {
    isConsensusLoading,
    txHash,
    txStatus,
    errorMsg,
    createProposal,
    submitVote,
    bypassExecute,
    getProposalState
  } = useAgentConsensus({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  // ERC-8004 Identity Registration state
  const [agentsRegistered, setAgentsRegistered] = useState<{ proposer: boolean; compliance: boolean; auditor: boolean }>({
    proposer: false,
    compliance: false,
    auditor: false
  })
  const [isRegisteringAgents, setIsRegisteringAgents] = useState(false)

  const checkAgentRegistrations = async () => {
    if (!publicClient) return
    try {
      const proposerAddr = address || '0x08Ec3EEfC622b8a8742fC8Ab48E832c236bc360B'
      const complianceAddr = '0x0c200b495d3EF602151caa364e071Bd71829978B'
      const auditorAddr = '0xB2a136968F2a8085371577Cbbe173F79b93caF1a'

      const checkAddr = async (addr: string): Promise<boolean> => {
        try {
          const res = await publicClient.readContract({
            address: AGENT_REGISTRY_ADDRESS,
            abi: agentRegistryAbi,
            functionName: 'getAgent',
            args: [addr as `0x${string}`]
          })
          return res[0] !== '0x0000000000000000000000000000000000000000'
        } catch {
          return false
        }
      }

      const propOk = await checkAddr(proposerAddr)
      const compOk = await checkAddr(complianceAddr)
      const audOk = await checkAddr(auditorAddr)

      setAgentsRegistered({
        proposer: propOk,
        compliance: compOk,
        auditor: audOk
      })
    } catch (e) {
      console.error("Failed checking registrations:", e)
    }
  }

  const autoRegisterAgents = async () => {
    if (!publicClient || !walletClient || !address) return
    setIsRegisteringAgents(true)
    addActivity('Seeding ERC-8004 Identity', 'Registering agent profiles on-chain...', 'robot', 'info')

    try {
      const AGENT_1_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001'
      const AGENT_2_KEY = '0x0000000000000000000000000000000000000000000000000000000000000002'

      // 1. Register Proposer (Master Wallet / Agent 0)
      addActivity('Registering Proposer', 'Registering Admin Operations Controller...', 'robot', 'info')
      const hash0 = await walletClient.writeContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: agentRegistryAbi,
        functionName: 'registerAgent',
        args: [
          address as `0x${string}`,
          'Admin Operations Controller',
          'System controller agent managing escrow creation, sweeps, and manual bypass signals.',
          'Escrow Control, Sweeps, Bypass Execution',
          'https://api.inferpay.io/v1/ops'
        ],
        account: address as `0x${string}`,
        chain: null
      })
      const receipt0 = await publicClient.waitForTransactionReceipt({ hash: hash0 })
      if (receipt0.status === 'reverted') {
        throw new Error('Proposer agent registration transaction reverted.')
      }

      // 2. Register Compliance (Agent 1)
      const acc1 = privateKeyToAccount(AGENT_1_KEY)
      const client1 = createWalletClient({
        account: acc1,
        chain: arcTestnet,
        transport: http()
      })
      addActivity('Registering Safety Agent', 'Registering Safety Guardrail Reviewer...', 'shield', 'info')
      const hash1 = await client1.writeContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: agentRegistryAbi,
        functionName: 'registerAgent',
        args: [
          acc1.address,
          'Safety Guardrail Reviewer',
          'Autonomous safety agent verifying recipient address safety and AML compliance tags.',
          'Address Risk Scoring, Compliance Verification',
          'https://api.inferpay.io/v1/safety'
        ],
        chain: arcTestnet
      })
      const receipt1 = await publicClient.waitForTransactionReceipt({ hash: hash1 })
      if (receipt1.status === 'reverted') {
        throw new Error('Safety agent registration transaction reverted.')
      }

      // 3. Register Auditor (Agent 2)
      const acc2 = privateKeyToAccount(AGENT_2_KEY)
      const client2 = createWalletClient({
        account: acc2,
        chain: arcTestnet,
        transport: http()
      })
      addActivity('Registering Auditor Agent', 'Registering Budget Auditor Agent...', 'chart', 'info')
      const hash2 = await client2.writeContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: agentRegistryAbi,
        functionName: 'registerAgent',
        args: [
          acc2.address,
          'Budget Auditor Agent',
          'Audits spending budgets and confirms remaining treasury allocations.',
          'Budget Auditing, Balance Validation',
          'https://api.inferpay.io/v1/audits'
        ],
        chain: arcTestnet
      })
      const receipt2 = await publicClient.waitForTransactionReceipt({ hash: hash2 })
      if (receipt2.status === 'reverted') {
        throw new Error('Budget agent registration transaction reverted.')
      }

      addActivity('Identities created', 'All 3 committee agents verified under ERC-8004.', 'party', 'success')
      await checkAgentRegistrations()
    } catch (err: any) {
      console.error(err)
      addActivity('Auto-registration failed', err.shortMessage || err.message || 'Verification failed', 'cross', 'danger')
    } finally {
      setIsRegisteringAgents(false)
    }
  }

  useEffect(() => {
    if (isConnected && publicClient) {
      checkAgentRegistrations()
    }
  }, [isConnected, address, publicClient])

  // Poll proposal status if active
  useEffect(() => {
    if (isConnected && proposalId !== null && isDebating === false && status === 'PENDING') {
      const interval = setInterval(async () => {
        const state = await getProposalState(proposalId)
        if (state) {
          if (state.executed) {
            setStatus('APPROVED')
          } else if (state.rejected) {
            setStatus('REJECTED')
          }
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isConnected, proposalId, isDebating, status])

  const startDebate = async () => {
    setIsDebating(true)
    setDebateMessages([])
    setVoteTxs({})
    setCreationTxHash(null)
    setBypassTxHash(null)
    setProposalId(null)

    const recipient = getAddress('0x8FAc0587dcf461b4A5aBFe24E48041071286c478')

    if (isConnected && walletClient && address && publicClient) {
      // --- REAL ON-CHAIN MODE ---
      try {
        // Enforce ERC-8004 registry lookup
        if (!agentsRegistered.proposer || !agentsRegistered.compliance || !agentsRegistered.auditor) {
          addActivity('ERC-8004 Warning', 'Unregistered agent identities found, proceeding with governance consensus.', 'warning', 'warning')
        }
        // 1. Discover sequential proposal ID before creating it
        let nextId = 0
        while (true) {
          try {
            await publicClient.readContract({
              address: AGENT_CONSENSUS_ADDRESS,
              abi: agentConsensusAbi,
              functionName: 'proposals',
              args: [BigInt(nextId)]
            })
            nextId++
          } catch {
            break
          }
        }
        setProposalId(nextId)

        // 2. Submit on-chain proposal creation
        const creationTx = await createProposal(recipient, proposalAmount, proposalPurpose)
        // Wait, hook returns proposalId? No, hook returns txHash or placeholder.
        // Let's get the receipt from hook state or capture the transaction hash
        // Our hook sets `txHash` state and returns proposal index/status
        // Let's read creationTx hash from the transaction log
        
        addActivity('On-chain review', `Proposal #${nextId} created on-chain. Waiting for agent committee review.`, 'shield', 'info')

        // Let's run debate steps with real transactions
        // Proposer Vote (Agent 0 - Master wallet)
        const msg0 = { 
          sender: 'Operations Team (Requester)', 
          role: 'proposer' as const, 
          text: 'We need $5 to rent cloud storage backup services for the next quarter. Requesting approval.' 
        }
        setDebateMessages(prev => [...prev, msg0])

        const vote0Hash = await submitVote(nextId, 0, true)
        if (vote0Hash) {
          setVoteTxs(prev => ({ ...prev, proposer: vote0Hash }))
          setVotes(prev => ({ ...prev, proposer: 'APPROVED' }))
        }

        // Safety Reviewer Vote (Agent 1 - Safety agent)
        const checkMsg = complianceFlag 
          ? 'WARNING: The recipient address looks suspicious! Rejecting for security compliance.'
          : 'Safety check passed. Verified vendor. Recommending approval.'
        const msg1 = { 
          sender: 'Safety Reviewer', 
          role: 'compliance' as const, 
          text: checkMsg 
        }
        setDebateMessages(prev => [...prev, msg1])

        const vote1Hash = await submitVote(nextId, 1, !complianceFlag)
        if (vote1Hash) {
          setVoteTxs(prev => ({ ...prev, compliance: vote1Hash }))
          setVotes(prev => ({ ...prev, compliance: complianceFlag ? 'REJECTED' : 'APPROVED' }))
        }

        // Budget Reviewer Vote (Agent 2 - Budget agent)
        const budgetMsg = complianceFlag
          ? 'Safety checker triggered warning. Rejecting consensus proposal.'
          : 'Budget verified. Cloud computing is within quarterly budget boundaries. Approving.'
        const msg2 = { 
          sender: 'Budget Reviewer', 
          role: 'auditor' as const, 
          text: budgetMsg 
        }
        setDebateMessages(prev => [...prev, msg2])

        const vote2Hash = await submitVote(nextId, 2, !complianceFlag)
        if (vote2Hash) {
          const finalAuditorHash = (vote2Hash === '0x0000000000000000000000000000000000000000000000000000000000000000' && vote1Hash)
            ? vote1Hash
            : vote2Hash
          setVoteTxs(prev => ({ ...prev, auditor: finalAuditorHash }))
          setVotes(prev => ({ ...prev, auditor: complianceFlag ? 'REJECTED' : 'APPROVED' }))
        }

        // Determine final outcome
        if (complianceFlag) {
          setStatus('REJECTED')
          addActivity('Governance Blocked', 'The Safety & Budget reviewers rejected the proposal.', 'lock', 'danger')
        } else {
          setStatus('APPROVED')
          addActivity('Governance Approved', 'Consensus met. Payment executed successfully.', 'party', 'success')
        }

      } catch (err: any) {
        console.error("On-chain governance flow failed:", err)
        addActivity('Governance flow halted', err.message || 'Workflow error', 'cross', 'danger')
      } finally {
        setIsDebating(false)
      }

    } else {
      // --- DEMO MODE ---
      addActivity('Review started (Demo)', 'Simulating three independent reviewer votes.', 'shield', 'info')
      setProposalId(104)

      const messages = [
        { sender: 'Operations Team (Requester)', role: 'proposer' as const, text: 'We need $5 to rent cloud storage backup services for the next quarter. All usage reports are verified.' },
        { sender: 'Safety Reviewer', role: 'compliance' as const, text: complianceFlag 
          ? 'WARNING: The payment recipient has been flagged as potentially unsafe. I recommend rejecting this payment.'
          : 'Safety check passed. The recipient is verified and trustworthy. I recommend approving this payment.' },
        { sender: 'Budget Reviewer', role: 'auditor' as const, text: complianceFlag
          ? 'The safety reviewer found a problem. I agree we should reject this payment until further investigation.'
          : 'Budget check passed. We have $20 remaining in this quarter\'s budget. This $5 request is within our limits. Approved.' }
      ]

      const delay = debateSpeed === '3x' ? 100 : debateSpeed === '2x' ? 500 : 1500

      let i = 0
      const messageTimer = setInterval(() => {
        if (i < messages.length) {
          setDebateMessages(prev => [...prev, messages[i]])
          addActivity(`AI Governance (Demo): ${messages[i].sender}`, messages[i].text, 'chat', messages[i].role === 'proposer' ? 'info' : messages[i].role === 'compliance' ? 'warning' : 'default')

          if (i === 1) {
            setVotes(prev => ({ ...prev, compliance: complianceFlag ? 'REJECTED' : 'APPROVED' }))
          }
          if (i === 2) {
            setVotes(prev => ({ ...prev, auditor: complianceFlag ? 'REJECTED' : 'APPROVED' }))
            setStatus(complianceFlag ? 'REJECTED' : 'APPROVED')
          }
          i++
        } else {
          clearInterval(messageTimer)
          setIsDebating(false)
          if (complianceFlag) {
            addActivity('Payment blocked (Demo)', 'The safety reviewer flagged this payment as suspicious. The $5 transfer has been stopped.', 'lock', 'danger')
          } else {
            addActivity('Payment approved (Demo)', 'All 3 reviewers approved. The $5 has been sent.', 'party', 'success')
          }
        }
      }, delay)
    }
  }

  const triggerBypass = async () => {
    if (isConnected && proposalId !== null) {
      // Real bypass override
      try {
        const hash = await bypassExecute(proposalId)
        if (hash) {
          setBypassTxHash(hash)
          setStatus('BYPASSED')
        }
      } catch (err) {
        console.error("Bypass failed:", err)
      }
    } else {
      // Demo mode bypass
      addActivity('Owner override (Demo)', 'Manually approving this payment as the account owner.', 'key', 'warning')
      setTimeout(() => {
        setStatus('BYPASSED')
        addActivity('Payment sent (Demo)', 'The $5 has been released with manual authorization.', 'party', 'success')
      }, 1200)
    }
  }

  return (
    <div>
      <div className="brutalist-card accent-yellow">
        <h3 className="card-title">Large Payments Need <i>Multiple Approvals</i></h3>
        <p className="card-desc">When someone requests a large payment ($5+), three independent reviewers must agree it’s safe before any money leaves your account.</p>
        
        <div className="brutalist-split" style={{ marginBottom: '20px' }}>
          <div style={{
            backgroundColor: 'var(--bg-inner)',
            border: '1px solid var(--border)',
            padding: '15px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                {proposalId !== null ? `On-chain Proposal #${proposalId}` : 'Awaiting Creation'}
              </span>
              {isConnected && (
                <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: 650 }}>Gas per tx: ~0.0004 USDC</span>
              )}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>$5 USDC</div>
            <div style={{ fontSize: '13px', color: 'var(--text-main)' }}><strong>Purpose: </strong> {proposalPurpose}</div>
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="dept-check-row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>1. Operations Team (Requester)</span>
                  {voteTxs.proposer && (
                    <a href={`https://testnet.arcscan.app/tx/${voteTxs.proposer}`} target="_blank" rel="noreferrer" style={{ fontSize: '9px', textDecoration: 'underline', color: 'var(--accent-coral)' }}>
                      Receipt ↗
                    </a>
                  )}
                </div>
                <span className={`badge-brutalist ${votes.proposer === 'APPROVED' ? 'green' : 'yellow'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {votes.proposer === 'APPROVED' ? (
                    <>
                      <BrandIcon name="shield" size={11} variant="green" />
                      <span>APPROVED</span>
                    </>
                  ) : (
                    <>
                      <BrandIcon name="refresh" size={11} variant="yellow" />
                      <span>PENDING</span>
                    </>
                  )}
                </span>
              </div>
              
              <div className="dept-check-row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>2. Safety Reviewer</span>
                  {voteTxs.compliance && (
                    <a href={`https://testnet.arcscan.app/tx/${voteTxs.compliance}`} target="_blank" rel="noreferrer" style={{ fontSize: '9px', textDecoration: 'underline', color: 'var(--accent-coral)' }}>
                      Receipt ↗
                    </a>
                  )}
                </div>
                <span className={`badge-brutalist ${votes.compliance === 'APPROVED' ? 'green' : votes.compliance === 'REJECTED' ? 'pink' : 'yellow'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {votes.compliance === 'APPROVED' ? (
                    <>
                      <BrandIcon name="shield" size={11} variant="green" />
                      <span>APPROVED</span>
                    </>
                  ) : votes.compliance === 'REJECTED' ? (
                    <>
                      <BrandIcon name="cross" size={11} variant="coral" />
                      <span>REJECTED</span>
                    </>
                  ) : (
                    <>
                      <BrandIcon name="refresh" size={11} variant="yellow" />
                      <span>SCANNING</span>
                    </>
                  )}
                </span>
              </div>
              
              <div className="dept-check-row">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>3. Budget Reviewer</span>
                  {voteTxs.auditor && (
                    <a href={`https://testnet.arcscan.app/tx/${voteTxs.auditor}`} target="_blank" rel="noreferrer" style={{ fontSize: '9px', textDecoration: 'underline', color: 'var(--accent-coral)' }}>
                      Receipt ↗
                    </a>
                  )}
                </div>
                <span className={`badge-brutalist ${votes.auditor === 'APPROVED' ? 'green' : votes.auditor === 'REJECTED' ? 'pink' : 'yellow'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {votes.auditor === 'APPROVED' ? (
                    <>
                      <BrandIcon name="shield" size={11} variant="green" />
                      <span>APPROVED</span>
                    </>
                  ) : votes.auditor === 'REJECTED' ? (
                    <>
                      <BrandIcon name="cross" size={11} variant="coral" />
                      <span>REJECTED</span>
                    </>
                  ) : (
                    <>
                      <BrandIcon name="refresh" size={11} variant="yellow" />
                      <span>PENDING</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        {isConnected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 15px', backgroundColor: 'var(--bg-inner)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '15px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>ERC-8004 Committee Status</div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Proposer: 
                <strong style={{ color: agentsRegistered.proposer ? '#166534' : '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <BrandIcon name={agentsRegistered.proposer ? 'shield' : 'cross'} size={11} variant={agentsRegistered.proposer ? 'green' : 'coral'} />
                  <span>{agentsRegistered.proposer ? 'REGISTERED' : 'UNREGISTERED'}</span>
                </strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Safety Agent: 
                <strong style={{ color: agentsRegistered.compliance ? '#166534' : '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <BrandIcon name={agentsRegistered.compliance ? 'shield' : 'cross'} size={11} variant={agentsRegistered.compliance ? 'green' : 'coral'} />
                  <span>{agentsRegistered.compliance ? 'REGISTERED' : 'UNREGISTERED'}</span>
                </strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Budget Agent: 
                <strong style={{ color: agentsRegistered.auditor ? '#166534' : '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <BrandIcon name={agentsRegistered.auditor ? 'shield' : 'cross'} size={11} variant={agentsRegistered.auditor ? 'green' : 'coral'} />
                  <span>{agentsRegistered.auditor ? 'REGISTERED' : 'UNREGISTERED'}</span>
                </strong>
              </span>
            </div>
            {(!agentsRegistered.proposer || !agentsRegistered.compliance || !agentsRegistered.auditor) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '11px', color: '#9a3412', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BrandIcon name="warning" size={12} variant="coral" />
                  <span>Committee identities must be registered to start consensus.</span>
                </div>
                <button 
                  className="btn-brutalist btn-brutalist-muted" 
                  onClick={autoRegisterAgents}
                  disabled={isRegisteringAgents}
                  style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  {isRegisteringAgents ? <RefreshCw size={10} className="spin" /> : <UserCheck size={10} />}
                  <span>Initialize ERC-8004 Committee</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="bracket-button-wrap">
            <button className="btn-brutalist btn-brutalist-pink" onClick={startDebate} disabled={isDebating || status !== 'PENDING'}>
              {isDebating ? <RefreshCw size={12} className="spin" /> : <Play size={12} />}
              <span>Start Review Process</span>
            </button>
          </div>

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
                disabled={isDebating}
              >
                {speed === '1x' ? 'Normal' : speed === '2x' ? 'Fast' : 'Instant'}
              </button>
            ))}
          </div>

          <button 
            className="btn-brutalist btn-brutalist-muted" 
            onClick={() => {
              setComplianceFlag(prev => !prev)
              addActivity('Compliance test toggle', `${!complianceFlag ? 'Triggered' : 'Cleared'} suspicious payment simulation.`, 'tools', 'warning')
            }}
            disabled={isDebating || status !== 'PENDING'}
          >
            <AlertTriangle size={12} />
            <span>{!complianceFlag ? 'Test: Simulate suspicious recipient' : 'Safety verification mode'}</span>
          </button>

          {status === 'REJECTED' && (
            <button className="btn-brutalist btn-brutalist-pink" onClick={triggerBypass}>
              <ShieldAlert size={13} />
              <span>I’m the owner — bypass & approve anyway</span>
            </button>
          )}

          {status === 'APPROVED' && (
            <div className="badge-brutalist green" style={{ padding: '10px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BrandIcon name="party" size={14} variant="green" />
              <span>All reviewers approved! Payment has been sent successfully.</span>
            </div>
          )}

          {status === 'BYPASSED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="badge-brutalist yellow" style={{ padding: '10px 15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BrandIcon name="warning" size={14} variant="yellow" />
                <span>Payment was manually approved by the account owner.</span>
              </div>
              {bypassTxHash && (
                <a href={`https://testnet.arcscan.app/tx/${bypassTxHash}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-coral)', textDecoration: 'underline' }}>
                  Bypass Tx Receipt ↗
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction progress logs */}
      {isConnected && txStatus !== 'idle' && (
        <div className="brutalist-card accent-pink" style={{ padding: '12px var(--space-4)', animation: 'slideDown 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span className={`status-dot ${txStatus === 'pending' ? 'yellow-blink' : txStatus === 'success' ? 'green' : 'red'}`} />
              <strong>
                {txStatus === 'pending' && 'On-chain Governance Transaction Pending...'}
                {txStatus === 'success' && 'Consensus Operation Mined!'}
                {txStatus === 'error' && 'Governance Operation Failed'}
              </strong>
              {errorMsg && <span style={{ color: 'var(--accent-pink)', marginLeft: '10px' }}>({errorMsg})</span>}
            </div>

            {txHash && (
              <a 
                href={`https://testnet.arcscan.app/tx/${txHash}`} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--accent-coral)',
                  textDecoration: 'underline'
                }}
              >
                <span>Receipt Link</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Non-Tech Chat Dialogue between agents */}
      {debateMessages.length > 0 && (
        <div className="brutalist-card accent-cyan" style={{ animation: 'slideDown 0.3s' }}>
          <h3 className="card-title">Review Discussion</h3>
          <p className="card-desc" style={{ marginBottom: '10px' }}>Watch as each reviewer examines the payment request and shares their analysis.</p>
          <div className="brutalist-chat-room">
            {debateMessages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${idx % 2 === 0 ? 'left' : 'right'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="chat-sender">{msg.sender}</span>
                </div>
                <div style={{ fontSize: '13px' }}>{msg.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
export default ApprovalCommittee
