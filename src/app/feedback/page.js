'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

export default function FeedbackPage() {
    const [type, setType] = useState('BUG')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, message }),
            })

            if (response.ok) {
                toast.success('Thank you! Your feedback has been sent.')
                setMessage('')
            } else {
                toast.error('Failed to send feedback.')
            }
        } catch (error) {
            toast.error('Network error.')
        }

        setLoading(false)
    }

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="font-display font-bold text-2xl text-slate-800">💡 App Feedback</h1>
                    <p className="text-slate-500 text-sm mt-1">Help us improve CrisisConnect by reporting bugs or requesting features.</p>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">What kind of feedback is this?</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={type === 'BUG'} onChange={() => setType('BUG')} className="w-4 h-4 text-red-600" />
                                <span className="font-medium text-slate-700">Report a Bug</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={type === 'FEATURE'} onChange={() => setType('FEATURE')} className="w-4 h-4 text-teal-600" />
                                <span className="font-medium text-slate-700">Suggest a Feature</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={type === 'GENERAL'} onChange={() => setType('GENERAL')} className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-slate-700">General Comment</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Your Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="input min-h-[150px] resize-y"
                            placeholder="Describe the issue or feature request in detail..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    )
}