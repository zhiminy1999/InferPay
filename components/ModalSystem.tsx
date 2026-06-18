'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  X,
  Play,
  Cpu,
  Info,
  Terminal,
  Activity,
  Flame
} from 'lucide-react'

export type ModalType = 
  | 'confirm' 
  | 'loading' 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'transaction' 
  | 'destructive'

export interface ModalOptions {
  id?: string
  type: ModalType
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  // Transaction specifics
  txHash?: string
  txStatus?: 'pending' | 'confirming' | 'success' | 'failed' | 'timeout' | 'rejected'
  networkName?: string
  explorerUrl?: string
  // Error / Retry flows
  onRetry?: () => void | Promise<void>
  // Behaviour
  preventCloseOnOverlayClick?: boolean
  showCloseButton?: boolean
  autoCloseMs?: number
}

interface ModalContextProps {
  modals: ModalOptions[]
  showModal: (options: Omit<ModalOptions, 'id'>) => Promise<boolean>
  showTransactionModal: (txHash: string, status?: ModalOptions['txStatus'], network?: string) => string
  updateTransactionStatus: (id: string, status: ModalOptions['txStatus'], errorMsg?: string) => void
  hideModal: (id?: string) => void
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalOptions[]>([])

  const hideModal = useCallback((id?: string) => {
    setModals(prev => {
      if (!id) {
        // Pop the last one
        return prev.slice(0, -1)
      }
      return prev.filter(m => m.id !== id)
    })
  }, [])

  const showModal = useCallback((options: Omit<ModalOptions, 'id'>) => {
    return new Promise<boolean>((resolve) => {
      const id = 'modal_' + Math.random().toString(36).substring(2, 9)
      
      const newModal: ModalOptions = {
        ...options,
        id,
        onConfirm: async () => {
          try {
            if (options.onConfirm) {
              await options.onConfirm()
            }
            resolve(true)
            hideModal(id)
          } catch (err) {
            console.error("Modal confirmation execution error:", err)
            // Transit modal status to error inside the stack
            setModals(current => current.map(m => {
              if (m.id === id) {
                return {
                  ...m,
                  type: 'error',
                  title: 'Execution Failed',
                  message: err instanceof Error ? err.message : 'An error occurred during operation.'
                }
              }
              return m
            }))
          }
        },
        onCancel: () => {
          if (options.onCancel) {
            options.onCancel()
          }
          resolve(false)
          hideModal(id)
        }
      }

      setModals(prev => [...prev, newModal])

      // Auto close helper
      if (options.autoCloseMs) {
        setTimeout(() => {
          resolve(false)
          hideModal(id)
        }, options.autoCloseMs)
      }
    })
  }, [hideModal])

  // Custom helper specifically for easy transaction status updates
  const showTransactionModal = useCallback((txHash: string, status: ModalOptions['txStatus'] = 'pending', network = 'Arc Testnet') => {
    const id = 'tx_modal_' + Math.random().toString(36).substring(2, 9)
    const explorerBase = 'https://explorer.arc.circle.com/tx/' // Simulated/Real Arc explorer
    
    const newModal: ModalOptions = {
      id,
      type: 'transaction',
      title: 'Executing Transaction',
      message: 'Submitting transaction payload to the decentralized network relayer...',
      txHash,
      txStatus: status,
      networkName: network,
      explorerUrl: explorerBase + txHash,
      confirmText: 'View Explorer',
      cancelText: 'Close',
      onConfirm: () => {
        window.open(explorerBase + txHash, '_blank')
      },
      onCancel: () => {
        hideModal(id)
      }
    }

    setModals(prev => [...prev, newModal])
    return id
  }, [hideModal])

  const updateTransactionStatus = useCallback((id: string, status: ModalOptions['txStatus'], errorMsg?: string) => {
    setModals(prev => prev.map(m => {
      if (m.id === id) {
        let title = m.title
        let message = m.message
        let type = m.type

        if (status === 'confirming') {
          title = 'Confirming On-Chain'
          message = 'Waiting for block confirmation from Arc Chain validators...'
        } else if (status === 'success') {
          title = 'Transaction Confirmed'
          message = 'Transaction successfully processed and settled on the blockchain network!'
          type = 'success'
        } else if (status === 'failed') {
          title = 'Transaction Failed'
          message = errorMsg || 'The transaction was reverted on-chain. Please verify gas balance policies.'
          type = 'error'
        } else if (status === 'rejected') {
          title = 'Signature Rejected'
          message = 'The signature request was declined by the wallet operator.'
          type = 'warning'
        } else if (status === 'timeout') {
          title = 'Relay Timeout'
          message = 'The relay pool timed out waiting for validator response. The transaction may settle eventually.'
          type = 'error'
        }

        return {
          ...m,
          title,
          message,
          type,
          txStatus: status
        }
      }
      return m
    }))
  }, [])

  return (
    <ModalContext.Provider value={{ modals, showModal, showTransactionModal, updateTransactionStatus, hideModal }}>
      {children}
      <ModalRenderer modals={modals} hideModal={hideModal} />
    </ModalContext.Provider>
  )
}

// Internal renderer that displays all stacked modals with appropriate overlays
function ModalRenderer({ modals, hideModal }: { modals: ModalOptions[]; hideModal: (id?: string) => void }) {
  if (modals.length === 0) return null

  // Focus trap ref
  return (
    <div style={{ zIndex: 10000, position: 'relative' }}>
      {modals.map((modal, index) => {
        const isTop = index === modals.length - 1
        return (
          <ModalItem 
            key={modal.id || index} 
            modal={modal} 
            isTop={isTop} 
            onClose={() => hideModal(modal.id)} 
          />
        )
      })}
    </div>
  )
}

