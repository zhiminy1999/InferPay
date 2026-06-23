import { useState, useEffect, useCallback } from 'react'
import { GatewayClient } from '../lib/gateway'
import { useWeb3 } from '../lib/web3-provider'
import { parseUnits, formatUnits } from 'viem'

export interface GatewayHistoryItem {
  type: 'deposit' | 'withdrawal' | 'spend'
  amount: string
  description?: string
  txHash?: string
  payoutHash?: string
  timestamp: number
  settled?: boolean
}

export function useNanopayments() {
  const { isConnected, address, publicClient, walletClient } = useWeb3()
  const [gatewayBalance, setGatewayBalance] = useState<bigint>(BigInt(0))
  const [walletBalance, setWalletBalance] = useState<bigint>(BigInt(0))
  const [history, setHistory] = useState<GatewayHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  
  // Real-time spend metrics
  const [spendRate, setSpendRate] = useState<number>(0) // cumulative dollars spent
  const [inferenceCount, setInferenceCount] = useState<number>(0)
  
  // Balance Alert Configuration
  const alertThreshold = parseUnits('0.05', 6) // Alert if balance falls below 0.05 USDC

  const getClient = useCallback(() => {
    if (!isConnected || !address) return null
    return new GatewayClient({
      chain: 'arcTestnet',
      userAddress: address as `0x${string}`,
      publicClient,
      walletClient,
    })
  }, [isConnected, address, publicClient, walletClient])

  const refreshBalances = useCallback(async () => {
    const client = getClient()
    if (!client || !address) return

    try {
      const bals = await client.getBalances()
      setGatewayBalance(bals.gateway.available)
      setWalletBalance(bals.wallet.amount)

      // Sync on-chain gateway balance to localStorage for the x402 simulator
      if (typeof window !== 'undefined') {
        localStorage.setItem(`gateway_bal_${address.toLowerCase()}`, bals.gateway.available.toString())
      }

      // Load history from database
      try {
        const paymentsRes = await fetch(`/api/payments?wallet_address=${address}`)
        if (paymentsRes.ok) {
          const { data } = await paymentsRes.json()
          if (data && Array.isArray(data)) {
            let totalSpent = 0
            let totalInferences = 0
            const histItems: GatewayHistoryItem[] = data.map((item: any) => {
              const isSpend = item.metadata?.source === 'Gateway Nanopayments'
              if (isSpend) {
                totalSpent += Number(item.amount)
                totalInferences += 1
              }
              return {
                type: isSpend ? 'spend' : 'deposit',
                amount: item.amount.toString(),
                description: item.metadata?.modelId ? `AI Inference: ${item.metadata.modelId}` : item.metadata?.source || 'Transfer',
                txHash: item.tx_hash,
                timestamp: item.timestamp * 1000,
                settled: item.status === 'SUCCESS',
              }
            })
            setHistory(histItems)
            setSpendRate(totalSpent)
            setInferenceCount(totalInferences)
          }
        }
      } catch (histErr) {
        console.error('Failed to load gateway history from database:', histErr)
      }
    } catch (e) {
      console.error('Error refreshing gateway balances:', e)
    }
  }, [getClient, address])

  useEffect(() => {
    if (isConnected && address) {
      refreshBalances()
      
      // Auto refresh every 5 seconds to match updates
      const interval = setInterval(refreshBalances, 5000)
      return () => clearInterval(interval)
    }
  }, [isConnected, address, refreshBalances])

  // Triggers deposit flow
  const depositUSDC = async (amount: string) => {
    const client = getClient()
    if (!client) throw new Error('Wallet not connected')

    setIsDepositing(true)
    try {
      const res = await client.deposit(amount)
      await refreshBalances()
      return res
    } finally {
      setIsDepositing(false)
    }
  }

  // Triggers withdrawal flow
  const withdrawUSDC = async (amount: string) => {
    const client = getClient()
    if (!client) throw new Error('Wallet not connected')

    setIsWithdrawing(true)
    try {
      const res = await client.withdraw(amount)
      await refreshBalances()
      return res
    } finally {
      setIsWithdrawing(false)
    }
  }

  // Executes a nanopayed API inference call
  const executeInference = async (modelId: string) => {
    const client = getClient()
    if (!client) throw new Error('Wallet not connected')

    setIsLoading(true)
    try {
      const res = await client.pay('/api/inference', { modelId })
      if (res.success) {
        setInferenceCount((prev) => prev + 1)
        setSpendRate((prev) => prev + 0.001)
        await refreshBalances()
      }
      return res
    } finally {
      setIsLoading(false)
    }
  }

  return {
    gatewayBalance,
    gatewayBalanceFormatted: formatUnits(gatewayBalance, 6),
    walletBalance,
    walletBalanceFormatted: formatUnits(walletBalance, 6),
    history,
    isLoading,
    isDepositing,
    isWithdrawing,
    spendRate: spendRate.toFixed(4),
    inferenceCount,
    isLowBalance: gatewayBalance < alertThreshold,
    refreshBalances,
    depositUSDC,
    withdrawUSDC,
    executeInference,
  }
}
