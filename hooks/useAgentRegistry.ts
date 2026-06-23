'use client'

import { useState } from 'react'
import { AGENT_REGISTRY_ADDRESS, agentRegistryAbi } from '@/lib/agent-registry'

export interface AgentInfo {
  wallet: `0x${string}`
  name: string
  description: string
  capabilities: string
  serviceEndpoint: string
  reputation: number
  isSystem?: boolean
}

// System Agents preloaded fallback data
export const SYSTEM_AGENTS: AgentInfo[] = [
  {
    wallet: '0x08Ec3EEfC622b8a8742fC8Ab48E832c236bc360B',
    name: 'Admin Operations Controller',
    description: 'System controller agent managing escrow creation, sweeps, and manual bypass signals.',
    capabilities: 'Escrow Control, Sweeps, Bypass Execution',
    serviceEndpoint: 'https://api.inferpay.io/v1/ops',
    reputation: 98,
    isSystem: true
  },
  {
    wallet: '0x0c200b495d3EF602151caa364e071Bd71829978B',
    name: 'Safety Guardrail Reviewer',
    description: 'Autonomous safety agent verifying recipient address safety and AML compliance tags.',
    capabilities: 'Address Risk Scoring, Compliance Verification',
    serviceEndpoint: 'https://api.inferpay.io/v1/safety',
    reputation: 99,
    isSystem: true
  },
  {
    wallet: '0xB2a136968F2a8085371577Cbbe173F79b93caF1a',
    name: 'Budget Auditor Agent',
    description: 'Audits spending budgets and confirms remaining treasury allocations.',
    capabilities: 'Budget Auditing, Balance Validation',
    serviceEndpoint: 'https://api.inferpay.io/v1/audits',
    reputation: 95,
    isSystem: true
  },
  {
    wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    name: 'DeepSeek Coder Agent',
    description: 'Verifies smart contract compiler options, runs automated unit tests, and rates code security.',
    capabilities: 'Static Analysis, Code Audit, Solidity Verification',
    serviceEndpoint: 'https://api.inferpay.io/v1/deepseek-coder',
    reputation: 97,
    isSystem: true
  },
  {
    wallet: '0x4443656EC7ab88b098defB751B7401B5f6d8999F',
    name: 'CCTP Arbitrage Bot',
    description: 'Monitors stablecoin liquidity pools across Base, Arbitrum, and Arc to route crosschain transfers.',
    capabilities: 'USDC Bridging Route Optimization, Spread Arbitrage',
    serviceEndpoint: 'https://api.inferpay.io/v1/cctp-router',
    reputation: 94,
    isSystem: true
  },
  {
    wallet: '0x8888856EC7ab88b098defB751B7401B5f6d8888A',
    name: 'Vercel Deployment Sweeper',
    description: 'Polls GitHub commits and Vercel production deployments to trigger automated contributor payments.',
    capabilities: 'Webhook Processing, Build Verification, Payroll Triggers',
    serviceEndpoint: 'https://api.inferpay.io/v1/vercel-sweeper',
    reputation: 96,
    isSystem: true
  }
]

interface UseAgentRegistryProps {
  isConnected: boolean
  address: `0x${string}` | undefined
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function useAgentRegistry({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: UseAgentRegistryProps) {
  const [isRegistryLoading, setIsRegistryLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Register Agent
  const registerAgent = async (
    name: string,
    description: string,
    capabilities: string,
    serviceEndpoint: string
  ): Promise<string | null> => {
    setIsRegistryLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHash(null)

    try {
      if (!isConnected || !walletClient || !address || !publicClient) {
        throw new Error("Wallet not connected")
      }

      addActivity('Registering Agent', `Submitting Agent registration for ${name}...`, 'robot', 'info')

      const hash = await walletClient.writeContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: agentRegistryAbi,
        functionName: 'registerAgent',
        args: [address, name, description, capabilities, serviceEndpoint],
        account: address,
        chain: null
      })

      setTxHash(hash)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status === 'reverted') {
        throw new Error('Agent registration transaction reverted on-chain.')
      }
      setTxStatus('success')
      addActivity('Agent Registered', `AI Agent registered on-chain.`, 'party', 'success')
      return hash
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Registration failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsRegistryLoading(false)
    }
  }

  // Fetch Agent Details
  const getAgentDetails = async (agentAddress: `0x${string}`): Promise<AgentInfo | null> => {
    if (!publicClient) return null
    try {
      const data = await publicClient.readContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: agentRegistryAbi,
        functionName: 'getAgent',
        args: [agentAddress]
      })

      // If address is zero, it means not registered
      if (data[0] === '0x0000000000000000000000000000000000000000') {
        return null
      }

      return {
        wallet: data[0],
        name: data[1],
        description: data[2],
        capabilities: data[3],
        serviceEndpoint: data[4],
        reputation: Number(data[5])
      }
    } catch (err) {
      console.error(`Failed to fetch agent details for ${agentAddress}:`, err)
      return null
    }
  }

  // Fetch all agents registered on-chain
  const getAllAgents = async (): Promise<AgentInfo[]> => {
    if (!publicClient) return SYSTEM_AGENTS
    try {
      const addressesRaw = await publicClient.readContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: agentRegistryAbi,
        functionName: 'getAllAgentAddresses'
      })

      const addresses = addressesRaw as `0x${string}`[]
      const list: AgentInfo[] = []

      // Fetch on-chain registered agents
      for (const addr of addresses) {
        const info = await getAgentDetails(addr)
        if (info) {
          list.push(info)
        }
      }

      // Merge with system agents that are not registered on-chain yet, to ensure directory looks rich
      const mergedList = [...list]
      for (const sysAgent of SYSTEM_AGENTS) {
        const alreadyInList = list.some(a => a.wallet.toLowerCase() === sysAgent.wallet.toLowerCase())
        if (!alreadyInList) {
          mergedList.push(sysAgent)
        }
      }

      return mergedList;
    } catch (err) {
      console.error("Failed to fetch all agents from registry:", err)
      return SYSTEM_AGENTS
    }
  }

  return {
    isRegistryLoading,
    txHash,
    txStatus,
    errorMsg,
    registerAgent,
    getAgentDetails,
    getAllAgents
  }
}
