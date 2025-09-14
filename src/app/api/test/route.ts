import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()

    // Get counts for all tables
    const userCount = await prisma.user.count()
    const serviceCount = await prisma.service.count()
    const orderCount = await prisma.order.count()
    const paymentCount = await prisma.payment.count()
    const statusHistoryCount = await prisma.orderStatusHistory.count()

    return NextResponse.json({
      message: 'Database connection successful!',
      counts: {
        users: userCount,
        services: serviceCount,
        orders: orderCount,
        payments: paymentCount,
        statusHistory: statusHistoryCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Database connection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST() {
  try {
    // Create sample data
    const sampleUser = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword123'
      }
    })

    const sampleService = await prisma.service.create({
      data: {
        name: 'Digital Marketing Package',
        description: 'Complete digital marketing solution for small businesses',
        price: 299.99,
        isActive: true
      }
    })

    const sampleOrder = await prisma.order.create({
      data: {
        userId: sampleUser.id,
        serviceId: sampleService.id,
        price: sampleService.price,
        status: 'PENDING'
      }
    })

    const samplePayment = await prisma.payment.create({
      data: {
        orderId: sampleOrder.id,
        amount: sampleOrder.price,
        method: 'CARD',
        referenceNo: 'PAY-' + Date.now(),
        status: 'PENDING'
      }
    })

    const sampleStatusHistory = await prisma.orderStatusHistory.create({
      data: {
        orderId: sampleOrder.id,
        status: 'PENDING',
        note: 'Order created successfully'
      }
    })

    return NextResponse.json({
      message: 'Sample data created successfully!',
      data: {
        user: { id: sampleUser.id, name: sampleUser.name, email: sampleUser.email },
        service: { id: sampleService.id, name: sampleService.name, price: sampleService.price },
        order: { id: sampleOrder.id, status: sampleOrder.status, price: sampleOrder.price },
        payment: { id: samplePayment.id, method: samplePayment.method, status: samplePayment.status },
        statusHistory: { id: sampleStatusHistory.id, status: sampleStatusHistory.status }
      }
    })
  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
