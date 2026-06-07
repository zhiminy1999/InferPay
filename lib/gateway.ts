import { getAddress, parseUnits, formatUnits, Hex } from 'viem'

export interface GatewayBalances {
  wallet: {
    amount: bigint
    formatted: string
  }
  gateway: {
    available: bigint
    formattedAvailable: string
  }
}

export interface DepositResult {
  success: boolean
  depositTxHash: string
  amount: string
}

export interface WithdrawResult {
  success: boolean
  mintTxHash: string
  amount: string
  formattedAmount: string
}

export interface PayResult {
  success: boolean
  status: number
  data: any
  signature?: string
  cost?: string
}

export class GatewayClient {
  private chain: string
  private userAddress: `0x${string}`
  private publicClient: any
  private walletClient: any

  constructor(config: {
    chain: string
    userAddress: `0x${string}`
    publicClient: any
    walletClient: any
  }) {
    this.chain = config.chain
    this.userAddress = getAddress(config.userAddress)
    this.publicClient = config.publicClient
    this.walletClient = config.walletClient
  }

  /**
   * Fetches current wallet USDC balance (on-chain) and simulated Gateway nanopayments balance (localStorage)
   */
  async getBalances(): Promise<GatewayBalances> {
    let walletBalance = BigInt(0)
    
    // Attempt to fetch real USDC balance from Arc Testnet
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

      const res = await this.publicClient.readContract({
        address: USDC_ADDRESS,
        abi,
        functionName: 'balanceOf',
        args: [this.userAddress],
      })
      walletBalance = BigInt(res)
    } catch (e) {
      console.warn('Failed to fetch real wallet balance, using local simulation:', e)
      walletBalance = parseUnits('100.0', 6)
    }

