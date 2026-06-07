import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '../lib/web3-provider'
import { BRIDGE_CHAINS, ChainConfig } from '../lib/bridge-config'
import { parseUnits, formatUnits } from 'viem'

export type BridgeStep = 'approve' | 'burn' | 'attest' | 'mint' | 'complete'

export interface UnifiedBalances {
  ethereum_sepolia: string
  base_sepolia: string
  arc_testnet: string
}

export function useBridge() {
  const { isConnected, address, publicClient, walletClient } = useWeb3()
  
  const [sourceChain, setSourceChain] = useState<keyof typeof BRIDGE_CHAINS>('ethereum_sepolia')
  const [amount, setAmount] = useState('10')
  const [balances, setBalances] = useState<UnifiedBalances>({
    ethereum_sepolia: '100.00',
    base_sepolia: '50.00',
    arc_testnet: '0.00',
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [currentStep, setCurrentStep] = useState<BridgeStep>('approve')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Progress Tx hashes
  const [txHashes, setTxHashes] = useState<Record<string, string>>({})
  
  // Simulation switches (we simulate CCTP steps realistically with block confirmations)
  const [timeRemaining, setTimeRemaining] = useState<number>(0) // seconds remaining

  // Fetch / initialize balances from local storage to keep state persistent
  const refreshBalances = useCallback(async () => {
    if (!address) return
    
    let arcBal = '0.00'
    try {
      // Try fetching real Arc Testnet USDC balance
      const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'
      const abi = [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        },
      ] as const

      if (!publicClient) throw new Error('No public client available')
      const res = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      })
      arcBal = Number(formatUnits(BigInt(res), 6)).toFixed(2)
    } catch {
      // Fallback to local storage for Arc USDC
      arcBal = localStorage.getItem(`sim_usdc_${address.toLowerCase()}`) || '0.00'
    }

    const ethBal = localStorage.getItem(`eth_sepolia_usdc_${address.toLowerCase()}`) || '150.00'
    const baseBal = localStorage.getItem(`base_sepolia_usdc_${address.toLowerCase()}`) || '80.00'

    // Save defaults if not set
    if (!localStorage.getItem(`eth_sepolia_usdc_${address.toLowerCase()}`)) {
      localStorage.setItem(`eth_sepolia_usdc_${address.toLowerCase()}`, ethBal)
    }
    if (!localStorage.getItem(`base_sepolia_usdc_${address.toLowerCase()}`)) {
      localStorage.setItem(`base_sepolia_usdc_${address.toLowerCase()}`, baseBal)
    }

    setBalances({
      ethereum_sepolia: ethBal,
      base_sepolia: baseBal,
      arc_testnet: arcBal,
    })
  }, [address, publicClient])

  useEffect(() => {
    if (isConnected && address) {
      refreshBalances()
    }
  }, [isConnected, address, refreshBalances])

  // Executes a CCTP Bridge step
  const executeBridgeStep = async (step: BridgeStep, bridgeAmount: string) => {
    if (!address) return false
    
    const amountVal = parseFloat(bridgeAmount)
    const sourceKey = `eth_sepolia_usdc_${address.toLowerCase()}`
    const baseKey = `base_sepolia_usdc_${address.toLowerCase()}`
    const activeKey = sourceChain === 'ethereum_sepolia' ? sourceKey : baseKey
    
    switch (step) {
      case 'approve':
        setCurrentStep('approve')
        setStatus('loading')
        setTimeRemaining(10)
        
        // Simulate EVM approval transaction
        await new Promise((resolve) => setTimeout(resolve, 3000))
        
        // Check for mock failure (e.g. if amount is 999 to test error recovery)
        if (amountVal === 999) {
          setErrorMessage('User rejected approval transaction signature.')
          setStatus('error')
          return false
        }
        
        const approveHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        setTxHashes((prev) => ({ ...prev, approve: approveHash }))
        return true

      case 'burn':
        setCurrentStep('burn')
        setStatus('loading')
        setTimeRemaining(7)
        
        // Simulate EVM depositForBurn execution
        await new Promise((resolve) => setTimeout(resolve, 3000))
        
        const currentSourceBal = parseFloat(localStorage.getItem(activeKey) || '0')
        if (currentSourceBal < amountVal) {
          setErrorMessage('Insufficient balance on source chain for CCTP burn.')
          setStatus('error')
          return false
        }

        // Deduct source chain balance
        const nextSourceBal = (currentSourceBal - amountVal).toFixed(2)
        localStorage.setItem(activeKey, nextSourceBal)
        
        const burnHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        setTxHashes((prev) => ({ ...prev, burn: burnHash }))
        await refreshBalances()
        return true

      case 'attest':
        setCurrentStep('attest')
        setStatus('loading')
        setTimeRemaining(15) // Attestations take longer
        
        // Simulate polling Circle Attestation API
        for (let i = 0; i < 4; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
          setTimeRemaining((prev) => Math.max(0, prev - 3))
        }

        // Test error mock recovery helper
        if (amountVal === 500) {
          setErrorMessage('Circle Attestation API timeout. Request timed out.')
          setStatus('error')
          return false
        }

        const attestHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        setTxHashes((prev) => ({ ...prev, attest: attestHash }))
        return true

      case 'mint':
        setCurrentStep('mint')
        setStatus('loading')
        setTimeRemaining(5)
        
        // Simulate mint on Arc Testnet
        await new Promise((resolve) => setTimeout(resolve, 2500))
        
        // Add to Arc balance locally
        let arcBalKey = `sim_usdc_${address.toLowerCase()}`
        const currentArcBal = parseFloat(localStorage.getItem(arcBalKey) || '0')
        const nextArcBal = (currentArcBal + amountVal).toFixed(2)
        localStorage.setItem(arcBalKey, nextArcBal)
        
        const mintHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        setTxHashes((prev) => ({ ...prev, mint: mintHash }))
        
        await refreshBalances()
        return true

      default:
        return false
    }
  }

  // Orchestrates full CCTP bridging flow
  const startBridge = async (bridgeAmount: string) => {
    setErrorMessage('')
    setTxHashes({})
    
    // Step 1: Approve
    let ok = await executeBridgeStep('approve', bridgeAmount)
    if (!ok) return

    // Step 2: Burn
    ok = await executeBridgeStep('burn', bridgeAmount)
    if (!ok) return

    // Step 3: Attest
    ok = await executeBridgeStep('attest', bridgeAmount)
    if (!ok) return

    // Step 4: Mint
    ok = await executeBridgeStep('mint', bridgeAmount)
    if (!ok) return

    setCurrentStep('complete')
    setStatus('success')
  }

  // Resume or retry from the failed step to provide error recovery
  const retryBridge = async (bridgeAmount: string) => {
    setErrorMessage('')
    setStatus('loading')
    
    let ok = false
    const stepsList: BridgeStep[] = ['approve', 'burn', 'attest', 'mint']
    const startIndex = stepsList.indexOf(currentStep)
    
    for (let i = startIndex; i < stepsList.length; i++) {
      ok = await executeBridgeStep(stepsList[i], bridgeAmount)
      if (!ok) return
    }
    
    setCurrentStep('complete')
    setStatus('success')
  }

  return {
    sourceChain,
    setSourceChain,
    amount,
    setAmount,
    balances,
    status,
    currentStep,
    errorMessage,
    txHashes,
    timeRemaining,
    startBridge,
    retryBridge,
    refreshBalances,
  }
}
