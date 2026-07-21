'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createPublicClient, createWalletClient, custom, http, type WalletClient, type PublicClient, keccak256, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { arcTestnet } from './arc-config'

interface Web3ContextType {
  isConnected: boolean
  address: string | null
  publicClient: PublicClient | null
  walletClient: WalletClient | null
  walletType: 'metamask' | 'passkey' | null
  provider: any | null
  connect: () => Promise<void> // connects MetaMask by default
  connectMetaMask: () => Promise<void>
  connectPasskey: (scaAddress: string, clientInstance: any) => void
  disconnect: () => void
}

function getMetaMaskProvider() {
  if (typeof window === 'undefined') return null
  const anyWindow = window as any
  const ethereum = anyWindow.ethereum
  if (!ethereum) return null

  // Handle case where multiple providers are injected (e.g. MetaMask + Phantom/Coinbase)
  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask)
    if (metaMaskProvider) return metaMaskProvider
  }

  // Fallback to window.ethereum if it is MetaMask
  if (ethereum.isMetaMask) return ethereum

  return ethereum
}

function getPhantomProvider() {
  if (typeof window === 'undefined') return null
  const anyWindow = window as any
  
  // Direct Phantom EVM provider to bypass extension selection screen (evmAsk.js Router)
  if (anyWindow.phantom?.ethereum) {
    return anyWindow.phantom.ethereum
  }
  
  const ethereum = anyWindow.ethereum
  if (ethereum && (ethereum.isPhantom || anyWindow.phantom)) {
    return ethereum
  }
  
  return null
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  address: null,
  publicClient: null,
  walletClient: null,
  walletType: null,
  provider: null,
  connect: async () => {},
  connectMetaMask: async () => {},
  connectPasskey: () => {},
  disconnect: () => {},
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null)
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [walletType, setWalletType] = useState<'metamask' | 'passkey' | null>(null)
  const [provider, setProvider] = useState<any | null>(null)

  useEffect(() => {
    const client = createPublicClient({
      chain: arcTestnet,
      transport: http('/api/rpc')
    })
    setPublicClient(client)
    
    const storedType = localStorage.getItem('inferpay_wallet_type') as 'metamask' | 'passkey' | null
    const storedAddress = localStorage.getItem('inferpay_connected')
    
    if (storedAddress && storedType) {
      setAddress(storedAddress)
      setWalletType(storedType)
      setIsConnected(true)
      
      // If MetaMask/Web3 was connected, we re-instantiate its client
      if (storedType === 'metamask') {
        let activeProvider = getMetaMaskProvider()
        const phantomProvider = getPhantomProvider()
        if (phantomProvider) {
          const hasMetaMask = activeProvider && (activeProvider.isMetaMask && !activeProvider.isPhantom)
          if (!hasMetaMask) {
            activeProvider = phantomProvider
          }
        }

        if (activeProvider) {
          const wClient = createWalletClient({
            chain: arcTestnet,
            transport: custom(activeProvider)
          })
          setWalletClient(wClient)
          setProvider(activeProvider)
        }
      } else if (storedType === 'passkey') {
        const savedCred = localStorage.getItem('inferpay_mw_cred')
        if (savedCred) {
          try {
            const cred = JSON.parse(savedCred)
            const privateKey = keccak256(toHex(cred.id)) as `0x${string}`
            const account = privateKeyToAccount(privateKey)
            const wClient = createWalletClient({
              account,
              chain: arcTestnet,
              transport: http('/api/rpc')
            })
            setWalletClient(wClient)
          } catch (e) {
            console.error('Failed to restore passkey wallet client:', e)
          }
        }
      }
    }
  }, [])

  const connectMetaMask = async () => {
    let activeProvider = getMetaMaskProvider()
    const phantomProvider = getPhantomProvider()
    if (phantomProvider) {
      const hasMetaMask = activeProvider && (activeProvider.isMetaMask && !activeProvider.isPhantom)
      if (!hasMetaMask) {
        activeProvider = phantomProvider
      }
    }

    if (activeProvider) {
      try {
        const accounts = await activeProvider.request({ method: 'eth_requestAccounts' }) as string[]
        if (accounts.length > 0) {
          const client = createWalletClient({
            chain: arcTestnet,
            transport: custom(activeProvider)
          })
          
          try {
            await activeProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${arcTestnet.id.toString(16)}` }],
            })
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              let customRpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'
              if (customRpcUrl.startsWith('NEXT_PUBLIC_ARC_RPC_URL=')) {
                customRpcUrl = customRpcUrl.replace('NEXT_PUBLIC_ARC_RPC_URL=', '')
              }
              const absoluteProxyUrl = window.location.origin + '/api/rpc'
              const finalRpcs = [absoluteProxyUrl, customRpcUrl, ...arcTestnet.rpcUrls.default.http.filter(url => url !== customRpcUrl)]
              await activeProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${arcTestnet.id.toString(16)}`,
                  chainName: arcTestnet.name,
                  nativeCurrency: arcTestnet.nativeCurrency,
                  rpcUrls: finalRpcs,
                  blockExplorerUrls: [arcTestnet.blockExplorers.default.url],
                }],
              })
            }
          }

          setWalletClient(client)
          setProvider(activeProvider)
          setAddress(accounts[0])
          setWalletType('metamask')
          setIsConnected(true)
          localStorage.setItem('inferpay_connected', accounts[0])
          localStorage.setItem('inferpay_wallet_type', 'metamask')
        }
      } catch (err: any) {
        console.error("Failed to connect MetaMask/Web3 wallet:", err)
        alert(`Failed to connect wallet: ${err.message || 'Unknown error'}. Please verify your extension is unlocked and try again.`)
      }
    } else {
      alert("Please install MetaMask, Phantom, or a Web3 wallet.")
    }
  }

  const connectPasskey = (scaAddress: string, clientInstance: any) => {
    setAddress(scaAddress)
    setWalletClient(clientInstance)
    setWalletType('passkey')
    setIsConnected(true)
    localStorage.setItem('inferpay_connected', scaAddress)
    localStorage.setItem('inferpay_wallet_type', 'passkey')
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setWalletClient(null)
    setWalletType(null)
    setProvider(null)
    localStorage.removeItem('inferpay_connected')
    localStorage.removeItem('inferpay_wallet_type')
  }

  return (
    <Web3Context.Provider value={{
      isConnected,
      address,
      publicClient,
      walletClient,
      walletType,
      provider,
      connect: connectMetaMask,
      connectMetaMask,
      connectPasskey,
      disconnect
    }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)
