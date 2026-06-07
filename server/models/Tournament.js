const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a tournament title'],
        trim: true
    },
    sportType: {
        type: String,
        required: [true, 'Please specify the sport type'],
        enum: ['Football', 'Cricket', 'Basketball', 'Tennis', 'Other']
    },
    format: {
        type: String,
        required: [true, 'Please specify the format'],
        enum: ['Knockout', 'League', 'Hybrid']
    },
    venue: {
        type: String,
        required: [true, 'Please specify the venue']
    },
    banner: {
        type: String,
        default: 'https://res.cloudinary.com/demo/image/upload/v1625045472/tournament_banner.jpg'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    organizer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    rules: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tournament', tournamentSchema);
