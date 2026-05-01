// src/app/api/missing/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/missing — fetch all missing persons
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where = {}
    if (status) where.status = status

    const persons = await prisma.missingPerson.findMany({
      where,
      include: { reporter: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(persons)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch missing persons' }, { status: 500 })
  }
}

// POST /api/missing — report a missing person
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const { name, age, gender, description, lastSeenPlace, lastSeenDate, imageUrl, contactPhone, contactName, latitude, longitude } = body

    if (!name || !age || !gender || !description || !lastSeenPlace || !lastSeenDate || !contactPhone || !contactName) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 })
    }

    const person = await prisma.missingPerson.create({
      data: {
        name,
        age: parseInt(age),
        gender,
        description,
        lastSeenPlace,
        lastSeenDate: new Date(lastSeenDate),
        imageUrl: imageUrl || null,
        contactPhone,
        contactName,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        reporterId: session?.user?.id || null,
      },
    })

    // Create audit log
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          action: 'MISSING_PERSON_REPORTED',
          details: `Missing person reported: ${name}, age ${age}. Last seen at ${lastSeenPlace}.`,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}

// PATCH /api/missing — update status (found / closed)
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, status } = await req.json()
    if (!id || !['MISSING', 'FOUND', 'CLOSED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const person = await prisma.missingPerson.update({
      where: { id },
      data: { status },
    })

    await prisma.auditLog.create({
      data: {
        action: 'MISSING_PERSON_STATUS',
        details: `Missing person "${person.name}" status changed to ${status}.`,
        userId: session.user.id,
      },
    })

    return NextResponse.json(person)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
