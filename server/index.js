// Import env loader FIRST - this must be the first import
import './env.js';


import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Babua LMS API is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join pod room
  socket.on('join-pod', (podId) => {
    socket.join(`pod-${podId}`);
    console.log(`User ${socket.id} joined pod ${podId}`);
  });

  // Leave pod room
  socket.on('leave-pod', (podId) => {
    socket.leave(`pod-${podId}`);
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
