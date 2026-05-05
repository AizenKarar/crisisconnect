'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { getSeverityColor, getStatusColor, getDisasterIcon, formatDate, reverseGeocode } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function IncidentDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()

  const [incident, setIncident] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('details')
  const [displayAddress, setDisplayAddress] = useState('Fetching area...')

  let role = ''
  if (session && session.user) {
    role = session.user.role
  }

  let currentUserId = ''
  if (session && session.user) {
    currentUserId = session.user.id
  }

  useEffect(function () {
    fetchIncident()
    fetchMessages()
  }, [id])

  async function fetchIncident() {
    try {
      const response = await fetch('/api/incidents/' + id)
      if (response.ok) {
        const data = await response.json()
        setIncident(data)
        if (!data.address || data.address === 'Unknown') {
          const locName = await reverseGeocode(data.latitude, data.longitude)
          setDisplayAddress(locName)
        } else {
          setDisplayAddress(data.address)
        }
      }
    } catch (error) {
    }
    setLoading(false)
  }

  async function fetchMessages() {
    try {
      const response = await fetch('/api/incidents/' + id + '/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
    }
  }

  async function updateStatus(newStatus) {
    try {
      const response = await fetch('/api/incidents/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        toast.success('Status updated to ' + newStatus)
        fetchIncident()
      }
    } catch (error) {
    }
  }

  async function sendMessage(event) {
    event.preventDefault()

    if (newMessage.trim() === '') {
      return
    }

    try {
      const response = await fetch('/api/incidents/' + id + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })
      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
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

  if (!incident) {
    return (
      <DashboardLayout>
        <p className="text-slate-400 py-20 text-center">Incident not found.</p>
      </DashboardLayout>
    )
  }

  const statusFlow = ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED']

  let canChangeStatus = false
  if (role === 'STAFF' || role === 'ADMIN') {
    canChangeStatus = true
  }

  let reporterText = ''
  if (incident.reporter && !incident.isAnonymous) {
    reporterText = ' by ' + incident.reporter.name
  }
  if (incident.isAnonymous) {
    reporterText = ' (Anonymous)'
  }

  let messageCount = 0
  if (incident._count && incident._count.messages) {
    messageCount = incident._count.messages
  }

  let auditLogs = []
  if (incident.auditLogs) {
    auditLogs = incident.auditLogs
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{getDisasterIcon(incident.type)}</span>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-slate-800">{incident.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{displayAddress} · Reported {formatDate(incident.createdAt)}{reporterText}</p>
          </div>
          <div className="flex gap-2">
            <span className={'badge ' + getSeverityColor(incident.severity)}>{incident.severity}</span>
            <span className={'badge ' + getStatusColor(incident.status)}>{incident.status.replace('_', ' ')}</span>
          </div>
        </div>

        {canChangeStatus && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-500 mb-4">Verification Workflow</h3>
            <div className="flex items-center gap-2">
              {statusFlow.map(function (statusStep, index) {
                let isCurrent = incident.status === statusStep
                let isPast = statusFlow.indexOf(incident.status) > index
                let buttonStyle = 'bg-white/50 text-slate-500 border border-white/60 hover:bg-teal-50 hover:text-teal-600'
                if (isCurrent) {
                  buttonStyle = 'bg-teal-100 text-teal-700 border border-teal-300 ring-2 ring-teal-200'
                } else if (isPast) {
                  buttonStyle = 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }
                return (
                  <div key={statusStep} className="flex items-center gap-2 flex-1">
                    <button onClick={function () { updateStatus(statusStep) }} disabled={isCurrent}
                      className={'flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ' + buttonStyle}>
                      {statusStep.replace('_', ' ')}
                    </button>
                    {index < statusFlow.length - 1 && <span className="text-slate-300">→</span>}
                  </div>
                )
              })}
              <button onClick={function () { updateStatus('REJECTED') }} className="py-2.5 px-4 rounded-xl text-xs font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all">Reject</button>
            </div>
          </div>
        )}

        <div className="flex gap-1 border-b border-teal-100 pb-0">
          {['details', 'chat', 'audit'].map(function (tabName) {
            let isActive = tab === tabName
            let tabLabel = tabName
            if (tabName === 'chat') {
              tabLabel = 'Chat (' + messageCount + ')'
            }
            let tabStyle = 'text-slate-400 border-transparent hover:text-teal-600'
            if (isActive) {
              tabStyle = 'text-teal-700 border-teal-500'
            }
            return (
              <button key={tabName} onClick={function () { setTab(tabName) }}
                className={'px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ' + tabStyle}>
                {tabLabel}
              </button>
            )
          })}
        </div>

        {tab === 'details' && (
          <div className="card space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">{incident.description}</p>
            </div>
            {incident.imageUrl && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2">Evidence Photo</h3>
                <img src={incident.imageUrl} alt="Evidence" className="rounded-xl max-h-80 object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-1">Type</h3>
                <p className="text-slate-700">{incident.type}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-1">Coordinates</h3>
                <p className="text-slate-700 font-mono text-sm">{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</p>
                <p className="text-slate-600 text-xs mt-1">{displayAddress}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="card">
            <div className="h-80 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 ? (
                <p className="text-center text-slate-400 py-12 text-sm">No messages yet.</p>
              ) : (
                messages.map(function (msg) {
                  let isMyMessage = (msg.userId === currentUserId)
                  let alignClass = isMyMessage ? 'justify-end' : 'justify-start'
                  let bubbleClass = isMyMessage
                    ? 'bg-teal-100 text-teal-800 rounded-br-md'
                    : 'bg-white/60 text-slate-600 rounded-bl-md border border-white/60'
                  return (
                    <div key={msg.id} className={'flex ' + alignClass}>
                      <div className={'max-w-[70%] px-4 py-2.5 rounded-2xl ' + bubbleClass}>
                        <p className="text-xs font-semibold text-slate-500 mb-1">{msg.user.name} · <span className="text-slate-400">{msg.user.role}</span></p>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(msg.createdAt)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-3">
              <input value={newMessage} onChange={function (e) { setNewMessage(e.target.value) }} placeholder="Type a message..." className="input flex-1" />
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </div>
        )}

        {tab === 'audit' && (
          <div className="card">
            <h3 className="font-display font-semibold text-slate-800 mb-4">Activity Log</h3>
            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No activity yet.</p>
              ) : (
                auditLogs.map(function (log) {
                  let logUserName = 'System'
                  if (log.user && log.user.name) {
                    logUserName = log.user.name
                  }
                  return (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/30">
                      <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-600">{log.details}</p>
                        <p className="text-xs text-slate-400 mt-1">{logUserName} · {formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}