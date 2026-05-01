// src/app/api/incidents/[id]/status/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { status } = await request.json()
    const oldIncident = await prisma.incident.findUnique({ where: { id: params.id } })

    const incident = await prisma.incident.update({
      where: { id: params.id },
      data: { status },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'STATUS_CHANGED',
        details: `Status changed from ${oldIncident.status} to ${status}`,
        incidentId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(incident)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
