const express = require('express');
const router = express.Router();
const AuditLog = require('../../models/AuditLog');

// Adjust the path to your auth middleware if necessary
// const { protect, authorize } = require('../../middleware/auth');

// GET /api/admin/logs
// Fetch all audit logs with pagination
// Make sure to add your protect/authorize middleware here so only admins can view the logs
router.get('/', /* protect, authorize('super_admin', 'admin'), */ async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50; // Items per page
    const skip = (page - 1) * limit;

    // Fetch logs and populate the user details (name, email, role)
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch system logs' });
  }
});

module.exports = router;