    // Read gateway balance from localStorage
    let gatewayBalance = BigInt(0)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`gateway_bal_${this.userAddress.toLowerCase()}`)
      if (stored) {
        gatewayBalance = BigInt(stored)
      } else {
        // Default seed to make demo interactive
        gatewayBalance = parseUnits('5.0', 6)
        localStorage.setItem(`gateway_bal_${this.userAddress.toLowerCase()}`, gatewayBalance.toString())
      }
    }

    return {
      wallet: {
        amount: walletBalance,
        formatted: formatUnits(walletBalance, 6),
      },
      gateway: {
        available: gatewayBalance,
        formattedAvailable: formatUnits(gatewayBalance, 6),
      },
    }
  }

  /**
   * Deposits USDC into Gateway. Triggers real USDC on-chain transaction to vault if possible
   */
  async deposit(amount: string): Promise<DepositResult> {
    const amountRaw = parseUnits(amount, 6)
    const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'
    const GATEWAY_VAULT = '0x000000000000000000000000000000000000dEaD' // Burn address as mock vault for gasless deposits
    
    const erc20Abi = [
      {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'recipient', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      },
    ] as const

    let txHash = '0x' + '0'.repeat(64)

    try {
      if (this.walletClient) {
        // Execute real transfer on-chain
        txHash = await this.walletClient.writeContract({
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [GATEWAY_VAULT, amountRaw],
        })

        // Wait for block confirmation
        await this.publicClient.waitForTransactionReceipt({ hash: txHash })
      }
    } catch (e) {
      console.warn('Real deposit transfer failed or cancelled, executing local simulation:', e)
      // Generate simulated hash
      txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    }

    // Update Gateway balance in localStorage
    if (typeof window !== 'undefined') {
      const key = `gateway_bal_${this.userAddress.toLowerCase()}`
      const current = BigInt(localStorage.getItem(key) || '0')
      const next = current + amountRaw
      localStorage.setItem(key, next.toString())

      // Record deposit history
      const histKey = `gateway_hist_${this.userAddress.toLowerCase()}`
      const hist = JSON.parse(localStorage.getItem(histKey) || '[]')
      hist.unshift({
        type: 'deposit',
        amount,
        txHash,
        timestamp: Date.now(),
      })
      localStorage.setItem(histKey, JSON.stringify(hist))
    }

    return {
      success: true,
      depositTxHash: txHash,
      amount,
    }
  }

  /**
   * Withdraws USDC from Gateway back to user wallet
   */
  async withdraw(amount: string): Promise<WithdrawResult> {
    const amountRaw = parseUnits(amount, 6)
    
    // Deduct from local storage
    if (typeof window !== 'undefined') {
      const key = `gateway_bal_${this.userAddress.toLowerCase()}`
      const current = BigInt(localStorage.getItem(key) || '0')
      if (current < amountRaw) {
        throw new Error('Insufficient Gateway balance for withdrawal')
      }
      const next = current - amountRaw
      localStorage.setItem(key, next.toString())

      // Record withdrawal history
      const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      const histKey = `gateway_hist_${this.userAddress.toLowerCase()}`
      const hist = JSON.parse(localStorage.getItem(histKey) || '[]')
      hist.unshift({
        type: 'withdrawal',
        amount,
        txHash,
        timestamp: Date.now(),
      })
      localStorage.setItem(histKey, JSON.stringify(hist))

      return {
        success: true,
        mintTxHash: txHash,
        amount,
        formattedAmount: amount,
      }
    }

    throw new Error('Window environment required')
  }

  /**
   * Performs an x402 payment flow.
   * Negotiates 402, requests off-chain signature authorization, and submits to server.
   */
  async pay(url: string, bodyPayload: any = {}): Promise<PayResult> {
    // 1. Initial request to trigger payment negotiation
    const initRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    })

    if (initRes.status !== 402) {
      // Direct success
      const data = await initRes.json()
      return { success: true, status: initRes.status, data }
    }

    // 2. Extract payment requirement info
    const reqHeader = initRes.headers.get('PAYMENT-REQUIRED')
    if (!reqHeader) {
      throw new Error('Server returned 402 but missing PAYMENT-REQUIRED header')
    }

    const { price, destination } = JSON.parse(reqHeader)
    const costBigInt = parseUnits(price, 6)

    // Verify buyer has enough gateway balance
    if (typeof window !== 'undefined') {
      const balKey = `gateway_bal_${this.userAddress.toLowerCase()}`
      const balance = BigInt(localStorage.getItem(balKey) || '0')
      if (balance < costBigInt) {
        throw new Error(`Insufficient Gateway balance: need ${price} USDC, have ${formatUnits(balance, 6)} USDC`)
      }
    }

    // 3. Create EIP-3009-like offchain signature
    // For local simulation, we sign a standard EIP-712 typed structure
    let signature = '0x'
    try {
      if (this.walletClient) {
        const domain = {
          name: 'GatewayWalletBatched',
          version: '1',
          chainId: 5042002,
          verifyingContract: '0x3600000000000000000000000000000000000000' as `0x${string}`,
        }

        const types = {
          TransferWithAuthorization: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'validAfter', type: 'uint256' },
            { name: 'validBefore', type: 'uint256' },
            { name: 'nonce', type: 'bytes32' },
          ],
        }

        const message = {
          from: this.userAddress,
          to: getAddress(destination),
          value: costBigInt,
          validAfter: BigInt(0),
          validBefore: BigInt(Math.floor(Date.now() / 1000) + 3600),
          nonce: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('') as `0x${string}`,
        }

        signature = await this.walletClient.signTypedData({
          account: this.userAddress,
          domain,
          types,
          primaryType: 'TransferWithAuthorization',
          message,
        })
      }
    } catch (e) {
      console.warn('Signature collection cancelled/failed, using mock signature:', e)
      signature = '0x' + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    }

    // 4. Retry request with PAYMENT-SIGNATURE header
    const retryRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYMENT-SIGNATURE': signature,
        'PAYMENT-BUYER-ADDRESS': this.userAddress,
      },
      body: JSON.stringify(bodyPayload),
    })

    const responseData = await retryRes.json()

    if (retryRes.ok) {
      // Deduct balance locally upon successful payment confirmation
      if (typeof window !== 'undefined') {
        const balKey = `gateway_bal_${this.userAddress.toLowerCase()}`
        const current = BigInt(localStorage.getItem(balKey) || '0')
        const next = current - costBigInt
        localStorage.setItem(balKey, next.toString())

        // Save history item
        const histKey = `gateway_hist_${this.userAddress.toLowerCase()}`
        const hist = JSON.parse(localStorage.getItem(histKey) || '[]')
        hist.unshift({
          type: 'spend',
          amount: price,
          description: bodyPayload.modelId ? `Inference call: ${bodyPayload.modelId}` : 'Nanopayment request',
          timestamp: Date.now(),
          settled: true, // Gasless offchain instant settlement
          payoutHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        })
        localStorage.setItem(histKey, JSON.stringify(hist))
      }
    }

    return {
      success: retryRes.ok,
      status: retryRes.status,
      data: responseData,
      signature,
      cost: price,
    }
  }

  /**
   * Helper to check x402 support on a URL
   */
  async supports(url: string): Promise<{ supported: boolean }> {
    try {
      const res = await fetch(url, { method: 'POST', body: JSON.stringify({ checkOnly: true }) })
      const supported = res.status === 402 && res.headers.has('PAYMENT-REQUIRED')
      return { supported }
    } catch {
      return { supported: false }
    }
  }
}
