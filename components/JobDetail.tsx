'use client'

import React, { useState } from 'react'
import { Job } from '@/hooks/useJobEscrow'
import { FileText, Coins, CheckSquare, ShieldAlert, Award, Ban, Landmark, Scale, HelpCircle } from 'lucide-react'

interface JobDetailProps {
  job: Job
  currentUserAddress: string | null
  loading: boolean
  onSetBudget: (jobId: number, budget: string) => Promise<any>
  onFundJob: (jobId: number, budget: string) => Promise<any>
  onSubmitDeliverable: (jobId: number, text: string) => Promise<any>
  onCompleteJob: (jobId: number, reason: string) => Promise<any>
  onRejectJob: (jobId: number, reason: string) => Promise<any>
  onDisputeJob: (jobId: number) => Promise<any>
  onResolveDispute: (jobId: number, approvePayment: boolean) => Promise<any>
  contractOwnerAddress: string
  refreshJob: () => void
}

export function JobDetail({
  job,
  currentUserAddress,
  loading,
  onSetBudget,
  onFundJob,
  onSubmitDeliverable,
  onCompleteJob,
  onRejectJob,
  onDisputeJob,
  onResolveDispute,
  contractOwnerAddress,
  refreshJob
}: JobDetailProps) {
  const [budgetInput, setBudgetInput] = useState('')
  const [deliverableText, setDeliverableText] = useState('')
  const [actionReason, setActionReason] = useState('')

  const isClient = currentUserAddress?.toLowerCase() === job.client.toLowerCase()
  const isProvider = currentUserAddress?.toLowerCase() === job.provider.toLowerCase()
  const isEvaluator = currentUserAddress?.toLowerCase() === job.evaluator.toLowerCase()
  const isOwner = currentUserAddress?.toLowerCase() === contractOwnerAddress.toLowerCase()

  const isExpired = Date.now() / 1000 > job.expiredAt

  // Convert status to visual label
  const getStatusDetails = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Open (Awaiting Budget / Escrow)', class: 'accent-cyan', icon: <Landmark size={18} /> }
      case 1:
        return { label: 'Funded (Escrow Locked)', class: 'accent-yellow', icon: <Coins size={18} /> }
      case 2:
        return { label: 'Submitted (Review Pending)', class: 'accent-coral', icon: <CheckSquare size={18} /> }
      case 3:
        return { label: 'Completed & Paid', class: 'accent-green', icon: <Award size={18} style={{ color: 'var(--accent-green)' }} /> }
      case 4:
        return { label: 'Rejected & Refunded', class: 'accent-red', icon: <Ban size={18} style={{ color: 'var(--accent-red)' }} /> }
      default:
        return { label: 'Unknown', class: 'accent-muted', icon: <HelpCircle size={18} /> }
    }
  }

  const statusInfo = getStatusDetails(job.status)

  const handleSetBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!budgetInput) return
    try {
      await onSetBudget(job.id, budgetInput)
      setBudgetInput('')
      refreshJob()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliverableText) return
    try {
      await onSubmitDeliverable(job.id, deliverableText)
      setDeliverableText('')
      refreshJob()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCompleteSubmit = async () => {
    try {
      await onCompleteJob(job.id, actionReason || 'Deliverables verified successfully')
      setActionReason('')
      refreshJob()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRejectSubmit = async () => {
    try {
      await onRejectJob(job.id, actionReason || 'Deliverables rejected or canceled')
      setActionReason('')
      refreshJob()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDisputeSubmit = async () => {
    try {
      await onDisputeJob(job.id)
      refreshJob()
    } catch (err) {
      console.error(err)
    }
  }

  const handleResolveDisputeSubmit = async (approve: boolean) => {
    try {
      await onResolveDispute(job.id, approve)
      refreshJob()
    } catch (err) {
      console.error(err)
    }
  }

  const handleFundSubmit = async () => {
    try {
      await onFundJob(job.id, job.budget)
      refreshJob()
    } catch (err) {
      console.error(err)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(38)}`
  }

  // Parse if it requires high value approval
  const isHighValue = Number(job.budget) > 25000

  return (
    <div className={`brutalist-card ${statusInfo.class}`}>
      {/* Header and status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)' }}>
            ERC-8183 Job ID #{job.id}
          </span>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 800 }}>On-Chain Job Ledger</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid var(--border)', background: 'var(--bg-inner)', fontWeight: 650, fontSize: '13px', borderRadius: 'var(--radius-sm)' }}>
          {statusInfo.icon}
          <span>{statusInfo.label}</span>
          {job.disputed && (
            <span style={{ backgroundColor: 'var(--accent-coral)', color: 'white', padding: '2px 6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginLeft: '5px', borderRadius: 'var(--radius-sm)' }}>
              Disputed
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ backgroundColor: 'var(--bg-inner)', border: '1px solid var(--border)', padding: '12px', marginBottom: '15px', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--text-light)', marginBottom: '6px' }}>
          <FileText size={14} />
          <span>Specifications & Terms</span>
        </div>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word', fontWeight: 550, color: 'var(--text-main)' }}>
          {job.description}
        </p>
      </div>

      {/* Roles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ border: '1px solid var(--border)', padding: '10px', backgroundColor: 'var(--bg-inner)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '4px' }}>Client (Funding)</div>
          <div style={{ fontSize: '13px', fontWeight: 750, wordBreak: 'break-all', color: 'var(--text-main)' }} title={job.client}>
            {formatAddress(job.client)} {isClient && <span style={{ color: 'var(--accent-coral)' }}>(You)</span>}
          </div>
        </div>
        <div style={{ border: '1px solid var(--border)', padding: '10px', backgroundColor: 'var(--bg-inner)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '4px' }}>Provider (Worker)</div>
          <div style={{ fontSize: '13px', fontWeight: 750, wordBreak: 'break-all', color: 'var(--text-main)' }} title={job.provider}>
            {formatAddress(job.provider)} {isProvider && <span style={{ color: 'var(--accent-coral)' }}>(You)</span>}
          </div>
        </div>
        <div style={{ border: '1px solid var(--border)', padding: '10px', backgroundColor: 'var(--bg-inner)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '4px' }}>Evaluator (Auditor)</div>
          <div style={{ fontSize: '13px', fontWeight: 750, wordBreak: 'break-all', color: 'var(--text-main)' }} title={job.evaluator}>
            {formatAddress(job.evaluator)} {isEvaluator && <span style={{ color: 'var(--accent-coral)' }}>(You)</span>}
          </div>
        </div>
      </div>

      {/* Financial info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--text-main)', color: 'var(--bg-card)', padding: '12px 15px', marginBottom: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
        <span style={{ fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>Job Escrow Pool</span>
        <span style={{ fontSize: '20px', fontWeight: 900 }}>
          {Number(job.budget) > 0 ? `${Number(job.budget).toLocaleString()} USDC` : 'Budget Proposed Pending'}
        </span>
      </div>

      {/* Warning check for high value approval */}
      {isHighValue && job.status === 0 && (
        <div style={{ marginBottom: '15px', padding: '12px', borderLeft: '4px solid var(--accent-yellow)', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'flex-start', gap: '10px', borderRadius: 'var(--radius-sm)' }}>
          <ShieldAlert size={18} style={{ color: 'var(--accent-yellow)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-main)' }}>High-Value Budget (&gt; 25k USDC)</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              This budget exceeds the $25,000 threshold. Under smart contract governance rules, funding requires multi-agent consensus validation before the escrow can be authorized.
            </div>
          </div>
        </div>
      )}

      {/* Timeline deliverables hash */}
      {job.status >= 2 && (
        <div style={{ border: '1px dashed var(--border)', padding: '12px', marginBottom: '20px', backgroundColor: 'var(--bg-inner)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: '4px' }}>
            Deliverable Hash (IPFS / Verification Root)
          </div>
          <code style={{ fontSize: '12.5px', wordBreak: 'break-all', display: 'block', backgroundColor: 'var(--bg-card)', padding: '6px', border: '1px solid var(--border)', fontFamily: 'monospace', color: 'var(--text-main)' }}>
            {job.deliverable}
          </code>
        </div>
      )}

      {/* Action forms/buttons depending on roles & status */}
      <div style={{ marginTop: '15px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
        
        {/* DISPUTE ACTIONS (For Platform Admins/Owners) */}
        {job.disputed && (
          <div style={{ border: '1px solid #ef4444', padding: '12px', backgroundColor: '#fef2f2', marginBottom: '15px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#b91c1c', fontSize: '13px', marginBottom: '8px' }}>
              <Scale size={16} />
              <span>ON-CHAIN DISPUTE RESOLUTION PENDING</span>
            </div>
            {isOwner ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  As the administrative smart contract owner, you have the authority to bypass evaluates, override stuck funds, and execute immediate dispute resolutions.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleResolveDisputeSubmit(true)}
                    className="btn-brutalist btn-brutalist-green"
                    disabled={loading}
                    style={{ flex: 1, padding: '8px', justifyContent: 'center' }}
                  >
                    Resolve in Favor of Provider (Payout)
                  </button>
                  <button
                    onClick={() => handleResolveDisputeSubmit(false)}
                    className="btn-brutalist btn-brutalist-pink"
                    disabled={loading}
                    style={{ flex: 1, padding: '8px', justifyContent: 'center' }}
                  >
                    Resolve in Favor of Client (Refund)
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                This job is currently locked in dispute. The platform owner is investigating the deliverables and will route the escrow funds shortly.
              </p>
            )}
          </div>
        )}

        {/* STATUS 0: OPEN (Awaiting Pricing & Escrow Deposit) */}
        {!job.disputed && job.status === 0 && (
          <div>
            {/* 1. Provider proposes the pricing */}
            {Number(job.budget) === 0 && (
              <div>
                {isProvider ? (
                  <form onSubmit={handleSetBudgetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="brutalist-form-group">
                      <label className="brutalist-label">Propose Pricing (USDC)</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="number"
                          step="0.01"
                          className="brutalist-input"
                          placeholder="e.g. 1500"
                          value={budgetInput}
                          onChange={(e) => setBudgetInput(e.target.value)}
                          style={{ flex: 1 }}
                          required
                        />
                        <button type="submit" className="btn-brutalist btn-brutalist-pink" disabled={loading}>
                          Lock Budget Request
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text-muted)' }}>
                    Awaiting Provider to define budget pricing...
                  </div>
                )}
              </div>
            )}

            {/* 2. Client funds the escrow */}
            {Number(job.budget) > 0 && (
              <div>
                {isClient ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-main)' }}>Deposit Funds in Escrow</div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                      The provider has set the budget request to <strong>{job.budget} USDC</strong>. Click below to approve USDC allowance and deposit funds into escrow.
                    </p>
                    <button
                      onClick={handleFundSubmit}
                      className="btn-brutalist btn-brutalist-pink"
                      disabled={loading}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Fund Escrow & Activate Job
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text-muted)' }}>
                    Awaiting Client to fund the proposed budget ({job.budget} USDC)...
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STATUS 1: FUNDED (Escrow Locked) */}
        {!job.disputed && job.status === 1 && (
          <div>
            {isProvider ? (
              <form onSubmit={handleDeliverableSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="brutalist-form-group">
                  <label className="brutalist-label">Submit Deliverables & Proof of Work</label>
                  <textarea
                    className="brutalist-input"
                    placeholder="Paste URL to deliverables, GitHub repository, files, or summary of outputs..."
                    value={deliverableText}
                    onChange={(e) => setDeliverableText(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" className="btn-brutalist btn-brutalist-pink" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Work For Evaluation
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text-muted)' }}>
                  Funds are secured. Awaiting Provider to complete and submit the deliverables...
                </div>
                {/* Client can cancel if expired */}
                {isClient && isExpired && (
                  <button onClick={handleRejectSubmit} className="btn-brutalist btn-brutalist-pink" disabled={loading}>
                    Cancel & Refund Escrow (Deadline Passed)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* STATUS 2: SUBMITTED (Review Pending) */}
        {!job.disputed && job.status === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {isEvaluator ? (
              <div>
                <div className="brutalist-form-group">
                  <label className="brutalist-label">Auditor Evaluation Actions</label>
                  <input
                    type="text"
                    className="brutalist-input"
                    placeholder="Enter audit/rejection reason (optional)..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCompleteSubmit}
                    className="btn-brutalist btn-brutalist-green"
                    disabled={loading}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Accept Work & Release USDC
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    className="btn-brutalist btn-brutalist-pink"
                    disabled={loading}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Reject Work & Refund Client
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text-muted)' }}>
                Awaiting Evaluator agent ({formatAddress(job.evaluator)}) to audit the work and release/refund escrow.
              </div>
            )}

            {/* Dispute opening options for Client and Provider */}
            {(isClient || isProvider) && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Stuck or disagree on deliverables quality?
                </span>
                <button
                  onClick={handleDisputeSubmit}
                  className="btn-brutalist btn-brutalist-muted"
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '4px 10px' }}
                >
                  <Scale size={12} />
                  <span>Initiate On-Chain Dispute</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STATUS 3 or 4: SETTLED */}
        {job.status > 2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 650 }}>
            <span>This job ledger has been closed and finalized on-chain.</span>
          </div>
        )}

      </div>
    </div>
  )
}
