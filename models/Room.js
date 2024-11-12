const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['suite', 'single', 'double'], required: true },
    status: { type: String, enum: ['available', 'occupied', 'cleaning', 'maintenance'], default: 'available' },
    price: { type: Number, required: true },
    features: [{ type: String }],  // e.g., ["sea view", "balcony"]
    availability: { 
        from: { type: Date },  // Start date of availability
        to: { type: Date }     // End date of availability
    },
    lastCleaned: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;
