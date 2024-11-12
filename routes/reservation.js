const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const verifyToken = require("../middleware/auth")


// Route to reserve a room
router.post('/reserve-room', verifyToken, async (req, res) => {
  const { roomId, guestId, checkInDate, checkOutDate, services, totalAmount } = req.body;

  try {
    // Parse check-in and check-out dates to Date objects
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Find the room
    const room = await Room.findById(roomId);

    if (!room || room.status !== 'available') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    // Check if the room is already reserved for the requested dates
    const overlappingReservations = await Reservation.find({
      room: roomId,
      $or: [
        { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } } // Check for date overlap
      ]
    });

    if (overlappingReservations.length > 0) {
      return res.status(400).json({ message: 'Room is already reserved for the selected dates' });
    }

    // Ensure the guest (User) exists
    const guest = await User.findById(guestId);
    if (!guest) {
      return res.status(400).json({ message: 'Guest not found' });
    }

    // Create the reservation
    const newReservation = new Reservation({
      guest: guestId,
      room: roomId,
      reservationDate: new Date(),
      checkIn: checkIn,
      checkOut: checkOut,
      services: services,  // Include services requested by the guest
      totalAmount: totalAmount,  // Total bill for the stay
    });

    // Save the reservation
    await newReservation.save();

    // Update room status to "reserved"
    room.status = 'reserved';
    await room.save();

    // Optionally create a billing record for the reservation
    const newInvoice = new Billing({
      reservation: newReservation._id,
      totalAmount: totalAmount,
      services: services,
      status: 'unpaid', // Invoice status can be 'unpaid' or 'paid'
    });
    await newInvoice.save();

    // Link invoice to the reservation
    newReservation.invoice = newInvoice._id;
    await newReservation.save();

    res.status(201).json({
      message: 'Room reserved successfully',
      reservation: newReservation,
      invoice: newInvoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reserving the room' });
  }
});

module.exports = router;
