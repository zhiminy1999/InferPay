import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') || 'USDC'
    const to = searchParams.get('to') || 'EURC'

    // Fetch from open.er-api server-side (no CORS restriction)
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 60 } // Next.js server-side caching for 60 seconds
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.statusText}`)
    }

    const data = await response.json()
    if (data && data.rates) {
      if (from === 'USDC' && to === 'EURC') {
        const rate = Number(data.rates.EUR) || 0.925
        return NextResponse.json({ rate })
      } else if (from === 'EURC' && to === 'USDC') {
        const eurRate = Number(data.rates.EUR) || 0.925
        return NextResponse.json({ rate: 1 / eurRate })
      }
    }

    // Fallback if data format is unexpected
    const fallbackRate = from === 'USDC' ? 0.925 : 1.08
    return NextResponse.json({ rate: fallbackRate })
  } catch (error: any) {
    console.error('Error fetching exchange rate in API:', error)
    // Return standard fallback instead of throwing 500 so client is uninterrupted
    const from = new URL(req.url).searchParams.get('from') || 'USDC'
    const fallbackRate = from === 'USDC' ? 0.925 : 1.08
    return NextResponse.json({ rate: fallbackRate, fallback: true })
  }
}
