// Import env loader FIRST - this must be the first import
import './env.js';


import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import socketService from './src/sockets/socketService.js';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import connectDB from './config/db.js';
import passport from './config/passport.js';

// Route imports
import authRoutes from './routes/auth.js';
import patternRoutes from './routes/patterns.js';
import problemRoutes from './routes/problems.js';
import revisionRoutes from './routes/revisions.js';
import podRoutes from './routes/pods.js';
import dashboardRoutes from './routes/dashboard.js';
import profileRoutes from './src/routes/profile.js';
import chatRoutes from './routes/chat.js';
import referralRoutes from './routes/referral.js';
// Mentorship routes
import mentorRoutes from './routes/mentors.js';
import callRoutes from './routes/calls.js';
import walletRoutes from './routes/wallet.js';
// Adaptive Revision routes
import adaptiveRevisionRoutes from './routes/adaptiveRevision.js';
import revisionQuizRoutes from './routes/revisionQuiz.js';
// Doubt Solving System routes
import doubtRoutes from './routes/doubts.js';
import doubtMentorRoutes from './routes/doubts-mentor.js';
// Admin Dashboard routes
import adminRoutes from './routes/admin.js';
// Notification routes
import notificationRoutes from './src/routes/notification.js';
// Interview routes
import interviewRoutes from './routes/interview.js';
// Focus Mode routes
import focusRoutes from './routes/focus.js';
// Public routes
import publicRoutes from './routes/public.js';

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware for Socket Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      socket.user = decoded;
      next();
    } catch (err) {
      console.log('Socket auth failed:', err.message);
      next(); // Allow connection even if auth fails (for public events?), or pass err to block
    }
  } else {
    next();
  }
});

// Initialize Socket Service
socketService(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session configuration (needed for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patterns', patternRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/revisions', revisionRoutes);
app.use('/api/pods', podRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/referral', referralRoutes);
// Mentorship Routes
app.use('/api/mentors', mentorRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/wallet', walletRoutes);
// Adaptive Revision Routes
app.use('/api/adaptive-revision', adaptiveRevisionRoutes);
app.use('/api/revision-quiz', revisionQuizRoutes);
// Doubt Solving System Routes
app.use('/api/doubts', doubtRoutes);
app.use('/api/doubts/mentor', doubtMentorRoutes);
// Admin Dashboard Routes
app.use('/api/admin', adminRoutes);
// Notification Routes
app.use('/api/notifications', notificationRoutes);
// Interview Routes
app.use('/api/interview', interviewRoutes);
// Focus Mode Routes
app.use('/api/focus', focusRoutes);
// Public Routes
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Babua LMS API is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join personal notification room
  socket.on('join-notifications', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined notification room`);
  });
  socket.on('join-pod', (podId) => {
    socket.join(`pod-${podId}`);
    console.log(`User ${socket.id} joined pod ${podId}`);
  });

  // Leave pod room
  socket.on('leave-pod', (podId) => {
    socket.leave(`pod-${podId}`);
  });

  // Join chat channel
  socket.on('join-chat', (channel) => {
    socket.join(`chat-${channel}`);
    console.log(`User ${socket.id} joined chat channel ${channel}`);
    // Broadcast user count update
    io.to(`chat-${channel}`).emit('user-joined', { channel, count: io.sockets.adapter.rooms.get(`chat-${channel}`)?.size || 0 });
  });

  // Leave chat channel
  socket.on('leave-chat', (channel) => {
    socket.leave(`chat-${channel}`);
    io.to(`chat-${channel}`).emit('user-left', { channel, count: io.sockets.adapter.rooms.get(`chat-${channel}`)?.size || 0 });
  });

  // WebRTC Signaling for Mentorship Calls
  socket.on('join-call', (roomId) => {
    socket.join(`call-${roomId}`);
    const room = io.sockets.adapter.rooms.get(`call-${roomId}`);
    const numClients = room ? room.size : 0;
    console.log(`User ${socket.id} joined call room ${roomId}, clients: ${numClients}`);

    if (numClients === 1) {
      socket.emit('call-created', roomId);
    } else if (numClients === 2) {
      socket.emit('call-joined', roomId);
      io.to(`call-${roomId}`).emit('call-ready', roomId);
    } else {
      socket.emit('call-full', roomId);
    }
  });

  socket.on('call-offer', ({ roomId, offer }) => {
    socket.to(`call-${roomId}`).emit('call-offer', { offer, from: socket.id });
  });

  socket.on('call-answer', ({ roomId, answer }) => {
    socket.to(`call-${roomId}`).emit('call-answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(`call-${roomId}`).emit('ice-candidate', { candidate, from: socket.id });
  });

  socket.on('leave-call', (roomId) => {
    socket.leave(`call-${roomId}`);
    socket.to(`call-${roomId}`).emit('call-ended', { from: socket.id });
  });

  // Doubt Chat Real-time messaging
  socket.on('join:room', (doubtId) => {
    socket.join(`room:${doubtId}`);
    console.log(`User ${socket.id} joined doubt room ${doubtId}`);
  });

  socket.on('leave:room', (doubtId) => {
    socket.leave(`room:${doubtId}`);
    console.log(`User ${socket.id} left doubt room ${doubtId}`);
  });

  socket.on('message:send', (data) => {
    const { roomId, message, messageType, user, voiceNote, whiteboard } = data;
    // Broadcast to all other users in the room (excluding sender)
    socket.to(`room:${roomId}`).emit('message:receive', {
      message,
      messageType,
      user,
      voiceNote,
      whiteboard,
      timestamp: new Date()
    });
    console.log(`Message sent to doubt room ${roomId} by ${user?.name}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Babua LMS Server running on port ${PORT}`);
});

export { io };
