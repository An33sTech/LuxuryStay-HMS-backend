const express = require('express');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const router = express.Router();

// Create a new maintenance request
router.post('/', async (req, res) => {
    try {
        const maintenanceRequest = new MaintenanceRequest(req.body);
        await maintenanceRequest.save();
        res.status(201).json(maintenanceRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all maintenance requests
router.get('/', async (req, res) => {
    try {
        const requests = await MaintenanceRequest.find().populate('room').populate('reportedBy').populate('resolvedBy');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific maintenance request by ID
router.get('/:id', async (req, res) => {
    try {
        const request = await MaintenanceRequest.findById(req.params.id).populate('room').populate('reportedBy').populate('resolvedBy');
        if (!request) return res.status(404).json({ message: 'Maintenance request not found' });
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a maintenance request (e.g., mark as resolved)
router.put('/:id', async (req, res) => {
    try {
        const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('room').populate('reportedBy').populate('resolvedBy');
        
        if (!updatedRequest) return res.status(404).json({ message: 'Maintenance request not found' });
        
        res.status(200).json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a maintenance request
router.delete('/:id', async (req, res) => {
    try {
        const deletedRequest = await MaintenanceRequest.findByIdAndDelete(req.params.id);
        if (!deletedRequest) return res.status(404).json({ message: 'Maintenance request not found' });
        
        res.status(200).json({ message: 'Maintenance request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;