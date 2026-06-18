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
  const [usdcBalance, setUsdcBalance] = useState<string>('0.00')
  const [eurcBalance, setEurcBalance] = useState<string>('0.00')

  // Fetch real on-chain balances when wallet connects
  // No localStorage simulation — only real Arc Testnet data

  // Load simulated balances for Demo Mode
  useEffect(() => {
    if (!isConnected) {
      const storedUsdc = localStorage.getItem('inferpay_sim_usdc') || '1000.00'
      const storedEurc = localStorage.getItem('inferpay_sim_eurc') || '1000.00'
      setUsdcBalance(storedUsdc)
      setEurcBalance(storedEurc)
      if (!localStorage.getItem('inferpay_sim_usdc')) {
        localStorage.setItem('inferpay_sim_usdc', '1000.00')
      }
      if (!localStorage.getItem('inferpay_sim_eurc')) {
        localStorage.setItem('inferpay_sim_eurc', '1000.00')
      }
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
