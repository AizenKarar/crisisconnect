'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

export default function BloodRegistryPage() {
    const [donors, setDonors] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [filterGroup, setFilterGroup] = useState('ALL')
    const [donorName, setDonorName] = useState('')
    const [bloodGroup, setBloodGroup] = useState('A+')
    const [phone, setPhone] = useState('')
    const [location, setLocation] = useState('')

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

    useEffect(() => { fetchDonors() }, [filterGroup])

    async function fetchDonors() {
        setLoading(true)
        try {
            let url = '/api/blood-registry'
            if (filterGroup !== 'ALL') url += '?group=' + encodeURIComponent(filterGroup)

            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                setDonors(data)
            }
        } catch (error) {
            console.error('Error fetching donors:', error)
        }
        setLoading(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        let data = { donorName, bloodGroup, phone, location }

        try {
            const response = await fetch('/api/blood-registry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (response.ok) {
                toast.success('Successfully registered as a donor!')
                setShowForm(false)
                setDonorName(''); setPhone(''); setLocation('')
                fetchDonors()
            }
        } catch (error) {
            toast.error('Failed to register')
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display font-bold text-2xl text-slate-800">🩸 Blood Registry</h1>
                        <p className="text-slate-500 text-sm mt-1">Find emergency blood donors in your area.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        {showForm ? '✕ Close' : '+ Register as Donor'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="card space-y-4 border-l-4 border-l-red-500 animate-slide-down">
                        <h2 className="font-display font-semibold text-slate-800">Register as a Donor</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                                <input value={donorName} onChange={e => setDonorName(e.target.value)} className="input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Blood Group</label>
                                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="select">
                                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="017..." required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Location/Area</label>
                                <input value={location} onChange={e => setLocation(e.target.value)} className="input" placeholder="e.g., Mirpur" required />
                            </div>
                        </div>
                        <button type="submit" className="btn-danger w-full">🩸 Add Me to Registry</button>
                    </form>
                )}

                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setFilterGroup('ALL')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterGroup === 'ALL' ? 'bg-red-100 text-red-700 shadow-sm' : 'bg-white/50 text-slate-500'}`}>All</button>
                    {bloodGroups.map(bg => (
                        <button key={bg} onClick={() => setFilterGroup(bg)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterGroup === bg ? 'bg-red-100 text-red-700 shadow-sm' : 'bg-white/50 text-slate-500'}`}>
                            {bg}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {donors.map(donor => (
                            <div key={donor.id} className="card flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-xl font-bold text-red-600 flex-shrink-0">
                                    {donor.bloodGroup}
                                </div>
                                <div>
                                    <h3 className="font-display font-semibold text-slate-800">{donor.donorName}</h3>
                                    <p className="text-sm text-slate-500 mt-1">📍 {donor.location}</p>
                                    <p className="text-sm font-mono text-teal-700 font-medium mt-1">📞 {donor.phone}</p>
                                </div>
                            </div>
                        ))}
                        {donors.length === 0 && <p className="text-slate-400">No donors found for this blood group.</p>}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}