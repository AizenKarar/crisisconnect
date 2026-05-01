// src/app/api/shelters/[id]/supplies/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const supplies = await prisma.supply.findMany({
      where: { shelterId: params.id },
    })
    return NextResponse.json(supplies)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch supplies' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const supply = await prisma.supply.create({
      data: { ...body, shelterId: params.id },
    })
    return NextResponse.json(supply, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add supply' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { supplyId, quantity } = await request.json()
    const supply = await prisma.supply.update({
      where: { id: supplyId },
      data: { quantity },
    })

    // Auto-alert if below minimum level
    if (quantity <= supply.minLevel) {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'STAFF'] } },
      })
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          title: '⚠️ Low Supply Alert',
          message: `${supply.name} at shelter is critically low (${quantity} ${supply.unit} remaining)`,
          type: 'RESUPPLY',
          userId: a.id,
        })),
      })
    }

    return NextResponse.json(supply)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update supply' }, { status: 500 })
  }
}
