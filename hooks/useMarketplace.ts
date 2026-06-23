'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '@/lib/web3-provider'
import { X402Protocol, X402Challenge, X402PaymentProof } from '@/lib/x402'
import { parseUnits } from 'viem'

export interface AIService {
  id: string
  name: string
  capability: string
  pricing: number
  reputation: number
  wallet_address: string
  metadata: {
    description: string
    completionRate: number
    tags: string[]
  }
}

export function useMarketplace() {
  const { isConnected, address } = useWeb3()
  const [services, setServices] = useState<AIService[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [minReputation, setMinReputation] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [recentPayments, setRecentPayments] = useState<any[]>([])

  const fetchServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = new URL('/api/services', window.location.origin)
      if (searchQuery) url.searchParams.set('capability', searchQuery)
      if (minReputation > 0) url.searchParams.set('minReputation', minReputation.toString())
      
      const res = await fetch(url.toString())
      const data = await res.json()
      if (data.services) {
        setServices(data.services)
      }
    } catch (err) {
      console.error('Failed to fetch services:', err)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, minReputation])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Get recent payments
  const fetchRecentPayments = useCallback(async () => {
    if (!address) return
    try {
      const res = await fetch(`/api/payments?wallet_address=${address}`)
      const data = await res.json()
      if (data.data) {
        // Filter by X402 or GATEWAY_SPEND payments
        const x402Pays = data.data.filter((p: any) => p.metadata?.type === 'X402')
        setRecentPayments(x402Pays)
      }
    } catch (err) {
      console.error('Failed to fetch payment history:', err)
    }
  }, [address])

  useEffect(() => {
    if (isConnected && address) {
      fetchRecentPayments()
    }
  }, [isConnected, address, fetchRecentPayments])

  // Register a service provider
  const registerService = async (service: {
    name: string
    capability: string
    pricing: number
    description: string
    tags: string[]
  }) => {
    if (!isConnected || !address) throw new Error('Wallet not connected')
    setIsRegistering(true)
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: service.name,
          capability: service.capability,
          pricing: service.pricing,
          reputation: 9.5, // Seed high initial reputation
          wallet_address: address,
          metadata: {
            description: service.description,
            completionRate: 0.98,
            tags: service.tags
          }
        })
      })

      const data = await res.json()
      if (data.success) {
        await fetchServices()
        return data.serviceId
      } else {
        throw new Error(data.error || 'Registration failed')
      }
    } finally {
      setIsRegistering(false)
    }
  }

  // Pay and execute service call via x402 nanopayment challenge
  const payAndRunService = async (
    service: AIService
  ): Promise<{ success: boolean; result?: string; proof?: X402PaymentProof; error?: string }> => {
    if (!isConnected || !address) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      // 1. Generate challenge (402 Payment Required)
      const challenge = X402Protocol.generateChallenge(service.id, service.pricing)

      // 2. Fetch current local gateway balance
      const balanceStr = localStorage.getItem(`gateway_bal_${address.toLowerCase()}`) || '0'
      const availableBalance = BigInt(balanceStr)

      // 3. Settle challenge by deducting from gateway balance
      const deductFn = async (amountUnits: bigint): Promise<boolean> => {
        const storedStr = localStorage.getItem(`gateway_bal_${address.toLowerCase()}`) || '0'
        const currentBal = BigInt(storedStr)
        if (currentBal < amountUnits) return false
        const nextBal = currentBal - amountUnits
        localStorage.setItem(`gateway_bal_${address.toLowerCase()}`, nextBal.toString())
        
        // Dispatch storage event to alert useNanopayments hook
        window.dispatchEvent(new Event('storage'))
        return true
      }

      const settleRes = await X402Protocol.settleChallenge(challenge, availableBalance, deductFn)
      if (!settleRes.success || !settleRes.proof) {
        return { success: false, error: settleRes.error || 'Failed to settle challenge' }
      }

      // 4. Send proof to Service provider endpoint (simulated)
      const isProofValid = X402Protocol.verifyPaymentProof(settleRes.proof, service.id, service.pricing)
      if (!isProofValid) {
        return { success: false, error: 'Provider rejected payment proof signature verification' }
      }

      // 5. Persist the pay history to SQLite API
      try {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: address,
            amount: service.pricing,
            status: 'SUCCESS',
            tx_hash: settleRes.proof['X-402-Receipt'], // Store receipt as simulated tx hash
            metadata: {
              type: 'X402',
              source: 'Gateway Nanopayments',
              currency: 'USDC',
              serviceId: service.id,
              serviceName: service.name,
              receipt: settleRes.proof['X-402-Receipt']
            }
          })
        })
        fetchRecentPayments()
      } catch (dbErr) {
        console.warn('Failed to persist X402 payment in SQLite:', dbErr)
      }

      // 6. Simulate return result based on capability
      let runResult = ''
      const cap = service.capability.toLowerCase()
      if (cap.includes('vision') || cap.includes('image')) {
        runResult = '[Vision Output] Succeeded. Detected object: "Autonomous AI Agent", boundingBox: [0.15, 0.23, 0.45, 0.62], confidence: 99.4%'
      } else if (cap.includes('code') || cap.includes('debug')) {
        runResult = '[Coder Output] Succeeded. Optimized recursive factorial algorithm. Complexity reduced from O(2^N) to O(N).'
      } else if (cap.includes('search') || cap.includes('rag')) {
        runResult = '[RAG Search Output] Succeeded. Retrieved 3 sources on Arc blockchain. Compiled summary: Arc utilizes USDC gas and sub-second transaction finality.'
      } else if (cap.includes('audio') || cap.includes('transcription')) {
        runResult = '[Whisper Output] Succeeded. Translated audio input: "Stablecoins are the base layer of the new AI-to-AI economy."'
      } else {
        runResult = `[Output] Executed job for ${service.name} successfully. Completed at ${new Date().toLocaleTimeString()}.`
      }

      // 7. Save to local Gateway history as spend item
      if (typeof window !== 'undefined') {
        const histKey = `gateway_hist_${address.toLowerCase()}`
        const currentHist = JSON.parse(localStorage.getItem(histKey) || '[]')
        currentHist.unshift({
          type: 'spend',
          amount: service.pricing.toString(),
          description: `x402 Pay-per-Request: ${service.name}`,
          timestamp: Date.now() / 1000,
          settled: true
        })
        localStorage.setItem(histKey, JSON.stringify(currentHist))
        window.dispatchEvent(new Event('storage'))
      }

      return {
        success: true,
        result: runResult,
        proof: settleRes.proof
      }
    } catch (err: any) {
      return { success: true, error: err.message || 'Error processing service call' }
    }
  }

  return {
    services,
    searchQuery,
    setSearchQuery,
    minReputation,
    setMinReputation,
    isLoading,
    isRegistering,
    recentPayments,
    registerService,
    payAndRunService,
    refreshServices: fetchServices
  }
}
