// src/app/layout.js
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'CrisisConnect 470 — Emergency Response Platform',
  description: 'Real-time disaster management and emergency coordination system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                color: '#334155',
                border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: '0.75rem',
                boxShadow: '0 8px 32px rgba(0,128,128,0.08)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
