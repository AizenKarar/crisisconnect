// src/app/api/volunteers/match/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { matchVolunteers } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN', 'RESPONDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { incidentId } = await request.json()

    const incident = await prisma.incident.findUnique({ where: { id: incidentId } })
    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    const volunteers = await prisma.user.findMany({
      where: {
        role: { in: ['VOLUNTEER', 'RESPONDER'] },
        isVerified: true,
      },
    })

    const matched = matchVolunteers(volunteers, incident)

    return NextResponse.json(matched)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to match volunteers' }, { status: 500 })
  }
}
