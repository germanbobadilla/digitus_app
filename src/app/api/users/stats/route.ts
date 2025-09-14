import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/stats - Get user statistics
export async function GET() {
  try {
    const [
      totalUsers,
      newUsersThisMonth,
      usersWithOrders,
      topUsersByOrders
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Users with at least one order
      prisma.user.count({
        where: {
          orders: {
            some: {}
          }
        }
      }),

      // Top 5 users by order count
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'
          }
        },
        take: 5
      })
    ])

    return NextResponse.json({
      totalUsers,
      newUsersThisMonth,
      usersWithOrders,
      usersWithoutOrders: totalUsers - usersWithOrders,
      topUsersByOrders
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    )
  }
}

