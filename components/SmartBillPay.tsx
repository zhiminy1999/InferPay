'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Send, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react'
import { useBillPay } from '@/hooks/useBillPay'
import { USDC_ADDRESS_ARC, erc20Abi } from '@/lib/contracts'
import { formatUnits } from 'viem'

interface SmartBillPayProps {
  isConnected: boolean
  address: string | null
  walletClient: any
  publicClient: any
  addActivity: (title: string, desc: string, emoji: string, type?: 'success' | 'warning' | 'danger' | 'info' | 'default') => void
}

const intentsPreload = [
  { id: 'renew_subscription', name: 'Renew Software Subscriptions — $250', amount: 250, type: 'split', details: 'Your assistant reads the invoice from tools like Figma or Canva, pays it on time, and logs the expense for your records.' },
  { id: 'scale_gpu', name: 'Scale Up Cloud Computing — $100', amount: 100, type: 'escrow', details: 'When your servers get busy, InferPay automatically adds more computing power so your services stay fast.' },
  { id: 'data_purchase', name: 'Purchase Data & Research — $450', amount: 450, type: 'split', details: 'Your AI assistant buys verified research datasets your team needs, without waiting for manual approval.' }
]

export function SmartBillPay({
  isConnected,
  address,
  walletClient,
  publicClient,
  addActivity
}: SmartBillPayProps) {
  // Local States
  const [intentSelection, setIntentSelection] = useState<string>('renew_subscription')
  const [intentAmount, setIntentAmount] = useState<number>(250)
  const [isIntentLoading, setIsIntentLoading] = useState(false)
  const [vendorTx, setVendorTx] = useState<string | null>(null)
  const [reserveTx, setReserveTx] = useState<string | null>(null)
  const [approveTx, setApproveTx] = useState<string | null>(null)
  const [jobId, setJobId] = useState<number | null>(null)
  
  // Balance monitoring states
  const [usdcBalance, setUsdcBalance] = useState<string>('0.00')

  // Timeline Step Tracker
  const [currentStep, setCurrentStep] = useState<number>(0)

  // On-chain Bill Pay hook
  const {
    isPayLoading,
    txHashes,
    txStatus,
    errorMsg,
    payStandardBill,
    payInferenceBill
  } = useBillPay({
    isConnected,
    address: address as `0x${string}` | undefined,
    walletClient,
    publicClient,
    addActivity
  })

  // Load user USDC balance on mount & tab select
  const fetchBalance = async () => {
    if (isConnected && address && publicClient) {
      try {
        const balRaw = await publicClient.readContract({
          address: USDC_ADDRESS_ARC,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        })
        setUsdcBalance(Number(formatUnits(balRaw, 6)).toFixed(2))
      } catch (err) {
        console.error("Failed to fetch balance:", err)
      }
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [isConnected, address, publicClient])

  const handleTriggerIntent = async () => {
    setIsIntentLoading(true)
    setCurrentStep(1)
    addActivity('Bill received', 'Reading and analyzing the incoming invoice.', '✉️', 'info')
    
    const intent = intentsPreload.find(i => i.id === intentSelection)
    if (!intent) {
      setIsIntentLoading(false)
      return
    }

    setVendorTx(null)
    setReserveTx(null)
    setApproveTx(null)
    setJobId(null)

    if (isConnected && walletClient && address && publicClient) {
      // --- REAL ON-CHAIN MODE ---
      try {
        setCurrentStep(2) // Bill details analyzed
        addActivity('Bill analyzed', `${intent.name}. Total: $${intent.amount} USDC.`, '🧠', 'info')

        if (intent.type === 'split') {
          // Standard split payment (90% vendor / 10% reserve)
          const result = await payStandardBill(intent.amount)
          if (result) {
            setVendorTx(result[0])
            setReserveTx(result[1])
            setCurrentStep(3) // Split completed
            setTimeout(() => {
              setCurrentStep(4) // Settle
              addActivity('Bill split settled', 'Treasury reserve set aside and vendor paid.', '🎉', 'success')
            }, 800)
          } else {
            throw new Error("Split transfer failed")
          }
        } else {
          // Inference bill (escrow deposit)
          const result = await payInferenceBill(intent.amount, 'gpu-scaling')
          if (result) {
            setApproveTx(result[0])
            setVendorTx(result[1])
            setJobId(result[2])
            setCurrentStep(3) // Escrow locked
            setTimeout(() => {
              setCurrentStep(4) // Settle
              addActivity('Inference escrow complete', `Job #${result[2]} active on-chain.`, '🎉', 'success')
            }, 800)
          } else {
            throw new Error("Escrow deposit failed")
          }
        }

        // Refetch balance to see changes
        await fetchBalance()
      } catch (err: any) {
        console.error(err)
        setCurrentStep(0)
      } finally {
        setIsIntentLoading(false)
      }
    } else {
      // --- OFFLINE DEMO MODE ---
      addActivity('Processing in demo mode', 'Simulating the bill payment flow.', '⚡', 'warning')
      
      setTimeout(() => {
        setCurrentStep(2)
        addActivity('Bill analyzed (Demo)', `${intent.name}. Total: $${intent.amount}.`, '🧠', 'info')
      }, 1000)

      setTimeout(() => {
        setCurrentStep(3)
        addActivity('Payment split complete (Demo)', `$${(intent.amount * 0.9).toFixed(2)} paid to vendor, $${(intent.amount * 0.1).toFixed(2)} saved.`, '📊', 'success')
      }, 2200)

      setTimeout(() => {
        setCurrentStep(4)
        addActivity('Bill paid (Demo)', 'Everything is settled — done in under 5 seconds.', '🎉', 'success')
        setIsIntentLoading(false)
      }, 3500)
    }
  }

  // Get current active details
  const activeIntent = intentsPreload.find(i => i.id === intentSelection)

  return (
    <div>
      <div className="brutalist-card accent-pink">
        <h3 className="card-title">Incoming Bills — <i>Paid & Sorted Automatically</i></h3>
        <p className="card-desc">When a bill comes in, InferPay reads it, pays the right vendor, and automatically sets aside a portion as company savings. You don’t have to do anything.</p>

        <div className="brutalist-split" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="brutalist-form-group">
              <label className="brutalist-label">Choose a sample bill to process</label>
              <select 
                className="brutalist-input" 
                value={intentSelection}
                onChange={(e) => {
                  setIntentSelection(e.target.value)
                  const sel = intentsPreload.find(i => i.id === e.target.value)
                  if (sel) setIntentAmount(sel.amount)
                }}
                disabled={isIntentLoading}
              >
                {intentsPreload.map(item => (
                  <option key={item.id} value={item.id} style={{ color: 'var(--text-dark)' }}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="brutalist-form-group">
              <label className="brutalist-label">What InferPay understands about this bill</label>
              <p style={{
                backgroundColor: 'var(--bg-inner)',
                padding: '15px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13.5px',
                lineHeight: '1.45',
                border: '1px solid var(--border)',
                fontWeight: 500,
                color: 'var(--text-main)'
              }}>
                {activeIntent?.details}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
              <div className="bracket-button-wrap">
                <button className="btn-brutalist btn-brutalist-pink" onClick={handleTriggerIntent} disabled={isIntentLoading}>
                  {isIntentLoading || isPayLoading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
                  <span>Pay This Bill & Save 10%</span>
                </button>
              </div>

              {isConnected && (
                <div style={{ fontSize: '12.5px', fontWeight: 650, color: 'var(--text-light)', borderLeft: '3px solid var(--accent-coral)', paddingLeft: '8px' }}>
                  Your Balance: <strong style={{ color: 'var(--text-main)' }}>${usdcBalance} USDC</strong>
                  <br />
                  Est. Gas Cost: <strong style={{ color: 'var(--text-main)' }}>{activeIntent?.type === 'split' ? '~0.0008 USDC' : '~0.0008 USDC'}</strong>
                </div>
              )}
            </div>

            {/* Arcscan links section */}
            {(vendorTx || reserveTx || approveTx) && (
              <div style={{ marginTop: '15px', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>On-chain Payment Receipts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {approveTx && (
                    <a href={`https://testnet.arcscan.app/tx/${approveTx}`} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ fontSize: '12px', textDecoration: 'underline', color: 'var(--accent-coral)', fontWeight: 'bold' }}>
                      USDC Approval Receipt ↗
                    </a>
                  )}
                  {vendorTx && (
                    <a href={`https://testnet.arcscan.app/tx/${vendorTx}`} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ fontSize: '12px', textDecoration: 'underline', color: 'var(--accent-coral)', fontWeight: 'bold' }}>
                      {activeIntent?.type === 'split' ? 'Vendor Transfer Receipt (90%) ↗' : 'Inference Request Receipt (InferPayEscrow) ↗'}
                    </a>
                  )}
                  {reserveTx && (
                    <a href={`https://testnet.arcscan.app/tx/${reserveTx}`} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ fontSize: '12px', textDecoration: 'underline', color: 'var(--accent-coral)', fontWeight: 'bold' }}>
                      Reserve Transfer Receipt (10%) ↗
                    </a>
                  )}
                  {jobId !== null && (
                    <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 700, marginTop: '4px' }}>
                      Escrow Job Registered: <span className="badge-brutalist green">Job #{jobId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '240px' }}>
            <div style={{
              backgroundColor: 'var(--bg-inner)',
              border: '1px solid var(--border)',
              padding: '15px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>💼 How the payment is split</div>
              {activeIntent?.type === 'split' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ marginRight: '30px', fontSize: '13px' }}>Paid to vendor (90%)</span>
                    <strong>${(intentAmount * 0.9).toFixed(2)} USDC</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ marginRight: '30px', fontSize: '13px' }}>Saved to reserves (10%)</span>
                    <strong>${(intentAmount * 0.1).toFixed(2)} USDC</strong>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ marginRight: '30px', fontSize: '13px' }}>Escrow lock (100%)</span>
                    <strong>${intentAmount.toFixed(2)} USDC</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '11px', color: 'var(--text-light)' }}>
                    <span>Model: gpu-scaling</span>
                    <span>To contract</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment confirmation timeline step indicators */}
      {currentStep > 0 && (
        <div className="brutalist-card accent-cyan" style={{ animation: 'slideDown 0.3s' }}>
          <h3 className="card-title">Payment Settlement Timeline</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
            {/* Step 1: Received */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '80px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: currentStep >= 1 ? 'var(--accent-coral)' : 'var(--bg-inner)',
                color: currentStep >= 1 ? '#fff' : 'var(--text-muted)',
                border: '2px solid var(--border)',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                1
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: currentStep >= 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>Received</span>
            </div>

            <ArrowRight size={16} style={{ color: currentStep >= 2 ? 'var(--accent-coral)' : 'var(--text-muted)' }} />

            {/* Step 2: Analyzed */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '80px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: currentStep >= 2 ? 'var(--accent-coral)' : 'var(--bg-inner)',
                color: currentStep >= 2 ? '#fff' : 'var(--text-muted)',
                border: '2px solid var(--border)',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                2
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: currentStep >= 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>Analyzed</span>
            </div>

            <ArrowRight size={16} style={{ color: currentStep >= 3 ? 'var(--accent-coral)' : 'var(--text-muted)' }} />

            {/* Step 3: Split / Escrowed */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '80px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: currentStep >= 3 ? 'var(--accent-coral)' : 'var(--bg-inner)',
                color: currentStep >= 3 ? '#fff' : 'var(--text-muted)',
                border: '2px solid var(--border)',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                3
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: currentStep >= 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {activeIntent?.type === 'split' ? 'Split' : 'Escrowed'}
              </span>
            </div>

            <ArrowRight size={16} style={{ color: currentStep >= 4 ? 'var(--accent-coral)' : 'var(--text-muted)' }} />

            {/* Step 4: Settled */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '80px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: currentStep >= 4 ? '#22c55e' : 'var(--bg-inner)',
                color: currentStep >= 4 ? '#fff' : 'var(--text-muted)',
                border: '2px solid var(--border)',
                fontWeight: 'bold',
                marginBottom: '8px'
              }}>
                4
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: currentStep >= 4 ? 'var(--text-main)' : 'var(--text-muted)' }}>Settled</span>
            </div>
          </div>

          {isConnected && txStatus === 'pending' && (
            <div style={{ marginTop: '15px', padding: '10px 15px', backgroundColor: 'var(--bg-inner)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={14} className="spin" style={{ color: 'var(--accent-coral)' }} />
              <span style={{ fontSize: '12.5px' }}>Waiting for on-chain block mining on Arc Testnet...</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: '15px', padding: '10px 15px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-sm)', color: '#991b1b', fontSize: '12.5px' }}>
              <strong>Payment Error:</strong> {errorMsg}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default SmartBillPay
