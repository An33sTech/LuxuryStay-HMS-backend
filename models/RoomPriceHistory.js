const mongoose = require('mongoose');

const RoomPriceHistorySchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const RoomPriceHistory = mongoose.model("RoomPriceHistory", RoomPriceHistorySchema);
module.exports = RoomPriceHistory;