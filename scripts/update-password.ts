import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updatePassword() {
  try {
    const email = 'info@digitus.com.do'
    const newPassword = 'Digitus2024!' // You can change this password

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        password: false // Don't return the password
      }
    })

    console.log('✅ Password updated successfully!')
    console.log('User:', updatedUser)
    console.log('New password:', newPassword)

  } catch (error) {
    console.error('❌ Error updating password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePassword()


