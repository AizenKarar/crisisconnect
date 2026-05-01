// src/app/api/users/leaderboard/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ['VOLUNTEER'] } },
      select: {
        id: true,
        name: true,
        role: true,
        skills: true,
        karmaPoints: true,
        image: true,
        _count: {
          select: { incidents: true },
        },
      },
      orderBy: { karmaPoints: 'desc' },
      take: 20,
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
