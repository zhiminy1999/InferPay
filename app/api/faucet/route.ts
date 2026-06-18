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
    const { targetAddress } = await req.json()

    if (!targetAddress) {
      return NextResponse.json({ error: 'Missing targetAddress parameter' }, { status: 400 })
    }

    if (DEPLOYER_PRIVATE_KEY === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return NextResponse.json({ error: 'Deployer private key not configured' }, { status: 500 })
    }

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    })

    const target = getAddress(targetAddress)
    const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY)
    
    const walletClient = createWalletClient({
      account,
      chain: arcTestnet,
      transport: http(),
    })

    const amountUSDC = parseUnits('10', 6)
    const amountEURC = parseUnits('10', 6)

    console.log(`Faucet: funding ${target} with native gas, 10 USDC & 10 EURC on Arc Testnet...`)

    // Send native gas (0.05 USDC with 18 decimals)
    const gasTxHash = await walletClient.sendTransaction({
      to: target,
      value: parseUnits('0.05', 18),
    })

    // Send ERC-20 USDC
    const usdcTxHash = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [target, amountUSDC],
    })

    // Send ERC-20 EURC
    const eurcTxHash = await walletClient.writeContract({
      address: EURC_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [target, amountEURC],
    })

    // Wait for transactions to resolve
    await Promise.all([
      publicClient.waitForTransactionReceipt({ hash: gasTxHash }),
      publicClient.waitForTransactionReceipt({ hash: usdcTxHash }),
      publicClient.waitForTransactionReceipt({ hash: eurcTxHash }),
    ])

    return NextResponse.json({
      success: true,
      usdcTxHash,
      eurcTxHash,
      message: 'On-chain Faucet: funded 10 USDC & 10 EURC successfully.',
    })
  } catch (err: any) {
    console.error('Faucet transfer error:', err)
    return NextResponse.json({ error: err.message || 'Error executing faucet' }, { status: 500 })
  }
}
