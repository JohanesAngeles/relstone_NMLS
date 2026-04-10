const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Course = require('../../models/Course');
const InstructorLog = require('../../models/InstructorLog');

// GET /api/admin/instructors — Get all instructors
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = { role: 'instructor' };

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active')   query.is_active = true;
    if (status === 'inactive') query.is_active = false;

    const total       = await User.countDocuments(query);
    const instructors = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('name email is_active createdAt last_login_at');

    res.json({ instructors, total, page: Number(page), totalPages: Math.ceil(total / limit) });

  } catch (err) {
    console.error('Get instructors error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/instructors/logs — All logs (must be before /:id)
router.get('/logs', async (req, res) => {
  try {
    const { limit = 100, action, instructor_id, student_id } = req.query;

    const filter = {};
    if (action)        filter.action        = action;
    if (student_id)    filter.student_id    = student_id;
    if (instructor_id) filter.instructor_id = instructor_id;

    const logs = await InstructorLog.find(filter)
      .populate('instructor_id', 'name')
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    const enriched = logs.map(log => ({
      ...log,
      instructor_name: log.instructor_name || log.instructor_id?.name || 'Staff Member',
    }));

    res.json({ logs: enriched, total: enriched.length });
  } catch (err) {
    console.error('Get admin logs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/instructors/:id — Get single instructor
router.get('/:id', async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id)
      .select('-password -otp -otpExpires');

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    const Enrollment = require('../../models/Enrollment');
    const courses = await Course.find({}).select('title nmls_course_id type is_active');

    const coursesWithCount = await Promise.all(
      courses.map(async (c) => {
        const studentCount = await Enrollment.countDocuments({ course_id: c._id });
        return {
          _id:            c._id,
          title:          c.title,
          nmls_course_id: c.nmls_course_id,
          type:           c.type,
          is_active:      c.is_active,
          studentCount,
        };
      })
    );

    const recentLogs = await User.find({
      last_login_at: { $ne: null }
    })
      .sort({ last_login_at: -1 })
      .limit(10)
      .select('name email role last_login_at');

    res.json({ instructor, courses: coursesWithCount, recentLogs });

  } catch (err) {
    console.error('Get instructor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/instructors/:id/logs — Logs for one specific instructor
router.get('/:id/logs', async (req, res) => {
  try {
    const { limit = 50, action } = req.query;

    const instructor = await User.findById(req.params.id);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    const filter = { instructor_id: req.params.id };
    if (action) filter.action = action;

    const logs = await InstructorLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    const enriched = logs.map(log => ({
      ...log,
      instructor_name: log.instructor_name || instructor.name || 'Staff Member',
    }));

    res.json({ logs: enriched, total: enriched.length });
  } catch (err) {
    console.error('Get instructor logs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/instructors — Add new instructor
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const instructor = await User.create({
      name,
      email,
      password: hashedPassword,
      role:       'instructor',
      isVerified: true,
      is_active:  true,
      phone:      phone   || null,
      address:    address || null,
    });

    await InstructorLog.create({
      instructor_id:   instructor._id,
      instructor_name: instructor.name,
      action:          'toggle_active',
      student_id:      instructor._id,
      student_name:    instructor.name,
      student_email:   instructor.email,
      details:         `Instructor account created by admin`,
      timestamp:       new Date(),
    });

    res.status(201).json({
      message: 'Instructor created successfully',
      instructor: {
        id:    instructor._id,
        name:  instructor.name,
        email: instructor.email,
        role:  instructor.role,
      },
    });

  } catch (err) {
    console.error('Create instructor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/instructors/:id — Update instructor
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const instructor = await User.findById(req.params.id);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    if (email && email !== instructor.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already in use.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name    !== undefined && { name }),
        ...(email   !== undefined && { email }),
        ...(phone   !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    await InstructorLog.create({
      instructor_id:   instructor._id,
      instructor_name: instructor.name,
      action:          'toggle_active',
      student_id:      instructor._id,
      student_name:    instructor.name,
      student_email:   instructor.email,
      details:         `Instructor profile updated by admin`,
      timestamp:       new Date(),
    });

    res.json({ message: 'Instructor updated successfully', instructor: updated });

  } catch (err) {
    console.error('Update instructor error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/instructors/:id/toggle-status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    instructor.is_active      = !instructor.is_active;
    instructor.deactivated_at = instructor.is_active ? null : new Date();
    await instructor.save();

    await InstructorLog.create({
      instructor_id:   instructor._id,
      instructor_name: instructor.name,
      action:          'toggle_active',
      student_id:      instructor._id,
      student_name:    instructor.name,
      student_email:   instructor.email,
      details:         `Instructor account ${instructor.is_active ? 'activated' : 'deactivated'} by admin`,
      timestamp:       new Date(),
    });

    res.json({
      message:   `Instructor ${instructor.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: instructor.is_active,
    });

  } catch (err) {
    console.error('Toggle instructor status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/instructors/:id/reset-password
router.patch('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const instructor = await User.findById(req.params.id);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    const salt          = await bcrypt.genSalt(10);
    instructor.password = await bcrypt.hash(newPassword, salt);
    await instructor.save();

    await InstructorLog.create({
      instructor_id:   instructor._id,
      instructor_name: instructor.name,
      action:          'toggle_active',
      student_id:      instructor._id,
      student_name:    instructor.name,
      student_email:   instructor.email,
      details:         `Password reset by admin`,
      timestamp:       new Date(),
    });

    res.json({ message: 'Password reset successfully.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;