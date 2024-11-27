const express = require('express');
const connectDB = require('./config/db');
const cors = require("cors");
const path = require('path');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define Routes
app.use('/users', require('./routes/userRoute'));
app.use('/rooms', require('./routes/roomRoute'));
app.use('/reservations', require('./routes/reservation'));
app.use('/housekeeping', require('./routes/housekeeping'));
app.use('/billing', require('./routes/billing'));
app.use('/feedback', require('./routes/feedback'));
app.use('/notifications', require('./routes/notification'));
app.use('/maintenance', require('./routes/maintenance'));
app.use('/api', require('./routes/chartsRoute'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
