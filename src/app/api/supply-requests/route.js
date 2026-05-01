// src/app/api/supply-requests/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const requests = await prisma.supplyRequest.findMany({
      include: {
        requester: { select: { id: true, name: true, role: true } },
        approvedBy: { select: { id: true, name: true } },
        fromShelter: { select: { id: true, name: true, address: true } },
        toShelter: { select: { id: true, name: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only staff/admin can request supplies' }, { status: 403 })
    }
    const body = await req.json()
    if (!body.itemName || !body.category || !body.quantity || !body.fromShelterId || !body.toShelterId || !body.reason) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 })
    }
    const request = await prisma.supplyRequest.create({
      data: {
        itemName: body.itemName,
        category: body.category,
        quantity: parseInt(body.quantity),
        unit: body.unit || 'items',
        urgency: body.urgency || 'MEDIUM',
        reason: body.reason,
        requesterId: session.user.id,
        fromShelterId: body.fromShelterId,
        toShelterId: body.toShelterId,
      },
    })

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        title: '📦 New Supply Request',
        message: `${session.user.name} requested ${body.quantity} ${body.unit} of ${body.itemName} (${body.urgency})`,
        type: 'RESUPPLY',
        userId: a.id,
      })),
    })

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only admin can approve/reject' }, { status: 403 })
    }
    const { id, status, notes } = await req.json()
    if (!id || !['APPROVED', 'IN_TRANSIT', 'DELIVERED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const data = { status, approvedById: session.user.id }
    if (notes) data.notes = notes

    const request = await prisma.supplyRequest.update({
      where: { id },
      data,
      include: { requester: { select: { id: true, name: true } } },
    })

    // Notify the requester
    await prisma.notification.create({
      data: {
        title: `Supply Request ${status}`,
        message: `Your request for ${request.itemName} has been ${status.toLowerCase()}.${notes ? ' Note: ' + notes : ''}`,
        type: 'INFO',
        userId: request.requester.id,
      },
    })

    return NextResponse.json(request)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
