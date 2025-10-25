const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

// Prevent multiple connections in serverless by caching state
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI no está definido');
    return;
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  isConnected = mongoose.connection.readyState === 1;
  if (isConnected) console.log('MongoDB connected');
}

const app = express();
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Models (ensure they are loaded)
require('./models/Admin');
require('./models/User');
require('./models/Inventory');

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Ensure DB connection for every invocation (serverless-safe)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err);
    res.status(500).json({ message: 'Error de conexión a la base de datos' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' });
});

module.exports = app;