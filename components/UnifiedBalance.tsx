import React from 'react'
import { useBridge } from '../hooks/useBridge'
import { Coins, Layers, ArrowRight } from 'lucide-react'

export const UnifiedBalance: React.FC = () => {
  const { balances } = useBridge()
  
  // Compute cumulative Unified USDC balance
  const unifiedTotal = (
    parseFloat(balances.ethereum_sepolia) +
    parseFloat(balances.base_sepolia) +
    parseFloat(balances.arc_testnet)
  ).toFixed(2)

  return (
    <div className="brutalist-card p-6 bg-zinc-900 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="text-accent-pink" size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Your Unified stablecoin treasury balance</h3>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-[10px] uppercase font-mono text-zinc-500">Total Cumulative USDC Balance</div>
          <div className="text-3xl font-black font-mono tracking-tighter mt-1 text-white">
            ${unifiedTotal} <span className="text-xs font-bold text-accent-pink">USDC</span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Ethereum Sepolia Balance card */}
          <div className="bg-black border border-zinc-800 p-3 flex-1 md:flex-none min-w-[120px] font-mono">
            <div className="text-[9px] text-zinc-500 uppercase">Ethereum Sepolia</div>
            <div className="text-sm font-bold text-zinc-300">${parseFloat(balances.ethereum_sepolia).toFixed(2)}</div>
            <div className="text-[8px] text-zinc-600">Domain ID: 0</div>
          </div>

          {/* Base Sepolia Balance card */}
          <div className="bg-black border border-zinc-800 p-3 flex-1 md:flex-none min-w-[120px] font-mono">
            <div className="text-[9px] text-zinc-500 uppercase">Base Sepolia</div>
            <div className="text-sm font-bold text-zinc-300">${parseFloat(balances.base_sepolia).toFixed(2)}</div>
            <div className="text-[8px] text-zinc-600">Domain ID: 6</div>
          </div>

          {/* Arc Testnet Balance card */}
          <div className="bg-black border border-zinc-800 p-3 flex-1 md:flex-none min-w-[120px] font-mono border-l-2 border-l-accent-green">
            <div className="text-[9px] text-zinc-500 uppercase text-accent-green">Arc Testnet</div>
            <div className="text-sm font-bold text-white">${parseFloat(balances.arc_testnet).toFixed(2)}</div>
            <div className="text-[8px] text-zinc-500">Domain ID: 26</div>
          </div>
        </div>
      </div>
    </div>
  )
}
