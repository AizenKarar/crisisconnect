import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        const body = await request.json()

        const feedback = await prisma.feedback.create({
            data: {
                userName: session?.user?.name || 'Anonymous User',
                userEmail: session?.user?.email || 'No email provided',
                type: body.type,
                message: body.message,
            },
        })

        return NextResponse.json(feedback, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }
}