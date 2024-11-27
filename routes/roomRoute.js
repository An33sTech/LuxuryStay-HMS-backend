const express = require('express');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const router = express.Router();
const { anyUpload } = require("../middleware/upload");

const generateRoomNumber = async () => {
    let roomNumber;
    let roomExists = true;

    while (roomExists) {
        roomNumber = Math.floor(10000000 + Math.random() * 90000000).toString();

        const existingRoom = await Room.findOne({ roomNumber });
        if (!existingRoom) {
            roomExists = false;
        }
    }

    return roomNumber;
};

// CREATE a new room
router.post("/create", anyUpload, async (req, res) => {
    try {
        const { roomName, roomType, roomStatus, roomPrice, roomShortDesc, roomComments, persons, lastCleaned } = req.body;

        let features = [];
        if (typeof req.body.features === 'string') {
            features = JSON.parse(req.body.features);
        } else if (Array.isArray(req.body.features)) {
            features = req.body.features;
        }

        (req.files || []).forEach((file) => {
            const match = file.fieldname.match(/features\[(\d+)]\[icon]/);
            if (match) {
                const index = parseInt(match[1], 10);
                if (features[index]) {
                    features[index].icon = file.filename;
                }
            }
        });

        const mainImage = (req.files || []).find(file => file.fieldname === "image");
        const imagePath = mainImage ? `/uploads/${mainImage.filename}` : null;

        const roomNumber = await generateRoomNumber();

        const newRoom = new Room({
            roomNumber,
            roomName,
            shortDesc: roomShortDesc,
            persons,
            type: roomType,
            status: roomStatus,
            price: roomPrice,
            image: imagePath,
            features,
            comments: roomComments,
            lastCleaned,
        });

        const savedRoom = await newRoom.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a room by ID
router.put('/update/:id', anyUpload, async (req, res) => {
    try {
        const { roomName, roomType, roomStatus, roomPrice, roomShortDesc, roomComments, persons, lastCleaned } = req.body;
        let features = [];
        if (typeof req.body.features === 'string') {
            features = JSON.parse(req.body.features);
        } else if (Array.isArray(req.body.features)) {
            features = req.body.features;
        }

        (req.files || []).forEach((file) => {
            const match = file.fieldname.match(/features\[(\d+)]\[icon]/);
            if (match) {
                const index = parseInt(match[1], 10);
                if (features[index]) {
                    features[index].icon = file.filename;
                }
            }
        });
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.roomName = roomName || room.roomName;
        room.shortDesc = roomShortDesc || room.shortDesc;
        room.persons = persons || room.persons;
        room.type = roomType || room.type;
        room.status = roomStatus || room.status;
        room.price = roomPrice || room.price;
        room.features = features.length ? features : room.features;
        room.comments = roomComments || room.comments;
        room.lastCleaned = lastCleaned || room.lastCleaned

        const updatedRoom = await room.save();
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a room by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        if (!deletedRoom) return res.status(404).json({ message: 'Room not found' });
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET available rooms
router.get('/available', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ message: "Check-in and check-out dates are required." });
        }
        const startDate = new Date(start);
        const endDate = new Date(end);
        const bookedRoomIds = await Reservation.find({
            $or: [
                {
                    checkIn: { $lt: endDate },
                    checkOut: { $gt: startDate },
                },
            ],
        }).distinct('roomId');
        const availableRooms = await Room.find({
            _id: { $nin: bookedRoomIds },
        });
        res.status(200).json(availableRooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET a single room by ID
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE room status
router.patch('/update/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const updatedRoom = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
