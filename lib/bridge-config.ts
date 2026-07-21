export interface ChainConfig {
  id: string
  name: string
  cctpDomain: number
  explorerUrl: string
  usdcAddress: string
  chainId: number
  rpcUrl: string
}

let customRpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'
if (customRpcUrl.startsWith('NEXT_PUBLIC_ARC_RPC_URL=')) {
  customRpcUrl = customRpcUrl.replace('NEXT_PUBLIC_ARC_RPC_URL=', '')
}

export const BRIDGE_CHAINS: Record<string, ChainConfig> = {
  ethereum_sepolia: {
    id: 'ethereum_sepolia',
    name: 'Ethereum Sepolia',
    cctpDomain: 0,
    explorerUrl: 'https://sepolia.etherscan.io',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    chainId: 11155111,
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  },
  base_sepolia: {
    id: 'base_sepolia',
    name: 'Base Sepolia',
    cctpDomain: 6,
    explorerUrl: 'https://sepolia.basescan.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
  },
  arc_testnet: {
    id: 'arc_testnet',
    name: 'Arc Testnet',
    cctpDomain: 26,
    explorerUrl: 'https://testnet.arcscan.app',
    usdcAddress: '0x3600000000000000000000000000000000000000', // Arc USDC
    chainId: 5042002,
    rpcUrl: customRpcUrl,
  },
}

export const CCTP_CONFIG = {
  // Main CCTP contracts on Sepolia (Source)
  ethereum_sepolia: {
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    messageTransmitter: '0x7865c0E2d1ab353503845b4B5c56c2452FBA2F76',
  },
  base_sepolia: {
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    messageTransmitter: '0x7865c0E2d1ab353503845b4B5c56c2452FBA2F76',
  },
  arc_testnet: {
    tokenMessenger: '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA', // Official TokenMessengerV2 on Arc Testnet
    messageTransmitter: '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275', // Official MessageTransmitterV2 on Arc Testnet
  },
}
