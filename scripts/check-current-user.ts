import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function checkCurrentUser() {
  try {
    console.log('Checking current user session...')

    // Get germanbobadilla@gmail.com user details
    const user = await prisma.user.findUnique({
      where: { email: 'germanbobadilla@gmail.com' },
      include: {
        role: {
          include: {
            capabilities: true
          }
        }
      }
    })

    if (!user) {
      console.log('User not found!')
      return
    }

    console.log('Current user details:')
    console.log(`- Name: ${user.name}`)
    console.log(`- Email: ${user.email}`)
    console.log(`- User Type: ${user.userType}`)
    console.log(`- Role: ${user.role?.name}`)
    console.log(`- Role ID: ${user.roleId}`)
    console.log(`- Total Capabilities: ${user.role?.capabilities.length}`)

    console.log('\nCapabilities:')
    user.role?.capabilities.forEach(cap => {
      console.log(`- ${cap.capability}: ${cap.isGranted ? 'GRANTED' : 'DENIED'}`)
    })

    // Check specifically for can_view_assigned_projects
    const canViewAssigned = user.role?.capabilities.find(c => c.capability === 'can_view_assigned_projects')
    console.log(`\nCan view assigned projects: ${canViewAssigned ? (canViewAssigned.isGranted ? 'YES' : 'NO') : 'NOT FOUND'}`)

  } catch (error) {
    console.error('Error checking current user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentUser()


