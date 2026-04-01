const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const User    = require('../../models/User');

// GET /api/admin/settings/profile — Get current admin profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/settings/profile — Update admin profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existing) return res.status(400).json({ message: 'Email already in use.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name  !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    res.json({ message: 'Profile updated successfully', user: updated });

  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/settings/password — Change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    const salt    = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully.' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/settings/admins — Get all admins (super_admin only)
router.get('/admins', async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const admins = await User.find({ role: 'admin' })
      .select('name email is_active createdAt last_login_at')
      .sort({ createdAt: -1 });

    res.json({ admins });

  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/settings/admins — Create new admin (super_admin only)
router.post('/admins', async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use.' });

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name, email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      is_active: true,
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });

  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/settings/admins/:id/toggle-status — Toggle admin status
router.patch('/admins/:id/toggle-status', async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    admin.is_active      = !admin.is_active;
    admin.deactivated_at = admin.is_active ? null : new Date();
    await admin.save();

    res.json({
      message: `Admin ${admin.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: admin.is_active,
    });

  } catch (err) {
    console.error('Toggle admin status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;