
'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import dynamic from 'next/dynamic'

const MapView = dynamic(function () { return import('@/components/MapView') }, { ssr: false })

export default function MapPage() {
  const [incidents, setIncidents] = useState([])
  const [shelters, setShelters] = useState([])
  const [selected, setSelected] = useState(null)

  //Fetchincidentsandshelters
  useEffect(function () {
    fetchMapData()
  }, [])

  async function fetchMapData() {
    try {
      const incidentResponse = await fetch('/api/incidents')
      if (incidentResponse.ok) {
        const incidentData = await incidentResponse.json()
        setIncidents(incidentData)
      }

      const shelterResponse = await fetch('/api/shelters')
      if (shelterResponse.ok) {
        const shelterData = await shelterResponse.json()
        setShelters(shelterData)
      }
    } catch (error) {
      console.error('Error fetching map data:', error)
    }
  }

  function handleMarkerClick(incident) {
    setSelected(incident)
  }

  function closeDetail() {
    setSelected(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Live Map</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time geospatial view of all incidents and shelters.</p>
        </div>
        <MapView incidents={incidents} shelters={shelters} onMarkerClick={handleMarkerClick} />
        {selected && (
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-slate-800">{selected.title}</h3>
              <button onClick={closeDetail} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-sm text-slate-500 mt-2">{selected.description}</p>
            <div className="flex gap-3 mt-3">
              <span className="badge bg-teal-50 text-teal-700 border-teal-200">{selected.type}</span>
              <span className="badge bg-teal-50 text-teal-700 border-teal-200">{selected.severity}</span>
              <a href={'/incidents/' + selected.id} className="text-xs text-teal-600 hover:text-teal-500 ml-auto font-medium">View details →</a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
