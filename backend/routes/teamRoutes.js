const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Team member routes
router.get('/', teamController.getAllTeamMembers);
router.post('/', teamController.createTeamMember);
router.delete('/:id', teamController.deleteTeamMember);

module.exports = router;
