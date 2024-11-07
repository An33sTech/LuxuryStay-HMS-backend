const express = require('express');
const Notification = require('../models/Notification');
const router = express.Router();

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const newNotification = new Notification(req.body);
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all notifications for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.params.userId });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const updatedNotification = await Notification.findByIdAndUpdate(
            req.params.id,
            { status: 'read' },
            { new: true }
        );
        if (!updatedNotification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
        if (!deletedNotification) return res.status(404).json({ message: 'Notification not found' });
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread notifications count for a specific user
router.get('/user/:userId/unread-count', async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({ user: req.params.userId, status: 'unread' });
        res.status(200).json({ unreadCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;