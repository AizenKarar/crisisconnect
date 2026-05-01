// src/lib/utils.js

export function getSeverityColor(severity) {
  const colors = {
    CRITICAL: 'bg-red-50 text-red-600 border-red-200',
    HIGH: 'bg-orange-50 text-orange-600 border-orange-200',
    MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200',
    LOW: 'bg-green-50 text-green-600 border-green-200',
  }
  return colors[severity] || colors.LOW
}

export function getStatusColor(status) {
  const colors = {
    PENDING: 'bg-slate-100 text-slate-500 border-slate-200',
    VERIFIED: 'bg-blue-50 text-blue-600 border-blue-200',
    IN_PROGRESS: 'bg-purple-50 text-purple-600 border-purple-200',
    RESOLVED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-500 border-red-200',
  }
  return colors[status] || colors.PENDING
}

export function getDisasterIcon(type) {
  const icons = {
    FIRE: '🔥', FLOOD: '🌊', EARTHQUAKE: '🏚️', STORM: '⛈️',
    MEDICAL: '🏥', INFRASTRUCTURE: '🏗️', OTHER: '⚠️',
  }
  return icons[type] || '⚠️'
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    const data = await res.json()
    return data.display_name || 'Unknown location'
  } catch { return `${lat.toFixed(4)}, ${lng.toFixed(4)}` }
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function hasRole(session, roles) {
  if (!session?.user?.role) return false
  return roles.includes(session.user.role)
}

export function matchVolunteers(volunteers, incident) {
  const skillMap = {
    FIRE: ['Firefighting', 'Search and Rescue', 'First Aid', 'Heavy Lifting'],
    FLOOD: ['Swimming', 'Boat Operation', 'Search and Rescue', 'Truck Driver'],
    EARTHQUAKE: ['Search and Rescue', 'Heavy Lifting', 'Structural Engineering', 'First Aid'],
    MEDICAL: ['Medical', 'Nursing', 'First Aid', 'Pharmacy'],
    STORM: ['Electrical', 'Heavy Lifting', 'Truck Driver', 'Cooking'],
    INFRASTRUCTURE: ['Structural Engineering', 'Heavy Lifting', 'Electrical'],
  }
  const neededSkills = skillMap[incident.type] || ['General']
  return volunteers
    .map((v) => {
      const userSkills = (v.skills || '').split(',').map(s => s.trim().toLowerCase())
      const matchCount = neededSkills.filter(n => userSkills.some(s => s.includes(n.toLowerCase()))).length
      const matchScore = neededSkills.length > 0 ? Math.round((matchCount / neededSkills.length) * 100) : 0
      return { ...v, matchScore, matchedSkills: matchCount }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}
