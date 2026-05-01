// src/app/page.js
'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10">
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/25">C</div>
            <span className="font-display font-bold text-slate-800 text-xl">Crisis<span className="text-teal-600">Connect</span></span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">Sign In</Link>
                <Link href="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-8 pt-16 pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 mb-8 animate-fade-in">
              <span className="pulse-dot" />
              <span className="text-red-500 text-sm font-medium">Live Emergency Coordination System</span>
            </div>
            <h1 className="font-display font-extrabold text-5xl md:text-7xl text-slate-800 leading-[1.1] tracking-tight animate-slide-up">
              When Every Second<br />
              <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">Counts</span>
            </h1>
            <p className="text-slate-500 text-lg md:text-xl mt-8 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Real-time disaster intelligence, volunteer coordination, and emergency response — all in one platform. Built to save lives.
            </p>
            <div className="flex flex-wrap gap-4 mt-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href={session ? '/dashboard' : '/register'} className="btn-primary text-lg px-8 py-3.5">
                {session ? 'Open Dashboard' : 'Join the Network'}
              </Link>
              <Link href="/incidents/report" className="btn-danger text-lg px-8 py-3.5 flex items-center gap-2">🚨 Report a Crisis</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
            {[
              { icon: '🗺️', title: 'Live Geospatial Map', desc: 'Real-time incident pins, heatmaps, and multi-layer topography with satellite and terrain views.' },
              { icon: '🆘', title: 'One-Tap SOS', desc: 'Instantly broadcast your GPS location to all verified responders within a 5km radius.' },
              { icon: '🧠', title: 'Neural Skill Matching', desc: 'Algorithm matches the best volunteers to each incident based on their verified skills.' },
              { icon: '📊', title: 'Resource Tracking', desc: 'Live shelter occupancy, supply inventory, and automated resupply alerts when stocks run low.' },
              { icon: '🔍', title: 'Missing Persons', desc: 'Report and track missing persons during disasters with real-time status updates.' },
              { icon: '💝', title: 'Donation Hub', desc: 'Coordinate donations of money, food, medicine and supplies to those who need them most.' },
            ].map(function (feat, i) {
              return (
                <div key={i} className="card-hover group animate-slide-up" style={{ animationDelay: (0.3 + i * 0.08) + 's' }}>
                  <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-300">{feat.icon}</span>
                  <h3 className="font-display font-semibold text-slate-800 text-lg">{feat.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        <footer className="border-t border-teal-100 py-8 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-400">
            <span>CrisisConnect 470 — CSE 470 Project</span>
            <span>Built with Next.js, Prisma & PostgreSQL</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
