'use client'

import { useState, useEffect, useCallback } from 'react'
import { createWalletClient, custom, http, getAddress, keccak256, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import { CircleModularWalletHelper, PasskeyCredential } from '@/lib/modular-wallet'

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
})

interface UseModularWalletProps {
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

export function useModularWallet({ addActivity }: UseModularWalletProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [username, setUsername] = useState<string | null>(null)
  const [scaAddress, setScaAddress] = useState<string | null>(null)
  const [isModularConnected, setIsModularConnected] = useState<boolean>(false)
  const [credential, setCredential] = useState<PasskeyCredential | null>(null)
  const [walletClient, setWalletClient] = useState<any>(null)
  const [isGaslessSponsoring, setIsGaslessSponsoring] = useState<boolean>(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('inferpay_mw_username')
    const savedSca = localStorage.getItem('inferpay_mw_sca')
    const savedCred = localStorage.getItem('inferpay_mw_cred')

    if (savedUser && savedSca && savedCred) {
      try {
        const cred = JSON.parse(savedCred)
        setUsername(savedUser)
        setScaAddress(savedSca)
        setCredential(cred)
        setIsModularConnected(true)

        // Reconstruct wallet client from saved credential
        const privateKey = keccak256(toHex(cred.id)) as `0x${string}`
        const account = privateKeyToAccount(privateKey)
        const client = createWalletClient({
          account,
          chain: arcTestnet,
          transport: http('https://rpc.testnet.arc.network'),
        })
        setWalletClient(client)
      } catch (e) {
        console.error('Failed to parse saved modular wallet credential:', e)
      }
    }
  }, [])

  const registerWallet = useCallback(async (user: string) => {
    setLoading(true)
    addActivity('Creating Passkey', `Initiating WebAuthn registration for ${user}...`, 'key', 'info')
    
    try {
      const cred = await CircleModularWalletHelper.registerPasskey(user)
      
      // Derive deterministic key from credential ID
      const privateKey = keccak256(toHex(cred.id)) as `0x${string}`
      const account = privateKeyToAccount(privateKey)
      const derivedAddress = account.address

      // We use the derived address as the SCA address
      cred.scaAddress = derivedAddress

      setUsername(user)
      setScaAddress(derivedAddress)
      setCredential(cred)
      setIsModularConnected(true)

      const client = createWalletClient({
        account,
        chain: arcTestnet,
        transport: http('https://rpc.testnet.arc.network'),
      })
      setWalletClient(client)

      // Save to localStorage
      localStorage.setItem('inferpay_mw_username', user)
      localStorage.setItem('inferpay_mw_sca', derivedAddress)
      localStorage.setItem('inferpay_mw_cred', JSON.stringify(cred))

      addActivity('Passkey Created', 'Device secure enclave registration successful.', 'party', 'success')

      // Gas Station Sponsorship Trigger
      setIsGaslessSponsoring(true)
      addActivity('Gas Station', 'Requesting gas fee sponsorship for your new smart account...', 'lightning', 'info')

      const res = await fetch('/api/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAddress: derivedAddress }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        addActivity('Gas Sponsored', 'Circle Gas Station funded your wallet with 0.05 USDC for gas.', 'lightning', 'success')
      } else {
        console.warn('Gas sponsorship fallback:', data.error)
      }

      setIsGaslessSponsoring(false)
      setLoading(false)
      return { success: true, address: derivedAddress, walletClient: client }
    } catch (err: any) {
      console.error(err)
      addActivity('Passkey Failed', err.message || 'Passkey creation failed', 'cross', 'danger')
      setIsGaslessSponsoring(false)
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [addActivity])

  const loginWallet = useCallback(async (user: string) => {
    setLoading(true)
    addActivity('Passkey Login', `Requesting WebAuthn signature for ${user}...`, 'key', 'info')

    try {
      const savedCredStr = localStorage.getItem('inferpay_mw_cred')
      let savedCred: PasskeyCredential | undefined
      if (savedCredStr) {
        const parsed = JSON.parse(savedCredStr)
        if (parsed.username === user) {
          savedCred = parsed
        }
      }

      const cred = await CircleModularWalletHelper.loginPasskey(user, savedCred?.id)

      // Derive deterministic key from credential ID
      const privateKey = keccak256(toHex(cred.id)) as `0x${string}`
      const account = privateKeyToAccount(privateKey)
      const derivedAddress = account.address

      cred.scaAddress = derivedAddress

      setUsername(user)
      setScaAddress(derivedAddress)
      setCredential(cred)
      setIsModularConnected(true)

      const client = createWalletClient({
        account,
        chain: arcTestnet,
        transport: http('https://rpc.testnet.arc.network'),
      })
      setWalletClient(client)

      // Save to localStorage
      localStorage.setItem('inferpay_mw_username', user)
      localStorage.setItem('inferpay_mw_sca', derivedAddress)
      localStorage.setItem('inferpay_mw_cred', JSON.stringify(cred))

      addActivity('Passkey Authenticated', `Welcome back, ${user}!`, 'party', 'success')
      setLoading(false)
      return { success: true, address: derivedAddress, walletClient: client }
    } catch (err: any) {
      console.error(err)
      addActivity('Login Failed', err.message || 'Passkey authentication failed', 'cross', 'danger')
      setLoading(false)
      return { success: false, error: err.message }
    }
  }, [addActivity])

  const disconnectWallet = useCallback(() => {
    setUsername(null)
    setScaAddress(null)
    setCredential(null)
    setIsModularConnected(false)
    setWalletClient(null)

    localStorage.removeItem('inferpay_mw_username')
    localStorage.removeItem('inferpay_mw_sca')
    localStorage.removeItem('inferpay_mw_cred')

    addActivity('Passkey Disconnected', 'Logged out of Smart Contract Account.', 'info', 'info')
  }, [addActivity])

  return {
    loading,
    username,
    scaAddress,
    isModularConnected,
    walletClient,
    isGaslessSponsoring,
    registerWallet,
    loginWallet,
    disconnectWallet,
  }
}
