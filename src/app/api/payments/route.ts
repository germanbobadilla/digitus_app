import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasCapability } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'

export async function GET(request: NextRequest) {
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

        // Get payments based on permissions
        const whereClause = canViewAllPayments ? {} : { userId: session.user.id }

        const payments = await prisma.payments.findMany({
            where: whereClause,
            include: {
                users_payments_userIdTousers: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(payments)
    } catch (error) {
        console.error('Error fetching payments:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}














