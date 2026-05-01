// src/app/tasks/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

// Icons and colors for priorities, categories, and statuses
const PRI_ICONS = { URGENT: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🟢' }
const PRI_COLORS = { URGENT: 'bg-red-50 text-red-600 border-red-200', HIGH: 'bg-orange-50 text-orange-600 border-orange-200', MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200', LOW: 'bg-green-50 text-green-600 border-green-200' }
const CAT_ICONS = { RESCUE: '🚁', LOGISTICS: '📦', MEDICAL: '🏥', REPAIR: '🔧', CLEANUP: '🧹', PATROL: '🛡️', OTHER: '📋' }
const STAT_COLORS = { TODO: 'bg-slate-100 text-slate-600', IN_PROGRESS: 'bg-blue-50 text-blue-600', DONE: 'bg-emerald-50 text-emerald-600', CANCELLED: 'bg-red-50 text-red-400' }

export default function TasksPage() {
  // Get the current logged-in user session
  const { data: session } = useSession()

  // State variables
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState('board')

  // Form fields for creating a new task
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPriority, setFormPriority] = useState('MEDIUM')
  const [formCategory, setFormCategory] = useState('OTHER')
  const [formDueDate, setFormDueDate] = useState('')
  const [formLocation, setFormLocation] = useState('')

  // Fetch tasks when page loads
  useEffect(function () {
    fetchTasks()
  }, [])

  // Fetch all tasks from the API
  async function fetchTasks() {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
    setLoading(false)
  }

  // Create a new task
  async function createTask(event) {
    event.preventDefault()
    let taskData = {
      title: formTitle,
      description: formDescription,
      priority: formPriority,
      category: formCategory,
      dueDate: formDueDate,
      location: formLocation,
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
      if (response.ok) {
        toast.success('Task created!')
        setShowForm(false)
        setFormTitle('')
        setFormDescription('')
        setFormPriority('MEDIUM')
        setFormCategory('OTHER')
        setFormDueDate('')
        setFormLocation('')
        fetchTasks()
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  // Update a task's status
  async function updateStatus(taskId, newStatus) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      })
      if (response.ok) {
        if (newStatus === 'DONE') {
          toast.success('✅ Task completed! +5 karma')
        } else {
          toast.success('Status → ' + newStatus)
        }
        fetchTasks()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  // Calculate stats
  let totalTasks = tasks.length
  let todoCount = 0
  let progressCount = 0
  let doneCount = 0
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].status === 'TODO') { todoCount = todoCount + 1 }
    if (tasks[i].status === 'IN_PROGRESS') { progressCount = progressCount + 1 }
    if (tasks[i].status === 'DONE') { doneCount = doneCount + 1 }
  }

  // Get tasks for a specific status (used in board view)
  function getTasksByStatus(status) {
    let result = []
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].status === status) {
        result.push(tasks[i])
      }
    }
    return result
  }

  // Priority and category options for the form
  let priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
  let categoryOptions = ['RESCUE', 'LOGISTICS', 'MEDICAL', 'REPAIR', 'CLEANUP', 'PATROL', 'OTHER']

  // Stats cards data
  let statsCards = [
    { label: 'Total Tasks', value: totalTasks, bg: 'bg-teal-500', icon: '📋' },
    { label: 'To Do', value: todoCount, bg: 'bg-slate-400', icon: '📝' },
    { label: 'In Progress', value: progressCount, bg: 'bg-blue-500', icon: '🔄' },
    { label: 'Completed', value: doneCount, bg: 'bg-emerald-500', icon: '✅' },
  ]

  // Board view columns
  let boardColumns = ['TODO', 'IN_PROGRESS', 'DONE']

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">📋 Task Manager</h1>
            <p className="text-slate-500 text-sm mt-1">Assign, track, and complete emergency response tasks.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-white/50 rounded-xl border border-white/60 p-0.5">
              <button onClick={function () { setView('board') }} className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (view === 'board' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500')}>Board</button>
              <button onClick={function () { setView('list') }} className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (view === 'list' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500')}>List</button>
            </div>
            <button onClick={function () { setShowForm(!showForm) }} className="btn-primary">{showForm ? '✕' : '+ New Task'}</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map(function (stat) {
            return (
              <div key={stat.label} className="card flex items-center gap-3">
                <div className={'w-10 h-10 rounded-xl ' + stat.bg + ' flex items-center justify-center text-white text-lg shadow-sm'}>{stat.icon}</div>
                <div>
                  <p className="font-display font-bold text-2xl text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* New task form */}
        {showForm && (
          <form onSubmit={createTask} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800">New Task</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Title *</label><input value={formTitle} onChange={function (e) { setFormTitle(e.target.value) }} className="input" required /></div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Location</label><input value={formLocation} onChange={function (e) { setFormLocation(e.target.value) }} className="input" /></div>
            </div>
            <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Description *</label><textarea value={formDescription} onChange={function (e) { setFormDescription(e.target.value) }} className="input min-h-[60px] resize-none" required /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Priority</label>
                <select value={formPriority} onChange={function (e) { setFormPriority(e.target.value) }} className="select">
                  {priorityOptions.map(function (p) { return <option key={p} value={p}>{p}</option> })}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Category</label>
                <select value={formCategory} onChange={function (e) { setFormCategory(e.target.value) }} className="select">
                  {categoryOptions.map(function (c) { return <option key={c} value={c}>{c}</option> })}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-500 mb-1.5">Due Date</label><input type="date" value={formDueDate} onChange={function (e) { setFormDueDate(e.target.value) }} className="input" /></div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={function () { setShowForm(false) }} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Create Task</button>
            </div>
          </form>
        )}

        {/* Task board or list */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : view === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boardColumns.map(function (status) {
              let columnTasks = getTasksByStatus(status)
              return (
                <div key={status}>
                  <h3 className={'font-display font-semibold text-sm px-3 py-2 rounded-xl mb-3 ' + STAT_COLORS[status]}>
                    {status.replace('_', ' ')} ({columnTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {columnTasks.map(function (task) {
                      let assigneeName = 'Unassigned'
                      if (task.assignee && task.assignee.name) {
                        assigneeName = task.assignee.name
                      }
                      let nextAction = ''
                      let nextStatus = ''
                      if (status === 'TODO') {
                        nextAction = '▶ Start'
                        nextStatus = 'IN_PROGRESS'
                      } else if (status === 'IN_PROGRESS') {
                        nextAction = '✅ Done'
                        nextStatus = 'DONE'
                      }
                      return (
                        <div key={task.id} className="card text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span>{CAT_ICONS[task.category]}</span>
                            <span className={'badge text-[10px] ' + PRI_COLORS[task.priority]}>{PRI_ICONS[task.priority]} {task.priority}</span>
                          </div>
                          <h4 className="font-medium text-slate-700 mb-1">{task.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                          {task.location && <p className="text-xs text-slate-400 mt-1">📍 {task.location}</p>}
                          {task.dueDate && <p className="text-xs text-slate-400">📅 Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                          <p className="text-xs text-teal-600 mt-1">👤 {assigneeName}</p>
                          <div className="flex gap-1 mt-3 pt-2 border-t border-teal-50">
                            {status !== 'DONE' && (
                              <button onClick={function () { updateStatus(task.id, nextStatus) }}
                                className="px-2 py-1 rounded-lg text-[10px] font-medium bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100">
                                {nextAction}
                              </button>
                            )}
                            {status === 'TODO' && (
                              <button onClick={function () { updateStatus(task.id, 'CANCELLED') }}
                                className="px-2 py-1 rounded-lg text-[10px] font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100">
                                ✕ Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(function (task) {
              let assigneeName = 'Unassigned'
              if (task.assignee && task.assignee.name) {
                assigneeName = task.assignee.name
              }
              let dueDateText = 'No due date'
              if (task.dueDate) {
                dueDateText = 'Due ' + new Date(task.dueDate).toLocaleDateString()
              }
              let locationText = task.location || 'No location'
              let canProgress = (task.status !== 'DONE' && task.status !== 'CANCELLED')
              let nextStatus = (task.status === 'TODO') ? 'IN_PROGRESS' : 'DONE'
              let nextLabel = (task.status === 'TODO') ? 'Start' : 'Done'
              return (
                <div key={task.id} className="card flex items-center gap-4 py-4">
                  <span className="text-xl">{CAT_ICONS[task.category]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{locationText} · {assigneeName} · {dueDateText}</p>
                  </div>
                  <span className={'badge text-[10px] ' + PRI_COLORS[task.priority]}>{task.priority}</span>
                  <span className={'badge text-[10px] ' + STAT_COLORS[task.status]}>{task.status.replace('_', ' ')}</span>
                  {canProgress && (
                    <button onClick={function () { updateStatus(task.id, nextStatus) }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100">
                      {nextLabel}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
