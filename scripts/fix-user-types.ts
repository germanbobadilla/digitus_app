import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function fixUserTypes() {
  console.log('🔧 Fixing user types...')

  try {
    // Update all users to CLIENT type first
    await prisma.user.updateMany({
      data: {
        userType: 'CLIENT'
      }
    })

    console.log('✅ Updated all users to CLIENT type')

    // Now we can safely apply the schema changes
    console.log('✅ User types fixed successfully!')
  } catch (error) {
    console.error('❌ Error fixing user types:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix function
fixUserTypes()
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
