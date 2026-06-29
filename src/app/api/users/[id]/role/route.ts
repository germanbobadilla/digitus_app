import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserCapabilities } from '@/lib/auth-utils'

// PUT /api/users/[id]/role - Assign role to user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has role management capability
    const userCapabilities = await getUserCapabilities(session.user.id)
    if (!userCapabilities.includes('can_manage_roles')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: userId } = await params
    const body = await request.json()
    const { roleId } = body

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Update user with new role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: {
        role: {
          include: {
            capabilities: true
          }
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error assigning role to user:', error)
    return NextResponse.json({ error: 'Failed to assign role to user' }, { status: 500 })
  }
}

// DELETE /api/users/[id]/role - Remove role from user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has role management capability
    const userCapabilities = await getUserCapabilities(session.user.id)
    if (!userCapabilities.includes('can_manage_roles')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: userId } = await params

    // Update user to remove role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: null },
      include: {
        role: {
          include: {
            capabilities: true
          }
        }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error removing role from user:', error)
    return NextResponse.json({ error: 'Failed to remove role from user' }, { status: 500 })
  }
}
