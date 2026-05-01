// src/app/events/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

const EVT_ICONS = { DRILL: '🏃', MEETING: '📋', DISTRIBUTION: '📦', TRAINING: '📚', CLEANUP: '🧹', FUNDRAISER: '💰', OTHER: '📅' }
const EVT_COLORS = { DRILL: 'border-l-orange-500', MEETING: 'border-l-blue-500', DISTRIBUTION: 'border-l-teal-500', TRAINING: 'border-l-purple-500', CLEANUP: 'border-l-green-500', FUNDRAISER: 'border-l-amber-500', OTHER: 'border-l-slate-400' }
const STAT_COLORS = { UPCOMING: 'bg-blue-50 text-blue-600 border-blue-200', ONGOING: 'bg-emerald-50 text-emerald-600 border-emerald-200', COMPLETED: 'bg-slate-100 text-slate-500 border-slate-200', CANCELLED: 'bg-red-50 text-red-400 border-red-200' }

export default function EventsPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState({ title: '', description: '', eventType: 'MEETING', startDate: '', endDate: '', location: '', maxAttendees: '' })
  const isStaff = ['STAFF', 'ADMIN'].includes(session?.user?.role)

  useEffect(() => { fetchEvents() }, [])
  async function fetchEvents() { const res = await fetch('/api/events'); if (res.ok) setEvents(await res.json()); setLoading(false) }

  async function createEvent(e) {
    e.preventDefault()
    const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success('Event created!'); setShowForm(false); setForm({ title: '', description: '', eventType: 'MEETING', startDate: '', endDate: '', location: '', maxAttendees: '' }); fetchEvents() }
  }

  async function rsvp(eventId, status) {
    const res = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rsvpEventId: eventId, rsvpStatus: status }) })
    if (res.ok) { toast.success(`RSVP: ${status}`); fetchEvents() }
  }

  const filtered = filter === 'ALL' ? events : events.filter(e => e.status === filter)
  const upcoming = events.filter(e => e.status === 'UPCOMING' || e.status === 'ONGOING')

  function formatEventDate(date) { return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display font-bold text-2xl text-slate-800">🗓️ Events Calendar</h1><p className="text-slate-500 text-sm mt-1">Upcoming relief events, drills, meetings, and community activities.</p></div>
          {isStaff && <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? '✕' : '+ Create Event'}</button>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ label: 'Total Events', value: events.length, bg: 'bg-teal-500', icon: '🗓️' }, { label: 'Upcoming', value: upcoming.length, bg: 'bg-blue-500', icon: '📅' }, { label: 'Completed', value: events.filter(e => e.status === 'COMPLETED').length, bg: 'bg-emerald-500', icon: '✅' }, { label: 'Total RSVPs', value: events.reduce((s, e) => s + (e._count?.rsvps || 0), 0), bg: 'bg-purple-500', icon: '👥' }].map(s => (
            <div key={s.label} className="card flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-white text-lg shadow-sm`}>{s.icon}</div><div><p className="font-display font-bold text-2xl text-slate-800">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div></div>
          ))}
        </div>

        {showForm && (
          <form onSubmit={createEvent} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800">New Event</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input" required /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Type</label><select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} className="select">{['DRILL','MEETING','DISTRIBUTION','TRAINING','CLEANUP','FUNDRAISER','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Description *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input min-h-[60px] resize-none" required /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Start *</label><input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input" required /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">End</label><input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input" /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Location *</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input" required /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Max Attendees</label><input type="number" value={form.maxAttendees} onChange={e => setForm({...form, maxAttendees: e.target.value})} className="input" /></div>
            </div>
            <div className="flex gap-3"><button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">🗓️ Create Event</button></div>
          </form>
        )}

        <div className="flex gap-2">
          {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm' : 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'}`}>{s === 'ALL' ? 'All' : s}</button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="space-y-4">
            {filtered.map(event => {
              const myRsvp = event.rsvps?.find(r => r.user.id === session?.user?.id)
              const goingCount = event.rsvps?.filter(r => r.status === 'GOING').length || 0
              return (
                <div key={event.id} className={`card border-l-4 ${EVT_COLORS[event.eventType]}`}>
                  <div className="flex items-start gap-4">
                    <div className="text-center flex-shrink-0 w-16">
                      <div className="w-16 h-16 rounded-xl bg-teal-50 border border-teal-200 flex flex-col items-center justify-center">
                        <span className="text-xl">{EVT_ICONS[event.eventType]}</span>
                        <span className="text-[10px] text-teal-600 font-medium mt-0.5">{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold text-slate-800">{event.title}</h3>
                        <span className={`badge text-[10px] ${STAT_COLORS[event.status]}`}>{event.status}</span>
                        <span className="badge text-[10px] bg-teal-50 text-teal-600 border-teal-200">{event.eventType}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{event.description}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                        <span>📍 {event.location}</span>
                        <span>🕐 {formatEventDate(event.startDate)}{event.endDate ? ` — ${formatEventDate(event.endDate)}` : ''}</span>
                        <span>👥 {goingCount}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attending</span>
                      </div>

                      {event.status === 'UPCOMING' && session && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-teal-50">
                          {['GOING', 'MAYBE', 'NOT_GOING'].map(s => (
                            <button key={s} onClick={() => rsvp(event.id, s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${myRsvp?.status === s ? 'bg-teal-100 text-teal-700 border border-teal-300 ring-1 ring-teal-200' : 'bg-white/50 text-slate-500 border border-white/60 hover:bg-teal-50'}`}>
                              {s === 'GOING' ? '✅ Going' : s === 'MAYBE' ? '🤔 Maybe' : '❌ Can\'t Go'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
