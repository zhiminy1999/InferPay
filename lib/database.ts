import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// -------------------------------------------------------------
// Supabase Cloud Sync Configuration
// -------------------------------------------------------------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase: any = null
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    })
    console.log('[Database]: Supabase client connected successfully to:', supabaseUrl)
  } catch (err) {
    console.warn('[Database]: Failed to initialize Supabase client:', err)
  }
} else {
  console.warn('[Database]: Supabase credentials missing from environment. Operating in local-only mode.')
}

// -------------------------------------------------------------
// Fallback Database implementation (JSON)
// -------------------------------------------------------------
class FallbackDB {
  private filepath: string | null = null
  private data: any

  constructor() {
    try {
      const dir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      this.filepath = path.join(dir, 'inferpay_fallback.json')
    } catch {
      try {
        // Fallback to writable /tmp directory on Vercel/lambda environments
        const dir = '/tmp'
        this.filepath = path.join(dir, 'inferpay_fallback.json')
      } catch {
        this.filepath = null
      }
    }

    if (this.filepath && fs.existsSync(this.filepath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.filepath, 'utf-8'))
      } catch {
        this.data = this.getEmptyData()
      }
    } else {
      this.data = this.getEmptyData()
      this.save()
    }
  }

  private getEmptyData() {
    return {
      sessions: [],
      proposals: [],
      jobs: [],
      payments: [],
      swaps: [],
      bridges: [],
      activity_log: [],
      services: [],
    }
  }

  private save() {
    if (!this.filepath) return
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (e: any) {
      console.warn('[Database Fallback]: Failed to write fallback JSON to disk. Operating in-memory.', e.message)
    }
  }

  prepare(sql: string) {
    const self = this
    const cleanSql = sql.replace(/\s+/g, ' ').trim()
    
    return {
      run(...args: any[]) {
        const lower = cleanSql.toLowerCase()
        if (lower.includes('insert into')) {
          const tableMatch = cleanSql.match(/insert into\s+(\w+)/i)
          if (tableMatch) {
            const table = tableMatch[1].toLowerCase()
            const list = self.data[table]
            if (list) {
              const colPart = cleanSql.match(/\(([^)]+)\)\s*values/i)
              if (colPart) {
                const cols = colPart[1].split(',').map(c => c.trim())
                const row: any = {}
                cols.forEach((col, idx) => {
                  row[col] = args[idx]
                })
                if (!row.id) {
                  row.id = Date.now().toString() + Math.floor(Math.random() * 1000).toString()
                }
                list.push(row)
                self.save()
              }
            }
          }
        } else if (lower.includes('update')) {
          const tableMatch = cleanSql.match(/update\s+(\w+)/i)
          if (tableMatch) {
            const table = tableMatch[1].toLowerCase()
            const list = self.data[table]
            if (list) {
              const setPart = cleanSql.match(/set\s+([^where]+)/i)
              if (setPart) {
                const fields = setPart[1].split(',').map(f => f.split('=')[0].trim().toLowerCase())
                const idVal = args[args.length - 1]
                const item = list.find((x: any) => x.id === idVal)
                if (item) {
                  fields.forEach((field, index) => {
                    item[field] = args[index]
                  })
                  self.save()
                }
              }
            }
          }
        }
        return { changes: 1, lastInsertRowid: Date.now().toString() }
      },
      
      all(...args: any[]) {
        const tableMatch = cleanSql.match(/from\s+(\w+)/i)
        if (tableMatch) {
          const table = tableMatch[1].toLowerCase()
          let list = self.data[table] || []
          
          const whereMatch = cleanSql.match(/where\s+(\w+)\s*=/i)
          if (whereMatch) {
            const fieldName = whereMatch[1].toLowerCase()
            const searchVal = args[0]
            if (searchVal !== undefined) {
              list = list.filter((x: any) => {
                const val = x[fieldName] !== undefined ? x[fieldName] : x[whereMatch[1]]
                return String(val).toLowerCase() === String(searchVal).toLowerCase()
              })
            }
          }
          return list
        }
        return []
      },

      get(...args: any[]) {
        const list = this.all(...args)
        return list && list.length > 0 ? list[0] : null
      }
    }
  }

  exec(sql: string) {
    // Mock exec
  }
}

