# InferPay

**Autonomous financial infrastructure for AI-driven organizations.** InferPay gives businesses a complete treasury operating system where AI agents handle payments, optimize idle capital, and coordinate high-value approvals — all settled in stablecoins on Arc with sub-second finality and fractions-of-a-cent transaction costs.

---

## Why This Exists

The economics of running AI agents at scale create a paradox: agents need spending authority to be useful, but unrestricted access to company funds is reckless. Traditional finance solves this with slow approval chains and manual oversight. InferPay resolves the tension differently — through **programmable spending boundaries enforced at the protocol level**, where every dollar an agent touches is governed by on-chain session policies, time-locked budgets, and multi-party consensus.

The result is a system where a fleet of AI agents can autonomously manage invoices, optimize treasury yields, and coordinate $25,000+ disbursements — while the human operator retains absolute override authority at every layer.

---

## Platform Topology

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
     │  │   .sol       │  │ Escrow.sol│  │ Consensus  │  │
     │  └──────────────┘  └───────────┘  │   .sol     │  │
     │                                   └────────────┘  │
     │       USDC (native gas)    ·    EURC               │
     └────────────────────────────────────────────────────┘
```

The architecture is deliberately flat. There's no middleware, no off-chain relayer, no message queue sitting between the user's intent and on-chain settlement. The frontend talks directly to Arc through viem, and every state mutation is either an EVM transaction or a local simulation that faithfully mirrors one.

---

## Contract Architecture

### AgentEscrow — Session-Bound Spending Policies

The core primitive. A business operator creates a **session** for an AI agent by specifying:

| Parameter | Purpose |
|---|---|
| `ephemeralWallet` | A disposable address the agent controls for this session only |
| `spendLimit` | Maximum USDC the agent can disburse before being cut off |
| `duration` | Wall-clock TTL — the session auto-expires after this window |
| `whitelist[]` | Addresses the agent is permitted to pay (everything else reverts) |

When a session is created, the contract pulls `spendLimit` USDC from the master wallet into escrow. The agent can then call `executeSpend()` against whitelisted targets until budget or time runs out. Calling `sweepSession()` returns unspent funds to the operator.

**Key invariant:** an agent can never access more capital than was explicitly allocated, and it can never send funds to an address outside the pre-approved whitelist. These guarantees hold even if the ephemeral private key is compromised.

### AgentConsensus — M-of-N Approval for Large Disbursements

For payments above a governance threshold (demonstrated at $25,000), a single agent cannot unilaterally execute. Instead:

1. Any authorized agent creates a `Proposal` specifying recipient, amount, and purpose
2. Registered agents vote on-chain via `voteProposal()`
3. The contract auto-executes the transfer once `requiredApprovals` votes are met
4. If consensus stalls or an agent flags the recipient, the human admin can call `humanBypassExecute()` to override

The voting simulation in the UI is rendered as a three-party dialogue between an Operations requester, a Safety reviewer (compliance screening), and a Budget reviewer (fiscal check). The compliance agent can be toggled to simulate a flagged recipient, demonstrating the rejection → human override flow.

### InferPayEscrow — Inference Job Settlement

A lightweight escrow for AI compute payments. Users deposit USDC against a `modelId`, the job is tracked on-chain, and upon completion the admin releases funds to the compute node. This contract demonstrates how inference billing can be settled atomically without trust assumptions.

---

## What the Dashboard Does

The interface is organized around five operational modes, each addressing a distinct treasury management concern:

**Spending Budgets** — Configure how much an AI agent can spend, for how long, and at which vendors. The UI generates an ephemeral keypair, visualizes the fund flow (Company → Escrow → Agent → Approved Service), and lets you reclaim unspent balances instantly.

**Smart Bill Pay** — Select from sample invoices (SaaS renewals, GPU scaling, data purchases). InferPay reads the invoice semantics, auto-routes 90% to the vendor and 10% to company reserves, and settles the full cycle in under 5 seconds. When connected to a wallet, this triggers a real USDC transfer on Arc Testnet.

**Savings Optimizer** — A live yield comparison between USDC and EURC rates. When a spread is detected, the operator can trigger an autonomous cross-currency rebalance. The treasury growth chart tracks cumulative gains from these optimizations over time.

**AI Work Review** — AI assistants submit structured work reports (what they did, measurable outcomes, requested compensation). The operator reviews the proof-of-work summary, verifies the report's authenticity, and approves payment with a single click or `Shift+Enter`.

**Approval Committee** — Simulates a real-time governance deliberation for a $25,000 cloud infrastructure payment. Three AI reviewers (proposer, compliance, auditor) examine the request sequentially at configurable speeds (1x / 2x / Instant). A compliance flag toggle demonstrates the rejection path and human-in-the-loop bypass.

---

## Runtime Environment

Built on Arc Testnet where USDC is the native gas token. This means every transaction fee is denominated in the same stablecoin the business already holds — no volatile gas token, no price uncertainty, no surprise fee spikes.

| Property | Value |
|---|---|
| Chain ID | `5042002` |
| Gas cost per tx | ~0.0004 USDC |
| Finality | Sub-second |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | [testnet.arcscan.app](https://testnet.arcscan.app) |

At 0.0004 USDC per operation, a single dollar of gas funds roughly 2,500 autonomous agent actions. This cost profile is what makes high-frequency agent-to-agent settlement economically viable.

---

## Operational Modes

The platform runs in two modes transparently:

**Demo Mode** (no wallet connected) — All features work with simulated balances persisted in `localStorage`. The faucet adds $1,000 USDC + €1,000 EURC to the demo account. Useful for evaluating the product without any blockchain setup.

**Live Mode** (MetaMask connected) — The dashboard reads real on-chain USDC/EURC balances via `balanceOf()`, bill payments trigger actual `transfer()` calls, and escrow sessions invoke `approve()` against the USDC contract. The faucet modal guides users through Circle's official testnet faucet flow.

Both modes share identical UI and business logic. The only difference is whether state mutations hit the chain or the browser.

---

## Local Development

```bash
git clone git@github.com:zhiminy1999/InferPay.git
cd InferPay
npm install
npm run dev
```

Open `http://localhost:3000`. The application works immediately in Demo Mode — no wallet, no testnet tokens, no configuration required.

