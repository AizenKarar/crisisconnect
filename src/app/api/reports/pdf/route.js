// src/app/api/reports/pdf/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Gather data for the report
    const [incidents, shelters, totalUsers] = await Promise.all([
      prisma.incident.findMany({
        include: {
          reporter: { select: { name: true } },
          _count: { select: { responses: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shelter.findMany({ include: { supplies: true } }),
      prisma.user.count(),
    ])

    const stats = {
      totalIncidents: incidents.length,
      critical: incidents.filter((i) => i.severity === 'CRITICAL').length,
      resolved: incidents.filter((i) => i.status === 'RESOLVED').length,
      inProgress: incidents.filter((i) => i.status === 'IN_PROGRESS').length,
      pending: incidents.filter((i) => i.status === 'PENDING').length,
      totalShelters: shelters.length,
      totalCapacity: shelters.reduce((acc, s) => acc + s.maxCapacity, 0),
      totalOccupied: shelters.reduce((acc, s) => acc + s.occupied, 0),
      totalUsers,
    }

    return NextResponse.json({ stats, incidents, shelters })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report data' }, { status: 500 })
  }
}