// -------------------------------------------------------------
// Database Instance Initialization (better-sqlite3 / FallbackDB)
// -------------------------------------------------------------
let localDb: any

try {
  const Database = require('better-sqlite3')
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  localDb = new Database(path.join(dir, 'inferpay.db'))
  
  // Create tables using SQLite schema
  localDb.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      tx_hash TEXT,
      block_number INTEGER,
      timestamp INTEGER,
      wallet_address TEXT,
      amount REAL,
      status TEXT,
      metadata TEXT
    );
    
    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      tx_hash TEXT,
      block_number INTEGER,
      timestamp INTEGER,
      wallet_address TEXT,
      amount REAL,
      status TEXT,
      metadata TEXT
    );
    
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      tx_hash TEXT,
      block_number INTEGER,
      timestamp INTEGER,
      wallet_address TEXT,
      amount REAL,
      status TEXT,
      metadata TEXT
    );
    
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      tx_hash TEXT,
      block_number INTEGER,
      timestamp INTEGER,
      wallet_address TEXT,
      amount REAL,
      status TEXT,
      metadata TEXT
    );
    
    CREATE TABLE IF NOT EXISTS swaps (
      id TEXT PRIMARY KEY,
      tx_hash TEXT,
      block_number INTEGER,
      timestamp INTEGER,
      wallet_address TEXT,
      amount REAL,
      status TEXT,
      metadata TEXT
    );
    
    CREATE TABLE IF NOT EXISTS bridges (
      id TEXT PRIMARY KEY,
      tx_hash TEXT,
      block_number INTEGER,
      timestamp INTEGER,
      wallet_address TEXT,
      amount REAL,
      status TEXT,
      metadata TEXT
    );
    
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      tx_hash TEXT,
      block_number INTEGER,
      timestamp INTEGER,
      wallet_address TEXT,
      amount REAL,
      status TEXT,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT,
      capability TEXT,
      pricing REAL,
      reputation REAL,
      wallet_address TEXT,
      metadata TEXT
    );
  `)
  
  
} catch (e) {
  console.warn('Native better-sqlite3 not available, falling back to JSON persistence:', e)
  localDb = new FallbackDB()
}

// Seed initial jobs if the database is empty (works for both SQLite and FallbackDB)
try {
  let isJobsEmpty = false
  if (localDb.data) {
    if (!localDb.data.jobs || localDb.data.jobs.length === 0) {
      isJobsEmpty = true
    }
  } else {
    const jobCount = localDb.prepare('SELECT COUNT(*) as count FROM jobs').get() as any
    if (jobCount && jobCount.count === 0) {
      isJobsEmpty = true
    }
  }

  if (isJobsEmpty) {
    console.log('[Database]: Seeding initial autonomous jobs data...')
    const seedJobsList = [
      {
        id: 'job-1',
        tx_hash: '0x1c97a8ec584ef7a8de9b5ec284c78dbd71214ec969f8b544b5bec39b1ecee0fb',
        block_number: 1042345,
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
        wallet_address: '0xDEVEL_WALLET_PLACEHOLDER',
        amount: 2.5,
        status: 'COMPLETED',
        metadata: JSON.stringify({
          title: 'Social Media Sentiment Analysis Campaign',
          agentId: 'agent-deepseek-coder',
          resultSummary: 'Analyzed 1,250 Twitter/X posts regarding stablecoin commerce stack. Average sentiment score: 0.76 (Highly positive). Output reports saved to IPFS.'
        })
      },
      {
        id: 'job-2',
        tx_hash: '0x2c97a8ec584ef7a8de9b5ec284c78dbd71214ec969f8b544b5bec39b1ecee0fb',
        block_number: 1043120,
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
        wallet_address: '0xDEVEL_WALLET_PLACEHOLDER',
        amount: 8.0,
        status: 'IN_PROGRESS',
        metadata: JSON.stringify({
          title: 'Token Yield Optimization Model',
          agentId: 'agent-yield-maximizer',
          resultSummary: 'Evaluating Base, Arbitrum, and Arc yields. Optimized gas-allocation strategy in progress...'
        })
      },
      {
        id: 'job-3',
        tx_hash: '0x3c97a8ec584ef7a8de9b5ec284c78dbd71214ec969f8b544b5bec39b1ecee0fb',
        block_number: 1043990,
        timestamp: Math.floor(Date.now() / 1000) - 86400 * 1,
        wallet_address: '0xDEVEL_WALLET_PLACEHOLDER',
        amount: 12.0,
        status: 'PENDING',
        metadata: JSON.stringify({
          title: 'Smart Contract Compliance Audit v3',
          agentId: 'agent-security-auditor',
          resultSummary: 'Awaiting escrow funding to initiate security scanning models.'
        })
      },
      {
        id: 'job-4',
        tx_hash: '0x4c97a8ec584ef7a8de9b5ec284c78dbd71214ec969f8b544b5bec39b1ecee0fb',
        block_number: 1044550,
        timestamp: Math.floor(Date.now() / 1000) - 3600 * 4,
        wallet_address: '0x08Ec3EEfC622b8a8742fC8Ab48E832c236bc360B',
        amount: 1.5,
        status: 'COMPLETED',
        metadata: JSON.stringify({
          title: 'Competitor Price Indexation Web Scraping',
          agentId: 'agent-scraping-master',
          resultSummary: 'Indexed 14 e-commerce merchant portals. Average USDC payment discount is 1.5% compared to credit cards.'
        })
      }
    ]

    if (localDb.data) {
      localDb.data.jobs = seedJobsList
      localDb.save()
    } else {
      const insertStmt = localDb.prepare(`
        INSERT INTO jobs (id, tx_hash, block_number, timestamp, wallet_address, amount, status, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      for (const job of seedJobsList) {
        insertStmt.run(
          job.id,
          job.tx_hash,
          job.block_number,
          job.timestamp,
          job.wallet_address,
          job.amount,
          job.status,
          job.metadata
        )
      }
    }
    console.log('[Database]: Seeded jobs successfully.')
  }
} catch (seedErr) {
  console.warn('[Database]: Failed to seed jobs:', seedErr)
}

