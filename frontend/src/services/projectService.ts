import API from './api';
import type { Project } from '../types/index';

export const projectService = {
  // Get all projects
  getAllProjects: async (): Promise<Project[]> => {
    const response = await API.get('/projects');
    return response.data;
  },

  // Get single project by ID
  getProjectById: async (id: string): Promise<Project> => {
    const response = await API.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  createProject: async (data: { name: string; status?: string; progress?: number }): Promise<Project> => {
    const response = await API.post('/projects', data);
    return response.data;
  },

  // Update project
  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await API.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await API.delete(`/projects/${id}`);
  }
};
