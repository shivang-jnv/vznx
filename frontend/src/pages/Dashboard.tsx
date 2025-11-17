import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { teamService } from '../services/teamService';
import { taskService } from '../services/taskService';
import type { Project, Task, TeamMember } from '../types';
import { useTheme } from '../context/ThemeContext';

type TaskMap = Record<string, Task[]>;

const Dashboard = () => {
  const { darkMode } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasksByProject, setTasksByProject] = useState<TaskMap>({});
  const [completedTasks, setCompletedTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectData, teamData] = await Promise.all([
        projectService.getAllProjects(),
        teamService.getAllTeamMembers().catch((err) => {
          console.error('Failed to load team members', err);
          return [];
        })
      ]);

      setProjects(projectData);
      setTeamMembers(teamData);

      const tasksResults = await Promise.all(
        projectData.map(async (project) => {
          try {
            const projectTasks = await taskService.getProjectTasks(project._id);
            return { projectId: project._id, tasks: projectTasks };
          } catch (taskError) {
            console.error(`Failed to load tasks for project ${project._id}`, taskError);
            return { projectId: project._id, tasks: [] as Task[] };
          }
        })
      );

      const taskMap: TaskMap = {};
      let completedCount = 0;

      tasksResults.forEach(({ projectId, tasks }) => {
        taskMap[projectId] = tasks;
        completedCount += tasks.filter((task) => task.isComplete).length;
      });

      setTasksByProject(taskMap);
      setCompletedTasks(completedCount);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(
    () => [
      {
        label: 'Active Projects',
        value: projects.length,
        color: 'from-blue-500 to-cyan-500',
        shadow: 'rgba(59,130,246,0.6)'
      },
      {
        label: 'Team Members',
        value: teamMembers.length,
        color: 'from-purple-500 to-pink-500',
        shadow: 'rgba(168,85,247,0.6)'
      },
      {
        label: 'Tasks Complete',
        value: completedTasks,
        color: 'from-orange-500 to-red-500',
        shadow: 'rgba(249,115,22,0.6)'
      }
    ],
    [projects.length, teamMembers.length, completedTasks]
  );

  const formatValue = (value: number) => value.toString().padStart(2, '0');

  const getProjectAvatars = (projectId: string) => {
    const projectTasks = tasksByProject[projectId] ?? [];
    const uniqueAssignees = Array.from(
      new Set(projectTasks.map((task) => task.assignedTo).filter(Boolean))
    ) as string[];

    const assignedMembers = uniqueAssignees
      .map((assigneeId) => teamMembers.find((member) => member._id === assigneeId))
      .filter(Boolean) as TeamMember[];

    if (assignedMembers.length > 0) {
      return assignedMembers;
    }

    return teamMembers.slice(0, Math.min(teamMembers.length, 4));
  };

  const renderAvatar = (member: TeamMember | undefined, index: number) => {
    if (!member) {
      return (
        <div
          key={`placeholder-${index}`}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 border-2 border-white dark:border-[#0D1117] flex items-center justify-center text-white text-xs font-bold"
        >
          ?
        </div>
      );
    }

    return (
      <div
        key={member._id}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-[#0D1117] flex items-center justify-center text-white text-xs font-bold"
      >
        {member.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading dashboard...</div>
      ) : (
        <>
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative bg-white dark:bg-[#0D1117] rounded-2xl p-6 border border-gray-200 dark:border-[#1a1f2e] transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                  style={{
                    boxShadow: darkMode ? 'none' : undefined
                  }}
                  onMouseEnter={(event) => {
                    if (darkMode) {
                      event.currentTarget.style.boxShadow = `0 0 20px ${stat.shadow}`;
                    }
                  }}
                  onMouseLeave={(event) => {
                    if (darkMode) {
                      event.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div className="relative z-10">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{stat.label}</p>
                    <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {formatValue(stat.value)}
                    </p>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-transparent to-white/20 dark:from-transparent dark:to-white/5" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Active Initiatives</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">High fidelity view of every tracked project</p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl shadow-blue-500/30"
              >
                Refresh
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-16 bg-white/70 dark:bg-[#0D1117]/80 border border-dashed border-gray-200 dark:border-[#1a1f2e] rounded-2xl text-gray-500 dark:text-gray-400">
                No projects yet. Create your first project to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => {
                  const avatars = getProjectAvatars(project._id);
                  const progress = Number.isFinite(project.progress) ? project.progress : 0;

                  return (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      aria-label={`Open ${project.name} project`}
                      className="group relative block bg-white/70 dark:bg-[#0D1117]/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-[#1a1f2e] transition-all duration-300 hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                      style={{
                        boxShadow: darkMode ? 'none' : undefined
                      }}
                      onMouseEnter={(event) => {
                        if (darkMode) {
                          event.currentTarget.style.boxShadow =
                            '0 0 25px rgba(139,92,246,0.6), inset 0 0 1px rgba(139,92,246,0.3)';
                        }
                      }}
                      onMouseLeave={(event) => {
                        if (darkMode) {
                          event.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Project</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{project.name}</h3>
                          </div>
                          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30">
                            {project.status}
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-slate-400">Progress</span>
                            <span className="font-semibold text-gray-900 dark:text-slate-200">{progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-[#1a1f2e] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {avatars.length > 0
                              ? avatars.map((member, avatarIndex) => renderAvatar(member, avatarIndex))
                              : renderAvatar(undefined, 0)}
                          </div>
                          <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30">
                            View Details
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