// -------------------------------------------------------------
// Supabase Syncing Logic
// -------------------------------------------------------------
async function syncFromSupabase() {
  if (!supabase) return
  console.log('[Database Sync]: Pulling cloud backups from Supabase...')
  const tables = ['sessions', 'proposals', 'jobs', 'payments', 'swaps', 'bridges', 'activity_log', 'services']

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*')
      if (error) {
        console.warn(`[Database Sync]: Failed to pull table "${table}" from Supabase:`, error.message)
        continue
      }
      if (data && data.length > 0) {
        let syncedCount = 0
        for (const row of data) {
          // Check if record exists locally
          const exists = localDb.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(row.id)
          if (!exists) {
            const columns = Object.keys(row)
            const placeholders = columns.map(() => '?').join(', ')
            const values = columns.map(col => {
              const val = row[col]
              return typeof val === 'object' && val !== null ? JSON.stringify(val) : val
            })
            localDb.prepare(`
              INSERT INTO ${table} (${columns.join(', ')})
              VALUES (${placeholders})
            `).run(...values)
            syncedCount++
          }
        }
        if (syncedCount > 0) {
          console.log(`[Database Sync]: Restored ${syncedCount} rows for table "${table}" from Supabase cache`)
        }
      }
    } catch (err: any) {
      console.warn(`[Database Sync]: Sync failure on table "${table}":`, err.message)
    }
  }
  console.log('[Database Sync]: Local caches are up to date with Supabase cloud!')
}

