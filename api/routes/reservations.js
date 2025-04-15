const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const moment = require('moment');

// Enhanced validation middleware
const validateReservation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .matches(/^[A-Za-z]+ [A-Za-z]+/).withMessage('Please enter your full name (first and last name)'),
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in format (XXX) XXX-XXXX'),
    body('date')
        .isISO8601().withMessage('Valid date is required')
        .custom(value => {
            const date = moment(value);
            if (date.isBefore(moment().startOf('day'))) {
                throw new Error('Reservation date must be in the future');
            }
            if (date.isAfter(moment().add(3, 'months'))) {
                throw new Error('Reservations can only be made up to 3 months in advance');
            }
            return true;
        }),
    body('time')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM)')
        .custom((value, { req }) => {
            const datetime = moment(`${req.body.date} ${value}`);
            const hours = datetime.hours();
            const minutes = datetime.minutes();
            
            if (hours < 11 || (hours === 22 && minutes > 0) || hours > 22) {
                throw new Error('Reservations are only available between 11:00 AM and 10:00 PM');
            }
            if (datetime.isBefore(moment())) {
                throw new Error('Reservation time must be in the future');
            }
            return true;
        }),
    body('partySize')
        .isInt({ min: 1, max: 20 }).withMessage('Party size must be between 1 and 20'),
    body('specialRequests')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Special requests limited to 500 characters'),
    body('location')
        .optional()
        .trim()
        .isIn(['indoor', 'outdoor', 'private', '']).withMessage('Invalid location selected')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg;
            return acc;
        }, {});
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: formattedErrors
        });
    }
    next();
};

// Create new reservation with enhanced validation
router.post('/', validateReservation, handleValidationErrors, async (req, res) => {
    try {
        const { date, time, partySize, location } = req.body;
        const reservationDateTime = moment(`${date} ${time}`);

        // Check if time slot is still available
        const existingReservations = await Reservation.find({
            date: reservationDateTime.startOf('day').toDate(),
            time,
            status: { $in: ['confirmed', 'pending'] }
        });

        // Find available table with capacity check
        const tableQuery = {
            capacity: { $gte: partySize },
            isAvailable: true
        };
        
        if (location) {
            tableQuery.location = location;
        }

        const availableTable = await Table.findOne(tableQuery);

        if (!availableTable) {
            // Check for alternative tables if location preference can't be met
            if (location) {
                const anyLocationTable = await Table.findOne({
                    capacity: { $gte: partySize },
                    isAvailable: true
                });
                
                if (anyLocationTable) {
                    return res.status(400).json({ 
                        status: 'error',
                        message: `No tables available in the ${location} section`,
                        alternativeAvailable: true,
                        alternativeLocation: anyLocationTable.location
                    });
                }
            }
            
            return res.status(400).json({
                status: 'error',
                message: 'No suitable tables available for the requested party size'
            });
        }

        // Create reservation
        const reservation = new Reservation({
            ...req.body,
            tableNumber: availableTable.tableNumber,
            status: 'confirmed'
        });

        await reservation.save();

        // Update table status
        availableTable.isAvailable = false;
        availableTable.currentReservation = reservation._id;
        await availableTable.save();

        // Broadcast table status update
        global.io.emit('table-status', {
            tableNumber: availableTable.tableNumber,
            status: 'reserved'
        });

        res.status(201).json({
            status: 'success',
            message: 'Reservation created successfully',
            data: reservation
        });
    } catch (error) {
        console.error('Reservation creation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Unable to create reservation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all reservations
router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .sort({ date: 1, time: 1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations' });
    }
});

// Get reservation by ID
router.get('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservation' });
    }
});

// Update reservation status with validation
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid reservation status'
            });
        }

        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                status: 'error',
                message: 'Reservation not found'
            });
        }

        // Check if status update is allowed
        if (reservation.status === 'cancelled' || reservation.status === 'completed') {
            return res.status(400).json({
                status: 'error',
                message: `Cannot update a ${reservation.status} reservation`
            });
        }

        reservation.status = status;
        await reservation.save();

        // Update table status and broadcast
        const table = await Table.findOne({ tableNumber: reservation.tableNumber });
        if (table) {
            if (status === 'cancelled' || status === 'completed') {
                table.isAvailable = true;
                table.currentReservation = null;
                await table.save();

                // Broadcast table status update
                global.io.emit('table-status', {
                    tableNumber: table.tableNumber,
                    status: 'available'
                });
            }
        }

        res.json({
            status: 'success',
            message: 'Reservation status updated successfully',
            data: reservation
        });
    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating reservation status'
        });
    }
});

// Delete reservation
router.delete('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Free up the table
        const table = await Table.findOne({ tableNumber: reservation.tableNumber });
        if (table) {
            table.isAvailable = true;
            table.currentReservation = null;
            await table.save();
        }

        await Reservation.deleteOne({ _id: req.params.id });
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reservation' });
    }
});

module.exports = router;