// src/app/api/assignments/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET — fetch all volunteers, incidents, and current assignments
export async function GET() {
  try {
    // Get all volunteers
    const volunteers = await prisma.user.findMany({
      where: { role: { in: ['VOLUNTEER', 'RESPONDER'] } },
      select: {
        id: true, name: true, email: true, role: true, skills: true, karmaPoints: true, isVerified: true, phone: true,
        _count: { select: { assignments: true } },
      },
      orderBy: { karmaPoints: 'desc' },
    })

    // Get active incidents
    const incidents = await prisma.incident.findMany({
      where: { status: { in: ['PENDING', 'VERIFIED', 'RESPONDING'] } },
      select: {
        id: true, title: true, type: true, severity: true, status: true, address: true, createdAt: true,
        assignments: {
          include: { user: { select: { id: true, name: true, role: true, skills: true } } },
        },
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get all assignments
    const assignments = await prisma.volunteerAssignment.findMany({
      include: {
        user: { select: { id: true, name: true, role: true, skills: true } },
        incident: { select: { id: true, title: true, type: true, severity: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ volunteers, incidents, assignments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST — assign a volunteer to an incident
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only admin/staff can assign' }, { status: 403 })
    }
    const { userId, incidentId, notes } = await req.json()
    if (!userId || !incidentId) {
      return NextResponse.json({ error: 'Volunteer and incident are required' }, { status: 400 })
    }

    // Check if already assigned
    const existing = await prisma.volunteerAssignment.findFirst({
      where: { userId, incidentId },
    })
    if (existing) {
      return NextResponse.json({ error: 'Volunteer already assigned to this incident' }, { status: 409 })
    }

    const assignment = await prisma.volunteerAssignment.create({
      data: {
        userId,
        incidentId,
        notes: notes || null,
        status: 'ASSIGNED',
      },
      include: {
        user: { select: { id: true, name: true } },
        incident: { select: { id: true, title: true } },
      },
    })

    // Notify the volunteer
    await prisma.notification.create({
      data: {
        title: '🎯 New Assignment',
        message: `You have been assigned to incident: "${assignment.incident.title}". ${notes || ''}`,
        type: 'INFO',
        userId,
      },
    })

    // Award karma
    await prisma.user.update({
      where: { id: userId },
      data: { karmaPoints: { increment: 5 } },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'VOLUNTEER_ASSIGNED',
        details: `${assignment.user.name} assigned to "${assignment.incident.title}" by ${session.user.name}.`,
        userId: session.user.id,
        incidentId,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to assign' }, { status: 500 })
  }
}

// PATCH — update assignment status
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, status } = await req.json()
    if (!id || !['ASSIGNED', 'ACCEPTED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const assignment = await prisma.volunteerAssignment.update({
      where: { id },
      data: { status },
    })
    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: assignment.userId },
        data: { karmaPoints: { increment: 15 } },
      })
    }
    return NextResponse.json(assignment)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
