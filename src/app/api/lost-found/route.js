import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')

        let whereClause = {}
        if (type && type !== 'ALL') {
            whereClause.type = type
        }

        const items = await prisma.lostFoundItem.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const item = await prisma.lostFoundItem.create({
            data: {
                itemName: body.itemName,
                type: body.type,
                description: body.description,
                location: body.location,
                contactName: body.contactName,
                contactPhone: body.contactPhone,
            },
        })
        return NextResponse.json(item, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
    }
}