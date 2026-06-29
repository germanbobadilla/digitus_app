import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('=== TEST ENDPOINT START ===');

    // Test 1: Basic project query
    console.log('Test 1: Basic project query');
    const basicProject = await prisma.project.findFirst({
      where: { projectId: 1 }
    });
    console.log('Basic project found:', !!basicProject);

    if (!basicProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Test 2: Project with services
    console.log('Test 2: Project with services');
    const projectWithServices = await prisma.project.findFirst({
      where: { projectId: 1 },
      include: {
        services: true
      }
    });
    console.log('Project with services found:', !!projectWithServices);

    // Test 3: Project with milestones
    console.log('Test 3: Project with milestones');
    const projectWithMilestones = await prisma.project.findFirst({
      where: { projectId: 1 },
      include: {
        milestones: true
      }
    });
    console.log('Project with milestones found:', !!projectWithMilestones);

    // Test 4: Project with tasks
    console.log('Test 4: Project with tasks');
    const projectWithTasks = await prisma.project.findFirst({
      where: { projectId: 1 },
      include: {
        tasks: true
      }
    });
    console.log('Project with tasks found:', !!projectWithTasks);

    // Test 5: Full query
    console.log('Test 5: Full query');
    const fullProject = await prisma.project.findFirst({
      where: { projectId: 1 },
      include: {
        services: { orderBy: { createdAt: 'asc' } },
        milestones: { orderBy: { createdAt: 'asc' } },
        tasks: { orderBy: { createdAt: 'asc' } }
      }
    });
    console.log('Full project found:', !!fullProject);

    console.log('=== TEST ENDPOINT SUCCESS ===');
    return NextResponse.json({
      success: true,
      basicProject: !!basicProject,
      withServices: !!projectWithServices,
      withMilestones: !!projectWithMilestones,
      withTasks: !!projectWithTasks,
      fullProject: !!fullProject
    });

  } catch (error) {
    console.error('=== TEST ENDPOINT ERROR ===');
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
