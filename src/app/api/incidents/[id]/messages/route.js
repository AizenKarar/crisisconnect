// src/app/api/incidents/[id]/messages/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET messages for an incident
export async function GET(request, { params }) {
  try {
    const messages = await prisma.message.findMany({
      where: { incidentId: params.id },
      include: { user: { select: { name: true, role: true, image: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST new message
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await request.json()

    const message = await prisma.message.create({
      data: {
        content,
        incidentId: params.id,
        userId: session.user.id,
      },
      include: { user: { select: { name: true, role: true } } },
    })

    // Optional: Trigger Pusher event here for real-time
    // await pusher.trigger(`incident-${params.id}`, 'new-message', message)

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
