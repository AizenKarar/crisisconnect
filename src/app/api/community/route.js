// src/app/api/community/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const posts = await prisma.communityPost.findMany({
      include: {
        author: { select: { id: true, name: true, role: true, image: true } },
        comments: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { comments: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Must be logged in' }, { status: 401 })
    const { title, content, category, commentOnPostId } = await req.json()

    // If commentOnPostId, add a comment
    if (commentOnPostId) {
      const comment = await prisma.postComment.create({
        data: { content, postId: commentOnPostId, authorId: session.user.id },
        include: { author: { select: { id: true, name: true, role: true } } },
      })
      return NextResponse.json(comment, { status: 201 })
    }

    // Otherwise create a new post
    const post = await prisma.communityPost.create({
      data: { title, content, category: category || 'UPDATE', authorId: session.user.id },
      include: { author: { select: { id: true, name: true, role: true } }, comments: true },
    })
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
