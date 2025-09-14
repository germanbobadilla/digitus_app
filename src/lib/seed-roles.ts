import { prisma } from '@/lib/prisma'
import { ROLE_DEFINITIONS } from '@/lib/capabilities'

export async function seedRoles() {
  try {
    console.log('Starting role seeding...')

    // Create roles with their capabilities
    for (const [roleName, roleData] of Object.entries(ROLE_DEFINITIONS)) {
      console.log(`Creating role: ${roleName}`)

      // Check if role already exists
      const existingRole = await prisma.role.findUnique({
        where: { name: roleName }
      })

      if (existingRole) {
        console.log(`Role ${roleName} already exists, updating capabilities...`)

        // Update existing role
        await prisma.role.update({
          where: { id: existingRole.id },
          data: {
            description: roleData.description,
            isActive: true
          }
        })

        // Clear existing capabilities
        await prisma.roleCapability.deleteMany({
          where: { roleId: existingRole.id }
        })

        // Add new capabilities
        await prisma.roleCapability.createMany({
          data: roleData.capabilities.map(capability => ({
            roleId: existingRole.id,
            capability,
            isGranted: true
          }))
        })

        console.log(`Updated role ${roleName} with ${roleData.capabilities.length} capabilities`)
      } else {
        // Create new role
        const role = await prisma.role.create({
          data: {
            name: roleName,
            description: roleData.description,
            isActive: true,
            capabilities: {
              create: roleData.capabilities.map(capability => ({
                capability,
                isGranted: true
              }))
            }
          }
        })

        console.log(`Created role ${roleName} with ${roleData.capabilities.length} capabilities`)
      }
    }

    console.log('Role seeding completed successfully!')
    return true
  } catch (error) {
    console.error('Error seeding roles:', error)
    return false
  }
}

// Function to assign default roles to existing users based on their userType
export async function assignDefaultRoles() {
  try {
    console.log('Assigning default roles to existing users...')

    // Get all roles
    const roles = await prisma.role.findMany()
    const roleMap = new Map(roles.map(role => [role.name, role.id]))

    // Get users without roles
    const usersWithoutRoles = await prisma.user.findMany({
      where: {
        roleId: null
      }
    })

    console.log(`Found ${usersWithoutRoles.length} users without roles`)

    // Assign roles based on userType
    for (const user of usersWithoutRoles) {
      let roleId: string | null = null

      switch (user.userType) {
        case 'ADMIN':
          roleId = roleMap.get('Admin') || null
          break
        case 'CORPORATION':
          roleId = roleMap.get('Corporation') || null
          break
        case 'EDUCATION':
          roleId = roleMap.get('Education') || null
          break
        case 'REGULAR':
        default:
          roleId = roleMap.get('Regular') || null
          break
      }

      if (roleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId }
        })
        console.log(`Assigned role to user ${user.email}`)
      }
    }

    console.log('Default role assignment completed!')
    return true
  } catch (error) {
    console.error('Error assigning default roles:', error)
    return false
  }
}

// Main function to run all seeding
export async function runRoleSeeding() {
  try {
    const rolesSeeded = await seedRoles()
    if (rolesSeeded) {
      await assignDefaultRoles()
    }
    return true
  } catch (error) {
    console.error('Error in role seeding process:', error)
    return false
  }
}
