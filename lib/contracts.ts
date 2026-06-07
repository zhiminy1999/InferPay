export const USDC_ADDRESS_ARC = "0x3600000000000000000000000000000000000000" as const;
export const EURC_ADDRESS_ARC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;

export const INFERPAY_CONTRACT_ADDRESS = "0xb97A6261aF4BEe28A88AcB14dDb8ba6131E9fC05" as const; // InferPayEscrow address
export const AGENT_ESCROW_ADDRESS = "0xDB6b226aCd9b73fE046704CddC7c453579EF447D" as const;
export const AGENT_CONSENSUS_ADDRESS = "0xDD4861565Fb8aCa5BB2Ce43032e614De888584b7" as const;

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
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "internalType": "address", "name": "computeNode", "type": "address" }
    ],
    "name": "completeJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextJobId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "jobs",
    "outputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "string", "name": "modelId", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bool", "name": "isComplete", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "modelId", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "JobRequested",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "node", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "JobCompleted",
    "type": "event"
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
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "activePolicies",
    "outputs": [
      { "internalType": "address", "name": "ephemeralWallet", "type": "address" },
      { "internalType": "uint256", "name": "spendLimit", "type": "uint256" },
      { "internalType": "uint256", "name": "totalSpent", "type": "uint256" },
      { "internalType": "uint256", "name": "expiration", "type": "uint256" },
      { "internalType": "bool", "name": "isExpired", "type": "bool" },
      { "internalType": "bool", "name": "isSwept", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "whitelistedContracts",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "masterWallet",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdcToken",
    "outputs": [
      { "internalType": "contract IERC20", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "ephemeralWallet", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "spendLimit", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "expiration", "type": "uint256" }
    ],
    "name": "SessionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "ephemeralWallet", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "target", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "SpendExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "ephemeralWallet", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "masterWallet", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amountSwept", "type": "uint256" }
    ],
    "name": "SessionSwept",
    "type": "event"
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
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "proposals",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address payable", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "purpose", "type": "string" },
      { "internalType": "uint256", "name": "approvalsCount", "type": "uint256" },
      { "internalType": "bool", "name": "executed", "type": "bool" },
      { "internalType": "bool", "name": "rejected", "type": "bool" },
      { "internalType": "uint256", "name": "creationTime", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "hasVoted",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "authorizedAgents",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "requiredApprovals",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "purpose", "type": "string" }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "agent", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "approve", "type": "bool" }
    ],
    "name": "ProposalVoted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "ProposalExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "administrator", "type": "address" }
    ],
    "name": "HumanOverrideTriggered",
    "type": "event"
  }
] as const;
