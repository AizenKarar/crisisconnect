
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import SOSButton from './SOSButton'
import NotificationBell from './NotificationBell'

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(function () {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 animate-pulse" />
          <p className="text-teal-600/60 text-sm">Loading CrisisConnect...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="pt-24 min-h-screen">
        <div className="sticky top-16 z-30 glass border-b border-white/40 px-6 py-2.5 flex items-center justify-end gap-3">
          <NotificationBell />
          <SOSButton />
        </div>
        <div className="p-6 sm:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
