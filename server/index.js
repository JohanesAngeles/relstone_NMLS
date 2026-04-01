const dotenv = require('dotenv');
dotenv.config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const dns        = require('dns');

// ── Configure custom DNS servers if provided ──────────────────────────────────
if (process.env.DNS_SERVERS) {
  const dnsServers = process.env.DNS_SERVERS.split(',').map(s => s.trim());
  dns.setServers(dnsServers);
  console.log('DNS servers configured:', dnsServers);
}

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
const biosigRoutes = require('./routes/biosig');// ── Middleware ────────────────────────────────────────────────────────────────
const authMiddleware = require('./middleware/auth');

// ── Admin routes ──────────────────────────────────────────────────────────────
const adminAuthRoutes     = require('./routes/admin/auth');
const adminCourseRoutes   = require('./routes/admin/courses');
const adminStudentRoutes  = require('./routes/admin/students');
const adminReportRoutes   = require('./routes/admin/reports');
const adminDashboardRoutes = require('./routes/admin/dashboard');

const adminUploadRoutes = require('./routes/admin/upload');
const adminInstructorRoutes = require('./routes/admin/instructors');
const adminSettingsRoutes = require('./routes/admin/settings');
const adminOrderRoutes = require('./routes/admin/orders');


const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://10.0.2.2:8000',
    'http://192.168.100.3:8000',
    'https://relstone-nmls-62fc9b1f5f80.herokuapp.com',
  ],
  credentials: true,
}));

app.use(express.json());

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes); // Keep public (login/register)
app.use('/api/courses',       courseRoutes); // Usually public for browsing

// Apply authMiddleware to protect these specific groups:
app.use('/api/orders',        authMiddleware, orderRoutes);
app.use('/api/dashboard',     authMiddleware, dashboardRoutes);
app.use('/api/certificates',  authMiddleware, certificateRoutes);
app.use('/api/instructor',    authMiddleware, instructorRoutes);
app.use('/api/quiz-attempts', authMiddleware, quizAttemptRoutes);
app.use('/api/enrollment',    authMiddleware, enrollmentRoutes);
app.use('/api/rocs',          authMiddleware, rocsRoutes);
app.use('/api/support',       authMiddleware, supportRoutes);
app.use('/api/testimonials',  testimonialRoutes);  // ← ADD THIS LINE
app.use('/api/biosig', biosigRoutes);// ── Protected test route ──────────────────────────────────────────────────────
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted!', user: req.user });
});

// ── Admin API routes ──────────────────────────────────────────────────────────
app.use('/api/admin/auth',     adminAuthRoutes);
app.use('/api/admin/courses',  authMiddleware, adminCourseRoutes);
app.use('/api/admin/students', authMiddleware, adminStudentRoutes);
app.use('/api/admin/reports',  authMiddleware, adminReportRoutes);
app.use('/api/admin/dashboard', authMiddleware, adminDashboardRoutes);
app.use('/api/admin/upload', authMiddleware, adminUploadRoutes);
app.use('/api/admin/instructors', authMiddleware, adminInstructorRoutes);
app.use('/api/admin/settings', authMiddleware, adminSettingsRoutes);
app.use('/api/admin/orders', authMiddleware, adminOrderRoutes);




// ── Serve React build in production ──────────────────────────────────────────
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

// ── Start server ──────────────────────────────────────────────────────────────
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