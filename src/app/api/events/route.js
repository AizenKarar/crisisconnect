// src/app/api/events/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const events = await prisma.event.findMany({
      include: {
        rsvps: {
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { rsvps: true } },
      },
      orderBy: { startDate: 'asc' },
    })
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()

    // If rsvpEventId, it's an RSVP
    if (body.rsvpEventId) {
      const rsvp = await prisma.eventRsvp.upsert({
        where: { userId_eventId: { userId: session.user.id, eventId: body.rsvpEventId } },
        update: { status: body.rsvpStatus || 'GOING' },
        create: { userId: session.user.id, eventId: body.rsvpEventId, status: body.rsvpStatus || 'GOING' },
      })
      return NextResponse.json(rsvp, { status: 201 })
    }

    // Otherwise create event (staff/admin only)
    if (!['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only staff/admin can create events' }, { status: 403 })
    }
    const event = await prisma.event.create({
      data: {
        title: body.title, description: body.description, eventType: body.eventType,
        startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : null,
        location: body.location, latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : null,
      },
    })
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
