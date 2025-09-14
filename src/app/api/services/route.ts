import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequentialId, generateDisplayIds } from '@/lib/sequential-ids'
import { hasCapability } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'

async function ensureSeedServices() {
  try {
    const count = await prisma.service.count({ where: { isActive: true } })
    if (count > 0) {
      console.log(`Found ${count} existing services, skipping seed`)
      return
    }

    console.log('No services found, seeding default services...')

    // Create services one by one with proper sequential IDs
    const services = [
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
        isOnline: true,
        duration: '7-14 days',
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
        isOnline: true,
        duration: 'Ongoing',
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
        isOnline: true,
        duration: '3-5 days',
        isActive: true,
      },
    ]

    // Create each service with proper sequential ID
    for (let i = 0; i < services.length; i++) {
      const serviceData = services[i]
      console.log(`Creating service ${i + 1}: ${serviceData.name}`)

      const nextServiceId = await getNextSequentialId('service')
      console.log(`Generated serviceId: ${nextServiceId}`)

      const createdService = await prisma.service.create({
        data: {
          ...serviceData,
          serviceId: nextServiceId,
        },
      })

      console.log(`✅ Created service with ID: ${createdService.id}, serviceId: ${createdService.serviceId}`)
    }

    console.log('Default services seeded successfully')
  } catch (error) {
    console.error('Error seeding services:', error)
    console.error('Error details:', {
      code: error.code,
      meta: error.meta,
      message: error.message
    })
    throw error
  }
}

export async function GET(_request: NextRequest) {
  try {
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create services
    const canCreateServices = await hasCapability(CAPABILITIES.SERVICE_CREATE)
    if (!canCreateServices) {
      return NextResponse.json(
        { error: 'You do not have permission to create services' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Check if user has permission to set service price
    const canSetPrice = await hasCapability(CAPABILITIES.SERVICE_SET_PRICE)
    if (!canSetPrice && body.price > 0) {
      return NextResponse.json(
        { error: 'You do not have permission to set service prices' },
        { status: 403 }
      )
    }

    // Check if user has permission to create service phases
    const canCreatePhases = await hasCapability(CAPABILITIES.SERVICE_CREATE_PHASES)
    if (!canCreatePhases && body.phases && JSON.parse(body.phases).showPhases) {
      return NextResponse.json(
        { error: 'You do not have permission to create service phases' },
        { status: 403 }
      )
    }
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
      isOnline = true,
      duration,
      phases,
      isActive = true,
    } = body

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 })
    }

    // Get next sequential service ID
    console.log('Getting next sequential service ID...')
    const nextServiceId = await getNextSequentialId('service')
    console.log('Next service ID:', nextServiceId)
    const displayServiceId = generateDisplayIds(nextServiceId, 'service')
    console.log('Display service ID:', displayServiceId)

    // Debug: Log the data being saved
    const serviceData = {
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
      isOnline,
      duration,
      phases: phases ? (typeof phases === 'string' ? phases : JSON.stringify(phases)) : null,
      isActive,
    }

    console.log('Creating service with data:', serviceData)
    const created = await prisma.service.create({
      data: serviceData,
    })
    console.log('Service created successfully:', created)

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    })
    return NextResponse.json({
      error: 'Failed to create service',
      details: error.message
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to edit services
    const canEditServices = await hasCapability(CAPABILITIES.SERVICE_EDIT)
    if (!canEditServices) {
      return NextResponse.json(
        { error: 'You do not have permission to edit services' },
        { status: 403 }
      )
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete services
    const canDeleteServices = await hasCapability(CAPABILITIES.SERVICE_DELETE)
    if (!canDeleteServices) {
      return NextResponse.json({ error: 'You do not have permission to delete services' }, { status: 403 })
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


