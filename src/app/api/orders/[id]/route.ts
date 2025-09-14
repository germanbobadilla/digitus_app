import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: orderId } = await params

        // Get the order to check ownership and status
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                userId: true,
                status: true,
                orderNumber: true,
                orderId: true
            }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Check if user owns the order
        if (order.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check if order can be deleted (only pending orders)
        if (order.status !== 'PENDING') {
            return NextResponse.json({
                error: 'Only pending orders can be deleted'
            }, { status: 400 })
        }

        // Delete the order and related data
        await prisma.$transaction(async (tx) => {
            // Delete related payments first
            await tx.payment.deleteMany({
                where: { orderId: orderId }
            })

            // Delete order status history
            await tx.orderStatusHistory.deleteMany({
                where: { orderId: orderId }
            })

            // Delete the order
            await tx.order.delete({
                where: { id: orderId }
            })
        })

        return NextResponse.json({
            message: 'Order deleted successfully',
            orderNumber: order.orderNumber || `#${order.orderId?.toString().padStart(6, '0')}`
        })

    } catch (error) {
        console.error('Error deleting order:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


