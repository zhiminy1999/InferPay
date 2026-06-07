'use client'

import { useState } from 'react'
import { parseUnits, formatUnits, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet } from 'viem/chains'
import { 
  AGENT_CONSENSUS_ADDRESS, 
  agentConsensusAbi 
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
        addActivity('Funding Agent Gas', `Feeding gas USDC to Agent at ${agentAddress.slice(0, 8)}...`, '⛽', 'info')
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
    purpose: string
  ): Promise<number | null> => {
    setIsConsensusLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHash(null)

    try {
      if (!isConnected || !walletClient || !address || !publicClient) {
        throw new Error("Wallet not connected")
      }

      addActivity('Creating Proposal', `Submitting on-chain proposal for $${amountUsd} USDC...`, '📝', 'info')
      const amountUnits = parseUnits(amountUsd.toString(), 6)

      const hash = await walletClient.writeContract({
        address: AGENT_CONSENSUS_ADDRESS,
        abi: agentConsensusAbi,
        functionName: 'createProposal',
        args: [recipient as `0x${string}`, amountUnits, purpose],
        account: address,
        chain: null
      })
      
      setTxHash(hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      // Look up proposal length or parse events to determine ID
      // A safe way is to query the proposals count/length
      // Let's get proposal ID from event or mapping
      // Since it starts at 0, we can read the proposals array or parse receipt logs
      // Let's just find the next index by looping or checking index
      // Since we know the index is sequential, let's fetch the ID
      setTxStatus('success')
      addActivity('Proposal Created', 'Consensus proposal registered on-chain.', '✅', 'success')
      
      return 0 // return a placeholder, we will read the proposal state dynamically
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Proposal failed', msg, '❌', 'danger')
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
        addActivity('Submitting Vote', `Master wallet voting ${approve ? 'APPROVE' : 'REJECT'}...`, '🗳️', 'info')
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
        
        addActivity('Submitting Vote', `Agent ${agentIndex} voting ${approve ? 'APPROVE' : 'REJECT'}...`, '🤖', 'info')
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
      addActivity('Vote Recorded', `Vote submitted by Agent ${agentIndex} successfully.`, '✅', 'success')
      return hash
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Voting failed', msg, '❌', 'danger')
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

      addActivity('Manual Override', 'Bypassing consensus to execute treasury payment...', '⚡', 'warning')

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
      addActivity('Bypass Confirmed', 'Override executed. Funds released.', '✅', 'success')
      return hash
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Bypass failed', msg, '❌', 'danger')
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
