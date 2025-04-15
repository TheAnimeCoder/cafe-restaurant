const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    location: {
        type: String,
        enum: ['window', 'main', 'private', 'outdoor'],
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    currentReservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
        default: null
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'occupied', 'maintenance'],
        default: 'available'
    },
    lastStatusUpdate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware to update lastStatusUpdate
tableSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.lastStatusUpdate = new Date();
    }
    next();
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;