import type { TeamMember } from '../types/index';

interface TeamMemberCardProps {
  member: TeamMember;
  onDelete: (id: string) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onDelete }) => {
  const capacityStyles = {
    green: {
      badge: 'bg-green-500/15 text-green-200 border border-green-500/30',
      bar: 'bg-green-400'
    },
    orange: {
      badge: 'bg-orange-500/15 text-orange-200 border border-orange-500/30',
      bar: 'bg-orange-400'
    },
    red: {
      badge: 'bg-red-500/15 text-red-200 border border-red-500/30',
      bar: 'bg-red-400'
    },
    default: {
      badge: 'bg-gray-500/15 text-gray-200 border border-gray-500/30',
      bar: 'bg-gray-400'
    }
  };

  const styleKey = (member.capacityLevel as keyof typeof capacityStyles) || 'default';
  const currentStyle = capacityStyles[styleKey] ?? capacityStyles.default;
  const updatedLabel = member.updatedAt ? new Date(member.updatedAt).toLocaleDateString() : 'recently';

  return (
    <div className="group relative bg-white/70 dark:bg-[#0D1117]/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-[#1a1f2e] transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-white/0 to-white/10 dark:from-white/0 dark:to-white/5" />
      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Contributor</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{member.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {member.taskCount || 0} task{member.taskCount !== 1 ? 's' : ''} assigned
            </p>
          </div>
          <button
            onClick={() => onDelete(member._id)}
            className="text-red-500 hover:text-red-400 transition-colors"
            aria-label="Delete team member"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentStyle.badge}`}>
              {member.capacityLevel?.toUpperCase() ?? 'UNKNOWN'}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {member.capacityPercentage || 0}% load
            </span>
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-[#1a1f2e] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${currentStyle.bar}`}
              style={{ width: `${member.capacityPercentage || 0}%` }}
              role="progressbar"
              aria-valuenow={member.capacityPercentage || 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Updated {updatedLabel}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
