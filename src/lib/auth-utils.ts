import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CAPABILITIES, type Capability } from '@/lib/capabilities'

// Helper function to get user capabilities from session
export async function getUserCapabilities(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            capabilities: {
              where: {
                isGranted: true
              }
            }
          }
        }
      }
    })

    return user?.role?.capabilities?.map(rc => rc.capability) || []
  } catch (error) {
    console.error('Error fetching user capabilities:', error)
    return []
  }
}

// Helper function to check if current user has a specific capability
export async function hasCapability(capability: Capability): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return false
    }

    const capabilities = await getUserCapabilities((session.user as any).id)
    return capabilities.includes(capability)
  } catch (error) {
    console.error('Error checking capability:', error)
    return false
  }
}

// Helper function to check if current user has any of the specified capabilities
export async function hasAnyCapability(capabilities: Capability[]): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return false
    }

    const userCapabilities = await getUserCapabilities((session.user as any).id)
    return capabilities.some(capability => userCapabilities.includes(capability))
  } catch (error) {
    console.error('Error checking capabilities:', error)
    return false
  }
}

// Helper function to check if current user has all of the specified capabilities
export async function hasAllCapabilities(capabilities: Capability[]): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return false
    }

    const userCapabilities = await getUserCapabilities((session.user as any).id)
    return capabilities.every(capability => userCapabilities.includes(capability))
  } catch (error) {
    console.error('Error checking capabilities:', error)
    return false
  }
}

// Middleware function for API routes that require specific capabilities
export function requireCapability(capability: Capability) {
  return async function handler(request: Request) {
    const hasRequiredCapability = await hasCapability(capability)

    if (!hasRequiredCapability) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return null // Continue with the request
  }
}

// Middleware function for API routes that require any of the specified capabilities
export function requireAnyCapability(capabilities: Capability[]) {
  return async function handler(request: Request) {
    const hasRequiredCapability = await hasAnyCapability(capabilities)

    if (!hasRequiredCapability) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return null // Continue with the request
  }
}

// Helper function to get current user with capabilities
export async function getCurrentUserWithCapabilities() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: {
        role: {
          include: {
            capabilities: {
              where: {
                isGranted: true
              }
            }
          }
        }
      }
    })

    return user
  } catch (error) {
    console.error('Error fetching current user with capabilities:', error)
    return null
  }
}
