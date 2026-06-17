const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function seedTasks() {
  try {
    // Create some sample tasks
    const tasks = [
      {
        title: "Data Analyst Task 1",
        description: "This is the description for Data Analyst task #1.",
        xp_reward: 127
      },
      {
        title: "Update Your Resume",
        description: "Tailor your resume with your latest skills.",
        xp_reward: 50
      },
      {
        title: "Complete Python Course",
        description: "Finish the Python for Data Science course on Coursera.",
        xp_reward: 75
      },
      {
        title: "Network with 3 Professionals",
        description: "Connect with at least 3 professionals in your field on LinkedIn.",
        xp_reward: 40
      }
    ];

    // Insert tasks into the database
    for (const taskData of tasks) {
      const task = await prisma.task.create({
        data: taskData
      });
      console.log(`Created task: ${task.title}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTasks();