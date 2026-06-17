const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function queryCompletedTasks() {
  try {
    // Get all task assignments with status 'completed'
    const completedTasks = await prisma.taskAssignment.findMany({
      where: {
        status: 'completed'
      },
      include: {
        task: true,
        user: true
      },
      orderBy: {
        submitted_at: 'desc'
      }
    });

    console.log(`Found ${completedTasks.length} completed tasks:`);
    
    completedTasks.forEach((assignment, index) => {
      console.log(`\n${index + 1}. Task: ${assignment.task.title}`);
      console.log(`   User: ${assignment.user.name} (${assignment.user.email})`);
      console.log(`   Submitted: ${assignment.submitted_at}`);
      console.log(`   XP Earned: ${assignment.xp_earned}`);
      console.log(`   File URL: ${assignment.file_url}`);
    });

    // Get a specific user's completed tasks
    const user = await prisma.user.findFirst({
      where: {
        role: 'student'
      }
    });

    if (user) {
      console.log(`\n\nCompleted tasks for user: ${user.name}`);
      
      const userCompletedTasks = await prisma.taskAssignment.findMany({
        where: {
          user_id: user.id,
          status: 'completed'
        },
        include: {
          task: true
        },
        orderBy: {
          submitted_at: 'desc'
        }
      });

      console.log(`Found ${userCompletedTasks.length} completed tasks for ${user.name}:`);
      
      userCompletedTasks.forEach((assignment, index) => {
        console.log(`\n${index + 1}. Task: ${assignment.task.title}`);
        console.log(`   Submitted: ${assignment.submitted_at}`);
        console.log(`   XP Earned: ${assignment.xp_earned}`);
        console.log(`   File URL: ${assignment.file_url}`);
      });
    }
  } catch (error) {
    console.error('Error querying completed tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

queryCompletedTasks();