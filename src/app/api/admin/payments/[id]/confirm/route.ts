import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        if (session.user.userType !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id: paymentId } = await params
        const body = await request.json()
        const { adminNotes } = body

        // Update the payment status to completed
        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                confirmedAt: new Date(),
                confirmedBy: session.user.id,
                adminNotes
            }
        })

        // Also update the order status to confirmed if it's still pending
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { order: true }
        })

        if (payment && payment.order.status === 'PENDING') {
            await prisma.order.update({
                where: { id: payment.orderId },
                data: { status: 'CONFIRMED' }
            })

            // Create status history entry
            await prisma.orderStatusHistory.create({
                data: {
                    orderId: payment.orderId,
                    status: 'CONFIRMED',
                    note: 'Order confirmed after payment verification'
                }
            })
        }

        return NextResponse.json(updatedPayment)
    } catch (error) {
        console.error('Error confirming payment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
