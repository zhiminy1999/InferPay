'use client'

import { useState } from 'react'
import { parseUnits, formatUnits, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet } from 'viem/chains'
import { 
  AGENT_CONSENSUS_ADDRESS, 
  agentConsensusAbi,
  USDC_ADDRESS_ARC,
  EURC_ADDRESS_ARC
} from '@/lib/contracts'

const AGENT_1_KEY = '0x0000000000000000000000000000000000000000000000000000000000000001' as const
const AGENT_2_KEY = '0x0000000000000000000000000000000000000000000000000000000000000002' as const

interface UseAgentConsensusProps {
  isConnected: boolean
  address: `0x${string}` | undefined
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function useAgentConsensus({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: UseAgentConsensusProps) {
  const [isConsensusLoading, setIsConsensusLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fund Agent wallet if gas runs low
  const checkAndFundAgent = async (agentAddress: `0x${string}`) => {
    if (!publicClient || !walletClient || !address) return
    try {
      const bal = await publicClient.getBalance({ address: agentAddress })
      // If below 0.002 native gas USDC
      if (bal < parseUnits('0.002', 18)) {
        addActivity('Funding Agent Gas', `Feeding gas USDC to Agent at ${agentAddress.slice(0, 8)}...`, 'lightning', 'info')
        const fundTx = await walletClient.sendTransaction({
          account: address,
          to: agentAddress,
          value: parseUnits('0.005', 18),
          chain: null
        })
        await publicClient.waitForTransactionReceipt({ hash: fundTx })
      }
    } catch (err) {
      console.error("Gas pre-funding check failed:", err)
    }
  }

  // Create Proposal
  const createProposal = async (
    recipient: string,
    amountUsd: number,
    purpose: string,
    currency: 'USDC' | 'EURC' = 'USDC'
  ): Promise<number | null> => {
    setIsConsensusLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHash(null)

    try {
      if (!isConnected || !walletClient || !address || !publicClient) {
        throw new Error("Wallet not connected")
      }

      const tokenAddress = currency === 'EURC' ? EURC_ADDRESS_ARC : USDC_ADDRESS_ARC

      addActivity('Creating Proposal', `Submitting on-chain proposal for ${amountUsd} ${currency}...`, 'clipboard', 'info')
      const amountUnits = parseUnits(amountUsd.toString(), 6)

      const hash = await walletClient.writeContract({
        address: AGENT_CONSENSUS_ADDRESS,
        abi: agentConsensusAbi,
        functionName: 'createProposal',
        args: [recipient as `0x${string}`, tokenAddress, amountUnits, purpose],
        account: address,
        chain: null
      })
      
      setTxHash(hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      setTxStatus('success')
      addActivity('Proposal Created', `Consensus proposal (${currency}) registered on-chain.`, 'party', 'success')
      
      // Save proposal to database
      try {
        await fetch('/api/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: recipient,
            amount: amountUsd,
            status: 'PENDING',
            tx_hash: hash,
            metadata: { currency, purpose }
          })
        })
      } catch (err) {
        console.warn('Failed to save proposal in DB:', err)
      }

      return 0
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Proposal failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsConsensusLoading(false)
    }
  }

  // Submit Vote
  const submitVote = async (
    proposalId: number,
    agentIndex: number,
    approve: boolean
  ): Promise<string | null> => {
    setIsConsensusLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHash(null)

    try {
      if (!publicClient) {
        throw new Error("Network client not ready")
      }

      let hash: `0x${string}`

      if (agentIndex === 0) {
        // Master wallet vote
        if (!isConnected || !walletClient || !address) {
          throw new Error("Wallet not connected")
        }
        addActivity('Submitting Vote', `Master wallet voting ${approve ? 'APPROVE' : 'REJECT'}...`, 'balance', 'info')
        hash = await walletClient.writeContract({
          address: AGENT_CONSENSUS_ADDRESS,
          abi: agentConsensusAbi,
          functionName: 'voteProposal',
          args: [BigInt(proposalId), approve],
          account: address,
          chain: null
        })
      } else {
        // Ephemeral Agent vote
        const key = agentIndex === 1 ? AGENT_1_KEY : AGENT_2_KEY
        const acc = privateKeyToAccount(key)
        
        await checkAndFundAgent(acc.address)
        
        addActivity('Submitting Vote', `Agent ${agentIndex} voting ${approve ? 'APPROVE' : 'REJECT'}...`, 'robot', 'info')
        const agentClient = createWalletClient({
          account: acc,
          chain: arcTestnet,
          transport: http()
        })

        hash = await agentClient.writeContract({
          address: AGENT_CONSENSUS_ADDRESS,
          abi: agentConsensusAbi,
          functionName: 'voteProposal',
          args: [BigInt(proposalId), approve],
          chain: arcTestnet
        })
      }

      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setTxStatus('success')
      addActivity('Vote Recorded', `Vote submitted by Agent ${agentIndex} successfully.`, 'party', 'success')
      return hash
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Voting failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsConsensusLoading(false)
    }
  }

  // Bypass Consensus
  const bypassExecute = async (proposalId: number): Promise<string | null> => {
    setIsConsensusLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHash(null)

    try {
      if (!isConnected || !walletClient || !address || !publicClient) {
        throw new Error("Wallet not connected")
      }

      addActivity('Manual Override', 'Bypassing consensus to execute treasury payment...', 'lightning', 'warning')

      const hash = await walletClient.writeContract({
        address: AGENT_CONSENSUS_ADDRESS,
        abi: agentConsensusAbi,
        functionName: 'humanBypassExecute',
        args: [BigInt(proposalId)],
        account: address,
        chain: null
      })

      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setTxStatus('success')
      addActivity('Bypass Confirmed', 'Override executed. Funds released.', 'party', 'success')
      return hash
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Bypass failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsConsensusLoading(false)
    }
  }

  // Fetch proposal details
  const getProposalState = async (proposalId: number) => {
    if (!publicClient) return null
    try {
      const data = await publicClient.readContract({
        address: AGENT_CONSENSUS_ADDRESS,
        abi: agentConsensusAbi,
        functionName: 'proposals',
        args: [BigInt(proposalId)]
      })
      // Returns struct tuple: [id, recipient, amount, purpose, approvalsCount, executed, rejected, creationTime]
      return {
        id: Number(data[0]),
        recipient: data[1],
        amount: Number(formatUnits(data[2], 6)),
        purpose: data[3],
        approvalsCount: Number(data[4]),
        executed: data[5],
        rejected: data[6],
        creationTime: Number(data[7])
      }
    } catch (err) {
      console.error("Failed to read proposal state:", err)
      return null
    }
  }

  return {
    isConsensusLoading,
    txHash,
    txStatus,
    errorMsg,
    createProposal,
    submitVote,
    bypassExecute,
    getProposalState
  }
}
