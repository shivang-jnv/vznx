const Task = require('../models/Task');
const Project = require('../models/Project');

// Create task
exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      name: req.body.name,
      projectId: req.body.projectId,
      assignedTo: req.body.assignedTo || null
    });
    const newTask = await task.save();
    
    // Recalculate project progress
    await recalculateProjectProgress(req.body.projectId);
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update task (toggle status or edit)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (req.body.name) task.name = req.body.name;
    if (req.body.isComplete !== undefined) task.isComplete = req.body.isComplete;
    if (req.body.assignedTo !== undefined) task.assignedTo = req.body.assignedTo;
    
    const updatedTask = await task.save();
    
    // Recalculate project progress after task status change
    await recalculateProjectProgress(task.projectId);
    
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const projectId = task.projectId;
    await task.deleteOne();
    
    // Recalculate project progress after deletion
    await recalculateProjectProgress(projectId);
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to recalculate project progress
async function recalculateProjectProgress(projectId) {
  const tasks = await Task.find({ projectId });
  
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return;
  }
  
  const completedTasks = tasks.filter(task => task.isComplete).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);
  
  await Project.findByIdAndUpdate(projectId, { progress });
}

module.exports = exports;
