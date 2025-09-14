import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CAPABILITIES, ROLE_DEFINITIONS, type RoleName } from '@/lib/capabilities'

// GET /api/roles - List all roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin access
    if ((session.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const roles = await prisma.role.findMany({
      include: {
        capabilities: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

// POST /api/roles - Create new role (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin access
    if ((session.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, capabilities } = body

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return NextResponse.json({ error: 'Role already exists' }, { status: 400 })
    }

    // Create role with capabilities
    const role = await prisma.role.create({
      data: {
        name,
        description,
        capabilities: {
          create: capabilities?.map((capability: string) => ({
            capability,
            isGranted: true
          })) || []
        }
      },
      include: {
        capabilities: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}

// PATCH /api/roles - Update role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin access
    if ((session.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, description, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: {
        capabilities: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    return NextResponse.json(updatedRole)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

// DELETE /api/roles - Delete role (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin access
    if ((session.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    // Check if role has users assigned
    const roleWithUsers = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (!roleWithUsers) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (roleWithUsers._count.users > 0) {
      return NextResponse.json({
        error: 'Cannot delete role with assigned users. Please reassign users first.'
      }, { status: 400 })
    }

    await prisma.role.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
