import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Must be logged in' }, { status: 401 })

    const { latitude, longitude, address, message } = await request.json()

    const incident = await prisma.incident.create({
      data: {
        title: `🆘 SOS from ${session.user.name}`,
        description: message || 'Emergency SOS signal sent. Immediate help needed.',
        type: 'OTHER',
        severity: 'CRITICAL',
        status: 'VERIFIED',
        latitude,
        longitude,
        address: address || null,
        reporterId: session.user.id,
      },
    })

    const responders = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'ADMIN'] }, isVerified: true },
    })

    await prisma.notification.createMany({
      data: responders.map((r) => ({
        title: '🆘 SOS ALERT',
        message: `Emergency SOS from ${session.user.name}! Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}${address ? ` - ${address}` : ''}`,
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