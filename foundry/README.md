# InferPay Smart Contracts (Foundry)

This directory contains the smart contracts for the InferPay platform, structured as a Foundry project.

## Contracts

- `AgentEscrow.sol`: Handles session-bound ephemeral wallets with spending policies.
- `AgentConsensus.sol`: Implements multi-agent M-of-N consensus approvals.
- `InferPayEscrow.sol`: Manages inference job settlement.

## Getting Started

1. Copy `.env.example` to `.env` and fill in your private key:
   ```bash
   cp .env.example .env
   ```

2. Compile the contracts:
   ```bash
   forge build
   ```

3. Run the deployment script on Arc Testnet:
   ```bash
   forge script script/DeployAll.s.sol --rpc-url https://rpc.testnet.arc.network --broadcast --legacy
   ```
