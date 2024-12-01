const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Billing = require('../models/Billing');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("guest").populate("room");
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reserve-room', async (req, res) => {
  const { guest, room, checkIn, checkOut, totalAmount } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const roomSingle = await Room.findById(room).session(session);
    if (!roomSingle || roomSingle.status !== 'available') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Room is not available' });
    }

    const overlappingReservations = await Reservation.findOne({
      room: room,
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    }).session(session);

    if (overlappingReservations) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Room is already reserved for the selected dates' });
    }

    const username = `${guest.firstName}${guest.lastName}`.toLowerCase();
    const password = Math.random().toString(36).substring(2, 8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newGuest = new User({
      username: username,
      password: hashedPassword,
      role: 'guest',
      profile: {
        name: `${guest.firstName} ${guest.lastName}`,
        contact: {
          email: guest.email,
          phone: guest.phoneNumber
        },
        city: guest.city,
        country: guest.country
      },
    });

    await newGuest.save({ session });

    const newReservation = new Reservation({
      guest: newGuest._id,
      room: room,
      reservationDate: new Date(),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount: totalAmount,
    });

    await newReservation.save({ session });

    roomSingle.status = 'occupied';
    await roomSingle.save({ session });


    const billing = new Billing({
      reservation: newReservation._id,
      guest: newGuest._id,
      total: totalAmount,
    });

    await billing.save({ session });

    await session.commitTransaction();
    session.endSession();

    try {
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: guest.email,
        subject: 'Reservation Confirmation',
        html: `
          <html>
            <body>
              <p>Dear ${guest.firstName} ${guest.lastName},</p>
              <p>Thank you for choosing our hotel. Here are your reservation details:</p>
              <table>
                <tr>
                  <td><strong>Room:</strong></td>
                  <td>${roomSingle.roomName || 'Room Name'}</td>
                </tr>
                <tr>
                  <td><strong>Check-in Date:</strong></td>
                  <td>${checkInDate.toDateString()}</td>
                </tr>
                <tr>
                  <td><strong>Check-out Date:</strong></td>
                  <td>${checkOutDate.toDateString()}</td>
                </tr>
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td>${totalAmount} PKR</td>
                </tr>
              </table>
              <p>Your account has been created with the following credentials:</p>
              <table>
                <tr>
                  <td><strong>Username:</strong></td>
                  <td>${newGuest.username}</td>
                </tr>
                <tr>
                  <td><strong>Password:</strong></td>
                  <td>${password}</td>
                </tr>
              </table>
              <p>Please log in to our portal for further details.</p>
              <p>Regards,</p>
              <p>LuxuryStayHMS</p>
            </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);

    } catch (error) {
      console.error('Error sending email:', error);
    }

    res.status(201).json({
      message: 'Room reserved successfully. Email sent to guest.',
      reservation: newReservation,
      billing: billing,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Transaction failed:', error);
    res.status(500).json({ message: 'An error occurred while reserving the room' });
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findById(id).populate("guest").populate("room");
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const billing = await Billing.findOne({ reservation: reservation._id });

    if (!billing) {
      return res.status(404).json({ message: 'Billing details not found for this reservation' });
    }

    res.status(200).json({reservation: reservation, billing: billing});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching the reservation' });
  }
});

router.put('/update-status/:id', async (req, res) => {
  try{
    const { status } = req.body;

    const updatedReservation = await Reservation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedReservation) return res.status(404).json({ message: 'Reservation not found' });
    
    res.status(200).json(updatedReservation);
  } catch(error){
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;