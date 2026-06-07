import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, createPublicClient, http, getAddress, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'

const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
})

const USDC_ADDRESS = getAddress('0x3600000000000000000000000000000000000000')
const EURC_ADDRESS = getAddress('0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a')
const DEPLOYER_PRIVATE_KEY = (process.env.DEPLOYER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000') as `0x${string}`

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

export async function POST(req: NextRequest) {
  try {
    const { userAddress, txHash, fromCurrency, toCurrency, amount, outputAmount } = await req.json()

    if (!userAddress || !txHash || !fromCurrency || !toCurrency || !amount || !outputAmount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    })

    console.log(`Verifying swap transaction ${txHash} on Arc Testnet...`)
    
    // Wait for the transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'Inbound swap transaction failed on-chain' }, { status: 400 })
    }

    // Verify sender
    if (receipt.from.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Transaction sender does not match user address' }, { status: 400 })
    }

    // Target contract address
    const expectedContract = fromCurrency === 'USDC' ? USDC_ADDRESS : EURC_ADDRESS
    if (receipt.to?.toLowerCase() !== expectedContract.toLowerCase()) {
      return NextResponse.json({ error: 'Transaction target address is not the correct token' }, { status: 400 })
    }

    // Setup deployer wallet
    const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY)
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(),
    })

    const payoutToken = toCurrency === 'USDC' ? USDC_ADDRESS : EURC_ADDRESS
    const payoutAmountRaw = parseUnits(outputAmount, 6)

    console.log(`Executing payout: sending ${outputAmount} ${toCurrency} to ${userAddress}...`)

    // Send transfer transaction
    const payoutHash = await walletClient.writeContract({
      address: payoutToken,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [getAddress(userAddress), payoutAmountRaw],
    })

    console.log(`Payout transaction sent: ${payoutHash}`)
    await publicClient.waitForTransactionReceipt({ hash: payoutHash })

    return NextResponse.json({
      success: true,
      payoutHash,
      message: 'On-chain FX trade swap settled successfully.',
    })
  } catch (err: any) {
    console.error('Swap execution API error:', err)
    return NextResponse.json({ error: err.message || 'Error settling FX trade' }, { status: 500 })
  }
}
