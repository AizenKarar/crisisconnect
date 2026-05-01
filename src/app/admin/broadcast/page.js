// src/app/admin/broadcast/page.js
'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

export default function BroadcastPage() {
  // Get the logged-in user session
  const { data: session } = useSession()

  // State variables
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  // Check if user is an admin
  let isAdmin = false
  if (session && session.user && session.user.role === 'ADMIN') {
    isAdmin = true
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-4xl mb-4">🔒</span>
          <h2 className="font-display font-bold text-xl text-slate-800">Admin Only</h2>
          <p className="text-slate-500 mt-2">This feature is restricted to Super-Admins.</p>
        </div>
      </DashboardLayout>
    )
  }

  // Handle sending the broadcast
  async function handleBroadcast(event) {
    event.preventDefault()

    // Don't send empty messages
    if (!title.trim() || !message.trim()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, message: message }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Broadcast sent to ' + data.count + ' users!')

        // Add to history
        let newEntry = {
          title: title,
          message: message,
          time: new Date(),
          count: data.count,
        }
        let updatedHistory = [newEntry]
        for (let i = 0; i < history.length; i++) {
          updatedHistory.push(history[i])
        }
        setHistory(updatedHistory)

        // Clear the form
        setTitle('')
        setMessage('')
      } else {
        toast.error('Broadcast failed')
      }
    } catch (error) {
      console.error('Error sending broadcast:', error)
      toast.error('Broadcast failed')
    }

    setLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Mass Alert Broadcast</h1>
          <p className="text-slate-500 text-sm mt-1">Send urgent system-wide notifications to all registered users.</p>
        </div>

        <div className="card border-l-4 border-l-red-400">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-amber-600 font-medium">This will notify ALL users. Use only for genuine emergencies.</p>
          </div>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Alert Title</label>
              <input value={title} onChange={function (e) { setTitle(e.target.value) }} className="input" placeholder="e.g., Evacuate Sector 4 Immediately" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Message</label>
              <textarea value={message} onChange={function (e) { setMessage(e.target.value) }} className="input min-h-[100px] resize-none" placeholder="Detailed emergency instructions..." required />
            </div>
            <button type="submit" disabled={loading} className="btn-danger w-full">
              {loading ? 'Broadcasting...' : '📡 Send Broadcast to All Users'}
            </button>
          </form>
        </div>

        {history.length > 0 && (
          <div className="card">
            <h2 className="font-display font-semibold text-slate-800 mb-4">Recent Broadcasts</h2>
            <div className="space-y-3">
              {history.map(function (broadcast, index) {
                return (
                  <div key={index} className="p-3 rounded-xl bg-white/40 border border-white/50">
                    <p className="text-sm font-medium text-slate-700">🚨 {broadcast.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{broadcast.message}</p>
                    <p className="text-xs text-slate-400 mt-1">Sent to {broadcast.count} users · {broadcast.time.toLocaleTimeString()}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
