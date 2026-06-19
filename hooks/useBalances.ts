'use client'

import { useState, useEffect, useRef } from 'react'
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
  const firstLoadDone = useRef<boolean>(false)

  // Set balances to zero when disconnected
  useEffect(() => {
    if (!isConnected) {
      firstLoadDone.current = false
      setUsdcBalance('0.00')
      setEurcBalance('0.00')
    }
  }, [isConnected])

  // Get On-chain Real Balances when connected and poll every 2 seconds
  useEffect(() => {
    let active = true

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

          if (active) {
            setUsdcBalance(usdcStr)
            setEurcBalance(eurcStr)
            
            if (!firstLoadDone.current) {
              firstLoadDone.current = true
              addActivity(
                'Balances loaded',
                `Your account: $${usdcStr} USD · €${eurcStr} EUR`,
                'money',
                'success'
              )
            }
          }
        } catch (err) {
          console.error("Failed to read balances:", err)
        }
      }
    }
    
    getOnChainBalances()
    
    const interval = setInterval(getOnChainBalances, 2000)
    
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [isConnected, address, publicClient])

  return {
    usdcBalance,
    setUsdcBalance,
    eurcBalance,
    setEurcBalance
  }
}
