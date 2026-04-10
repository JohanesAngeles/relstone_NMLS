const express    = require('express');
const router     = express.Router();
const User       = require('../../models/User');
const Course     = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const Order      = require('../../models/Order');

// GET /api/admin/reports/stats
router.get('/stats', async (req, res) => {
  try {
    // ── Users ──────────────────────────────────────────────────────
    const totalStudents  = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ role: 'student', is_active: true });

    // ── Courses ────────────────────────────────────────────────────
    const totalCourses  = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ is_active: true });

    // ── Orders ─────────────────────────────────────────────────────
    const totalOrders     = await Order.countDocuments();
    const paidOrders      = await Order.countDocuments({ status: { $in: ['paid', 'completed'] } });
    const pendingOrders   = await Order.countDocuments({ status: 'pending' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // ── Revenue by month (last 12 actual months) ───────────────────
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          status:    { $in: ['paid', 'completed'] },
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$total_amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyTotals     = revenueByMonth.map(r => r.total);
    const avgMonthlyRevenue = monthlyTotals.length
      ? monthlyTotals.reduce((a, b) => a + b, 0) / monthlyTotals.length
      : 0;
    const peakMonthRevenue  = monthlyTotals.length ? Math.max(...monthlyTotals) : 0;

    // ── Enrollments by month (last 12 actual months) ───────────────
    const enrollmentsByMonth = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // ── Enrollments ────────────────────────────────────────────────
    const totalEnrollments      = await Enrollment.countDocuments();
    const completedEnrollments  = await Enrollment.countDocuments({ status: 'completed' });
    const inProgressEnrollments = await Enrollment.countDocuments({ status: 'in_progress' });
    const notStartedEnrollments = await Enrollment.countDocuments({ status: 'not_started' });

    // ── Average order value ────────────────────────────────────────
    const avgResult = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'completed'] } } },
      { $group: { _id: null, avg: { $avg: '$total_amount' } } },
    ]);
    const avgOrderValue = avgResult[0]?.avg || 0;

    res.json({
      // students
      totalStudents, activeStudents,
      // courses
      totalCourses, activeCourses,
      // orders
      totalOrders, paidOrders, pendingOrders, cancelledOrders,
      totalRevenue, avgOrderValue,
      revenueByMonth, avgMonthlyRevenue, peakMonthRevenue,
      // enrollments
      totalEnrollments, completedEnrollments, inProgressEnrollments,
      notStartedEnrollments, enrollmentsByMonth,
    });

  } catch (err) {
    console.error('Reports stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/reports/recent-orders
router.get('/recent-orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id',        'name email')
      .populate('items.course_id','title type')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ orders });
  } catch (err) {
    console.error('Recent orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/reports/top-courses
router.get('/top-courses', async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id:       '$course_id',
          enrolled:  { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { enrolled: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from:         'courses',
          localField:   '_id',
          foreignField: '_id',
          as:           'course',
        },
      },
{ $unwind: '$course' },
      {
        $project: {
          title:          '$course.title',
          nmls_course_id: '$course.nmls_course_id',
          type:           '$course.type',
          enrolled:       1,
          completed:      1,
        },
      },
    ];

    const courses = await Enrollment.aggregate(pipeline);
    res.json({ courses });
  } catch (err) {
    console.error('Top courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/reports/recent-enrollments
router.get('/recent-enrollments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user_id',   'name email')
      .populate('course_id', 'title type')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ enrollments });
  } catch (err) {
    console.error('Recent enrollments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/weekly', async (req, res) => {
  try {
    const { start, end } = req.query;  // ← added `end`

    // Default to current week Monday if no start provided
    const rangeStart = start ? new Date(start + 'T00:00:00') : (() => {  // ← renamed + fixed timezone
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    // If end provided, use end of that day; otherwise default to 7 days after start
    const rangeEnd = end                                                   // ← new
      ? new Date(end + 'T23:59:59')
      : new Date(new Date(rangeStart).setDate(rangeStart.getDate() + 7));

    // ── Orders ────────────────────────────────────────────────────
    const weekOrders = await Order.find({
      createdAt: { $gte: rangeStart, $lt: rangeEnd },                     // ← renamed
    })
      .populate('user_id',         'name email')
      .populate('items.course_id', 'title type')
      .sort({ createdAt: -1 });

    const weekRevenue    = weekOrders
      .filter(o => ['paid', 'completed'].includes(o.status))
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const paidCount      = weekOrders.filter(o => ['paid','completed'].includes(o.status)).length;
    const pendingCount   = weekOrders.filter(o => o.status === 'pending').length;
    const cancelledCount = weekOrders.filter(o => o.status === 'cancelled').length;

    // ── Enrollments ───────────────────────────────────────────────
    const weekEnrollments = await Enrollment.find({
      createdAt: { $gte: rangeStart, $lt: rangeEnd },                     // ← renamed
    })
      .populate('user_id',   'name email')
      .populate('course_id', 'title type')
      .sort({ createdAt: -1 });

    const completedCount  = weekEnrollments.filter(e => e.status === 'completed').length;
    const inProgressCount = weekEnrollments.filter(e => e.status === 'in_progress').length;
    const notStartedCount = weekEnrollments.filter(e => e.status === 'not_started').length;

    // ── New students ──────────────────────────────────────────────
    const newStudents = await User.countDocuments({
      role:      'student',
      createdAt: { $gte: rangeStart, $lt: rangeEnd },                     // ← renamed
    });

    // ── Top courses ───────────────────────────────────────────────
    const topCoursesWeek = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: rangeStart, $lt: rangeEnd } } },     // ← renamed
      {
        $group: {
          _id:       '$course_id',
          enrolled:  { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        },
      },
      { $sort: { enrolled: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:         'courses',
          localField:   '_id',
          foreignField: '_id',
          as:           'course',
        },
      },
      { $unwind: '$course' },
      {
        $project: {
          title:     '$course.title',
          type:      '$course.type',
          enrolled:  1,
          completed: 1,
        },
      },
    ]);

    res.json({
      weekStart:  rangeStart,                                              // ← renamed
      weekEnd:    rangeEnd,                                                // ← renamed
      weekRevenue,
      totalOrders:      weekOrders.length,
      paidCount,
      pendingCount,
      cancelledCount,
      totalEnrollments: weekEnrollments.length,
      completedCount,
      inProgressCount,
      notStartedCount,
      newStudents,
      orders:     weekOrders,
      enrollments: weekEnrollments,
      topCourses:  topCoursesWeek,
    });

  } catch (err) {
    console.error('Weekly report error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;