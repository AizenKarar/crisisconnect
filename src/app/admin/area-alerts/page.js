// src/app/admin/area-alerts/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

// Alert type options
const ALERT_TYPES = ['EMERGENCY', 'EVACUATION', 'WARNING', 'INFO', 'ALL_CLEAR']

// Icons for each alert type
const TYPE_ICONS = {
  EMERGENCY: '🚨',
  EVACUATION: '🚧',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  ALL_CLEAR: '✅',
}

// Colors for each alert type
const TYPE_COLORS = {
  EMERGENCY: 'bg-red-50 text-red-600 border-red-200',
  EVACUATION: 'bg-orange-50 text-orange-600 border-orange-200',
  WARNING: 'bg-amber-50 text-amber-600 border-amber-200',
  INFO: 'bg-blue-50 text-blue-600 border-blue-200',
  ALL_CLEAR: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

// Colors for severity levels
const SEV_COLORS = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-300',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
  LOW: 'bg-green-100 text-green-700 border-green-300',
}

// Pre-defined area targets for quick selection
const AREA_PRESETS = [
  { name: 'Mirpur', lat: 23.8069, lng: 90.3687 },
  { name: 'Old Dhaka', lat: 23.7200, lng: 90.4000 },
  { name: 'Uttara', lat: 23.8759, lng: 90.3795 },
  { name: 'Gulshan-Banani', lat: 23.7934, lng: 90.4144 },
  { name: 'Motijheel', lat: 23.7339, lng: 90.4190 },
  { name: "Cox's Bazar Coast", lat: 21.4272, lng: 92.0058 },
  { name: 'Sylhet Division', lat: 24.8949, lng: 91.8687 },
  { name: 'Chittagong Port', lat: 22.3569, lng: 91.7832 },
]

