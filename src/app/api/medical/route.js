// src/app/api/medical/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const condition = searchParams.get('condition')
    const where = {}
    if (status) where.status = status
    if (condition) where.condition = condition
    const logs = await prisma.medicalLog.findMany({
      where,
      include: {
        loggedBy: { select: { id: true, name: true, role: true } },
        incident: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const log = await prisma.medicalLog.create({
      data: {
        patientName: body.patientName,
        patientAge: body.patientAge ? parseInt(body.patientAge) : null,
        patientGender: body.patientGender || null,
        condition: body.condition,
        severity: body.severity,
        treatment: body.treatment,
        shelterName: body.shelterName || null,
        location: body.location || null,
        notes: body.notes || null,
        loggedById: session.user.id,
        incidentId: body.incidentId || null,
      },
    })
    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, status, notes } = await req.json()
    const data = {}
    if (status) data.status = status
    if (notes) data.notes = notes
    const log = await prisma.medicalLog.update({ where: { id }, data })
    return NextResponse.json(log)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
