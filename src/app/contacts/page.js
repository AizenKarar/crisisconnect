// src/app/contacts/page.js
'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

// Icon map for each contact category
const CAT_ICONS = { HOSPITAL: '🏥', FIRE_STATION: '🚒', POLICE: '👮', AMBULANCE: '🚑', UTILITY: '⚡', NGO: '🤝', OTHER: '📞' }
// Category filter options
const CATEGORIES = ['ALL', 'HOSPITAL', 'FIRE_STATION', 'POLICE', 'AMBULANCE', 'UTILITY', 'NGO']

export default function ContactsPage() {
  // State variables
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  // Fetch contacts when page loads
  useEffect(function () {
    fetchContacts()
  }, [])

  // Fetch all contacts from the API
  async function fetchContacts() {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
    setLoading(false)
  }

  // Filter contacts by category and search text
  let filtered = []
  for (let i = 0; i < contacts.length; i++) {
    let contact = contacts[i]

    // Check category filter
    let matchesFilter = false
    if (filter === 'ALL') {
      matchesFilter = true
    } else if (contact.category === filter) {
      matchesFilter = true
    }

    // Check search text
    let matchesSearch = true
    if (search !== '') {
      let searchLower = search.toLowerCase()
      let nameMatch = contact.name.toLowerCase().includes(searchLower)
      let addressMatch = contact.address.toLowerCase().includes(searchLower)
      matchesSearch = nameMatch || addressMatch
    }

    if (matchesFilter && matchesSearch) {
      filtered.push(contact)
    }
  }

  // Quick dial numbers data
  let quickDial = [
    { label: 'National Emergency', num: '999', icon: '🆘', color: 'bg-red-500' },
    { label: 'Ambulance', num: '199', icon: '🚑', color: 'bg-blue-500' },
    { label: 'Fire Service', num: '999', icon: '🚒', color: 'bg-orange-500' },
    { label: 'Police', num: '999', icon: '👮', color: 'bg-indigo-500' },
    { label: 'Disaster Mgmt', num: '1090', icon: '🛡️', color: 'bg-teal-500' },
    { label: 'Women Helpline', num: '10921', icon: '💜', color: 'bg-purple-500' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">📞 Emergency Contacts</h1>
          <p className="text-slate-500 text-sm mt-1">Directory of hospitals, fire stations, police, and emergency services.</p>
        </div>

        {/* Quick dial */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickDial.map(function (item) {
            return (
              <div key={item.label} className="card text-center hover:shadow-lg hover:shadow-teal-100/40 transition-all cursor-pointer">
                <div className={'w-12 h-12 rounded-xl ' + item.color + ' flex items-center justify-center text-white text-2xl shadow-sm mx-auto mb-2'}>{item.icon}</div>
                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                <p className="font-display font-bold text-lg text-slate-800 mt-1">{item.num}</p>
              </div>
            )
          })}
        </div>

        {/* Search + filter */}
        <div className="flex flex-wrap items-center gap-3">
          <input value={search} onChange={function (e) { setSearch(e.target.value) }} className="input max-w-xs" placeholder="🔍 Search contacts..." />
          <div className="flex gap-1">
            {CATEGORIES.map(function (category) {
              let isActive = (filter === category)
              let btnStyle = 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'
              if (isActive) {
                btnStyle = 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm'
              }
              let label = category
              if (category === 'ALL') {
                label = 'All'
              } else {
                label = category.replace('_', ' ')
              }
              let icon = ''
              if (category !== 'ALL') {
                icon = CAT_ICONS[category]
              }
              return (
                <button key={category} onClick={function () { setFilter(category) }}
                  className={'px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ' + btnStyle}>
                  {icon !== '' && <span>{icon}</span>}{label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Contact list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(function (contact) {
              let categoryIcon = CAT_ICONS[contact.category] || '📞'
              let categoryLabel = contact.category.replace('_', ' ')
              return (
                <div key={contact.id} className="card hover:shadow-lg hover:shadow-teal-100/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl flex-shrink-0">{categoryIcon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-slate-800">{contact.name}</h3>
                        {contact.isVerified && <span className="badge text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">✓ Verified</span>}
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{categoryLabel}</p>
                      <div className="space-y-1.5">
                        <p className="text-sm text-slate-600 flex items-center gap-2">
                          📞 <span className="font-mono font-medium text-teal-700">{contact.phone}</span>
                          {contact.altPhone && <span className="text-slate-400">/ {contact.altPhone}</span>}
                        </p>
                        {contact.email && <p className="text-sm text-slate-500 flex items-center gap-2">📧 {contact.email}</p>}
                        <p className="text-sm text-slate-500 flex items-center gap-2">📍 {contact.address}</p>
                        {contact.operatingHours && <p className="text-xs text-slate-400 flex items-center gap-2">🕐 {contact.operatingHours}</p>}
                        {contact.notes && <p className="text-xs text-slate-400 italic mt-1">{contact.notes}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {filtered.length === 0 && !loading && <p className="text-center text-slate-400 py-12">No contacts found.</p>}
      </div>
    </DashboardLayout>
  )
}
