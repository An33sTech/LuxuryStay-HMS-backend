const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'manager', 'receptionist', 'housekeeping', 'guest', 'user'], required: true },
    profile: {
        name: { type: String, required: true },
        contact: {
            email: { type: String, required: true, unique: true },
            phone: { type: String, required: true }
        },
        preferences: { type: Map, of: String },
        image: { type: String },
        city: {type: String},
        country: {type: String}
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
