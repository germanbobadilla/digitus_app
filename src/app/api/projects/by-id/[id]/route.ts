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
    console.log('=== SIMPLE API CALL START ===');
    console.log('Params:', params);

    const projectId = parseInt(params.id);
    console.log('Project ID:', projectId);

    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    console.log('Executing simple database query...');
    const project = await prisma.project.findFirst({
      where: { projectId: projectId }
    });

    console.log('Project found:', !!project);
    if (project) {
      console.log('Project name:', project.name);
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    console.log('=== SIMPLE API CALL SUCCESS ===');
    return NextResponse.json(project);
  } catch (error) {
    console.error('=== SIMPLE API CALL ERROR ===');
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
