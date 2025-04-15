const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// Get all tables
router.get('/', async (req, res) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tables' });
    }
});

// Get available tables
router.get('/available', async (req, res) => {
    try {
        const { capacity, location } = req.query;
        const query = { isAvailable: true };
        
        if (capacity) {
            query.capacity = { $gte: parseInt(capacity) };
        }
        
        if (location) {
            query.location = location;
        }

        const tables = await Table.find(query).sort({ tableNumber: 1 });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available tables' });
    }
});

// Create a new table
router.post('/', async (req, res) => {
    try {
        const table = new Table(req.body);
        await table.save();
        res.status(201).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error creating table' });
    }
});

// Update table status
router.patch('/:id/status', async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const table = await Table.findById(req.params.id);
        
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        table.isAvailable = isAvailable;
        await table.save();
        res.json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error updating table status' });
    }
});

// Delete table
router.delete('/:id', async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        if (table.currentReservation) {
            return res.status(400).json({ message: 'Cannot delete table with active reservation' });
        }

        await Table.deleteOne({ _id: req.params.id });
        res.json({ message: 'Table deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting table' });
    }
});

module.exports = router; 