To test on-chain interactions, install MetaMask, add Arc Testnet (the app will prompt automatically), and request tokens from [faucet.circle.com](https://faucet.circle.com/).

---

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Chain interaction | viem + wagmi |
| Smart contracts | Solidity ^0.8.24 |
| Network | Arc Testnet (Chain 5042002) |
| Stablecoins | USDC (native) + EURC |
| Styling | Vanilla CSS with brutalist design system |

---

## Project Layout

```
├── app/
│   ├── page.tsx           # Dashboard — all five operational modules
│   ├── layout.tsx         # Root layout with Web3Provider wrapper
│   └── globals.css        # Design system tokens + component styles
├── contracts/
│   ├── AgentEscrow.sol    # Session-bound spending policies
│   ├── AgentConsensus.sol # Multi-agent governance voting
│   └── InferPayEscrow.sol # Inference job settlement escrow
├── lib/
│   ├── arc-config.ts      # Arc Testnet chain definition (viem)
│   ├── contracts.ts       # ABIs + deployed addresses
│   └── web3-provider.tsx  # React context for wallet state
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Security Posture

The trust model is designed around the principle that **agents should never be trusted with more authority than their current task requires**:

- Ephemeral wallets are generated per-session and discarded after sweep
- Spend limits are enforced at the contract level — the UI cannot circumvent them
- Target whitelisting prevents agents from routing funds to arbitrary addresses
- Session expiration creates an automatic circuit breaker even if sweep is never called
- Multi-agent consensus prevents any single agent from executing large disbursements
- Human bypass exists as a safety valve but is logged on-chain via `HumanOverrideTriggered`

No private keys, API secrets, or credentials are stored in the codebase. All sensitive configuration is expected in environment variables excluded by `.gitignore`.

---

## License

MIT
