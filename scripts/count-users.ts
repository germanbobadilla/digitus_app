import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countUsers() {
  try {
    const totalUsers = await prisma.user.count();
    console.log(`Total users in database: ${totalUsers}`);

    // Also get some details about the users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\nUser details:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.userType} - ${user.isActive ? 'Active' : 'Inactive'} - Created: ${user.createdAt.toISOString()}`);
    });

  } catch (error) {
    console.error('Error counting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

countUsers();


