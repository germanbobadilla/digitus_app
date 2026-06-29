import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function updateProjectIds() {
  try {
    console.log('Updating project IDs to sequential numbers...')
    
    // Get all projects ordered by creation date
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`Found ${projects.length} projects`)
    
    // Update each project with sequential ID
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i]
      const newProjectId = i + 1
      
      console.log(`Updating project "${project.name}" from ID ${project.projectId} to ${newProjectId}`)
      
      await prisma.project.update({
        where: { id: project.id },
        data: { projectId: newProjectId }
      })
    }
    
    console.log('✅ All project IDs updated successfully!')
    
    // Show the updated projects
    const updatedProjects = await prisma.project.findMany({
      orderBy: { projectId: 'asc' },
      select: {
        projectId: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log('\nUpdated projects:')
    updatedProjects.forEach(p => {
      console.log(`  Project #${p.projectId}: ${p.name} (created: ${p.createdAt.toISOString().split('T')[0]})`)
    })
    
  } catch (error) {
    console.error('Error updating project IDs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateProjectIds()
