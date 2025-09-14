import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequentialId, generateDisplayIds } from '@/lib/sequential-ids'
import { hasCapability } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to create orders
    const canCreateOrders = await hasCapability(CAPABILITIES.ORDER_CREATE)
    if (!canCreateOrders) {
      return NextResponse.json(
        { error: 'You do not have permission to create orders' },
        { status: 403 }
      )
    }

    const { serviceId, quantity = 1, webDesignType } = await request.json()

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Fetch service details to get current price
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
        isActive: true
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      )
    }

    // Calculate total price
    const totalPrice = service.price * quantity

    // Get next sequential order ID
    const nextOrderId = await getNextSequentialId('order')
    const displayOrderId = generateDisplayIds(nextOrderId, 'order')

    // Create order
    const orderData: any = {
      orderId: nextOrderId,
      userId: session.user.id,
      serviceId: service.id,
      quantity: quantity,
      price: service.price,
      totalPrice: totalPrice,
      status: 'PENDING',
      orderNumber: displayOrderId
    }

    // Add webDesignType if provided
    if (webDesignType) {
      orderData.webDesignType = webDesignType
    }

    const order = await prisma.order.create({
      data: orderData,
      include: {
        service: {
          select: {
            id: true,
            serviceId: true,
            name: true,
            description: true,
            shortDescription: true
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to view orders
    const canViewOwnOrders = await hasCapability(CAPABILITIES.ORDER_VIEW_OWN)
    const canViewAllOrders = await hasCapability(CAPABILITIES.ORDER_VIEW_ALL)

    if (!canViewOwnOrders && !canViewAllOrders) {
      return NextResponse.json(
        { error: 'You do not have permission to view orders' },
        { status: 403 }
      )
    }

    // Build where clause based on permissions
    const whereClause: any = {}
    if (canViewAllOrders) {
      // User can view all orders, no restriction needed
    } else if (canViewOwnOrders) {
      // User can only view their own orders
      whereClause.userId = session.user.id
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            serviceId: true,
            name: true,
            description: true,
            shortDescription: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
