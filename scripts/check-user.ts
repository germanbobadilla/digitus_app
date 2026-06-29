import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const email = 'info@digitus.com.do'

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        roleId: true,
        isActive: true
      }
    })

    if (!user) {
      console.log('❌ User not found!')
      return
    }

    console.log('✅ User found:')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role ID:', user.roleId)
    console.log('Is Active:', user.isActive)
    console.log('Has Password:', !!user.password)

    // Test password verification
    const testPassword = 'Digitus2024!'
    const isValid = await bcrypt.compare(testPassword, user.password || '')
    console.log('Password Valid:', isValid)

  } catch (error) {
    console.error('❌ Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()


