import { useState, useEffect, useCallback } from 'react'
import { ActivityLog } from '@/types'

export function useActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([])

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/activities')
      if (res.ok) {
        const json = await res.json()
        if (json.data && json.data.length > 0) {
          setActivities(json.data)
          return
        }
      }
    } catch (err) {
      console.warn('Could not load persistent activities:', err)
    }

    // Default static fallback if database is empty/loading
    setActivities([
      { time: '14:32:04', emoji: 'lightning', title: 'System Ready', desc: 'InferPay is connected and ready to manage your company finances.', type: 'success' },
      { time: '14:32:05', emoji: 'shield', title: 'Safety Checks Active', desc: 'All spending limits and approval rules are in place.', type: 'info' }
    ])
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const addActivity = async (
    titleOrObj: string | { title: string; description?: string; desc?: string; emoji?: string; type?: string; txHash?: string },
    desc?: string,
    emoji?: string,
    type?: string
  ) => {
    let finalTitle = ''
    let finalDesc = ''
    let finalEmoji = 'lightning'
    let finalType = 'default'

    if (typeof titleOrObj === 'object' && titleOrObj !== null) {
      finalTitle = titleOrObj.title || ''
      finalDesc = titleOrObj.desc || titleOrObj.description || ''
      finalEmoji = titleOrObj.emoji || 'lightning'
      finalType = titleOrObj.type || 'default'
    } else {
      finalTitle = titleOrObj
      finalDesc = desc || ''
      finalEmoji = emoji || 'lightning'
      finalType = type || 'default'
    }

    // Normalize type string
    let normalizedType: ActivityLog['type'] = 'default'
    const checkType = finalType.toLowerCase()
    if (['success', 'warning', 'danger', 'info', 'default'].includes(checkType)) {
      normalizedType = checkType as ActivityLog['type']
    }

    const time = new Date().toLocaleTimeString('en-US', { hour12: false })
    const newActivity: ActivityLog = { time, emoji: finalEmoji, title: finalTitle, desc: finalDesc, type: normalizedType }
    
    // Optimistic UI update
    setActivities(prev => [newActivity, ...prev])

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: finalTitle, desc: finalDesc, emoji: finalEmoji, type: normalizedType })
      })
    } catch (err) {
      console.warn('Failed to persist activity log entry:', err)
    }
  }

  return {
    activities,
    addActivity
  }
}
