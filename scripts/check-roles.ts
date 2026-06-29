import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function checkRoles() {
  try {
    console.log('Checking roles in database...')

    const roles = await prisma.role.findMany({
      include: {
        capabilities: true,
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`Found ${roles.length} roles:`)
    roles.forEach(role => {
      console.log(`- ${role.name} (${role.id})`)
      console.log(`  Description: ${role.description || 'No description'}`)
      console.log(`  Active: ${role.isActive}`)
      console.log(`  Users: ${role._count.users}`)
      console.log(`  Capabilities: ${role.capabilities.length}`)
      role.capabilities.forEach(cap => {
        console.log(`    - ${cap.capability}: ${cap.isGranted ? 'GRANTED' : 'DENIED'}`)
      })
      console.log('')
    })

  } catch (error) {
    console.error('Error checking roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRoles()
