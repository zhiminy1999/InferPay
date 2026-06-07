'use client'

import { useState } from 'react'
import { ActivityLog } from '@/types'

export function useActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([
    { time: '14:32:04', emoji: '⚡', title: 'System Ready', desc: 'InferPay is connected and ready to manage your company finances.', type: 'success' },
    { time: '14:32:05', emoji: '🛡️', title: 'Safety Checks Active', desc: 'All spending limits and approval rules are in place.', type: 'info' }
  ])

  const addActivity = (
    title: string,
    desc: string,
    emoji: string,
    type: ActivityLog['type'] = 'default'
  ) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    setActivities(prev => [{ time, emoji, title, desc, type }, ...prev])
  }

  return {
    activities,
    addActivity
  }
}
