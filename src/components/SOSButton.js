'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SOSButton() {
  const [activating, setActivating] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleSOS() {
    if (!confirmed) {
      setConfirmed(true)
      setTimeout(function () { setConfirmed(false) }, 5000)
      return
    }
    setActivating(true)
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation not supported by your browser')
        setActivating(false); setConfirmed(false)
        return
      }
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        toast.error('SOS requires HTTPS. Use localhost or enable HTTPS.')
        setActivating(false); setConfirmed(false)
        return
      }
      const position = await new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })

      const lat = position.coords.latitude
      const lon = position.coords.longitude
      let address = ''

      try {
        const locRes = await fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lon })
        })
        if (locRes.ok) {
          const locData = await locRes.json()
          address = locData.display_name || ''
        }
      } catch (e) {
      }

      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon, address: address, message: 'Emergency SOS broadcast' }),
      })
      if (res.ok) toast.success('SOS broadcast sent! Help is on the way.')
      else toast.error('Failed to send SOS')
    } catch (err) {
      if (err.code === 1) {
        toast.error('Location permission denied. Please allow location access in browser settings for SOS to work.')
      } else if (err.code === 2) {
        toast.error('Location unavailable. SOS requires your location.')
      } else if (err.code === 3) {
        toast.error('Location request timed out. Please try again.')
      } else {
        toast.error('Could not get location for SOS.')
      }
    }
    setActivating(false)
    setConfirmed(false)
  }

  return (
    <button onClick={handleSOS} disabled={activating}
      className={`relative px-5 py-2 rounded-xl font-bold text-sm transition-all duration-300
        ${confirmed
          ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse shadow-lg shadow-red-300/40'
          : 'bg-red-50 hover:bg-red-100 text-red-500 border border-red-200'
        } ${activating ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {activating ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...
        </span>
      ) : confirmed ? 'Tap Again to Confirm SOS' : (
        <span className="flex items-center gap-2"><span className="pulse-dot" /> SOS</span>
      )}
    </button>
  )
}