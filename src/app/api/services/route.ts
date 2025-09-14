import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequentialId, generateDisplayIds } from '@/lib/sequential-ids'

async function ensureSeedServices() {
  const count = await prisma.service.count({ where: { isActive: true } })
  if (count > 0) return

  await prisma.service.createMany({
    data: [
      {
        name: 'Web Design Package',
        shortDescription: 'Modern responsive website design',
        description: 'Professional web design including responsive layouts, basic SEO, and performance best practices.',
        price: 999.0 as unknown as any,
        category: 'Design',
        features: 'Responsive design\nSEO ready\nPerformance optimized',
        deliveryTime: '7-14 days',
        serviceType: 'web-design',
        customFields: JSON.stringify({
          pagesIncluded: 5,
          revisions: 2,
          technologies: ['Next.js', 'TailwindCSS'],
        }),
        isActive: true,
      },
      {
        name: 'Managed Hosting',
        shortDescription: 'Fast, secure, and monitored hosting',
        description: 'Fully managed hosting with automatic backups, monitoring, and SSL.',
        price: 29.0 as unknown as any,
        category: 'Hosting',
        features: 'Automatic backups\nSSL included\n24/7 monitoring',
        deliveryTime: 'Instant',
        serviceType: 'hosting',
        customFields: JSON.stringify({
          storageGb: 10,
          bandwidthTb: 1,
        }),
        isActive: true,
      },
      {
        name: 'Content Writing',
        shortDescription: 'High-quality SEO blog posts',
        description: 'Professional articles tailored to your brand and audience.',
        price: 120.0 as unknown as any,
        category: 'Content',
        features: 'Keyword research\nEditing included\nRoyalty-free images',
        deliveryTime: '3-5 days',
        serviceType: 'content',
        customFields: JSON.stringify({
          wordsPerArticle: 1000,
          includesEditing: true,
        }),
        isActive: true,
      },
    ],
  })
}

export async function GET(_request: NextRequest) {
  try {
    await ensureSeedServices()

    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      shortDescription,
      price,
      category,
      features,
      deliveryTime,
      image,
      serviceType,
      customFields,
      webDesignType,
      isActive = true,
    } = body

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 })
    }

    // Get next sequential service ID
    const nextServiceId = await getNextSequentialId('service')
    const displayServiceId = generateDisplayIds(nextServiceId, 'service')

    const created = await prisma.service.create({
      data: {
        serviceId: nextServiceId,
        name,
        description,
        shortDescription,
        // allow number or string, Prisma will coerce to Decimal
        price: typeof price === 'number' ? price : parseFloat(String(price)),
        category,
        features,
        deliveryTime,
        image,
        serviceType,
        customFields: customFields ? (typeof customFields === 'string' ? customFields : JSON.stringify(customFields)) : null,
        webDesignType,
        isActive,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Prevent editing if there are in-progress orders for this service
    const inProgress = await prisma.order.count({
      where: { serviceId: id, status: 'IN_PROGRESS' as any },
    })
    if (inProgress > 0) {
      return NextResponse.json({ error: 'Service has in-progress orders and cannot be edited' }, { status: 409 })
    }

    const data: any = { ...updates }
    if (data.price !== undefined) {
      data.price = typeof data.price === 'number' ? data.price : parseFloat(String(data.price))
    }
    if (data.customFields !== undefined) {
      data.customFields = data.customFields ? (typeof data.customFields === 'string' ? data.customFields : JSON.stringify(data.customFields)) : null
    }

    const updated = await prisma.service.update({
      where: { id },
      data,
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const inProgress = await prisma.order.count({
      where: { serviceId: id, status: 'IN_PROGRESS' as any },
    })
    if (inProgress > 0) {
      return NextResponse.json({ error: 'Service has in-progress orders and cannot be deleted' }, { status: 409 })
    }

    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}


