const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tournament',
        required: true
    },
    teamA: {
        team: { type: mongoose.Schema.ObjectId, ref: 'Team', required: true },
        score: { type: Number, default: 0 }
    },
    teamB: {
        team: { type: mongoose.Schema.ObjectId, ref: 'Team', required: true },
        score: { type: Number, default: 0 }
    },
    venue: {
        type: String,
        required: true
    },
    schedule: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Live', 'Completed', 'Abandoned'],
        default: 'Scheduled'
    },
    round: {
        type: String,
        default: 'Round 1'
    },
    events: [
        {
            type: { type: String, enum: ['Goal', 'Wicket', 'Card', 'Substitution', 'Commentary'] },
            player: { type: String },
            time: { type: String },
            description: { type: String }
        }
    ],
    statistics: {
        type: Map,
        of: String
    },
    winner: {
        type: mongoose.Schema.ObjectId,
        ref: 'Team'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Match', matchSchema);
