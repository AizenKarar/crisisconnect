import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const group = searchParams.get('group')

        let whereClause = { isAvailable: true }
        if (group && group !== 'ALL') {
            whereClause.bloodGroup = group
        }

        const donors = await prisma.bloodRegistry.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(donors)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}


export async function POST(request) {
    try {
        const body = await request.json()
        const donor = await prisma.bloodRegistry.create({
            data: {
                donorName: body.donorName,
                bloodGroup: body.bloodGroup,
                phone: body.phone,
                location: body.location,
            },
        })
        return NextResponse.json(donor, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}