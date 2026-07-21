import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, createPublicClient, http, getAddress, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { defineChain } from 'viem'

let customRpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'
if (customRpcUrl.startsWith('NEXT_PUBLIC_ARC_RPC_URL=')) {
  customRpcUrl = customRpcUrl.replace('NEXT_PUBLIC_ARC_RPC_URL=', '')
}
const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: [customRpcUrl] },
  },
})

const USDC_ADDRESS = getAddress('0x3600000000000000000000000000000000000000')
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
    const { targetAddress } = await req.json()

    if (!targetAddress) {
      return NextResponse.json({ error: 'Missing targetAddress parameter' }, { status: 400 })
    }

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    })

    const target = getAddress(targetAddress)

    // Setup deployer wallet to sponsor gas
    const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY)
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(),
    })

    const sponsorAmount = parseUnits('0.05', 6) // Send 0.05 USDC to cover native gas fees on Arc

    console.log(`Gas Station: sponsoring ${target} with 0.05 USDC for gas...`)

    const txHash = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [target, sponsorAmount],
    })

    console.log(`Sponsorship tx sent: ${txHash}`)
    await publicClient.waitForTransactionReceipt({ hash: txHash })

    return NextResponse.json({
      success: true,
      txHash,
      message: 'Circle Gas Station: Sponsored 0.05 USDC successfully.',
    })
  } catch (err: any) {
    console.error('Sponsorship error:', err)
    return NextResponse.json({ error: err.message || 'Error sponsoring gas' }, { status: 500 })
  }
}
