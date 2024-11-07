const express = require('express');
const connectDB = require('./config/db');
const cors = require("cors");
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/users', require('./routes/userRoute'));
app.use('/rooms', require('./routes/roomRoute'));
app.use('/rooms', require('./routes/reservation'));
app.use('/rooms', require('./routes/housekeeping'));
app.use('/rooms', require('./routes/billing'));
app.use('/rooms', require('./routes/feedback'));
app.use('/rooms', require('./routes/notification'));
app.use('/rooms', require('./routes/maintenance'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
