// src/app/api/contacts/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const where = category ? { category } : {}
    const contacts = await prisma.emergencyContact.findMany({ where, orderBy: { name: 'asc' } })
    return NextResponse.json(contacts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only staff/admin can add contacts' }, { status: 403 })
    }
    const body = await req.json()
    const contact = await prisma.emergencyContact.create({ data: body })
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}
