import 'dotenv/config'
import path from 'node:path'
import fs from 'node:fs/promises'
import { prisma } from '@/lib/prisma'

interface TaskInput {
  title: string
  description?: string
  priority?: string
}

interface MilestoneInput {
  title: string
  description?: string
  dueDate?: string | null
  tasks?: TaskInput[]
}

interface ServiceInput {
  name: string
  description?: string
  price: string | number
  unit?: string
  estimatedHours?: number
  milestones?: MilestoneInput[]
}

interface ProjectInput {
  name: string
  description?: string
  services: ServiceInput[]
}

async function main() {
  const email = process.env.SEED_CLIENT_EMAIL || 'germanbobadilla@gmail.com'
  const filePath = process.env.SEED_PROJECT_FILE || path.resolve(__dirname, 'data', 'sample-project.json')

  console.log('Using client email:', email)
  console.log('Reading project JSON from:', filePath)

  const jsonRaw = await fs.readFile(filePath, 'utf-8')
  const projectInput: ProjectInput = JSON.parse(jsonRaw)

  if (!projectInput?.name || !Array.isArray(projectInput.services) || projectInput.services.length === 0) {
    throw new Error('Invalid project JSON: requires name and at least one service')
  }

  const clientUser = await prisma.user.findUnique({ where: { email } })
  if (!clientUser) {
    throw new Error(`Client user not found for email ${email}`)
  }

  console.log('Found client user:', { id: clientUser.id, email: clientUser.email })

  // Create project then services/milestones/tasks in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        userId: clientUser.id,
        name: projectInput.name,
        description: projectInput.description ?? null,
      }
    })

    const servicesCreated: { id: string; name: string; price: unknown }[] = []

    for (const svc of projectInput.services) {
      const priceDecimal = typeof svc.price === 'string' ? svc.price : svc.price.toFixed(2)
      const service = await tx.service.create({
        data: {
          projectId: project.id,
          name: svc.name,
          description: svc.description ?? null,
          price: priceDecimal,
          unit: svc.unit ?? 'HOUR',
          estimatedHours: svc.estimatedHours ?? null,
        }
      })
      servicesCreated.push({ id: service.id, name: service.name, price: service.price as unknown })

      // Create milestones for this service
      if (Array.isArray(svc.milestones)) {
        for (const ms of svc.milestones) {
          const milestone = await tx.milestones.create({
            data: {
              id: crypto.randomUUID(),
              serviceId: service.id,
              projectId: project.id,
              title: ms.title,
              description: ms.description ?? null,
              dueDate: ms.dueDate ? new Date(ms.dueDate) : null,
              // status defaults in schema
              updatedAt: new Date(),
            }
          })

          // Create tasks under this milestone
          if (Array.isArray(ms.tasks)) {
            for (const t of ms.tasks) {
              await tx.tasks.create({
                data: {
                  id: crypto.randomUUID(),
                  milestoneId: milestone.id,
                  serviceId: service.id,
                  projectId: project.id,
                  title: t.title,
                  description: t.description ?? null,
                  priority: t.priority ?? 'MEDIUM',
                  // status, dates default
                  updatedAt: new Date(),
                }
              })
            }
          }
        }
      }
    }

    return { project, servicesCreated }
  })

  const totalAmount = result.servicesCreated.reduce((sum, s) => sum + Number(String(s.price)), 0)

  console.log('Created project, services, milestones, and tasks successfully:')
  console.log({
    projectId: result.project.id,
    projectName: result.project.name,
    services: result.servicesCreated.map(s => ({ id: s.id, name: s.name, price: String(s.price) })),
    totalAmount: totalAmount.toFixed(2)
  })
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding error:', err)
    process.exit(1)
  })
