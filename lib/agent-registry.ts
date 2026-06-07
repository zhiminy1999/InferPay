export const AGENT_REGISTRY_ADDRESS = "0xb4a614a597280888D3EEAB8a44562EAB59871270" as const;

export const agentRegistryAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "_agentAddress", "type": "address" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "string", "name": "_capabilities", "type": "string" },
      { "internalType": "string", "name": "_serviceEndpoint", "type": "string" }
    ],
    "name": "registerAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_agentAddress", "type": "address" },
      { "internalType": "uint256", "name": "_reputation", "type": "uint256" }
    ],
    "name": "setReputation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_agentAddress", "type": "address" }
    ],
    "name": "getAgent",
    "outputs": [
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "capabilities", "type": "string" },
      { "internalType": "string", "name": "serviceEndpoint", "type": "string" },
      { "internalType": "uint256", "name": "reputation", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllAgentAddresses",
    "outputs": [
      { "internalType": "address[]", "name": "", "type": "address[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "agents",
    "outputs": [
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "string", "name": "capabilities", "type": "string" },
      { "internalType": "string", "name": "serviceEndpoint", "type": "string" },
      { "internalType": "uint256", "name": "reputation", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "agentAddresses",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "agentAddress", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "description", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "capabilities", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "serviceEndpoint", "type": "string" }
    ],
    "name": "AgentRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "agentAddress", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "newReputation", "type": "uint256" }
    ],
    "name": "ReputationUpdated",
    "type": "event"
  }
] as const;
