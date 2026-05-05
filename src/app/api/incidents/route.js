import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')

    const where = {}
    if (type) where.type = type
    if (severity) where.severity = severity
    if (status) where.status = status

    // THE FIX: Normal users see all incidents EXCEPT other people's SOS broadcasts.
    if (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF') {
      where.OR = [
        { NOT: { title: { startsWith: '🆘 SOS' } } },
        { reporterId: session.user.id }
      ]
    }

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        _count: { select: { responses: true, messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(incidents)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { title, description, type, severity, latitude, longitude, address, imageUrl } = body

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        type,
        severity,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        imageUrl,
        reporterId: session?.user?.id || null,
        isAnonymous: !session,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'INCIDENT_CREATED',
        details: `New ${type} incident: ${title}`,
        incidentId: incident.id,
        userId: session?.user?.id || null,
      },
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 })
  }
}