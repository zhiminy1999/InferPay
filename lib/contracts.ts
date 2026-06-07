import { 
  agentEscrowV2Abi, 
  agentConsensusV2Abi, 
  inferPayEscrowV2Abi 
} from './contracts-v2'

export const USDC_ADDRESS_ARC = "0x3600000000000000000000000000000000000000" as const;
export const EURC_ADDRESS_ARC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;

// V2 addresses
export const AGENT_ESCROW_V2_ADDRESS = "0xceb2daed59fe7d23047d5986c1d1ac49d24ac6b6" as const;
export const AGENT_CONSENSUS_V2_ADDRESS = "0x359439379ba6f989917b702a9c2dff6dc179d898" as const;
export const INFERPAY_ESCROW_V2_ADDRESS = "0xaffa3c0ec0c100053c719b8c939601d784d9f415" as const;

// Map original names to V2 addresses for backward compatibility
export const INFERPAY_CONTRACT_ADDRESS = INFERPAY_ESCROW_V2_ADDRESS;
export const AGENT_ESCROW_ADDRESS = AGENT_ESCROW_V2_ADDRESS;
export const AGENT_CONSENSUS_ADDRESS = AGENT_CONSENSUS_V2_ADDRESS;

export const erc20Abi = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "success", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "success", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Export V2 ABIs using the expected original names
export const agentEscrowAbi = agentEscrowV2Abi;
export const agentConsensusAbi = agentConsensusV2Abi;
export const inferPayAbi = inferPayEscrowV2Abi;
export { agentEscrowV2Abi, agentConsensusV2Abi, inferPayEscrowV2Abi };
