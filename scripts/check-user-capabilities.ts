import { PrismaClient } from '../src/generated/prisma'
import { getUserCapabilities } from '../src/lib/auth-utils'

const prisma = new PrismaClient()

async function checkUserCapabilities() {
  try {
    // Find a user to check
    const user = await prisma.user.findFirst({
      where: {
        email: 'germanbobadilla@gmail.com'
      },
      include: {
        role: true
      }
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log('User:', user.email)
    console.log('User Type:', user.userType)
    console.log('Role:', user.role?.name)
    console.log('Role Capabilities:', user.role?.capabilities)

    // Get user capabilities
    const capabilities = await getUserCapabilities(user.id)
    console.log('User Capabilities:', capabilities)
    
    // Check specific capabilities
    console.log('Has TASK_DELETE:', capabilities.includes('TASK_DELETE'))
    console.log('Has MILESTONE_DELETE:', capabilities.includes('MILESTONE_DELETE'))
    console.log('Has TASK_CREATE:', capabilities.includes('TASK_CREATE'))
    console.log('Has MILESTONE_CREATE:', capabilities.includes('MILESTONE_CREATE'))

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserCapabilities()