import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function migrateToThreeRoles() {
  console.log('🔄 Migrating to three-role system...')

  try {
    // Step 1: Update existing users to valid enum values
    console.log('Step 1: Updating existing users...')

    // Update ADMIN users to ADMIN
    await prisma.$executeRaw`UPDATE users SET userType = 'ADMIN' WHERE userType = 'ADMIN'`

    // Update REGULAR users to CLIENT
    await prisma.$executeRaw`UPDATE users SET userType = 'CLIENT' WHERE userType = 'REGULAR'`

    // Update CORPORATION users to CLIENT
    await prisma.$executeRaw`UPDATE users SET userType = 'CLIENT' WHERE userType = 'CORPORATION'`

    // Update EDUCATION users to CLIENT
    await prisma.$executeRaw`UPDATE users SET userType = 'CLIENT' WHERE userType = 'EDUCATION'`

    // Update GOVERNMENT users to CLIENT
    await prisma.$executeRaw`UPDATE users SET userType = 'CLIENT' WHERE userType = 'GOVERNMENT'`

    console.log('✅ Updated existing users')

    // Step 2: Verify the update
    const users = await prisma.$queryRaw`SELECT id, userType FROM users`
    console.log('Current user types:', users)

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateToThreeRoles()
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
