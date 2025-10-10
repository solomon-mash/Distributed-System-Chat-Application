const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const router = express.Router();


const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


// Register
router.post('/register', async (req, res) => {
try {
const { username, email, password } = req.body;
if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });


const existing = await User.findOne({ $or: [{ email }, { username }] });
if (existing) return res.status(409).json({ message: 'User already exists' });


const saltRounds = 10;
const hashed = await bcrypt.hash(password, saltRounds);


const user = new User({ username, email, password: hashed });
await user.save();


const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
} catch (err) {
console.error('Register error', err);
res.status(500).json({ message: 'Server error' });
}
});


// Login
router.post('/login', async (req, res) => {
try {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ message: 'Missing fields' });


const user = await User.findOne({ email });
if (!user) return res.status(401).json({ message: 'Invalid credentials' });


const valid = await bcrypt.compare(password, user.password);
if (!valid) return res.status(401).json({ message: 'Invalid credentials' });


const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
} catch (err) {
console.error('Login error', err);
res.status(500).json({ message: 'Server error' });
}
});


module.exports = router;