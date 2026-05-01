// src/app/evacuation/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const ZONE_ICONS = { DANGER: '🔴', SAFE: '🟢', ASSEMBLY: '🟡', ROUTE: '🔵' }
const ZONE_COLORS = { DANGER: 'border-l-red-500', SAFE: 'border-l-emerald-500', ASSEMBLY: 'border-l-amber-500', ROUTE: 'border-l-blue-500' }
const PRI_COLORS = { CRITICAL: 'bg-red-50 text-red-600 border-red-200', HIGH: 'bg-orange-50 text-orange-600 border-orange-200', MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200', LOW: 'bg-green-50 text-green-600 border-green-200' }
const STAT_COLORS = { ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-200', STANDBY: 'bg-amber-50 text-amber-600 border-amber-200', CLEARED: 'bg-slate-100 text-slate-500 border-slate-200' }

export default function EvacuationPage() {
  const { data: session } = useSession()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [expanded, setExpanded] = useState(null)
  const isStaff = ['STAFF', 'ADMIN'].includes(session?.user?.role)

  useEffect(() => { fetchZones() }, [])
  async function fetchZones() { const res = await fetch('/api/evacuation'); if (res.ok) setZones(await res.json()); setLoading(false) }

  async function updateStatus(id, status) {
    const res = await fetch('/api/evacuation', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (res.ok) { toast.success(`Zone status updated to ${status}`); fetchZones() }
  }

  const filtered = filter === 'ALL' ? zones : zones.filter(z => z.zoneType === filter)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="font-display font-bold text-2xl text-slate-800">🚧 Evacuation Zones</h1><p className="text-slate-500 text-sm mt-1">Manage danger zones, safe areas, assembly points, and evacuation routes.</p></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: 'Danger Zones', value: zones.filter(z => z.zoneType === 'DANGER').length, icon: '🔴', bg: 'bg-red-500' }, { label: 'Safe Zones', value: zones.filter(z => z.zoneType === 'SAFE').length, icon: '🟢', bg: 'bg-emerald-500' }, { label: 'Assembly Points', value: zones.filter(z => z.zoneType === 'ASSEMBLY').length, icon: '🟡', bg: 'bg-amber-500' }, { label: 'Active Zones', value: zones.filter(z => z.status === 'ACTIVE').length, icon: '⚡', bg: 'bg-teal-500' }].map(s => (
            <div key={s.label} className="card flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-white text-lg shadow-sm`}>{s.icon}</div><div><p className="font-display font-bold text-2xl text-slate-800">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div></div>
          ))}
        </div>

        <div className="flex gap-2">
          {['ALL', 'DANGER', 'SAFE', 'ASSEMBLY', 'ROUTE'].map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${filter === t ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm' : 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'}`}>
              {t !== 'ALL' && <span>{ZONE_ICONS[t]}</span>} {t === 'ALL' ? 'All Zones' : t}
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="space-y-4">
            {filtered.map(zone => (
              <div key={zone.id} className={`card border-l-4 ${ZONE_COLORS[zone.zoneType]}`}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{ZONE_ICONS[zone.zoneType]}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display font-semibold text-slate-800 text-lg">{zone.name}</h3>
                      <span className={`badge text-[10px] ${PRI_COLORS[zone.priority]}`}>{zone.priority}</span>
                      <span className={`badge text-[10px] ${STAT_COLORS[zone.status]}`}>{zone.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{zone.description}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                      <span>📍 {zone.region}</span>
                      {zone.radius && <span>📐 {zone.radius} km radius</span>}
                      {zone.capacity && <span>👥 Capacity: {zone.occupants}/{zone.capacity}</span>}
                      <span>📌 {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}</span>
                    </div>

                    {zone.capacity > 0 && (
                      <div className="mt-3"><div className="progress-bar h-2"><div className={`h-full rounded-full ${zone.occupants / zone.capacity > 0.9 ? 'bg-red-500' : 'bg-teal-500'}`} style={{ width: `${Math.min((zone.occupants / zone.capacity) * 100, 100)}%` }} /></div></div>
                    )}

                    <button onClick={() => setExpanded(expanded === zone.id ? null : zone.id)} className="text-xs text-teal-600 hover:text-teal-500 font-medium mt-3">
                      {expanded === zone.id ? 'Hide Instructions ▲' : 'Show Instructions ▼'}
                    </button>

                    {expanded === zone.id && zone.instructions && (
                      <div className="mt-3 p-4 rounded-xl bg-white/40 border border-white/50 animate-slide-down">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Evacuation Instructions</h4>
                        <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{zone.instructions}</div>
                      </div>
                    )}

                    {isStaff && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-teal-50">
                        {['ACTIVE', 'STANDBY', 'CLEARED'].map(s => (
                          <button key={s} onClick={() => updateStatus(zone.id, s)} disabled={zone.status === s}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${zone.status === s ? 'bg-teal-100 text-teal-700 border border-teal-300' : 'bg-white/50 text-slate-500 border border-white/60 hover:bg-teal-50'}`}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
