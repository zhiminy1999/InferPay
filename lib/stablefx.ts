import { getAddress } from 'viem'

export interface FXQuote {
  id: string
  rate: string
  from: {
    currency: string
    amount: string
  }
  to: {
    currency: string
    amount: string
  }
  createdAt: string
  expiresAt: string
  fee: {
    currency: string
    amount: string
  }
  typedData: any
}

export interface FXTrade {
  id: string
  contractTradeId: string
  from: {
    currency: string
    amount: string
  }
  to: {
    currency: string
    amount: string
  }
  status: string
  createDate: string
  updateDate: string
  quoteId: string
  rate: string
}

const USDC_ADDR = '0x3600000000000000000000000000000000000000'
const EURC_ADDR = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'
const POOL_ADDR = '0x08Ec3EEfC622b8a8742fC8Ab48E832c236bc360B'

export const StableFXClient = {
  /**
   * Fetches real-time rate from a public currency API or falls back.
   */
  async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = await response.json()
      if (data && data.rates) {
        if (fromCurrency === 'USDC' && toCurrency === 'EURC') {
          // Typically 1 USD is ~0.92 EUR
          return Number(data.rates.EUR) || 0.925
        } else if (fromCurrency === 'EURC' && toCurrency === 'USDC') {
          return 1 / (Number(data.rates.EUR) || 0.925)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch public rate API, using fallback:', err)
    }
    return fromCurrency === 'USDC' ? 0.925 : 1.08
  },

  /**
   * Requests a tradable quote containing EIP-712 Permit2 signatures.
   */
  async requestQuote(
    fromCurrency: string,
    toCurrency: string,
    amount: string,
    recipientAddress: string
  ): Promise<FXQuote> {
    const rate = await this.fetchExchangeRate(fromCurrency, toCurrency)
    const rawAmount = parseFloat(amount)
    const outAmount = (rawAmount * rate).toFixed(2)
    const quoteId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const fromToken = fromCurrency === 'USDC' ? USDC_ADDR : EURC_ADDR
    const toToken = toCurrency === 'USDC' ? USDC_ADDR : EURC_ADDR

    const feeAmount = (rawAmount * 0.0015).toFixed(2) // 15 bps fee

    const fromAmountRaw = BigInt(Math.floor(rawAmount * 1000000)).toString()
    const toAmountRaw = BigInt(Math.floor(parseFloat(outAmount) * 1000000)).toString()

    const nonce = Math.floor(Math.random() * 1000000000)
    const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour

    // Permit2 EIP-712 standard typed data schema
    const typedData = {
      domain: {
        name: 'Permit2',
        chainId: 5042002, // Arc Testnet
        verifyingContract: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      },
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Consideration: [
          { name: 'quoteId', type: 'string' },
          { name: 'base', type: 'address' },
          { name: 'quote', type: 'address' },
          { name: 'baseAmount', type: 'uint256' },
          { name: 'quoteAmount', type: 'uint256' },
          { name: 'maturity', type: 'uint256' },
        ],
        TakerDetails: [
          { name: 'consideration', type: 'Consideration' },
          { name: 'recipient', type: 'address' },
          { name: 'fee', type: 'uint256' },
        ],
        TokenPermissions: [
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        PermitWitnessTransferFrom: [
          { name: 'permitted', type: 'TokenPermissions' },
          { name: 'spender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'witness', type: 'TakerDetails' },
        ],
      },
      primaryType: 'PermitWitnessTransferFrom',
      message: {
        permitted: {
          token: getAddress(fromToken),
          amount: fromAmountRaw,
        },
        spender: getAddress(POOL_ADDR),
        nonce,
        deadline,
        witness: {
          consideration: {
            quoteId: '0x' + Buffer.from(quoteId).toString('hex').padStart(64, '0').slice(-64),
            base: getAddress(toToken),
            quote: getAddress(fromToken),
            baseAmount: toAmountRaw,
            quoteAmount: fromAmountRaw,
            maturity: deadline,
          },
          recipient: getAddress(recipientAddress),
          fee: '150000', // 0.15 USDC/EURC in raw format
        },
      },
    }

    return {
      id: quoteId,
      rate: rate.toFixed(4),
      from: {
        currency: fromCurrency,
        amount: rawAmount.toFixed(2),
      },
      to: {
        currency: toCurrency,
        amount: outAmount,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      fee: {
        currency: fromCurrency,
        amount: feeAmount,
      },
      typedData,
    }
  },

  /**
   * Acceptance of the quote and creation of trade.
   */
  async createTrade(
    quote: FXQuote,
    userAddress: string,
    signature: string
  ): Promise<FXTrade> {
    const contractTradeId = Math.floor(Math.random() * 1000).toString()
    return {
      id: Math.random().toString(36).substring(2, 15),
      contractTradeId,
      from: quote.from,
      to: quote.to,
      status: 'pending_settlement',
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
      quoteId: quote.id,
      rate: quote.rate,
    }
  },

  /**
   * Returns EIP-712 data for verifying funding.
   */
  async getFundingPresignData(contractTradeId: string, fromCurrency: string, amount: string): Promise<any> {
    const token = fromCurrency === 'USDC' ? USDC_ADDR : EURC_ADDR
    const amtRaw = BigInt(Math.floor(parseFloat(amount) * 1000000)).toString()
    const deadline = Math.floor(Date.now() / 1000) + 3600

    return {
      typedData: {
        domain: {
          name: 'Permit2',
          chainId: 5042002,
          verifyingContract: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
        },
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          TokenPermissions: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          SingleTradeWitness: [
            { name: 'id', type: 'uint256' },
          ],
          PermitWitnessTransferFrom: [
            { name: 'permitted', type: 'TokenPermissions' },
            { name: 'spender', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'witness', type: 'SingleTradeWitness' },
          ],
        },
        primaryType: 'PermitWitnessTransferFrom',
        message: {
          permitted: {
            token: getAddress(token),
            amount: amtRaw,
          },
          spender: getAddress(POOL_ADDR),
          nonce: Math.floor(Math.random() * 10000000),
          deadline,
          witness: {
            id: contractTradeId,
          },
        },
      },
    }
  },
}
