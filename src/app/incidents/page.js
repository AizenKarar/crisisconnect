// src/app/incidents/page.js
'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import Link from 'next/link'
import { getSeverityColor, getStatusColor, getDisasterIcon, formatDate } from '@/lib/utils'

export default function IncidentsPage() {
  // State for storing all incidents from the API
  const [incidents, setIncidents] = useState([])
  // State for filter selections
  const [filterType, setFilterType] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch incidents whenever any filter changes
  useEffect(function () {
    fetchIncidents()
  }, [filterType, filterSeverity, filterStatus])

  // Function to fetch incidents from the API with filters
  async function fetchIncidents() {
    setLoading(true)

    // Build the URL with filter parameters
    let url = '/api/incidents?'
    if (filterType !== '') {
      url = url + 'type=' + filterType + '&'
    }
    if (filterSeverity !== '') {
      url = url + 'severity=' + filterSeverity + '&'
    }
    if (filterStatus !== '') {
      url = url + 'status=' + filterStatus + '&'
    }

    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setIncidents(data)
      }
    } catch (error) {
      console.error('Error fetching incidents:', error)
    }

    setLoading(false)
  }

  // Function to clear all filters
  function clearFilters() {
    setFilterType('')
    setFilterSeverity('')
    setFilterStatus('')
  }

  // Check if any filter is active
  let hasActiveFilters = (filterType !== '' || filterSeverity !== '' || filterStatus !== '')

  // List of options for each dropdown
  const typeOptions = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'STORM', 'MEDICAL', 'INFRASTRUCTURE', 'OTHER']
  const severityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const statusOptions = ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Incidents</h1>
            <p className="text-slate-500 text-sm mt-1">{incidents.length} incidents found</p>
          </div>
          <Link href="/incidents/report" className="btn-primary">+ Report Incident</Link>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-3">
          <select value={filterType} onChange={function (e) { setFilterType(e.target.value) }} className="select w-auto">
            <option value="">All Types</option>
            {typeOptions.map(function (type) {
              return <option key={type} value={type}>{type}</option>
            })}
          </select>
          <select value={filterSeverity} onChange={function (e) { setFilterSeverity(e.target.value) }} className="select w-auto">
            <option value="">All Severities</option>
            {severityOptions.map(function (sev) {
              return <option key={sev} value={sev}>{sev}</option>
            })}
          </select>
          <select value={filterStatus} onChange={function (e) { setFilterStatus(e.target.value) }} className="select w-auto">
            <option value="">All Statuses</option>
            {statusOptions.map(function (status) {
              return <option key={status} value={status}>{status.replace('_', ' ')}</option>
            })}
          </select>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-teal-600 hover:text-teal-500 px-3 font-medium">Clear filters</button>
          )}
        </div>

        {/* Incident list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map(function (inc) {
              let incidentAddress = inc.address || 'Unknown'
              let reporterName = ''
              if (inc.reporter) {
                if (inc.isAnonymous) {
                  reporterName = 'Anonymous'
                } else {
                  reporterName = inc.reporter.name
                }
              }
              return (
                <Link key={inc.id} href={'/incidents/' + inc.id} className="flex items-center gap-4 p-5 card-hover">
                  <span className="text-3xl">{getDisasterIcon(inc.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">{inc.title}</p>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-1">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{incidentAddress}</span><span>·</span><span>{formatDate(inc.createdAt)}</span>
                      {reporterName !== '' && <><span>·</span><span>by {reporterName}</span></>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end flex-shrink-0">
                    <span className={'badge ' + getSeverityColor(inc.severity)}>{inc.severity}</span>
                    <span className={'badge ' + getStatusColor(inc.status)}>{inc.status.replace('_', ' ')}</span>
                  </div>
                </Link>
              )
            })}
            {incidents.length === 0 && <p className="text-center text-slate-400 py-12">No incidents found.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
