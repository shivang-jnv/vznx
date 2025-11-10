export interface Project {
  _id: string;
  name: string;
  status: 'In Progress' | 'Completed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  name: string;
  isComplete: boolean;
  projectId: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  taskCount?: number;
  capacityLevel?: 'green' | 'orange' | 'red';
  capacityPercentage?: number;
  createdAt: string;
  updatedAt: string;
}
