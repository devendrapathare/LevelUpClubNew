const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient();

async function assignTasks() {
  try {
    // Get all students (users with role 'student')
    const students = await prisma.user.findMany({
      where: {
        role: 'student'
      }
    });

    // Get all tasks
    const tasks = await prisma.task.findMany();

    console.log(`Found ${students.length} students and ${tasks.length} tasks`);

    // Assign all tasks to each student
    for (const student of students) {
      console.log(`Assigning tasks to ${student.name} (${student.email})`);
      
      for (const task of tasks) {
        // Check if task is already assigned to this user
        const existingAssignment = await prisma.taskAssignment.findUnique({
          where: {
            task_id_user_id: {
              task_id: task.id,
              user_id: student.id
            }
          }
        });

        if (!existingAssignment) {
          // Create task assignment
          const assignment = await prisma.taskAssignment.create({
            data: {
              task_id: task.id,
              user_id: student.id,
              status: 'pending'
            }
          });
          console.log(`  Assigned task "${task.title}" (ID: ${assignment.id})`);
        } else {
          console.log(`  Task "${task.title}" already assigned`);
        }
      }
    }

    console.log('Task assignment completed successfully!');
  } catch (error) {
    console.error('Error assigning tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignTasks();