// src/app/training/page.js
'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

const CAT_ICONS = { FIRST_AID: '🩹', FIRE_SAFETY: '🧯', FLOOD_PREP: '🌊', EARTHQUAKE: '🏚️', CPR: '❤️', EVACUATION: '🚪', GENERAL: '📖' }
const DIFF_COLORS = { BEGINNER: 'bg-green-50 text-green-600 border-green-200', INTERMEDIATE: 'bg-amber-50 text-amber-600 border-amber-200', ADVANCED: 'bg-red-50 text-red-600 border-red-200' }
const CATEGORIES = ['ALL', 'FIRST_AID', 'FIRE_SAFETY', 'FLOOD_PREP', 'EARTHQUAKE', 'CPR', 'GENERAL']

export default function TrainingPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [activeId, setActiveId] = useState(null)

  useEffect(() => { fetchResources() }, [])
  async function fetchResources() { const res = await fetch('/api/training'); if (res.ok) setResources(await res.json()); setLoading(false) }

  async function markProgress(resourceId, status) {
    const res = await fetch('/api/training', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resourceId, status }) })
    if (res.ok) { toast.success(status === 'COMPLETED' ? '🎉 Course completed! +10 karma' : 'Progress saved'); fetchResources() }
  }

  const filtered = filter === 'ALL' ? resources : resources.filter(r => r.category === filter)
  const completed = resources.filter(r => r.progress?.length > 0 && r.progress[0].status === 'COMPLETED').length
  const active = resources.filter(r => activeId === r.id)[0]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="font-display font-bold text-2xl text-slate-800">📚 Training Center</h1><p className="text-slate-500 text-sm mt-1">Disaster preparedness courses and emergency skill-building resources.</p></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white text-lg shadow-sm">📚</div><div><p className="font-display font-bold text-2xl text-slate-800">{resources.length}</p><p className="text-xs text-slate-500">Total Courses</p></div></div>
          <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg shadow-sm">✅</div><div><p className="font-display font-bold text-2xl text-slate-800">{completed}</p><p className="text-xs text-slate-500">Completed</p></div></div>
          <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white text-lg shadow-sm">📊</div><div><p className="font-display font-bold text-2xl text-slate-800">{resources.length > 0 ? Math.round((completed / resources.length) * 100) : 0}%</p><p className="text-xs text-slate-500">Progress</p></div></div>
          <div className="card"><p className="text-xs text-slate-400 font-semibold mb-2">Overall Progress</p><div className="progress-bar h-3"><div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${resources.length > 0 ? (completed / resources.length) * 100 : 0}%` }} /></div></div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${filter === c ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm' : 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'}`}>
              {c !== 'ALL' && <span>{CAT_ICONS[c]}</span>} {c === 'ALL' ? 'All' : c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(res => {
              const myProgress = res.progress?.[0]
              const isCompleted = myProgress?.status === 'COMPLETED'
              const isOpen = activeId === res.id
              return (
                <div key={res.id} className={`card ${isCompleted ? 'border-l-4 border-l-emerald-500' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{CAT_ICONS[res.category] || '📖'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold text-slate-800">{res.title}</h3>
                        <span className={`badge text-[10px] ${DIFF_COLORS[res.difficulty]}`}>{res.difficulty}</span>
                        {isCompleted && <span className="badge text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">✅ Completed</span>}
                      </div>
                      <p className="text-sm text-slate-500">{res.description}</p>
                      <div className="flex gap-3 mt-2 text-xs text-slate-400">
                        <span>{res.contentType}</span>
                        {res.duration && <span>⏱ {res.duration} min</span>}
                        <span>👥 {res._count?.progress || 0} enrolled</span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setActiveId(isOpen ? null : res.id)} className="btn-ghost text-xs py-1.5">
                          {isOpen ? 'Close ▲' : 'Read Content ▼'}
                        </button>
                        {!isCompleted && (
                          <>
                            {!myProgress && <button onClick={() => markProgress(res.id, 'IN_PROGRESS')} className="btn-ghost text-xs py-1.5">📖 Start</button>}
                            <button onClick={() => markProgress(res.id, 'COMPLETED')} className="btn-primary text-xs py-1.5">✅ Mark Complete</button>
                          </>
                        )}
                      </div>

                      {isOpen && (
                        <div className="mt-4 p-4 rounded-xl bg-white/40 border border-white/50 animate-slide-down">
                          <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-line">{res.content}</div>
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
