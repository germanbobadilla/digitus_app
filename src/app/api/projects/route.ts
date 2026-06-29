import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getNextSequentialId, generateDisplayIds } from '@/lib/sequential-ids'
import { hasCapabilityWithSession } from '@/lib/auth-utils'
import { CAPABILITIES } from '@/lib/capabilities'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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
    let whereClause: any = {
      isActive: true
    }

    // If user can only view assigned/own projects, include both ownership and assignment
    if (!canViewAllProjects) {
      whereClause.OR = [
        { assignedUserId: session.user.id },
        { userId: session.user.id }
      ]
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        users_projects_assignedUserIdTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('❌ Projects API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to create projects
    const canCreateProjects = await hasCapabilityWithSession(CAPABILITIES.PROJECT_CREATE, session.user.id)
    if (!canCreateProjects) {
      return NextResponse.json(
        { error: 'You do not have permission to create projects' },
        { status: 403 }
      )
    }

    const { title, description, assignedUserId } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    // Check if project with same name already exists for this user
    const existingProject = await prisma.project.findFirst({
      where: {
        userId: session.user.id,
        name: title,
        isActive: true
      }
    })

    if (existingProject) {
      return NextResponse.json(
        { error: 'A project with this name already exists' },
        { status: 400 }
      )
    }

    // Get next sequential project ID
    const nextProjectId = await getNextSequentialId('project')
    const displayProjectId = generateDisplayIds(nextProjectId, 'project')

    // Create project
    const project = await prisma.project.create({
      data: {
        projectId: nextProjectId,
        userId: session.user.id,
        assignedUserId: assignedUserId || null,
        name: title,
        description: description || null,
        isActive: true
      },
      include: {
        users_projects_assignedUserIdTousers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
