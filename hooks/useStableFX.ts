'use client'

import { useState, useEffect, useCallback } from 'react'
import { parseUnits, getAddress } from 'viem'
import { USDC_ADDRESS_ARC, EURC_ADDRESS_ARC, erc20Abi } from '@/lib/contracts'
import { StableFXClient, FXQuote, FXTrade } from '@/lib/stablefx'

interface UseStableFXProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
  onRefreshBalances?: () => void
}

export interface SwapHistoryRecord {
  id: string
  timestamp: string
  fromCurrency: string
  toCurrency: string
  amountIn: string
  amountOut: string
  rate: string
  inboundTxHash: string
  outboundTxHash: string
  pnl: string
}

const POOL_ADDR = '0x08Ec3EEfC622b8a8742fC8Ab48E832c236bc360B'

export function useStableFX({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity,
  onRefreshBalances
}: UseStableFXProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [quote, setQuote] = useState<FXQuote | null>(null)
  const [history, setHistory] = useState<SwapHistoryRecord[]>([])
  const [currentRate, setCurrentRate] = useState<number>(0.925)

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('inferpay_stablefx_history')
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Save history to localStorage
  const saveHistory = (newHistory: SwapHistoryRecord[]) => {
    setHistory(newHistory)
    localStorage.setItem('inferpay_stablefx_history', JSON.stringify(newHistory))
  }

  // Periodic rate polling
  useEffect(() => {
    const updateRate = async () => {
      const rate = await StableFXClient.fetchExchangeRate('USDC', 'EURC')
      setCurrentRate(rate)
    }
    updateRate()
    const interval = setInterval(updateRate, 10000)
    return () => clearInterval(interval)
  }, [])

  const getQuote = useCallback(async (fromCurrency: string, toCurrency: string, amount: string) => {
    if (!isConnected || !address) {
      addActivity('Connection Required', 'Please connect your wallet first', '🔒', 'warning')
      return null
    }
    setLoading(true)
    try {
      const q = await StableFXClient.requestQuote(fromCurrency, toCurrency, amount, address)
      setQuote(q)
      setLoading(false)
      return q
    } catch (err: any) {
      console.error(err)
      addActivity('Quote Error', 'Failed to retrieve StableFX quote', '❌', 'danger')
      setLoading(false)
      return null
    }
  }, [isConnected, address, addActivity])

  const executeSwap = useCallback(async () => {
    if (!quote || !isConnected || !address || !walletClient || !publicClient) {
      addActivity('Error', 'Missing quote or wallet connection', '❌', 'danger')
      return false
    }

    setLoading(true)
    addActivity('EIP-712 Request', 'Requesting quote signing verification from wallet...', '✍️', 'info')

    try {
      // 1. Sign Quote (EIP-712 PermitWitnessTransferFrom)
      const quoteSignature = await walletClient.signTypedData({
        account: address as `0x${string}`,
        domain: quote.typedData.domain,
        types: quote.typedData.types,
        primaryType: quote.typedData.primaryType,
        message: quote.typedData.message,
      })

      addActivity('Quote Signed', 'Quote verification signature approved.', '✓', 'success')

      // 2. Create FX Trade
      const trade = await StableFXClient.createTrade(quote, address, quoteSignature)

      // 3. Get Funding Presign Data
      const fundingData = await StableFXClient.getFundingPresignData(
        trade.contractTradeId,
        quote.from.currency,
        quote.from.amount
      )

      addActivity('Funding Signatures', 'Requesting funding authorization signature...', '✍️', 'info')

      // 4. Sign Funding Data (EIP-712 SingleTradeWitness)
      await walletClient.signTypedData({
        account: address as `0x${string}`,
        domain: fundingData.typedData.domain,
        types: fundingData.typedData.types,
        primaryType: fundingData.typedData.primaryType,
        message: fundingData.typedData.message,
      })

      addActivity('Authorized', 'Funding signature validated successfully.', '✓', 'success')

      // 5. Transfer tokens on Arc Testnet to the Pool contract
      const tokenAddress = quote.from.currency === 'USDC' ? USDC_ADDRESS_ARC : EURC_ADDRESS_ARC
      const amountRaw = parseUnits(quote.from.amount, 6)

      addActivity('Submitting Swap', `Depositing ${quote.from.amount} ${quote.from.currency} to StableFX Settlement...`, '⛓️', 'info')

      const transferHash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [getAddress(POOL_ADDR), amountRaw],
      })

      addActivity('Deposited', `Deposit transaction pending: ${transferHash.slice(0, 10)}...`, '⏳', 'info')
      
      // Wait for deposit transaction
      await publicClient.waitForTransactionReceipt({ hash: transferHash })

      addActivity('Settling FX Swap', 'Verifying deposit & releasing counterparty stablecoins...', '⚡', 'info')

      // 6. Call API route to execute payout from pool wallet
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: address,
          txHash: transferHash,
          fromCurrency: quote.from.currency,
          toCurrency: quote.to.currency,
          amount: quote.from.amount,
          outputAmount: quote.to.amount
        })
      })

      const responseData = await res.json()

      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to settle trade')
      }

      // Calculate simulated P&L (compare execution rate with base rate)
      const spread = Math.abs(parseFloat(quote.rate) - 0.925)
      const pnlValue = (parseFloat(quote.from.amount) * spread * 0.05).toFixed(4)

      // 7. Add record to history
      const newRecord: SwapHistoryRecord = {
        id: trade.id,
        timestamp: new Date().toLocaleTimeString(),
        fromCurrency: quote.from.currency,
        toCurrency: quote.to.currency,
        amountIn: quote.from.amount,
        amountOut: quote.to.amount,
        rate: quote.rate,
        inboundTxHash: transferHash,
        outboundTxHash: responseData.payoutHash,
        pnl: pnlValue
      }

      const updatedHistory = [newRecord, ...history]
      saveHistory(updatedHistory)

      addActivity('Swap Completed', `Swapped ${quote.from.amount} ${quote.from.currency} ➔ ${quote.to.amount} ${quote.to.currency}`, '💸', 'success')
      
      if (onRefreshBalances) {
        onRefreshBalances()
      }

      setQuote(null)
      setLoading(false)
      return true
    } catch (err: any) {
      console.error(err)
      addActivity('Swap Failed', err.message || 'Signature rejected or transaction failed', '❌', 'danger')
      setLoading(false)
      return false
    }
  }, [quote, isConnected, address, walletClient, publicClient, history, addActivity, onRefreshBalances])

  return {
    loading,
    quote,
    setQuote,
    history,
    currentRate,
    getQuote,
    executeSwap
  }
}
