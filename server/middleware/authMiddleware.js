const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const JWT_SECRET = process.env.JWT_SECRET || 'changeme';


async function expressAuth(req, res, next) {
const auth = req.headers.authorization;
if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
const token = auth.split(' ')[1];
try {
const payload = jwt.verify(token, JWT_SECRET);
req.user = await User.findById(payload.id).select('-password');
if (!req.user) return res.status(401).json({ message: 'Invalid token' });
next();
} catch (err) {
return res.status(401).json({ message: 'Invalid token' });
}
}


// For socket.io authentication during handshake
async function socketAuthMiddleware(socket, next) {
try {
const token = socket.handshake.auth && socket.handshake.auth.token;
if (!token) return next(new Error('Authentication error: No token'));
const payload = jwt.verify(token, JWT_SECRET);
const user = await User.findById(payload.id).select('-password');
if (!user) return next(new Error('Authentication error: User not found'));
socket.user = user; // attach user to socket
next();
} catch (err) {
console.error('Socket auth error', err);
next(new Error('Authentication error'));
}
}


module.exports = { expressAuth, socketAuthMiddleware };