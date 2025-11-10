import API from './api';
import type { TeamMember } from '../types/index';

export const teamService = {
  // Get all team members with task counts and capacity
  getAllTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await API.get('/team');
    return response.data;
  },

  // Create new team member
  createTeamMember: async (data: { name: string }): Promise<TeamMember> => {
    const response = await API.post('/team', data);
    return response.data;
  },

  // Delete team member
  deleteTeamMember: async (id: string): Promise<void> => {
    await API.delete(`/team/${id}`);
  }
};
