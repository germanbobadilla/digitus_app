import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        if (session.user.userType !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Delete all orders and related data in a transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Delete order status history
            const deletedStatusHistory = await prisma.orderStatusHistory.deleteMany({})

            // Delete payments
            const deletedPayments = await prisma.payment.deleteMany({})

            // Delete orders
            const deletedOrders = await prisma.order.deleteMany({})

            return {
                deletedOrders: deletedOrders.count,
                deletedPayments: deletedPayments.count,
                deletedStatusHistory: deletedStatusHistory.count
            }
        })

        return NextResponse.json({
            message: 'All orders and related data deleted successfully',
            ...result
        })

    } catch (error) {
        console.error('Error deleting all orders:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}









