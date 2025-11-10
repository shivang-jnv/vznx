const TeamMember = require('../models/TeamMember');
const Task = require('../models/Task');

// Get all team members with task counts
exports.getAllTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find();
    
    // Get task counts for each member using aggregation
    const membersWithCounts = await Promise.all(
      members.map(async (member) => {
        const taskCount = await Task.countDocuments({ assignedTo: member._id });
        
        // Capacity calculation: green <= 3, orange 4-6, red >= 7
        let capacityLevel = 'green';
        if (taskCount >= 7) capacityLevel = 'red';
        else if (taskCount >= 4) capacityLevel = 'orange';
        
        return {
          _id: member._id,
          name: member.name,
          taskCount,
          capacityLevel,
          capacityPercentage: Math.min((taskCount / 10) * 100, 100) // Assuming 10 tasks = 100%
        };
      })
    );
    
    res.json(membersWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create team member
exports.createTeamMember = async (req, res) => {
  try {
    const member = new TeamMember({
      name: req.body.name
    });
    const newMember = await member.save();
    res.status(201).json(newMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete team member
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    // Unassign all tasks assigned to this member
    await Task.updateMany({ assignedTo: req.params.id }, { assignedTo: null });
    
    await member.deleteOne();
    res.json({ message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
