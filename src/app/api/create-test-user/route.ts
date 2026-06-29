import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getNextSequentialId } from '@/lib/sequential-ids'

export async function POST(request: NextRequest) {
  try {
    const { email, name, userType = 'ADMIN' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        message: 'User already exists',
        user: existingUser
      })
    }

    // Create new user
    const nextUserId = await getNextSequentialId('user')

    const user = await prisma.user.create({
      data: {
        userId: nextUserId,
        email,
        name: name || email.split('@')[0],
        userType: userType as any,
        emailVerified: new Date(),
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json({
      error: 'Failed to create user',
      details: error.message
    }, { status: 500 })
  }
}
