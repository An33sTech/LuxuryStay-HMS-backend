const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to User (guest)
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },  // Reference to Room
    reservationDate: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: { type: String, enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled'], default: 'confirmed' },
    totalAmount: { type: Number, required: true },
    services: [{
        serviceName: { type: String },  // e.g., "room service", "laundry"
        amount: { type: Number }
    }],
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing' }  // Reference to Billing
});

const Reservation = mongoose.model("Reservation", ReservationSchema);
module.exports = Reservation;