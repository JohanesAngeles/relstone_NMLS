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
const supportRoutes = require('./routes/support');

dotenv.config();

const dnsServers = String(process.env.DNS_SERVERS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const courseRoutes       = require('./routes/courses');
const orderRoutes        = require('./routes/orders');
const dashboardRoutes    = require('./routes/dashboard');
const certificateRoutes  = require('./routes/certificates');
const instructorRoutes   = require('./routes/instructor');
const testimonialRoutes  = require('./routes/testimonials');
// ── NEW: required for CoursePortal to work ────────────────────────────────────
const quizAttemptRoutes  = require('./routes/quiz-attempts');   // ← ADD
const enrollmentRoutes   = require('./routes/enrollment');      // ← ADD
const rocsRoutes         = require('./routes/rocs');            // ← ADD
const supportRoutes = require('./routes/support');

// ── Middleware ────────────────────────────────────────────────────────────────
const authMiddleware = require('./middleware/auth');

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

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/courses',       courseRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/certificates',  certificateRoutes);
app.use('/api/instructor',    instructorRoutes);
app.use('/api/testimonials',  testimonialRoutes);
// ── NEW ───────────────────────────────────────────────────────────────────────
app.use('/api/quiz-attempts', quizAttemptRoutes);  // ← ADD
app.use('/api/enrollment',    enrollmentRoutes);   // ← ADD
app.use('/api/rocs',          rocsRoutes);         // ← ADD
app.use('/api/support', supportRoutes);

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
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });