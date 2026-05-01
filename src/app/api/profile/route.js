// src/app/api/profile/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        skills: true, bio: true, address: true, isVerified: true,
        karmaPoints: true, createdAt: true,
        _count: {
          select: {
            incidents: true, messages: true,
            donations: true, missingReports: true, communityPosts: true,
          },
        },
      },
    })

    // Get recent activity
    const recentAudit = await prisma.auditLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { incident: { select: { title: true } } },
    })

    return NextResponse.json({ user, recentActivity: recentAudit })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, phone, skills, bio, address } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(skills !== undefined && { skills }),
        ...(bio !== undefined && { bio }),
        ...(address !== undefined && { address }),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, skills: true, bio: true, address: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
