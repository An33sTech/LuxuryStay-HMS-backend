const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { singleUpload } = require("../middleware/upload");
const authMiddleware = require('../middleware/auth');

// REGISTER a new user
router.post('/register', singleUpload, async (req, res) => {
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

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

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
                preferences: profile.preferences || {},
                image: imagePath
            }
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post(
    "/login",
    [
        body("usernameorEmail").notEmpty().withMessage("Email or Username is required"),
        body("password").exists().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        try {
            const { usernameorEmail, password } = req.body;

            const query = usernameorEmail.includes('@')
                ? { 'profile.contact.email': usernameorEmail }
                : { username: usernameorEmail };

            const userExist = await User.findOne(query);

            if (!userExist || userExist.status !== 'active') {
                return res.status(401).json({ message: "Invalid username/email or password" });
            }

            const correctPass = await bcrypt.compare(password, userExist.password);
            if (!correctPass) {
                return res.status(401).json({ message: "Invalid username/email or password" });
            }

            const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET);
            res.status(200).json({ token: token });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// GET all users (Admin only)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().sort({ _id: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET a specific user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a user's information by ID
router.put('/update/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a user by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a user's role or status (Admin only)
router.patch('/update/:id/role-status', async (req, res) => {
    const { role, status } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role, status }, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User role/status updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/profile/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId }).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user information" });
    }
});

module.exports = router;


