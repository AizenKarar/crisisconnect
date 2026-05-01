// src/app/shelters/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

export default function SheltersPage() {
  // Get the current logged-in user session
  const { data: session } = useSession()

  // State variables
  const [shelters, setShelters] = useState([])
  const [selectedShelterId, setSelectedShelterId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is staff or admin
  let isStaff = false
  if (session && session.user) {
    if (session.user.role === 'STAFF' || session.user.role === 'ADMIN') {
      isStaff = true
    }
  }

  // Fetch shelters when page loads
  useEffect(function () {
    fetchShelters()
  }, [])

  // Fetch all shelters from the API
  async function fetchShelters() {
    try {
      const response = await fetch('/api/shelters')
      if (response.ok) {
        const data = await response.json()
        setShelters(data)
      }
    } catch (error) {
      console.error('Error fetching shelters:', error)
    }
    setLoading(false)
  }

  // Update a supply quantity for a shelter
  async function updateSupply(shelterId, supplyId, quantity) {
    try {
      const response = await fetch('/api/shelters/' + shelterId + '/supplies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplyId: supplyId, quantity: parseInt(quantity) }),
      })
      if (response.ok) {
        toast.success('Supply updated')
        fetchShelters()
      }
    } catch (error) {
      console.error('Error updating supply:', error)
    }
  }

  // Toggle showing/hiding supply inventory for a shelter
  function toggleShelterDetails(shelterId) {
    if (selectedShelterId === shelterId) {
      setSelectedShelterId(null)
    } else {
      setSelectedShelterId(shelterId)
    }
  }

  // Show loading spinner
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Shelters & Resources</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor shelter capacity and supply levels.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shelters.map(function (shelter) {
            // Calculate occupancy percentage
            let percentage = Math.round((shelter.occupied / shelter.maxCapacity) * 100)

            // Set colors based on occupancy
            let barColor = 'bg-teal-500'
            let statusColor = 'text-teal-600'
            if (percentage >= 90) {
              barColor = 'bg-red-500'
              statusColor = 'text-red-600'
            } else if (percentage >= 70) {
              barColor = 'bg-amber-500'
              statusColor = 'text-amber-600'
            }

            // Check if this shelter's details are currently shown
            let isSelected = (selectedShelterId === shelter.id)

            // Get status badge color
            let statusBadge = 'bg-emerald-50 text-emerald-600 border-emerald-200'
            if (shelter.status === 'FULL') {
              statusBadge = 'bg-red-50 text-red-500 border-red-200'
            } else if (shelter.status === 'CLOSED') {
              statusBadge = 'bg-slate-100 text-slate-500 border-slate-200'
            }

            // Count supplies safely
            let supplyCount = 0
            if (shelter.supplies) {
              supplyCount = shelter.supplies.length
            }

            return (
              <div key={shelter.id} className="card">
                {/* Shelter header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display font-semibold text-slate-800 text-lg">{shelter.name}</h2>
                    <p className="text-sm text-slate-500">{shelter.address}</p>
                    {shelter.phone && <p className="text-xs text-slate-400 mt-1">{shelter.phone}</p>}
                  </div>
                  <span className={'badge ' + statusBadge}>{shelter.status}</span>
                </div>

                {/* Occupancy bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">Occupancy</span>
                    <span className={'text-sm font-mono font-bold ' + statusColor}>
                      {shelter.occupied} / {shelter.maxCapacity} <span className="text-slate-400">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="progress-bar h-3">
                    <div className={'h-full rounded-full transition-all duration-700 ' + barColor} style={{ width: percentage + '%' }} />
                  </div>
                </div>

                {/* Supply inventory toggle */}
                <div>
                  <button onClick={function () { toggleShelterDetails(shelter.id) }} className="text-sm text-teal-600 hover:text-teal-500 font-medium mb-3">
                    {isSelected ? 'Hide' : 'Show'} Supply Inventory ({supplyCount})
                  </button>

                  {/* Supply list */}
                  {isSelected && shelter.supplies && (
                    <div className="space-y-3 animate-slide-down">
                      {shelter.supplies.map(function (supply) {
                        let isCritical = (supply.quantity <= supply.minLevel)
                        let bgStyle = 'bg-white/40 border border-white/50'
                        if (isCritical) {
                          bgStyle = 'bg-red-50 border border-red-200'
                        }
                        let quantityColor = 'text-slate-700'
                        if (isCritical) {
                          quantityColor = 'text-red-500'
                        }
                        return (
                          <div key={supply.id} className={'p-3 rounded-xl ' + bgStyle}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-700 font-medium">{supply.name}</p>
                                <p className="text-xs text-slate-400">{supply.category}</p>
                              </div>
                              <div className="text-right">
                                <p className={'text-sm font-mono font-bold ' + quantityColor}>{supply.quantity} {supply.unit}</p>
                                {isCritical && <p className="text-[10px] text-red-500">⚠️ Below min ({supply.minLevel})</p>}
                              </div>
                            </div>
                            {isStaff && (
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="number"
                                  defaultValue={supply.quantity}
                                  className="input py-1.5 text-sm w-24"
                                  min={0}
                                  onBlur={function (e) {
                                    let newValue = parseInt(e.target.value)
                                    if (newValue !== supply.quantity) {
                                      updateSupply(shelter.id, supply.id, e.target.value)
                                    }
                                  }}
                                />
                                <span className="text-xs text-slate-400">Update</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
