import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function fixAdminUser() {
  try {
    console.log('Fixing admin user...')

    // Update germanbobadilla@gmail.com to have ADMIN userType
    const updatedUser = await prisma.user.update({
      where: { email: 'germanbobadilla@gmail.com' },
      data: { userType: 'ADMIN' }
    })

    console.log('User updated successfully:')
    console.log(`- Name: ${updatedUser.name}`)
    console.log(`- Email: ${updatedUser.email}`)
    console.log(`- User Type: ${updatedUser.userType}`)
    console.log(`- Role: Admin (with all capabilities)`)

  } catch (error) {
    console.error('Error fixing admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminUser()


