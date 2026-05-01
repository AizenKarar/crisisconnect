// src/app/api/sos/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateDistance } from '@/lib/utils'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Must be logged in' }, { status: 401 })

    const { latitude, longitude, message } = await request.json()

    // Create SOS incident
    const incident = await prisma.incident.create({
      data: {
        title: `🆘 SOS from ${session.user.name}`,
        description: message || 'Emergency SOS signal sent. Immediate help needed.',
        type: 'OTHER',
        severity: 'CRITICAL',
        status: 'VERIFIED', // SOS is auto-verified
        latitude,
        longitude,
        reporterId: session.user.id,
      },
    })

    // Notify all nearby staff and admins (within 5km radius)
    const responders = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'ADMIN'] }, isVerified: true },
    })

    // In a real app you'd check proximity with stored locations
    // For now, notify all responders
    await prisma.notification.createMany({
      data: responders.map((r) => ({
        title: '🆘 SOS ALERT',
        message: `Emergency SOS from ${session.user.name}! Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        type: 'SOS',
        userId: r.id,
      })),
    })

    await prisma.auditLog.create({
      data: {
        action: 'SOS_BROADCAST',
        details: `SOS triggered by ${session.user.name}`,
        incidentId: incident.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, incidentId: incident.id })
  } catch (error) {
    return NextResponse.json({ error: 'SOS failed' }, { status: 500 })
  }
}
