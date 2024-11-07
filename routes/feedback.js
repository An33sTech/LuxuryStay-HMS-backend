const express = require('express');
const Feedback = require('../models/Feedback');
const router = express.Router();

// Create a new feedback entry
router.post('/', async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all feedback entries
router.get('/', async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('guest', 'username') // populate guest with username only
            .populate('reservation');
        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get feedback by reservation ID
router.get('/reservation/:reservationId', async (req, res) => {
    try {
        const feedback = await Feedback.find({ reservation: req.params.reservationId })
            .populate('guest', 'username')
            .populate('reservation');
        if (!feedback) return res.status(404).json({ message: 'No feedback found for this reservation' });
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get feedback by guest ID
router.get('/guest/:guestId', async (req, res) => {
    try {
        const feedback = await Feedback.find({ guest: req.params.guestId })
            .populate('guest', 'username')
            .populate('reservation');
        if (!feedback) return res.status(404).json({ message: 'No feedback found for this guest' });
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a feedback entry
router.put('/:id', async (req, res) => {
    try {
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('guest', 'username').populate('reservation');
        
        if (!updatedFeedback) return res.status(404).json({ message: 'Feedback not found' });
        
        res.status(200).json(updatedFeedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a feedback entry
router.delete('/:id', async (req, res) => {
    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!deletedFeedback) return res.status(404).json({ message: 'Feedback not found' });
        
        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;