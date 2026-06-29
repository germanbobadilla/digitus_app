import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserCapabilities } from '@/lib/capabilities';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string; milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can view milestones
    if (!userCapabilities.includes('MILESTONE_READ')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId, milestoneId } = params;

    // Check if user can access this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { assignedUserId: session.user.id }
        ]
      }
    });

    if (!project && !userCapabilities.includes('PROJECT_VIEW_ALL')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if service exists and belongs to project
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        projectId
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        serviceId
      },
      include: {
        tasks: true
      }
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Error fetching milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string; milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can update milestones
    if (!userCapabilities.includes('MILESTONE_UPDATE')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId, milestoneId } = params;
    const body = await request.json();
    const { name, description, dueDate, status } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Milestone name is required' }, { status: 400 });
    }

    // Check if user can access this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { assignedUserId: session.user.id }
        ]
      }
    });

    if (!project && !userCapabilities.includes('PROJECT_VIEW_ALL')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if service exists and belongs to project
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        projectId
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        serviceId
      }
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        name,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'PENDING'
      },
      include: {
        tasks: true
      }
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string; milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can delete milestones
    if (!userCapabilities.includes('MILESTONE_DELETE')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId, milestoneId } = params;

    // Check if user can access this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { assignedUserId: session.user.id }
        ]
      }
    });

    if (!project && !userCapabilities.includes('PROJECT_VIEW_ALL')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if service exists and belongs to project
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        projectId
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        serviceId
      }
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Delete milestone (this will cascade delete tasks)
    await prisma.milestone.delete({
      where: { id: milestoneId }
    });

    return NextResponse.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
