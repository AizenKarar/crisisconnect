// src/app/medical/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const COND_ICONS = { INJURY: '🩹', ILLNESS: '🤒', CHRONIC: '💊', MENTAL_HEALTH: '🧠', PREGNANCY: '🤰', DEHYDRATION: '💧', OTHER: '🏥' }
const SEV_COLORS = { MINOR: 'bg-green-50 text-green-600 border-green-200', MODERATE: 'bg-amber-50 text-amber-600 border-amber-200', SEVERE: 'bg-orange-50 text-orange-600 border-orange-200', CRITICAL: 'bg-red-50 text-red-600 border-red-200' }
const STAT_COLORS = { ACTIVE: 'bg-blue-50 text-blue-600 border-blue-200', STABLE: 'bg-emerald-50 text-emerald-600 border-emerald-200', DISCHARGED: 'bg-slate-100 text-slate-500 border-slate-200', REFERRED: 'bg-purple-50 text-purple-600 border-purple-200', DECEASED: 'bg-red-100 text-red-700 border-red-300' }

export default function MedicalPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterCond, setFilterCond] = useState('')
  const [filterStat, setFilterStat] = useState('')
  const [form, setForm] = useState({ patientName: '', patientAge: '', patientGender: 'Male', condition: 'INJURY', severity: 'MODERATE', treatment: '', shelterName: '', location: '', notes: '' })

  useEffect(() => { fetchLogs() }, [])
  async function fetchLogs() { const res = await fetch('/api/medical'); if (res.ok) setLogs(await res.json()); setLoading(false) }

  async function createLog(e) {
    e.preventDefault()
    const res = await fetch('/api/medical', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success('Medical log created!'); setShowForm(false); setForm({ patientName: '', patientAge: '', patientGender: 'Male', condition: 'INJURY', severity: 'MODERATE', treatment: '', shelterName: '', location: '', notes: '' }); fetchLogs() }
  }

  async function updateStatus(id, status) {
    const res = await fetch('/api/medical', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    if (res.ok) { toast.success(`Patient status → ${status}`); fetchLogs() }
  }

  const filtered = logs.filter(l => (!filterCond || l.condition === filterCond) && (!filterStat || l.status === filterStat))
  const stats = { total: logs.length, active: logs.filter(l => l.status === 'ACTIVE').length, critical: logs.filter(l => l.severity === 'CRITICAL' || l.severity === 'SEVERE').length, discharged: logs.filter(l => l.status === 'DISCHARGED').length }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display font-bold text-2xl text-slate-800">🏥 Medical Log</h1><p className="text-slate-500 text-sm mt-1">Track patient conditions, treatments, and medical cases at shelters.</p></div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? '✕' : '+ New Patient Log'}</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: 'Total Patients', value: stats.total, bg: 'bg-teal-500', icon: '🏥' }, { label: 'Active Cases', value: stats.active, bg: 'bg-blue-500', icon: '💉' }, { label: 'Critical/Severe', value: stats.critical, bg: 'bg-red-500', icon: '🚨' }, { label: 'Discharged', value: stats.discharged, bg: 'bg-emerald-500', icon: '✅' }].map(s => (
            <div key={s.label} className="card flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-white text-lg shadow-sm`}>{s.icon}</div><div><p className="font-display font-bold text-2xl text-slate-800">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div></div>
          ))}
        </div>

        {showForm && (
          <form onSubmit={createLog} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800">New Patient Record</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Patient Name *</label><input value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} className="input" required /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Age</label><input type="number" value={form.patientAge} onChange={e => setForm({...form, patientAge: e.target.value})} className="input" /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Gender</label><select value={form.patientGender} onChange={e => setForm({...form, patientGender: e.target.value})} className="select"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Condition *</label><select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="select">{['INJURY','ILLNESS','CHRONIC','MENTAL_HEALTH','PREGNANCY','DEHYDRATION','OTHER'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Severity *</label><select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="select">{['MINOR','MODERATE','SEVERE','CRITICAL'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Treatment *</label><textarea value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} className="input min-h-[80px] resize-none" placeholder="Describe treatment given..." required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Shelter</label><input value={form.shelterName} onChange={e => setForm({...form, shelterName: e.target.value})} className="input" /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input" /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input min-h-[50px] resize-none" /></div>
            <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">🏥 Save Record</button></div>
          </form>
        )}

        <div className="flex flex-wrap gap-3">
          <select value={filterCond} onChange={e => setFilterCond(e.target.value)} className="select w-auto"><option value="">All Conditions</option>{['INJURY','ILLNESS','CHRONIC','MENTAL_HEALTH','PREGNANCY','DEHYDRATION','OTHER'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}</select>
          <select value={filterStat} onChange={e => setFilterStat(e.target.value)} className="select w-auto"><option value="">All Statuses</option>{['ACTIVE','STABLE','DISCHARGED','REFERRED','DECEASED'].map(s => <option key={s} value={s}>{s}</option>)}</select>
          {(filterCond || filterStat) && <button onClick={() => { setFilterCond(''); setFilterStat('') }} className="text-xs text-teal-600 font-medium px-3">Clear</button>}
        </div>

        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="space-y-4">
            {filtered.map(log => (
              <div key={log.id} className={`card ${log.severity === 'CRITICAL' ? 'border-l-4 border-l-red-500' : log.severity === 'SEVERE' ? 'border-l-4 border-l-orange-500' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl flex-shrink-0">{COND_ICONS[log.condition]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-semibold text-slate-800">{log.patientName}</h3>
                      {log.patientAge && <span className="text-xs text-slate-400">{log.patientGender}, {log.patientAge} yrs</span>}
                      <span className={`badge text-[10px] ${SEV_COLORS[log.severity]}`}>{log.severity}</span>
                      <span className={`badge text-[10px] ${STAT_COLORS[log.status]}`}>{log.status}</span>
                    </div>
                    <p className="text-xs text-teal-600 font-medium mb-1">{log.condition.replace('_', ' ')}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{log.treatment}</p>
                    {log.notes && <p className="text-xs text-slate-400 italic mt-1">Note: {log.notes}</p>}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                      {log.shelterName && <span>🏠 {log.shelterName}</span>}
                      {log.location && <span>📍 {log.location}</span>}
                      <span>👨‍⚕️ {log.loggedBy?.name}</span>
                      <span>{formatDate(log.createdAt)}</span>
                    </div>

                    {log.status !== 'DISCHARGED' && log.status !== 'DECEASED' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-teal-50">
                        {['ACTIVE', 'STABLE', 'DISCHARGED', 'REFERRED'].map(s => (
                          <button key={s} onClick={() => updateStatus(log.id, s)} disabled={log.status === s}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${log.status === s ? 'bg-teal-100 text-teal-700 border border-teal-300' : 'bg-white/50 text-slate-500 border border-white/60 hover:bg-teal-50'}`}>{s}</button>
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
