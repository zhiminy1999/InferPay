import React from 'react'

interface CurrencySelectorProps {
  selected: 'USDC' | 'EURC'
  onChange: (currency: 'USDC' | 'EURC') => void
  disabled?: boolean
  label?: string
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selected,
  onChange,
  disabled = false,
  label = 'Select Currency',
}) => {
  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label className="text-zinc-400 text-xs uppercase font-mono tracking-wider">
          {label}
        </label>
      )}
      <div className="flex bg-black p-1 border border-zinc-800 rounded-lg max-w-[240px]">
        <button
          type="button"
          onClick={() => !disabled && onChange('USDC')}
          disabled={disabled}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold uppercase transition-all duration-200 font-mono tracking-wider flex items-center justify-center space-x-1.5 ${
            selected === 'USDC'
              ? 'bg-accent-green text-black font-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>🇺🇸</span>
          <span>USDC</span>
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange('EURC')}
          disabled={disabled}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold uppercase transition-all duration-200 font-mono tracking-wider flex items-center justify-center space-x-1.5 ${
            selected === 'EURC'
              ? 'bg-blue-600 text-white font-black'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>🇪🇺</span>
          <span>EURC</span>
        </button>
      </div>
    </div>
  )
}
