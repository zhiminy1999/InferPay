import { parseUnits, formatUnits } from 'viem'

export interface X402Challenge {
  status: number
  headers: {
    'X-402-Payment-Required': string
    'X-402-Payment-Token': string
    'X-402-Price': string
    'X-402-Service-Id': string
  }
}

export interface X402PaymentProof {
  'X-402-Payment-Token': string
  'X-402-Receipt': string
  'X-402-Service-Id': string
  'X-402-Price-Paid': string
}

export const X402Protocol = {
  /**
   * Generates a standard 402 challenge response for a payment-required service.
   */
  generateChallenge(serviceId: string, priceUsd: number): X402Challenge {
    return {
      status: 402,
      headers: {
        'X-402-Payment-Required': 'https://api.inferpay.space/gateway/nanopayments',
        'X-402-Payment-Token': 'USDC',
        'X-402-Price': priceUsd.toFixed(4),
        'X-402-Service-Id': serviceId,
      }
    }
  },

  /**
   * Attempts to settle the 402 challenge using available Gateway Nanopayments balance.
   */
  settleChallenge(
    challenge: X402Challenge,
    availableBalance: bigint, // in 6 decimals (USDC)
    deductBalanceFn: (amountUnits: bigint) => Promise<boolean>
  ): Promise<{ success: boolean; proof?: X402PaymentProof; error?: string }> {
    return new Promise(async (resolve) => {
      try {
        const priceStr = challenge.headers['X-402-Price']
        const priceUnits = parseUnits(priceStr, 6)

        if (availableBalance < priceUnits) {
          resolve({
            success: false,
            error: `Insufficient Gateway balance. Required: ${priceStr} USDC, Available: ${formatUnits(availableBalance, 6)} USDC`
          })
          return
        }

        // Deduct balance
        const success = await deductBalanceFn(priceUnits)
        if (!success) {
          resolve({
            success: false,
            error: 'Failed to settle nanopayment through Gateway client'
          })
          return
        }

        // Create deterministic receipt hash from payment details
        const encoder = new TextEncoder()
        const receiptData = encoder.encode(
          `${challenge.headers['X-402-Service-Id']}:${priceStr}:${Date.now()}`
        )
        // Use Web Crypto API for deterministic hashing
        const hashBuffer = await crypto.subtle.digest('SHA-256', receiptData)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const receiptHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        resolve({
          success: true,
          proof: {
            'X-402-Payment-Token': 'USDC',
            'X-402-Receipt': receiptHash,
            'X-402-Service-Id': challenge.headers['X-402-Service-Id'],
            'X-402-Price-Paid': priceStr
          }
        })
      } catch (err: any) {
        resolve({
          success: false,
          error: err.message || 'Error executing x402 settlement'
        })
      }
    })
  },

  /**
   * Verifies the x402 payment proof at the provider endpoint.
   */
  verifyPaymentProof(proof: X402PaymentProof, expectedServiceId: string, expectedPrice: number): boolean {
    if (!proof['X-402-Receipt'] || !proof['X-402-Receipt'].startsWith('0x') || proof['X-402-Receipt'].length !== 66) {
      return false
    }
    if (proof['X-402-Service-Id'] !== expectedServiceId) {
      return false
    }
    const paidAmount = parseFloat(proof['X-402-Price-Paid'])
    if (paidAmount < expectedPrice) {
      return false
    }
    return true
  }
}
