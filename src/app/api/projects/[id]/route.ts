import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasCapabilityWithSession } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Check if user has permission to view projects
    const canViewAssignedProjects = await hasCapabilityWithSession(CAPABILITIES.PROJECT_VIEW_ASSIGNED, session.user.id)
    const canViewAllProjects = await hasCapabilityWithSession(CAPABILITIES.PROJECT_VIEW_ALL, session.user.id)

    if (!canViewAssignedProjects && !canViewAllProjects) {
      return NextResponse.json(
        { error: 'You do not have permission to view projects' },
        { status: 403 }
      )
    }

    // Build where clause based on permissions
    const whereClause: any = {
      id: id,
      isActive: true,
      ...(canViewAllProjects
        ? {}
        : {
            OR: [
              { assignedUserId: session.user.id },
              { userId: session.user.id }
            ]
          })
    }

    const project = await prisma.project.findFirst({
      where: whereClause,
      include: {
        users_projects_assignedUserIdTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        services: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        milestones: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        tasks: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to edit projects
    const canEditOwnProjects = await hasCapability(CAPABILITIES.PROJECT_EDIT_OWN)
    const canEditAllProjects = await hasCapability(CAPABILITIES.PROJECT_EDIT_ALL)

    if (!canEditOwnProjects && !canEditAllProjects) {
      return NextResponse.json(
        { error: 'You do not have permission to edit projects' },
        { status: 403 }
      )
    }

    const { title, description, status } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Project title is required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: {
        id: id,
        isActive: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user can edit this project (own projects or all projects)
    if (!canEditAllProjects && project.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this project' },
        { status: 403 }
      )
    }

    // Validate payment method requirement when starting project
    if (status === 'IN_PROGRESS' && project.assignedUserId) {
      const paymentMethodsCount = await prisma.paymentMethod.count({
        where: { userId: project.assignedUserId }
      })

      if (paymentMethodsCount === 0) {
        return NextResponse.json(
          {
            error: 'Cannot start project: User must have a payment method added first',
            code: 'MISSING_PAYMENT_METHOD'
          },
          { status: 400 }
        )
      }
    }

    // Check if project with same title already exists for this user (excluding current project)
    const existingProject = await prisma.project.findFirst({
      where: {
        userId: project.userId,
        title: title,
        isActive: true,
        id: { not: id }
      }
    })

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this title already exists' },
        { status: 400 }
      )
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: {
        id: id
      },
      data: {
        title: title,
        description: description || null,
        status: status || project.status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to delete projects
    const canDeleteOwnProjects = await hasCapability(CAPABILITIES.PROJECT_DELETE_OWN)
    const canDeleteAllProjects = await hasCapability(CAPABILITIES.PROJECT_DELETE_ALL)

    if (!canDeleteOwnProjects && !canDeleteAllProjects) {
      return NextResponse.json(
        { error: 'You do not have permission to delete projects' },
        { status: 403 }
      )
    }

    const { id } = await params
    const project = await prisma.project.findUnique({
      where: {
        id: id,
        isActive: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user can delete this project (own projects or all projects)
    if (!canDeleteAllProjects && project.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this project' },
        { status: 403 }
      )
    }

    // Soft delete project
    await prisma.project.update({
      where: {
        id: id
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
