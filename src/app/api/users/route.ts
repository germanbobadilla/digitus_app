import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { hasCapability } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'
import { sendWelcomeEmail } from '@/lib/email'

// GET /api/users - Get all users (with pagination)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view users
    const canViewUsers = await hasCapability(CAPABILITIES.USER_VIEW)
    if (!canViewUsers) {
      return NextResponse.json(
        { error: 'You do not have permission to view users' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          userType: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              projects_projects_userIdTousers: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user (public registration)
export async function POST(request: NextRequest) {
  try {
    // No authentication required for registration
    const body = await request.json()
    const { name, email, password, userType = 'CLIENT' } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Get the appropriate role for the user type
    const role = await prisma.role.findFirst({
      where: {
        name: userType === 'ADMIN' ? 'Admin' : 'Client'
      }
    })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        userType: userType as 'CLIENT' | 'MANAGER' | 'ADMIN',
        roleId: role?.id || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      message: 'User created successfully',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// PATCH /api/users - Update a user (ADMIN only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to edit users
    const canEditUsers = await hasCapability(CAPABILITIES.USER_EDIT)
    if (!canEditUsers) {
      return NextResponse.json(
        { error: 'You do not have permission to edit users' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, name, userType, isActive } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(userType !== undefined ? { userType } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      select: { id: true, name: true, email: true, userType: true, isActive: true, updatedAt: true }
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/users?id=... - Delete a user (ADMIN only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userCapabilities = await getUserCapabilities(session.user.id)
    if (!userCapabilities.includes('can_delete_users')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
