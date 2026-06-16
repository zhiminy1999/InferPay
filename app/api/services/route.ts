import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Seed initial mock services if none exist
const SEED_SERVICES = [
  {
    id: 'agent-gpt4-vision',
    name: 'AgentGPT-4 Vision',
    capability: 'Image Analysis & Vision OCR',
    pricing: 0.05,
    reputation: 9.8,
    wallet_address: '0x1111111111111111111111111111111111111111',
    metadata: JSON.stringify({
      description: 'Advanced vision processing for OCR, image categorization, and object detection.',
      completionRate: 0.99,
      tags: ['vision', 'ocr', 'gpt-4']
    })
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    capability: 'Code Generation & Debugging',
    pricing: 0.02,
    reputation: 9.5,
    wallet_address: '0x2222222222222222222222222222222222222222',
    metadata: JSON.stringify({
      description: 'High-performance coding assistant supporting python, ts, rust, go, and solidity.',
      completionRate: 0.98,
      tags: ['coding', 'llm', 'autocomplete']
    })
  },
  {
    id: 'llama3-websearch',
    name: 'Llama-3 WebSearch',
    capability: 'Real-time RAG & Web Search',
    pricing: 0.03,
    reputation: 9.2,
    wallet_address: '0x3333333333333333333333333333333333333333',
    metadata: JSON.stringify({
      description: 'Synthesizes web search results into comprehensive markdown summaries.',
      completionRate: 0.96,
      tags: ['rag', 'search', 'llama-3']
    })
  },
  {
    id: 'whisper-translator',
    name: 'Whisper Translator',
    capability: 'Audio Transcription & Translation',
    pricing: 0.01,
    reputation: 8.9,
    wallet_address: '0x4444444444444444444444444444444444444444',
    metadata: JSON.stringify({
      description: 'Translates multivariant audio streams to structured JSON transcription formats.',
      completionRate: 0.94,
      tags: ['audio', 'translation', 'whisper']
    })
  }
]

function ensureSeedData() {
  try {
    const existing = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number }
    if (!existing || existing.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO services (id, name, capability, pricing, reputation, wallet_address, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      for (const service of SEED_SERVICES) {
        stmt.run(
          service.id,
          service.name,
          service.capability,
          service.pricing,
          service.reputation,
          service.wallet_address,
          service.metadata
        )
      }
    }
  } catch (err) {
    // If running in FallbackDB, prepare().get() or getCount might fail or need direct list access
    try {
      const list = db.prepare('SELECT * FROM services').all()
      if (list.length === 0) {
        const stmt = db.prepare(`
          INSERT INTO services (id, name, capability, pricing, reputation, wallet_address, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        for (const service of SEED_SERVICES) {
          stmt.run(
            service.id,
            service.name,
            service.capability,
            service.pricing,
            service.reputation,
            service.wallet_address,
            service.metadata
          )
        }
      }
    } catch (innerErr) {
      console.warn('Could not seed services database:', innerErr)
    }
  }
}

export async function GET(request: Request) {
  try {
    ensureSeedData()
    const { searchParams } = new URL(request.url)
    const capability = searchParams.get('capability')
    const minReputation = parseFloat(searchParams.get('minReputation') || '0')

    const rows = db.prepare('SELECT * FROM services').all() as any[]
    
    // Parse metadata
    let services = rows.map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }))

    // Apply filtering
    if (capability) {
      const search = capability.toLowerCase()
      services = services.filter(s => 
        s.capability.toLowerCase().includes(search) || 
        s.name.toLowerCase().includes(search) ||
        (s.metadata?.tags && s.metadata.tags.some((t: string) => t.toLowerCase().includes(search)))
      )
    }

    if (minReputation > 0) {
      services = services.filter(s => s.reputation >= minReputation)
    }

    // Sort: Reputation-weighted (reputation * completionRate)
    services.sort((a, b) => {
      const aScore = a.reputation * (a.metadata?.completionRate || 1)
      const bScore = b.reputation * (b.metadata?.completionRate || 1)
      return bScore - aScore
    })

    return NextResponse.json({ services })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, capability, pricing, reputation, wallet_address, metadata } = body

    if (!name || !capability || !pricing || !wallet_address) {
      return NextResponse.json({ error: 'Missing required service parameters' }, { status: 400 })
    }

    const serviceId = id || 'service-' + Math.random().toString(36).substring(2, 9)
    const score = reputation || 9.0
    const metaStr = metadata ? JSON.stringify(metadata) : JSON.stringify({ completionRate: 0.95, tags: [] })

    const stmt = db.prepare(`
      INSERT INTO services (id, name, capability, pricing, reputation, wallet_address, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      serviceId,
      name,
      capability,
      parseFloat(pricing),
      parseFloat(score),
      wallet_address,
      metaStr
    )

    return NextResponse.json({ success: true, serviceId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
