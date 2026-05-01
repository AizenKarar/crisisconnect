// src/app/api/evacuation/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const zones = await prisma.evacuationZone.findMany({ orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }] })
    return NextResponse.json(zones)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch zones' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    const body = await req.json()
    const zone = await prisma.evacuationZone.create({
      data: {
        name: body.name, description: body.description, zoneType: body.zoneType,
        priority: body.priority, region: body.region, latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude), radius: body.radius ? parseFloat(body.radius) : null,
        capacity: body.capacity ? parseInt(body.capacity) : null, instructions: body.instructions || null,
      },
    })
    return NextResponse.json(zone, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    const { id, status } = await req.json()
    const zone = await prisma.evacuationZone.update({ where: { id }, data: { status } })
    return NextResponse.json(zone)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
