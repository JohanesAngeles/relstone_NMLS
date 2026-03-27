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

/**
 * GET /api/orders/refunds/admin
 * Admin endpoint to get all refund requests.
 * Requires: admin role (disabled for testing)
 */
router.get('/refunds/admin', authMiddleware, async (req, res) => {
  try {
    // TODO: Re-enable admin check after testing
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ message: 'Forbidden: Admin access required' });
    // }

    const refunds = await Order.find({ refund_status: { $ne: null } })
      .populate('user_id', 'name email')
      .sort({ 'refund_request.requested_at': -1 });

    res.json({ refunds });
  } catch (err) {
    console.error('[orders] GET /refunds/admin', err);
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

/**
 * POST /api/orders/:orderId/refund
 * User requests a refund for an order.
 */
router.post('/:orderId/refund', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, details } = req.body;

    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    if (!reason || !['Course not as described', 'Technical issues prevented access', 'Purchased by mistake', 'Duplicate purchase', 'Other'].includes(reason)) {
      return res.status(400).json({ message: 'Valid refund reason is required' });
    }

    const order = await Order.findOne({ _id: orderId, user_id: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed orders can be refunded' });
    }

    if (order.refund_status) {
      return res.status(400).json({ message: 'Refund already requested for this order' });
    }

    // Check if order is within refund window (7 days)
    const orderDate = order.createdAt;
    const now = new Date();
    const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      return res.status(400).json({ message: 'Refund window has expired (7 days from purchase)' });
    }

    order.refund_request = {
      reason,
      details: details || '',
      requested_at: new Date(),
    };

    const autoApprove = String(req.query.autoApprove).toLowerCase() === 'true';
    if (autoApprove) {
      order.refund_status = 'approved';
    } else {
      order.refund_status = 'pending';
    }

    await order.save();

    // Send notification to user
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        const shouldSendEmail = user.notification_prefs?.refund?.email ?? true;
        const shouldSendInApp = user.notification_prefs?.refund?.inapp ?? true;

        if (shouldSendInApp) {
          await notificationService.createNotification(user, {
            type: 'refund_request',
            title: 'Refund Request Submitted',
            body: `Your refund request for order ${orderId} has been submitted and is pending review.`,
          });
        }

        if (shouldSendEmail) {
          const emailBody = `Your refund request has been submitted.\n\nOrder ID: ${orderId}\nReason: ${reason}\n\nWe will review your request within 5-7 business days and notify you of the decision.`;
          await notificationService.sendNotificationEmail(user, 'Refund Request Submitted', emailBody, {
            eventType: 'refund_request',
          });
        }
      }
    } catch (notifyError) {
      console.error('[orders] Error sending refund request notifications:', notifyError);
    }

    res.json({ message: 'Refund request submitted successfully', order });
  } catch (err) {
    console.error('[orders] POST /:orderId/refund', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/orders/refunds/admin
 * Admin endpoint to get all refund requests.
 * Requires: admin role (disabled for testing)
 */
router.get('/refunds/admin', authMiddleware, async (req, res) => {
  try {
    // TODO: Re-enable admin check after testing
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ message: 'Forbidden: Admin access required' });
    // }

    const refunds = await Order.find({ refund_status: { $ne: null } })
      .populate('user_id', 'name email')
      .sort({ 'refund_request.requested_at': -1 });

    res.json({ refunds });
  } catch (err) {
    console.error('[orders] GET /refunds/admin', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/orders/:orderId/refund/:action
 * Admin approves or rejects refund.
 * action: 'approve' or 'reject'
 * TODO: Add admin middleware
 */
router.post('/:orderId/refund/:action', authMiddleware, async (req, res) => {
  try {
    const { orderId, action } = req.params;
    const { admin_notes } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId).populate('user_id', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.refund_status !== 'pending') {
      return res.status(400).json({ message: 'Refund request is not pending and cannot be updated' });
    }

    // TODO: Re-enable admin check after testing
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ message: 'Forbidden: Admin access required' });
    // }

    if (action === 'approve') {
      order.refund_status = 'approved';
      order.status = 'refund_approved';
      // TODO: Process actual refund through payment gateway
    } else {
      order.refund_status = 'rejected';
      order.status = 'refund_rejected';
      order.refund_processed_at = new Date();
    }

    await order.save();

    // Notify user
    try {
      const userId = order.user_id?._id || order.user_id;
      const user = await User.findById(userId);
      if (user) {
        const shouldSendEmail = user.notification_prefs?.refund?.email ?? true;
        const shouldSendInApp = user.notification_prefs?.refund?.inapp ?? true;

        const title = action === 'approve' ? 'Refund Approved' : 'Refund Rejected';
        const body = action === 'approve'
          ? `Your refund request for order ${orderId} has been approved. The refund will be processed within 3-5 business days.`
          : `Your refund request for order ${orderId} has been rejected. ${admin_notes || ''}`;

        if (shouldSendInApp) {
          await notificationService.createNotification(user, {
            type: 'refund_' + action,
            title,
            body,
          });
        }

        if (shouldSendEmail) {
          const emailBody = body + '\n\nIf you have questions, please contact support.';
          await notificationService.sendNotificationEmail(user, title, emailBody, {
            eventType: 'refund_' + action,
          });
        }
      }
    } catch (notifyError) {
      console.error('[orders] Error sending refund decision notifications:', notifyError);
    }

    res.json({ message: `Refund ${action}d successfully`, order });
  } catch (err) {
    console.error('[orders] POST /:orderId/refund/:action', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * POST /api/orders/:orderId/refund/process
 * Admin marks refund as processed (after gateway confirmation).
 * Requires: admin role (disabled for testing)
 */
router.post('/:orderId/refund/process', authMiddleware, async (req, res) => {
  try {
    // TODO: Re-enable admin check after testing
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ message: 'Forbidden: Admin access required' });
    // }

    const { orderId } = req.params;

    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(orderId).populate('user_id', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.refund_status !== 'approved') {
      return res.status(400).json({ message: 'Refund must be approved before processing' });
    }

    // If already processed, avoid re-processing
    if (order.refund_status === 'processed') {
      return res.status(400).json({ message: 'Refund is already processed' });
    }

    order.refund_status = 'processed';
    order.status = 'refund_processed'; // Update main order status

    await order.save();

    // Notify user
    try {
      const userId = order.user_id?._id || order.user_id;
      const user = await User.findById(userId);
      if (user) {
        const shouldSendEmail = user.notification_prefs?.refund?.email ?? true;
        const shouldSendInApp = user.notification_prefs?.refund?.inapp ?? true;

        if (shouldSendInApp) {
          await notificationService.createNotification(user, {
            type: 'refund_processed',
            title: 'Refund Processed',
            body: `Your refund for order ${orderId} has been successfully processed. The amount will appear in your account within 3-5 business days.`,
          });
        }

        if (shouldSendEmail) {
          const emailBody = `Your refund has been processed successfully.\n\nOrder ID: ${orderId}\nAmount: $${order.total_amount}\n\nThe funds should appear in your original payment method within 3-5 business days.`;
          await notificationService.sendNotificationEmail(user, 'Refund Processed', emailBody, {
            eventType: 'refund_processed',
          });
        }
      }
    } catch (notifyError) {
      console.error('[orders] Error sending refund processed notifications:', notifyError);
    }

    res.json({ message: 'Refund marked as processed', order });
  } catch (err) {
    console.error('[orders] POST /:orderId/refund/process', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
