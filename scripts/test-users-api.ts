import { PrismaClient } from '../src/generated/prisma'
import { hasCapability } from '../src/lib/capabilities'
import { CAPABILITIES } from '../src/lib/capabilities'

const prisma = new PrismaClient()

async function testUsersAPI() {
  try {
    console.log('Testing users API logic...')

    // Simulate what the API does
    const search = ''
    const page = 1
    const limit = 50
    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          userType: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              projects_projects_userIdTousers: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    console.log('Users found:', users.length)
    console.log('Total users:', total)
    console.log('\nUsers data:')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.userType}`)
    })

    const response = {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

    console.log('\nAPI Response structure:')
    console.log(JSON.stringify(response, null, 2))

  } catch (error) {
    console.error('Error testing users API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUsersAPI()
