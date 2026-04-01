const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// GET /api/admin/students — Get all students with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = { role: 'student' };

    // Search by name or email
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status === 'active')   query.is_active = true;
    if (status === 'inactive') query.is_active = false;

    const total    = await User.countDocuments(query);
    const students = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('name email nmls_id state is_active createdAt last_login_at');

    res.json({ students, total, page: Number(page), totalPages: Math.ceil(total / limit) });

  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/students/:id — Get single student details
router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password -otp -otpExpires');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ student });

  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/students/:id/toggle-status — Activate / Deactivate
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.is_active      = !student.is_active;
    student.deactivated_at = student.is_active ? null : new Date();
    await student.save();

    res.json({
      message: `Student ${student.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: student.is_active,
    });

  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/students/:id — Update student data
router.put('/:id', async (req, res) => {
  try {
    const {
      name, email, phone, state, nmls_id,
      license_type, target_state, target_date,
      experience, address,
    } = req.body;

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if email is taken by another user
    if (email && email !== student.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use by another account.' });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name         !== undefined && { name }),
        ...(email        !== undefined && { email }),
        ...(phone        !== undefined && { phone }),
        ...(state        !== undefined && { state }),
        ...(nmls_id      !== undefined && { nmls_id }),
        ...(license_type !== undefined && { license_type }),
        ...(target_state !== undefined && { target_state }),
        ...(target_date  !== undefined && { target_date }),
        ...(experience   !== undefined && { experience }),
        ...(address      !== undefined && { address }),
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    res.json({ message: 'Student updated successfully', student: updated });

  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;