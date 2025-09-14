import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasCapability } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'

export async function GET(request: NextRequest) {
    try {
        console.log('Admin orders API - Starting...')

        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has permission to view all orders
        const canViewAllOrders = await hasCapability(CAPABILITIES.ORDER_VIEW_ALL)
        if (!canViewAllOrders) {
            return NextResponse.json(
                { error: 'You do not have permission to view all orders' },
                { status: 403 }
            )
        }

        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userType: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        serviceId: true,
                        name: true,
                        shortDescription: true
                    }
                },
                payments: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        console.log('Orders found:', orders.length)
        if (orders.length > 0) {
            console.log('First order serviceId:', orders[0].service?.serviceId)
        }

        return NextResponse.json(orders)
    } catch (error) {
        console.error('Error fetching admin orders:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
