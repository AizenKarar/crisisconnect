// src/app/incidents/report/page.js
'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

export default function ReportIncidentPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'FIRE',
    severity: 'MEDIUM',
    latitude: '',
    longitude: '',
    address: '',
    imageUrl: '',
    anonymous: false,
  })

  function updateField(fieldName, value) {
    setForm((prevForm) => ({
      ...prevForm,
      [fieldName]: value
    }))
  }

  // Updated Location Logic with LocationIQ integration
  async function getLocation() {
    setGettingLocation(true)

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      setGettingLocation(false)
      return
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      toast.error('Location requires HTTPS. Use localhost or enable HTTPS.')
      setGettingLocation(false)
      return
    }

    try {
      const position = await new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })

      const lat = position.coords.latitude.toFixed(6)
      const lon = position.coords.longitude.toFixed(6)

      updateField('latitude', lat)
      updateField('longitude', lon)

      // Auto-fill address using the LocationIQ route API
      try {
        const response = await fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: lat, lon: lon })
        })

        if (response.ok) {
          const data = await response.json()
          if (data && data.display_name) {
            updateField('address', data.display_name)
            toast.success('Location and address captured!')
          } else if (data && data.address) {
            const { road, city_district, city, state, postcode } = data.address
            const addressString = [road, city_district, city, state, postcode].filter(Boolean).join(', ')
            updateField('address', addressString)
            toast.success('Location and address captured!')
          } else {
            toast.success('Location coordinates captured!')
          }
        } else {
          toast.success('Location coordinates captured!')
        }
      } catch (err) {
        console.error("Failed to reverse geocode:", err)
        toast.success('Location coordinates captured!')
      }

    } catch (error) {
      if (error.code === 1) {
        toast.error('Location permission denied. Please allow location access in your browser settings, or enter coordinates manually.')
      } else if (error.code === 2) {
        toast.error('Location unavailable. Please enter coordinates manually.')
      } else if (error.code === 3) {
        toast.error('Location request timed out. Please try again or enter coordinates manually.')
      } else {
        toast.error('Could not get location. Please enter coordinates manually.')
      }
    }

    setGettingLocation(false)
  }

  function handleImageUpload(event) {
    let file = event.target.files[0]
    if (!file) {
      return
    }
    toast.success('Photo "' + file.name + '" attached')
    updateField('imageUrl', URL.createObjectURL(file))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    let endpoint = '/api/incidents'
    if (form.anonymous) {
      endpoint = '/api/incidents/anonymous'
    }

    let submitData = {
      title: form.title,
      description: form.description,
      type: form.type,
      severity: form.severity,
      latitude: form.latitude,
      longitude: form.longitude,
      address: form.address,
      imageUrl: form.imageUrl || null,
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Incident reported!')
        router.push('/incidents/' + data.id)
      } else {
        const errorData = await response.json()
        let errorMessage = 'Failed to submit'
        if (errorData && errorData.error) {
          errorMessage = errorData.error
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report')
    }

    setLoading(false)
  }

  const typeOptions = ['FIRE', 'FLOOD', 'EARTHQUAKE', 'STORM', 'MEDICAL', 'INFRASTRUCTURE', 'OTHER']
  const severityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  let summaryLocation = form.address || (form.latitude + ', ' + form.longitude)

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">Report a Crisis</h1>
        <p className="text-slate-500 text-sm mb-8">Fill out this form to report an emergency.</p>

        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map(function (stepNumber) {
            let stepStyle = 'bg-white/60 text-slate-400 border border-white/60'
            if (step >= stepNumber) {
              stepStyle = 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
            }
            let lineStyle = 'bg-teal-100'
            if (step > stepNumber) {
              lineStyle = 'bg-teal-500'
            }
            return (
              <div key={stepNumber} className="flex items-center gap-3 flex-1">
                <div className={'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all ' + stepStyle}>{stepNumber}</div>
                {stepNumber < 3 && <div className={'flex-1 h-0.5 rounded-full transition-all ' + lineStyle} />}
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="card space-y-5 animate-fade-in">
              <h2 className="font-display font-semibold text-slate-800 text-lg">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Incident Title</label>
                <input value={form.title} onChange={function (e) { updateField('title', e.target.value) }} className="input" placeholder="e.g., Building fire on Main Street" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Description</label>
                <textarea value={form.description} onChange={function (e) { updateField('description', e.target.value) }} className="input min-h-[120px] resize-none" placeholder="Describe the situation..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">Type</label>
                  <select value={form.type} onChange={function (e) { updateField('type', e.target.value) }} className="select">
                    {typeOptions.map(function (type) {
                      return <option key={type} value={type}>{type}</option>
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">Severity</label>
                  <select value={form.severity} onChange={function (e) { updateField('severity', e.target.value) }} className="select">
                    {severityOptions.map(function (sev) {
                      return <option key={sev} value={sev}>{sev}</option>
                    })}
                  </select>
                </div>
              </div>
              <button type="button" onClick={function () { setStep(2) }} className="btn-primary w-full">Next: Location</button>
            </div>
          )}

          {step === 2 && (
            <div className="card space-y-5 animate-fade-in">
              <h2 className="font-display font-semibold text-slate-800 text-lg">Location Details</h2>
              <button type="button" onClick={getLocation} disabled={gettingLocation} className="w-full py-4 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/50 hover:bg-teal-50 text-teal-600 transition-all">
                {gettingLocation ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />Getting GPS & Address...
                  </span>
                ) : '📍 Use My Current Location (GPS)'}
              </button>
              <div className="text-center text-xs text-slate-400">or enter manually</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">Latitude</label>
                  <input value={form.latitude} onChange={function (e) { updateField('latitude', e.target.value) }} className="input font-mono" placeholder="23.7806" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-2">Longitude</label>
                  <input value={form.longitude} onChange={function (e) { updateField('longitude', e.target.value) }} className="input font-mono" placeholder="90.4193" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Address</label>
                <input value={form.address} onChange={function (e) { updateField('address', e.target.value) }} className="input" placeholder="Human-readable address" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={function () { setStep(1) }} className="btn-ghost flex-1">Back</button>
                <button type="button" onClick={function () { setStep(3) }} className="btn-primary flex-1">Next: Evidence</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card space-y-5 animate-fade-in">
              <h2 className="font-display font-semibold text-slate-800 text-lg">Evidence & Submit</h2>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Upload Photo Evidence</label>
                <label className="block w-full py-8 rounded-xl border-2 border-dashed border-teal-200 bg-white/40 hover:bg-white/60 cursor-pointer transition-all text-center">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {form.imageUrl ? (
                    <div className="space-y-2">
                      <img src={form.imageUrl} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                      <p className="text-xs text-emerald-600">Photo attached</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-500">📷 Click to upload photo</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              <div className="p-4 rounded-xl bg-white/40 border border-white/50 space-y-2">
                <h3 className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Summary</h3>
                <p className="text-sm text-slate-700 font-medium">{form.title || 'Untitled'}</p>
                <p className="text-xs text-slate-500">{form.type} · {form.severity} · {summaryLocation}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={function () { setStep(2) }} className="btn-ghost flex-1">Back</button>
                <button type="submit" disabled={loading} className="btn-danger flex-1">{loading ? 'Submitting...' : '🚨 Submit Report'}</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}