const Match = require('../models/Match');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// @desc    Generate fixtures for a tournament
// @route   POST /api/matches/generate/:tournamentId
// @access  Private/Organizer/Admin
exports.generateFixtures = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        const teams = await Team.find({ tournament: req.params.tournamentId, status: 'Approved' });
        if (teams.length < 2) {
            return res.status(400).json({ message: 'At least 2 approved teams required to generate fixtures' });
        }

        // Clear existing fixtures for this tournament
        await Match.deleteMany({ tournament: req.params.tournamentId });

        let fixtures = [];
        const startDate = new Date(tournament.startDate);
        const endDate = new Date(tournament.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();

        if (tournament.format === 'Knockout') {
            // Simple Knockout Pairing (Random)
            let shuffledTeams = [...teams].sort(() => 0.5 - Math.random());
            const numMatches = Math.floor(shuffledTeams.length / 2);
            const timeStep = numMatches > 1 ? timeDiff / (numMatches - 1) : 0;

            for (let i = 0; i < shuffledTeams.length; i += 2) {
                if (shuffledTeams[i + 1]) {
                    const matchIndex = i / 2;
                    const scheduleDate = new Date(startDate.getTime() + (matchIndex * timeStep));
                    
                    fixtures.push({
                        tournament: tournament._id,
                        teamA: { team: shuffledTeams[i]._id },
                        teamB: { team: shuffledTeams[i + 1]._id },
                        venue: tournament.venue,
                        schedule: scheduleDate,
                        round: 'Round 1'
                    });
                }
            }
        } else {
            // Round Robin (Simplified)
            let matchIndex = 0;
            const totalMatches = (teams.length * (teams.length - 1)) / 2;
            const timeStep = totalMatches > 1 ? timeDiff / (totalMatches - 1) : 0;

            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const scheduleDate = new Date(startDate.getTime() + (matchIndex * timeStep));
                    fixtures.push({
                        tournament: tournament._id,
                        teamA: { team: teams[i]._id },
                        teamB: { team: teams[j]._id },
                        venue: tournament.venue,
                        schedule: scheduleDate,
                        round: 'League Match'
                    });
                    matchIndex++;
                }
            }
        }

        await Match.insertMany(fixtures);
        
        // Fetch newly created matches and populate teams to send back
        const createdMatches = await Match.find({ tournament: tournament._id })
            .populate('teamA.team', 'teamName')
            .populate('teamB.team', 'teamName')
            .sort({ schedule: 1 });

        res.status(201).json(createdMatches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update match score (Live)
// @route   PUT /api/matches/:id/score
// @access  Private/Organizer/Admin
exports.updateMatchScore = async (req, res) => {
    try {
        const { scoreA, scoreB, event, status } = req.body;
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        if (scoreA !== undefined) match.teamA.score = scoreA;
        if (scoreB !== undefined) match.teamB.score = scoreB;
        if (status !== undefined) match.status = status;
        
        if (event) {
            match.events.push(event);
        }

        // Determine winner if completed
        if (match.status === 'Completed') {
            if (match.teamA.score > match.teamB.score) {
                match.winner = match.teamA.team;
            } else if (match.teamB.score > match.teamA.score) {
                match.winner = match.teamB.team;
            } else {
                match.winner = match.teamA.team; // Default tie breaker: Team A advances
            }
        }

        await match.save();

        // Check if round is complete for Auto-Progression
        if (match.status === 'Completed') {
            const tournament = await Tournament.findById(match.tournament);
            if (tournament.format === 'Knockout') {
                const roundMatches = await Match.find({ tournament: tournament._id, round: match.round });
                const allCompleted = roundMatches.every(m => m.status === 'Completed');

                if (allCompleted) {
                    const winners = roundMatches.map(m => m.winner);
                    if (winners.length >= 2) {
                        const roundNumber = parseInt(match.round.replace(/[^0-9]/g, '')) || 1;
                        const nextRoundName = `Round ${roundNumber + 1}`;
                        
                        let newFixtures = [];
                        for (let i = 0; i < winners.length; i += 2) {
                            if (winners[i + 1]) {
                                const nextSchedule = new Date();
                                nextSchedule.setDate(nextSchedule.getDate() + 1);

                                newFixtures.push({
                                    tournament: tournament._id,
                                    teamA: { team: winners[i] },
                                    teamB: { team: winners[i + 1] },
                                    venue: tournament.venue,
                                    schedule: nextSchedule,
                                    round: nextRoundName
                                });
                            }
                        }
                        
                        if (newFixtures.length > 0) {
                            await Match.insertMany(newFixtures);
                        }
                    }
                }
            }
        }

        // Emit Socket.io event for real-time updates
        const io = req.app.get('socketio');
        const updatedMatch = await Match.findById(match._id).populate('teamA.team').populate('teamB.team');
        io.to(match._id.toString()).emit('score_updated', updatedMatch);
        io.emit('score_updated', updatedMatch); // Also broadcast generally for Live Center

        res.json(updatedMatch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tournament matches
// @route   GET /api/matches/tournament/:tournamentId
// @access  Public
exports.getTournamentMatches = async (req, res) => {
    try {
        const matches = await Match.find({ tournament: req.params.tournamentId })
            .populate('teamA.team')
            .populate('teamB.team');
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all live matches
// @route   GET /api/matches/live
// @access  Public
exports.getLiveMatches = async (req, res) => {
    try {
        const matches = await Match.find({ status: 'Live' })
            .populate('teamA.team')
            .populate('teamB.team');
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
