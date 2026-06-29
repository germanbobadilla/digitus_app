import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasCapability } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has permission to view payments
        const canViewOwnPayments = await hasCapability(CAPABILITIES.PAYMENT_VIEW_OWN)
        const canViewAllPayments = await hasCapability(CAPABILITIES.PAYMENT_VIEW_ALL)

        if (!canViewOwnPayments && !canViewAllPayments) {
            return NextResponse.json(
                { error: 'You do not have permission to view payments' },
                { status: 403 }
            )
        }

        const payment = await prisma.payment.findUnique({
            where: {
                id: params.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        // Check if user can view this payment (own payments or all payments)
        if (!canViewAllPayments && payment.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'You do not have permission to view this payment' },
                { status: 403 }
            )
        }

        return NextResponse.json(payment)
    } catch (error) {
        console.error('Error fetching payment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

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
        const { transactionId, description } = body

        // Verify the payment belongs to the user
        const payment = await prisma.payment.findFirst({
            where: {
                id,
                userId: session.user.id
            }
        })

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
        }

        // Update the payment with transaction ID and description
        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: { 
                transactionId,
                description: description || payment.description
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
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














