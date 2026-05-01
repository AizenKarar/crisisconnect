// src/app/analytics/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
  // Get the logged-in user session
  var sessionData = useSession()
  var session = sessionData.data

  // State variables
  const [reportData, setReportData] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Check if user is admin
  var isAdmin = false
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
          <p className="text-slate-500 mt-2">Analytics is restricted to Admins only.</p>
        </div>
      </DashboardLayout>
    )
  }

  // Fetch data when the page loads
  useEffect(function () {
    fetchAllData()
  }, [])

  // Fetch report data and audit logs from the API
  async function fetchAllData() {
    try {
      // Fetch report data
      const reportResponse = await fetch('/api/reports/pdf')
      if (reportResponse.ok) {
        const data = await reportResponse.json()
        setReportData(data)
      }

      // Fetch audit logs
      const auditResponse = await fetch('/api/audit-logs')
      if (auditResponse.ok) {
        const data = await auditResponse.json()
        setAuditLogs(data)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    }

    setLoading(false)
  }

  // Generate and download a PDF report
  async function generatePDF() {
    setGenerating(true)

    try {
      // Import the PDF library (loaded on demand)
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.jsPDF
      const autoTableModule = await import('jspdf-autotable')
      const autoTable = autoTableModule.default

      // Create a new PDF document
      const doc = new jsPDF()
      const pdfStats = reportData.stats

      // Draw the header bar (teal background)
      doc.setFillColor(13, 148, 136)
      doc.rect(0, 0, 210, 40, 'F')

      // Header text
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.text('CrisisConnect 470', 14, 18)
      doc.setFontSize(11)
      doc.text('Situation Report — ' + new Date().toLocaleDateString(), 14, 28)

      // Executive summary section
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.text('Executive Summary', 14, 52)
      doc.setFontSize(10)
      doc.text('Total Incidents: ' + pdfStats.totalIncidents, 14, 62)
      doc.text('Critical: ' + pdfStats.critical, 14, 69)
      doc.text('In Progress: ' + pdfStats.inProgress, 14, 76)
      doc.text('Resolved: ' + pdfStats.resolved, 14, 83)
      doc.text('Shelters: ' + pdfStats.totalShelters, 110, 62)
      doc.text('Capacity: ' + pdfStats.totalOccupied + '/' + pdfStats.totalCapacity, 110, 69)

      // Incident table
      doc.setFontSize(14)
      doc.text('Incident Registry', 14, 100)

      // Build the incident table rows
      let incidentRows = []
      for (let i = 0; i < reportData.incidents.length; i++) {
        let incident = reportData.incidents[i]
        let shortTitle = incident.title.substring(0, 35)
        let dateString = new Date(incident.createdAt).toLocaleDateString()
        incidentRows.push([shortTitle, incident.type, incident.severity, incident.status, dateString])
      }

      autoTable(doc, {
        startY: 106,
        head: [['Title', 'Type', 'Severity', 'Status', 'Date']],
        body: incidentRows,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136] },
        styles: { fontSize: 8 },
      })

      // Shelter table
      let shelterStartY = doc.lastAutoTable.finalY + 15
      doc.setFontSize(14)
      doc.text('Shelter Status', 14, shelterStartY)

      // Build the shelter table rows
      let shelterRows = []
      for (let i = 0; i < reportData.shelters.length; i++) {
        let shelter = reportData.shelters[i]
        let occupancyPercent = Math.round((shelter.occupied / shelter.maxCapacity) * 100)
        let occupancyText = shelter.occupied + ' (' + occupancyPercent + '%)'
        shelterRows.push([shelter.name, shelter.maxCapacity.toString(), occupancyText, shelter.status])
      }

      autoTable(doc, {
        startY: shelterStartY + 6,
        head: [['Shelter', 'Capacity', 'Occupied', 'Status']],
        body: shelterRows,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136] },
        styles: { fontSize: 8 },
      })

      // Save the PDF file
      let todayString = new Date().toISOString().split('T')[0]
      doc.save('CrisisConnect_SitRep_' + todayString + '.pdf')
      toast.success('PDF downloaded!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    }

    setGenerating(false)
  }

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  // Get stats safely (without optional chaining)
  let stats = {}
  if (reportData && reportData.stats) {
    stats = reportData.stats
  }

  let totalIncidents = stats.totalIncidents || 0
  let criticalCount = stats.critical || 0
  let pendingCount = stats.pending || 0
  let inProgressCount = stats.inProgress || 0
  let resolvedCount = stats.resolved || 0
  let totalUsers = stats.totalUsers || 0
  let totalCapacity = stats.totalCapacity || 0
  let totalOccupied = stats.totalOccupied || 0

  // Calculate shelter occupancy percentage
  let occupancyPercent = 0
  if (totalCapacity > 0) {
    occupancyPercent = Math.round((totalOccupied / totalCapacity) * 100)
  }

  // Stats cards for the top section
  let statsCards = [
    { label: 'Total Incidents', value: totalIncidents, color: 'text-slate-800' },
    { label: 'Critical', value: criticalCount, color: 'text-red-500' },
    { label: 'Shelter Occupancy', value: occupancyPercent + '%', color: 'text-amber-600' },
    { label: 'Users', value: totalUsers, color: 'text-teal-600' },
  ]

  // Status breakdown bars
  let statusBars = [
    { label: 'Pending', value: pendingCount, color: 'bg-slate-400' },
    { label: 'In Progress', value: inProgressCount, color: 'bg-purple-500' },
    { label: 'Resolved', value: resolvedCount, color: 'bg-emerald-500' },
  ]

  // Count incidents by type
  let typeCounts = {}
  let incidents = []
  if (reportData && reportData.incidents) {
    incidents = reportData.incidents
  }
  for (let i = 0; i < incidents.length; i++) {
    let incidentType = incidents[i].type
    if (typeCounts[incidentType]) {
      typeCounts[incidentType] = typeCounts[incidentType] + 1
    } else {
      typeCounts[incidentType] = 1
    }
  }

  // Convert typeCounts object to an array for rendering
  let typeList = []
  let typeNames = Object.keys(typeCounts)
  for (let i = 0; i < typeNames.length; i++) {
    typeList.push({ type: typeNames[i], count: typeCounts[typeNames[i]] })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Analytics & Reports</h1>
            <p className="text-slate-500 text-sm mt-1">Executive overview and audit trail</p>
          </div>
          <button onClick={generatePDF} disabled={generating} className="btn-primary flex items-center gap-2">
            {generating ? 'Generating...' : '📄 Download PDF Report'}
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map(function (item) {
            return (
              <div key={item.label} className="stat-card">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{item.label}</span>
                <span className={'font-display font-bold text-3xl ' + item.color}>{item.value}</span>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Status */}
          <div className="card">
            <h2 className="font-display font-semibold text-slate-800 mb-4">By Status</h2>
            <div className="space-y-3">
              {statusBars.map(function (item) {
                let barWidth = 0
                if (totalIncidents > 0) {
                  barWidth = (item.value / totalIncidents) * 100
                }
                return (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className="text-sm font-mono text-slate-700">{item.value}</span>
                    </div>
                    <div className="progress-bar">
                      <div className={'h-full rounded-full ' + item.color} style={{ width: barWidth + '%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Type */}
          <div className="card">
            <h2 className="font-display font-semibold text-slate-800 mb-4">By Type</h2>
            <div className="space-y-3">
              {typeList.map(function (item) {
                return (
                  <div key={item.type} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                    <span className="text-sm text-slate-600">{item.type}</span>
                    <span className="text-sm font-mono text-slate-700 font-bold">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Audit Trail */}
        <div className="card">
          <h2 className="font-display font-semibold text-slate-800 mb-4">Audit Trail</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {auditLogs.map(function (log) {
              // Get the user name safely
              let logUserName = 'System'
              let logUserRole = 'N/A'
              if (log.user && log.user.name) {
                logUserName = log.user.name
              }
              if (log.user && log.user.role) {
                logUserRole = log.user.role
              }

              // Get incident title if it exists
              let incidentText = ''
              if (log.incident && log.incident.title) {
                incidentText = ' — ' + log.incident.title
              }

              return (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">
                      <span className="font-mono text-xs text-teal-600 mr-2">{log.action}</span>
                      {log.details}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {logUserName} ({logUserRole}){incidentText} · {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
