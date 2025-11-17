import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { teamService } from "../services/teamService";
import TaskItem from "../components/TaskItem";
import type { Project, Task, TeamMember } from "../types/index";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  // helper to normalize assignedTo to id string or null
  const normalizeTasks = (tasksFromApi: any[]): Task[] =>
    tasksFromApi.map((t) => ({
      ...t,
      assignedTo:
        t.assignedTo && typeof t.assignedTo === "object"
          ? (t.assignedTo as any)._id
          : t.assignedTo ?? null,
    }));

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [projectData, tasksData, membersData] = await Promise.all([
        projectService.getProjectById(id),
        taskService.getProjectTasks(id),
        teamService.getAllTeamMembers(),
      ]);
      setProject(projectData);
      setTasks(normalizeTasks(tasksData)); // <-- normalize here
      setTeamMembers(membersData);
      setError(null);
    } catch (err) {
      setError("Failed to load project details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !id) return;

    try {
      await taskService.createTask(id, {
        name: newTaskName,
        assignedTo: newTaskAssignee || null,
      });
      setNewTaskName("");
      setNewTaskAssignee("");
      setShowForm(false);

      // After creating task, recalculate progress (new task is incomplete, so progress decreases)
      const newTotalTasks = tasks.length + 1;
      const completedTasks = tasks.filter((task) => task.isComplete).length;
      const newProgress =
        newTotalTasks > 0
          ? Math.round((completedTasks / newTotalTasks) * 100)
          : 0;

      // Update project status (should be "In Progress" since new task is incomplete)
      if (project && project.status === "Completed") {
        await projectService.updateProject(project._id, {
          progress: newProgress,
          status: "In Progress",
        });
      }

      fetchProjectData();
    } catch (err) {
      setError("Failed to create task");
      console.error(err);
    }
  };

  const handleToggleTask = async (taskId: string, isComplete: boolean) => {
    try {
      // If task is being marked as complete, unassign it automatically
      const taskToUpdate = tasks.find((task) => task._id === taskId);
      const updateData: Partial<Task> = { isComplete };

      if (isComplete && taskToUpdate?.assignedTo) {
        updateData.assignedTo = null;
      }

      // Optimistically update the task in local state
      const updatedTasks = tasks.map((task) =>
        task._id === taskId
          ? {
              ...task,
              isComplete,
              assignedTo: isComplete ? null : task.assignedTo,
            }
          : task
      );
      setTasks(updatedTasks);

      // Update the task on the server
      await taskService.updateTask(taskId, updateData);

      // Calculate new progress
      const completedTasks = updatedTasks.filter(
        (task) => task.isComplete
      ).length;
      const totalTasks = updatedTasks.length;
      const newProgress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Update project status based on progress
      const newStatus = newProgress === 100 ? "Completed" : "In Progress";

      // Update project if status or progress changed
      if (
        project &&
        (project.progress !== newProgress || project.status !== newStatus)
      ) {
        await projectService.updateProject(project._id, {
          progress: newProgress,
          status: newStatus,
        });
      }

      // Refresh to ensure sync
      const [tasksData, membersData] = await Promise.all([
        taskService.getProjectTasks(id!),
        teamService.getAllTeamMembers(),
      ]);
      setTasks(normalizeTasks(tasksData)); // <-- normalize here
      setTeamMembers(membersData);
    } catch (err) {
      setError("Failed to update task");
      console.error(err);
      // Revert on error
      fetchProjectData();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;

    try {
      await taskService.deleteTask(taskId);

      // After deleting task, recalculate progress and update project status
      const remainingTasks = tasks.filter((task) => task._id !== taskId);
      const completedTasks = remainingTasks.filter(
        (task) => task.isComplete
      ).length;
      const totalTasks = remainingTasks.length;
      const newProgress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Update project status based on progress
      const newStatus = newProgress === 100 ? "Completed" : "In Progress";

      // Update project if status or progress changed
      if (
        project &&
        (project.progress !== newProgress || project.status !== newStatus)
      ) {
        await projectService.updateProject(project._id, {
          progress: newProgress,
          status: newStatus,
        });
      }

      fetchProjectData();
    } catch (err) {
      setError("Failed to delete task");
      console.error(err);
    }
  };

  const handleAssignTask = async (
    taskId: string,
    assignedTo: string | null
  ) => {
    try {
      // Optimistically update the task in local state immediately
      const updatedTasks = tasks.map((task) =>
        task._id === taskId ? { ...task, assignedTo } : task
      );
      setTasks(updatedTasks);

      // Update the task on the server
      await taskService.updateTask(taskId, { assignedTo });

      // Refresh tasks and team members to ensure sync (but don't show loading)
      const [tasksData, membersData] = await Promise.all([
        taskService.getProjectTasks(id!),
        teamService.getAllTeamMembers(),
      ]);
      setTasks(normalizeTasks(tasksData)); // <-- normalize here
      setTeamMembers(membersData);
    } catch (err) {
      setError("Failed to assign task");
      console.error(err);
      // Revert on error by refreshing
      fetchProjectData();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading project...</div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">Project not found</div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Projects
      </button>

      <div className="bg-white/80 dark:bg-[#0D1117]/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-[#1a1f2e] p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Project Overview</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{project.name}</h1>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
              project.status === "Completed"
                ? "bg-green-500/15 border-green-400/40 text-green-300"
                : "bg-blue-500/15 border-blue-400/40 text-blue-200"
            }`}
          >
            {project.status}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {project.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-[#1a1f2e] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/30"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Execution</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Tasks ({tasks.length})
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 font-medium"
        >
          {showForm ? "Cancel" : "+ New Task"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateTask}
          className="p-6 bg-white/80 dark:bg-[#0D1117]/90 border border-gray-200/60 dark:border-[#1a1f2e] rounded-2xl shadow-sm space-y-4"
        >
          <div className="space-y-3">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter task name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-[#1a1f2e] bg-white dark:bg-[#050911] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-[#1a1f2e] bg-white dark:bg-[#050911] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 font-medium"
          >
            Create Task
          </button>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-[#0D1117]/80 border border-dashed border-gray-200 dark:border-[#1a1f2e] rounded-2xl">
          No tasks yet. Add your first task to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              teamMembers={teamMembers}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onAssign={handleAssignTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
