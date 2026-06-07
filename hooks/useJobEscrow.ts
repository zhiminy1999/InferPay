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
    if (!publicClient) return []
    try {
      const jobCount = await publicClient.readContract({
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'jobCount',
      })

      const count = Number(jobCount)
      const list: Job[] = []
      for (let i = 0; i < count; i++) {
        const item = await getJobDetails(i)
        if (item) {
          list.push(item)
        }
      }
      return list
    } catch (err: any) {
      console.error('Error fetching all jobs:', err)
      return []
    }
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
      addActivity('Creating Job', 'Initiating ERC-8183 job post on-chain...', '📝', 'info')

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
      addActivity('Transaction Broadcasted', 'Waiting for job creation to confirm...', '⏳', 'info')
      await publicClient.waitForTransactionReceipt({ hash })

      addActivity('Job Posted Successfully', 'Your job has been indexed on-chain.', '✅', 'success')
      return hash
    } catch (err: any) {
      console.error('Create job error:', err)
      const msg = err.shortMessage || err.message || 'Error posting job'
      setError(msg)
      addActivity('Job Posting Failed', msg, '❌', 'danger')
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
      addActivity('Setting Budget', 'Submitting proposed pricing for job budget...', '💰', 'info')

      const amountRaw = parseUnits(budgetAmount, 6)
      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'setBudget',
        args: [BigInt(jobId), amountRaw, '0x' as `0x${string}`],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Pricing Sent', 'Waiting for pricing to confirm...', '⏳', 'info')
      await publicClient.waitForTransactionReceipt({ hash })

      addActivity('Budget Defined', `Job budget locked at ${budgetAmount} USDC.`, '✅', 'success')
      return hash
    } catch (err: any) {
      console.error('Set budget error:', err)
      const msg = err.shortMessage || err.message || 'Error setting budget'
      setError(msg)
      addActivity('Budget Pricing Failed', msg, '❌', 'danger')
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
      addActivity('Funding Job', 'Approving USDC spending allowance...', '🪙', 'info')

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
      await publicClient.waitForTransactionReceipt({ hash: approveHash })
      addActivity('Allowance Approved', 'Sending USDC into escrow...', '⏳', 'info')

      // 2. Fund escrow
      const { request: fundReq } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'fund',
        args: [BigInt(jobId), '0x' as `0x${string}`],
      })

      const fundHash = await walletClient.writeContract(fundReq)
      await publicClient.waitForTransactionReceipt({ hash: fundHash })

      addActivity('Job Escrow Funded', `${budgetAmount} USDC deposited in contract escrow.`, '🎉', 'success')
      return fundHash
    } catch (err: any) {
      console.error('Fund job error:', err)
      const msg = err.shortMessage || err.message || 'Error funding job'
      setError(msg)
      addActivity('Funding Escrow Failed', msg, '❌', 'danger')
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
      addActivity('Submitting Deliverable', 'Hashing deliverable and writing to chain...', '📦', 'info')

      const deliverableHash = keccak256(toHex(deliverableText))
      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'submit',
        args: [BigInt(jobId), deliverableHash, '0x' as `0x${string}`],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Submission Sent', 'Waiting for on-chain delivery confirmation...', '⏳', 'info')
      await publicClient.waitForTransactionReceipt({ hash })

      addActivity('Deliverable Submitted', 'Work proof locked in contract. Undergoing review.', '✅', 'success')
      return hash
    } catch (err: any) {
      console.error('Submit deliverable error:', err)
      const msg = err.shortMessage || err.message || 'Error submitting deliverable'
      setError(msg)
      addActivity('Submission Failed', msg, '❌', 'danger')
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
      addActivity('Settling Job', 'Approving deliverables and releasing escrow...', '💸', 'info')

      const reasonHash = keccak256(toHex(reason))
      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'complete',
        args: [BigInt(jobId), reasonHash, '0x' as `0x${string}`],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Payment Released', 'Confirming USDC settlement...', '⏳', 'info')
      await publicClient.waitForTransactionReceipt({ hash })

      addActivity('Job Settlement Complete', 'USDC released from escrow to the worker agent.', '🎉', 'success')
      return hash
    } catch (err: any) {
      console.error('Complete job error:', err)
      const msg = err.shortMessage || err.message || 'Error completing job'
      setError(msg)
      addActivity('Settlement Failed', msg, '❌', 'danger')
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
      addActivity('Rejecting Job', 'Initiating rejection / cancellation request...', '🛡️', 'info')

      const reasonHash = keccak256(toHex(reason))
      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'reject',
        args: [BigInt(jobId), reasonHash, '0x' as `0x${string}`],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Rejection Sent', 'Refunding USDC to client...', '⏳', 'info')
      await publicClient.waitForTransactionReceipt({ hash })

      addActivity('Job Cancelled', 'Job rejected. Funds refunded to client escrow.', '🛡️', 'warning')
      return hash
    } catch (err: any) {
      console.error('Reject job error:', err)
      const msg = err.shortMessage || err.message || 'Error rejecting job'
      setError(msg)
      addActivity('Rejection/Cancellation Failed', msg, '❌', 'danger')
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
      addActivity('Opening Dispute', 'Filing official work dispute on-chain...', '⚠️', 'info')

      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'dispute',
        args: [BigInt(jobId)],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Dispute Registered', 'Waiting for dispute registration...', '⏳', 'info')
      await publicClient.waitForTransactionReceipt({ hash })

      addActivity('Job Disputed', 'On-chain dispute opened. Awaiting admin resolution.', '⚠️', 'warning')
      return hash
    } catch (err: any) {
      console.error('Dispute job error:', err)
      const msg = err.shortMessage || err.message || 'Error opening dispute'
      setError(msg)
      addActivity('Dispute Failed', msg, '❌', 'danger')
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
      addActivity('Resolving Dispute', `Resolving dispute: ${approvePayment ? 'Approve Payment' : 'Refund Client'}...`, '⚖️', 'info')

      const { request } = await publicClient.simulateContract({
        account: address,
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'resolveDispute',
        args: [BigInt(jobId), approvePayment],
      })

      const hash = await walletClient.writeContract(request)
      addActivity('Resolution broadcasting', 'Finalizing dispute decision...', '⏳', 'info')
      await publicClient.waitForTransactionReceipt({ hash })

      addActivity('Dispute Settled', `Dispute resolved. Funds routed accordingly.`, '⚖️', 'success')
      return hash
    } catch (err: any) {
      console.error('Resolve dispute error:', err)
      const msg = err.shortMessage || err.message || 'Error resolving dispute'
      setError(msg)
      addActivity('Resolution Failed', msg, '❌', 'danger')
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
