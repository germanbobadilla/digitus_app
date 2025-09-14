import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params
        const body = await request.json()
        const { transactionId } = body

        // Verify the payment belongs to the user
        const payment = await prisma.payment.findFirst({
            where: {
                id,
                order: {
                    userId: session.user.id
                }
            }
        })

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        // Update the payment with transaction ID
        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: { transactionId },
            include: {
                order: {
                    include: {
                        service: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(updatedPayment)
    } catch (error) {
        console.error('Error updating payment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}









