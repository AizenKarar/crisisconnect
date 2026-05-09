
'use client'
import { useState, useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  //every 30 seconds
  useEffect(function () {
    fetchNotifications()
    var interval = setInterval(fetchNotifications, 30000)
    return function () {
      clearInterval(interval)
    }
  }, [])
  useEffect(function () {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return function () {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function fetchNotifications() {
    try {
      var response = await fetch('/api/notifications')
      if (response.ok) {
        var data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
    }
  }


  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all' }),
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  function toggleDropdown() {
    setOpen(!open)
  }

  // Count unread 
  var unreadCount = 0
  for (var i = 0; i < notifications.length; i++) {
    if (!notifications[i].isRead) {
      unreadCount = unreadCount + 1
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown}
        className="relative p-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 transition-all shadow-sm">
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-teal-100/40 border border-white/60 overflow-hidden animate-slide-down z-50">
          <div className="px-4 py-3 border-b border-teal-50 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-teal-600 hover:text-teal-500 font-medium">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-slate-400 text-sm">No notifications</p>
            ) : (
              notifications.map(function (notification) {
                var bgClass = ''
                if (!notification.isRead) {
                  bgClass = 'bg-teal-50/40'
                }
                return (
                  <div key={notification.id} className={'px-4 py-3 border-b border-teal-50/50 hover:bg-teal-50/30 transition-colors ' + bgClass}>
                    <p className="text-sm font-medium text-slate-700">{notification.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDate(notification.createdAt)}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
