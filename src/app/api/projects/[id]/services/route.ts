import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserCapabilities } from '@/lib/auth-utils';

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

    // Check if user can view services
    if (!userCapabilities.includes('can_read_services')) {
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
    if (!project && userCapabilities.includes('can_view_all_projects')) {
      project = await prisma.project.findFirst({
        where: { id: projectId }
      });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all services for this project
    const services = await prisma.service.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
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

    const userCapabilities = await getUserCapabilities(session.user.id);

    // Check if user can create services
    if (!userCapabilities.includes('can_create_services')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id: projectId } = params;
    const body = await request.json();
    const { name, description, price, unit, estimatedHours } = body;

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

    // Create new service
    const service = await prisma.service.create({
      data: {
        projectId,
        name,
        description: description || '',
        price: price || 0,
        unit: unit || 'fixed',
        estimatedHours: estimatedHours || null,
        status: 'PENDING'
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}