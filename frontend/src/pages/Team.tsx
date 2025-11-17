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
    return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading team members...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">People Ops</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Team Members</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 font-medium"
        >
          {showForm ? 'Cancel' : '+ New Member'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreateMember}
          className="p-6 bg-white/80 dark:bg-[#0D1117]/90 border border-gray-200/60 dark:border-[#1a1f2e] rounded-2xl shadow-sm"
        >
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Enter member name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-[#1a1f2e] bg-white dark:bg-[#050911] text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 font-medium"
          >
            Add Member
          </button>
        </form>
      )}

      <section className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Capacity Indicators</h3>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <p>🟢 Green: 0-3 tasks (Available)</p>
          <p>🟠 Orange: 4-6 tasks (Moderate)</p>
          <p>🔴 Red: 7+ tasks (Overloaded)</p>
        </div>
      </section>

      {teamMembers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-[#0D1117]/80 border border-dashed border-gray-200 dark:border-[#1a1f2e] rounded-2xl">
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
