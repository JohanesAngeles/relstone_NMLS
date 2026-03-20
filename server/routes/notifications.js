const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[notifications router] ${req.method} ${req.path}`);
  next();
});

// Test route - no auth
router.get('/test', (req, res) => {
  console.log('[test] route handler called');
  res.json({ message: 'notifications router is working' });
});

// Helper: Send notification email
const sendNotificationEmail = async (user, title, body) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: title,
      text: body,
      html: `<p>${body}</p>`,
    });
  } catch (err) {
    console.warn('[sendNotificationEmail]', err.message);
  }
};

// Helper: Create notification document
const createNotification = async (user, payload) => {
  if (!user.notifications) user.notifications = [];
  const note = {
    type: payload.type || 'system',
    title: payload.title || 'Notification',
    body: payload.body || 'You have a new message.',
    read: false,
    createdAt: new Date(),
  };
  user.notifications.unshift(note);
  await user.save();
  return note;
};

// GET /notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!Array.isArray(user.notifications) || user.notifications.length === 0) {
      user.notifications = [
        { type: 'milestones', title: 'Course milestone reached!', body: "You've completed 75% of Property Management 101. Keep going — you're almost there!", read: false },
        { type: 'quiz', title: 'Quiz results: Ethics in Real Estate', body: 'You scored 82% on the final quiz. You passed! Your certificate is being generated.', read: false },
        { type: 'ce', title: 'CE renewal reminder — 30 days left', body: 'Complete your remaining 4 hours to stay compliant before April 15, 2026.', read: false },
        { type: 'new', title: 'New course available in your state', body: 'Advanced Mortgage Lending Practices is now approved for CE credit in California.', read: true },
      ];
      await user.save();
    }

    const notifications = (user.notifications || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ notifications });
  } catch (err) {
    console.error('[notifications GET]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /mark-all-read
router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.notifications) user.notifications = [];
    user.notifications.forEach((n) => { n.read = true; });
    await user.save();
    res.json({ message: 'All marked as read' });
  } catch (err) {
    console.error('[mark-all-read]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /trigger (generic notification)
router.post('/trigger', authMiddleware, async (req, res) => {
  try {
    const { type, title, body, sendEmail = false } = req.body;
    if (!type || !title || !body) {
      return res.status(400).json({ message: 'Missing type, title, or body' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const note = await createNotification(user, { type, title, body });
    if (sendEmail && user.notification_prefs?.email_course_updates) {
      await sendNotificationEmail(user, title, body);
    }
    res.json({ message: 'Notification created', notification: note });
  } catch (err) {
    console.error('[trigger]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /trigger/:event (predefined event)
router.post('/trigger/:event', authMiddleware, async (req, res) => {
  try {
    const eventType = req.params.event;
    const mapping = {
      welcome: { type: 'system', title: 'Welcome to Relstone', body: 'Thanks for signing up! Start learning now.' },
      purchase: { type: 'new', title: 'Purchase confirmed', body: 'Your course purchase is complete. Start learning.' },
      completion: { type: 'milestones', title: 'Chapter complete', body: 'You completed a chapter! Keep going.' },
      certificate: { type: 'milestones', title: 'Certificate ready', body: 'Your certificate is ready. Download it now.' },
      renewal: { type: 'ce', title: 'Renewal reminder', body: 'Your CE renewal deadline is approaching. Book now.' },
    };

    const payload = mapping[eventType];
    if (!payload) return res.status(404).json({ message: 'Unknown event' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const note = await createNotification(user, payload);

    const emailPrefMap = {
      welcome: 'email_course_updates',
      purchase: 'email_course_updates',
      completion: 'email_completions',
      certificate: 'email_completions',
      renewal: 'email_reminders',
    };

    if (user.notification_prefs?.[emailPrefMap[eventType]]) {
      await sendNotificationEmail(user, payload.title, payload.body);
    }

    res.json({ message: `Triggered ${eventType}`, notification: note });
  } catch (err) {
    console.error('[trigger event]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:id (mark single as read/unread — must come LAST)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { read } = req.body;
    if (typeof read !== 'boolean') {
      return res.status(400).json({ message: 'Missing read boolean' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notifIndex = (user.notifications || []).findIndex(
      (n) => String(n._id) === String(req.params.id)
    );

    if (notifIndex === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    user.notifications[notifIndex].read = read;
    await user.save();

    res.json({ notification: user.notifications[notifIndex] });
  } catch (err) {
    console.error('[mark-single]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
