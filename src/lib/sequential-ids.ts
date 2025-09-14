import { prisma } from './prisma'

/**
 * Get the next sequential ID for a given model
 */
export async function getNextSequentialId(model: 'user' | 'service' | 'order' | 'payment'): Promise<number> {
  try {
    let maxId = 0

    switch (model) {
      case 'user':
        const maxUser = await prisma.user.findFirst({
          orderBy: { userId: 'desc' },
          select: { userId: true }
        })
        maxId = maxUser?.userId || -1
        break

      case 'service':
        const maxService = await prisma.service.findFirst({
          orderBy: { serviceId: 'desc' },
          select: { serviceId: true }
        })
        maxId = maxService?.serviceId ?? -1
        break

      case 'order':
        const maxOrder = await prisma.order.findFirst({
          orderBy: { orderId: 'desc' },
          select: { orderId: true }
        })
        maxId = maxOrder?.orderId ?? -1
        break

      case 'payment':
        const maxPayment = await prisma.payment.findFirst({
          orderBy: { paymentId: 'desc' },
          select: { paymentId: true }
        })
        maxId = maxPayment?.paymentId || -1
        break
    }

    // For services, start from 1 to avoid conflict with @default(0)
    if (model === 'service' && maxId === -1) {
      return 1
    }
    return maxId + 1
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
export function generateDisplayIds(sequentialId: number, type: 'user' | 'service' | 'order' | 'payment'): string {
  switch (type) {
    case 'user':
      return formatSequentialId(sequentialId, '', 1) // User 0, 1, 2, etc.
    case 'service':
      return formatSequentialId(sequentialId, 'S', 5) // S00001, S00002, etc.
    case 'order':
      return formatSequentialId(sequentialId, '', 6) // 000001, 000002, etc.
    case 'payment':
      return formatSequentialId(sequentialId, 'P', 5) // P00001, P00002, etc.
    default:
      return sequentialId.toString()
  }
}
