'use client'
import { useEffect, useRef, useState } from 'react'

export default function MapView({ incidents, shelters, onMarkerClick }) {
  if (!incidents) {
    incidents = []
  }
  if (!shelters) {
    shelters = []
  }

  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  const [mapLayer, setMapLayer] = useState('streets')
  const [filterType, setFilterType] = useState('ALL')
  const [filterSeverity, setFilterSeverity] = useState('ALL')

  const disasterTypes = ['ALL', 'FIRE', 'FLOOD', 'EARTHQUAKE', 'STORM', 'MEDICAL', 'INFRASTRUCTURE']
  const severities = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

  useEffect(function () {
    // Track if the component is still alive
    let isMounted = true

    if (mapInstance.current) {
      return
    }

    async function loadMap() {
      var leafletModule = await import('leaflet')
      var L = leafletModule.default
      await import('leaflet/dist/leaflet.css')

      // PROPER FIX: Stop if unmounted during download, or if map is already bound to this div
      if (!isMounted || (mapRef.current && mapRef.current._leaflet_id)) {
        return
      }

      var map = L.map(mapRef.current).setView([23.7806, 90.4193], 12)

      var layers = {
        streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '© OpenTopoMap' }),
      }

      layers.streets.addTo(map)

      map.locate({ setView: true, maxZoom: 14 })

      map.on('locationfound', function (e) {
        L.circleMarker(e.latlng, {
          radius: 8,
          fillColor: "#3b82f6",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map).bindPopup("You are here!");
      });

      map.on('locationerror', function (e) {
        console.log("Could not find location or user denied access.");
      });

      mapInstance.current = {
        map: map,
        layers: layers,
        currentLayer: 'streets',
        markers: [],
        L: L,
      }

      renderMarkers(L, map, incidents, shelters)
    }

    loadMap()

    return function () {
      isMounted = false // Mark as unmounted
      if (mapInstance.current && mapInstance.current.map) {
        mapInstance.current.map.remove()
        mapInstance.current = null
      }
    }
  }, [])

  useEffect(function () {
    if (!mapInstance.current) {
      return
    }
    var L = mapInstance.current.L
    var map = mapInstance.current.map
    renderMarkers(L, map, incidents, shelters)
  }, [incidents, shelters, filterType, filterSeverity])

  function renderMarkers(L, map, incidentList, shelterList) {
    if (mapInstance.current.markers) {
      for (var i = 0; i < mapInstance.current.markers.length; i++) {
        map.removeLayer(mapInstance.current.markers[i])
      }
    }
    mapInstance.current.markers = []

    var iconColors = {
      FIRE: '#ef4444',
      FLOOD: '#3b82f6',
      EARTHQUAKE: '#a855f7',
      STORM: '#f59e0b',
      MEDICAL: '#22c55e',
      INFRASTRUCTURE: '#6b7280',
      OTHER: '#64748b',
    }

    var iconEmojis = {
      FIRE: '🔥',
      FLOOD: '🌊',
      EARTHQUAKE: '🏚️',
      STORM: '⛈️',
      MEDICAL: '🏥',
      INFRASTRUCTURE: '🏗️',
      OTHER: '⚠️',
    }

    var filteredIncidents = []
    for (var i = 0; i < incidentList.length; i++) {
      var incident = incidentList[i]
      var passesTypeFilter = (filterType === 'ALL' || incident.type === filterType)
      var passesSevFilter = (filterSeverity === 'ALL' || incident.severity === filterSeverity)
      if (passesTypeFilter && passesSevFilter) {
        filteredIncidents.push(incident)
      }
    }

    for (var i = 0; i < filteredIncidents.length; i++) {
      var incident = filteredIncidents[i]
      var color = iconColors[incident.type] || '#64748b'
      var emoji = iconEmojis[incident.type] || '⚠️'
      var incidentAddress = incident.address || ''

      var icon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="width:36px;height:36px;border-radius:12px;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px ' + color + '40;border:2px solid white;cursor:pointer;">' + emoji + '</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      var popupContent = '<div style="min-width:200px;"><strong>' + incident.title + '</strong><br/><span style="color:#64748b;font-size:12px;">' + incident.severity + ' · ' + incident.status + '<br/>' + incidentAddress + '</span></div>'

      var marker = L.marker([incident.latitude, incident.longitude], { icon: icon }).addTo(map)
      marker.bindPopup(popupContent)

      if (onMarkerClick) {
        ; (function (inc) {
          marker.on('click', function () {
            onMarkerClick(inc)
          })
        })(incident)
      }

      mapInstance.current.markers.push(marker)
    }

    for (var i = 0; i < shelterList.length; i++) {
      var shelter = shelterList[i]
      var pct = Math.round((shelter.occupied / shelter.maxCapacity) * 100)

      var shelterColor = '#22c55e'
      if (pct >= 90) {
        shelterColor = '#ef4444'
      } else if (pct >= 70) {
        shelterColor = '#f59e0b'
      }

      var shelterIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="width:36px;height:36px;border-radius:12px;background:white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.1);border:2px solid ' + shelterColor + ';cursor:pointer;">🏠</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      var shelterPopup = '<div><strong>' + shelter.name + '</strong><br/><span style="color:#64748b;font-size:12px;">' + shelter.occupied + '/' + shelter.maxCapacity + ' beds (' + pct + '%)</span></div>'

      var shelterMarker = L.marker([shelter.latitude, shelter.longitude], { icon: shelterIcon }).addTo(map)
      shelterMarker.bindPopup(shelterPopup)
      mapInstance.current.markers.push(shelterMarker)
    }
  }

  function switchLayer(layerName) {
    if (!mapInstance.current) {
      return
    }
    var map = mapInstance.current.map
    var layers = mapInstance.current.layers
    var currentLayer = mapInstance.current.currentLayer

    map.removeLayer(layers[currentLayer])
    layers[layerName].addTo(map)
    mapInstance.current.currentLayer = layerName
    setMapLayer(layerName)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Type</span>
          <div className="flex gap-1">
            {disasterTypes.map(function (type) {
              var isActive = filterType === type
              var buttonStyle = 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'
              if (isActive) {
                buttonStyle = 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm'
              }
              var label = type
              if (type === 'ALL') {
                label = 'All'
              } else {
                label = type.charAt(0) + type.slice(1).toLowerCase()
              }
              return (
                <button key={type} onClick={function () { setFilterType(type) }}
                  className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + buttonStyle}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="h-5 w-px bg-teal-200/60" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Severity</span>
          <div className="flex gap-1">
            {severities.map(function (sev) {
              var isActive = filterSeverity === sev
              var buttonStyle = 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'
              if (isActive) {
                buttonStyle = 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm'
              }
              var label = sev
              if (sev === 'ALL') {
                label = 'All'
              } else {
                label = sev.charAt(0) + sev.slice(1).toLowerCase()
              }
              return (
                <button key={sev} onClick={function () { setFilterSeverity(sev) }}
                  className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + buttonStyle}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="h-5 w-px bg-teal-200/60" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Layer</span>
          <div className="flex gap-1">
            {['streets', 'satellite', 'terrain'].map(function (layerName) {
              var isActive = mapLayer === layerName
              var buttonStyle = 'bg-white/40 text-slate-500 border border-white/50 hover:text-slate-700'
              if (isActive) {
                buttonStyle = 'bg-white/80 text-slate-700 border border-white/80 shadow-sm'
              }
              return (
                <button key={layerName} onClick={function () { switchLayer(layerName) }}
                  className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ' + buttonStyle}>
                  {layerName}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div ref={mapRef} className="w-full h-[550px] rounded-2xl border border-white/60 overflow-hidden shadow-sm" />
    </div>
  )
}