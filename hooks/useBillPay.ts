'use client'

import { useState } from 'react'
import { parseUnits } from 'viem'
import { 
  USDC_ADDRESS_ARC, 
  EURC_ADDRESS_ARC,
  INFERPAY_CONTRACT_ADDRESS, 
  erc20Abi, 
  inferPayAbi 
} from '@/lib/contracts'
import { VENDOR_ADDRESS, RESERVE_ADDRESS } from '@/lib/addresses'

interface UseBillPayProps {
  isConnected: boolean
  address: `0x${string}` | undefined
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function useBillPay({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: UseBillPayProps) {
  const [isPayLoading, setIsPayLoading] = useState(false)
  const [txHashes, setTxHashes] = useState<string[]>([])
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Standard Bill Split (90% to vendor / 10% to reserve)
  const payStandardBill = async (amountUsd: number, currency: 'USDC' | 'EURC' = 'USDC'): Promise<[string, string] | null> => {
    setIsPayLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHashes([])

    try {
      if (!isConnected || !walletClient || !address || !publicClient) {
        throw new Error("Wallet not connected")
      }

      const tokenAddress = currency === 'EURC' ? EURC_ADDRESS_ARC : USDC_ADDRESS_ARC

      // Check balance
      const balanceRaw = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address]
      })
      const requiredAmount = parseUnits(amountUsd.toString(), 6)
      if (balanceRaw < requiredAmount) {
        throw new Error(`Insufficient ${currency} balance. Required: ${amountUsd} ${currency}.`)
      }

      // Calculate split amounts
      const vendorAmount = parseUnits((amountUsd * 0.9).toString(), 6)
      const reserveAmount = parseUnits((amountUsd * 0.1).toString(), 6)

      addActivity('Initiating Split Payment', `Sending 90% (${(amountUsd * 0.9).toFixed(2)} ${currency}) to vendor...`, 'money', 'info')
      // 1. Transfer to Vendor
      const vendorHash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [VENDOR_ADDRESS, vendorAmount],
        account: address,
        chain: null
      })
      const vendorReceipt = await publicClient.waitForTransactionReceipt({ hash: vendorHash })
      if (vendorReceipt.status === 'reverted') {
        throw new Error("Vendor transfer transaction reverted on-chain")
      }

      addActivity('Reserve Allocation', `Sending 10% (${(amountUsd * 0.1).toFixed(2)} ${currency}) to company reserve account...`, 'bank', 'info')
      // 2. Transfer to Reserve
      const reserveHash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [RESERVE_ADDRESS, reserveAmount],
        account: address,
        chain: null
      })
      setTxHashes([vendorHash, reserveHash])
      const reserveReceipt = await publicClient.waitForTransactionReceipt({ hash: reserveHash })
      if (reserveReceipt.status === 'reverted') {
        throw new Error("Reserve allocation transaction reverted on-chain")
      }

      setTxStatus('success')
      addActivity('Split Payment Settled', `Both transactions confirmed. Vendor paid and 10% reserve allocated in ${currency}.`, 'party', 'success')

      // Save to database
      try {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: address,
            amount: amountUsd,
            status: 'SUCCESS',
            tx_hash: vendorHash,
            metadata: { currency, type: 'STANDARD', reserveTx: reserveHash }
          })
        })
      } catch (err) {
        console.warn('Failed to save payment in DB:', err)
      }

      return [vendorHash, reserveHash]
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Payment failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsPayLoading(false)
    }
  }

  // Compute / Inference Bill (USDC Approval + requestInference call)
  const payInferenceBill = async (
    amountUsd: number,
    modelId: string,
    currency: 'USDC' | 'EURC' = 'USDC'
  ): Promise<[string, string, number] | null> => {
    setIsPayLoading(true)
    setTxStatus('pending')
    setErrorMsg(null)
    setTxHashes([])

    try {
      if (!isConnected || !walletClient || !address || !publicClient) {
        throw new Error("Wallet not connected")
      }

      const tokenAddress = currency === 'EURC' ? EURC_ADDRESS_ARC : USDC_ADDRESS_ARC

      // Check balance
      const balanceRaw = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address]
      })
      const requiredAmount = parseUnits(amountUsd.toString(), 6)
      if (balanceRaw < requiredAmount) {
        throw new Error(`Insufficient ${currency} balance. Required: ${amountUsd} ${currency}.`)
      }

      // Fetch sequential next job ID
      const nextIdRaw = await publicClient.readContract({
        address: INFERPAY_CONTRACT_ADDRESS,
        abi: inferPayAbi,
        functionName: 'nextJobId'
      })
      const nextId = Number(nextIdRaw)

      addActivity('Approving Escrow', `Granting ${amountUsd} ${currency} allowance to InferPayEscrow...`, 'lock', 'info')
      // 1. Approve
      const approveHash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [INFERPAY_CONTRACT_ADDRESS, requiredAmount],
        account: address,
        chain: null
      })
      setTxHashes([approveHash])
      const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash })
      if (approveReceipt.status === 'reverted') {
        throw new Error("Escrow approval transaction reverted on-chain")
      }

      addActivity('Registering Job', `Submitting inference job #${nextId} for model ${modelId} on-chain...`, 'computer', 'info')
      // 2. Request Inference
      const requestHash = await walletClient.writeContract({
        address: INFERPAY_CONTRACT_ADDRESS,
        abi: inferPayAbi,
        functionName: 'requestInference',
        args: [tokenAddress, modelId, requiredAmount],
        account: address,
        chain: null
      })
      setTxHashes([approveHash, requestHash])
      const requestReceipt = await publicClient.waitForTransactionReceipt({ hash: requestHash })
      if (requestReceipt.status === 'reverted') {
        throw new Error("Inference request transaction reverted on-chain")
      }

      setTxStatus('success')
      addActivity('Inference job created', `Escrow deposit complete. Job #${nextId} active.`, 'party', 'success')

      // Save to database
      try {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: address,
            amount: amountUsd,
            status: 'SUCCESS',
            tx_hash: requestHash,
            metadata: { currency, type: 'INFERENCE', modelId, jobId: nextId }
          })
        })
      } catch (err) {
        console.warn('Failed to save payment in DB:', err)
      }

      return [approveHash, requestHash, nextId]
    } catch (err: any) {
      console.error(err)
      setTxStatus('error')
      const msg = err.shortMessage || err.message || 'Transaction failed'
      setErrorMsg(msg)
      addActivity('Inference registration failed', msg, 'cross', 'danger')
      return null
    } finally {
      setIsPayLoading(false)
    }
  }

  return {
    isPayLoading,
    txHashes,
    txStatus,
    errorMsg,
    payStandardBill,
    payInferenceBill
  }
}