export default function AreaAlertsPage() {
  // Get the logged-in user session
  const { data: session } = useSession()

  // State variables
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Form fields
  const [formTitle, setFormTitle] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formAlertType, setFormAlertType] = useState('EMERGENCY')
  const [formSeverity, setFormSeverity] = useState('HIGH')
  const [formTargetArea, setFormTargetArea] = useState('')
  const [formLatitude, setFormLatitude] = useState('')
  const [formLongitude, setFormLongitude] = useState('')
  const [formRadiusKm, setFormRadiusKm] = useState('5')
  const [formExpiresAt, setFormExpiresAt] = useState('')

  // Fetch alerts when page loads
  useEffect(function () {
    fetchAlerts()
  }, [])

  // Fetch all alerts from the API
  async function fetchAlerts() {
    try {
      const response = await fetch('/api/area-alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
    setLoading(false)
  }

  // Check if user is an admin
  let isAdmin = false
  if (session && session.user && session.user.role === 'ADMIN') {
    isAdmin = true
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-4xl mb-4">🔒</span>
          <h2 className="font-display font-bold text-xl text-slate-800">Admin Only</h2>
          <p className="text-slate-500 mt-2">Area Alert system is restricted to Super-Admins.</p>
        </div>
      </DashboardLayout>
    )
  }

  // When a preset area button is clicked
  function selectPreset(preset) {
    setFormTargetArea(preset.name)
    setFormLatitude(preset.lat.toString())
    setFormLongitude(preset.lng.toString())
  }

  // Clear the form after sending
  function clearForm() {
    setFormTitle('')
    setFormMessage('')
    setFormAlertType('EMERGENCY')
    setFormSeverity('HIGH')
    setFormTargetArea('')
    setFormLatitude('')
    setFormLongitude('')
    setFormRadiusKm('5')
    setFormExpiresAt('')
  }

  // Send the alert
  async function handleSend(event) {
    event.preventDefault()

    // Validate required fields
    if (!formTitle || !formMessage || !formTargetArea) {
      toast.error('Title, message, and target area are required')
      return
    }

    setSending(true)

    let formData = {
      title: formTitle,
      message: formMessage,
      alertType: formAlertType,
      severity: formSeverity,
      targetArea: formTargetArea,
      latitude: formLatitude,
      longitude: formLongitude,
      radiusKm: formRadiusKm,
      expiresAt: formExpiresAt,
    }

    try {
      const response = await fetch('/api/area-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('🚨 Alert sent to ' + data.recipientCount + ' users in ' + formTargetArea + '!')
        clearForm()
        fetchAlerts()
      } else {
        toast.error('Failed to send alert')
      }
    } catch (error) {
      console.error('Error sending alert:', error)
      toast.error('Failed to send alert')
    }

    setSending(false)
  }

  // Toggle an alert active/inactive
  async function toggleActive(alertId, newActiveState) {
    try {
      const response = await fetch('/api/area-alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, isActive: newActiveState }),
      })

      if (response.ok) {
        if (newActiveState) {
          toast.success('Alert reactivated')
        } else {
          toast.success('Alert deactivated')
        }
        fetchAlerts()
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  // Count active and inactive alerts
  let activeAlerts = []
  let inactiveAlerts = []
  let totalRecipients = 0

  for (let i = 0; i < alerts.length; i++) {
    if (alerts[i].isActive) {
      activeAlerts.push(alerts[i])
    } else {
      inactiveAlerts.push(alerts[i])
    }
    totalRecipients = totalRecipients + alerts[i].recipientCount
  }

  // Stats cards data
  let statsCards = [
    { label: 'Total Alerts', value: alerts.length, bg: 'bg-teal-500', icon: '📡' },
    { label: 'Active', value: activeAlerts.length, bg: 'bg-red-500', icon: '🔴' },
    { label: 'Deactivated', value: inactiveAlerts.length, bg: 'bg-slate-400', icon: '⏸️' },
    { label: 'Total Reached', value: totalRecipients.toLocaleString(), bg: 'bg-purple-500', icon: '👥' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">🎯 Area Alert System</h1>
          <p className="text-slate-500 text-sm mt-1">Send targeted mass emergency alerts to specific geographic areas.</p>
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

        {/* Compose form */}
        <form onSubmit={handleSend} className="card space-y-5 border-l-4 border-l-red-400">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🚨</span>
            <div>
              <h2 className="font-display font-semibold text-slate-800 text-lg">Compose Area Alert</h2>
              <p className="text-xs text-red-500 font-medium">⚠️ This will send push notifications to all users in the target area.</p>
            </div>
          </div>

          {/* Quick area select */}
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Quick Select Area</label>
            <div className="flex flex-wrap gap-2">
              {AREA_PRESETS.map(function (preset) {
                let isSelected = formTargetArea === preset.name
                let buttonStyle = 'bg-white/50 text-slate-500 border-white/60 hover:bg-teal-50'
                if (isSelected) {
                  buttonStyle = 'bg-teal-100 text-teal-700 border-teal-300 shadow-sm'
                }
                return (
                  <button key={preset.name} type="button" onClick={function () { selectPreset(preset) }}
                    className={'px-3 py-2 rounded-xl text-xs font-medium transition-all border ' + buttonStyle}>
                    📍 {preset.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Target Area *</label>
              <input value={formTargetArea} onChange={function (e) { setFormTargetArea(e.target.value) }} className="input" placeholder="e.g., Mirpur Section 10-12" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Alert Title *</label>
              <input value={formTitle} onChange={function (e) { setFormTitle(e.target.value) }} className="input" placeholder="e.g., EVACUATE: Flash Flood Warning" required />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Alert Type</label>
              <select value={formAlertType} onChange={function (e) { setFormAlertType(e.target.value) }} className="select">
                {ALERT_TYPES.map(function (type) {
                  return <option key={type} value={type}>{TYPE_ICONS[type]} {type}</option>
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Severity</label>
              <select value={formSeverity} onChange={function (e) { setFormSeverity(e.target.value) }} className="select">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(function (sev) {
                  return <option key={sev} value={sev}>{sev}</option>
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Radius (km)</label>
              <input type="number" value={formRadiusKm} onChange={function (e) { setFormRadiusKm(e.target.value) }} className="input" min={1} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Expires At</label>
              <input type="datetime-local" value={formExpiresAt} onChange={function (e) { setFormExpiresAt(e.target.value) }} className="input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1.5">Alert Message *</label>
            <textarea value={formMessage} onChange={function (e) { setFormMessage(e.target.value) }} className="input min-h-[120px] resize-none" placeholder="Detailed alert message with instructions, shelter locations, evacuation routes..." required />
          </div>

          <button type="submit" disabled={sending} className="btn-danger w-full text-base py-3">
            {sending ? '📡 Sending...' : '🚨 Send Alert to ' + (formTargetArea || '...')}
          </button>
        </form>

        {/* Alert history */}
        <div>
          <h2 className="font-display font-semibold text-slate-800 text-lg mb-4">Alert History</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(function (alert) {
                // Get the creator name safely
                let creatorName = 'Unknown'
                if (alert.createdBy && alert.createdBy.name) {
                  creatorName = alert.createdBy.name
                }

                // Build the card style
                let cardClass = 'card'
                if (alert.isActive) {
                  cardClass = cardClass + ' border-l-4 border-l-red-400'
                } else {
                  cardClass = cardClass + ' opacity-60'
                }

                // Build the toggle button style
                let toggleStyle = 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                let toggleLabel = '⏸️ Deactivate'
                if (!alert.isActive) {
                  toggleStyle = 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  toggleLabel = '🔴 Reactivate'
                }

                return (
                  <div key={alert.id} className={cardClass}>
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{TYPE_ICONS[alert.alertType]}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-display font-semibold text-slate-800">{alert.title}</h3>
                          <span className={'badge text-[10px] ' + TYPE_COLORS[alert.alertType]}>{alert.alertType}</span>
                          <span className={'badge text-[10px] ' + SEV_COLORS[alert.severity]}>{alert.severity}</span>
                          {alert.isActive ? (
                            <span className="badge text-[10px] bg-red-50 text-red-600 border-red-200">🔴 ACTIVE</span>
                          ) : (
                            <span className="badge text-[10px] bg-slate-100 text-slate-500 border-slate-200">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line line-clamp-3">{alert.message}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                          <span>🎯 {alert.targetArea}</span>
                          {alert.radiusKm && <span>📐 {alert.radiusKm} km radius</span>}
                          <span>👥 {alert.recipientCount} notified</span>
                          <span>👤 {creatorName}</span>
                          <span>{formatDate(alert.createdAt)}</span>
                          {alert.expiresAt && <span>⏰ Expires: {new Date(alert.expiresAt).toLocaleDateString()}</span>}
                        </div>

                        <div className="mt-3 pt-3 border-t border-teal-50">
                          <button onClick={function () { toggleActive(alert.id, !alert.isActive) }}
                            className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + toggleStyle}>
                            {toggleLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
