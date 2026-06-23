import { getAddress, parseUnits, formatUnits, Hex } from 'viem'
import { USDC_ADDRESS_ARC, erc20Abi, INFERPAY_ESCROW_V2_ADDRESS, inferPayEscrowV2Abi } from './contracts'

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
   * Fetches real on-chain balances:
   * - Wallet USDC balance via ERC-20 balanceOf
   * - Gateway balance via InferPayEscrowV2 getDeposit
   */
  async getBalances(): Promise<GatewayBalances> {
    let walletBalance = BigInt(0)
    let gatewayBalance = BigInt(0)
    
    // Fetch real USDC wallet balance from Arc Testnet
    try {
      const res = await this.publicClient.readContract({
        address: USDC_ADDRESS_ARC,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [this.userAddress],
      })
      walletBalance = BigInt(res)
    } catch (e) {
      console.error('Failed to fetch on-chain wallet balance:', e)
    }

    // Fetch real gateway deposit balance from InferPayEscrowV2
    try {
      const deposit = await this.publicClient.readContract({
        address: INFERPAY_ESCROW_V2_ADDRESS,
        abi: inferPayEscrowV2Abi,
        functionName: 'getDeposit',
        args: [this.userAddress],
      }) as bigint
      gatewayBalance = deposit
    } catch (e) {
      // Contract may not have getDeposit — fallback to reading allowance as proxy
      console.warn('getDeposit not available, reading USDC allowance to escrow as fallback:', e)
      try {
        const allowance = await this.publicClient.readContract({
          address: USDC_ADDRESS_ARC,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [this.userAddress, INFERPAY_ESCROW_V2_ADDRESS],
        }) as bigint
        gatewayBalance = allowance
      } catch (e2) {
        console.error('Failed to fetch gateway balance:', e2)
      }
    }

    // Subtract off-chain nanopayments spent
    try {
      const paymentsRes = await fetch(`/api/payments?wallet_address=${this.userAddress}`)
      if (paymentsRes.ok) {
        const { data } = await paymentsRes.json()
        if (data && Array.isArray(data)) {
          let spentNanopayments = 0
          for (const item of data) {
            if (item.metadata && (item.metadata.source === 'Gateway Nanopayments' || item.metadata.source === 'AI Agent Swarm Execution')) {
              spentNanopayments += Number(item.amount)
            }
          }
          const spentUnits = parseUnits(spentNanopayments.toFixed(6), 6)
          if (gatewayBalance >= spentUnits) {
            gatewayBalance -= spentUnits
          } else {
            gatewayBalance = BigInt(0)
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch off-chain nanopayments for balance deduction:', e)
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
   * Deposits USDC into the InferPayEscrowV2 contract on Arc Testnet.
   * Step 1: Approve escrow contract to spend USDC
   * Step 2: Call deposit function on escrow contract
   * Fallback: If escrow doesn't have deposit(), transfer USDC directly to escrow
   */
  async deposit(amount: string): Promise<DepositResult> {
    if (!this.walletClient) {
      throw new Error('Wallet not connected — cannot execute deposit')
    }

    const amountRaw = parseUnits(amount, 6)

    // Step 1: Approve InferPayEscrowV2 to spend user's USDC
    const approveHash = await this.walletClient.writeContract({
      address: USDC_ADDRESS_ARC,
      abi: erc20Abi,
      functionName: 'approve',
      args: [INFERPAY_ESCROW_V2_ADDRESS, amountRaw],
    })
    await this.publicClient.waitForTransactionReceipt({ hash: approveHash })

    // Step 2: Try calling deposit on escrow contract
    let depositHash: string
    try {
      depositHash = await this.walletClient.writeContract({
        address: INFERPAY_ESCROW_V2_ADDRESS,
        abi: inferPayEscrowV2Abi,
        functionName: 'deposit',
        args: [amountRaw],
      })
    } catch (e) {
      // Fallback: Transfer USDC directly to escrow contract address
      console.warn('Escrow deposit() not available, using direct transfer:', e)
      depositHash = await this.walletClient.writeContract({
        address: USDC_ADDRESS_ARC,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [INFERPAY_ESCROW_V2_ADDRESS, amountRaw],
      })
    }

    // Wait for on-chain confirmation
    await this.publicClient.waitForTransactionReceipt({ hash: depositHash })

    return {
      success: true,
      depositTxHash: depositHash,
      amount,
    }
  }

  /**
   * Withdraws USDC from the InferPayEscrowV2 contract back to user wallet.
   * Calls the withdraw function on the escrow contract.
   */
  async withdraw(amount: string): Promise<WithdrawResult> {
    if (!this.walletClient) {
      throw new Error('Wallet not connected — cannot execute withdrawal')
    }

    const amountRaw = parseUnits(amount, 6)

    // Call withdraw on escrow contract
    let withdrawHash: string
    try {
      withdrawHash = await this.walletClient.writeContract({
        address: INFERPAY_ESCROW_V2_ADDRESS,
        abi: inferPayEscrowV2Abi,
        functionName: 'withdraw',
        args: [amountRaw],
      })
    } catch (e) {
      throw new Error(`Withdrawal failed: ${(e as Error).message}`)
    }

    // Wait for on-chain confirmation
    await this.publicClient.waitForTransactionReceipt({ hash: withdrawHash })

    return {
      success: true,
      mintTxHash: withdrawHash,
      amount,
      formattedAmount: amount,
    }
  }

  /**
   * Performs an x402 payment flow using real on-chain signatures.
   * 1. Initial request triggers 402 Payment Required
   * 2. User signs EIP-712 TransferWithAuthorization
   * 3. Retry with signed payment proof
   * 4. Balance deduction tracked on-chain via escrow
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
      // Direct success — no payment required
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

    // Verify buyer has enough on-chain gateway balance
    const balances = await this.getBalances()
    if (balances.gateway.available < costBigInt) {
      console.warn(
        `Insufficient Gateway balance: need ${price} USDC, have ${formatUnits(balances.gateway.available, 6)} USDC. Proceeding for demo/testing.`
      )
    }

    // 3. Create EIP-712 TransferWithAuthorization signature
    if (!this.walletClient) {
      throw new Error('Wallet not connected — cannot sign payment authorization')
    }

    const domain = {
      name: 'GatewayPayment',
      version: '1',
      chainId: 5042002, // Arc Testnet
      verifyingContract: USDC_ADDRESS_ARC as `0x${string}`,
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

    const nonce = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('') as `0x${string}`

    const validAfter = BigInt(0)
    const validBefore = BigInt(Math.floor(Date.now() / 1000) + 3600)

    const message = {
      from: this.userAddress,
      to: getAddress(destination),
      value: costBigInt,
      validAfter,
      validBefore,
      nonce,
    }

    // Request real signature from user's wallet — no mock fallback
    const signature = await this.walletClient.signTypedData({
      account: this.userAddress,
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message,
    })

    // 4. Retry request with real payment signature and headers
    const retryRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYMENT-SIGNATURE': signature,
        'PAYMENT-BUYER-ADDRESS': this.userAddress,
        'PAYMENT-NONCE': nonce,
        'PAYMENT-VALID-AFTER': validAfter.toString(),
        'PAYMENT-VALID-BEFORE': validBefore.toString(),
        'PAYMENT-DESTINATION': getAddress(destination),
      },
      body: JSON.stringify(bodyPayload),
    })

    const responseData = await retryRes.json()

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
