require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const screeningRoutes = require('./src/routes/screeningRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();

// Security middleware
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173'
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.) or whitelisted
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }
    cb(new Error('CORS not allowed'));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ASHA Assist Backend',
    timestamp: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// MongoDB connection & server start
const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/asha_assist';

const startServer = async () => {
  try {
    let useMemoryDB = false;
    // For demo purposes, if MONGO_URI is default localhost, spin up memory server to avoid Code 13 Auth issues
    if (process.env.NODE_ENV !== 'production' && MONGO_URI.includes('localhost:27017')) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      MONGO_URI = mongoServer.getUri();
      useMemoryDB = true;
      console.log('📦 Started MongoDB Memory Server:', MONGO_URI);
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    if (useMemoryDB) {
      console.log('🌱 Seeding Memory DB with demo data...');
      const seed = require('./seed');
      await seed(MONGO_URI);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 ASHA Assist Backend running on port ${PORT}`);
      console.log(`📡 AI Service: ${process.env.AI_SERVICE_URL}`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
