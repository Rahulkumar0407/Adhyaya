import express from 'express';
import Message from '../models/Message.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Auth middleware
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Get messages for a channel
router.get('/:channel', auth, async (req, res) => {
    try {
        const { channel } = req.params;
        const { limit = 50, before } = req.query;

        const query = { channel };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('user', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        // Reverse to get chronological order
        messages.reverse();

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
});

// Send a message
router.post('/', auth, async (req, res) => {
    try {
        const { channel, content, code } = req.body;

        if (!content || !channel) {
            return res.status(400).json({ success: false, message: 'Content and channel are required' });
        }

        const message = new Message({
            user: req.userId,
            channel,
            content,
            code
        });

        await message.save();

        // Populate user data
        await message.populate('user', 'name email avatar');

        // Emit to all connected clients in the channel
        const io = req.app.get('io');
        io.to(`chat-${channel}`).emit('new-message', message);

        res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// Get online users count (from socket connections)
router.get('/online/count', auth, async (req, res) => {
    try {
        const io = req.app.get('io');
        const sockets = await io.fetchSockets();
        res.json({ success: true, count: sockets.length });
    } catch (error) {
        res.json({ success: true, count: 0 });
    }
});

export default router;
