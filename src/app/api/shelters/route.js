// src/app/api/shelters/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const shelters = await prisma.shelter.findMany({
      include: { supplies: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(shelters)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shelters' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const shelter = await prisma.shelter.create({ data: body })
    return NextResponse.json(shelter, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create shelter' }, { status: 500 })
  }
}
