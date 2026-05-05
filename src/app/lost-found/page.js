'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function LostFoundPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [filterType, setFilterType] = useState('ALL')
    const [itemName, setItemName] = useState('')
    const [type, setType] = useState('LOST')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [contactName, setContactName] = useState('')
    const [contactPhone, setContactPhone] = useState('')

    useEffect(() => { fetchItems() }, [filterType])

    async function fetchItems() {
        setLoading(true)
        try {
            let url = '/api/lost-found'
            if (filterType !== 'ALL') url += '?type=' + filterType

            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                setItems(data)
            }
        } catch (error) {
            console.error('Error fetching items:', error)
        }
        setLoading(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        let data = { itemName, type, description, location, contactName, contactPhone }

        try {
            const response = await fetch('/api/lost-found', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (response.ok) {
                toast.success('Item posted successfully!')
                setShowForm(false)
                setItemName(''); setDescription(''); setLocation(''); setContactName(''); setContactPhone('')
                fetchItems()
            }
        } catch (error) {
            toast.error('Failed to post item')
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display font-bold text-2xl text-slate-800">🔎 Lost & Found</h1>
                        <p className="text-slate-500 text-sm mt-1">Help reunite people with critical lost items.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        {showForm ? '✕ Close' : '+ Report Item'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="card space-y-4 border-l-4 border-l-amber-500 animate-slide-down">
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={type === 'LOST'} onChange={() => setType('LOST')} className="w-4 h-4" />
                                <span className="font-medium text-red-600">I Lost Something</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={type === 'FOUND'} onChange={() => setType('FOUND')} className="w-4 h-4" />
                                <span className="font-medium text-emerald-600">I Found Something</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Item Name</label>
                                <input value={itemName} onChange={e => setItemName(e.target.value)} className="input" placeholder="e.g., Asthma Medication, Blue Backpack" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Location</label>
                                <input value={location} onChange={e => setLocation(e.target.value)} className="input" placeholder="Where it was lost/found" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input min-h-[60px] resize-none" placeholder="Details, colors, distinguishing marks..." required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Contact Name</label>
                                <input value={contactName} onChange={e => setContactName(e.target.value)} className="input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Contact Phone</label>
                                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="input" required />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary w-full">Post Item</button>
                    </form>
                )}

                <div className="flex gap-2">
                    <button onClick={() => setFilterType('ALL')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterType === 'ALL' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'bg-white/50 text-slate-500'}`}>All Items</button>
                    <button onClick={() => setFilterType('LOST')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterType === 'LOST' ? 'bg-red-100 text-red-700 shadow-sm' : 'bg-white/50 text-slate-500'}`}>Lost Only</button>
                    <button onClick={() => setFilterType('FOUND')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterType === 'FOUND' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'bg-white/50 text-slate-500'}`}>Found Only</button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map(item => (
                            <div key={item.id} className={`card border-l-4 ${item.type === 'LOST' ? 'border-l-red-400' : 'border-l-emerald-400'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-display font-semibold text-slate-800">{item.itemName}</h3>
                                    <span className={`badge text-[10px] ${item.type === 'LOST' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                        {item.type}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mb-3">{item.description}</p>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500">📍 {item.location}</p>
                                    <p className="text-xs text-slate-500">👤 {item.contactName}</p>
                                    <p className="text-xs font-mono font-medium text-teal-700">📞 {item.contactPhone}</p>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3">{formatDate(item.createdAt)}</p>
                            </div>
                        ))}
                        {items.length === 0 && <p className="text-slate-400">No items reported.</p>}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}