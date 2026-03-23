const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

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
    console.error('Error sending email:', err.message);
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

// GET /notifications - Fetch all notifications for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notifications = (user.notifications || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /mark-all-read - Mark all notifications as read
router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.notifications) user.notifications = [];
    
    user.notifications.forEach((n) => { n.read = true; });
    await user.save();
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /trigger - Create a custom notification
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
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /trigger/:event - Trigger a predefined notification event
router.post('/trigger/:event', authMiddleware, async (req, res) => {
  try {
    const eventType = req.params.event;
    
    const eventMap = {
      welcome: {
        notification: { type: 'system', title: 'Welcome to Relstone', body: 'Thanks for signing up! Start learning now.' },
        emailPref: 'email_course_updates',
      },
      purchase: {
        notification: { type: 'new', title: 'Purchase confirmed', body: 'Your course purchase is complete. Start learning.' },
        emailPref: 'email_course_updates',
      },
      completion: {
        notification: { type: 'milestones', title: 'Chapter complete', body: 'You completed a chapter! Keep going.' },
        emailPref: 'email_completions',
      },
      certificate: {
        notification: { type: 'milestones', title: 'Certificate ready', body: 'Your certificate is ready. Download it now.' },
        emailPref: 'email_completions',
      },
      renewal: {
        notification: { type: 'ce', title: 'Renewal reminder', body: 'Your CE renewal deadline is approaching. Book now.' },
        emailPref: 'email_reminders',
      },
    };

    const event = eventMap[eventType];
    if (!event) return res.status(404).json({ message: 'Unknown event' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const note = await createNotification(user, event.notification);

    if (user.notification_prefs?.[event.emailPref]) {
      await sendNotificationEmail(user, event.notification.title, event.notification.body);
    }

    res.json({ message: `Event triggered: ${eventType}`, notification: note });
  } catch (err) {
    console.error(`Error triggering ${req.params.event}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:id - Mark a single notification as read/unread
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
    console.error('Error updating notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
