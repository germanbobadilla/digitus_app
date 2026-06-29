import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function checkAdminCapabilities() {
  try {
    console.log('Checking admin user capabilities...')

    // Get the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'info@digitus.com.do' },
      include: {
        role: {
          include: {
            capabilities: true
          }
        }
      }
    })

    if (!adminUser) {
      console.log('Admin user not found!')
      return
    }

    console.log('Admin user details:')
    console.log(`- Name: ${adminUser.name}`)
    console.log(`- Email: ${adminUser.email}`)
    console.log(`- User Type: ${adminUser.userType}`)
    console.log(`- Role: ${adminUser.role?.name}`)
    console.log(`- Total Capabilities: ${adminUser.role?.capabilities.length}`)

    console.log('\nAll capabilities:')
    adminUser.role?.capabilities.forEach(cap => {
      console.log(`- ${cap.capability}: ${cap.isGranted ? 'GRANTED' : 'DENIED'}`)
    })

    // Check specifically for can_manage_roles
    const canManageRoles = adminUser.role?.capabilities.find(c => c.capability === 'can_manage_roles')
    console.log(`\nCan manage roles: ${canManageRoles ? (canManageRoles.isGranted ? 'YES' : 'NO') : 'NOT FOUND'}`)

  } catch (error) {
    console.error('Error checking admin capabilities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminCapabilities()


