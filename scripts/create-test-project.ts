import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function createTestProject() {
  try {
    console.log('Creating test project...')

    // Get the admin user (info@digitus.com.do) to be the owner
    const adminUser = await prisma.user.findUnique({
      where: { email: 'info@digitus.com.do' }
    })

    if (!adminUser) {
      console.log('Admin user not found!')
      return
    }

    // Get the client user (germanbobadilla@gmail.com) to assign to
    const clientUser = await prisma.user.findUnique({
      where: { email: 'germanbobadilla@gmail.com' }
    })

    if (!clientUser) {
      console.log('Client user not found!')
      return
    }

    console.log(`Admin: ${adminUser.name} (${adminUser.email})`)
    console.log(`Client: ${clientUser.name} (${clientUser.email})`)

    // Create a test project
    const project = await prisma.project.create({
      data: {
        projectId: 1,
        userId: adminUser.id, // Admin owns the project
        assignedUserId: clientUser.id, // Client is assigned to work on it
        name: 'Test Web Development Project',
        description: 'A test project to demonstrate the system functionality',
        isActive: true
      }
    })

    console.log(`\nCreated project: ${project.name} (${project.id})`)
    console.log(`Owner: ${adminUser.name}`)
    console.log(`Assigned to: ${clientUser.name}`)

    // Verify the project was created
    const createdProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        users_projects_userIdTousers: {
          select: { name: true, email: true }
        },
        users_projects_assignedUserIdTousers: {
          select: { name: true, email: true }
        }
      }
    })

    console.log('\nProject details:')
    console.log(`- Name: ${createdProject?.name}`)
    console.log(`- Owner: ${createdProject?.users_projects_userIdTousers?.name}`)
    console.log(`- Assigned to: ${createdProject?.users_projects_assignedUserIdTousers?.name}`)
    console.log(`- Active: ${createdProject?.isActive}`)

  } catch (error) {
    console.error('Error creating test project:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestProject()


