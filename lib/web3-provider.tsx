'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createPublicClient, createWalletClient, custom, http, type WalletClient, type PublicClient } from 'viem'
import { arcTestnet } from './arc-config'

interface Web3ContextType {
  isConnected: boolean
  address: string | null
  publicClient: PublicClient | null
  walletClient: WalletClient | null
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  address: null,
  publicClient: null,
  walletClient: null,
  connect: async () => {},
  disconnect: () => {},
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null)
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  useEffect(() => {
    const client = createPublicClient({
      chain: arcTestnet,
      transport: http()
    })
    setPublicClient(client)
    
    const stored = localStorage.getItem('inferpay_connected')
    if (stored) {
      setAddress(stored)
      setIsConnected(true)
    }
  }, [])

  const connect = async () => {
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
          setIsConnected(true)
          localStorage.setItem('inferpay_connected', accounts[0])
        }
      } catch (err) {
        console.error("Failed to connect wallet:", err)
      }
    } else {
      alert("Please install MetaMask or a Web3 wallet.")
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setWalletClient(null)
    localStorage.removeItem('inferpay_connected')
  }

  return (
    <Web3Context.Provider value={{ isConnected, address, publicClient, walletClient, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)
