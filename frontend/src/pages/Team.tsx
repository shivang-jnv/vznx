import { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';
import TeamMemberCard from '../components/TeamMemberCard';
import type { TeamMember } from '../types/index';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const data = await teamService.getAllTeamMembers();
      setTeamMembers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load team members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      await teamService.createTeamMember({ name: newMemberName });
      setNewMemberName('');
      setShowForm(false);
      fetchTeamMembers();
    } catch (err) {
      setError('Failed to create team member');
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Delete this team member? All assigned tasks will be unassigned.')) return;

    try {
      await teamService.deleteTeamMember(id);
      fetchTeamMembers();
    } catch (err) {
      setError('Failed to delete team member');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading team members...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {showForm ? 'Cancel' : '+ New Member'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateMember} className="mb-6 p-6 bg-white rounded-lg shadow-sm border">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Enter member name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Member
          </button>
        </form>
      )}

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Capacity Indicators:</h3>
        <div className="space-y-1 text-sm">
          <p className="text-green-700">🟢 Green: 0-3 tasks (Available)</p>
          <p className="text-orange-700">🟠 Orange: 4-6 tasks (Moderate)</p>
          <p className="text-red-700">🔴 Red: 7+ tasks (Overloaded)</p>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No team members yet. Add your first team member to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member._id}
              member={member}
              onDelete={handleDeleteMember}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Team;
