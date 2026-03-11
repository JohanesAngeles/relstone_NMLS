const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/orders
// Create a new order (checkout)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    // items = [{ course_id, include_textbook }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Check student eligibility (no re-enrollment in same course)
    const user = await User.findById(req.user.id);
    const completedCourseIds = user.completions.map(c => c.course_id.toString());

    for (const item of items) {
      if (completedCourseIds.includes(item.course_id)) {
        return res.status(400).json({
          message: `You have already completed course ${item.course_id}`
        });
      }
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const course = await Course.findById(item.course_id);
      if (!course) {
        return res.status(404).json({ message: `Course ${item.course_id} not found` });
      }

      const textbook_price = item.include_textbook ? course.textbook_price : 0;
      total += course.price + textbook_price;

      orderItems.push({
        course_id: course._id,
        price: course.price,
        include_textbook: item.include_textbook || false,
        textbook_price
      });
    }

    const order = await Order.create({
  user_id: req.user.id,
  items: orderItems,
  total_amount: total,   // ← add this line
});

    res.status(201).json(order);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/orders/my
// Get logged-in student's orders
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .populate('items.course_id', 'title nmls_course_id type credit_hours');
    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/orders (admin only)
// Get all orders
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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;