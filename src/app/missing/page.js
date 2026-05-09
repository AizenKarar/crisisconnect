
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MissingPersonsPage() {
  const { data: session } = useSession()


  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const [formName, setFormName] = useState('')
  const [formAge, setFormAge] = useState('')
  const [formGender, setFormGender] = useState('Male')
  const [formDescription, setFormDescription] = useState('')
  const [formLastSeenPlace, setFormLastSeenPlace] = useState('')
  const [formLastSeenDate, setFormLastSeenDate] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formContactPhone, setFormContactPhone] = useState('')
  const [formContactName, setFormContactName] = useState('')
  const [formLatitude, setFormLatitude] = useState('')
  const [formLongitude, setFormLongitude] = useState('')


  useEffect(function () {
    fetchPersons()
  }, [])

  async function fetchPersons() {
    try {
      const response = await fetch('/api/missing')
      if (response.ok) {
        const data = await response.json()
        setPersons(data)
      }
    } catch (error) {
      console.error('Error fetching missing persons:', error)
    }
    setLoading(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    let reportData = {
      name: formName,
      age: formAge,
      gender: formGender,
      description: formDescription,
      lastSeenPlace: formLastSeenPlace,
      lastSeenDate: formLastSeenDate,
      imageUrl: formImageUrl,
      contactPhone: formContactPhone,
      contactName: formContactName,
      latitude: formLatitude,
      longitude: formLongitude,
    }

    try {
      const response = await fetch('/api/missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      })

      if (response.ok) {
        toast.success('Missing person report submitted!')
        setShowForm(false)
        setFormName('')
        setFormAge('')
        setFormGender('Male')
        setFormDescription('')
        setFormLastSeenPlace('')
        setFormLastSeenDate('')
        setFormImageUrl('')
        setFormContactPhone('')
        setFormContactName('')
        setFormLatitude('')
        setFormLongitude('')
        fetchPersons()
      } else {
        const data = await response.json()
        let errorMessage = 'Failed to submit'
        if (data && data.error) {
          errorMessage = data.error
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report')
    }
  }

  async function updateStatus(personId, newStatus) {
    try {
      const response = await fetch('/api/missing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: personId, status: newStatus }),
      })
      if (response.ok) {
        toast.success('Status updated to ' + newStatus)
        fetchPersons()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }


  let filtered = []
  for (let i = 0; i < persons.length; i++) {
    let person = persons[i]


    let matchesFilter = false
    if (filter === 'ALL') {
      matchesFilter = true
    } else if (person.status === filter) {
      matchesFilter = true
    }


    let matchesSearch = true
    if (search !== '') {
      let searchLower = search.toLowerCase()
      let nameMatch = person.name.toLowerCase().includes(searchLower)
      let placeMatch = person.lastSeenPlace.toLowerCase().includes(searchLower)
      let descMatch = person.description.toLowerCase().includes(searchLower)
      matchesSearch = nameMatch || placeMatch || descMatch
    }

    if (matchesFilter && matchesSearch) {
      filtered.push(person)
    }
  }


  let totalCount = persons.length
  let missingCount = 0
  let foundCount = 0
  let closedCount = 0
  for (let i = 0; i < persons.length; i++) {
    if (persons[i].status === 'MISSING') {
      missingCount = missingCount + 1
    }
    if (persons[i].status === 'FOUND') {
      foundCount = foundCount + 1
    }
    if (persons[i].status === 'CLOSED') {
      closedCount = closedCount + 1
    }
  }


  let canUpdate = false
  if (session && session.user) {
    let userRole = session.user.role
    if (userRole === 'STAFF' || userRole === 'ADMIN') {
      canUpdate = true
    }
  }

  let filterOptions = ['ALL', 'MISSING', 'FOUND', 'CLOSED']


  let statsCards = [
    { label: 'Total Reports', value: totalCount, icon: '📋', bg: 'bg-teal-500' },
    { label: 'Still Missing', value: missingCount, icon: '🔍', bg: 'bg-red-500' },
    { label: 'Found Safe', value: foundCount, icon: '✅', bg: 'bg-emerald-500' },
    { label: 'Cases Closed', value: closedCount, icon: '📁', bg: 'bg-slate-400' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800">Missing Persons</h1>
            <p className="text-slate-500 text-sm mt-1">Report and track missing individuals during emergencies.</p>
          </div>
          <button onClick={function () { setShowForm(!showForm) }} className="btn-primary">
            {showForm ? '✕ Close Form' : '+ Report Missing Person'}
          </button>
        </div>


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


        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-4 animate-slide-down border-l-4 border-l-teal-500">
            <h2 className="font-display font-semibold text-slate-800 text-lg">Report Missing Person</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Full Name *</label>
                <input value={formName} onChange={function (e) { setFormName(e.target.value) }} className="input" placeholder="Person's full name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Age *</label>
                <input type="number" value={formAge} onChange={function (e) { setFormAge(e.target.value) }} className="input" placeholder="Age" min={0} max={120} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Gender *</label>
                <select value={formGender} onChange={function (e) { setFormGender(e.target.value) }} className="select">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Physical Description *</label>
              <textarea value={formDescription} onChange={function (e) { setFormDescription(e.target.value) }} className="input min-h-[80px] resize-none" placeholder="Height, weight, clothing, distinguishing features..." required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Last Seen Place *</label>
                <input value={formLastSeenPlace} onChange={function (e) { setFormLastSeenPlace(e.target.value) }} className="input" placeholder="Location where last seen" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Last Seen Date *</label>
                <input type="date" value={formLastSeenDate} onChange={function (e) { setFormLastSeenDate(e.target.value) }} className="input" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Emergency Contact Name *</label>
                <input value={formContactName} onChange={function (e) { setFormContactName(e.target.value) }} className="input" placeholder="Family member or contact person" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Emergency Contact Phone *</label>
                <input value={formContactPhone} onChange={function (e) { setFormContactPhone(e.target.value) }} className="input" placeholder="+880-1XXX-XXXXXX" required />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={function () { setShowForm(false) }} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">🔍 Submit Missing Person Report</button>
            </div>
          </form>
        )}


        <div className="flex flex-wrap items-center gap-3">
          <input value={search} onChange={function (e) { setSearch(e.target.value) }} className="input max-w-xs" placeholder="🔍 Search by name, location..." />
          <div className="flex gap-1">
            {filterOptions.map(function (option) {
              let isActive = (filter === option)
              let buttonStyle = 'bg-white/50 text-slate-500 border border-white/60 hover:text-teal-600'
              if (isActive) {
                buttonStyle = 'bg-teal-100 text-teal-700 border border-teal-200 shadow-sm'
              }
              let displayLabel = option
              if (option === 'ALL') {
                displayLabel = 'All'
              } else {
                displayLabel = option.charAt(0) + option.slice(1).toLowerCase()
              }
              return (
                <button key={option} onClick={function () { setFilter(option) }}
                  className={'px-4 py-2 rounded-xl text-sm font-medium transition-all ' + buttonStyle}>
                  {displayLabel}
                </button>
              )
            })}
          </div>
        </div>


        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(function (person) {

              let daysMissing = Math.floor((Date.now() - new Date(person.lastSeenDate)) / (1000 * 60 * 60 * 24))


              let statusBadgeColor = 'bg-red-50 text-red-600 border-red-200'
              if (person.status === 'FOUND') {
                statusBadgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-200'
              } else if (person.status === 'CLOSED') {
                statusBadgeColor = 'bg-slate-100 text-slate-500 border-slate-200'
              }


              let avatarStyle = 'bg-red-50 border border-red-200'
              let avatarIcon = '🔍'
              if (person.status === 'FOUND') {
                avatarStyle = 'bg-emerald-50 border border-emerald-200'
                avatarIcon = '✅'
              } else if (person.status === 'CLOSED') {
                avatarStyle = 'bg-slate-100 border border-slate-200'
              }

              let lastSeenFormatted = new Date(person.lastSeenDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })


              let reporterText = ''
              if (person.reporter && person.reporter.name) {
                reporterText = ' by ' + person.reporter.name
              }

              return (
                <div key={person.id} className="card hover:shadow-lg hover:shadow-teal-100/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm ' + avatarStyle}>
                      {avatarIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-slate-800 text-base">{person.name}</h3>
                        <span className={'badge text-[10px] ' + statusBadgeColor}>{person.status}</span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {person.gender}, Age {person.age}
                        {person.status === 'MISSING' && (
                          <span className="text-red-500 font-medium"> · Missing {daysMissing} days</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{person.description}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-slate-400">📍 <span className="text-slate-500 font-medium">Last seen:</span> {person.lastSeenPlace}</p>
                        <p className="text-xs text-slate-400">📅 <span className="text-slate-500 font-medium">Date:</span> {lastSeenFormatted}</p>
                        <p className="text-xs text-slate-400">📞 <span className="text-slate-500 font-medium">Contact:</span> {person.contactName} — {person.contactPhone}</p>
                      </div>
                      {canUpdate && person.status === 'MISSING' && (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-teal-100/60">
                          <button onClick={function () { updateStatus(person.id, 'FOUND') }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all">
                            ✅ Mark as Found
                          </button>
                          <button onClick={function () { updateStatus(person.id, 'CLOSED') }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-all">
                            Close Case
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-teal-50 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">Reported {formatDate(person.createdAt)}{reporterText}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <p className="text-center text-slate-400 py-12">No missing person reports found.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
