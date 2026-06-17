import { NextRequest, NextResponse } from 'next/server'
import { getAddress, verifyTypedData, parseUnits } from 'viem'
import { USDC_ADDRESS_ARC } from '@/lib/contracts'
import fs from 'fs'
import path from 'path'

const PUBLISHER_WALLET = getAddress('0x7a304A671e21b79528659dC0D775e53FE233b2B0')
const HACKATHON_RESEARCH_DIR = 'C:\\Users\\eric\\Desktop\\Lepton\\research_results'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query = body?.query || ''
    const checkOnly = body?.checkOnly === true

    // Search service configurations
    const price = '0.002' // $0.002 USDC per search citation query
    const destination = PUBLISHER_WALLET

    // Extract payment parameters from headers
    const signature = req.headers.get('PAYMENT-SIGNATURE')
    const buyerAddress = req.headers.get('PAYMENT-BUYER-ADDRESS')
    const nonce = req.headers.get('PAYMENT-NONCE')
    const validAfterStr = req.headers.get('PAYMENT-VALID-AFTER')
    const validBeforeStr = req.headers.get('PAYMENT-VALID-BEFORE')
    const paymentDest = req.headers.get('PAYMENT-DESTINATION')

    // 1. Enforce HTTP 402 if payment headers are absent
    if (checkOnly || !signature || !buyerAddress || !nonce || !validAfterStr || !validBeforeStr || !paymentDest) {
      const response = NextResponse.json(
        { error: 'Payment Required to search research corpus', code: 402 },
        { status: 402 }
      )
      response.headers.set(
        'PAYMENT-REQUIRED',
        JSON.stringify({
          scheme: 'exact',
          price,
          currency: 'USDC',
          destination,
          network: 'arcTestnet',
        })
      )
      return response
    }

    // 2. Verify payment signature
    const costBigInt = parseUnits(price, 6)
    const validAfter = BigInt(validAfterStr)
    const validBefore = BigInt(validBeforeStr)

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

    const message = {
      from: getAddress(buyerAddress),
      to: getAddress(paymentDest),
      value: costBigInt,
      validAfter,
      validBefore,
      nonce: nonce as `0x${string}`,
    }

    const isValid = await verifyTypedData({
      address: getAddress(buyerAddress),
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message,
      signature: signature as `0x${string}`,
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 401 })
    }

    console.log(`[Search API]: Billed ${buyerAddress} -> ${price} USDC for query: "${query}"`)

    // 3. Perform real corpus search in the hackathon research directory
    let searchResults: string[] = []
    let filesSearched = 0
    let filesMatched = 0

    if (fs.existsSync(HACKATHON_RESEARCH_DIR)) {
      const files = fs.readdirSync(HACKATHON_RESEARCH_DIR)
      filesSearched = files.length
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(HACKATHON_RESEARCH_DIR, file)
          const content = fs.readFileSync(filePath, 'utf-8')
          
          if (content.toLowerCase().includes(query.toLowerCase())) {
            filesMatched++
            // Grab a snippet around the match
            const index = content.toLowerCase().indexOf(query.toLowerCase())
            const snippet = content.slice(Math.max(0, index - 80), Math.min(content.length, index + 150))
            searchResults.push(`[Source: ${file}] ...${snippet.trim()}...`)
            if (searchResults.length >= 3) break // cap results
          }
        }
      }
    }

    // Fallback if no files matched
    if (searchResults.length === 0) {
      searchResults.push(`[Source: System Feed] No direct matches found for "${query}". Returning general Arc stablecoin commerce standards.`)
    }

    // 4. Return search results and PAYMENT-RESPONSE with citation split details
    const response = NextResponse.json({
      success: true,
      query,
      results: searchResults,
      meta: {
        filesSearched,
        filesMatched,
        price,
        royaltySplit: '20% to publisher wallet'
      }
    })

    response.headers.set(
      'PAYMENT-RESPONSE',
      JSON.stringify({
        status: 'success',
        amount: price,
        recipient: destination,
        royaltyReceiver: PUBLISHER_WALLET,
        royaltyAmount: '0.0004' // 20% of 0.002
      })
    )

    return response
  } catch (err: any) {
    console.error('Search API failure:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
