const express = require('express');
const router = express.Router();
const {
    registerTeam,
    getTournamentTeams,
    updateTeamStatus,
    getTeamById
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Team Captain', 'Admin'), registerTeam);

router.route('/tournament/:tournamentId')
    .get(getTournamentTeams);

router.route('/:id')
    .get(getTeamById);

router.route('/:id/status')
    .put(protect, authorize('Admin', 'Organizer'), updateTeamStatus);

module.exports = router;
