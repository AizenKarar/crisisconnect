// src/app/api/tasks/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const assignee = searchParams.get('assignee')
    const where = {}
    if (status) where.status = status
    if (assignee === 'me') {
      const session = await getServerSession(authOptions)
      if (session) where.assigneeId = session.user.id
    }
    const tasks = await prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        assignee: { select: { id: true, name: true, role: true } },
        incident: { select: { id: true, title: true } },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority || 'MEDIUM',
        category: body.category || 'OTHER',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        location: body.location || null,
        createdById: session.user.id,
        assigneeId: body.assigneeId || null,
        incidentId: body.incidentId || null,
      },
    })
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, status, assigneeId } = await req.json()
    const data = {}
    if (status) data.status = status
    if (assigneeId !== undefined) data.assigneeId = assigneeId
    const task = await prisma.task.update({ where: { id }, data })
    if (status === 'DONE') {
      await prisma.user.update({ where: { id: session.user.id }, data: { karmaPoints: { increment: 5 } } })
    }
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
