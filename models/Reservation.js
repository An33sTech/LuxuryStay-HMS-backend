const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    reservationDate: { type: Date, default: Date.now },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled'], default: 'confirmed' },
    totalAmount: { type: Number, required: true },
    services: {
        serviceName: { type: String },
        amount: { type: Number }
    },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
module.exports = Reservation;
