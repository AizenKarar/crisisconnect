// src/app/donations/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

// Donation type options and their icons
const DONATION_TYPES = ['MONEY', 'FOOD', 'CLOTHING', 'MEDICINE', 'EQUIPMENT', 'OTHER']
const TYPE_ICONS = { MONEY: '💰', FOOD: '🍚', CLOTHING: '👕', MEDICINE: '💊', EQUIPMENT: '🔧', OTHER: '📦' }

export default function DonationsPage() {
  // Get the current logged-in user session
  const { data: session } = useSession()

  // State for donations data and stats from API
  const [donations, setDonations] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')

  // Form fields
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [donationType, setDonationType] = useState('MONEY')
  const [amount, setAmount] = useState('')
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('items')
  const [message, setMessage] = useState('')

  // Check if user is staff/admin
  let isStaff = false
  if (session && session.user) {
    if (session.user.role === 'STAFF' || session.user.role === 'ADMIN') {
      isStaff = true
    }
  }

  // Fetch donations when page loads
  useEffect(function () {
    fetchDonations()
  }, [])

  // Autofill donor name from session
  useEffect(function () {
    if (session && session.user && session.user.name && donorName === '') {
      setDonorName(session.user.name)
      if (session.user.email) {
        setDonorEmail(session.user.email)
      }
    }
  }, [session])

  // Fetch all donations from the API
  async function fetchDonations() {
    try {
      const response = await fetch('/api/donations')
      if (response.ok) {
        const data = await response.json()
        setDonations(data.donations || [])
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
    }
    setLoading(false)
  }

  // Submit a new donation
  async function handleSubmit(event) {
    event.preventDefault()

    let donationData = {
      donorName: donorName,
      donorEmail: donorEmail,
      donorPhone: donorPhone,
      type: donationType,
      amount: amount,
      itemName: itemName,
      quantity: quantity,
      unit: unit,
      message: message,
    }

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
      })

      if (response.ok) {
        toast.success('Donation recorded! Thank you for your generosity!')
        setShowForm(false)
        // Clear form fields
        setDonorName(session && session.user ? session.user.name : '')
        setDonorEmail(session && session.user ? session.user.email || '' : '')
        setDonorPhone('')
        setDonationType('MONEY')
        setAmount('')
        setItemName('')
        setQuantity('')
        setUnit('items')
        setMessage('')
        fetchDonations()
      } else {
        const data = await response.json()
        let errorMessage = 'Failed to submit'
        if (data && data.error) {
          errorMessage = data.error
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting donation:', error)
      toast.error('Failed to submit')
    }
  }

  // Update a donation's status
  async function updateStatus(donationId, newStatus) {
    try {
      const response = await fetch('/api/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: donationId, status: newStatus }),
      })
      if (response.ok) {
        toast.success('Status updated to ' + newStatus)
        fetchDonations()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Filter donations by type
  let filteredDonations = []
  for (let i = 0; i < donations.length; i++) {
    if (filter === '' || donations[i].type === filter) {
      filteredDonations.push(donations[i])
    }
  }

  // Get stats safely
  let totalMoney = stats.totalMoney || 0
  let totalItems = stats.totalItems || 0
  let totalDonors = stats.totalDonors || 0
  let distributedCount = stats.distributed || 0
  let pledgedCount = stats.pledged || 0
  let receivedCount = stats.received || 0

  // Pipeline data
  let pipelineSteps = [
    { label: 'Pledged', value: pledgedCount, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { label: 'Received', value: receivedCount, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { label: 'Distributed', value: distributedCount, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Donation Hub</h1>
            <p className="text-slate-500 text-sm mt-1">Coordinate relief donations — money, food, medicine, and supplies.</p>
          </div>
          <button onClick={function () { setShowForm(!showForm) }} className="btn-primary">
            {showForm ? '✕ Close' : '💝 Make a Donation'}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white text-lg shadow-sm">💰</div>
            <div><p className="font-display font-bold text-2xl text-slate-800">৳{totalMoney.toLocaleString()}</p><p className="text-xs text-slate-500">Total Funds</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white text-lg shadow-sm">📦</div>
            <div><p className="font-display font-bold text-2xl text-slate-800">{totalItems.toLocaleString()}</p><p className="text-xs text-slate-500">Items Donated</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white text-lg shadow-sm">👥</div>
            <div><p className="font-display font-bold text-2xl text-slate-800">{totalDonors}</p><p className="text-xs text-slate-500">Total Donors</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg shadow-sm">✅</div>
            <div><p className="font-display font-bold text-2xl text-slate-800">{distributedCount}</p><p className="text-xs text-slate-500">Distributed</p></div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">Donation Pipeline</h3>
          <div className="flex items-center gap-3">
            {pipelineSteps.map(function (step, index) {
              return (
                <div key={step.label} className="flex items-center gap-3 flex-1">
                  <div className={'flex-1 text-center py-3 rounded-xl border ' + step.color}>
                    <p className="font-display font-bold text-xl">{step.value}</p>
                    <p className="text-xs">{step.label}</p>
                  </div>
                  {index < 2 && <span className="text-slate-300 text-lg">→</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Donation form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800 text-lg">New Donation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Your Name *</label>
                <input value={donorName} onChange={function (e) { setDonorName(e.target.value) }} className="input" placeholder="Full name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Email</label>
                <input type="email" value={donorEmail} onChange={function (e) { setDonorEmail(e.target.value) }} className="input" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Phone</label>
                <input value={donorPhone} onChange={function (e) { setDonorPhone(e.target.value) }} className="input" placeholder="+880-XXXX-XXXXXX" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Donation Type *</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {DONATION_TYPES.map(function (type) {
                  let isActive = (donationType === type)
                  let typeStyle = 'bg-white/50 text-slate-500 border-white/60 hover:bg-teal-50'
                  if (isActive) {
                    typeStyle = 'bg-teal-100 text-teal-700 border-teal-300 shadow-sm'
                  }
                  return (
                    <button key={type} type="button" onClick={function () { setDonationType(type) }}
                      className={'p-3 rounded-xl text-center transition-all border ' + typeStyle}>
                      <span className="text-xl block mb-1">{TYPE_ICONS[type]}</span>
                      <span className="text-xs font-medium">{type}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            {donationType === 'MONEY' ? (
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Amount (৳) *</label>
                <input type="number" value={amount} onChange={function (e) { setAmount(e.target.value) }} className="input" placeholder="e.g., 5000" min={1} required />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">Item Name *</label>
                  <input value={itemName} onChange={function (e) { setItemName(e.target.value) }} className="input" placeholder="e.g., Rice Packs" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">Quantity *</label>
                  <input type="number" value={quantity} onChange={function (e) { setQuantity(e.target.value) }} className="input" placeholder="e.g., 100" min={1} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">Unit</label>
                  <select value={unit} onChange={function (e) { setUnit(e.target.value) }} className="select">
                    <option value="items">Items</option>
                    <option value="packs">Packs</option>
                    <option value="boxes">Boxes</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="units">Units</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Message (optional)</label>
              <textarea value={message} onChange={function (e) { setMessage(e.target.value) }} className="input min-h-[60px] resize-none" placeholder="Any message or special instructions..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={function () { setShowForm(false) }} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">💝 Submit Donation</button>
            </div>
          </form>
        )}

        {/* Type filter buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={function () { setFilter('') }}
            className={'px-4 py-2 rounded-xl text-sm font-medium transition-all ' + (filter === '' ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm' : 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600')}>
            All
          </button>
          {DONATION_TYPES.map(function (type) {
            let isActive = (filter === type)
            let btnStyle = 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'
            if (isActive) {
              btnStyle = 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm'
            }
            return (
              <button key={type} onClick={function () { setFilter(type) }}
                className={'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ' + btnStyle}>
                <span>{TYPE_ICONS[type]}</span> {type}
              </button>
            )
          })}
        </div>

        {/* Donations list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDonations.map(function (donation) {
              // Get status badge color
              let statusBadge = 'bg-amber-50 text-amber-600 border-amber-200'
              if (donation.status === 'RECEIVED') {
                statusBadge = 'bg-blue-50 text-blue-600 border-blue-200'
              } else if (donation.status === 'DISTRIBUTED') {
                statusBadge = 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }

              // Build donation title
              let donationTitle = ''
              if (donation.type === 'MONEY') {
                let amountFormatted = 0
                if (donation.amount) {
                  amountFormatted = donation.amount.toLocaleString()
                }
                donationTitle = '৳' + amountFormatted + ' Monetary Donation'
              } else {
                donationTitle = donation.quantity + ' ' + donation.unit + ' of ' + donation.itemName
              }

              // Build donor info
              let donorInfo = 'From ' + donation.donorName
              if (donation.donorEmail) {
                donorInfo = donorInfo + ' · ' + donation.donorEmail
              }

              return (
                <div key={donation.id} className="card hover:shadow-lg hover:shadow-teal-100/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl flex-shrink-0">
                      {TYPE_ICONS[donation.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-700">{donationTitle}</h3>
                        <span className={'badge text-[10px] ' + statusBadge}>{donation.status}</span>
                      </div>
                      <p className="text-sm text-slate-500">{donorInfo}</p>
                      {donation.message && <p className="text-xs text-slate-400 mt-1 italic">"{donation.message}"</p>}
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(donation.createdAt)}</p>
                    </div>
                    {isStaff && (
                      <div className="flex gap-2 flex-shrink-0">
                        {donation.status === 'PLEDGED' && (
                          <button onClick={function () { updateStatus(donation.id, 'RECEIVED') }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all">
                            Mark Received
                          </button>
                        )}
                        {donation.status === 'RECEIVED' && (
                          <button onClick={function () { updateStatus(donation.id, 'DISTRIBUTED') }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all">
                            Mark Distributed
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredDonations.length === 0 && !loading && (
          <p className="text-center text-slate-400 py-12">No donations found.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