function ModalItem({ modal, isTop, onClose }: { modal: ModalOptions; isTop: boolean; onClose: () => void }) {
  const [isActionLoading, setIsActionLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle ESC key press
  useEffect(() => {
    if (!isTop || modal.type === 'loading' || isActionLoading) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modal.onCancel) {
          modal.onCancel()
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTop, modal, isActionLoading, onClose])

  // Focus the modal container on open for accessibility
  useEffect(() => {
    if (isTop && containerRef.current) {
      containerRef.current.focus()
    }
  }, [isTop])

  const handleConfirm = async () => {
    if (modal.onConfirm) {
      setIsActionLoading(true)
      try {
        await modal.onConfirm()
      } finally {
        setIsActionLoading(false)
      }
    } else {
      onClose()
    }
  }

  const handleCancel = () => {
    if (modal.onCancel) {
      modal.onCancel()
    } else {
      onClose()
    }
  }

  // Prevent background clicks when loading
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modal.type === 'loading' || isActionLoading || modal.preventCloseOnOverlayClick) {
      return // block click closing
    }
    handleCancel()
  }

  // Render variant icons
  const renderIcon = () => {
    const size = 32
    switch (modal.type) {
      case 'loading':
        return <RefreshCw size={size} className="spin" style={{ color: 'var(--accent-coral)' }} />
      case 'success':
        return <CheckCircle2 size={size} style={{ color: 'var(--accent-green)' }} />
      case 'error':
        return <ShieldAlert size={size} style={{ color: '#dc2626' }} />
      case 'warning':
        return <AlertTriangle size={size} style={{ color: 'var(--accent-yellow)' }} />
      case 'destructive':
        return <Flame size={size} style={{ color: '#dc2626' }} />
      case 'transaction':
        if (modal.txStatus === 'success') {
          return <CheckCircle2 size={size} style={{ color: 'var(--accent-green)' }} />
        } else if (modal.txStatus === 'failed' || modal.txStatus === 'timeout') {
          return <ShieldAlert size={size} style={{ color: '#dc2626' }} />
        } else if (modal.txStatus === 'rejected') {
          return <AlertTriangle size={size} style={{ color: 'var(--accent-yellow)' }} />
        } else {
          return <Activity size={size} className="blink" style={{ color: '#a78bfa' }} />
        }
      case 'confirm':
      default:
        return <HelpCircle size={size} style={{ color: 'var(--text-muted)' }} />
    }
  }

  // Determine destructive/primary class button overrides
  const getPrimaryButtonClass = () => {
    if (modal.type === 'destructive') return 'btn-brutalist btn-brutalist-pink'
    if (modal.type === 'success') return 'btn-brutalist'
    return 'btn-brutalist btn-brutalist-pink'
  }

  return (
    <div 
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 20, 22, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isTop ? 1 : 0.6,
        pointerEvents: isTop ? 'auto' : 'none',
        transition: 'all 0.25s ease',
        zIndex: 10001
      }}
    >
      <div 
        ref={containerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()} // stop click bubbling
        className="modal-container"
        style={{
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-hover)',
          maxWidth: '480px',
          width: '90%',
          borderWidth: modal.type === 'destructive' ? '2px' : '1px',
          borderColor: modal.type === 'destructive' ? '#dc2626' : 'var(--border)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderIcon()}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '18px', 
              fontWeight: 700, 
              margin: 0, 
              color: modal.type === 'destructive' ? '#dc2626' : 'var(--text-main)' 
            }}>
              {modal.title}
            </h4>
          </div>
          {modal.showCloseButton !== false && modal.type !== 'loading' && !isActionLoading && (
            <button 
              onClick={handleCancel}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-light)',
                padding: '4px'
              }}
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ 
          fontSize: '13.5px', 
          color: 'var(--text-muted)', 
          lineHeight: '1.5',
          fontFamily: modal.type === 'loading' ? 'monospace' : 'var(--font-sans)'
        }}>
          {modal.message}

          {/* Blockchain specifics card layout */}
          {modal.type === 'transaction' && modal.txHash && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: 'var(--bg-inner)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'monospace',
              fontSize: '11.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Network:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{modal.networkName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-light)' }}>Tx Hash:</span>
                <span style={{ color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {modal.txHash.slice(0, 10)}...{modal.txHash.slice(-8)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-light)' }}>Gas Sponsorship:</span>
                <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                  Sponsored by Arc Relayer
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        {modal.type !== 'loading' && (
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end', 
            marginTop: '8px', 
            borderTop: '1px solid var(--border)', 
            paddingTop: '16px' 
          }}>
            {/* Cancel Button */}
            {modal.type !== 'success' && modal.type !== 'error' && (
              <button 
                onClick={handleCancel}
                className="btn-brutalist"
                disabled={isActionLoading}
                style={{ 
                  backgroundColor: 'var(--bg-card)', 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--border)',
                  height: '38px',
                  fontSize: '12.5px',
                  padding: '0 16px',
                  opacity: isActionLoading ? 0.5 : 1
                }}
              >
                {modal.cancelText || 'Cancel'}
              </button>
            )}

            {/* Confirm / Action Button */}
            <button 
              onClick={handleConfirm}
              className={getPrimaryButtonClass()}
              disabled={isActionLoading}
              style={{
                height: '38px',
                fontSize: '12.5px',
                padding: '0 20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isActionLoading && <RefreshCw size={14} className="spin" />}
              {modal.confirmText || (modal.type === 'destructive' ? 'Delete' : 'Confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
