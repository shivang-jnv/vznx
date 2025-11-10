import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/ProjectCard';
import type { Project } from '../types/index';

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await projectService.createProject({ name: newProjectName });
      setNewProjectName('');
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project and all its tasks?')) return;

    try {
      await projectService.deleteProject(id);
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading projects...</div>;
  }

  return (
    <div className=''>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateProject} className="mb-6 p-6 bg-white rounded-lg shadow-sm border">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Project
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No projects yet. Create your first project to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
