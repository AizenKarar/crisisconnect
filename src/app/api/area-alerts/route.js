// src/app/api/area-alerts/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmergencyEmail } from '@/lib/mailer'

export async function GET() {
  try {
    const alerts = await prisma.areaAlert.findMany({
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(alerts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admin can create area alerts' }, { status: 403 })
    }
    const body = await req.json()
    if (!body.title || !body.message || !body.targetArea) {
      return NextResponse.json({ error: 'Title, message, and target area are required' }, { status: 400 })
    }

    // Create the area alert
    const alert = await prisma.areaAlert.create({
      data: {
        title: body.title,
        message: body.message,
        alertType: body.alertType || 'EMERGENCY',
        severity: body.severity || 'HIGH',
        targetArea: body.targetArea,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        radiusKm: body.radiusKm ? parseFloat(body.radiusKm) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        createdById: session.user.id,
      },
    })

    // Fetch users (NOW INCLUDING EMAIL)
    const users = await prisma.user.findMany({ select: { id: true, email: true } })

    // Create In-App Notifications
    await prisma.notification.createMany({
      data: users.map((u) => ({
        title: `🚨 [${body.targetArea}] ${body.title}`,
        message: body.message.substring(0, 200) + (body.message.length > 200 ? '...' : ''),
        type: 'ALERT',
        userId: u.id,
      })),
    })

    // --- NEW: SEND EMAILS ---
    const emailSubject = `🚨 EMERGENCY ALERT: ${body.title} in ${body.targetArea}`;
    const emailText = `An area alert has been issued for ${body.targetArea}.\n\nSeverity: ${body.severity}\nType: ${body.alertType}\n\nMessage:\n${body.message}\n\nStay safe,\nCrisisConnect Team`;

    // Send emails without crashing the app if one fails
    const emailPromises = users
      .filter((u) => u.email)
      .map((u) => sendEmergencyEmail(u.email, emailSubject, emailText));

    await Promise.allSettled(emailPromises);
    // ------------------------

    // Update recipient count
    await prisma.areaAlert.update({
      where: { id: alert.id },
      data: { recipientCount: users.length },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'AREA_ALERT_SENT',
        details: `Area alert "${body.title}" sent to ${body.targetArea}. ${users.length} recipients notified via app and email.`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ ...alert, recipientCount: users.length }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admin' }, { status: 403 })
    }
    const { id, isActive } = await req.json()
    const alert = await prisma.areaAlert.update({
      where: { id },
      data: { isActive },
    })
    return NextResponse.json(alert)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
