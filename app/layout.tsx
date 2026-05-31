import type { Metadata } from 'next'
import { Web3Provider } from '@/lib/web3-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'InferPay',
  description: 'AI Agent inference payments via Arc Testnet.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
