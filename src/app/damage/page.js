// src/app/damage/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const CAT_ICONS = { BUILDING: '🏢', ROAD: '🛣️', BRIDGE: '🌉', UTILITY: '⚡', AGRICULTURE: '🌾', VEHICLE: '🚗', OTHER: '📋' }
const SEV_COLORS = { MINOR: 'bg-green-50 text-green-600 border-green-200', MODERATE: 'bg-amber-50 text-amber-600 border-amber-200', MAJOR: 'bg-orange-50 text-orange-600 border-orange-200', DESTROYED: 'bg-red-50 text-red-600 border-red-200' }
const STAT_COLORS = { REPORTED: 'bg-slate-100 text-slate-500 border-slate-200', INSPECTED: 'bg-blue-50 text-blue-600 border-blue-200', APPROVED: 'bg-purple-50 text-purple-600 border-purple-200', REPAIR_STARTED: 'bg-amber-50 text-amber-600 border-amber-200', COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-200' }

export default function DamagePage() {
  const { data: session } = useSession()
  const [data, setData] = useState({ reports: [], totalCost: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', description: '', category: 'BUILDING', severity: 'MODERATE', address: '', estimatedCost: '', notes: '' })
  const isStaff = ['STAFF', 'ADMIN', 'RESPONDER'].includes(session?.user?.role)

  useEffect(() => { fetchData() }, [])
  async function fetchData() { const res = await fetch('/api/damage'); if (res.ok) setData(await res.json()); setLoading(false) }

  async function createReport(e) {
    e.preventDefault()
    const res = await fetch('/api/damage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success('Damage report submitted!'); setShowForm(false); setForm({ title: '', description: '', category: 'BUILDING', severity: 'MODERATE', address: '', estimatedCost: '', notes: '' }); fetchData() }
  }

  async function updateStatus(id, status) {
    const res = await fetch('/api/damage', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (res.ok) { toast.success(`Status → ${status.replace('_', ' ')}`); fetchData() }
  }

  const filtered = filter ? data.reports.filter(r => r.category === filter) : data.reports
  const statusFlow = ['REPORTED', 'INSPECTED', 'APPROVED', 'REPAIR_STARTED', 'COMPLETED']

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display font-bold text-2xl text-slate-800">📊 Damage Assessment</h1><p className="text-slate-500 text-sm mt-1">Post-disaster damage reports and repair tracking.</p></div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? '✕' : '+ New Report'}</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white text-lg shadow-sm">📊</div><div><p className="font-display font-bold text-2xl text-slate-800">{data.reports.length}</p><p className="text-xs text-slate-500">Total Reports</p></div></div>
          <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white text-lg shadow-sm">💰</div><div><p className="font-display font-bold text-xl text-slate-800">৳{(data.totalCost / 1000000).toFixed(1)}M</p><p className="text-xs text-slate-500">Est. Cost</p></div></div>
          <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white text-lg shadow-sm">⚠️</div><div><p className="font-display font-bold text-2xl text-slate-800">{data.reports.filter(r => r.severity === 'MAJOR' || r.severity === 'DESTROYED').length}</p><p className="text-xs text-slate-500">Major/Destroyed</p></div></div>
          <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg shadow-sm">✅</div><div><p className="font-display font-bold text-2xl text-slate-800">{data.reports.filter(r => r.status === 'COMPLETED').length}</p><p className="text-xs text-slate-500">Repaired</p></div></div>
        </div>

        {showForm && (
          <form onSubmit={createReport} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800">Report Damage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input" placeholder="e.g., Collapsed wall on Main St" required /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Address *</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input" required /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Description *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input min-h-[60px] resize-none" required /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Category</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="select">{['BUILDING','ROAD','BRIDGE','UTILITY','AGRICULTURE','VEHICLE','OTHER'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Severity</label><select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="select">{['MINOR','MODERATE','MAJOR','DESTROYED'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Est. Cost (৳)</label><input type="number" value={form.estimatedCost} onChange={e => setForm({...form, estimatedCost: e.target.value})} className="input" /></div>
            </div>
            <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">📊 Submit Report</button></div>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!filter ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm' : 'bg-white/50 text-slate-500 border border-white/60'}`}>All</button>
          {Object.keys(CAT_ICONS).map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${filter === c ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm' : 'bg-white/50 text-slate-500 border border-white/60'}`}>{CAT_ICONS[c]} {c}</button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="space-y-4">
            {filtered.map(report => (
              <div key={report.id} className="card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl flex-shrink-0">{CAT_ICONS[report.category]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-semibold text-slate-800">{report.title}</h3>
                      <span className={`badge text-[10px] ${SEV_COLORS[report.severity]}`}>{report.severity}</span>
                      <span className={`badge text-[10px] ${STAT_COLORS[report.status]}`}>{report.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{report.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                      <span>📍 {report.address}</span>
                      {report.estimatedCost && <span>💰 ৳{report.estimatedCost.toLocaleString()}</span>}
                      <span>👤 {report.reporter?.name}</span>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    {isStaff && (
                      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-teal-50">
                        {statusFlow.map(s => (
                          <button key={s} onClick={() => updateStatus(report.id, s)} disabled={report.status === s}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${report.status === s ? 'bg-teal-100 text-teal-700 border border-teal-300' : 'bg-white/50 text-slate-500 border border-white/60 hover:bg-teal-50'}`}>{s.replace('_', ' ')}</button>
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
