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
  private filepath: string
  private data: any

  constructor() {
    const dir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    this.filepath = path.join(dir, 'inferpay_fallback.json')
    if (fs.existsSync(this.filepath)) {
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
    fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2), 'utf-8')
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
            if (list && args.length >= 2) {
              const status = args[0]
              const id = args[1]
              const item = list.find((x: any) => x.id === id)
              if (item) {
                item.status = status
                self.save()
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
          if (cleanSql.includes('where wallet_address =')) {
            const addr = args[0]
            list = list.filter((x: any) => x.wallet_address === addr)
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
