import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id]/capabilities - Get user capabilities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params

    // Users can only view their own capabilities unless they're admin
    if ((session.user as any)?.id !== userId && (session.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            capabilities: {
              where: {
                isGranted: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Extract capabilities from role
    const capabilities = user.role?.capabilities?.map(rc => rc.capability) || []

    return NextResponse.json({
      userId: user.id,
      roleId: user.role?.id,
      roleName: user.role?.name,
      capabilities
    })
  } catch (error) {
    console.error('Error fetching user capabilities:', error)
    return NextResponse.json({ error: 'Failed to fetch user capabilities' }, { status: 500 })
  }
}
