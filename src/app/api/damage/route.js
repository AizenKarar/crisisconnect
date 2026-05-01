// src/app/api/damage/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const severity = searchParams.get('severity')
    const where = {}
    if (category) where.category = category
    if (severity) where.severity = severity
    const reports = await prisma.damageAssessment.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        incident: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    const totalCost = reports.reduce((s, r) => s + (r.estimatedCost || 0), 0)
    return NextResponse.json({ reports, totalCost })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const report = await prisma.damageAssessment.create({
      data: {
        title: body.title, description: body.description, category: body.category,
        severity: body.severity, address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        estimatedCost: body.estimatedCost ? parseFloat(body.estimatedCost) : null,
        notes: body.notes || null, reporterId: session.user.id,
        incidentId: body.incidentId || null,
      },
    })
    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN', 'RESPONDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    const { id, status } = await req.json()
    const report = await prisma.damageAssessment.update({ where: { id }, data: { status } })
    return NextResponse.json(report)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
