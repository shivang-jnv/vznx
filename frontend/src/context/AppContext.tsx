import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import type { Project, Task, TeamMember } from '../types/index';

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProjects: (projects: Project[]) => void;
  updateTasks: (tasks: Task[]) => void;
  updateTeamMembers: (members: TeamMember[]) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProjects = useCallback((newProjects: Project[]) => {
    setProjects(newProjects);
  }, []);

  const updateTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
  }, []);

  const updateTeamMembers = useCallback((newMembers: TeamMember[]) => {
    setTeamMembers(newMembers);
  }, []);

  const value: AppContextType = {
    projects,
    tasks,
    teamMembers,
    loading,
    error,
    setLoading,
    setError,
    updateProjects,
    updateTasks,
    updateTeamMembers
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
