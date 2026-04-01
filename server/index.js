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

// ── Route imports (wrapped to catch missing modules on startup) ───────────────
let authRoutes, courseRoutes, orderRoutes, dashboardRoutes,
    certificateRoutes, instructorRoutes, testimonialRoutes,
    quizAttemptRoutes, enrollmentRoutes, rocsRoutes,
    supportRoutes, biosigRoutes;

try { authRoutes        = require('./routes/auth');          } catch (e) { console.error('❌ auth route failed:', e.message); }
try { courseRoutes      = require('./routes/courses');        } catch (e) { console.error('❌ courses route failed:', e.message); }
try { orderRoutes       = require('./routes/orders');         } catch (e) { console.error('❌ orders route failed:', e.message); }
try { dashboardRoutes   = require('./routes/dashboard');      } catch (e) { console.error('❌ dashboard route failed:', e.message); }
try { certificateRoutes = require('./routes/certificates');   } catch (e) { console.error('❌ certificates route failed:', e.message); }
try { instructorRoutes  = require('./routes/instructor');     } catch (e) { console.error('❌ instructor route failed:', e.message); }
try { testimonialRoutes = require('./routes/testimonials');   } catch (e) { console.error('❌ testimonials route failed:', e.message); }
try { quizAttemptRoutes = require('./routes/quiz-attempts');  } catch (e) { console.error('❌ quiz-attempts route failed:', e.message); }
try { enrollmentRoutes  = require('./routes/enrollment');     } catch (e) { console.error('❌ enrollment route failed:', e.message); }
try { rocsRoutes        = require('./routes/rocs');           } catch (e) { console.error('❌ rocs route failed:', e.message); }
try { supportRoutes     = require('./routes/support');        } catch (e) { console.error('❌ support route failed:', e.message); }
try { biosigRoutes      = require('./routes/biosig');         } catch (e) { console.error('❌ biosig route failed:', e.message); }

// ── Middleware ─────────────────────────────────────────────────────────────────
const authMiddleware = require('./middleware/auth');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────────
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

// ── API routes ─────────────────────────────────────────────────────────────────
// NOTE: authMiddleware is NOT applied here — each route file handles its own
// auth internally via the instructorOnly / authMiddleware guards already defined
// inside them. Applying it twice causes double-verification and can mask errors.

if (authRoutes)        app.use('/api/auth',          authRoutes);
if (courseRoutes)      app.use('/api/courses',        courseRoutes);
if (orderRoutes)       app.use('/api/orders',         authMiddleware, orderRoutes);
if (dashboardRoutes)   app.use('/api/dashboard',      authMiddleware, dashboardRoutes);
if (certificateRoutes) app.use('/api/certificates',   authMiddleware, certificateRoutes);
if (instructorRoutes)  app.use('/api/instructor',     instructorRoutes);  // ← auth handled inside route file
if (quizAttemptRoutes) app.use('/api/quiz-attempts',  authMiddleware, quizAttemptRoutes);
if (enrollmentRoutes)  app.use('/api/enrollment',     authMiddleware, enrollmentRoutes);
if (rocsRoutes)        app.use('/api/rocs',           authMiddleware, rocsRoutes);
if (supportRoutes)     app.use('/api/support',        authMiddleware, supportRoutes);
if (testimonialRoutes) app.use('/api/testimonials',   testimonialRoutes);
if (biosigRoutes)      app.use('/api/biosig',         biosigRoutes);

// ── Protected test route ───────────────────────────────────────────────────────
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted!', user: req.user });
});

// ── Serve React build in production ───────────────────────────────────────────
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

// ── Start server ───────────────────────────────────────────────────────────────
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