import { prisma } from './prisma'

/**
 * Get the next sequential ID for a given model
 */
export async function getNextSequentialId(model: 'user' | 'project' | 'payment'): Promise<number> {
  try {
    let maxId = 0

    switch (model) {
      case 'user':
        const maxUser = await prisma.user.findFirst({
          orderBy: { userId: 'desc' },
          select: { userId: true }
        })
        maxId = maxUser?.userId ?? -1
        console.log('Max user ID found:', maxUser?.userId, 'maxId:', maxId)
        break

      case 'project':
        const maxProject = await prisma.project.findFirst({
          orderBy: { projectId: 'desc' },
          select: { projectId: true }
        })
        maxId = maxProject?.projectId ?? -1
        break

      case 'payment':
        const maxPayment = await prisma.payment.findFirst({
          orderBy: { paymentId: 'desc' },
          select: { paymentId: true }
        })
        maxId = maxPayment?.paymentId || -1
        break

    }

    // For projects, start from 1 to avoid conflict with @default(0)
    if (model === 'project' && maxId === -1) {
      return 1
    }

    const nextId = maxId + 1
    console.log(`Next ${model} ID:`, nextId)
    return nextId
  } catch (error) {
    console.error(`Error getting next ${model} ID:`, error)
    return 0
  }
}

/**
 * Format sequential ID with leading zeros
 */
export function formatSequentialId(id: number, prefix: string = '', digits: number = 6): string {
  const paddedId = id.toString().padStart(digits, '0')
  return prefix ? `${prefix}${paddedId}` : paddedId
}

/**
 * Generate formatted IDs for display
 */
export function generateDisplayIds(sequentialId: number, type: 'user' | 'project' | 'payment'): string {
  switch (type) {
    case 'user':
      return formatSequentialId(sequentialId, '', 1) // User 0, 1, 2, etc.
    case 'project':
      return formatSequentialId(sequentialId, 'PRJ', 5) // PRJ00001, PRJ00002, etc.
    case 'payment':
      return formatSequentialId(sequentialId, 'P', 5) // P00001, P00002, etc.
    default:
      return sequentialId.toString()
  }
}
