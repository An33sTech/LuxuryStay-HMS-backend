const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const verifyToken = require("../middleware/auth")

router.get('/', async (req, res) => {
  try {
      const reservations = await Reservation.find();
      res.status(200).json(reservations);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Route to reserve a room
router.post('/reserve-room', verifyToken, async (req, res) => {
  const { guest, room, checkIn, checkOut, services, totalAmount } = req.body;
  
  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const roomSingle = await Room.findById(room);
    
    if (!roomSingle || roomSingle.status !== 'available') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    const overlappingReservations = await Reservation.find({
      room: room,
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });

    if (overlappingReservations.length > 0) {
      return res.status(400).json({ message: 'Room is already reserved for the selected dates' });
    }

    const guestSingle = await User.findById(guest);
    if (!guestSingle) {
      return res.status(400).json({ message: 'Guest not found' });
    }

    const newReservation = new Reservation({
      guest: guest,
      room: room,
      reservationDate: new Date(),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      services: services,
      totalAmount: totalAmount, 
    });

    await newReservation.save();

    roomSingle.status = 'occupied';
    await roomSingle.save();

    res.status(201).json({
      message: 'Room reserved successfully',
      reservation: newReservation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error reserving the room' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
      const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
      if (!deletedReservation) return res.status(404).json({ message: 'Reservation not found' });
      res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;
