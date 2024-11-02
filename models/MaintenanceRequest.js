const mongoose = require('mongoose');

const MaintenanceRequestSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Who reported the issue
    issueDescription: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Maintenance staff reference
});

const MaintenanceRequest = mongoose.model("MaintenanceRequest", MaintenanceRequestSchema);
module.exports = MaintenanceRequest;