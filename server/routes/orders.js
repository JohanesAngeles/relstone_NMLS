const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { createNotification, sendNotificationEmail } = require('./notifications');

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

    // After successful purchase, create notification and send email
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        // Get course names for the notification
        const courseIds = normalizedItems.map(item => item.course_id);
        const courses = await Course.find({ _id: { $in: courseIds } }).select('title');
        const courseNames = courses.map(course => course.title).join(', ');

        // Create notification
        const notificationTitle = 'Course Purchased Successfully';
        const notificationBody = `You have successfully purchased ${courseNames}. It is now available in My Courses.`;
        await createNotification(user, {
          type: 'purchase',
          title: notificationTitle,
          body: notificationBody,
        });

        // Send email if user has email preferences enabled
        if (user.notification_prefs?.email_course_updates) {
          const emailBody = `You have successfully purchased ${courseNames}.\n\nYour course is now available in your dashboard under My Courses.`;
          await sendNotificationEmail(user, 'Course Purchase Confirmation', emailBody, {
            eventType: 'purchase',
          });
        }
      }
    } catch (notificationError) {
      console.error('[orders] Error creating notification/email after purchase:', notificationError);
      // Don't fail the purchase if notification/email fails
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

module.exports = router;
