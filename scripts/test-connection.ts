import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')

    // Test basic connection
    const userCount = await prisma.user.count()
    console.log('✅ Database connection successful!')
    console.log('Total users:', userCount)

    // Test specific user query
    const user = await prisma.user.findUnique({
      where: { email: 'info@digitus.com.do' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    })

    console.log('✅ User query successful!')
    console.log('User:', user)

    console.log('\nAll users in database:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        userType: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.name} (${u.email}) - ${u.userType} - ${u.isActive ? 'Active' : 'Inactive'} - Created: ${u.createdAt.toISOString()}`)
    })

  } catch (error) {
    console.error('❌ Database connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
