import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function checkUserProjects() {
  try {
    console.log('Checking user projects...')

    // Get germanbobadilla@gmail.com user
    const user = await prisma.user.findUnique({
      where: { email: 'germanbobadilla@gmail.com' }
    })

    if (!user) {
      console.log('User not found!')
      return
    }

    console.log(`User: ${user.name} (${user.email})`)
    console.log(`User Type: ${user.userType}`)
    console.log(`Role ID: ${user.roleId}`)

    // Check if user has any projects assigned
    const assignedProjects = await prisma.project.findMany({
      where: {
        assignedUserId: user.id,
        isActive: true
      }
    })

    console.log(`\nAssigned projects: ${assignedProjects.length}`)
    assignedProjects.forEach(project => {
      console.log(`- ${project.name} (${project.id})`)
    })

    // Check if user has any projects they own
    const ownedProjects = await prisma.project.findMany({
      where: {
        userId: user.id,
        isActive: true
      }
    })

    console.log(`\nOwned projects: ${ownedProjects.length}`)
    ownedProjects.forEach(project => {
      console.log(`- ${project.name} (${project.id})`)
    })

    // Check all projects
    const allProjects = await prisma.project.findMany({
      where: { isActive: true }
    })

    console.log(`\nTotal active projects: ${allProjects.length}`)
    allProjects.forEach(project => {
      console.log(`- ${project.name} (Owner: ${project.userId}, Assigned: ${project.assignedUserId || 'None'})`)
    })

  } catch (error) {
    console.error('Error checking user projects:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserProjects()


