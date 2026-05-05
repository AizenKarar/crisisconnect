// src/app/dashboard/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import WeatherWidget from '@/components/WeatherWidget'
import { getSeverityColor, getStatusColor, getDisasterIcon, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session } = useSession()

  const [incidents, setIncidents] = useState([])
  const [shelters, setShelters] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    fetchAllData()
  }, [])

  async function fetchAllData() {
    try {
      const incidentResponse = await fetch('/api/incidents')
      if (incidentResponse.ok) {
        const incidentData = await incidentResponse.json()
        setIncidents(incidentData)
      }

      const shelterResponse = await fetch('/api/shelters')
      if (shelterResponse.ok) {
        const shelterData = await shelterResponse.json()
        setShelters(shelterData)
      }

      const leaderboardResponse = await fetch('/api/users/leaderboard')
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json()
        setLeaderboard(leaderboardData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }

    setLoading(false)
  }

  let totalIncidents = incidents.length
  let criticalCount = 0
  let inProgressCount = 0
  let resolvedCount = 0

  for (let i = 0; i < incidents.length; i++) {
    if (incidents[i].severity === 'CRITICAL') {
      criticalCount = criticalCount + 1
    }
    if (incidents[i].status === 'IN_PROGRESS') {
      inProgressCount = inProgressCount + 1
    }
    if (incidents[i].status === 'RESOLVED') {
      resolvedCount = resolvedCount + 1
    }
  }

  let userName = ''
  let userRole = ''
  let userInitial = ''
  if (session && session.user) {
    userName = session.user.name || ''
    userRole = session.user.role || ''
    if (userName.length > 0) {
      userInitial = userName[0]
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const recentIncidents = incidents.slice(0, 5)
  const topVolunteers = leaderboard.slice(0, 5)

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Added Weather Widget Here */}
        <WeatherWidget />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h2 className="font-display font-semibold text-slate-800 mb-5">Incident Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: totalIncidents, color: 'bg-teal-500', icon: '📋' },
                { label: 'In Progress', value: inProgressCount, color: 'bg-purple-500', icon: '🔄' },
                { label: 'Critical', value: criticalCount, color: 'bg-red-500', icon: '🚨' },
                { label: 'Resolved', value: resolvedCount, color: 'bg-emerald-500', icon: '✅' },
              ].map(function (stat) {
                return (
                  <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/40 border border-white/60">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-white text-lg shadow-sm`}>{stat.icon}</div>
                    <div>
                      <p className="font-display font-bold text-2xl text-slate-800">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-teal-400/30 mb-3">
              {userInitial}
            </div>
            <h2 className="font-display font-bold text-lg text-slate-800">Good Morning!</h2>
            <p className="font-display font-semibold text-slate-700 mt-1">{userName}</p>
            <p className="text-xs text-teal-600/70 mt-0.5">{userRole}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-slate-800">Recent Incidents</h2>
              <Link href="/incidents" className="text-xs text-teal-600 hover:text-teal-500 font-medium">View all →</Link>
            </div>
            <div className="space-y-3">
              {recentIncidents.map(function (inc) {
                let incidentAddress = inc.address || 'Unknown'
                return (
                  <Link key={inc.id} href={'/incidents/' + inc.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/40 hover:bg-white/60 border border-white/50 transition-all group">
                    <span className="text-2xl">{getDisasterIcon(inc.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate group-hover:text-teal-700 transition-colors">{inc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{incidentAddress} · {formatDate(inc.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={'badge ' + getSeverityColor(inc.severity)}>{inc.severity}</span>
                      <span className={'badge ' + getStatusColor(inc.status)}>{inc.status.replace('_', ' ')}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-slate-800">Shelters</h2>
                <Link href="/shelters" className="text-xs text-teal-600 hover:text-teal-500 font-medium">View all →</Link>
              </div>
              <div className="space-y-4">
                {shelters.map(function (shelter) {
                  let percentage = Math.round((shelter.occupied / shelter.maxCapacity) * 100)
                  let barColor = 'bg-teal-500'
                  if (percentage >= 90) {
                    barColor = 'bg-red-500'
                  } else if (percentage >= 70) {
                    barColor = 'bg-amber-500'
                  }
                  return (
                    <div key={shelter.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-600 font-medium">{shelter.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{shelter.occupied}/{shelter.maxCapacity}</span>
                      </div>
                      <div className="progress-bar">
                        <div className={'h-full rounded-full transition-all duration-700 ' + barColor} style={{ width: percentage + '%' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <h2 className="font-display font-semibold text-slate-800 mb-4">Top Volunteers</h2>
              <div className="space-y-3">
                {topVolunteers.map(function (user, index) {
                  let initial = ''
                  if (user.name && user.name.length > 0) {
                    initial = user.name[0]
                  }
                  return (
                    <div key={user.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 w-5">{index + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 font-medium truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.role}</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-teal-600">{user.karmaPoints} pts</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}