async function syncWriteToSupabase(sql: string, args: any[]) {
  const cleanSql = sql.replace(/\s+/g, ' ').trim()
  const lower = cleanSql.toLowerCase()

  if (lower.includes('insert into')) {
    const tableMatch = cleanSql.match(/insert into\s+(\w+)/i)
    if (!tableMatch) return
    const table = tableMatch[1].toLowerCase()

    const colPart = cleanSql.match(/\(([^)]+)\)\s*values/i)
    if (!colPart) return
    const cols = colPart[1].split(',').map(c => c.trim())

    const row: any = {}
    cols.forEach((col, idx) => {
      row[col] = args[idx]
    })

    if (!row.id) {
      row.id = Date.now().toString() + Math.floor(Math.random() * 1000).toString()
    }

    const { error } = await supabase.from(table).upsert([row])
    if (error) {
      console.warn(`[Database Sync Write Error for ${table}]:`, error.message)
    } else {
      console.log(`[Database Sync]: Successfully replicated insert in "${table}" to Supabase`)
    }
  } else if (lower.includes('update')) {
    const tableMatch = cleanSql.match(/update\s+(\w+)/i)
    if (!tableMatch) return
    const table = tableMatch[1].toLowerCase()

    // Extract SET columns, e.g., "SET status = ?, amount = ?"
    const setMatch = cleanSql.match(/set\s+([^where]+)/i)
    if (!setMatch) return
    const setColumns = setMatch[1].split(',').map(c => c.split('=')[0].trim().toLowerCase())

    const updatePayload: any = {}
    setColumns.forEach((col, idx) => {
      updatePayload[col] = args[idx]
    })

    // The last argument is typically the WHERE parameter (id)
    const id = args[args.length - 1]

    const { error } = await supabase.from(table).update(updatePayload).eq('id', id)
    if (error) {
      console.warn(`[Database Sync Update Error for ${table}]:`, error.message)
    } else {
      console.log(`[Database Sync]: Successfully replicated update in "${table}" to Supabase`)
    }
  }
}

// Trigger background startup pull sync
syncFromSupabase().catch(err => {
  console.error('[Database Sync]: Async sync failed:', err)
})

// -------------------------------------------------------------
// Statement and Database Wrappers
// -------------------------------------------------------------
class StatementWrapper {
  private stmt: any
  private sql: string

  constructor(stmt: any, sql: string) {
    this.stmt = stmt
    this.sql = sql
  }

  run(...args: any[]) {
    // 1. Write locally
    const result = this.stmt.run(...args)

    // 2. Sync asynchronously to Supabase
    if (supabase) {
      syncWriteToSupabase(this.sql, args).catch((err: any) => {
        console.warn('[Supabase Sync Error]:', err.message)
      })
    }

    return result
  }

  all(...args: any[]) {
    return this.stmt.all(...args)
  }

  get(...args: any[]) {
    if (this.stmt.get) {
      return this.stmt.get(...args)
    }
    const rows = this.stmt.all(...args)
    return rows.length > 0 ? rows[0] : undefined
  }
}

class DatabaseWrapper {
  prepare(sql: string) {
    const cleanSql = sql.replace(/\s+/g, ' ').trim()
    const stmt = localDb.prepare(cleanSql)
    return new StatementWrapper(stmt, cleanSql)
  }

  exec(sql: string) {
    return localDb.exec(sql)
  }
}

const db = new DatabaseWrapper()

// Initialize RAG virtual tables and seed developer documentation
if (!(localDb instanceof FallbackDB)) {
  try {
    const { initAndSeedRag } = require('../src/rag/ingest')
    initAndSeedRag()
  } catch (ragErr: any) {
    console.warn('[Database RAG Setup]: Warning seeding RAG tables:', ragErr.message)
  }
}

export { db }
