'use client'

import { useState, useEffect } from 'react'
import { formatUnits } from 'viem'
import { USDC_ADDRESS_ARC, EURC_ADDRESS_ARC, erc20Abi } from '@/lib/contracts'

interface UseBalancesProps {
  isConnected: boolean
  address: string | null
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function useBalances({ isConnected, address, publicClient, addActivity }: UseBalancesProps) {
  const [usdcBalance, setUsdcBalance] = useState<string>('1250.00')
  const [eurcBalance, setEurcBalance] = useState<string>('840.00')

  // Load simulated balances from localStorage on mount (Demo Mode only)
  useEffect(() => {
    if (!isConnected) {
      const savedUsdc = localStorage.getItem('inferpay_sim_usdc')
      const savedEurc = localStorage.getItem('inferpay_sim_eurc')
      if (savedUsdc) setUsdcBalance(savedUsdc)
      if (savedEurc) setEurcBalance(savedEurc)
    }
  }, [isConnected])

  // Get On-chain Real Balances when connected
  useEffect(() => {
    const getOnChainBalances = async () => {
      if (isConnected && address && publicClient) {
        try {
          const usdcBal = await publicClient.readContract({
            address: USDC_ADDRESS_ARC,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          }) as bigint
          
          const eurcBal = await publicClient.readContract({
            address: EURC_ADDRESS_ARC,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          }) as bigint

          const usdcStr = Number(formatUnits(usdcBal, 6)).toFixed(2)
          const eurcStr = Number(formatUnits(eurcBal, 6)).toFixed(2)

          setUsdcBalance(usdcStr)
          setEurcBalance(eurcStr)
          
          addActivity(
            'Balances loaded',
            `Your account: $${usdcStr} USD · €${eurcStr} EUR`,
            '💳',
            'success'
          )
        } catch (err) {
          console.error("Failed to read balances:", err)
        }
      }
    }
    getOnChainBalances()
  }, [isConnected, address, publicClient])

  return {
    usdcBalance,
    setUsdcBalance,
    eurcBalance,
    setEurcBalance
  }
}
