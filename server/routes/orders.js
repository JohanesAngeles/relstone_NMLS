const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Course  = require('../models/Course');
const User    = require('../models/User');
const CourseProgress = require('../models/CourseProgress');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const completedCourseIds = (user.completions || []).map(c =>
      String(c.course_id?._id || c.course_id)
    );

    for (const item of items) {
      if (completedCourseIds.includes(String(item.course_id))) {
        return res.status(400).json({
          message: `You have already completed course ${item.course_id}`,
        });
      }
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const course = await Course.findById(item.course_id);
      if (!course) {
        return res.status(404).json({ message: `Course ${item.course_id} not found` });
      }

      const textbook_price = item.include_textbook ? (course.textbook_price || 0) : 0;
      total += (course.price || 0) + textbook_price;

      orderItems.push({
        course_id:        course._id,
        price:            course.price || 0,
        include_textbook: item.include_textbook || false,
        textbook_price,
      });
    }

    const order = await Order.create({
      user_id:      req.user.id,
      items:        orderItems,
      total_amount: total,
      status:       'completed',
    });

    // Reset per-course progress on new purchase (per user)
    await Promise.all(
      orderItems.map((it) =>
        CourseProgress.findOneAndUpdate(
          { user_id: req.user.id, course_id: it.course_id },
          {
            $set: {
              completed_idxs: [],
              current_idx: 0,
              is_completed: false,
              completed_at: null,
              last_activity_at: new Date(),
              reset_at: new Date(),
            },
            $setOnInsert: { user_id: req.user.id, course_id: it.course_id },
          },
          { upsert: true, new: true }
        )
      )
    );

    const populated = await Order.findById(order._id)
      .populate('items.course_id', 'title nmls_course_id type credit_hours states_approved pdf_url');

    res.status(201).json(populated);

  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/orders/my
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .populate('items.course_id', 'title nmls_course_id type credit_hours');
    res.json(orders);
  } catch (err) {
    console.error('GET /orders/my error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/orders  (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }
    const orders = await Order.find()
      .populate('user_id', 'name email nmls_id')
      .populate('items.course_id', 'title nmls_course_id type credit_hours');
    res.json(orders);
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PATCH /api/orders/:id/status  (admin only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    const { status } = req.body;
    const allowed = ['pending', 'paid', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.course_id', 'title nmls_course_id type credit_hours');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error('PATCH /orders/:id/status error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;