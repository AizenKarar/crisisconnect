'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import WeatherWidget from '@/components/WeatherWidget'
import ActiveBroadcast from '@/components/ActiveBroadcast'
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  let recentIncidents = incidents.slice(0, 5)
  let activeShelters = shelters.filter(function (s) { return s.status === 'ACTIVE' || s.status === 'FULL' }).slice(0, 3)
  let topVolunteers = leaderboard.slice(0, 5)

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        <ActiveBroadcast />

        <WeatherWidget />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-800">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-slate-500 mt-1">Here is your local crisis overview and community updates.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-teal-50 border-teal-100 hover:shadow-md transition-all">
            <h3 className="text-teal-800 font-semibold mb-1">Live Map</h3>
            <p className="text-sm text-teal-600 mb-4">View real-time incidents and safe shelters in your area.</p>
            <Link href="/map" className="btn-primary w-full text-center block py-2">
              Open Live Map
            </Link>
          </div>

          <div className="card bg-emerald-50 border-emerald-100 hover:shadow-md transition-all">
            <h3 className="text-emerald-800 font-semibold mb-1">Community Hub</h3>
            <p className="text-sm text-emerald-600 mb-4">Check for local updates, requests, and volunteer tasks.</p>
            <Link href="/community" className="bg-emerald-600 text-white font-medium rounded-lg text-sm px-4 py-2 hover:bg-emerald-700 transition-all w-full text-center block">
              View Community
            </Link>
          </div>

          <div className="card bg-blue-50 border-blue-100 hover:shadow-md transition-all">
            <h3 className="text-blue-800 font-semibold mb-1">Report Incident</h3>
            <p className="text-sm text-blue-600 mb-4">Log a new disaster, hazard, or SOS alert immediately.</p>
            <Link href="/incidents/report" className="bg-blue-600 text-white font-medium rounded-lg text-sm px-4 py-2 hover:bg-blue-700 transition-all w-full text-center block">
              Report Now
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-slate-800">Recent Incidents</h2>
                <Link href="/incidents" className="text-sm text-teal-600 font-medium hover:text-teal-700">View All</Link>
              </div>

              <div className="space-y-3">
                {recentIncidents.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No active incidents.</p>
                ) : (
                  recentIncidents.map(function (incident) {
                    return (
                      <Link key={incident.id} href={'/incidents/' + incident.id} className="block group">
                        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                          <span className="text-3xl grayscale-[0.2] group-hover:grayscale-0 transition-all">{getDisasterIcon(incident.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-semibold text-slate-800 truncate">{incident.title}</h4>
                              <span className={'badge flex-shrink-0 ' + getSeverityColor(incident.severity)}>{incident.severity}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 truncate">{incident.address}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              <span>{formatDate(incident.createdAt)}</span>
                              <span>•</span>
                              <span className={getStatusColor(incident.status) + ' bg-transparent px-0 font-bold'}>{incident.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-slate-800">Safe Shelters</h2>
                <Link href="/map" className="text-sm text-teal-600 font-medium hover:text-teal-700">Map</Link>
              </div>
              <div className="space-y-3">
                {activeShelters.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No shelters active.</p>
                ) : (
                  activeShelters.map(function (shelter) {
                    let capPercent = Math.round((shelter.currentCapacity / shelter.maxCapacity) * 100)
                    let capColor = 'bg-teal-500'
                    if (capPercent > 80) capColor = 'bg-orange-500'
                    if (capPercent >= 100) capColor = 'bg-red-500'

                    return (
                      <div key={shelter.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-800 text-sm">{shelter.name}</h4>
                          <span className="text-xs font-bold text-slate-500">{shelter.currentCapacity}/{shelter.maxCapacity}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1 overflow-hidden">
                          <div className={'h-1.5 rounded-full ' + capColor} style={{ width: capPercent + '%' }}></div>
                        </div>
                        <p className="text-[10px] text-slate-400 text-right">{capPercent}% Full</p>
                      </div>
                    )
                  })
                )}
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