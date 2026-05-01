// src/app/api/training/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const where = { isPublished: true }
    if (category) where.category = category

    const resources = await prisma.trainingResource.findMany({
      where,
      include: {
        progress: session?.user?.id ? { where: { userId: session.user.id } } : false,
        _count: { select: { progress: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(resources)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { resourceId, status, score } = await req.json()

    const progress = await prisma.trainingProgress.upsert({
      where: { userId_resourceId: { userId: session.user.id, resourceId } },
      update: {
        status,
        score: score || undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
      create: {
        userId: session.user.id,
        resourceId,
        status,
        score: score || null,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    })

    // Award karma for completion
    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { karmaPoints: { increment: 10 } },
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
