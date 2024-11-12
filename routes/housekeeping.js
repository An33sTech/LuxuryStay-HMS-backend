const express = require('express');
const Housekeeping = require('../models/Housekeeping');
const router = express.Router();

const mongoose = require('mongoose');
// create housekeeping task
router.post('/', async (req, res) => {
    try {
        // Convert room and assignedTo to ObjectId if they are strings
        if (typeof req.body.room === 'string') {
            req.body.room = new mongoose.Types.ObjectId(req.body.room);
        }

        if (req.body.assignedTo && typeof req.body.assignedTo === 'string') {
            req.body.assignedTo = new mongoose.Types.ObjectId(req.body.assignedTo);
        }

        const newTask = new Housekeeping(req.body);
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Get all housekeeping tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Housekeeping.find().populate('room').populate('assignedTo');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific housekeeping task by ID
router.get('/:id', async (req, res) => {
    try {
        const task = await Housekeeping.findById(req.params.id).populate('room').populate('assignedTo');
        if (!task) return res.status(404).json({ message: 'Housekeeping task not found' });
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a housekeeping task (e.g., mark as completed)
router.put('/:id', async (req, res) => {
    try {
        const updatedTask = await Housekeeping.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('room').populate('assignedTo');
        
        if (!updatedTask) return res.status(404).json({ message: 'Housekeeping task not found' });
        
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a housekeeping task
router.delete('/:id', async (req, res) => {
    try {
        const deletedTask = await Housekeeping.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ message: 'Housekeeping task not found' });
        
        res.status(200).json({ message: 'Housekeeping task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
