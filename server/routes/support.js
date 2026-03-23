const express  = require('express');
const router   = express.Router();
const Ticket = require('../models/SupportTicket');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

/* ── POST /api/support ─────────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { subject, category, message, priority } = req.body;
    if (!subject || !message)
      return res.status(400).json({ message: 'Subject and message are required' });

    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('name email').lean();

    const ticket = await Ticket.create({
      user_id:    req.user.id,
      user_name:  user?.name  || 'Unknown',
      user_email: user?.email || '',
      subject:    subject.trim(),
      category:   category || 'other',
      message:    message.trim(),
      priority:   priority || 'normal',
    });

    res.status(201).json({ ticket, message: 'Support ticket submitted successfully' });
  } catch (err) {
    console.error('[support POST]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/support/mine ─────────────────────────────────────────── */
router.get('/mine', async (req, res) => {
  try {
    const tickets = await Ticket.find({ user_id: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ tickets, total: tickets.length });
  } catch (err) {
    console.error('[support GET /mine]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/support/admin/all ────────────────────────────────────── */
router.get('/admin/all', async (req, res) => {
  try {
    if (!['instructor', 'admin'].includes(req.user.role))
      return res.status(403).json({ message: 'Instructors only' });

    const filter = {};
    const { status, priority, category } = req.query;
    if (status   && status   !== 'all') filter.status   = status;
    if (priority && priority !== 'all') filter.priority = priority;
    if (category && category !== 'all') filter.category = category;

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ tickets, total: tickets.length });
  } catch (err) {
    console.error('[support GET /admin/all]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/support/:ticketId ────────────────────────────────────── */
router.get('/:ticketId', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId).lean();
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const isInstructor = ['instructor', 'admin'].includes(req.user.role);
    if (!isInstructor && String(ticket.user_id) !== String(req.user.id))
      return res.status(403).json({ message: 'Access denied' });

    res.json({ ticket });
  } catch (err) {
    console.error('[support GET /:ticketId]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── POST /api/support/:ticketId/reply ─────────────────────────────── */
router.post('/:ticketId/reply', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const isInstructor = ['instructor', 'admin'].includes(req.user.role);
    if (!isInstructor && String(ticket.user_id) !== String(req.user.id))
      return res.status(403).json({ message: 'Access denied' });

    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('name role').lean();

    ticket.replies.push({
      sender_id:   req.user.id,
      sender_name: user?.name || 'User',
      sender_role: user?.role || 'student',
      message:     message.trim(),
    });

    if (isInstructor && ticket.status === 'open') ticket.status = 'in_progress';

    await ticket.save();
    res.json({ ticket, message: 'Reply added' });
  } catch (err) {
    console.error('[support POST /:ticketId/reply]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── PUT /api/support/:ticketId/status ─────────────────────────────── */
router.put('/:ticketId/status', async (req, res) => {
  try {
    if (!['instructor', 'admin'].includes(req.user.role))
      return res.status(403).json({ message: 'Instructors only' });

    const { status, priority } = req.body;
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (status) {
      ticket.status = status;
      if (status === 'resolved') ticket.resolved_at = new Date();
      if (status === 'closed')   ticket.closed_at   = new Date();
    }
    if (priority) ticket.priority = priority;

    await ticket.save();
    res.json({ ticket, message: 'Ticket updated' });
  } catch (err) {
    console.error('[support PUT /:ticketId/status]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
