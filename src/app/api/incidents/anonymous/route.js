// src/app/api/incidents/anonymous/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Simple in-memory rate limiter (IP-based)
const rateLimitMap = new Map()
const RATE_LIMIT = 3 // max 3 reports per hour
const WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip) {
  const now = Date.now()
  const record = rateLimitMap.get(ip) || { count: 0, start: now }

  if (now - record.start > WINDOW) {
    record.count = 0
    record.start = now
  }

  record.count++
  rateLimitMap.set(ip, record)

  return record.count <= RATE_LIMIT
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { title, description, type, severity, latitude, longitude, address } = body

    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        type,
        severity,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        isAnonymous: true,
        reporterIp: ip,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'ANONYMOUS_REPORT',
        details: `Anonymous ${type} incident reported`,
        incidentId: incident.id,
      },
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
