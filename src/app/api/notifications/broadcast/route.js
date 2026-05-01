// src/app/api/notifications/broadcast/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const { title, message } = await request.json()

    // Send to ALL users
    const users = await prisma.user.findMany({ select: { id: true } })

    await prisma.notification.createMany({
      data: users.map((u) => ({
        title: `🚨 ${title}`,
        message,
        type: 'ALERT',
        userId: u.id,
      })),
    })

    await prisma.auditLog.create({
      data: {
        action: 'MASS_BROADCAST',
        details: `Admin broadcast: ${title}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, count: users.length })
  } catch (error) {
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 })
  }
}
