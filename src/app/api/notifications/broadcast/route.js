import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { title, message } = await request.json()

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message required' }, { status: 400 })
    }

    const users = await prisma.user.findMany({ select: { id: true } })

    await prisma.notification.createMany({
      data: users.map((u) => ({
        title: `🚨 ${title}`,
        message: message,
        type: 'BROADCAST',
        userId: u.id,
      })),
    })

    await prisma.auditLog.create({
      data: {
        action: 'MASS_BROADCAST',
        details: `Global Dashboard Banner Broadcast: "${title}" sent to ${users.length} users.`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, totalUsers: users.length })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}