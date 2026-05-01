// src/app/weather-alerts/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const ALERT_TYPES = ['STORM', 'FLOOD', 'HEAT', 'COLD', 'CYCLONE', 'TSUNAMI', 'FOG', 'OTHER']
const TYPE_ICONS = { STORM: '⛈️', FLOOD: '🌊', HEAT: '🌡️', COLD: '❄️', CYCLONE: '🌀', TSUNAMI: '🌊', FOG: '🌫️', OTHER: '⚠️' }
const SEV_COLORS = { CRITICAL: 'bg-red-50 border-red-300 text-red-700', HIGH: 'bg-orange-50 border-orange-300 text-orange-700', MEDIUM: 'bg-amber-50 border-amber-300 text-amber-700', LOW: 'bg-green-50 border-green-300 text-green-700' }

export default function WeatherAlertsPage() {
  const { data: session } = useSession()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', alertType: 'STORM', severity: 'MEDIUM', region: '', startsAt: '', expiresAt: '', source: '' })
  const isStaff = ['STAFF', 'ADMIN'].includes(session?.user?.role)

  useEffect(() => { fetchAlerts() }, [])
  async function fetchAlerts() { const res = await fetch('/api/weather-alerts'); if (res.ok) setAlerts(await res.json()); setLoading(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch('/api/weather-alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success('Weather alert created!'); setShowForm(false); setForm({ title: '', description: '', alertType: 'STORM', severity: 'MEDIUM', region: '', startsAt: '', expiresAt: '', source: '' }); fetchAlerts() }
    else toast.error('Failed to create alert')
  }

  const active = alerts.filter(a => a.isActive)
  const expired = alerts.filter(a => !a.isActive)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display font-bold text-2xl text-slate-800">🌤️ Weather Alerts</h1><p className="text-slate-500 text-sm mt-1">Real-time weather monitoring and hazard warnings.</p></div>
          {isStaff && <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? '✕ Close' : '+ Create Alert'}</button>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: 'Active Alerts', value: active.length, bg: 'bg-red-500', icon: '🚨' }, { label: 'Critical', value: active.filter(a => a.severity === 'CRITICAL').length, bg: 'bg-red-600', icon: '🔴' }, { label: 'High', value: active.filter(a => a.severity === 'HIGH').length, bg: 'bg-orange-500', icon: '🟠' }, { label: 'Expired', value: expired.length, bg: 'bg-slate-400', icon: '✅' }].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-white text-lg shadow-sm`}>{s.icon}</div>
              <div><p className="font-display font-bold text-2xl text-slate-800">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800 text-lg">New Weather Alert</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input" required /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Region *</label><input value={form.region} onChange={e => setForm({...form, region: e.target.value})} className="input" required /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Description *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input min-h-[80px] resize-none" required /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Type</label><select value={form.alertType} onChange={e => setForm({...form, alertType: e.target.value})} className="select">{ALERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Severity</label><select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="select">{['LOW','MEDIUM','HIGH','CRITICAL'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Starts At</label><input type="datetime-local" value={form.startsAt} onChange={e => setForm({...form, startsAt: e.target.value})} className="input" required /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Expires At</label><input type="datetime-local" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="input" required /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Source</label><input value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="input" placeholder="e.g., Bangladesh Meteorological Dept" /></div>
            <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">⚡ Publish Alert</button></div>
          </form>
        )}

        {/* Active alerts */}
        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <>
            {active.length > 0 && <h2 className="font-display font-semibold text-slate-800 text-lg">🔴 Active Alerts</h2>}
            <div className="space-y-4">
              {active.map(alert => (
                <div key={alert.id} className={`card border-l-4 ${alert.severity === 'CRITICAL' ? 'border-l-red-500' : alert.severity === 'HIGH' ? 'border-l-orange-500' : alert.severity === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-green-500'}`}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{TYPE_ICONS[alert.alertType]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-slate-800">{alert.title}</h3>
                        <span className={`badge text-[10px] ${SEV_COLORS[alert.severity]}`}>{alert.severity}</span>
                        <span className="badge text-[10px] bg-teal-50 text-teal-600 border-teal-200">{alert.alertType}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{alert.description}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                        <span>📍 {alert.region}</span>
                        <span>🕐 {new Date(alert.startsAt).toLocaleDateString()} → {new Date(alert.expiresAt).toLocaleDateString()}</span>
                        {alert.source && <span>📡 {alert.source}</span>}
                        {alert.createdBy && <span>👤 {alert.createdBy.name}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {expired.length > 0 && (
              <>
                <h2 className="font-display font-semibold text-slate-500 text-lg mt-8">📁 Expired Alerts</h2>
                <div className="space-y-3">
                  {expired.map(alert => (
                    <div key={alert.id} className="card opacity-60">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{TYPE_ICONS[alert.alertType]}</span>
                        <div className="flex-1"><p className="text-sm text-slate-600 font-medium">{alert.title}</p><p className="text-xs text-slate-400">{alert.region} · Expired {formatDate(alert.expiresAt)}</p></div>
                        <span className={`badge text-[10px] ${SEV_COLORS[alert.severity]}`}>{alert.severity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
