'use client'

import { useState, useCallback } from 'react'
import { JOB_ESCROW_ADDRESS, jobEscrowAbi } from '@/lib/job-escrow'
import { USDC_ADDRESS_ARC } from '@/lib/contracts'
import { parseUnits, keccak256, toHex, stringToHex, createWalletClient, http, defineChain, type WalletClient, type PublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const customRpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [customRpcUrl] },
  },
})

const AGENT_1_KEY = (process.env.NEXT_PUBLIC_AGENT_1_PRIVATE_KEY || '') as `0x${string}`
const AGENT_2_KEY = (process.env.NEXT_PUBLIC_AGENT_2_PRIVATE_KEY || '') as `0x${string}`
const DEPLOYER_KEY = (process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY || '') as `0x${string}`

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
  isSample?: boolean
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

  const getAgentWalletClient = useCallback(async (agentAddress: string) => {
    if (!publicClient) throw new Error("Public client not ready")
    let key: `0x${string}` = '0x'
    const addr = agentAddress.toLowerCase()
    
    if (addr === '0x0c200b495d3ef602151caa364e071bd71829978b') {
      key = AGENT_1_KEY
    } else if (addr === '0xb2a136968f2a8085371577cbbe173f79b93caf1a') {
      key = AGENT_2_KEY
    } else if (addr === '0x08ec3eefc622b8a8742fc8ab48e832c236bc360b') {
      key = DEPLOYER_KEY
    } else {
      throw new Error(`No private key configured for agent: ${agentAddress}`)
    }

    if (!key || key === '0x') {
      throw new Error(`Agent private key for ${agentAddress} is not configured in .env`)
    }

    const acc = privateKeyToAccount(key)
    
    // Check & fund gas if balance < 0.02 USDC
    try {
      const bal = await publicClient.getBalance({ address: acc.address })
      if (bal < parseUnits('0.02', 18)) {
        addActivity('Funding Agent Gas', `Funding agent gas on-chain for ${acc.address.slice(0, 8)}...`, 'lightning', 'info')
        if (isConnected && walletClient && address) {
          const fundTx = await walletClient.sendTransaction({
            account: address,
            to: acc.address,
            value: parseUnits('0.05', 18),
            chain: null
          })
          await publicClient.waitForTransactionReceipt({ hash: fundTx })
        } else {
          // Fallback to calling the sponsorship API
          await fetch('/api/sponsor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetAddress: acc.address })
          })
        }
      }
    } catch (gasErr) {
      console.warn("Agent gas pre-funding check failed:", gasErr)
    }

    return createWalletClient({
      account: acc,
      chain: arcTestnet,
      transport: http()
    })
  }, [publicClient, isConnected, walletClient, address, addActivity])

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
      console.log('[JobEscrow Hook]: Querying database jobs from `/api/jobs`...')
      const res = await fetch('/api/jobs')
      if (res.ok) {
        const json = await res.json()
        const dbJobs = json.data || []
        console.log('[JobEscrow Hook]: API returned', dbJobs.length, 'jobs:', dbJobs)
        
        dbJobs.forEach((dj: any) => {
          // Avoid duplicate IDs if the DB has on-chain jobs indexed
          const idStr = String(dj.id || '')
          const numericId = parseInt(idStr.replace(/[^\d]/g, '')) || Math.floor(Math.random() * 10000)
          if (!list.some(j => j.id === numericId)) {
            let statusVal = 0
            if (dj.status === 'COMPLETED' || dj.status === 'SUCCESS') statusVal = 3
            else if (dj.status === 'IN_PROGRESS') statusVal = 1
            else if (dj.status === 'REJECTED') statusVal = 4
            else if (dj.status === 'PENDING') statusVal = 0

            list.push({
              id: numericId,
              client: (dj.wallet_address === '0xDEVEL_WALLET_PLACEHOLDER' && address)
                ? address
                : (dj.wallet_address || '0x7a304A671e21b79528659dC0D775e53FE233b2B0'),
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
      } else {
        console.warn('[JobEscrow Hook]: `/api/jobs` request failed with status:', res.status)
      }
    } catch (e: any) {
      console.warn('[JobEscrow Hook]: Failed to fetch fallback jobs from DB API:', e)
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
          provider.toLowerCase() as `0x${string}`,
          evaluator.toLowerCase() as `0x${string}`,
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

  const setBudget = useCallback(async (jobId: number, budgetAmount: string, isSample: boolean = false) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      if (isSample) {
        addActivity('Setting Budget', 'Submitting proposed pricing for job budget (simulated)...', 'cash', 'info')
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const dbId = `job-${jobId}`
        await fetch('/api/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dbId, amount: Number(budgetAmount) })
        })

        addActivity('Budget Defined', `Job budget locked at ${budgetAmount} USDC (simulated).`, 'party', 'success')
        return '0xsimulated_set_budget_' + Date.now()
      }

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

  const fundJob = useCallback(async (jobId: number, budgetAmount: string, isSample: boolean = false) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      if (isSample) {
        addActivity('Funding Job', 'Approving USDC spending allowance (simulated)...', 'cash', 'info')
        await new Promise(resolve => setTimeout(resolve, 800))
        addActivity('Allowance Approved', 'Sending USDC into escrow (simulated)...', 'refresh', 'info')
        await new Promise(resolve => setTimeout(resolve, 1000))

        const dbId = `job-${jobId}`
        await fetch('/api/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dbId, status: 'IN_PROGRESS' })
        })

        addActivity('Job Escrow Funded', `${budgetAmount} USDC deposited in contract escrow (simulated).`, 'party', 'success')
        return '0xsimulated_fund_hash_' + Date.now()
      }

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

  const submitDeliverable = useCallback(async (jobId: number, deliverableText: string, isSample: boolean = false) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      if (isSample) {
        addActivity('Submitting Deliverable', 'Hashing deliverable and writing to chain (simulated)...', 'suitcase', 'info')
        await new Promise(resolve => setTimeout(resolve, 800))

        const dbId = `job-${jobId}`
        await fetch('/api/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: dbId, 
            metadata: {
              resultSummary: deliverableText
            }
          })
        })

        addActivity('Deliverable Submitted', 'Work proof locked in contract. Undergoing review (simulated).', 'party', 'success')
        return '0xsimulated_submit_hash_' + Date.now()
      }

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

  const completeJob = useCallback(async (jobId: number, reason: string, isSample: boolean = false) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      if (isSample) {
        addActivity('Settling Job', 'Approving deliverables and releasing escrow (simulated)...', 'money', 'info')
        await new Promise(resolve => setTimeout(resolve, 800))

        const dbId = `job-${jobId}`
        await fetch('/api/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dbId, status: 'COMPLETED' })
        })

        addActivity('Job Settlement Complete', 'USDC released from escrow to the worker agent (simulated).', 'party', 'success')
        return '0xsimulated_complete_hash_' + Date.now()
      }

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

  const rejectJob = useCallback(async (jobId: number, reason: string, isSample: boolean = false) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      if (isSample) {
        addActivity('Rejecting Job', 'Initiating rejection / cancellation request (simulated)...', 'shield', 'info')
        await new Promise(resolve => setTimeout(resolve, 800))

        const dbId = `job-${jobId}`
        await fetch('/api/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dbId, status: 'REJECTED' })
        })

        addActivity('Job Cancelled', 'Job rejected. Funds refunded to client escrow (simulated).', 'shield', 'warning')
        return '0xsimulated_reject_hash_' + Date.now()
      }

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

  const disputeJob = useCallback(async (jobId: number, isSample: boolean = false) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      if (isSample) {
        addActivity('Opening Dispute', 'Filing official work dispute on-chain (simulated)...', 'warning', 'info')
        await new Promise(resolve => setTimeout(resolve, 800))

        const dbId = `job-${jobId}`
        await fetch('/api/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dbId, status: 'PENDING' }) // Or we can keep it as is, but mark disputed
        })

        addActivity('Job Disputed', 'On-chain dispute opened. Awaiting admin resolution (simulated).', 'warning', 'warning')
        return '0xsimulated_dispute_hash_' + Date.now()
      }

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

  const resolveDispute = useCallback(async (jobId: number, approvePayment: boolean, isSample: boolean = false) => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      throw new Error('Wallet not connected')
    }
    setLoading(true)
    setError(null)
    try {
      if (isSample) {
        addActivity('Resolving Dispute', `Resolving dispute: ${approvePayment ? 'Approve Payment' : 'Refund Client'} (simulated)...`, 'balance', 'info')
        await new Promise(resolve => setTimeout(resolve, 800))

        const dbId = `job-${jobId}`
        await fetch('/api/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: dbId, status: approvePayment ? 'COMPLETED' : 'REJECTED' })
        })

        addActivity('Dispute Settled', `Dispute resolved. Funds routed accordingly (simulated).`, 'balance', 'success')
        return '0xsimulated_resolve_dispute_' + Date.now()
      }

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

  const triggerAgentSetBudget = useCallback(async (jobId: number, budgetAmount: string) => {
    setLoading(true)
    setError(null)
    try {
      const job = await getJobDetails(jobId)
      if (!job) throw new Error(`Job #${jobId} not found`)

      addActivity('Agent Action', `Instructing agent ${job.provider.slice(0, 8)} to define budget...`, 'robot', 'info')
      
      const agentClient = await getAgentWalletClient(job.provider)
      const amountRaw = parseUnits(budgetAmount, 6)

      const hash = await agentClient.writeContract({
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'setBudget',
        args: [BigInt(jobId), amountRaw, '0x' as `0x${string}`],
      })

      addActivity('Pricing Sent', 'Waiting for agent pricing to confirm on-chain...', 'refresh', 'info')
      const receipt = await publicClient!.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Agent setBudget reverted on-chain")
      }

      addActivity('Budget Defined', `Agent locked budget proposal at ${budgetAmount} USDC.`, 'party', 'success')
      return hash
    } catch (err: any) {
      console.error('Agent setBudget error:', err)
      const msg = err.shortMessage || err.message || 'Agent failed to set budget'
      setError(msg)
      addActivity('Agent Action Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [getJobDetails, getAgentWalletClient, publicClient, addActivity])

  const triggerAgentSubmit = useCallback(async (jobId: number, deliverableText: string) => {
    setLoading(true)
    setError(null)
    try {
      const job = await getJobDetails(jobId)
      if (!job) throw new Error(`Job #${jobId} not found`)

      addActivity('Agent Action', `Instructing provider agent to submit deliverable proof...`, 'robot', 'info')
      
      const agentClient = await getAgentWalletClient(job.provider)
      const deliverableHash = keccak256(toHex(deliverableText))

      const hash = await agentClient.writeContract({
        address: JOB_ESCROW_ADDRESS,
        abi: jobEscrowAbi,
        functionName: 'submit',
        args: [BigInt(jobId), deliverableHash, '0x' as `0x${string}`],
      })

      addActivity('Deliverables Submitted', 'Waiting for on-chain submission confirmation...', 'refresh', 'info')
      const receipt = await publicClient!.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Agent submit deliverable reverted on-chain")
      }

      addActivity('Deliverables Locked', 'Work proof locked in contract. Undergoing review.', 'party', 'success')
      return hash
    } catch (err: any) {
      console.error('Agent submit deliverable error:', err)
      const msg = err.shortMessage || err.message || 'Agent failed to submit work'
      setError(msg)
      addActivity('Agent Submission Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [getJobDetails, getAgentWalletClient, publicClient, addActivity])

  const triggerAgentEvaluate = useCallback(async (jobId: number, approvePayment: boolean, reason: string = '') => {
    setLoading(true)
    setError(null)
    try {
      const job = await getJobDetails(jobId)
      if (!job) throw new Error(`Job #${jobId} not found`)

      addActivity('Agent Action', `Instructing evaluator agent to audit and settle job...`, 'robot', 'info')
      
      const agentClient = await getAgentWalletClient(job.evaluator)
      
      let hash: `0x${string}`
      if (approvePayment) {
        const reasonBytes = keccak256(toHex(reason || 'Audit Approved'))
        hash = await agentClient.writeContract({
          address: JOB_ESCROW_ADDRESS,
          abi: jobEscrowAbi,
          functionName: 'complete',
          args: [BigInt(jobId), reasonBytes, '0x' as `0x${string}`],
        })
      } else {
        const reasonBytes = keccak256(toHex(reason || 'Audit Rejected'))
        hash = await agentClient.writeContract({
          address: JOB_ESCROW_ADDRESS,
          abi: jobEscrowAbi,
          functionName: 'reject',
          args: [BigInt(jobId), reasonBytes, '0x' as `0x${string}`],
        })
      }

      addActivity('Audit Settle Sent', 'Waiting for on-chain settlement confirmation...', 'refresh', 'info')
      const receipt = await publicClient!.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error("Agent audit settlement reverted on-chain")
      }

      addActivity('Escrow Settled', `Evaluator agent settled job. Funds ${approvePayment ? 'released' : 'refunded'}.`, 'party', 'success')
      return hash
    } catch (err: any) {
      console.error('Agent audit evaluation error:', err)
      const msg = err.shortMessage || err.message || 'Agent failed to audit'
      setError(msg)
      addActivity('Agent Settle Failed', msg, 'cross', 'danger')
      throw err
    } finally {
      setLoading(false)
    }
  }, [getJobDetails, getAgentWalletClient, publicClient, addActivity])

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
    triggerAgentSetBudget,
    triggerAgentSubmit,
    triggerAgentEvaluate,
  }
}
