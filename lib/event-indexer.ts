import { createPublicClient, http, parseAbiItem } from 'viem'
import { db } from './database'
import {
  AGENT_ESCROW_ADDRESS,
  AGENT_CONSENSUS_ADDRESS,
} from './contracts'
import { JOB_ESCROW_ADDRESS } from './job-escrow'

const customRpcUrl = process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    public: { http: [customRpcUrl] },
    default: { http: [customRpcUrl] },
  },
}

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
})

// ABIs mapping for events we want to index
const AGENT_ESCROW_EVENTS = [
  parseAbiItem('event SessionCreated(address indexed ephemeralWallet, uint256 spendLimit, uint256 expiration)'),
  parseAbiItem('event SpendExecuted(address indexed ephemeralWallet, address indexed target, uint256 amount)'),
  parseAbiItem('event SessionSwept(address indexed ephemeralWallet, address indexed masterWallet, uint256 amountSwept)'),
]

const AGENT_CONSENSUS_EVENTS = [
  parseAbiItem('event ProposalCreated(uint256 indexed id, address indexed recipient, uint256 amount, string purpose)'),
  parseAbiItem('event ProposalExecuted(uint256 indexed id, address indexed recipient, uint256 amount)'),
]

const JOB_ESCROW_EVENTS = [
  parseAbiItem('event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address evaluator, uint256 expiredAt, address hook)'),
  parseAbiItem('event JobFunded(uint256 indexed jobId, uint256 amount)'),
  parseAbiItem('event JobCompleted(uint256 indexed jobId, bytes32 reason)'),
]

export async function indexOnChainEvents() {
  try {
    // To prevent hitting RPC limits on testnets, we read the last 500 blocks
    const currentBlock = await publicClient.getBlockNumber()
    const startBlock = currentBlock - BigInt(1000) > BigInt(0) ? currentBlock - BigInt(1000) : BigInt(0)

    console.log(`[Event Indexer] Syncing events from block ${startBlock} to ${currentBlock}`)

    // 1. Index AgentEscrow sessions
    for (const eventAbi of AGENT_ESCROW_EVENTS) {
      const logs = await publicClient.getLogs({
        address: AGENT_ESCROW_ADDRESS,
        event: eventAbi,
        fromBlock: startBlock,
        toBlock: currentBlock,
      })

      for (const log of logs) {
        const txHash = log.transactionHash
        const blockNumber = Number(log.blockNumber)
        
        if (log.eventName === 'SessionCreated') {
          const { ephemeralWallet, spendLimit, expiration } = log.args as any
          const amount = Number(spendLimit) / 1000000 // Convert USDC decimals
          const id = `session_${ephemeralWallet}_${blockNumber}`
          
          try {
            db.prepare(`
              INSERT OR IGNORE INTO sessions (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              id,
              txHash,
              blockNumber,
              Math.floor(Date.now() / 1000),
              ephemeralWallet,
              amount,
              'SUCCESS',
              JSON.stringify({ expiration: Number(expiration), event: 'SessionCreated' })
            )
          } catch (err) {
            console.error('Error indexing SessionCreated log:', err)
          }
        }
      }
    }

    // 2. Index AgentConsensus proposals
    for (const eventAbi of AGENT_CONSENSUS_EVENTS) {
      const logs = await publicClient.getLogs({
        address: AGENT_CONSENSUS_ADDRESS,
        event: eventAbi,
        fromBlock: startBlock,
        toBlock: currentBlock,
      })

      for (const log of logs) {
        const txHash = log.transactionHash
        const blockNumber = Number(log.blockNumber)

        if (log.eventName === 'ProposalCreated') {
          const { id, recipient, amount, purpose } = log.args as any
          const parsedAmount = Number(amount) / 1000000
          const proposalId = `proposal_${id}`

          try {
            db.prepare(`
              INSERT OR IGNORE INTO proposals (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              proposalId,
              txHash,
              blockNumber,
              Math.floor(Date.now() / 1000),
              recipient,
              parsedAmount,
              'PENDING',
              JSON.stringify({ purpose, event: 'ProposalCreated' })
            )
          } catch (err) {
            console.error('Error indexing ProposalCreated log:', err)
          }
        } else if (log.eventName === 'ProposalExecuted') {
          const { id } = log.args as any
          const proposalId = `proposal_${id}`
          
          try {
            db.prepare(`
              UPDATE proposals SET status = ? WHERE id = ?
            `).run('APPROVED', proposalId)
          } catch (err) {
            console.error('Error updating ProposalExecuted log:', err)
          }
        }
      }
    }

    // 3. Index JobEscrow jobs
    for (const eventAbi of JOB_ESCROW_EVENTS) {
      const logs = await publicClient.getLogs({
        address: JOB_ESCROW_ADDRESS,
        event: eventAbi,
        fromBlock: startBlock,
        toBlock: currentBlock,
      })

      for (const log of logs) {
        const txHash = log.transactionHash
        const blockNumber = Number(log.blockNumber)

        if (log.eventName === 'JobCreated') {
          const { jobId, client, provider, evaluator, expiredAt } = log.args as any
          const jobIdStr = `job_${jobId}`

          try {
            db.prepare(`
              INSERT OR IGNORE INTO jobs (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              jobIdStr,
              txHash,
              blockNumber,
              Math.floor(Date.now() / 1000),
              client,
              0, // budget not set yet
              'OPEN',
              JSON.stringify({ provider, evaluator, expiredAt: Number(expiredAt), event: 'JobCreated' })
            )
          } catch (err) {
            console.error('Error indexing JobCreated log:', err)
          }
        } else if (log.eventName === 'JobFunded') {
          const { jobId, amount } = log.args as any
          const jobIdStr = `job_${jobId}`
          const parsedAmount = Number(amount) / 1000000

          try {
            db.prepare(`
              UPDATE jobs SET status = ?, amount = ? WHERE id = ?
            `).run('FUNDED', parsedAmount, jobIdStr)
          } catch (err) {
            console.error('Error updating JobFunded log:', err)
          }
        } else if (log.eventName === 'JobCompleted') {
          const { jobId } = log.args as any
          const jobIdStr = `job_${jobId}`

          try {
            db.prepare(`
              UPDATE jobs SET status = ? WHERE id = ?
            `).run('COMPLETED', jobIdStr)
          } catch (err) {
            console.error('Error updating JobCompleted log:', err)
          }
        }
      }
    }

    console.log('[Event Indexer] Sync finished successfully')
    return { success: true }
  } catch (error) {
    console.error('[Event Indexer] Sync failed:', error)
    return { success: false, error }
  }
}
