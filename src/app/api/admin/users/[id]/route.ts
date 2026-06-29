import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        if (session.user.userType !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id: userId } = await params

        // Prevent admin from deleting themselves
        if (userId === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, userType: true }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Delete user and all related data
        await prisma.$transaction(async (prisma) => {
            // Delete user's projects
            await prisma.project.deleteMany({
                where: { userId: userId }
            })

            // Delete user's payments
            await prisma.payment.deleteMany({
                where: { userId: userId }
            })

            // Delete user's sessions and accounts
            await prisma.session.deleteMany({
                where: { userId: userId }
            })

            await prisma.account.deleteMany({
                where: { userId: userId }
            })

            // Finally delete the user
            await prisma.user.delete({
                where: { id: userId }
            })
        })

        return NextResponse.json({
            message: `User ${user.name} (${user.email}) has been deleted successfully`,
            deletedUser: user
        })

    } catch (error) {
        console.error(`Error deleting user ${params.id}:`, error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
