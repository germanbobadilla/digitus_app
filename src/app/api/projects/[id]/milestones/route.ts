import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserCapabilities } from '@/lib/auth-utils';
import { CAPABILITIES } from '@/lib/capabilities';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can view milestones
    if (!userCapabilities.includes(CAPABILITIES.MILESTONE_READ)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId } = params;

    // Check if user can access this project
    let project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { assignedUserId: session.user.id }
        ]
      }
    });

    // If user can view all projects, allow access even if they don't own it
    if (!project && userCapabilities.includes(CAPABILITIES.PROJECT_VIEW_ALL)) {
      project = await prisma.project.findFirst({
        where: { id: projectId }
      });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all milestones for this project
    const milestones = await prisma.milestones.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = params;
    const body = await request.json();
    const { name, description, dueDate, status } = body;

    if (!name) {
      return NextResponse.json({ error: 'Milestone name is required' }, { status: 400 });
    }

    // Find the project
    const project = await prisma.project.findFirst({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create new milestone
    const milestone = await prisma.milestones.create({
      data: {
        projectId: project.id,
        name,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'PENDING'
      }
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
