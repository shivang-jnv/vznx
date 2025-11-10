const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');

// Project routes
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Task routes nested under projects
router.get('/:id/tasks', projectController.getProjectTasks);
router.post('/:id/tasks', taskController.createTask);
router.put('/:id/tasks/:taskId', taskController.updateTask);
router.delete('/:id/tasks/:taskId', taskController.deleteTask);

module.exports = router;
