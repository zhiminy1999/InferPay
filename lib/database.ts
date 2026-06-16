import fs from 'fs'
import path from 'path'

// Fallback Database implementation in case better-sqlite3 fails to install/compile on Windows
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
    
    // Parse placeholders
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
              // Extract columns
              const colPart = cleanSql.match(/\(([^)]+)\)\s*values/i)
              if (colPart) {
                const cols = colPart[1].split(',').map(c => c.trim())
                const row: any = {}
                cols.forEach((col, idx) => {
                  row[col] = args[idx]
                })
                // Ensure ID
                if (!row.id) {
                  row.id = Date.now().toString() + Math.floor(Math.random() * 1000).toString()
                }
                list.push(row)
                self.save()
              }
            }
          }
        } else if (lower.includes('update')) {
          // MOCK update
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
          
          // Simple mock filter logic
          if (cleanSql.includes('where wallet_address =')) {
            const addr = args[0]
            list = list.filter((x: any) => x.wallet_address === addr)
          }
          return list
        }
        return []
      }
    }
  }

  exec(sql: string) {
    // Mock exec
  }
}

let db: any

try {
  // We use require instead of import to load dynamically and support the runtime fallback
  const Database = require('better-sqlite3')
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  db = new Database(path.join(dir, 'inferpay.db'))
  
  // Create tables using SQLite schema
  db.exec(`
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
  db = new FallbackDB()
}

export { db }
