'use client'

import { useState, useEffect, useCallback } from 'react'

export interface AnalyticsData {
  treasury: {
    total: number
    usdcWallet: number
    eurcWallet: number
    usdcGateway: number
    eurcInUsd: number
    history: Array<{ date: string; value: number }>
  }
  spending: {
    bills: number
    payroll: number
    inference: number
    swaps: number
    total: number
  }
  gas: {
    totalSpent: number
    averagePerTx: number
    txCount: number
  }
  bridge: {
    totalVolume: number
    totalFees: number
  }
  leaderboard: Array<{
    id: string
    name: string
    capability: string
    reputation: number
    completionRate: number
    totalEarned: number
    jobsCompleted: number
  }>
  alerts: Array<{
    id: string
    type: string
    severity: string
    message: string
    timestamp: number
  }>
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Date state (defaults to last 30 days)
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  const getTimestamps = useCallback(() => {
    let start = 0
    let end = Date.now()

    if (customStartDate && customEndDate) {
      start = new Date(customStartDate).getTime()
      end = new Date(customEndDate).getTime() + (24 * 60 * 60 * 1000) - 1
    } else {
      const now = new Date()
      if (dateRange === '7days') {
        start = now.getTime() - (7 * 24 * 60 * 60 * 1000)
      } else if (dateRange === '30days') {
        start = now.getTime() - (30 * 24 * 60 * 60 * 1000)
      } else {
        start = 0 // Beginning of time
      }
    }
    return { start, end }
  }, [dateRange, customStartDate, customEndDate])

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { start, end } = getTimestamps()
      const url = `/api/analytics?startDate=${start}&endDate=${end}`
      
      const res = await fetch(url)
      const result = await res.json()
      if (res.ok) {
        setData(result)
      } else {
        throw new Error(result.error || 'Failed to fetch analytics metrics')
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during network aggregation')
    } finally {
      setIsLoading(false)
    }
  }, [getTimestamps])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const downloadPDFReport = async () => {
    try {
      const { start, end } = getTimestamps()
      const response = await fetch(`/api/reports?startDate=${start}&endDate=${end}`)
      if (!response.ok) {
        throw new Error('Could not compile PDF treasury report')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inferpay_treasury_report_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF Download failed:', err)
      alert('Failed to generate PDF Report. Please check API status.')
    }
  }

  return {
    data,
    isLoading,
    error,
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    refreshAnalytics: fetchAnalytics,
    downloadPDFReport
  }
}
export default useAnalytics
