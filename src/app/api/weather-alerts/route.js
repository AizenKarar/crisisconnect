
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmergencyEmail } from '@/lib/mailer'

export async function GET() {
  try {
    const alerts = await prisma.weatherAlert.findMany({
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(alerts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only staff/admin can create alerts' }, { status: 403 })
    }
    const body = await req.json()
    const alert = await prisma.weatherAlert.create({
      data: {
        title: body.title,
        description: body.description,
        alertType: body.alertType,
        severity: body.severity,
        region: body.region,
        startsAt: new Date(body.startsAt),
        expiresAt: new Date(body.expiresAt),
        source: body.source || null,
        createdById: session.user.id,
      },
    })

    // --- NEW: SEND EMAILS ---
    const users = await prisma.user.findMany({ select: { email: true } })
    const emailSubject = `⛈️ WEATHER WARNING: ${body.title} (${body.region})`;
    const emailText = `A severe weather alert has been issued for ${body.region}.\n\nSeverity: ${body.severity}\nType: ${body.alertType}\n\nDetails:\n${body.description}\n\nValid until: ${new Date(body.expiresAt).toLocaleString()}\n\nStay safe,\nCrisisConnect Team`;

    const emailPromises = users
      .filter((u) => u.email)
      .map((u) => sendEmergencyEmail(u.email, emailSubject, emailText));

    await Promise.allSettled(emailPromises);

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}
