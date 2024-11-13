const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    charges: [{
        description: { type: String },
        amount: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date }
});

const Billing = mongoose.model("Billing", BillingSchema);
module.exports = Billing;