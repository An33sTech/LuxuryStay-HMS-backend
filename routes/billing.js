const express = require('express');
const Billing = require('../models/Billing');
const router = express.Router();

// Create a new billing record
router.post('/', async (req, res) => {
    try {
        const { reservation, guest, charges } = req.body;

        const total = charges.reduce((sum, charge) => sum + charge.amount, 0);

        const newBilling = new Billing({
            reservation,
            guest,
            charges,
            total
        });

        await newBilling.save();
        res.status(201).json({ message: 'Billing record created successfully', billing: newBilling });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all billing records
router.get('/', async (req, res) => {
    try {
        const billings = await Billing.find()
            .populate('reservation')
            .populate('guest');
        res.status(200).json(billings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific billing record by ID
router.get('/:id', async (req, res) => {
    try {
        const billing = await Billing.findById(req.params.id)
            .populate('reservation')
            .populate('guest');
        if (!billing) return res.status(404).json({ message: 'Billing record not found' });
        res.status(200).json(billing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a billing record (e.g., mark as paid, add charges)
router.put('/:id', async (req, res) => {
    try {
        const {status, paidAt } = req.body;
        const paidAtDate = new Date(paidAt);
        const updatedBilling = await Billing.findByIdAndUpdate(req.params.id, {status, paidAtDate }, { new: true });

        if (!updatedBilling) return res.status(404).json({ message: 'Billing record not found' });

        res.status(200).json({ message: 'Billing record updated successfully', billing: updatedBilling });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a billing record
router.delete('/:id', async (req, res) => {
    try {
        const deletedBilling = await Billing.findByIdAndDelete(req.params.id);
        if (!deletedBilling) return res.status(404).json({ message: 'Billing record not found' });
        
        res.status(200).json({ message: 'Billing record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
