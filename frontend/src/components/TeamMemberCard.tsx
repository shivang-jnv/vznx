import type { TeamMember } from '../types/index';

interface TeamMemberCardProps {
  member: TeamMember;
  onDelete: (id: string) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onDelete }) => {
  const getCapacityColor = (level?: string) => {
    switch (level) {
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getCapacityBgColor = (level?: string) => {
    switch (level) {
      case 'green':
        return 'bg-green-50 border-green-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getCapacityText = (level?: string) => {
    switch (level) {
      case 'green':
        return 'text-green-700';
      case 'orange':
        return 'text-orange-700';
      case 'red':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={`rounded-lg border p-6 transition-all hover:shadow-md ${getCapacityBgColor(member.capacityLevel)}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {member.taskCount || 0} task{member.taskCount !== 1 ? 's' : ''} assigned
          </p>
        </div>
        <button
          onClick={() => onDelete(member._id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="Delete team member"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className={`font-medium ${getCapacityText(member.capacityLevel)}`}>
            Capacity: {member.capacityLevel?.toUpperCase()}
          </span>
          <span className="text-gray-600">{member.capacityPercentage || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getCapacityColor(member.capacityLevel)}`}
            style={{ width: `${member.capacityPercentage || 0}%` }}
            role="progressbar"
            aria-valuenow={member.capacityPercentage || 0}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
