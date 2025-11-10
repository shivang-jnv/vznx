import API from './api';
import type { Task } from '../types/index';

export const taskService = {
  // Get tasks for a specific project
  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    const response = await API.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  // Create new task
  createTask: async (projectId: string, data: { name: string; assignedTo?: string | null }): Promise<Task> => {
    const response = await API.post(`/projects/${projectId}/tasks`, {
      ...data,
      projectId
    });
    return response.data;
  },

  // Update task (toggle status or edit)
  updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
    const response = await API.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    await API.delete(`/tasks/${taskId}`);
  }
};
