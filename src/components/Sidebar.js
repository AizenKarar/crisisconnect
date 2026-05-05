// src/components/Sidebar.js
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

// Row 1: Main navigation (all users)
var mainNav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Live Map', href: '/map' },
  { label: 'Incidents', href: '/incidents' },
  { label: 'Report', href: '/incidents/report' },
  { label: 'Missing', href: '/missing' },
  { label: 'Blood Registry', href: '/blood-registry' },
  { label: 'Lost & Found', href: '/lost-found' },
  { label: 'Shelters', href: '/shelters' },
  { label: 'Donations', href: '/donations' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Community', href: '/community' },
  { label: 'Profile', href: '/profile' },
]

// Row 2: Role-specific items
var roleNav = [
  { label: 'Tasks', href: '/tasks', roles: ['VOLUNTEER', 'STAFF', 'ADMIN'] },
  { label: 'Supply Requests', href: '/supply-requests', roles: ['STAFF', 'ADMIN'] },
  { label: 'Analytics', href: '/analytics', roles: ['ADMIN'] },
  { label: 'Area Alerts', href: '/admin/area-alerts', roles: ['ADMIN'] },
  { label: 'Broadcast', href: '/admin/broadcast', roles: ['ADMIN'] },
]


var mobileNav = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Live Map', href: '/map', icon: '🗺️' },
  { label: 'Incidents', href: '/incidents', icon: '🚨' },
  { label: 'Report Incident', href: '/incidents/report', icon: '📝' },
  { label: 'Missing Persons', href: '/missing', icon: '🔍' },
  { label: 'Shelters', href: '/shelters', icon: '🏠' },
  { label: 'Donations', href: '/donations', icon: '💝' },
  { label: 'Emergency Contacts', href: '/contacts', icon: '📞' },
  { label: 'Community Board', href: '/community', icon: '💬' },
  { label: 'Tasks', href: '/tasks', icon: '📋', roles: ['VOLUNTEER', 'STAFF', 'ADMIN'] },
  { label: 'Supply Requests', href: '/supply-requests', icon: '📦', roles: ['STAFF', 'ADMIN'] },
  { label: 'Analytics', href: '/analytics', icon: '📈', roles: ['ADMIN'] },
  { label: 'Area Alerts', href: '/admin/area-alerts', icon: '📡', roles: ['ADMIN'] },
  { label: 'Broadcast', href: '/admin/broadcast', icon: '🔊', roles: ['ADMIN'] },
  { label: 'Profile', href: '/profile', icon: '👤' },
]

export default function Sidebar() {
  // Get the current page URL path
  var pathname = usePathname()

  // Get the logged-in user session
  var sessionData = useSession()
  var session = sessionData.data


  var [mobileOpen, setMobileOpen] = useState(false)

  // Get user role safely
  var userRole = 'CITIZEN'
  if (session && session.user && session.user.role) {
    userRole = session.user.role
  }

  // Get user name safely
  var userName = ''
  var userInitial = '?'
  if (session && session.user) {
    userName = session.user.name || ''
    if (userName.length > 0) {
      userInitial = userName[0]
    }
  }

  // Filter role nav items based on user role
  var filteredRoleNav = []
  for (var i = 0; i < roleNav.length; i++) {
    if (roleNav[i].roles.includes(userRole)) {
      filteredRoleNav.push(roleNav[i])
    }
  }

  // Filter mobile nav items based on user role
  var filteredMobileNav = []
  for (var i = 0; i < mobileNav.length; i++) {
    var item = mobileNav[i]
    // Items without roles are shown to everyone
    if (!item.roles || item.roles.includes(userRole)) {
      filteredMobileNav.push(item)
    }
  }

  // Check if second row should be shown
  var hasSecondRow = filteredRoleNav.length > 0

  // Check if a link is the current active page
  function isActive(href) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Handle sign out
  function handleSignOut() {
    signOut({ callbackUrl: '/' })
  }

  // Toggle mobile menu
  function toggleMobile() {
    setMobileOpen(!mobileOpen)
  }

  // Close mobile menu (when a link is clicked)
  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Row 1: Logo + Main Nav + User */}
      <div className="glass border-b border-white/40 shadow-sm shadow-teal-100/30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-500/25">
                C
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-slate-800 text-base leading-tight">
                  Crisis<span className="text-teal-600">Connect</span>
                </h1>
              </div>
            </Link>

            {/* Desktop Main Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              {mainNav.map(function (navItem) {
                var linkStyle = 'text-slate-500 hover:text-teal-700 hover:bg-white/50'
                if (isActive(navItem.href)) {
                  linkStyle = 'text-teal-700 bg-teal-50/80 border border-teal-200/60 shadow-sm'
                }
                return (
                  <Link key={navItem.href} href={navItem.href}
                    className={'px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ' + linkStyle}>
                    {navItem.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {session && session.user && (
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm">
                    {userInitial}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">{userName}</p>
                    <p className="text-[10px] text-teal-600/70 font-medium">{userRole}</p>
                  </div>
                  <button onClick={handleSignOut}
                    className="ml-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200">
                    Logout
                  </button>
                </div>
              )}
              <button onClick={toggleMobile}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-white/50 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Role-specific nav */}
      {hasSecondRow && (
        <div className="hidden lg:block bg-white/40 backdrop-blur-lg border-b border-white/30">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center gap-1 h-9">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-2">{userRole}:</span>
              {filteredRoleNav.map(function (navItem) {
                var linkStyle = 'text-slate-500 hover:text-teal-700 hover:bg-white/60'
                if (isActive(navItem.href)) {
                  linkStyle = 'text-teal-700 bg-teal-100/80 border border-teal-200/60 shadow-sm'
                }
                return (
                  <Link key={navItem.href} href={navItem.href}
                    className={'px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ' + linkStyle}>
                    {navItem.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/40 bg-white/90 backdrop-blur-xl animate-slide-down max-h-[80vh] overflow-y-auto">
          <nav className="px-4 py-3 space-y-1">
            {filteredMobileNav.map(function (navItem) {
              var linkStyle = 'text-slate-500 hover:text-teal-700 hover:bg-white/50'
              if (isActive(navItem.href)) {
                linkStyle = 'text-teal-700 bg-teal-50 border border-teal-200/60'
              }
              return (
                <Link key={navItem.href} href={navItem.href} onClick={closeMobile}
                  className={'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ' + linkStyle}>
                  <span className="text-lg">{navItem.icon}</span>
                  <span>{navItem.label}</span>
                </Link>
              )
            })}
          </nav>
          {session && session.user && (
            <div className="px-4 py-3 border-t border-white/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-xs font-bold text-white">
                  {userInitial}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{userName}</p>
                  <p className="text-[10px] text-teal-600/70">{userRole}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors">Logout</button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
