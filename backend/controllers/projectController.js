const Project = require('../models/Project');
const Task = require('../models/Task');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const project = new Project({
      name: req.body.name,
      status: req.body.status || 'In Progress',
      progress: req.body.progress || 0
    });
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (req.body.name) project.name = req.body.name;
    if (req.body.status) project.status = req.body.status;
    if (req.body.progress !== undefined) project.progress = req.body.progress;
    
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Delete all tasks associated with this project
    await Task.deleteMany({ projectId: req.params.id });
    
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks for a project
exports.getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.id })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
