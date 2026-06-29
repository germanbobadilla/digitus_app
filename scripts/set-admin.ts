import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function setAdmin() {
  try {
    const email = 'germanbobadilla@gmail.com'

    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        roleId: true
      }
    })

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('✅ User found:', user)

    // Find or create the ADMIN role
    let adminRole = await prisma.role.findFirst({
      where: { name: 'ADMIN' }
    })

    if (!adminRole) {
      console.log('Creating ADMIN role...')
      adminRole = await prisma.role.create({
        data: {
          name: 'ADMIN',
          description: 'Administrator with full access',
          isActive: true
        }
      })
      console.log('✅ ADMIN role created')
    } else {
      console.log('✅ ADMIN role found')
    }

    // Update user to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        userType: 'ADMIN',
        roleId: adminRole.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        roleId: true
      }
    })

    console.log('✅ User updated to ADMIN:')
    console.log(updatedUser)

  } catch (error) {
    console.error('❌ Error setting admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdmin()


