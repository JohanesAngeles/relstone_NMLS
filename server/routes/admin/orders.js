const express = require('express');
const router  = express.Router();
const Order   = require('../../models/Order');
const User    = require('../../models/User');

// GET /api/admin/orders/stats — Revenue stats
router.get('/stats', async (req, res) => {
  try {
    // Total revenue from paid/completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Average order value
    const avgResult = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'completed'] } } },
      { $group: { _id: null, avg: { $avg: '$total_amount' } } }
    ]);
    const avgOrderValue = avgResult[0]?.avg || 0;

    // Revenue by month (last 12 months)
    const revenueByMonth = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'completed'] } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$total_amount' },
          count: { $sum: 1 },
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({ totalRevenue, totalOrders, avgOrderValue, revenueByMonth });

  } catch (err) {
    console.error('Orders stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/orders — Get all orders
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    let orders = await Order.find(query)
      .populate('user_id', 'name email')
      .populate('items.course_id', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Filter by search after populate
    if (search) {
      orders = orders.filter(o =>
        o.user_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user_id?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Order.countDocuments(query);

    res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / limit) });

  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/orders/:id — Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user_id', 'name email phone')
      .populate('items.course_id', 'title nmls_course_id type');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ order });

  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/orders/:id/refund — Refund/cancel order
router.patch('/:id/refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled.' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled/refunded successfully', order });

  } catch (err) {
    console.error('Refund order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;