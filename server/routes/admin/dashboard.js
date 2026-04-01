const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const Order = require('../../models/Order');

// GET /api/admin/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    // Stats
    const totalStudents   = await User.countDocuments({ role: 'student' });
    const totalCourses    = await Course.countDocuments();
    const activeCourses   = await Course.countDocuments({ is_active: true });

    // Total Revenue from paid orders
    const revenueResult = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Recent enrollments (last 5)
    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user_id', 'name email')
      .populate('course_id', 'title');

    // Recent students (last 5)
    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt is_active');

    res.json({
      totalStudents,
      totalCourses,
      activeCourses,
      totalRevenue,
      recentEnrollments,
      recentStudents,
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/dashboard/logs
router.get('/logs', async (req, res) => {
  try {
    // Recent user activity logs (last 10 logins)
    const logs = await User.find({
      last_login_at: { $ne: null }
    })
      .sort({ last_login_at: -1 })
      .limit(10)
      .select('name email role last_login_at');

    res.json({ logs });
  } catch (err) {
    console.error('Logs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;