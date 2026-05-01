// src/app/register/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  // Form fields stored in state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CITIZEN')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Handle form submission
  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    // Prepare the data to send to the API
    let registerData = {
      name: name,
      email: email,
      password: password,
      role: role,
      skills: skills,
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      })

      if (response.ok) {
        toast.success('Account created! Please sign in.')
        router.push('/login')
      } else {
        const data = await response.json()
        let errorMessage = 'Registration failed'
        if (data && data.error) {
          errorMessage = data.error
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/25">C</div>
          </Link>
          <h1 className="font-display font-bold text-3xl text-slate-800">Join CrisisConnect</h1>
          <p className="text-slate-500 mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Full Name</label>
            <input type="text" value={name} onChange={function (e) { setName(e.target.value) }} className="input" placeholder="Your full name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Email</label>
            <input type="email" value={email} onChange={function (e) { setEmail(e.target.value) }} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Password</label>
            <input type="password" value={password} onChange={function (e) { setPassword(e.target.value) }} className="input" placeholder="Min 6 characters" minLength={6} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-2">Role</label>
            <select value={role} onChange={function (e) { setRole(e.target.value) }} className="select">
              <option value="CITIZEN">Citizen</option>
              <option value="VOLUNTEER">Volunteer</option>
            </select>
          </div>
          {role === 'VOLUNTEER' && (
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-2">Skills (comma-separated)</label>
              <input type="text" value={skills} onChange={function (e) { setSkills(e.target.value) }} className="input" placeholder="e.g., Nurse, Truck Driver, Cooking" />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>
        <p className="text-center text-sm text-slate-500 mt-6">Already have an account? <Link href="/login" className="text-teal-600 hover:text-teal-500 font-medium">Sign in</Link></p>
      </div>
    </div>
  )
}
