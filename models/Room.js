const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    roomName: { type: String, required: true },
    shortDesc: { type: String },
    persons: { type: Number },
    type: { type: String, enum: ['suite', 'single', 'double'], required: true },
    status: { type: String, enum: ['available', 'occupied', 'cleaning', 'maintenance', 'unavailable'], default: 'available' },
    price: { type: Number, required: true },
    image: { type: String},
    features: [
        {
            icon: { type: String },
            text: { type: String, required: true }
        }
    ],
    availability: {
        from: { type: Date },
        to: { type: Date }
    },
    lastCleaned: { type: Date },
    comments: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;