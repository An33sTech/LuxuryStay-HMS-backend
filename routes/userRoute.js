const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require("bcryptjs");

router.post('/register', async (req, res) => {
    const { username, password, role, profile } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { 'profile.contact.email': profile.contact.email }
            ]
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            role,
            profile: {
                name: profile.name,
                contact: {
                    email: profile.contact.email,
                    phone: profile.contact.phone
                },
                preferences: profile.preferences || {}
            }
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                profile: newUser.profile,
                status: newUser.status,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
