const express = require('express');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const RoomPriceHistory = require('../models/RoomPriceHistory');
const router = express.Router();

async function getOccupancyRate(startDate, endDate) {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Reservation.countDocuments({
        checkIn: { $lte: new Date(endDate) },
        checkOut: { $gte: new Date(startDate) },
        status: 'checked-in'
    });
    return ((occupiedRooms / totalRooms) * 100).toFixed(2);
}

router.get('/reports/occupancy', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required" });
        }
        const rate = await getOccupancyRate(startDate, endDate);
        res.json({ occupancyRate: rate });
    } catch (error) {
        res.status(500).json({ message: "Error calculating occupancy rate", error });
    }
});

async function getRevenue(startDate, endDate) {
    const revenue = await Reservation.aggregate([
        {
            $match: {
                checkIn: { $lte: new Date(endDate) },
                checkOut: { $gte: new Date(startDate) },
                status: 'checked-out',
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
            },
        },
    ]);

    return revenue.length > 0 ? revenue[0].totalRevenue : 0;
}

router.get('/reports/revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required" });
        }

        const revenue = await getRevenue(startDate, endDate);
        res.json({ revenue });
    } catch (error) {
        res.status(500).json({ message: "Error calculating revenue", error });
    }
});

router.get('/reports/feedback', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start and end dates are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const feedbacks = await Feedback.find({
            createdAt: { $gte: start, $lte: end }
        });

        const totalRating = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
        const averageRating = feedbacks.length ? (totalRating / feedbacks.length).toFixed(2) : 0;

        res.json({
            feedbacks,
            averageRating
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching feedback", error });
    }
});

function forecastData(historicalData) {
    const trend = (historicalData[historicalData.length - 1].price - historicalData[0].price) / (historicalData.length - 1);
    const forecast = [];
    for (let i = 1; i <= 3; i++) {
        const lastValue = historicalData[historicalData.length - 1].price;
        const forecastedValue = lastValue + (trend * i);
        const forecastDate = new Date();
        forecastDate.setMonth(forecastDate.getMonth() + i);
        forecast.push({
            date: forecastDate.toISOString().split('T')[0], 
            price: Math.round(forecastedValue)
        });
    }
    return forecast;
}

router.get('/analytics/forecast/:roomId', async (req, res) => {
    try {
        const roomId = req.params.roomId;

        const historicalData = await RoomPriceHistory.find({ room: roomId }).sort({ date: -1 }).limit(7);

        if (historicalData.length < 2) {
            return res.status(400).json({ message: 'Not enough data to generate a forecast' });
        }

        const reversedHistoricalData = historicalData.reverse();

        const forecast = forecastData(reversedHistoricalData);

        res.json({ forecast });
    } catch (error) {
        res.status(500).json({ message: "Error calculating forecast", error });
    }
});

router.get('/analytics/pricing', async (req, res) => {
    try {
        const pricingData = await RoomPriceHistory.find().sort({ date: 1 });

        if (!pricingData || pricingData.length === 0) {
            return res.status(404).json({ message: "No pricing data found" });
        }

        res.json({ pricing: pricingData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching pricing data", error });
    }
});

module.exports = router;