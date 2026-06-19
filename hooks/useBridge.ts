import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '../lib/web3-provider'
import { BRIDGE_CHAINS, ChainConfig, CCTP_CONFIG } from '../lib/bridge-config'
import {
  parseUnits,
  formatUnits,
  createPublicClient,
  createWalletClient,
  http,
  pad,
  decodeEventLog,
  keccak256,
  toHex,
  getAddress
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia, baseSepolia } from 'viem/chains'
import { arcTestnet } from '../lib/arc-config'

function safeAddress(addr: string | null | undefined): `0x${string}` {
  if (!addr) return '0x0000000000000000000000000000000000000000'
  return getAddress(addr.toLowerCase().trim())
}

export type BridgeStep = 'approve' | 'burn' | 'attest' | 'mint' | 'complete'

export interface UnifiedBalances {
  ethereum_sepolia: string
  base_sepolia: string
  arc_testnet: string
}

export function useBridge() {
  const { isConnected, address, publicClient, walletClient, walletType, provider } = useWeb3()
  
  const [sourceChain, setSourceChain] = useState<keyof typeof BRIDGE_CHAINS>('ethereum_sepolia')
  const [amount, setAmount] = useState('10')
  const [balances, setBalances] = useState<UnifiedBalances>({
    ethereum_sepolia: '0.00',
    base_sepolia: '0.00',
    arc_testnet: '0.00',
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [currentStep, setCurrentStep] = useState<BridgeStep>('approve')
  const [errorMessage, setErrorMessage] = useState('')
  
  // Progress Tx hashes
  const [txHashes, setTxHashes] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0) // seconds remaining

  // Fetch real on-chain stablecoin balances for Ethereum Sepolia, Base Sepolia, and Arc Testnet
  const refreshBalances = useCallback(async () => {
    if (!address) return
    
    let arcBal = '0.00'
    try {
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

      const client = createPublicClient({
        chain: arcTestnet,
        transport: http(BRIDGE_CHAINS.arc_testnet.rpcUrl)
      })
      const res = await client.readContract({
        address: safeAddress(USDC_ADDRESS),
        abi,
        functionName: 'balanceOf',
        args: [safeAddress(address)],
      })
      arcBal = Number(formatUnits(BigInt(res), 6)).toFixed(2)
      localStorage.setItem(`cached_arc_usdc_${address.toLowerCase()}`, arcBal)
    } catch (err) {
      console.error('Failed to fetch Arc Testnet USDC balance:', err)
      arcBal = localStorage.getItem(`cached_arc_usdc_${address.toLowerCase()}`) || '0.00'
    }

    let ethBal = '0.00'
    try {
      const ETH_USDC = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
      const abi = [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        },
      ] as const

      const client = createPublicClient({
        chain: sepolia,
        transport: http(BRIDGE_CHAINS.ethereum_sepolia.rpcUrl)
      })
      const res = await client.readContract({
        address: safeAddress(ETH_USDC),
        abi,
        functionName: 'balanceOf',
        args: [safeAddress(address)],
      })
      ethBal = Number(formatUnits(BigInt(res), 6)).toFixed(2)
      localStorage.setItem(`eth_sepolia_usdc_${address.toLowerCase()}`, ethBal)
    } catch (err) {
      console.error('Failed to fetch Ethereum Sepolia USDC balance:', err)
      ethBal = localStorage.getItem(`eth_sepolia_usdc_${address.toLowerCase()}`) || '0.00'
    }

    let baseBal = '0.00'
    try {
      const BASE_USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
      const abi = [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        },
      ] as const

      const client = createPublicClient({
        chain: baseSepolia,
        transport: http(BRIDGE_CHAINS.base_sepolia.rpcUrl)
      })
      const res = await client.readContract({
        address: safeAddress(BASE_USDC),
        abi,
        functionName: 'balanceOf',
        args: [safeAddress(address)],
      })
      baseBal = Number(formatUnits(BigInt(res), 6)).toFixed(2)
      localStorage.setItem(`base_sepolia_usdc_${address.toLowerCase()}`, baseBal)
    } catch (err) {
      console.error('Failed to fetch Base Sepolia USDC balance:', err)
      baseBal = localStorage.getItem(`base_sepolia_usdc_${address.toLowerCase()}`) || '0.00'
    }

    setBalances({
      ethereum_sepolia: ethBal,
      base_sepolia: baseBal,
      arc_testnet: arcBal,
    })
  }, [address])

  useEffect(() => {
    if (isConnected && address) {
      refreshBalances()
    }
  }, [isConnected, address, refreshBalances])

  // Executes a single on-chain CCTP Bridge step
  const executeBridgeStep = async (step: BridgeStep, bridgeAmount: string) => {
    if (!address) throw new Error('Wallet not connected')
    
    const amountRaw = parseUnits(bridgeAmount, 6)
    const sourceChainConfig = BRIDGE_CHAINS[sourceChain]
    const sourceChainId = sourceChainConfig.chainId
    
    // Instantiate proper WalletClient for browser wallets (MetaMask) or custom private-key-based wallets (Passkey)
    let sourceWalletClient = walletClient
    let destWalletClient = walletClient

    if (walletType === 'passkey') {
      const savedCred = localStorage.getItem('inferpay_mw_cred')
      if (savedCred) {
        const cred = JSON.parse(savedCred)
        const privateKey = keccak256(toHex(cred.id)) as `0x${string}`
        const account = privateKeyToAccount(privateKey)
        
        const sourceChainViem = sourceChain === 'ethereum_sepolia' ? sepolia : baseSepolia
        sourceWalletClient = createWalletClient({
          account,
          chain: sourceChainViem,
          transport: http(sourceChainConfig.rpcUrl)
        })
        
        destWalletClient = createWalletClient({
          account,
          chain: arcTestnet,
          transport: http(BRIDGE_CHAINS.arc_testnet.rpcUrl)
        })
      }
    }

    if (!sourceWalletClient || !destWalletClient) {
      throw new Error('Web3 wallet clients not initialized.')
    }

    switch (step) {
      case 'approve': {
        setCurrentStep('approve')
        setStatus('loading')
        
        // Handle chain switching for MetaMask/Web3 users using the active provider
        if (walletType === 'metamask') {
          const ethereum = provider
          if (ethereum) {
            try {
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${sourceChainId.toString(16)}` }],
              })
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: `0x${sourceChainId.toString(16)}`,
                    chainName: sourceChainConfig.name,
                    rpcUrls: [sourceChainConfig.rpcUrl],
                    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                    blockExplorerUrls: [sourceChainConfig.explorerUrl],
                  }],
                })
              } else {
                throw switchError
              }
            }
            
            // Suggest importing the USDC token to MetaMask so it renders the symbol and decimals correctly
            try {
              await ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                  type: 'ERC20',
                  options: {
                    address: safeAddress(sourceChainConfig.usdcAddress),
                    symbol: 'USDC',
                    decimals: 6,
                    image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
                  },
                },
              })
            } catch (watchErr) {
              console.warn('Failed to watch USDC asset:', watchErr)
            }
          }
        }

        const sourcePublicClient = createPublicClient({
          chain: sourceChain === 'ethereum_sepolia' ? sepolia : baseSepolia,
          transport: http(sourceChainConfig.rpcUrl),
        })

        const erc20Abi = [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ] as const

        const approveTx = await sourceWalletClient.writeContract({
          address: safeAddress(sourceChainConfig.usdcAddress),
          abi: erc20Abi,
          functionName: 'approve',
          args: [safeAddress(CCTP_CONFIG[sourceChain as keyof typeof CCTP_CONFIG].tokenMessenger), amountRaw],
          account: safeAddress(address),
          chain: null as any
        })

        setTxHashes((prev) => ({ ...prev, approve: approveTx }))
        
        // Wait for approval confirmation
        await sourcePublicClient.waitForTransactionReceipt({ hash: approveTx })
        return true
      }

      case 'burn': {
        setCurrentStep('burn')
        setStatus('loading')
        
        if (walletType === 'metamask') {
          const ethereum = provider
          if (ethereum) {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${sourceChainId.toString(16)}` }],
            })
          }
        }

        const sourcePublicClient = createPublicClient({
          chain: sourceChain === 'ethereum_sepolia' ? sepolia : baseSepolia,
          transport: http(sourceChainConfig.rpcUrl),
        })

        const tokenMessengerAbi = [
          {
            name: 'depositForBurn',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'amount', type: 'uint256' },
              { name: 'destinationDomain', type: 'uint32' },
              { name: 'mintRecipient', type: 'bytes32' },
              { name: 'burnToken', type: 'address' },
            ],
            outputs: [{ name: '', type: 'uint64' }],
          },
        ] as const

        const mintRecipient = pad(safeAddress(address), { size: 32 })
        // CCTP Domain for Arc Testnet is 26
        const burnTx = await sourceWalletClient.writeContract({
          address: safeAddress(CCTP_CONFIG[sourceChain as keyof typeof CCTP_CONFIG].tokenMessenger),
          abi: tokenMessengerAbi,
          functionName: 'depositForBurn',
          args: [amountRaw, 26, mintRecipient, safeAddress(sourceChainConfig.usdcAddress)],
          account: safeAddress(address),
          chain: null as any
        })

        setTxHashes((prev) => ({ ...prev, burn: burnTx }))
        const receipt = await sourcePublicClient.waitForTransactionReceipt({ hash: burnTx })

        // Extract message bytes from receipt logs using decodeEventLog
        let messageHex: string | null = null
        const messageSentAbi = {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'bytes',
              name: 'message',
              type: 'bytes',
            },
          ],
          name: 'MessageSent',
          type: 'event',
        } as const

        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: [messageSentAbi],
              eventName: 'MessageSent',
              topics: log.topics,
              data: log.data,
            })
            if (decoded.args.message) {
              messageHex = decoded.args.message
              break
            }
          } catch {
            // ignore non-matching logs
          }
        }

        if (!messageHex) {
          throw new Error('MessageSent event not found in CCTP burn transaction logs.')
        }

        localStorage.setItem(`cctp_message_${address.toLowerCase()}`, messageHex)
        await refreshBalances()
        return true
      }

      case 'attest': {
        setCurrentStep('attest')
        setStatus('loading')
        
        const messageHex = localStorage.getItem(`cctp_message_${address.toLowerCase()}`)
        if (!messageHex) {
          throw new Error('Missing CCTP message. Please retry burn step or check your transaction.')
        }

        const messageHash = keccak256(messageHex as `0x${string}`)
        
        // Poll Circle Attestation API
        let attestationHex: string | null = null
        const maxAttempts = 60 // 2 minutes maximum
        for (let i = 0; i < maxAttempts; i++) {
          try {
            setTimeRemaining(Math.max(0, 120 - i * 2))
            const response = await fetch(`https://iris-api-sandbox.circle.com/attestations/${messageHash}`)
            if (response.ok) {
              const data = await response.json()
              if (data.status === 'complete') {
                attestationHex = data.attestation
                break
              }
            }
          } catch (err) {
            console.error('Error polling attestation:', err)
          }
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        if (!attestationHex) {
          throw new Error('Timeout waiting for Circle CCTP attestation. Please try again.')
        }

        localStorage.setItem(`cctp_attestation_${address.toLowerCase()}`, attestationHex)
        setTxHashes((prev) => ({ ...prev, attest: '0x_complete' }))
        return true
      }

      case 'mint': {
        setCurrentStep('mint')
        setStatus('loading')
        
        const messageHex = localStorage.getItem(`cctp_message_${address.toLowerCase()}`)
        const attestationHex = localStorage.getItem(`cctp_attestation_${address.toLowerCase()}`)

        if (!messageHex || !attestationHex) {
          throw new Error('Missing message or attestation for minting.')
        }

        // Switch MetaMask to Arc Testnet
        const destChainConfig = BRIDGE_CHAINS.arc_testnet
        const destChainId = destChainConfig.chainId

        if (walletType === 'metamask') {
          const ethereum = provider
          if (ethereum) {
            try {
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${destChainId.toString(16)}` }],
              })
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: `0x${destChainId.toString(16)}`,
                    chainName: destChainConfig.name,
                    rpcUrls: [destChainConfig.rpcUrl],
                    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
                    blockExplorerUrls: [destChainConfig.explorerUrl],
                  }],
                })
              } else {
                throw switchError
              }
            }
          }
        }

        const destPublicClient = createPublicClient({
          chain: arcTestnet,
          transport: http(BRIDGE_CHAINS.arc_testnet.rpcUrl),
        })

        const messageTransmitterAbi = [
          {
            name: 'receiveMessage',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'message', type: 'bytes' },
              { name: 'attestation', type: 'bytes' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ] as const

        const mintTx = await destWalletClient.writeContract({
          address: safeAddress(CCTP_CONFIG.arc_testnet.messageTransmitter),
          abi: messageTransmitterAbi,
          functionName: 'receiveMessage',
          args: [messageHex as `0x${string}`, attestationHex as `0x${string}`],
          account: safeAddress(address),
          chain: null as any
        })

        setTxHashes((prev) => ({ ...prev, mint: mintTx }))
        await destPublicClient.waitForTransactionReceipt({ hash: mintTx })

        // Cleanup
        localStorage.removeItem(`cctp_message_${address.toLowerCase()}`)
        localStorage.removeItem(`cctp_attestation_${address.toLowerCase()}`)
        await refreshBalances()
        return true
      }

      default:
        return false
    }
  }

  // Orchestrates full CCTP bridging flow
  const startBridge = async (bridgeAmount: string) => {
    setErrorMessage('')
    setTxHashes({})
    
    try {
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
    } catch (err: any) {
      if (err.name === 'UserRejectedRequestError' || err.message?.includes('User rejected') || err.message?.includes('user rejected') || err.message?.includes('User denied')) {
        console.warn('User rejected the CCTP bridge transaction request.')
      } else {
        console.error('CCTP Bridge error:', err)
      }
      setErrorMessage(err.message || 'Transaction failed or rejected by wallet.')
      setStatus('error')
    }
  }

  // Resume or retry from the failed step to provide error recovery
  const retryBridge = async (bridgeAmount: string) => {
    setErrorMessage('')
    setStatus('loading')
    
    try {
      let ok = false
      const stepsList: BridgeStep[] = ['approve', 'burn', 'attest', 'mint']
      const startIndex = stepsList.indexOf(currentStep)
      
      for (let i = startIndex; i < stepsList.length; i++) {
        ok = await executeBridgeStep(stepsList[i], bridgeAmount)
        if (!ok) return
      }
      
      setCurrentStep('complete')
      setStatus('success')
    } catch (err: any) {
      if (err.name === 'UserRejectedRequestError' || err.message?.includes('User rejected') || err.message?.includes('user rejected') || err.message?.includes('User denied')) {
        console.warn('User rejected the CCTP bridge retry transaction request.')
      } else {
        console.error('CCTP Bridge retry error:', err)
      }
      setErrorMessage(err.message || 'Transaction failed during retry.')
      setStatus('error')
    }
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
