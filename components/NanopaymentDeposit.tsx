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
    <div className="brutalist-card p-6 bg-dark-card border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-bold uppercase mb-4 tracking-wider text-accent-green">Gateway Vault Funding</h3>
      
      {errorMessage && (
        <div className="bg-red-900/40 border border-red-500 text-red-200 px-3 py-2 text-sm uppercase font-mono mb-4">
          Error: {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit USDC Section */}
        <div className="border border-black p-4 bg-zinc-900">
          <h4 className="text-md font-bold uppercase mb-2 tracking-wide text-zinc-300">Deposit USDC to Gateway</h4>
          <p className="text-xs text-zinc-500 font-mono mb-4">
            Convert standard EOA wallet balance into instant gasless credit.
          </p>
          
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase mb-1 text-zinc-400">USDC Amount</label>
            <div className="relative">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-black border border-black p-2 font-mono text-white text-sm"
                placeholder="5"
              />
              <span className="absolute right-3 top-2 font-mono text-zinc-500 text-xs">USDC</span>
            </div>
            <div className="text-right mt-1 text-[10px] font-mono text-zinc-500">
              Available in Wallet: {parseFloat(walletBalanceFormatted).toFixed(2)} USDC
            </div>
          </div>

          <button
            onClick={handleDeposit}
            disabled={isDepositing}
            className="w-full bg-accent-green text-black uppercase font-bold text-sm py-2 border-2 border-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {isDepositing ? 'Depositing...' : 'Confirm Deposit'}
          </button>
        </div>

        {/* Withdraw USDC Section */}
        <div className="border border-black p-4 bg-zinc-900">
          <h4 className="text-md font-bold uppercase mb-2 tracking-wide text-zinc-300">Withdraw to Wallet</h4>
          <p className="text-xs text-zinc-500 font-mono mb-4">
            Retrieve unused Gateway nanopayment funds back to your onchain EOA.
          </p>
          
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase mb-1 text-zinc-400">Withdraw Amount</label>
            <div className="relative">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-black border border-black p-2 font-mono text-white text-sm"
                placeholder="2"
              />
              <span className="absolute right-3 top-2 font-mono text-zinc-500 text-xs">USDC</span>
            </div>
            <div className="text-right mt-1 text-[10px] font-mono text-zinc-500">
              Available in Gateway: {parseFloat(gatewayBalanceFormatted).toFixed(4)} USDC
            </div>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="w-full bg-zinc-800 text-white border-2 border-black hover:bg-zinc-700 transition-colors uppercase font-bold text-sm py-2 disabled:opacity-50"
          >
            {isWithdrawing ? 'Withdrawing...' : 'Request Withdrawal'}
          </button>
        </div>
      </div>
    </div>
  )
}
