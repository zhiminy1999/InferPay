'use client'

import { useState } from 'react'
import { parseUnits, formatUnits, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet } from 'viem/chains'
import { 
  AGENT_ESCROW_ADDRESS, 
  USDC_ADDRESS_ARC, 
  EURC_ADDRESS_ARC,
  agentEscrowAbi, 
  erc20Abi 
} from '@/lib/contracts'
import { generateEphemeralKeypair, EphemeralKeypair } from '@/lib/wallet-utils'

export const WHITELIST_ADDRESSES = {
  openai: '0x0000000000000000000000000000000000000001' as `0x${string}`,
  together: '0x0000000000000000000000000000000000000002' as `0x${string}`,
  huggingface: '0x0000000000000000000000000000000000000003' as `0x${string}`,
  anthropic: '0x0000000000000000000000000000000000000004' as `0x${string}`
}

const mapPeriodToSeconds = (period: string): bigint => {
  switch (period) {
    case '12h':
      return BigInt(12 * 3600)
    case '1d':
      return BigInt(24 * 3600)
    case '7d':
      return BigInt(7 * 24 * 3600)
    default:
      return BigInt(12 * 3600)
  }
}

interface UseAgentEscrowProps {
  isConnected: boolean
  address: `0x${string}` | undefined
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function useAgentEscrow({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: UseAgentEscrowProps) {
  const [isEscrowLoading, setIsEscrowLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Ephemeral wallet balances
  const [ephemeralUsdcBal, setEphemeralUsdcBal] = useState<string>('0.00')
  const [ephemeralEurcBal, setEphemeralEurcBal] = useState<string>('0.00')
  const [ephemeralGasBal, setEphemeralGasBal] = useState<string>('0.00')

  // Helper to fetch ephemeral balances
  const updateEphemeralBalances = async (ephemeralAddress: `0x${string}`) => {
    if (!publicClient) return
    try {
      // 1. ERC20 USDC balance (6 decimals)
      const usdcBal = await publicClient.readContract({
        address: USDC_ADDRESS_ARC,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [ephemeralAddress]
      }) as bigint
      setEphemeralUsdcBal(Number(formatUnits(usdcBal, 6)).toFixed(4))

      // 2. ERC20 EURC balance (6 decimals)
      const eurcBal = await publicClient.readContract({
        address: EURC_ADDRESS_ARC,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [ephemeralAddress]
      }) as bigint
      setEphemeralEurcBal(Number(formatUnits(eurcBal, 6)).toFixed(4))

      // 3. Native gas balance (18 decimals)
      const gasBal = await publicClient.getBalance({ address: ephemeralAddress })
      setEphemeralGasBal(Number(formatUnits(gasBal, 18)).toFixed(4))
    } catch (err) {
      console.error("Failed to read ephemeral balances:", err)
    }
  }

  // Activate session
  const createSession = async (
    pocketMoney: number,
    safePeriod: string,
    whitelistServices: { openai: boolean; together: boolean; huggingface: boolean; anthropic: boolean },
    currency: 'USDC' | 'EURC' = 'USDC'
  ): Promise<EphemeralKeypair | null> => {
    setIsEscrowLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHash(null)

    addActivity('Generating keypair', 'Creating ephemeral keys for the AI agent session.', 'key', 'info')
    const keypair = generateEphemeralKeypair()

    try {
      if (!isConnected || !walletClient || !address || !publicClient) {
        throw new Error("Wallet not connected")
      }

      const tokenAddress = currency === 'EURC' ? EURC_ADDRESS_ARC : USDC_ADDRESS_ARC

      // 1. Approve USDC/EURC transfer
      addActivity(`${currency} Approve`, `Requesting allowance for AgentEscrow V2 in ${currency}...`, 'chain', 'info')
      const approveAmount = parseUnits(pocketMoney.toString(), 6)
      const approveTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [AGENT_ESCROW_ADDRESS, approveAmount],
        account: address,
        chain: null
      })
      setTxHash(approveTx)
      await publicClient.waitForTransactionReceipt({ hash: approveTx })
      addActivity('Allowance Approved', `${currency} spend allowance verified.`, 'party', 'success')

      // 2. Fund Ephemeral Wallet with gas
      addActivity('Funding Gas', 'Transferring native USDC gas to ephemeral wallet...', 'lightning', 'info')
      const gasAmount = parseUnits('0.015', 18) // ample native USDC for multiple txs
      const fundTx = await walletClient.sendTransaction({
        account: address,
        to: keypair.address,
        value: gasAmount,
        chain: null
      })
      setTxHash(fundTx)
      await publicClient.waitForTransactionReceipt({ hash: fundTx })
      addActivity('Gas Funded', 'Gas tokens received by ephemeral wallet.', 'lightning', 'success')

      // 3. Collect Whitelist addresses
      const whitelist: `0x${string}`[] = []
      if (whitelistServices.openai) whitelist.push(WHITELIST_ADDRESSES.openai)
      if (whitelistServices.together) whitelist.push(WHITELIST_ADDRESSES.together)
      if (whitelistServices.huggingface) whitelist.push(WHITELIST_ADDRESSES.huggingface)
      if (whitelistServices.anthropic) whitelist.push(WHITELIST_ADDRESSES.anthropic)

      // 4. Create Session on-chain
      addActivity('On-chain Session', `Initializing session policy on AgentEscrow V2 using ${currency}...`, 'chain', 'info')
      const duration = mapPeriodToSeconds(safePeriod)
      const createTx = await walletClient.writeContract({
        address: AGENT_ESCROW_ADDRESS,
        abi: agentEscrowAbi,
        functionName: 'createSession',
        args: [keypair.address, tokenAddress, approveAmount, duration, whitelist],
        account: address,
        chain: null
      })
      setTxHash(createTx)
      await publicClient.waitForTransactionReceipt({ hash: createTx })

      setTxStatus('success')
      addActivity('Session Active', `AI budget policy (${currency}) enforced on Arc Testnet.`, 'shield', 'success')
      await updateEphemeralBalances(keypair.address)

      // Save session choice to database
      try {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: keypair.address,
            amount: pocketMoney,
            status: 'SUCCESS',
            txHash: createTx,
            metadata: { expiration: Number(duration) + Math.floor(Date.now() / 1000), currency }
          })
        })
      } catch (err) {
        console.warn('Failed to save session in DB:', err)
      }

      return keypair
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Setup failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsEscrowLoading(false)
    }
  }

  // Execute Spend
  const executeSpend = async (
    ephemeralPrivateKey: `0x${string}`,
    serviceKey: 'openai' | 'together' | 'huggingface' | 'anthropic',
    amountUsd: number
  ): Promise<string | null> => {
    setIsEscrowLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHash(null)

    try {
      if (!publicClient) {
        throw new Error("Network client not ready")
      }

      const epAccount = privateKeyToAccount(ephemeralPrivateKey)
      
      // Let's verify target and amount
      const target = WHITELIST_ADDRESSES[serviceKey]
      const amountUnits = parseUnits(amountUsd.toString(), 6)

      // Update ephemeral wallet balance to check gas
      await updateEphemeralBalances(epAccount.address)
      
      addActivity('AI purchasing', `Submitting spend transaction from AI session: $${amountUsd} to ${serviceKey}`, 'money', 'info')

      // Create transient client for the ephemeral wallet
      const epClient = createWalletClient({
        account: epAccount,
        chain: arcTestnet,
        transport: http()
      })

      const tx = await epClient.writeContract({
        address: AGENT_ESCROW_ADDRESS,
        abi: agentEscrowAbi,
        functionName: 'executeSpend',
        args: [epAccount.address, target, amountUnits],
        chain: arcTestnet
      })
      setTxHash(tx)
      await publicClient.waitForTransactionReceipt({ hash: tx })

      setTxStatus('success')
      addActivity('Spend successful', `Purchased service from ${serviceKey} for $${amountUsd} USDC.`, 'party', 'success')
      await updateEphemeralBalances(epAccount.address)
      return tx
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Purchase failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsEscrowLoading(false)
    }
  }

  // Sweep session
  const sweepSession = async (ephemeralAddress: `0x${string}`): Promise<string | null> => {
    setIsEscrowLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHash(null)

    addActivity('Sweeping Session', 'Returning unspent funds to master wallet...', 'refresh', 'info')

    try {
      if (!isConnected || !walletClient || !address || !publicClient) {
        throw new Error("Wallet not connected")
      }

      const tx = await walletClient.writeContract({
        address: AGENT_ESCROW_ADDRESS,
        abi: agentEscrowAbi,
        functionName: 'sweepSession',
        args: [ephemeralAddress],
        account: address,
        chain: null
      })
      setTxHash(tx)
      await publicClient.waitForTransactionReceipt({ hash: tx })

      setTxStatus('success')
      addActivity('Sweep successful', 'All unspent funds returned to your account.', 'shield', 'success')
      await updateEphemeralBalances(ephemeralAddress)
      return tx
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Sweep failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsEscrowLoading(false)
    }
  }

  return {
    isEscrowLoading,
    txHash,
    txStatus,
    errorMsg,
    ephemeralUsdcBal,
    ephemeralEurcBal,
    ephemeralGasBal,
    createSession,
    executeSpend,
    sweepSession,
    updateEphemeralBalances
  }
}
