
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

var URG_COLORS = {
  CRITICAL: 'bg-red-50 text-red-600 border-red-200',
  HIGH: 'bg-orange-50 text-orange-600 border-orange-200',
  MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200',
  LOW: 'bg-green-50 text-green-600 border-green-200',
}


var STAT_COLORS = {
  PENDING: 'bg-slate-100 text-slate-600 border-slate-200',
  APPROVED: 'bg-blue-50 text-blue-600 border-blue-200',
  IN_TRANSIT: 'bg-purple-50 text-purple-600 border-purple-200',
  DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-500 border-red-200',
}


var CAT_ICONS = {
  FOOD: '🍚',
  WATER: '💧',
  MEDICINE: '💊',
  EQUIPMENT: '🔧',
  CLOTHING: '👕',
  OTHER: '📦',
}

export default function SupplyRequestsPage() {

  const { data: session } = useSession()


  const [requests, setRequests] = useState([])
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('ALL')


  const [formItemName, setFormItemName] = useState('')
  const [formCategory, setFormCategory] = useState('FOOD')
  const [formQuantity, setFormQuantity] = useState('')
  const [formUnit, setFormUnit] = useState('packs')
  const [formUrgency, setFormUrgency] = useState('MEDIUM')
  const [formReason, setFormReason] = useState('')
  const [formFromShelterId, setFormFromShelterId] = useState('')
  const [formToShelterId, setFormToShelterId] = useState('')


  let isStaff = false
  let isAdmin = false
  if (session && session.user) {
    let userRole = session.user.role
    if (userRole === 'STAFF' || userRole === 'ADMIN') {
      isStaff = true
    }
    if (userRole === 'ADMIN') {
      isAdmin = true
    }
  }


  useEffect(function () {
    fetchAll()
  }, [])


  async function fetchAll() {
    try {

      const reqResponse = await fetch('/api/supply-requests')
      if (reqResponse.ok) {
        const reqData = await reqResponse.json()
        setRequests(reqData)
      }


      const shelterResponse = await fetch('/api/shelters')
      if (shelterResponse.ok) {
        const shelterData = await shelterResponse.json()
        setShelters(shelterData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }

    setLoading(false)
  }


  function clearForm() {
    setFormItemName('')
    setFormCategory('FOOD')
    setFormQuantity('')
    setFormUnit('packs')
    setFormUrgency('MEDIUM')
    setFormReason('')
    setFormFromShelterId('')
    setFormToShelterId('')
  }


  async function handleSubmit(event) {
    event.preventDefault()

    if (formFromShelterId === formToShelterId) {
      toast.error('Source and destination shelters must be different')
      return
    }

    let formData = {
      itemName: formItemName,
      category: formCategory,
      quantity: formQuantity,
      unit: formUnit,
      urgency: formUrgency,
      reason: formReason,
      fromShelterId: formFromShelterId,
      toShelterId: formToShelterId,
    }

    try {
      const response = await fetch('/api/supply-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Supply request submitted!')
        setShowForm(false)
        clearForm()
        fetchAll()
      } else {
        const errorData = await response.json()
        let errorMessage = 'Failed'
        if (errorData && errorData.error) {
          errorMessage = errorData.error
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      toast.error('Failed to submit')
    }
  }


  async function updateStatus(requestId, newStatus, notes) {
    try {
      let bodyData = { id: requestId, status: newStatus }
      if (notes) {
        bodyData.notes = notes
      }

      const response = await fetch('/api/supply-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })

      if (response.ok) {
        toast.success('Status → ' + newStatus)
        fetchAll()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }


  function handleReject(requestId) {
    let reason = prompt('Reason for rejection:')
    if (reason) {
      updateStatus(requestId, 'REJECTED', reason)
    }
  }


  let filteredRequests = []
  for (let i = 0; i < requests.length; i++) {
    if (filter === 'ALL') {
      filteredRequests.push(requests[i])
    } else if (requests[i].status === filter) {
      filteredRequests.push(requests[i])
    }
  }

  let pendingCount = 0
  let approvedCount = 0
  let transitCount = 0
  let deliveredCount = 0
  let rejectedCount = 0

  for (let i = 0; i < requests.length; i++) {
    if (requests[i].status === 'PENDING') {
      pendingCount = pendingCount + 1
    } else if (requests[i].status === 'APPROVED') {
      approvedCount = approvedCount + 1
    } else if (requests[i].status === 'IN_TRANSIT') {
      transitCount = transitCount + 1
    } else if (requests[i].status === 'DELIVERED') {
      deliveredCount = deliveredCount + 1
    } else if (requests[i].status === 'REJECTED') {
      rejectedCount = rejectedCount + 1
    }
  }


  let statsCards = [
    { label: 'Pending', value: pendingCount, bg: 'bg-slate-400', icon: '⏳' },
    { label: 'Approved', value: approvedCount, bg: 'bg-blue-500', icon: '✅' },
    { label: 'In Transit', value: transitCount, bg: 'bg-purple-500', icon: '🚛' },
    { label: 'Delivered', value: deliveredCount, bg: 'bg-emerald-500', icon: '📬' },
    { label: 'Rejected', value: rejectedCount, bg: 'bg-red-500', icon: '❌' },
  ]


  let pipelineSteps = [
    { label: 'Pending', value: pendingCount, color: 'bg-slate-100 text-slate-600' },
    { label: 'Approved', value: approvedCount, color: 'bg-blue-100 text-blue-700' },
    { label: 'In Transit', value: transitCount, color: 'bg-purple-100 text-purple-700' },
    { label: 'Delivered', value: deliveredCount, color: 'bg-emerald-100 text-emerald-700' },
  ]


  let filterOptions = ['ALL', 'PENDING', 'APPROVED', 'IN_TRANSIT', 'DELIVERED', 'REJECTED']
  let categoryOptions = ['FOOD', 'WATER', 'MEDICINE', 'EQUIPMENT', 'CLOTHING', 'OTHER']
  let unitOptions = [
    { value: 'packs', label: 'Packs' },
    { value: 'liters', label: 'Liters' },
    { value: 'kg', label: 'Kg' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'units', label: 'Units' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'packets', label: 'Packets' },
  ]
  let urgencyOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  function getUrgencyButtonColor(urgency) {
    if (urgency === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-300'
    if (urgency === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-300'
    if (urgency === 'MEDIUM') return 'bg-amber-100 text-amber-700 border-amber-300'
    return 'bg-green-100 text-green-700 border-green-300'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">📦 Supply Requests</h1>
            <p className="text-slate-500 text-sm mt-1">Request and track supply transfers between shelters.</p>
          </div>
          {isStaff && (
            <button onClick={function () { setShowForm(!showForm) }} className="btn-primary">
              {showForm ? '✕ Close' : '+ Request Supplies'}
            </button>
          )}
        </div>


        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statsCards.map(function (stat) {
            return (
              <div key={stat.label} className="card flex items-center gap-3">
                <div className={'w-9 h-9 rounded-xl ' + stat.bg + ' flex items-center justify-center text-white text-base shadow-sm'}>{stat.icon}</div>
                <div>
                  <p className="font-display font-bold text-xl text-slate-800">{stat.value}</p>
                  <p className="text-[10px] text-slate-500">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>


        <div className="card">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">Supply Pipeline</h3>
          <div className="flex items-center gap-2">
            {pipelineSteps.map(function (item, index) {
              return (
                <div key={item.label} className="flex items-center gap-2 flex-1">
                  <div className={'flex-1 text-center py-3 rounded-xl border ' + item.color}>
                    <p className="font-display font-bold text-xl">{item.value}</p>
                    <p className="text-xs">{item.label}</p>
                  </div>
                  {index < 3 && <span className="text-slate-300 text-lg">→</span>}
                </div>
              )
            })}
          </div>
        </div>


        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800 text-lg">Request Supply Transfer</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">From Shelter (Source) *</label>
                <select value={formFromShelterId} onChange={function (e) { setFormFromShelterId(e.target.value) }} className="select" required>
                  <option value="">Select source shelter...</option>
                  {shelters.map(function (shelter) {
                    return <option key={shelter.id} value={shelter.id}>{shelter.name} — {shelter.address}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">To Shelter (Destination) *</label>
                <select value={formToShelterId} onChange={function (e) { setFormToShelterId(e.target.value) }} className="select" required>
                  <option value="">Select destination shelter...</option>
                  {shelters.map(function (shelter) {
                    return <option key={shelter.id} value={shelter.id}>{shelter.name} — {shelter.address}</option>
                  })}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Item *</label>
                <input value={formItemName} onChange={function (e) { setFormItemName(e.target.value) }} className="input" placeholder="e.g., Drinking Water" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Category *</label>
                <select value={formCategory} onChange={function (e) { setFormCategory(e.target.value) }} className="select">
                  {categoryOptions.map(function (cat) {
                    return <option key={cat} value={cat}>{cat}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Quantity *</label>
                <input type="number" value={formQuantity} onChange={function (e) { setFormQuantity(e.target.value) }} className="input" min={1} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Unit</label>
                <select value={formUnit} onChange={function (e) { setFormUnit(e.target.value) }} className="select">
                  {unitOptions.map(function (opt) {
                    return <option key={opt.value} value={opt.value}>{opt.label}</option>
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Urgency</label>
              <div className="flex gap-2">
                {urgencyOptions.map(function (urg) {
                  let buttonStyle = 'bg-white/50 text-slate-500 border-white/60'
                  if (formUrgency === urg) {
                    buttonStyle = getUrgencyButtonColor(urg)
                  }
                  return (
                    <button key={urg} type="button" onClick={function () { setFormUrgency(urg) }}
                      className={'px-4 py-2 rounded-xl text-xs font-medium transition-all border flex-1 ' + buttonStyle}>
                      {urg}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Reason / Justification *</label>
              <textarea value={formReason} onChange={function (e) { setFormReason(e.target.value) }} className="input min-h-[80px] resize-none" placeholder="Why is this supply needed? What's the current situation?" required />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={function () { setShowForm(false) }} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">📦 Submit Request</button>
            </div>
          </form>
        )}


        <div className="flex gap-2 flex-wrap">
          {filterOptions.map(function (filterOption) {
            let isActive = filter === filterOption
            let buttonStyle = 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'
            if (isActive) {
              buttonStyle = 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm'
            }
            let displayLabel = filterOption
            if (filterOption === 'ALL') {
              displayLabel = 'All'
            } else {
              displayLabel = filterOption.replace('_', ' ')
            }
            return (
              <button key={filterOption} onClick={function () { setFilter(filterOption) }}
                className={'px-4 py-2 rounded-xl text-sm font-medium transition-all ' + buttonStyle}>
                {displayLabel}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(function (req) {

              let categoryIcon = CAT_ICONS[req.category] || '📦'

              let cardClass = 'card'
              if (req.urgency === 'CRITICAL') {
                cardClass = cardClass + ' border-l-4 border-l-red-500'
              } else if (req.urgency === 'HIGH') {
                cardClass = cardClass + ' border-l-4 border-l-orange-500'
              }


              let fromShelterName = 'Unknown'
              let fromShelterAddress = ''
              if (req.fromShelter && req.fromShelter.name) {
                fromShelterName = req.fromShelter.name
                fromShelterAddress = req.fromShelter.address || ''
              }

              let toShelterName = 'Unknown'
              let toShelterAddress = ''
              if (req.toShelter && req.toShelter.name) {
                toShelterName = req.toShelter.name
                toShelterAddress = req.toShelter.address || ''
              }

              let requesterName = 'Unknown'
              if (req.requester && req.requester.name) {
                requesterName = req.requester.name
              }


              let approverName = ''
              if (req.approvedBy && req.approvedBy.name) {
                approverName = req.approvedBy.name
              }


              let showAdminActions = isAdmin && req.status !== 'DELIVERED' && req.status !== 'REJECTED'

              return (
                <div key={req.id} className={cardClass}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl flex-shrink-0">{categoryIcon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold text-slate-800">{req.quantity} {req.unit} of {req.itemName}</h3>
                        <span className={'badge text-[10px] ' + URG_COLORS[req.urgency]}>{req.urgency}</span>
                        <span className={'badge text-[10px] ' + STAT_COLORS[req.status]}>{req.status.replace('_', ' ')}</span>
                      </div>


                      <div className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-white/40 border border-white/50">
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">From</p>
                          <p className="text-xs font-medium text-slate-700">{fromShelterName}</p>
                          <p className="text-[10px] text-slate-400">{fromShelterAddress}</p>
                        </div>
                        <span className="text-teal-500 font-bold text-lg">→</span>
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">To</p>
                          <p className="text-xs font-medium text-slate-700">{toShelterName}</p>
                          <p className="text-[10px] text-slate-400">{toShelterAddress}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{req.reason}</p>
                      {req.notes && <p className="text-xs text-slate-400 italic mt-1">📝 {req.notes}</p>}

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                        <span>👤 Requested by {requesterName}</span>
                        {approverName !== '' && (
                          <span>{req.status === 'REJECTED' ? '❌ Rejected' : '✅ Approved'} by {approverName}</span>
                        )}
                        <span>{formatDate(req.createdAt)}</span>
                      </div>


                      {showAdminActions && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-teal-50">
                          {req.status === 'PENDING' && (
                            <>
                              <button onClick={function () { updateStatus(req.id, 'APPROVED') }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all">✅ Approve</button>
                              <button onClick={function () { handleReject(req.id) }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all">❌ Reject</button>
                            </>
                          )}
                          {req.status === 'APPROVED' && (
                            <button onClick={function () { updateStatus(req.id, 'IN_TRANSIT') }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100 transition-all">🚛 Mark In Transit</button>
                          )}
                          {req.status === 'IN_TRANSIT' && (
                            <button onClick={function () { updateStatus(req.id, 'DELIVERED') }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all">📬 Mark Delivered</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {filteredRequests.length === 0 && !loading && <p className="text-center text-slate-400 py-12">No supply requests found.</p>}
      </div>
    </DashboardLayout>
  )
}
