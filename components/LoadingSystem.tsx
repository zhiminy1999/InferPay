'use client'

import React from 'react'
import { RefreshCw } from 'lucide-react'

// =======================================================
// 1. Generic Skeleton Component
// =======================================================
interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'title' | 'circle' | 'rect'
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({
  width,
  height,
  variant = 'text',
  className = '',
  style = {}
}: SkeletonProps) {
  let variantClass = ''
  if (variant === 'text') variantClass = 'skeleton-text'
  else if (variant === 'title') variantClass = 'skeleton-text heading'
  else if (variant === 'circle') variantClass = 'skeleton-circle'
  else if (variant === 'rect') variantClass = 'skeleton-rect'

  const customStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {})
  }

  return (
    <div 
      className={`skeleton ${variantClass} ${className}`} 
      style={customStyle} 
      aria-hidden="true"
    />
  )
}

// =======================================================
// 2. Inline Spinner Component
// =======================================================
interface SpinnerInlineProps {
  size?: number
  className?: string
  color?: string
}

export function SpinnerInline({
  size = 14,
  className = '',
  color = 'currentColor'
}: SpinnerInlineProps) {
  return (
    <RefreshCw 
      size={size} 
      className={`spinner-inline ${className}`} 
      style={{ color }}
    />
  )
}

// =======================================================
// 3. Button Loading Wrapper
// =======================================================
interface ButtonLoadingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  variantClass?: string // e.g. btn-brutalist, btn-brutalist-pink
}

export function ButtonLoading({
  isLoading,
  loadingText,
  children,
  variantClass = 'btn-brutalist',
  className = '',
  disabled,
  style = {},
  ...props
}: ButtonLoadingProps) {
  // Compute minimum width if loading to avoid size jumping
  return (
    <button
      className={`${variantClass} ${className} ${isLoading ? 'loading' : ''}`}
      disabled={disabled || isLoading}
      style={{
        ...style,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
      {...props}
    >
      {isLoading ? (
        <>
          <SpinnerInline size={14} />
          <span>{loadingText || 'Processing...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

// =======================================================
// 4. Card Skeleton Preset
// =======================================================
export function CardSkeleton() {
  return (
    <div className="brutalist-card skeleton-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Skeleton variant="title" width="60%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="text" width="75%" />
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <Skeleton variant="rect" height={36} width={100} style={{ borderRadius: 'var(--radius-sm)' }} />
        <Skeleton variant="rect" height={36} width={80} style={{ borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  )
}

// =======================================================
// 5. Table Skeleton Preset
// =======================================================
interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 4, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="table-responsive">
      <table className="brutalist-table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={`th-${i}`}>
                <Skeleton width="60%" height={14} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={`tr-${r}`}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={`td-${r}-${c}`}>
                  <Skeleton width={c === 0 ? '40%' : c === cols - 1 ? '50%' : '80%'} height={12} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// =======================================================
// 6. Metrics Skeleton Preset (for stats)
// =======================================================
export function MetricsSkeleton() {
  return (
    <div className="metrics-grid-brutalist">
      {Array.from({ length: 4 }).map((_, i) => (
        <div 
          key={`metric-skel-${i}`}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="title" width="75%" style={{ margin: 0 }} />
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
          <Skeleton variant="text" width="85%" />
        </div>
      ))}
    </div>
  )
}

// =======================================================
// 7. Full-Screen Page/Action Overlay
// =======================================================
interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
}

export function LoadingOverlay({ isOpen, message = 'Transacting on Arc Network...' }: LoadingOverlayProps) {
  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 20, 22, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="brutalist-card" 
        style={{ 
          maxWidth: '380px', 
          width: '90%', 
          padding: 'var(--space-5)', 
          textAlign: 'center',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <RefreshCw 
          className="spin text-coral" 
          size={32} 
          style={{ margin: '0 auto 16px', color: 'var(--accent-coral)' }} 
        />
        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800 }}>Please Confirm</h4>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          {message}
        </p>
      </div>
    </div>
  )
}
