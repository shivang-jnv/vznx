const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Standalone task routes (alternative structure if needed)
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
