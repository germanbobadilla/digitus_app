import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidCapability } from '@/lib/capabilities'

// GET /api/roles/[id]/capabilities - Get role capabilities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin access
    if ((session.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        capabilities: true
      }
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    return NextResponse.json(role.capabilities)
  } catch (error) {
    console.error('Error fetching role capabilities:', error)
    return NextResponse.json({ error: 'Failed to fetch role capabilities' }, { status: 500 })
  }
}

// POST /api/roles/[id]/capabilities - Add capability to role
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin access
    if ((session.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { capability, isGranted = true } = body

    if (!capability) {
      return NextResponse.json({ error: 'Capability is required' }, { status: 400 })
    }

    if (!isValidCapability(capability)) {
      return NextResponse.json({ error: 'Invalid capability' }, { status: 400 })
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id }
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Create or update capability
    const roleCapability = await prisma.roleCapability.upsert({
      where: {
        roleId_capability: {
          roleId: id,
          capability
        }
      },
      update: {
        isGranted
      },
      create: {
        roleId: id,
        capability,
        isGranted
      }
    })

    return NextResponse.json(roleCapability, { status: 201 })
  } catch (error) {
    console.error('Error adding capability to role:', error)
    return NextResponse.json({ error: 'Failed to add capability to role' }, { status: 500 })
  }
}

// DELETE /api/roles/[id]/capabilities - Remove capability from role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin access
    if ((session.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const capability = searchParams.get('capability')

    if (!capability) {
      return NextResponse.json({ error: 'Capability is required' }, { status: 400 })
    }

    await prisma.roleCapability.deleteMany({
      where: {
        roleId: id,
        capability
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing capability from role:', error)
    return NextResponse.json({ error: 'Failed to remove capability from role' }, { status: 500 })
  }
}
