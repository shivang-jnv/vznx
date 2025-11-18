import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../services/projectService";
import { teamService } from "../services/teamService";
import { taskService } from "../services/taskService";
import type { Project, Task, TeamMember } from "../types";
import { useTheme } from "../context/ThemeContext";

type TaskMap = Record<string, Task[]>;

const Dashboard = () => {
  useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasksByProject, setTasksByProject] = useState<TaskMap>({});
  const [completedTasks, setCompletedTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectData, teamData] = await Promise.all([
        projectService.getAllProjects(),
        teamService.getAllTeamMembers().catch((err) => {
          console.error("Failed to load team members", err);
          return [];
        }),
      ]);

      setProjects(projectData);
      setTeamMembers(teamData);

      const tasksResults = await Promise.all(
        projectData.map(async (project) => {
          try {
            const projectTasks = await taskService.getProjectTasks(project._id);
            return { projectId: project._id, tasks: projectTasks };
          } catch (taskError) {
            console.error(
              `Failed to load tasks for project ${project._id}`,
              taskError
            );
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
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeProjectsCount = projects.filter(
      (p) => p.status === "In Progress"
    ).length;
    // total tasks across all projects
    const totalTasks = Object.values(tasksByProject).reduce(
      (acc, arr) => acc + arr.length,
      0
    );

    // tasks remaining (incomplete)
    const tasksToComplete = Math.max(0, totalTasks - completedTasks);

    // compute assigned counts per member to determine idle members
    const assignedCounts: Record<string, number> = {};
    Object.values(tasksByProject)
      .flat()
      .forEach((t) => {
        // normalize assignedTo: it may be a string id or a populated object
        const assignedId =
          typeof t.assignedTo === "string"
            ? t.assignedTo
            : t.assignedTo && typeof t.assignedTo === "object"
            ? (t.assignedTo as any)._id || (t.assignedTo as any).id || null
            : null;

        if (assignedId) {
          assignedCounts[assignedId] = (assignedCounts[assignedId] || 0) + 1;
        }
      });

    // debug: help detect mismatches between team member ids and assigned ids
    // console.debug('assignedCounts', assignedCounts, 'teamMemberIds', teamMembers.map(m=>m._id));

    const idleMembersCount = teamMembers.filter(
      (m) => (assignedCounts[m._id] ?? 0) === 0
    ).length;

    return [
      {
        label: "Active Projects",
        value: activeProjectsCount,
        color: "from-blue-500 to-cyan-500",
        shadow: "rgba(59,130,246,0.6)",
      },
      {
        label: "Idle Team Members",
        value: idleMembersCount,
        color: "from-purple-500 to-pink-500",
        shadow: "rgba(168,85,247,0.6)",
      },
      {
        label: "Tasks To Complete",
        value: tasksToComplete,
        color: "from-orange-500 to-red-500",
        shadow: "rgba(249,115,22,0.6)",
      },
    ];
  }, [projects.length, teamMembers, tasksByProject, completedTasks]);

  const formatValue = (value: number) => value.toString().padStart(2, "0");

  const getProjectAvatars = (projectId: string) => {
    const projectTasks = tasksByProject[projectId] ?? [];
    const uniqueAssignees = Array.from(
      new Set(projectTasks.map((task) => task.assignedTo).filter(Boolean))
    ) as string[];

    const assignedMembers = uniqueAssignees
      .map((assigneeId) =>
        teamMembers.find((member) => member._id === assigneeId)
      )
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
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading dashboard...
        </div>
      ) : (
        <>
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat) => {
                const isIdleCard = stat.label === "Idle Team Members";

                const Card = (
                  <div
                    key={stat.label}
                    className="group relative bg-white dark:bg-[#0D1117] rounded-2xl p-6 border border-gray-200 dark:border-[#1a1f2e] transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                    onMouseEnter={(event) => {
                      event.currentTarget.style.boxShadow = `0 0 20px ${stat.shadow}`;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <div className="relative z-10">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
                        {stat.label}
                      </p>
                      <p
                        className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                      >
                        {formatValue(stat.value)}
                      </p>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-transparent to-white/20 dark:from-transparent dark:to-white/5" />
                  </div>
                );

                return isIdleCard ? (
                  <Link to="/team" key={stat.label} className="no-underline">
                    {Card}
                  </Link>
                ) : (
                  Card
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  Active Initiatives
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  High fidelity view of every tracked project
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNewOpen((s) => !s)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/30"
                >
                  {newOpen ? "Cancel" : "+ New Project"}
                </button>
              </div>
            </div>

            {newOpen && (
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New project name"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-[#1a1f2e] bg-white dark:bg-[#0D1117] text-sm text-gray-400 dark:text-gray-300"
                  />
                  <button
                    onClick={async () => {
                      if (!newName.trim()) return;
                      try {
                        setCreating(true);
                        await projectService.createProject({
                          name: newName.trim(),
                          status: "In Progress",
                          progress: 0,
                        });
                        setNewName("");
                        setNewOpen(false);
                        await fetchDashboardData();
                      } catch (err) {
                        console.error("Failed to create project", err);
                      } finally {
                        setCreating(false);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            )}

            {projects.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0D1117] rounded-2xl border border-gray-200 dark:border-[#1a1f2e]">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No projects found. Start by creating a new project.
                </p>
                <div className="flex justify-center">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    + New Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => {
                  const avatars = getProjectAvatars(project._id);
                  const progress = Number.isFinite(project.progress)
                    ? project.progress
                    : 0;

                  return (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      aria-label={`Open ${project.name} project`}
                      className="group relative block bg-white/70 dark:bg-[#0D1117]/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-[#1a1f2e] transition-all duration-300 hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                      onMouseEnter={(event) => {
                        event.currentTarget.style.boxShadow =
                          "0 0 25px rgba(139,92,246,0.6), inset 0 0 1px rgba(139,92,246,0.3)";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Project
                            </p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                              {project.name}
                            </h3>
                          </div>
                          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30">
                            {project.status}
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-slate-400">
                              Progress
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-slate-200">
                              {progress}%
                            </span>
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
                              ? avatars.map((member, avatarIndex) =>
                                  renderAvatar(member, avatarIndex)
                                )
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
