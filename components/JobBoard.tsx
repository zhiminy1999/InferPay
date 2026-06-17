'use client'

import React, { useState, useEffect } from 'react'
import { Briefcase, Search, RefreshCw, PlusCircle, Landmark, Award } from 'lucide-react'
import { useJobEscrow, Job } from '@/hooks/useJobEscrow'
import { CreateJob } from './CreateJob'
import { JobDetail } from './JobDetail'
import { Skeleton } from './LoadingSystem'

interface JobBoardProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function JobBoard({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: JobBoardProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'open' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Contract owner is the account that deployed it
  const contractOwnerAddress = '0xDB7C9130761eC83b400938EF3d304c453579Ef447D' // Same deployer address from PRIVATE_KEY

  const {
    loading,
    error,
    getAllJobs,
    createJob,
    setBudget,
    fundJob,
    submitDeliverable,
    completeJob,
    rejectJob,
    disputeJob,
    resolveDispute,
  } = useJobEscrow({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  const syncJobs = async () => {
    setIsSyncing(true)
    try {
      const data = await getAllJobs()
      setJobs(data)
      // Update selectedJob state if it is currently open
      if (selectedJob !== null) {
        const updated = data.find(j => j.id === selectedJob.id)
        if (updated) setSelectedJob(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    if (isConnected && address && publicClient) {
      syncJobs()
    }
  }, [isConnected, address, publicClient])

  // Filters
  const filteredJobs = jobs.filter((job) => {
    // Search
    const matchesSearch = job.description.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    // Tabs
    const isUserClient = address?.toLowerCase() === job.client.toLowerCase()
    const isUserProvider = address?.toLowerCase() === job.provider.toLowerCase()
    const isUserEvaluator = address?.toLowerCase() === job.evaluator.toLowerCase()
    const isPartToJob = isUserClient || isUserProvider || isUserEvaluator

    switch (activeTab) {
      case 'my':
        return isPartToJob
      case 'open':
        return job.status === 0
      case 'active':
        return job.status === 1 || job.status === 2
      case 'completed':
        return job.status === 3 || job.status === 4
      case 'all':
      default:
        return true
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Briefcase size={26} className="text-coral" />
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>Autonomous Job Board</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              ERC-8183 Standardized agent-to-agent contract settlement & evaluation escrows.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-brutalist btn-brutalist-pink"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={16} />
            <span>{showCreateForm ? 'View Job Ledger' : 'Post New Job'}</span>
          </button>

          <button
            onClick={syncJobs}
            className="btn-brutalist btn-brutalist-muted"
            disabled={isSyncing}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {showCreateForm ? (
        <CreateJob
          isConnected={isConnected}
          address={address}
          walletClient={walletClient}
          publicClient={publicClient}
          createJob={createJob}
          loading={loading}
          onSuccess={() => {
            setShowCreateForm(false)
            syncJobs()
          }}
          addActivity={addActivity}
        />
      ) : (
        <div className={`job-board-split ${selectedJob ? '' : 'single'}`}>
          
          {/* List panel */}
          <div className="brutalist-card accent-cyan">
            {/* Search and tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    className="brutalist-input"
                    placeholder="Filter jobs by description keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', paddingLeft: '36px' }}
                  />
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                {(['all', 'my', 'open', 'active', 'completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`btn-brutalist ${activeTab === tab ? 'btn-brutalist-pink' : 'btn-brutalist-muted'}`}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* List items */}
            {isSyncing && jobs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`job-skel-${i}`}
                    style={{
                      padding: '15px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', width: '60%' }}>
                        <Skeleton width="50px" height={16} />
                        <Skeleton width="40px" height={16} />
                      </div>
                      <Skeleton width="60px" height={16} />
                    </div>
                    <Skeleton variant="text" width="95%" />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton width="80px" height={12} />
                      <Skeleton width="100px" height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No matching on-chain jobs found. Click "Post New Job" to list one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredJobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id
                  const isUserClient = address?.toLowerCase() === job.client.toLowerCase()
                  const isUserProvider = address?.toLowerCase() === job.provider.toLowerCase()
                  const isUserEvaluator = address?.toLowerCase() === job.evaluator.toLowerCase()

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      style={{
                        padding: '15px',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--accent-coral)' : 'var(--border)',
                        backgroundColor: isSelected ? 'var(--bg-inner)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: isSelected ? 'var(--shadow-hover)' : 'var(--shadow-soft)',
                        transition: 'all 0.2s ease',
                      }}
                      className="job-item-hover"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', border: '1px solid var(--text)', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                            Job #{job.id}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: job.status === 3 ? 'var(--accent-green)' : job.status === 4 ? 'var(--accent-red)' : 'var(--text)'
                          }}>
                            {job.status === 0 ? 'OPEN' : job.status === 1 ? 'FUNDED' : job.status === 2 ? 'SUBMITTED' : job.status === 3 ? 'COMPLETED' : 'REJECTED'}
                          </span>
                          {job.disputed && (
                            <span style={{ fontSize: '9px', fontWeight: 850, backgroundColor: 'var(--accent-red)', color: 'white', padding: '1px 4px', border: '1px solid var(--text)' }}>
                              DISPUTED
                            </span>
                          )}
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '14px' }}>
                          {Number(job.budget) > 0 ? `${job.budget} USDC` : 'TBD'}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 550, color: 'var(--text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {isUserClient && <span style={{ color: 'var(--accent-coral)', fontWeight: 700 }}>Client</span>}
                          {isUserProvider && <span style={{ color: 'var(--accent-coral)', fontWeight: 700 }}>Provider</span>}
                          {isUserEvaluator && <span style={{ color: 'var(--accent-coral)', fontWeight: 700 }}>Evaluator</span>}
                        </div>
                        <span>Expires: {new Date(job.expiredAt * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Details panel */}
          {selectedJob && (
            <div style={{ position: 'sticky', top: '20px' }}>
              <JobDetail
                job={selectedJob}
                currentUserAddress={address}
                loading={loading}
                onSetBudget={setBudget}
                onFundJob={fundJob}
                onSubmitDeliverable={submitDeliverable}
                onCompleteJob={completeJob}
                onRejectJob={rejectJob}
                onDisputeJob={disputeJob}
                onResolveDispute={resolveDispute}
                contractOwnerAddress={contractOwnerAddress}
                refreshJob={syncJobs}
              />
            </div>
          )}

        </div>
      )}
    </div>
  )
}
export default JobBoard
