import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        console.log('Admin orders API - Starting...')

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
