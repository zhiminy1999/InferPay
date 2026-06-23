'use client'

import { useState, useCallback } from 'react'
import { JOB_ESCROW_ADDRESS, jobEscrowAbi } from '@/lib/job-escrow'
import { USDC_ADDRESS_ARC } from '@/lib/contracts'
import { parseUnits, keccak256, toHex, stringToHex, type WalletClient, type PublicClient } from 'viem'

export interface Job {
  id: number
  client: string
  provider: string
  evaluator: string
  description: string
  budget: string // In USDC units (e.g. "10.5")
  expiredAt: number // timestamp
  status: number // 0: Open, 1: Funded, 2: Submitted, 3: Completed, 4: Rejected, 5: Expired
  hook: string
  deliverable: string
  disputed: boolean
}

interface UseJobEscrowProps {
  isConnected: boolean
  address?: `0x${string}`
  walletClient?: WalletClient | null
  publicClient?: PublicClient | null
  addActivity: (title: string, desc: string, emoji: string, type: 'info' | 'success' | 'warning' | 'danger' | 'default') => void
}

export function useJobEscrow({ isConnected, address, walletClient, publicClient, addActivity }: UseJobEscrowProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getJobDetails = useCallback(async (jobId: number): Promise<Job | null> => {
    if (!publicClient) return null
    try {
      const rawJob: any = await publicClient.readContract({
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'getJob',
        args: [BigInt(jobId)],
      })

      const isDisputed = await publicClient.readContract({
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'disputed',
        args: [BigInt(jobId)],
      })

      // Convert from raw BigInt/USDC (6 decimals)
      const budgetUSDC = (Number(rawJob.budget) / 1000000).toString()

      return {
        id: Number(rawJob.id),
        client: rawJob.client,
        provider: rawJob.provider,
        evaluator: rawJob.evaluator,
        description: rawJob.description,
        budget: budgetUSDC,
        expiredAt: Number(rawJob.expiredAt),
        status: Number(rawJob.status),
        hook: rawJob.hook,
        deliverable: rawJob.deliverable,
        disputed: Boolean(isDisputed),
      }
    } catch (err: any) {
      console.error(`Error loading job ${jobId}:`, err)
      return null
    }
  }, [publicClient])

  const getAllJobs = useCallback(async (): Promise<Job[]> => {
    let list: Job[] = []
    if (publicClient) {
      try {
        const jobCount = await publicClient.readContract({
          address: JOB_ESCROW_ADDRESS,
          abi: jobEscrowAbi,
          functionName: 'jobCount',
        })

        const count = Number(jobCount)
        for (let i = 0; i < count; i++) {
          const item = await getJobDetails(i)
          if (item) {
            list.push(item)
          }
        }
      } catch (err: any) {
        console.error('Error fetching all jobs from chain:', err)
      }
    }

    // Blend/Append database seed/sample jobs
    try {
      const res = await fetch('/api/jobs')
      if (res.ok) {
        const json = await res.json()
        const dbJobs = json.data || []
        
        dbJobs.forEach((dj: any) => {
          // Avoid duplicate IDs if the DB has on-chain jobs indexed
          const numericId = parseInt(dj.id.replace(/[^\d]/g, '')) || Math.floor(Math.random() * 10000)
          if (!list.some(j => j.id === numericId)) {
            let statusVal = 0
            if (dj.status === 'COMPLETED' || dj.status === 'SUCCESS') statusVal = 3
            else if (dj.status === 'IN_PROGRESS') statusVal = 1
            else if (dj.status === 'REJECTED') statusVal = 4
            else if (dj.status === 'PENDING') statusVal = 0

            list.push({
              id: numericId,
              client: dj.wallet_address || '0x7a304A671e21b79528659dC0D775e53FE233b2B0',
              provider: dj.metadata?.agentId || 'agent-deepseek-coder',
              evaluator: '0x0c200b495d3EF602151caa364e071Bd71829978B',
              description: dj.metadata?.title || 'Autonomous Agent Task Execution',
              budget: dj.amount.toString(),
              expiredAt: dj.timestamp + 86400 * 5,
              status: statusVal,
              hook: '0x0000000000000000000000000000000000000000',
              deliverable: dj.metadata?.resultSummary || 'Running task execution models...',
              disputed: false,
              isSample: true
            } as any)
          }
        })
      }
    } catch (e) {
      console.warn('Failed to fetch fallback jobs from DB API:', e)
    }

    // Sort list: on-chain first, then by ID desc
    list.sort((a, b) => {
      const aIsSample = (a as any).isSample ? 1 : 0
      const bIsSample = (b as any).isSample ? 1 : 0
      if (aIsSample !== bIsSample) {
        return aIsSample - bIsSample // On-chain first
      }
      return b.id - a.id
    })

    return list
  }, [publicClient, getJobDetails])

  const createJob = useCallback(async (
    provider: string,
    evaluator: string,
    expiredAt: number,
    description: string
  ) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      addActivity('Creating Job', 'Initiating ERC-8183 job post on-chain...', 'clipboard', 'info')

      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'createJob',
        args: [
          provider as `0x${string}`,
          evaluator as `0x${string}`,
          BigInt(expiredAt),
          description,
          '0x0000000000000000000000000000000000000000' as `0x${string}`,
        ],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Transaction Broadcasted', 'Waiting for job creation to confirm...', 'refresh', 'info')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Job creation reverted on-chain")
      }

      addActivity('Job Posted Successfully', 'Your job has been indexed on-chain.', 'party', 'success')
      return hash
    } catch (err: any) {
      console.error('Create job error:', err)
      const msg = err.shortMessage || err.message || 'Error posting job'
      setError(msg)
      addActivity('Job Posting Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, publicClient, addActivity])

  const setBudget = useCallback(async (jobId: number, budgetAmount: string) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      addActivity('Setting Budget', 'Submitting proposed pricing for job budget...', 'cash', 'info')

      const amountRaw = parseUnits(budgetAmount, 6)
      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'setBudget',
        args: [BigInt(jobId), amountRaw, '0x' as `0x${string}`],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Pricing Sent', 'Waiting for pricing to confirm...', 'refresh', 'info')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Setting budget reverted on-chain")
      }

      addActivity('Budget Defined', `Job budget locked at ${budgetAmount} USDC.`, 'party', 'success')
      return hash
    } catch (err: any) {
      console.error('Set budget error:', err)
      const msg = err.shortMessage || err.message || 'Error setting budget'
      setError(msg)
      addActivity('Budget Pricing Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, publicClient, addActivity])

  const fundJob = useCallback(async (jobId: number, budgetAmount: string) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      addActivity('Funding Job', 'Approving USDC spending allowance...', 'cash', 'info')

      const amountRaw = parseUnits(budgetAmount, 6)
      
      // 1. Approve USDC transfer
      const { request: approveReq } = await publicClient.simulateContract({
        account: address,
        address: USDC_ADDRESS_ARC,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ] as const,
        functionName: 'approve',
        args: [JOB_ESCROW_ADDRESS, amountRaw],
      })

      const approveHash = await walletClient.writeContract(approveReq)
      const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash })
      if (approveReceipt.status === 'reverted') {
        throw new Error("Approval transaction reverted on-chain")
      }
      addActivity('Allowance Approved', 'Sending USDC into escrow...', 'refresh', 'info')

      // 2. Fund escrow
      const { request: fundReq } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'fund',
        args: [BigInt(jobId), '0x' as `0x${string}`],
      })

      const fundHash = await walletClient.writeContract(fundReq)
      const fundReceipt = await publicClient.waitForTransactionReceipt({ hash: fundHash })
      if (fundReceipt.status === 'reverted') {
        throw new Error("Escrow funding transaction reverted on-chain")
      }

      addActivity('Job Escrow Funded', `${budgetAmount} USDC deposited in contract escrow.`, 'party', 'success')
      return fundHash
    } catch (err: any) {
      console.error('Fund job error:', err)
      const msg = err.shortMessage || err.message || 'Error funding job'
      setError(msg)
      addActivity('Funding Escrow Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, publicClient, addActivity])

  const submitDeliverable = useCallback(async (jobId: number, deliverableText: string) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      addActivity('Submitting Deliverable', 'Hashing deliverable and writing to chain...', 'suitcase', 'info')

      const deliverableHash = keccak256(toHex(deliverableText))
      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'submit',
        args: [BigInt(jobId), deliverableHash, '0x' as `0x${string}`],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Submission Sent', 'Waiting for on-chain delivery confirmation...', 'refresh', 'info')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Deliverable submission reverted on-chain")
      }

      addActivity('Deliverable Submitted', 'Work proof locked in contract. Undergoing review.', 'party', 'success')
      return hash
    } catch (err: any) {
      console.error('Submit deliverable error:', err)
      const msg = err.shortMessage || err.message || 'Error submitting deliverable'
      setError(msg)
      addActivity('Submission Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, publicClient, addActivity])

  const completeJob = useCallback(async (jobId: number, reason: string) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      addActivity('Settling Job', 'Approving deliverables and releasing escrow...', 'money', 'info')

      const reasonHash = keccak256(toHex(reason))
      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'complete',
        args: [BigInt(jobId), reasonHash, '0x' as `0x${string}`],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Payment Released', 'Confirming USDC settlement...', 'refresh', 'info')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Job completion reverted on-chain")
      }

      addActivity('Job Settlement Complete', 'USDC released from escrow to the worker agent.', 'party', 'success')
      return hash
    } catch (err: any) {
      console.error('Complete job error:', err)
      const msg = err.shortMessage || err.message || 'Error completing job'
      setError(msg)
      addActivity('Settlement Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, publicClient, addActivity])

  const rejectJob = useCallback(async (jobId: number, reason: string) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      addActivity('Rejecting Job', 'Initiating rejection / cancellation request...', 'shield', 'info')

      const reasonHash = keccak256(toHex(reason))
      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'reject',
        args: [BigInt(jobId), reasonHash, '0x' as `0x${string}`],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Rejection Sent', 'Refunding USDC to client...', 'refresh', 'info')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Job rejection reverted on-chain")
      }

      addActivity('Job Cancelled', 'Job rejected. Funds refunded to client escrow.', 'shield', 'warning')
      return hash
    } catch (err: any) {
      console.error('Reject job error:', err)
      const msg = err.shortMessage || err.message || 'Error rejecting job'
      setError(msg)
      addActivity('Rejection/Cancellation Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, publicClient, addActivity])

  const disputeJob = useCallback(async (jobId: number) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      addActivity('Opening Dispute', 'Filing official work dispute on-chain...', 'warning', 'info')

      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'dispute',
        args: [BigInt(jobId)],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Dispute Registered', 'Waiting for dispute registration...', 'refresh', 'info')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Opening dispute reverted on-chain")
      }

      addActivity('Job Disputed', 'On-chain dispute opened. Awaiting admin resolution.', 'warning', 'warning')
      return hash
    } catch (err: any) {
      console.error('Dispute job error:', err)
      const msg = err.shortMessage || err.message || 'Error opening dispute'
      setError(msg)
      addActivity('Dispute Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, publicClient, addActivity])

  const resolveDispute = useCallback(async (jobId: number, approvePayment: boolean) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      addActivity('Resolving Dispute', `Resolving dispute: ${approvePayment ? 'Approve Payment' : 'Refund Client'}...`, 'balance', 'info')

      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'resolveDispute',
        args: [BigInt(jobId), approvePayment],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Resolution broadcasting', 'Finalizing dispute decision...', 'refresh', 'info')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Dispute resolution reverted on-chain")
      }

      addActivity('Dispute Settled', `Dispute resolved. Funds routed accordingly.`, 'balance', 'success')
      return hash
    } catch (err: any) {
      console.error('Resolve dispute error:', err)
      const msg = err.shortMessage || err.message || 'Error resolving dispute'
      setError(msg)
      addActivity('Resolution Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, walletClient, publicClient, addActivity])

  return {
    loading,
    error,
    getJobDetails,
    getAllJobs,
    createJob,
    setBudget,
    fundJob,
    submitDeliverable,
    completeJob,
    rejectJob,
    disputeJob,
    resolveDispute,
  }
}
