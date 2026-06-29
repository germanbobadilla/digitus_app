import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAuth() {
  try {
    console.log('Testing authentication...')

    const email = 'info@digitus.com.do'
    const password = 'Digitus2024!'

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', user.email)

    if (!user.password) {
      console.log('❌ User has no password')
      return
    }

    // Test password
    const isValid = await bcrypt.compare(password, user.password)
    console.log('✅ Password valid:', isValid)

    if (isValid) {
      console.log('✅ Authentication would succeed!')
      console.log('User ID:', user.id)
      console.log('User Type:', user.userType)
    } else {
      console.log('❌ Password invalid')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()


