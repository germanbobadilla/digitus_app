import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserCapabilities } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string; milestoneId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can view tasks
    if (!userCapabilities.includes('can_read_tasks')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId, milestoneId, taskId } = params;

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

    if (!project && !userCapabilities.includes('can_view_all_projects')) {
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

    const task = await prisma.tasks.findFirst({
      where: {
        id: taskId,
        milestoneId
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string; milestoneId: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can update tasks
    if (!userCapabilities.includes('can_update_tasks')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId, milestoneId, taskId } = params;
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

    if (!project && !userCapabilities.includes('can_view_all_projects')) {
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

    const task = await prisma.tasks.findFirst({
      where: {
        id: taskId,
        milestoneId
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updatedTask = await prisma.tasks.update({
      where: { id: taskId },
      data: {
        name,
        description: description || '',
        status: status || 'PENDING',
        priority: priority || 'MEDIUM'
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string; milestoneId: string; taskId: string } }
) {
  try {
    console.log('DELETE task request:', params);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session user ID:', session.user.id);

    const userCapabilities = await getUserCapabilities(session.user.id);
    console.log('User capabilities:', userCapabilities);

    // Check if user can delete tasks
    if (!userCapabilities.includes('can_delete_tasks')) {
      console.log('User does not have can_delete_tasks capability');
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId, milestoneId, taskId } = params;
    console.log('Params:', { projectId, serviceId, milestoneId, taskId });

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
    if (!project && userCapabilities.includes('can_view_all_projects')) {
      project = await prisma.project.findFirst({
        where: { id: projectId }
      });
    }

    if (!project) {
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

    const task = await prisma.tasks.findFirst({
      where: {
        id: taskId,
        milestoneId
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Delete task
    console.log('Attempting to delete task:', taskId);
    await prisma.tasks.delete({
      where: { id: taskId }
    });
    console.log('Task deleted successfully');

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
