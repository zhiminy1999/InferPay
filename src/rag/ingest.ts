import { db } from '../../lib/database'

export interface DocChunk {
  title: string
  content: string
  category: string
  urlRef: string
}

/**
 * Creates the virtual FTS5 table in SQLite and seeds standard developer documentation chunks.
 */
export async function initAndSeedRag() {
  try {
    // 1. Create SQLite FTS5 Virtual Table for full-text search
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
        title,
        content,
        category,
        url_ref
      );
    `)

    // Check if documents are already indexed
    const countRow = db.prepare("SELECT count(*) as count FROM docs_fts").get() as { count: number }
    if (countRow && countRow.count > 0) {
      console.log('[RAG Service]: Search index already contains records. Skipping seeding.')
      return
    }

    console.log('[RAG Service]: Seeding developer documentation chunks...')

    // Seed docs chunks matching app/docs page contents
    const seedDocs: DocChunk[] = [
      {
        title: 'InferPay Introduction',
        category: 'core',
        urlRef: '/docs#intro',
        content: 'InferPay is an autonomous treasury commerce stack deployed on the Arc Chain and Arc Testnet. It provides gasless automation, on-chain policies, and EIP-712 session budgets so AI agent smart accounts can transact autonomously. Gas is paid entirely in USDC stablecoin, eliminating the need for holding native gas tokens.'
      },
      {
        title: 'Quick Start SDK Guide',
        category: 'sdk',
        urlRef: '/docs#quickstart',
        content: 'To initialize the InferPay SDK: import { InferPaySDK } from "@inferpay/sdk". Configure it with an API key and RPC URL. Establish a session key allowance to authorize an agent address. Example code: client.createSession({ agentAddress, limitUsdc: "500.00", expiresInSeconds: 86400 }).'
      },
      {
        title: 'x402 Micropayments Protocol',
        category: 'protocol',
        urlRef: '/docs#x402',
        content: 'The x402 protocol is a challenge-response micropayments framework. If a request returns HTTP 402, the server specifies the price and recipient in the PAYMENT-REQUIRED header. The client signs an EIP-712 TransferWithAuthorization voucher and retries with the PAYMENT-SIGNATURE header. Payments are settled on-chain.'
      },
      {
        title: 'Agent Identity and Directory',
        category: 'identity',
        urlRef: '/docs#identity',
        content: 'Agents register their identities inside the reputation registry. Reputation is dynamically calculated based on successful jobs completed, average latency, gas efficiency, and budget compliance. Reputation scoring ensures secure commerce discovery.'
      }
    ]

    const insertStmt = db.prepare(`
      INSERT INTO docs_fts (title, content, category, url_ref)
      VALUES (?, ?, ?, ?)
    `)

    for (const doc of seedDocs) {
      insertStmt.run(doc.title, doc.content, doc.category, doc.urlRef)
    }

    console.log(`[RAG Service]: Seeded ${seedDocs.length} chunks successfully!`)
  } catch (err: any) {
    console.error('[RAG Service Init Error]:', err.message)
  }
}

/**
 * Searches the virtual FTS5 documentation index using SQLite full-text search query templates.
 */
export function searchDocs(query: string): DocChunk[] {
  try {
    if (!query.trim()) return []
    // Sanitize query to prevent syntax issues in FTS5 boolean logic
    const sanitized = query.replace(/[^\w\s]/g, ' ').trim()
    if (!sanitized) return []

    const results = db.prepare(`
      SELECT title, content, category, url_ref as urlRef
      FROM docs_fts
      WHERE docs_fts MATCH ?
      LIMIT 5
    `).all(sanitized) as DocChunk[]

    return results
  } catch (err: any) {
    console.error('[RAG Search Error]:', err.message)
    return []
  }
}
