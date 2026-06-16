import React, { useState } from 'react'
import { useNanopayments } from '../hooks/useNanopayments'
import { useActivityFeed } from '../hooks/useActivityFeed'

export const NanopaymentDeposit: React.FC = () => {
  const {
    gatewayBalanceFormatted,
    walletBalanceFormatted,
    depositUSDC,
    withdrawUSDC,
    isDepositing,
    isWithdrawing,
  } = useNanopayments()
  const { addActivity } = useActivityFeed()

  const [depositAmount, setDepositAmount] = useState('5')
  const [withdrawAmount, setWithdrawAmount] = useState('2')
  const [errorMessage, setErrorMessage] = useState('')

  const handleDeposit = async () => {
    setErrorMessage('')
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMessage('Please enter a valid deposit amount')
      return
    }
    try {
      const res = await depositUSDC(depositAmount)
      addActivity({
        type: 'PAYMENT',
        title: 'Nanopayments Deposited',
        description: `Successfully deposited ${depositAmount} USDC into the Gateway Wallet contract.`,
        txHash: res.depositTxHash,
      })
    } catch (e: any) {
      setErrorMessage(e.message || 'Deposit failed')
    }
  }

  const handleWithdraw = async () => {
    setErrorMessage('')
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setErrorMessage('Please enter a valid withdrawal amount')
      return
    }
    try {
      const res = await withdrawUSDC(withdrawAmount)
      addActivity({
        type: 'PAYMENT',
        title: 'Nanopayments Withdrawn',
        description: `Successfully withdrew ${withdrawAmount} USDC from Gateway back to wallet.`,
        txHash: res.mintTxHash,
      })
    } catch (e: any) {
      setErrorMessage(e.message || 'Withdrawal failed')
    }
  }

  return (
    <div className="brutalist-card accent-green">
      <h3 className="card-title">Gateway <i>Vault Funding</i></h3>
      
      {errorMessage && (
        <div style={{
          backgroundColor: '#fff1f2',
          color: '#9f1239',
          padding: '10px var(--space-3)',
          fontSize: '13px',
          fontWeight: 600,
          border: '1px solid #ffe4e6',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ Error: {errorMessage}
        </div>
      )}

      <div className="brutalist-split">
        {/* Deposit USDC Section */}
        <div style={{
          backgroundColor: 'var(--bg-inner)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)'
        }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Deposit USDC <i>to Gateway</i></h4>
          <p className="card-desc" style={{ marginBottom: 'var(--space-4)' }}>
            Convert standard EOA wallet balance into instant gasless credit.
          </p>
          
          <div className="brutalist-form-group">
            <label className="brutalist-label">USDC Amount</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="brutalist-input"
                placeholder="5"
              />
              <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: 'var(--text-light)', fontWeight: 600 }}>USDC</span>
            </div>
            <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 500 }}>
              Available in Wallet: {parseFloat(walletBalanceFormatted).toFixed(2)} USDC
            </div>
          </div>

          <div className="bracket-button-wrap" style={{ width: '100%' }}>
            <button
              onClick={handleDeposit}
              disabled={isDepositing}
              className="btn-brutalist btn-brutalist-pink"
              style={{ width: '100%' }}
            >
              {isDepositing ? 'Depositing...' : 'Confirm Deposit'}
            </button>
          </div>
        </div>

        {/* Withdraw USDC Section */}
        <div style={{
          backgroundColor: 'var(--bg-inner)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)'
        }}>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Withdraw <i>to Wallet</i></h4>
          <p className="card-desc" style={{ marginBottom: 'var(--space-4)' }}>
            Retrieve unused Gateway nanopayment funds back to your onchain EOA.
          </p>
          
          <div className="brutalist-form-group">
            <label className="brutalist-label">Withdraw Amount</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="brutalist-input"
                placeholder="2"
              />
              <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: 'var(--text-light)', fontWeight: 600 }}>USDC</span>
            </div>
            <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 500 }}>
              Available in Gateway: {parseFloat(gatewayBalanceFormatted).toFixed(4)} USDC
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="btn-brutalist btn-brutalist-muted"
            style={{ width: '100%' }}
          >
            {isWithdrawing ? 'Withdrawing...' : 'Request Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  )
}
