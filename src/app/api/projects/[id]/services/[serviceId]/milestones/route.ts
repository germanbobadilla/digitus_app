import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserCapabilities } from '@/lib/capabilities';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string } }
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

    const { id: projectId, serviceId } = params;

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

    const milestones = await prisma.milestone.findMany({
      where: { serviceId },
      include: {
        tasks: true
      },
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
  { params }: { params: { id: string; serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can create milestones
    if (!userCapabilities.includes('MILESTONE_CREATE')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId } = params;
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

    const milestone = await prisma.milestone.create({
      data: {
        name,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'PENDING',
        serviceId
      },
      include: {
        tasks: true
      }
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
