const express = require('express');
const router = express.Router();
const {
    createTournament,
    getTournaments,
    getTournamentById,
    updateTournament,
    deleteTournament,
    getTournamentLeaderboard
} = require('../controllers/tournamentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getTournaments)
    .post(protect, authorize('Admin', 'Organizer'), createTournament);

router.route('/:id')
    .get(getTournamentById)
    .put(protect, authorize('Admin', 'Organizer'), updateTournament)
    .delete(protect, authorize('Admin', 'Organizer'), deleteTournament);

router.get('/:id/leaderboard', getTournamentLeaderboard);

module.exports = router;
