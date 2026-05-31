export const USDC_ADDRESS_ARC = "0x3600000000000000000000000000000000000000" as const;
export const EURC_ADDRESS_ARC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;

export const INFERPAY_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as const; // Default or deployed contract address

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

export const inferPayAbi = [
  {
    "inputs": [
      { "internalType": "string", "name": "modelId", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "requestInference",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const agentEscrowAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "_ephemeralWallet", "type": "address" },
      { "internalType": "uint256", "name": "_spendLimit", "type": "uint256" },
      { "internalType": "uint256", "name": "_duration", "type": "uint256" },
      { "internalType": "address[]", "name": "_whitelist", "type": "address[]" }
    ],
    "name": "createSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_ephemeralWallet", "type": "address" },
      { "internalType": "address", "name": "_target", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "executeSpend",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_ephemeralWallet", "type": "address" }
    ],
    "name": "sweepSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const agentConsensusAbi = [
  {
    "inputs": [
      { "internalType": "address payable", "name": "_recipient", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "string", "name": "_purpose", "type": "string" }
    ],
    "name": "createProposal",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" },
      { "internalType": "bool", "name": "_approve", "type": "bool" }
    ],
    "name": "voteProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" }
    ],
    "name": "humanBypassExecute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
