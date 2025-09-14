import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
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

        const { id: orderId } = await params
        const body = await request.json()

        console.log('Admin order update - Order ID:', orderId)
        console.log('Admin order update - Request body:', body)

        const {
            status,
            priority,
            adminNotes,
            assignedTo,
            price,
            quantity,
            totalPrice,
            webDesignType
        } = body

        // Prepare update data
        const updateData: any = {
            status,
            priority,
            adminNotes
        }

        // Handle assignedTo field - only set if it's a valid user ID
        if (assignedTo && assignedTo.trim() !== '') {
            updateData.assignedTo = assignedTo
        } else {
            // Set to null if empty or invalid
            updateData.assignedTo = null
        }

        // Add optional fields if provided and convert to proper types
        if (price !== undefined && price !== '') {
            updateData.price = parseFloat(price)
        }
        if (quantity !== undefined && quantity !== '') {
            updateData.quantity = parseInt(quantity)
        }
        if (totalPrice !== undefined && totalPrice !== '') {
            updateData.totalPrice = parseFloat(totalPrice)
        }
        if (webDesignType !== undefined && webDesignType !== '') {
            updateData.webDesignType = webDesignType
        } else if (webDesignType === '') {
            // Set to null if empty string
            updateData.webDesignType = null
        }

        console.log('Admin order update - Update data:', updateData)

        // Update the order
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
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
                        name: true,
                        description: true
                    }
                },
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        method: true,
                        status: true,
                        transactionId: true,
                        adminNotes: true,
                        confirmedAt: true,
                        confirmedBy: true
                    }
                }
            }
        })

        // Create status history entry - temporarily disabled for debugging
        // try {
        //     await prisma.orderStatusHistory.create({
        //         data: {
        //             orderId: orderId,
        //             status,
        //             note: `Status changed to ${status} by admin`
        //         }
        //     })
        //     console.log('Status history entry created successfully')
        // } catch (historyError) {
        //     console.error('Error creating status history:', historyError)
        //     // Don't fail the whole request if history creation fails
        // }

        return NextResponse.json(updatedOrder)
    } catch (error) {
        console.error('Error updating order:', error)
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        })
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 })
    }
}
