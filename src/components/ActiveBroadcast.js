'use client'
import { useState, useEffect } from 'react'

export default function ActiveBroadcast() {
    const [broadcast, setBroadcast] = useState(null)

    useEffect(() => {
        async function checkBroadcast() {
            try {
                const res = await fetch('/api/notifications')
                if (res.ok) {
                    const data = await res.json()
                    const recent = data.find(n => n.type === 'BROADCAST' || n.title.includes('🚨'))

                    if (recent) {
                        const now = new Date()
                        const broadcastTime = new Date(recent.createdAt)
                        const diffInMinutes = (now - broadcastTime) / (1000 * 60)
                        if (diffInMinutes < 1) {
                            setBroadcast(recent)
                        } else {
                            setBroadcast(null)
                        }
                    }
                }
            } catch (error) {
            }
        }

        checkBroadcast()

        const interval = setInterval(checkBroadcast, 30000)
        return () => clearInterval(interval)
    }, [])

    if (!broadcast) return null

    return (
        <div className="bg-red-600 rounded-2xl p-6 mb-6 text-white shadow-[0_0_40px_rgba(220,38,38,0.6)] border-4 border-red-400 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-5">
                <div className="text-5xl">🚨</div>
                <div>
                    <p className="text-red-200 text-xs font-black uppercase tracking-widest mb-1">Emergency Broadcast</p>
                    <h2 className="text-3xl font-black font-display uppercase">{broadcast.title.replace('🚨 ', '')}</h2>
                    <p className="text-red-50 text-lg mt-2 font-medium">{broadcast.message}</p>
                </div>
            </div>
        </div>
    )
}