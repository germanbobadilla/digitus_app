import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function checkUserSession() {
  try {
    console.log('Checking user sessions and roles...')

    // Get all users with their roles
    const users = await prisma.user.findMany({
      include: {
        role: {
          include: {
            capabilities: true
          }
        }
      }
    })

    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`)
      console.log(`  User Type: ${user.userType}`)
      console.log(`  Role: ${user.role?.name || 'No role assigned'}`)
      if (user.role) {
        console.log(`  Capabilities: ${user.role.capabilities.length}`)
        console.log(`  Can access admin panel: ${user.role.capabilities.some(c => c.capability === 'can_access_admin_panel' && c.isGranted)}`)
      }
      console.log('')
    })

    // Check if germanbobadilla@gmail.com is admin
    const adminUser = users.find(u => u.email === 'germanbobadilla@gmail.com')
    if (adminUser) {
      console.log('Admin user details:')
      console.log(`- Name: ${adminUser.name}`)
      console.log(`- Email: ${adminUser.email}`)
      console.log(`- User Type: ${adminUser.userType}`)
      console.log(`- Role: ${adminUser.role?.name || 'No role assigned'}`)
      if (adminUser.role) {
        console.log(`- Can access admin panel: ${adminUser.role.capabilities.some(c => c.capability === 'can_access_admin_panel' && c.isGranted)}`)
        console.log(`- Can manage roles: ${adminUser.role.capabilities.some(c => c.capability === 'can_manage_roles' && c.isGranted)}`)
      }
    } else {
      console.log('Admin user not found!')
    }

  } catch (error) {
    console.error('Error checking user session:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserSession()


