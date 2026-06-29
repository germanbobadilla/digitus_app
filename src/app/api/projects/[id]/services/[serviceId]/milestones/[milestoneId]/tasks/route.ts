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

    // Check if user can view tasks
    if (!userCapabilities.includes('TASK_READ')) {
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

    // Check if milestone exists and belongs to service
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        serviceId
      }
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: { milestoneId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string; milestoneId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can create tasks
    if (!userCapabilities.includes('TASK_CREATE')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId, milestoneId } = params;
    const body = await request.json();
    const { name, description, status, priority } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 });
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

    // Check if milestone exists and belongs to service
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        serviceId
      }
    });

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const task = await prisma.task.create({
      data: {
        name,
        description: description || '',
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        milestoneId
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
