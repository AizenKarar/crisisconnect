// src/app/volunteers/page.js
'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

export default function VolunteersPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { async function load() { const res = await fetch('/api/users/leaderboard'); if (res.ok) setLeaderboard(await res.json()); setLoading(false) }; load() }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div><h1 className="font-display font-bold text-2xl text-slate-800">Volunteer Corps</h1><p className="text-slate-500 text-sm mt-1">Verified volunteers ranked by karma points.</p></div>
        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="space-y-3">
            {leaderboard.map((user, i) => (
              <div key={user.id} className={`flex items-center gap-4 p-5 card ${i < 3 ? 'border-l-4' : ''} ${i === 0 ? 'border-l-yellow-400' : i === 1 ? 'border-l-slate-300' : i === 2 ? 'border-l-amber-600' : ''}`}>
                <span className="text-2xl w-10 text-center">{i < 3 ? medals[i] : <span className="text-sm text-slate-400 font-mono">#{i + 1}</span>}</span>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-lg font-bold text-white flex-shrink-0 shadow-sm">{user.name?.[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-700">{user.name}</p>
                    <span className="badge bg-teal-50 text-teal-600 border-teal-200 text-[10px]">{user.role}</span>
                    <span className="badge bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">✓ Verified</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{user.skills || 'No skills listed'}</p>
                  <p className="text-xs text-slate-400 mt-1">{user._count?.assignments || 0} missions completed</p>
                </div>
                <div className="text-right"><p className="text-2xl font-display font-bold text-teal-600">{user.karmaPoints}</p><p className="text-xs text-slate-400">karma pts</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
