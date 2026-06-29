import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserCapabilities } from '@/lib/auth-utils';

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

    // Check if user can view services
    if (!userCapabilities.includes('can_read_services')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId } = params;

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

    // Get the specific service
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        projectId
      }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can update services
    if (!userCapabilities.includes('can_update_services')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId } = params;
    const body = await request.json();
    const { name, description, price, unit, status } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

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

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description: description || '',
        price: price || 0,
        unit: unit || 'fixed',
        status: status || 'PENDING'
      }
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can delete services
    if (!userCapabilities.includes('can_delete_services')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId, serviceId } = params;

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

    // Delete service
    await prisma.service.delete({
      where: { id: serviceId }
    });

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}