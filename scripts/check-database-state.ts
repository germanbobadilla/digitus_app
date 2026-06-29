import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...')
    
    // Check roles
    const roles = await prisma.role.findMany()
    console.log('📋 Roles in database:', roles.length)
    roles.forEach(role => {
      console.log(`  - ${role.name} (ID: ${role.id})`)
    })
    
    // Check users
    const users = await prisma.user.findMany()
    console.log('👥 Users in database:', users.length)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Type: ${user.userType}, Role: ${user.roleId}`)
    })
    
    // Check role capabilities
    const roleCapabilities = await prisma.roleCapability.findMany()
    console.log('🔐 Role capabilities in database:', roleCapabilities.length)
    
    if (roles.length === 0) {
      console.log('❌ No roles found! This is likely the issue.')
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseState()

