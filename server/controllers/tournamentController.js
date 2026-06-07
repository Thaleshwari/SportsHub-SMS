const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Team = require('../models/Team');

// @desc    Create new tournament
// @route   POST /api/tournaments
// @access  Private/Organizer/Admin
exports.createTournament = async (req, res) => {
    try {
        const { title, sportType, format, venue, startDate, endDate, rules } = req.body;

        const tournament = await Tournament.create({
            title,
            sportType,
            format,
            venue,
            startDate,
            endDate,
            rules,
            organizer: req.user._id
        });

        res.status(201).json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
exports.getTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find().populate('organizer', 'name email');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
exports.getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('organizer', 'name email');
        
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private/Organizer/Admin
exports.updateTournament = async (req, res) => {
    try {
        let tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if user is organizer or admin
        if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'User not authorized to update this tournament' });
        }

        tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(tournament);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private/Organizer/Admin
exports.deleteTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'User not authorized to delete this tournament' });
        }

        await tournament.deleteOne();
        res.json({ message: 'Tournament removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tournament leaderboard
// @route   GET /api/tournaments/:id/leaderboard
// @access  Public
exports.getTournamentLeaderboard = async (req, res) => {
    try {
        const tournamentId = req.params.id;
        const teams = await Team.find({ tournament: tournamentId, status: 'Approved' });
        const matches = await Match.find({ tournament: tournamentId, status: 'Completed' });

        const leaderboard = teams.map(team => {
            let played = 0, won = 0, lost = 0, drawn = 0, gf = 0, ga = 0;

            matches.forEach(match => {
                const isTeamA = match.teamA.team.toString() === team._id.toString();
                const isTeamB = match.teamB.team.toString() === team._id.toString();

                if (isTeamA || isTeamB) {
                    played++;
                    
                    const myScore = isTeamA ? match.teamA.score : match.teamB.score;
                    const oppScore = isTeamA ? match.teamB.score : match.teamA.score;

                    gf += myScore || 0;
                    ga += oppScore || 0;

                    if (myScore > oppScore) {
                        won++;
                    } else if (myScore < oppScore) {
                        lost++;
                    } else {
                        drawn++;
                    }
                }
            });

            const pts = (won * 3) + (drawn * 1);
            const gd = gf - ga;

            return {
                _id: team._id,
                name: team.teamName,
                played,
                won,
                lost,
                drawn,
                gf,
                ga,
                gd,
                pts
            };
        });

        // Sort by Points, then Goal Difference, then Goals For
        leaderboard.sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
        });

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
