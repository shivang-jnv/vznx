import type { Task, TeamMember } from '../types/index';

interface TaskItemProps {
  task: Task;
  teamMembers: TeamMember[];
  onToggle: (id: string, isComplete: boolean) => void;
  onDelete: (id: string) => void;
  onAssign: (id: string, assignedTo: string | null) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, teamMembers, onToggle, onDelete, onAssign }) => {
  const assignedMember = task.assignedTo 
    ? teamMembers.find(member => member._id === task.assignedTo)
    : null;
  
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-[#1a1f2e] rounded-lg hover:bg-gray-50 dark:hover:bg-[#141a2c] transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={task.isComplete}
          onChange={(e) => onToggle(task._id, e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 dark:border-[#2a3350] bg-white dark:bg-[#050911] text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          aria-label={`Mark ${task.name} as ${task.isComplete ? 'incomplete' : 'complete'}`}
        />
        <span 
          className={`text-base transition-all ${
            task.isComplete 
              ? 'line-through text-gray-400 dark:text-gray-500' 
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {task.name}
        </span>
        {task.isComplete && (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <select
          value={task.assignedTo || ''}
          onChange={(e) => onAssign(task._id, e.target.value || null)}
          disabled={task.isComplete}
          className={`px-3 py-1 text-sm border border-gray-300 dark:border-[#1a1f2e] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-[#050911] dark:text-gray-100 ${
            task.isComplete ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Assign task to team member"
        >
          <option value="">Unassigned</option>
          {teamMembers.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
        
        {assignedMember && !task.isComplete && (
          <span className="px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-200 bg-blue-100 dark:bg-blue-500/20 rounded">
            {assignedMember.name}
          </span>
        )}
        
        <button
          onClick={() => onDelete(task._id)}
          className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          aria-label="Delete task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
