import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasCapability } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'
import { prisma } from '@/lib/prisma'
import { getNextSequentialId } from '@/lib/sequential-ids'

const DEFAULT_SERVICES = [
  {
    name: 'Web Design Package',
    shortDescription: 'Complete website design and development',
    description: 'Professional website design with modern UI/UX, responsive layout, and SEO optimization.',
    price: 1500.0 as unknown as any,
    category: 'Web Design',
    features: 'Custom design\nResponsive layout\nSEO optimization\n3 revisions included',
    deliveryTime: '2-3 weeks',
    serviceType: 'web_design',
    webDesignType: 'custom',
    customFields: JSON.stringify({
      pages: 5,
      includesHosting: false,
      includesDomain: false,
    }),
    isOnline: true,
    duration: '2-3 weeks',
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

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin capabilities
    const canSeed = await hasCapability(session.user.id, CAPABILITIES.ADMIN_ACCESS)
    if (!canSeed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if services already exist
    const count = await prisma.service.count({ where: { isActive: true } })
    if (count > 0) {
      return NextResponse.json({
        message: `Found ${count} existing services, skipping seed`,
        servicesCount: count
      })
    }

    console.log('Seeding default services...')

    // Create services one by one with proper sequential IDs
    for (const serviceData of DEFAULT_SERVICES) {
      try {
        const serviceId = await getNextSequentialId('service')
        console.log(`Creating service ${serviceId}: ${serviceData.name}`)
        console.log(`Generated serviceId: ${serviceId}`)

        const service = await prisma.service.create({
          data: {
            ...serviceData,
            serviceId,
          },
        })

        console.log(`✅ Created service with ID: ${service.id}, serviceId: ${serviceId}`)
      } catch (error) {
        console.error(`❌ Failed to create service ${serviceData.name}:`, error)
        throw error
      }
    }

    console.log('Default services seeded successfully')

    return NextResponse.json({
      message: 'Services seeded successfully',
      servicesCount: DEFAULT_SERVICES.length
    })
  } catch (error) {
    console.error('Error seeding services:', error)
    return NextResponse.json({ error: 'Failed to seed services' }, { status: 500 })
  }
}
