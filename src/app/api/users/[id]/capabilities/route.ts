import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id]/capabilities - Get user capabilities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: userId } = await params

    // Users can only view their own capabilities unless they have admin access
    // For now, allow users to view their own capabilities and admins to view any capabilities
    if ((session.user as any)?.id !== userId) {
      // Check if user is admin by userType (simpler check)
      if ((session.user as any)?.userType !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            capabilities: {
              where: {
                isGranted: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      // If user doesn't exist, return empty capabilities
      return NextResponse.json({
        userId: userId,
        roleId: null,
        roleName: 'No Role',
        capabilities: []
      })
    }

    // Extract capabilities from role
    let capabilities = user.role?.capabilities?.map(rc => rc.capability) || []

    // If user has no role, give them basic capabilities based on userType
    if (!user.role) {
      switch (user.userType) {
        case 'ADMIN':
          // Admin gets all capabilities
          capabilities = [
            'can_create_projects',
            'can_view_own_projects',
            'can_view_all_projects',
            'can_edit_own_projects',
            'can_edit_all_projects',
            'can_delete_own_projects',
            'can_delete_all_projects',
            'can_export_projects',
            'can_view_users',
            'can_create_users',
            'can_edit_users',
            'can_delete_users',
            'can_manage_user_roles',
            'can_activate_deactivate_users',
            'can_view_user_analytics',
            'can_view_own_payments',
            'can_view_all_payments',
            'can_confirm_payments',
            'can_process_refunds',
            'can_export_payment_data',
            'can_access_admin_panel',
            'can_manage_system_settings',
            'can_view_analytics',
            'can_manage_notifications',
            'can_backup_data',
            'can_restore_data',
            'can_manage_announcements',
            'can_view_audit_logs'
          ]
          break
        case 'REGULAR':
        case 'CORPORATION':
        case 'EDUCATION':
        default:
          // Regular users get basic project capabilities
          capabilities = [
            'can_create_projects',
            'can_view_own_projects',
            'can_edit_own_projects',
            'can_delete_own_projects',
            'can_view_own_payments'
          ]
          break
      }
    }

    return NextResponse.json({
      userId: user.id,
      roleId: user.role?.id || 'temp-admin',
      roleName: user.role?.name || 'Admin',
      capabilities
    })
  } catch (error) {
    console.error('Error fetching user capabilities:', error)
    return NextResponse.json({ error: 'Failed to fetch user capabilities' }, { status: 500 })
  }
}
