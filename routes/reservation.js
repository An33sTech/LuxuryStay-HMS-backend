const express = require('express');
const Reservation = require('../models/Reservation');
const router = express.Router();
// Create a new reservation
router.post('/', async (req, res) => {
    try {
        const newReservation = new Reservation(req.body);
        await newReservation.save();
        res.status(201).json(newReservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all reservations
router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('guest', 'username profile.name')
            .populate('room', 'roomNumber type');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific reservation by ID
router.get('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate('guest', 'username profile.name')
            .populate('room', 'roomNumber type');
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a reservation by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedReservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(updatedReservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a reservation by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!deletedReservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
