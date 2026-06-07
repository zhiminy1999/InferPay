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
  connect: () => Promise<void> // connects MetaMask by default
  connectMetaMask: () => Promise<void>
  connectPasskey: (scaAddress: string, clientInstance: any) => void
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  address: null,
  publicClient: null,
  walletClient: null,
  walletType: null,
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

  useEffect(() => {
    const client = createPublicClient({
      chain: arcTestnet,
      transport: http()
    })
    setPublicClient(client)
    
    const storedType = localStorage.getItem('inferpay_wallet_type') as 'metamask' | 'passkey' | null
    const storedAddress = localStorage.getItem('inferpay_connected')
    
    if (storedAddress && storedType) {
      setAddress(storedAddress)
      setWalletType(storedType)
      setIsConnected(true)
      
      // If MetaMask was connected, we re-instantiate its client
      if (storedType === 'metamask') {
        const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null
        if (ethereum) {
          const wClient = createWalletClient({
            chain: arcTestnet,
            transport: custom(ethereum)
          })
          setWalletClient(wClient)
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
              transport: http('https://rpc.testnet.arc.network')
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
    const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null
    if (ethereum) {
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
        if (accounts.length > 0) {
          const client = createWalletClient({
            chain: arcTestnet,
            transport: custom(ethereum)
          })
          
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${arcTestnet.id.toString(16)}` }],
            })
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${arcTestnet.id.toString(16)}`,
                  chainName: arcTestnet.name,
                  nativeCurrency: arcTestnet.nativeCurrency,
                  rpcUrls: arcTestnet.rpcUrls.default.http,
                  blockExplorerUrls: [arcTestnet.blockExplorers.default.url],
                }],
              })
            }
          }

          setWalletClient(client)
          setAddress(accounts[0])
          setWalletType('metamask')
          setIsConnected(true)
          localStorage.setItem('inferpay_connected', accounts[0])
          localStorage.setItem('inferpay_wallet_type', 'metamask')
        }
      } catch (err) {
        console.error("Failed to connect MetaMask:", err)
      }
    } else {
      alert("Please install MetaMask or a Web3 wallet.")
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
