// src/app/api/incidents/[id]/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: {
        reporter: { select: { id: true, name: true, role: true, image: true } },
        responses: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        auditLogs: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { messages: true } },
      },
    })

    if (!incident) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(incident)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch incident' }, { status: 500 })
  }
}
