'use client'

import React from 'react'
import './BrandIcon.css'

interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  name: string
  size?: number | string
  animation?: 'float' | 'pulse' | 'glow' | 'spin-slow' | 'none'
  variant?: 'coral' | 'green' | 'yellow' | 'peach' | 'muted' | 'default'
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  name,
  size = 20,
  animation = 'none',
  variant = 'default',
  style,
  className = '',
  ...props
}) => {
  const sizeStyle = {
    width: size,
    height: size,
    flexShrink: 0,
    ...style
  }

  const classes = [
    'brand-icon',
    `variant-${variant}`,
    animation !== 'none' ? `ani-${animation}` : '',
    className
  ].filter(Boolean).join(' ')

  const strokeWidth = 1.5

  const getIconContent = () => {
    switch (name.toLowerCase()) {
      case 'droplet': // Water droplet (faucet)
        return (
          <>
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 12a3 3 0 0 1-3 3" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          </>
        )
      case 'party': // Celebration
        return (
          <>
            <path d="M4 22L12 14L16 18L22 10" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 4h4v4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 4L15 11" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="8" r="2" strokeWidth={strokeWidth} />
            <circle cx="14" cy="5" r="1.5" strokeWidth={strokeWidth} />
            <path d="M10 18l.01-.01" strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d="M19 19l.01-.01" strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        )
      case 'cross': // Error/danger/cancel
        return (
          <>
            <rect x="3" y="3" width="18" height="18" rx="4" strokeWidth={strokeWidth} />
            <path d="M9 9l6 6M15 9l-6 6" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'idea': // Lightbulb (info)
        return (
          <>
            <path d="M15 14c.78-.78 1-2 1-3a4 4 0 1 0-8 0c0 1 .22 2.22 1 3" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 18h6M10 21h4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 7v3M12 11h.01" strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        )
      case 'key': // Ephemeral keys
        return (
          <>
            <circle cx="7.5" cy="12.5" r="4.5" strokeWidth={strokeWidth} />
            <path d="M11 9l7-7 4 4-2.5 2.5-3-3L14 8" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 4.5l1.5 1.5" strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        )
      case 'money': // Payments/micropayments
        return (
          <>
            <rect x="2" y="5" width="20" height="14" rx="3" strokeWidth={strokeWidth} />
            <circle cx="12" cy="12" r="3" strokeWidth={strokeWidth} />
            <path d="M6 9h.01M18 15h.01" strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        )
      case 'shield': // Security/compliance
        return (
          <>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 11l2 2 4-4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'email': // Invoice/bill received
        return (
          <>
            <rect x="2" y="4" width="20" height="16" rx="3" strokeWidth={strokeWidth} />
            <path d="M22 6l-10 7L2 6" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'brain': // AI Agent simulation
        return (
          <>
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15A2.5 2.5 0 0 1 9.5 22 4 4 0 0 1 5.5 18a3.5 3.5 0 0 1 0-7 3.5 3.5 0 0 1 4-9z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15A2.5 2.5 0 0 0 14.5 22a4 4 0 0 0 4-4 3.5 3.5 0 0 0 0-7 3.5 3.5 0 0 0-4-9z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="1.5" strokeWidth={strokeWidth} />
          </>
        )
      case 'chart': // Payout split / treasury analytics
        return (
          <>
            <path d="M3 3v18h18" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 9l-5 5-3-3-4 4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="9" r="1" strokeWidth={strokeWidth} />
            <circle cx="13" cy="14" r="1" strokeWidth={strokeWidth} />
          </>
        )
      case 'suitcase': // Vendor split
        return (
          <>
            <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth={strokeWidth} />
            <path d="M16 7V4a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 12v3" strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        )
      case 'warning': // Alert warning
        return (
          <>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9v4M12 17h.01" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'trend': // Yield generation trend
        return (
          <>
            <path d="M22 7L13.5 15.5L8.5 10.5L2 17" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 7h6v6" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'cash': // Treasury coins
        return (
          <>
            <circle cx="8" cy="8" r="5" strokeWidth={strokeWidth} />
            <circle cx="16" cy="16" r="5" strokeWidth={strokeWidth} />
            <path d="M16 8h.01M8 16h.01" strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        )
      case 'bank': // Corporate treasury / vault
        return (
          <>
            <path d="M3 21h18M3 10h18M5 10v7M9 10v7M15 10v7M19 10v7M12 3l9 4H3l9-4z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'refresh': // Auto Sweep / recycle
        return (
          <>
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.73" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'robot': // AI agent autonomous
        return (
          <>
            <rect x="3" y="11" width="18" height="10" rx="3" strokeWidth={strokeWidth} />
            <path d="M12 2v4M8 5h8" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="15" r="1.5" strokeWidth={strokeWidth} />
            <circle cx="16" cy="15" r="1.5" strokeWidth={strokeWidth} />
            <path d="M9 19h6" strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        )
      case 'shake': // Consensus committee
        return (
          <>
            <path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="4" strokeWidth={strokeWidth} />
          </>
        )
      case 'trophy': // Rewards / top builder
        return (
          <>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 22h16M10 14.66V17c0 1.66-1.34 3-3 3h10c-1.66 0-3-1.34-3-3v-2.34" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2a6 6 0 0 1 6 6c0 3.61-2.46 4.66-6 4.66s-6-1.05-6-4.66a6 6 0 0 1 6-6z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'seed': // Yield generation start
        return (
          <>
            <path d="M12 10a6 6 0 0 0-6-6H3v3a6 6 0 0 0 6 6h3" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 22V12" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 14a5 5 0 0 1 5-5h4v4a5 5 0 0 1-5 5h-4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'piggy': // Spending limit / allowance
        return (
          <>
            <path d="M19 5c-1.5 0-2.8 1.1-3 2.5A9.9 9.9 0 0 0 12 7c-5.5 0-10 4.5-10 10s4.5 10 10 10c1.8 0 3.5-.5 5-1.3l3.3 1.3V23c2.2 0 4-1.8 4-4v-1.7l1.7-1.7c.6-.6.6-1.6 0-2.2L24 11.7V8c0-1.7-1.3-3-3-3h-2z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 14v4M10 16h4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="7.5" cy="11.5" r="1" strokeWidth={strokeWidth} />
          </>
        )
      case 'lock': // Security lock
        return (
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth={strokeWidth} />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'company': // Corporate
        return (
          <>
            <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth={strokeWidth} />
            <path d="M9 6h2M9 10h2M9 14h2M13 6h2M13 10h2M13 14h2M4 18h16" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'lightning': // Gasless / speed
        return (
          <>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'chain': // On-chain block write
        return (
          <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'user': // Human app committee
        return (
          <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="4" strokeWidth={strokeWidth} />
          </>
        )
      case 'balance': // Scale / consensus weighting
        return (
          <>
            <path d="M12 3v18M6 7h12M6 7l-3 6h6l-3-6zM18 7l-3 6h6l-3-6z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'megaphone': // Notification broadcast
        return (
          <>
            <path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 6v12M18 12h4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'star': // Rating/Reputation/Favorite
        return (
          <>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth={strokeWidth} strokeLinejoin="round" />
          </>
        )
      case 'tools': // Task operations
        return (
          <>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      case 'clipboard': // Review checklist
        return (
          <>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            <rect x="8" y="2" width="8" height="4" rx="1" strokeWidth={strokeWidth} />
            <path d="M9 14h6M9 18h4" strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        )
      case 'computer': // Compute service node
        return (
          <>
            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={strokeWidth} />
            <path d="M8 21h8M12 17v4" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )
      default:
        // Fallback droplet shape
        return (
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        )
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      style={sizeStyle}
      className={classes}
      {...props}
    >
      {getIconContent()}
    </svg>
  )
}

export default BrandIcon
