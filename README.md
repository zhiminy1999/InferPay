# InferPay 🚀

**Autonomous financial infrastructure for AI-driven organizations.** InferPay gives modern enterprises a complete treasury operating system where AI agents handle payments, manage and optimize idle capital, and coordinate high-value approvals — all settled in stablecoins on **Arc Testnet** with sub-second finality and fractions-of-a-cent transaction costs.

---

## ⚡ What is InferPay?

The economics of running AI agents at scale create a paradox: agents need spending authority to be useful, but unrestricted access to company funds is reckless. Traditional finance solves this with slow approval chains and manual oversight. 

InferPay resolves the tension differently — through **programmable spending boundaries enforced at the protocol level**, where every dollar an agent touches is governed by on-chain session policies, time-locked budgets, and multi-party consensus.

The result is a system where a fleet of AI agents can autonomously manage invoices, optimize treasury yields, and coordinate $25,000+ disbursements — while the human operator retains absolute override authority at every layer.

---

## 🏗️ Topology Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Business Operator                       │
│              (Dashboard · Wallet · Override)                 │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        ┌──────▼──────┐               ┌───────▼──────┐
        │  Allowance   │               │   Consensus  │
        │   Engine     │               │   Guardrail  │
        │ ┌──────────┐ │               │  ┌────────┐  │
        │ │ Session  │ │               │  │Proposal│  │
        │ │ Policies │ │               │  │ Voting │  │
        │ └──────────┘ │               │  └────────┘  │
        └──────┬───────┘               └──────┬───────┘
               │                              │
      ┌─────────▼──────────────────────────────▼──────────┐
      │               Arc Testnet (Chain 5042002)          │
      │                                                    │
      │  ┌──────────────┐  ┌───────────┐  ┌────────────┐  │
      │  │ AgentEscrow  │  │ InferPay  │  │  Agent     │  │
      │  │   V2.sol     │  │ Escrow.sol│  │ Consensus  │  │
      │  └──────────────┘  └───────────┘  │   V2.sol   │  │
      │                                   └────────────┘  │
      │       USDC (native gas)    ·    EURC               │
      └────────────────────────────────────────────────────┘
```

The architecture is flat and non-custodial. The frontend talks directly to the Arc Testnet through viem, and every state mutation is either a secure EVM transaction or a local client-side simulation that faithfully mirrors one.

---

## 🛠️ The 12 Treasury Operating Tools

1. **AI Agent Workspace**: Interactive multi-agent swarm planner and executor powered by LangGraph. Connects live DeepSeek LLM reasoning to execute complex multi-step treasury tasks (swapping, bridging, budgeting) with deterministic fallbacks.
2. **AI Spending Budget**: Limit agent disbursement parameters (spending limits, TTL, whitelisted addresses) directly on the `AgentEscrowV2` smart contract.
3. **Smart Bill Pay**: Select from incoming operational invoices (SaaS subscriptions, GPU scaling bills), automatically split fees (90% to vendors, 10% to reserves), and settle instantly.
4. **Savings Optimizer**: A live comparison between USDC and EURC yield rates. Triggers cross-currency swaps when favorable arbitrage or interest spreads are detected.
5. **Review & Pay AI Work**: AI assistants submit structured work reports (milestones completed, outcomes, requested payouts). Operators verify proof-of-work authenticity and disburse funds with a single click.
6. **Approval Committee**: Simulates a three-party on-chain consensus deliberation (Operations requester, Safety reviewer, Budget auditor) for large corporate payments (>$25,000) using `AgentConsensusV2`.
7. **Agent Directory**: ERC-8004 compliant register of verified AI identities, tracking capabilities, pricing metrics, and consensus voting rights.
8. **Autonomous Jobs**: ERC-8183 job execution board. Client and evaluator smart contracts lock task payments in job escrows, releasing them upon verification.
9. **Gateway Nanopayments**: Native HTTP x402 Protocol client. Enables sub-cent pay-per-request billing for AI queries using off-chain EIP-712 payment authorization signatures.
10. **Agent Marketplace**: Discover and purchase AI capabilities (data crawlers, compliance agents, yield aggregators) directly into your business stack.
11. **Treasury Analytics**: Complete visual control room displaying capital allocation split, cumulative interest generated, total gas saved, and compliance alerts.
12. **Transaction Audit Trail**: Comprehensive, real-time database ledger and blockchain event indexer logs for all treasury actions.

---

## ⛓️ Smart Contract Addresses (Arc Testnet)

* **USDC (Native Gas/ERC-20)**: `0x3600000000000000000000000000000000000000`
* **EURC**: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`
* **AgentEscrowV2**: `0xceb2daed59fe7d23047d5986c1d1ac49d24ac6b6`
* **AgentConsensusV2**: `0x359439379ba6f989917b702a9c2dff6dc179d898`
* **InferPayEscrowV2**: `0xaffa3c0ec0c100053c719b8c939601d784d9f415`

---

## 🚀 Quick Start & Installation

### 1. Clone & Install
```bash
git clone https://github.com/zhiminy1999/track-4-InferPay.git
cd track-4-InferPay
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the parameters:
```bash
cp .env.example .env
```
* **DEEPSEEK_API_KEY** *(Optional)*: Set a DeepSeek API key to run live LLM planning workflows and API inference.
* **NEXT_PUBLIC_SUPABASE_URL** & **SUPABASE_SERVICE_ROLE_KEY** *(Optional)*: Supabase project coordinates for cloud database backups. If not set, InferPay automatically falls back to an offline-first local SQLite (`data/inferpay.db`) / JSON database.

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 Operating Modes

* **Demo Mode** *(No Wallet Connected)*: Persists mock balances in `localStorage`. Clicking the Faucet adds $1,000 USDC and €1,000 EURC to let you evaluate all features immediately without configuring any wallets.
* **Live Mode** *(Web3 Wallet Connected)*: Automatically queries real balances on Arc Testnet via `balanceOf()`. Every action generates real EVM transactions and EIP-712 signatures. Clicking the Faucet triggers our smart API faucet to fund your wallet with real Arc Testnet native gas and ERC-20 payment assets.

---

## ⚙️ Troubleshooting

* **MetaMask RPC Error**: Make sure your MetaMask is switched to Arc Testnet (Chain ID `5042002`, RPC `https://rpc.testnet.arc.network`). The dashboard will automatically suggest adding it if missing.
* **Out of Gas**: Click the Faucet droplet icon 💧 in the top header menu to receive free native USDC gas (denominated with 18 decimals on Arc) and stablecoins (6 decimals).

---

## 📄 License

InferPay is released under the **MIT License**. See [LICENSE](LICENSE) for details.
