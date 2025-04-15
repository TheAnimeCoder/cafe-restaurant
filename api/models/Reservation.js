const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    partySize: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    location: {
        type: String,
        enum: ['indoor', 'outdoor', 'private', null],
        default: null
    },
    tableNumber: {
        type: Number,
        required: true
    },
    specialRequests: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for date and time to optimize queries
reservationSchema.index({ date: 1, time: 1 });

module.exports = mongoose.model('Reservation', reservationSchema); 