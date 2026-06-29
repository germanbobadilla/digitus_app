import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function assignClientRole() {
  try {
    console.log('Assigning Client role to germanbobadilla@gmail.com...')

    // Get the Client role ID
    const clientRole = await prisma.role.findUnique({
      where: { name: 'Client' }
    })

    if (!clientRole) {
      console.error('Client role not found!')
      return
    }

    console.log('Client role found:', clientRole.name, clientRole.id)

    // Update the user to have Client role
    const updatedUser = await prisma.user.update({
      where: { email: 'germanbobadilla@gmail.com' },
      data: {
        roleId: clientRole.id,
        userType: 'CLIENT' // Also update userType to match
      },
      include: {
        role: {
          include: {
            capabilities: true
          }
        }
      }
    })

    console.log('User updated successfully:')
    console.log(`- Name: ${updatedUser.name}`)
    console.log(`- Email: ${updatedUser.email}`)
    console.log(`- User Type: ${updatedUser.userType}`)
    console.log(`- Role: ${updatedUser.role?.name}`)
    console.log(`- Capabilities: ${updatedUser.role?.capabilities.length}`)

    // Verify the role counts
    const roleCounts = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    console.log('\nUpdated role counts:')
    roleCounts.forEach(role => {
      console.log(`- ${role.name}: ${role._count.users} users`)
    })

  } catch (error) {
    console.error('Error assigning client role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

assignClientRole()


