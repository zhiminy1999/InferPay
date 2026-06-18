import type { Metadata } from 'next'
import { Web3Provider } from '@/lib/web3-provider'
import { ModalProvider } from '@/components/ModalSystem'
import './globals.css'

export const metadata: Metadata = {
  title: 'InferPay — Gasless AI Agent Smart Treasury Commerce Stack',
  description: 'Deploy secure, autonomous AI agent treasuries powered by USDC stablecoins with zero-gas friction on Arc Testnet.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-128x128.png', sizes: '128x128', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#ff5d4b' }
    ]
  },
  manifest: '/site.webmanifest'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
