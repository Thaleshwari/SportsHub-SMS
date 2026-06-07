const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    jerseyNumber: { type: Number },
    position: { type: String },
    age: { type: Number }
});

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: [true, 'Please add a team name'],
        trim: true
    },
    logo: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1625045472/team_logo.png'
    },
    captain: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    tournament: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tournament',
        required: true
    },
    players: [playerSchema],
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    stats: {
        played: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
        lost: { type: Number, default: 0 },
        drawn: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        goalsFor: { type: Number, default: 0 },
        goalsAgainst: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Team', teamSchema);
