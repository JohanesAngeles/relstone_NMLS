const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// GET /api/notifications
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

// PATCH /api/notifications/mark-all-read (must come BEFORE /:id)
router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    console.log('[mark-all-read] Starting - user:', req.user?.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('[mark-all-read] User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('[mark-all-read] User found, notifications count:', user.notifications?.length);
    
    // Ensure notifications is an array
    if (!user.notifications) {
      user.notifications = [];
    }

    // Mark each notification as read
    user.notifications.forEach((n) => {
      n.read = true;
    });

    await user.save();
    console.log('[mark-all-read] Success - all marked as read');
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[mark-all-read] ERROR:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/notifications/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { read } = req.body;
    console.log('[mark-single] ID:', req.params.id, 'Read:', read);
    
    if (typeof read !== 'boolean') {
      console.log('[mark-single] Invalid read value');
      return res.status(400).json({ message: 'Missing read boolean' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('[mark-single] User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the notification by _id using findIndex instead of .id() method
    const notifIndex = (user.notifications || []).findIndex(
      (n) => String(n._id) === String(req.params.id)
    );

    if (notifIndex === -1) {
      console.log('[mark-single] Notification not found:', req.params.id);
      return res.status(404).json({ message: 'Notification not found' });
    }

    user.notifications[notifIndex].read = read;
    await user.save();

    console.log('[mark-single] Success - notification updated');
    res.json({ notification: user.notifications[notifIndex] });
  } catch (err) {
    console.error('[mark-single] ERROR:', err.message, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
