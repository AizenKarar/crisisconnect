// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { name, email, password, role, skills } = await request.json()

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: ['CITIZEN', 'VOLUNTEER'].includes(role) ? role : 'CITIZEN',
        skills: skills || null,
      },
    })

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
