const express = require('express');
const router = express.Router();
const {
    generateFixtures,
    updateMatchScore,
    getTournamentMatches,
    getLiveMatches
} = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/live', getLiveMatches);
router.post('/generate/:tournamentId', protect, authorize('Admin', 'Organizer'), generateFixtures);
router.put('/:id/score', protect, authorize('Admin', 'Organizer'), updateMatchScore);
router.get('/tournament/:tournamentId', getTournamentMatches);

module.exports = router;
