const mongoose = require('mongoose');

const HousekeepingSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    task: { type: String, enum: ['cleaning', 'maintenance'], required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    reportedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

const Housekeeping = mongoose.model("Housekeeping", HousekeepingSchema);
module.exports = Housekeeping;
