import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, userType: true, updatedAt: true }
    })

    return NextResponse.json({
      session: session.user,
      dbUser,
      isAdmin: (dbUser?.userType || '').toUpperCase() === 'ADMIN'
    })
  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json({ error: 'Failed to debug user' }, { status: 500 })
  }
}





