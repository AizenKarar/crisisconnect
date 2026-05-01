// src/app/api/donations/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/donations — fetch all donations with optional filters
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where = {}
    if (type) where.type = type
    if (status) where.status = status

    const donations = await prisma.donation.findMany({
      where,
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Compute summary stats
    const totalMoney = donations
      .filter((d) => d.type === 'MONEY' && d.amount)
      .reduce((sum, d) => sum + d.amount, 0)
    const totalItems = donations
      .filter((d) => d.type !== 'MONEY' && d.quantity)
      .reduce((sum, d) => sum + d.quantity, 0)
    const totalDonors = new Set(donations.map((d) => d.donorName)).size

    return NextResponse.json({
      donations,
      stats: {
        totalMoney,
        totalItems,
        totalDonors,
        totalDonations: donations.length,
        pledged: donations.filter((d) => d.status === 'PLEDGED').length,
        received: donations.filter((d) => d.status === 'RECEIVED').length,
        distributed: donations.filter((d) => d.status === 'DISTRIBUTED').length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 })
  }
}

// POST /api/donations — create a new donation
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const { donorName, donorEmail, donorPhone, type, amount, itemName, quantity, unit, message } = body

    if (!donorName || !type) {
      return NextResponse.json({ error: 'Donor name and type are required' }, { status: 400 })
    }

    if (type === 'MONEY' && (!amount || amount <= 0)) {
      return NextResponse.json({ error: 'Amount is required for money donations' }, { status: 400 })
    }

    if (type !== 'MONEY' && (!itemName || !quantity)) {
      return NextResponse.json({ error: 'Item name and quantity are required' }, { status: 400 })
    }

    const donation = await prisma.donation.create({
      data: {
        donorName,
        donorEmail: donorEmail || null,
        donorPhone: donorPhone || null,
        type,
        amount: type === 'MONEY' ? parseFloat(amount) : null,
        itemName: type !== 'MONEY' ? itemName : null,
        quantity: type !== 'MONEY' ? parseInt(quantity) : null,
        unit: type !== 'MONEY' ? (unit || 'items') : null,
        message: message || null,
        userId: session?.user?.id || null,
      },
    })

    // Create audit log
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          action: 'DONATION_RECEIVED',
          details: type === 'MONEY'
            ? `Monetary donation of ৳${amount} pledged by ${donorName}.`
            : `Donation of ${quantity} ${unit || 'items'} (${itemName}) pledged by ${donorName}.`,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 })
  }
}

// PATCH /api/donations — update donation status
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['STAFF', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Only staff/admin can update status' }, { status: 403 })
    }

    const { id, status } = await req.json()
    if (!id || !['PLEDGED', 'RECEIVED', 'DISTRIBUTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const donation = await prisma.donation.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(donation)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
