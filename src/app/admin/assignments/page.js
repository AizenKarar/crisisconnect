// src/app/admin/assignments/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate, severityColor } from '@/lib/utils'
import toast from 'react-hot-toast'

const STAT_COLORS = { ASSIGNED: 'bg-blue-50 text-blue-600 border-blue-200', ACCEPTED: 'bg-purple-50 text-purple-600 border-purple-200', COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-200' }

export default function AssignmentsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState({ volunteers: [], incidents: [], assignments: [] })
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)
  const [notes, setNotes] = useState('')
  const [view, setView] = useState('assign') // assign | history

  useEffect(() => { fetchData() }, [])
  async function fetchData() { const res = await fetch('/api/assignments'); if (res.ok) setData(await res.json()); setLoading(false) }

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'STAFF') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-4xl mb-4">🔒</span>
          <h2 className="font-display font-bold text-xl text-slate-800">Admin / Staff Only</h2>
          <p className="text-slate-500 mt-2">Volunteer assignment is restricted to administrators and staff.</p>
        </div>
      </DashboardLayout>
    )
  }

  async function assignVolunteer() {
    if (!selectedIncident || !selectedVolunteer) { toast.error('Select both an incident and a volunteer'); return }
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: selectedVolunteer, incidentId: selectedIncident, notes }),
    })
    if (res.ok) {
      toast.success('✅ Volunteer assigned successfully! +5 karma awarded')
      setSelectedVolunteer(null)
      setNotes('')
      fetchData()
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed to assign')
    }
  }

  async function updateStatus(id, status) {
    const res = await fetch('/api/assignments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (res.ok) { toast.success(`Assignment ${status.toLowerCase()}`); fetchData() }
  }

  const activeIncident = data.incidents.find(i => i.id === selectedIncident)
  const assignedToSelected = data.assignments.filter(a => a.incident?.id === selectedIncident)
  const stats = { total: data.assignments.length, assigned: data.assignments.filter(a => a.status === 'ASSIGNED').length, accepted: data.assignments.filter(a => a.status === 'ACCEPTED').length, completed: data.assignments.filter(a => a.status === 'COMPLETED').length }

  // Filter out already-assigned volunteers for selected incident
  const assignedUserIds = assignedToSelected.map(a => a.user.id)
  const availableVolunteers = data.volunteers.filter(v => !assignedUserIds.includes(v.id))

  // Skill matching
  function getSkillMatch(volunteer) {
    if (!activeIncident || !volunteer.skills) return 0
    const vSkills = volunteer.skills.toLowerCase().split(',').map(s => s.trim())
    const incType = activeIncident.type?.toLowerCase()
    const relevantSkills = { fire: ['firefighter', 'fire safety', 'first aid'], flood: ['swimming', 'boat', 'rescue', 'first aid'], earthquake: ['rescue', 'first aid', 'structural'], medical: ['nurse', 'doctor', 'paramedic', 'first aid', 'cpr'] }
    const needed = relevantSkills[incType] || []
    const matched = vSkills.filter(s => needed.some(n => s.includes(n)))
    return needed.length > 0 ? Math.round((matched.length / needed.length) * 100) : 50
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">🎯 Volunteer Assignments</h1>
            <p className="text-slate-500 text-sm mt-1">Assign volunteers and responders to active incidents.</p>
          </div>
          <div className="flex bg-white/50 rounded-xl border border-white/60 p-0.5">
            <button onClick={() => setView('assign')} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${view === 'assign' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>Assign</button>
            <button onClick={() => setView('history')} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${view === 'history' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>All Assignments</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ l: 'Total Assignments', v: stats.total, bg: 'bg-teal-500', i: '📋' }, { l: 'Assigned', v: stats.assigned, bg: 'bg-blue-500', i: '🎯' }, { l: 'Accepted', v: stats.accepted, bg: 'bg-purple-500', i: '🤝' }, { l: 'Completed', v: stats.completed, bg: 'bg-emerald-500', i: '✅' }].map(s => (
            <div key={s.l} className="card flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-white text-lg shadow-sm`}>{s.i}</div><div><p className="font-display font-bold text-2xl text-slate-800">{s.v}</p><p className="text-xs text-slate-500">{s.l}</p></div></div>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div> : view === 'assign' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Incidents */}
            <div>
              <h2 className="font-display font-semibold text-slate-800 mb-3">Active Incidents ({data.incidents.length})</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {data.incidents.map(inc => {
                  const isSelected = selectedIncident === inc.id
                  const sevColor = inc.severity === 'CRITICAL' ? 'border-l-red-500' : inc.severity === 'HIGH' ? 'border-l-orange-500' : inc.severity === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-green-500'
                  return (
                    <div key={inc.id} onClick={() => setSelectedIncident(inc.id)}
                      className={`card cursor-pointer border-l-4 ${sevColor} transition-all ${isSelected ? 'ring-2 ring-teal-400 shadow-lg shadow-teal-100/50' : 'hover:shadow-md'}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-medium text-slate-700 text-sm">{inc.title}</h3>
                            <span className="badge text-[10px] bg-teal-50 text-teal-600 border-teal-200">{inc.type}</span>
                            <span className={`badge text-[10px] ${inc.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' : inc.severity === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{inc.severity}</span>
                          </div>
                          <p className="text-xs text-slate-400">{inc.address || 'No address'}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>👥 {inc._count.assignments} assigned</span>
                            <span>{inc.status}</span>
                            <span>{formatDate(inc.createdAt)}</span>
                          </div>
                          {isSelected && inc.assignments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-teal-50">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Currently Assigned:</p>
                              <div className="flex flex-wrap gap-1">
                                {inc.assignments.map(a => (
                                  <span key={a.id} className="badge text-[10px] bg-teal-50 text-teal-600 border-teal-200">👤 {a.user.name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {isSelected && <span className="text-teal-500 text-lg">✓</span>}
                      </div>
                    </div>
                  )
                })}
                {data.incidents.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No active incidents.</p>}
              </div>
            </div>

            {/* RIGHT: Volunteers */}
            <div>
              <h2 className="font-display font-semibold text-slate-800 mb-3">
                {selectedIncident ? `Assign to: ${activeIncident?.title}` : 'Select an incident first'}
              </h2>

              {selectedIncident ? (
                <div className="space-y-3">
                  {/* Volunteer list */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {availableVolunteers.map(vol => {
                      const isSelected = selectedVolunteer === vol.id
                      const match = getSkillMatch(vol)
                      return (
                        <div key={vol.id} onClick={() => setSelectedVolunteer(vol.id)}
                          className={`card cursor-pointer transition-all py-3 ${isSelected ? 'ring-2 ring-teal-400 shadow-lg shadow-teal-100/50' : 'hover:shadow-md'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{vol.name?.[0]}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-slate-700">{vol.name}</p>
                                <span className="badge text-[10px] bg-slate-100 text-slate-500 border-slate-200">{vol.role}</span>
                                {vol.isVerified && <span className="text-[10px] text-emerald-500">✓</span>}
                              </div>
                              <p className="text-xs text-slate-400 truncate">{vol.skills || 'No skills listed'}</p>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                                <span>⭐ {vol.karmaPoints} karma</span>
                                <span>📋 {vol._count.assignments} missions</span>
                                {match > 0 && (
                                  <span className={`font-medium ${match >= 70 ? 'text-emerald-600' : match >= 40 ? 'text-amber-600' : 'text-slate-400'}`}>
                                    {match}% skill match
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && <span className="text-teal-500 text-lg">✓</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Assignment action */}
                  {selectedVolunteer && (
                    <div className="card border-l-4 border-l-teal-500 animate-slide-down">
                      <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">
                        Assign {data.volunteers.find(v => v.id === selectedVolunteer)?.name} → {activeIncident?.title}
                      </h3>
                      <input value={notes} onChange={e => setNotes(e.target.value)} className="input mb-3" placeholder="Assignment notes (optional)..." />
                      <div className="flex gap-3">
                        <button onClick={() => setSelectedVolunteer(null)} className="btn-ghost flex-1">Cancel</button>
                        <button onClick={assignVolunteer} className="btn-primary flex-1">🎯 Confirm Assignment</button>
                      </div>
                    </div>
                  )}

                  {availableVolunteers.length === 0 && <p className="text-sm text-slate-400 text-center py-4">All volunteers already assigned to this incident.</p>}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <span className="text-4xl block mb-3">👈</span>
                  <p className="text-slate-400">Select an incident from the left panel to start assigning volunteers.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* HISTORY VIEW */
          <div className="space-y-3">
            {data.assignments.map(a => (
              <div key={a.id} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{a.user.name?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{a.user.name} <span className="text-slate-400 font-normal">→</span> {a.incident?.title || 'Unknown'}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>{a.user.role}</span>
                    <span>{a.incident?.type}</span>
                    <span>{a.incident?.severity}</span>
                    {a.notes && <span>📝 {a.notes}</span>}
                    <span>{formatDate(a.createdAt)}</span>
                  </div>
                </div>
                <span className={`badge text-[10px] ${STAT_COLORS[a.status]}`}>{a.status}</span>
                {a.status !== 'COMPLETED' && (
                  <button onClick={() => updateStatus(a.id, a.status === 'ASSIGNED' ? 'ACCEPTED' : 'COMPLETED')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100 transition-all">
                    {a.status === 'ASSIGNED' ? 'Accept' : '✅ Complete'}
                  </button>
                )}
              </div>
            ))}
            {data.assignments.length === 0 && <p className="text-center text-slate-400 py-12">No assignments yet.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
