const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const notificationService = require('./notifications');

const sendOrderNotification = async (user, courseNames) => {
  const shouldSendEmail = user.notification_prefs?.purchase?.email ?? true;
  const shouldSendInApp = user.notification_prefs?.purchase?.inapp ?? true;

  if (shouldSendInApp) {
    const customTitle = 'Course Purchased Successfully';
    const customBody = `You have successfully purchased ${courseNames}. It is now available in My Courses.`;
    await notificationService.createNotification(user, {
      type: 'purchase',
      title: customTitle,
      body: customBody,
    });
  }

  if (shouldSendEmail) {
    const emailBody = `You have successfully purchased ${courseNames}.\n\nYour course is now available in your dashboard under My Courses.`;
    await notificationService.sendNotificationEmail(user, 'Course Purchase Confirmation', emailBody, {
      eventType: 'purchase',
    });
  }
};

/**
 * POST /api/orders
 * Creates an order from checkout (authenticated user).
 * Payment gateways (Stripe, ACH, etc.) can be wired in later; we still persist method + billing.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, total_amount, billing, payment_method } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const allowedMethods = ['credit_card', 'ach', 'payment_plan'];
    const method =
      payment_method && allowedMethods.includes(payment_method)
        ? payment_method
        : 'credit_card';

    const normalizedItems = [];
    for (const it of items) {
      const rawId = it.course_id;
      if (!rawId || !mongoose.Types.ObjectId.isValid(String(rawId))) {
        return res.status(400).json({ message: 'Invalid course id in cart' });
      }

      const course = await Course.findById(rawId).select('_id');
      if (!course) {
        return res.status(400).json({ message: 'One or more courses are no longer available' });
      }

      const includeTextbook = !!it.include_textbook;
      const price = Number(it.price) || 0;
      const textbookPrice = includeTextbook ? Number(it.textbook_price) || 0 : 0;

      normalizedItems.push({
        course_id: course._id,
        price,
        include_textbook: includeTextbook,
        textbook_price: textbookPrice,
      });
    }

    const computedTotal = normalizedItems.reduce(
      (sum, it) => sum + it.price + (it.include_textbook ? it.textbook_price : 0),
      0
    );

    const clientTotal = Number(total_amount);
    if (Number.isNaN(clientTotal) || Math.abs(clientTotal - computedTotal) > 0.02) {
      return res.status(400).json({ message: 'Order total does not match items' });
    }

    // When you add a real processor, switch to 'pending' until the webhook confirms payment.
    const status = 'completed';

    const order = await Order.create({
      user_id: req.user.id,
      items: normalizedItems,
      total_amount: computedTotal,
      status,
      payment_method: method,
      billing: billing && typeof billing === 'object' ? billing : undefined,
    });

    // After successful purchase, trigger notification and email based on user preferences
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        const courseIds = normalizedItems.map((item) => item.course_id);
        const courses = await Course.find({ _id: { $in: courseIds } }).select('title');
        const courseNames = courses.map((course) => course.title).join(', ');

        try {
          await sendOrderNotification(user, courseNames);
        } catch (notifyError) {
          console.error('[orders] Error sending notifications after purchase:', notifyError);
        }
      }
    } catch (notificationError) {
      console.error('[orders] Error sending notifications after purchase:', notificationError);
    }

    return res.status(201).json(order);
  } catch (err) {
    console.error('[orders] POST /', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/orders
 * Lists the signed-in user's orders (newest first).
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.course_id', 'title type credit_hours nmls_course_id states_approved pdf_url');

    res.json({ orders });
  } catch (err) {
    console.error('[orders] GET /', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findOne({ _id: orderId, user_id: req.user.id })
      .populate('items.course_id', 'title type credit_hours nmls_course_id states_approved pdf_url');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (err) {
    console.error('[orders] GET /:orderId', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
