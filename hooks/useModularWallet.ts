'use client'

import { useState, useEffect, useCallback } from 'react'
import { createWalletClient, custom, http, getAddress, keccak256, toHex, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'
import { CircleModularWalletHelper, PasskeyCredential } from '@/lib/modular-wallet'
import {
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
  WebAuthnMode
} from '@circle-fin/modular-wallets-core'
import { toWebAuthnAccount } from 'viem/account-abstraction'

const customRpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [customRpcUrl] },
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
          transport: http(customRpcUrl),
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
      let cred: any
      let derivedAddress = ''
      
      try {
        addActivity('Circle SDK', 'Initializing Circle Passkey Transport...', 'key', 'info')
        const clientKey = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || 'TEST_CLIENT_KEY:7313d7ebea6caf047933111f3b96e392:020a95a91b12365acedee37a8102d4b0'
        const clientUrl = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL || 'https://api.circle.com/v1/w3s'

        const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)
        const modularTransport = toModularTransport(`${clientUrl}/arcTestnet`, clientKey)
        
        const publicClient = createPublicClient({
          chain: arcTestnet,
          transport: modularTransport,
        })

        addActivity('Circle SDK', 'Calling Circle toWebAuthnCredential...', 'key', 'info')
        const sdkCred = await toWebAuthnCredential({
          transport: passkeyTransport,
          mode: WebAuthnMode.Register,
          username: user,
        })
        
        addActivity('Circle SDK', 'Deriving Smart Account via toCircleSmartAccount...', 'key', 'info')
        const owner = toWebAuthnAccount({ credential: sdkCred as any })
        const account = await toCircleSmartAccount({
          client: publicClient,
          owner: owner as any,
          name: user,
        })
        
        derivedAddress = account.address
        const sdkCredAny = sdkCred as any
        cred = {
          id: sdkCredAny.id,
          rawId: sdkCredAny.raw || sdkCredAny.rawId || sdkCredAny.id,
          type: sdkCredAny.type || 'public-key',
          username: user,
          scaAddress: account.address
        }
        addActivity('Circle SDK', 'Circle Smart Account created successfully!', 'key', 'success')
      } catch (sdkErr: any) {
        console.warn('Circle Modular Wallet SDK registration failed, using local secure vault fallback:', sdkErr)
        addActivity('Circle SDK Fallback', 'WebAuthn domain security error or cancelled. Using local secure vault fallback...', 'key', 'warning')
        cred = await CircleModularWalletHelper.registerPasskey(user)
        derivedAddress = cred.scaAddress
      }

      // Derive deterministic key from credential ID
      const privateKey = keccak256(toHex(cred.id)) as `0x${string}`
      const accountObj = privateKeyToAccount(privateKey)

      setUsername(user)
      setScaAddress(derivedAddress)
      setCredential(cred)
      setIsModularConnected(true)

      const client = createWalletClient({
        account: accountObj,
        chain: arcTestnet,
        transport: http(customRpcUrl),
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

      let cred: any
      let derivedAddress = ''

      try {
        addActivity('Circle SDK', 'Initializing Circle Passkey Transport...', 'key', 'info')
        const clientKey = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || 'TEST_CLIENT_KEY:7313d7ebea6caf047933111f3b96e392:020a95a91b12365acedee37a8102d4b0'
        const clientUrl = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL || 'https://api.circle.com/v1/w3s'

        const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)
        const modularTransport = toModularTransport(`${clientUrl}/arcTestnet`, clientKey)
        
        const publicClient = createPublicClient({
          chain: arcTestnet,
          transport: modularTransport,
        })

        addActivity('Circle SDK', 'Authenticating via toWebAuthnCredential...', 'key', 'info')
        const sdkCred = await toWebAuthnCredential({
          transport: passkeyTransport,
          mode: WebAuthnMode.Login,
        })
        
        addActivity('Circle SDK', 'Restoring Smart Account via toCircleSmartAccount...', 'key', 'info')
        const owner = toWebAuthnAccount({ credential: sdkCred as any })
        const account = await toCircleSmartAccount({
          client: publicClient,
          owner: owner as any,
          name: user,
        })
        
        derivedAddress = account.address
        const sdkCredAny = sdkCred as any
        cred = {
          id: sdkCredAny.id,
          rawId: sdkCredAny.raw || sdkCredAny.rawId || sdkCredAny.id,
          type: sdkCredAny.type || 'public-key',
          username: user,
          scaAddress: account.address
        }
        addActivity('Circle SDK', 'Circle Modular Wallet authenticated!', 'key', 'success')
      } catch (sdkErr: any) {
        console.warn('Circle Modular Wallet SDK login failed, using local secure vault fallback:', sdkErr)
        addActivity('Circle SDK Fallback', 'Using local secure vault credentials.', 'key', 'warning')
        cred = await CircleModularWalletHelper.loginPasskey(user, savedCred?.id)
        derivedAddress = cred.scaAddress
      }

      // Derive deterministic key from credential ID
      const privateKey = keccak256(toHex(cred.id)) as `0x${string}`
      const accountObj = privateKeyToAccount(privateKey)

      setUsername(user)
      setScaAddress(derivedAddress)
      setCredential(cred)
      setIsModularConnected(true)

      const client = createWalletClient({
        account: accountObj,
        chain: arcTestnet,
        transport: http(customRpcUrl),
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
