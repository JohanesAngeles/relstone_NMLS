const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');  // ADD THIS

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const courseRoutes = require('./routes/courses');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const certificateRoutes = require('./routes/certificates');
const instructorRoutes = require('./routes/instructor');

const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://10.0.2.2:8000',
    'http://192.168.100.3:8000',
    'https://relstone-nmls-62fc9b1f5f80.herokuapp.com',  // update to your actual Heroku URL
  ],
  credentials: true,
}));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/instructor', instructorRoutes);

// Protected test route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted!', user: req.user });
});

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'NMLS API is running!' });
  });
}

// Start server
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });