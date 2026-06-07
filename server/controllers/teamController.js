const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// @desc    Register a team for a tournament
// @route   POST /api/teams
// @access  Private/Captain
exports.registerTeam = async (req, res) => {
    try {
        const { teamName, tournament, players } = req.body;

        // Check if tournament exists
        const tournamentExists = await Tournament.findById(tournament);
        if (!tournamentExists) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        const team = await Team.create({
            teamName,
            tournament,
            players,
            captain: req.user._id
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all teams for a tournament
// @route   GET /api/teams/tournament/:tournamentId
// @access  Public
exports.getTournamentTeams = async (req, res) => {
    try {
        const teams = await Team.find({ tournament: req.params.tournamentId }).populate('captain', 'name email');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject a team
// @route   PUT /api/teams/:id/status
// @access  Private/Organizer/Admin
exports.updateTeamStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const tournament = await Tournament.findById(team.tournament);
        if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        team.status = status;
        await team.save();

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get team details
// @route   GET /api/teams/:id
// @access  Public
exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate('captain', 'name email').populate('tournament', 'title');
        
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
