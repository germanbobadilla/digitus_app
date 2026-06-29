import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runRoleSeeding } from '@/lib/seed-roles'

// POST /api/admin/seed-roles - Seed roles and capabilities (admin only)
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

    console.log('Starting role seeding process...')
    const success = await runRoleSeeding()

    if (success) {
      return NextResponse.json({
        message: 'Roles and capabilities seeded successfully',
        success: true
      })
    } else {
      return NextResponse.json({
        error: 'Failed to seed roles and capabilities',
        success: false
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in seed roles endpoint:', error)
    return NextResponse.json({
      error: 'Failed to seed roles and capabilities',
      success: false
    }, { status: 500 })
  }
}


