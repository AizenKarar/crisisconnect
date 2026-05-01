// src/app/login/page.js
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  // State for form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Handle form submission
  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    // Try to sign in with the given email and password
    const result = await signIn('credentials', {
      email: email,
      password: password,
      redirect: false,
    })

    // Check if sign-in was successful
    if (result && result.error) {
      toast.error('Invalid email or password')
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
    }

    setLoading(false)
  }

  // Function to fill in demo account credentials
  function fillDemoAccount(demoEmail, demoPassword) {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  // Demo accounts list
  const demoAccounts = [
    { email: 'admin@crisisconnect.org', role: 'Admin', pw: 'admin123' },
    { email: 'staff@crisisconnect.org', role: 'Staff', pw: 'user123' },
    { email: 'volunteer@crisisconnect.org', role: 'Volunteer', pw: 'user123' },
    { email: 'citizen@crisisconnect.org', role: 'Citizen', pw: 'user123' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/25">C</div>
          </Link>
          <h1 className="font-display font-bold text-3xl text-slate-800">Welcome back</h1>
          <p className="text-slate-500 mt-2">Sign in to CrisisConnect</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Email</label>
            <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Password</label>
            <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} className="input" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account? <Link href="/register" className="text-teal-600 hover:text-teal-500 font-medium">Register</Link>
        </p>

        <div className="mt-8 card bg-white/40">
          <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">Demo Accounts</p>
          <div className="space-y-2">
            {demoAccounts.map(function (account) {
              return (
                <button key={account.email} type="button" onClick={function () { fillDemoAccount(account.email, account.pw) }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-white/50 hover:bg-white/80 text-xs text-slate-500 transition-colors flex justify-between border border-white/60">
                  <span>{account.email}</span>
                  <span className="text-teal-600 font-medium">{account.role}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
