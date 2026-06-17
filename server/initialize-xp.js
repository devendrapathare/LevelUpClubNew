const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function initializeXP() {
  try {
    // Get all users
    const users = await prisma.user.findMany();

    console.log(`Found ${users.length} users`);

    // Initialize XP for each user
    for (const user of users) {
      // If XP is not already initialized (is 0), we can set a starting value
      // For existing users, we'll leave their XP as is
      if (user.xp === 0) {
        // For students, give them some starting XP
        if (user.role === 'student') {
          const startingXP = 10;
          await prisma.user.update({
            where: { id: user.id },
            data: { xp: startingXP }
          });
          console.log(`Initialized XP for ${user.name} (${user.email}): ${startingXP} XP`);
        }
      } else {
        console.log(`User ${user.name} (${user.email}) already has ${user.xp} XP`);
      }
    }

    console.log('XP initialization completed!');
  } catch (error) {
    console.error('Error initializing XP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeXP();