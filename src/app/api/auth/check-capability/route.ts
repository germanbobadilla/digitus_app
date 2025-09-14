import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidCapability } from '@/lib/capabilities'

// POST /api/auth/check-capability - Check if user has specific capability
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { capability } = body

    if (!capability) {
      return NextResponse.json({ error: 'Capability is required' }, { status: 400 })
    }

    if (!isValidCapability(capability)) {
      return NextResponse.json({ error: 'Invalid capability' }, { status: 400 })
    }

    // Get user with role and capabilities
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
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

    // Check if user has the capability
    const hasCapability = user.role?.capabilities?.some(rc => rc.capability === capability) || false

    return NextResponse.json({
      hasCapability,
      capability,
      userId: user.id,
      roleId: user.role?.id,
      roleName: user.role?.name
    })
  } catch (error) {
    console.error('Error checking capability:', error)
    return NextResponse.json({ error: 'Failed to check capability' }, { status: 500 })
  }
}
