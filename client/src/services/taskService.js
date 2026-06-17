import api from './api';

class TaskService {
  async uploadTask(userId, taskId, file) {
    // In a real implementation, this would upload the task file to the backend
    // For now, we'll simulate file upload by creating a file URL
    const fileUrl = `https://example.com/uploads/${file.name}`;
    
    try {
      const result = await api.submitTask(taskId, fileUrl);
      
      // The server already updates XP during task submission, so we don't need to call addXP again
      // The user data will be refreshed by the calling component
      
      return {
        success: true,
        message: "Task uploaded successfully!",
        xpEarned: result.xpEarned,
        newLevel: false,
        allTasksCompleted: result.allTasksCompleted,
        newTasksGenerated: result.newTasksGenerated
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to upload task');
    }
  }

  async getUserTasks(userId) {
    try {
      const tasks = await api.getUserTasks(userId);
      return tasks.map(task => ({
        id: task.task_id,
        title: task.title,
        desc: task.description,
        xp: task.xp,
        completed: task.status === 'completed' || task.status === 'verified'
      }));
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch tasks');
    }
  }

  async getTaskHistory(userId) {
    try {
      const taskHistory = await api.getTaskHistory(userId);
      return taskHistory.map(task => ({
        id: task.id,
        task_id: task.task_id,
        title: task.title,
        description: task.description,
        xpReward: task.xp_reward,
        xpEarned: task.xp_earned,
        fileUrl: task.file_url,
        submittedAt: task.submitted_at,
        createdAt: task.created_at
      }));
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch task history');
    }
  }

  async completeTask(userId, taskId) {
    // This is now handled by uploadTask
    throw new Error('Use uploadTask instead');
  }
}

export default new TaskService();