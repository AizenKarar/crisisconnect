// src/app/profile/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  // Get the current logged-in user session
  const { data: session } = useSession()

  // State variables
  const [profile, setProfile] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  // Form fields for editing profile
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSkills, setFormSkills] = useState('')
  const [formBio, setFormBio] = useState('')
  const [formAddress, setFormAddress] = useState('')

  // Fetch profile when page loads
  useEffect(function () {
    fetchProfile()
  }, [])

  // Fetch profile data from the API
  async function fetchProfile() {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setActivity(data.recentActivity)

        // Fill in the form fields with current values
        setFormName(data.user.name || '')
        setFormPhone(data.user.phone || '')
        setFormSkills(data.user.skills || '')
        setFormBio(data.user.bio || '')
        setFormAddress(data.user.address || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
    setLoading(false)
  }

  // Save profile changes
  async function handleSave(event) {
    event.preventDefault()

    let updateData = {
      name: formName,
      phone: formPhone,
      skills: formSkills,
      bio: formBio,
      address: formAddress,
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      if (response.ok) {
        toast.success('Profile updated!')
        setEditing(false)
        fetchProfile()
      } else {
        toast.error('Failed to update')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update')
    }
  }

  // Toggle edit mode
  function toggleEditing() {
    setEditing(!editing)
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

  // Show error if profile could not be loaded
  if (!profile) {
    return (
      <DashboardLayout>
        <p className="text-slate-400 text-center py-20">Could not load profile.</p>
      </DashboardLayout>
    )
  }

  // Get first letter of name for avatar
  let nameInitial = ''
  if (profile.name && profile.name.length > 0) {
    nameInitial = profile.name[0]
  }

  // Get counts safely
  let counts = profile._count || {}
  let incidentCount = counts.incidents || 0
  let messageCount = counts.messages || 0
  let donationCount = counts.donations || 0
  let missingCount = counts.missingReports || 0
  let postCount = counts.communityPosts || 0

  // Format the member since date
  let memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  // Stats list for the grid
  let statsList = [
    { label: 'Incidents', value: incidentCount, icon: '🚨' },
    { label: 'Messages', value: messageCount, icon: '💬' },
    { label: 'Donations', value: donationCount, icon: '💝' },
    { label: 'Missing Reports', value: missingCount, icon: '🔍' },
    { label: 'Posts', value: postCount, icon: '📝' },
  ]

  // Profile info fields for display mode
  let profileFields = [
    { label: 'Email', value: profile.email },
    { label: 'Phone', value: profile.phone || 'Not set' },
    { label: 'Skills', value: profile.skills || 'None listed' },
    { label: 'Address', value: profile.address || 'Not set' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header card */}
        <div className="card text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-teal-400/30 mx-auto mb-4">{nameInitial}</div>
          <h1 className="font-display font-bold text-2xl text-slate-800">{profile.name}</h1>
          <p className="text-teal-600 font-medium text-sm mt-1">{profile.role}</p>
          <p className="text-slate-500 text-sm mt-1">{profile.email}</p>
          {profile.bio && <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto italic">"{profile.bio}"</p>}
          <div className="flex items-center justify-center gap-3 mt-3">
            {profile.isVerified && <span className="badge bg-emerald-50 text-emerald-600 border-emerald-200">✓ Verified</span>}
            <span className="badge bg-teal-50 text-teal-600 border-teal-200">⭐ {profile.karmaPoints} karma</span>
            <span className="badge bg-slate-100 text-slate-500 border-slate-200">Member since {memberSince}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {statsList.map(function (stat) {
            return (
              <div key={stat.label} className="card text-center">
                <span className="text-xl">{stat.icon}</span>
                <p className="font-display font-bold text-xl text-slate-800 mt-1">{stat.value}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Edit profile */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-800">Profile Information</h2>
            <button onClick={toggleEditing} className="btn-ghost text-xs">{editing ? 'Cancel' : '✏️ Edit'}</button>
          </div>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">Name</label>
                  <input value={formName} onChange={function (e) { setFormName(e.target.value) }} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1.5">Phone</label>
                  <input value={formPhone} onChange={function (e) { setFormPhone(e.target.value) }} className="input" placeholder="+880..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Skills (comma-separated)</label>
                <input value={formSkills} onChange={function (e) { setFormSkills(e.target.value) }} className="input" placeholder="e.g., First Aid, Swimming, Cooking" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Address</label>
                <input value={formAddress} onChange={function (e) { setFormAddress(e.target.value) }} className="input" placeholder="Your address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Bio</label>
                <textarea value={formBio} onChange={function (e) { setFormBio(e.target.value) }} className="input min-h-[80px] resize-none" placeholder="Tell us about yourself..." />
              </div>
              <button type="submit" className="btn-primary w-full">💾 Save Changes</button>
            </form>
          ) : (
            <div className="space-y-3">
              {profileFields.map(function (field) {
                return (
                  <div key={field.label} className="flex items-center justify-between py-2 border-b border-teal-50 last:border-0">
                    <span className="text-sm text-slate-500">{field.label}</span>
                    <span className="text-sm text-slate-700 font-medium">{field.value}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="card">
          <h2 className="font-display font-semibold text-slate-800 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {activity.map(function (log) {
                let incidentTitle = ''
                if (log.incident && log.incident.title) {
                  incidentTitle = log.incident.title
                }
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600">
                        <span className="font-mono text-xs text-teal-600 mr-2">{log.action}</span>
                        {log.details}
                      </p>
                      {incidentTitle !== '' && <p className="text-xs text-slate-400 mt-0.5">Re: {incidentTitle}</p>}
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(log.createdAt)}</p>
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
