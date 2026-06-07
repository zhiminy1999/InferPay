import { useState, useEffect, useCallback } from 'react'
import { useWeb3 } from '../lib/web3-provider'

export interface TransactionRecord {
  id: string
  tx_hash: string
  block_number: number
  timestamp: number
  wallet_address: string
  amount: number
  status: string
  type: 'session' | 'proposal' | 'job' | 'payment' | 'swap' | 'bridge'
  metadata: any
}

export function useTransactionHistory() {
  const { address, isConnected } = useWeb3()
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [filterType, setFilterType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  
  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  const fetchTransactions = useCallback(async () => {
    if (!isConnected || !address) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        wallet_address: address,
        page: page.toString(),
        limit: limit.toString(),
      })

      if (filterType) params.append('type', filterType)
      if (filterStatus) params.append('status', filterStatus)
      if (minAmount) params.append('min_amount', minAmount)
      if (maxAmount) params.append('max_amount', maxAmount)

      const res = await fetch(`/api/transactions?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to retrieve transaction history')
      
      const json = await res.json()
      setTransactions(json.data || [])
      setTotalPages(json.pagination?.totalPages || 1)
      setTotalRecords(json.pagination?.total || 0)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [address, isConnected, page, limit, filterType, filterStatus, minAmount, maxAmount])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const exportCSV = useCallback(() => {
    if (!address) return
    const params = new URLSearchParams({ wallet_address: address })
    window.open(`/api/export?${params.toString()}`, '_blank')
  }, [address])

  return {
    transactions,
    loading,
    error,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    page,
    setPage,
    totalPages,
    totalRecords,
    fetchTransactions,
    exportCSV,
  }
}
