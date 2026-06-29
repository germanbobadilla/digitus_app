import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CAPABILITIES, hasCapability } from '@/lib/capabilities'

// GET /api/invoices - Get invoices (role-based access)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user capabilities
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          include: {
            capabilities: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userCapabilities = user.role?.capabilities.map(rc => rc.capability) || []

    // Check permissions
    const canViewOwn = hasCapability(userCapabilities, CAPABILITIES.INVOICE_VIEW_OWN)
    const canViewAll = hasCapability(userCapabilities, CAPABILITIES.INVOICE_VIEW_ALL)

    if (!canViewOwn && !canViewAll) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Build query based on permissions
    const whereClause = canViewAll ? {} : { userId: user.id }

    // Check if invoice model exists by trying to access it
    try {
      await prisma.invoice.count()
    } catch (error) {
      console.error('Invoice model not available:', error)
      return NextResponse.json({ error: 'Invoice model not available' }, { status: 500 })
    }
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lineItems: true
      },
      orderBy: {
        issuedDate: 'desc'
      }
    })

    // Return empty array if no invoices found (this is normal)
    return NextResponse.json(invoices || [])

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create a new invoice (Manager/Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user capabilities
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          include: {
            capabilities: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userCapabilities = user.role?.capabilities.map(rc => rc.capability) || []

    // Check if user can create invoices (managers and admins)
    const canCreate = hasCapability(userCapabilities, CAPABILITIES.PROJECT_CREATE)

    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions to create invoices' }, { status: 403 })
    }

    const body = await request.json()
    const {
      projectId,
      userId,
      dueDate,
      notes,
      fiscalReceipt = false,
      taxId,
      businessName,
      businessAddress,
      lineItems = []
    } = body

    // Validation
    if (!projectId || !userId || !dueDate) {
      return NextResponse.json(
        { error: 'Project ID, User ID, and Due Date are required' },
        { status: 400 }
      )
    }

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { assignedUserId: userId },
          { createdById: user.id }
        ]
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const taxRate = 0.18 // 18% tax rate (can be made configurable)
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count()
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`

    // Create billing record first
    const billing = await prisma.billing.create({
      data: {
        projectId,
        userId,
        status: 'PENDING',
        totalAmount,
        remainingAmount: totalAmount,
        currency: 'USD',
        dueDate: new Date(dueDate)
      }
    })

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        billingId: billing.id,
        projectId,
        userId,
        status: 'DRAFT',
        subtotal,
        taxAmount,
        totalAmount,
        currency: 'USD',
        dueDate: new Date(dueDate),
        notes,
        fiscalReceipt,
        taxId: fiscalReceipt ? taxId : null,
        businessName: fiscalReceipt ? businessName : null,
        businessAddress: fiscalReceipt ? businessAddress : null,
        lineItems: {
          create: lineItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            serviceId: item.serviceId || null
          }))
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lineItems: true
      }
    })

    return NextResponse.json(invoice, { status: 201 })

  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
