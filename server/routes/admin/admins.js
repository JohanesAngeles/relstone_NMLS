const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const User    = require('../../models/User');

// GET /api/instructor/admins — Get all admins (paginated, searchable)
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = { role: 'admin' };

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active')   query.is_active = true;
    if (status === 'inactive') query.is_active = false;

    const total  = await User.countDocuments(query);
    const admins = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('name email is_active admin_role phone createdAt last_login_at');

    res.json({ admins, total, page: Number(page), totalPages: Math.ceil(total / limit) });

  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/instructor/admins/:id — Get single admin
router.get('/:id', async (req, res) => {
  try {
    const admin = await User.findById(req.params.id)
      .select('-password -otp -otpExpires');

    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Recent activity logs — last 10 users who logged in
    const recentLogs = await User.find({ last_login_at: { $ne: null } })
      .sort({ last_login_at: -1 })
      .limit(10)
      .select('name email role last_login_at');

    res.json({ admin, recentLogs });

  } catch (err) {
    console.error('Get admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/instructor/admins — Create new admin
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, address, permissions, admin_role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password:    hashedPassword,
      role:        'admin',
      admin_role:  admin_role  || 'admin',
      permissions: permissions || [],
      isVerified:  true,
      is_active:   true,
      phone:       phone   || null,
      address:     address || null,
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id:         admin._id,
        name:       admin.name,
        email:      admin.email,
        role:       admin.role,
        admin_role: admin.admin_role,
      },
    });

  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/instructor/admins/:id — Update admin
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, permissions, admin_role } = req.body;

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (email && email !== admin.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already in use.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name        !== undefined && { name }),
        ...(email       !== undefined && { email }),
        ...(phone       !== undefined && { phone }),
        ...(address     !== undefined && { address }),
        ...(permissions !== undefined && { permissions }),
        ...(admin_role  !== undefined && { admin_role }),
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    res.json({ message: 'Admin updated successfully', admin: updated });

  } catch (err) {
    console.error('Update admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/instructor/admins/:id/toggle-status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.is_active      = !admin.is_active;
    admin.deactivated_at = admin.is_active ? null : new Date();
    await admin.save();

    res.json({
      message:   `Admin ${admin.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: admin.is_active,
    });

  } catch (err) {
    console.error('Toggle admin status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/instructor/admins/:id/reset-password
router.patch('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const salt       = await bcrypt.genSalt(10);
    admin.password   = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: 'Password reset successfully.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;