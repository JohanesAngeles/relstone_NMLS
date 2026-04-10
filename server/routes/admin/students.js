const express    = require('express');
const router     = express.Router();
const User       = require('../../models/User');
const Enrollment = require('../../models/Enrollment');

// GET /api/admin/students
router.get('/', async (req, res) => {
  try {
    const { search, email, nmls_id, state, status, page = 1, limit = 10 } = req.query;

    const query = { role: 'student' };

    // General name/email search
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Individual field filters
    if (email)   query.email   = { $regex: email,   $options: 'i' };
    if (nmls_id) query.nmls_id = { $regex: nmls_id, $options: 'i' };
    if (state)   query.state   = { $regex: state,   $options: 'i' };

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

// GET /api/admin/students/:id
router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password -otp -otpExpires');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const enrollments = await Enrollment.find({ user_id: req.params.id })
      .populate('course_id', 'title type credit_hours nmls_course_id')
      .lean();

    res.json({ student, enrollments });

  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/students/:id/toggle-status
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
      message:   `Student ${student.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: student.is_active,
    });

  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/students/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      name, email, phone, state, nmls_id,
      license_type, target_state, target_date,
      experience, address,
      renewal_status, ce_hours_required,
      ce_renewal_deadline, ce_renewal_cycle_start,
    } = req.body;

    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (email && email !== student.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use by another account.' });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name                   !== undefined && { name }),
        ...(email                  !== undefined && { email }),
        ...(phone                  !== undefined && { phone }),
        ...(state                  !== undefined && { state }),
        ...(nmls_id                !== undefined && { nmls_id }),
        ...(license_type           !== undefined && { license_type }),
        ...(target_state           !== undefined && { target_state }),
        ...(target_date            !== undefined && { target_date }),
        ...(experience             !== undefined && { experience }),
        ...(address                !== undefined && { address }),
        ...(renewal_status         !== undefined && { renewal_status }),
        ...(ce_hours_required      !== undefined && { ce_hours_required }),
        ...(ce_renewal_deadline    !== undefined && { ce_renewal_deadline }),
        ...(ce_renewal_cycle_start !== undefined && { ce_renewal_cycle_start }),
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    res.json({ message: 'Student updated successfully', student: updated });

  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /:studentId/enrollments/:enrollmentId
router.delete('/:studentId/enrollments/:enrollmentId', async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason }       = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    if (enrollment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot remove a completed course.' });
    }

    enrollment.status         = 'removed';
    enrollment.removed_at     = new Date();
    enrollment.removal_reason = reason || 'Removed by admin';
    await enrollment.save();

    res.json({ message: 'Course removed successfully.' });

  } catch (err) {
    console.error('Remove enrollment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /:studentId/enrollments/:enrollmentId/reenroll
router.patch('/:studentId/enrollments/:enrollmentId/reenroll', async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    enrollment.status         = 'in_progress';
    enrollment.progress       = 0;
    enrollment.removed_at     = null;
    enrollment.removal_reason = null;
    await enrollment.save();

    res.json({ message: 'Student re-enrolled successfully.' });

  } catch (err) {
    console.error('Re-enroll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// POST /api/admin/students — Admin creates a new student account
router.post('/', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const {
      name, email, password, nmls_id, state, phone,
      address, town_city, zip_code, company,
      work_phone, home_phone, license_type,
      target_state, target_date, experience,
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ message: 'A user with this email already exists.' });

    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const student = await User.create({
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      password:     hashed,
      role:         'student',
      isVerified:   true,   // admin-created accounts skip OTP
      is_active:    true,
      nmls_id:      nmls_id     || null,
      state:        state       || null,
      phone:        phone       || null,
      address:      address     || null,
      town_city:    town_city   || null,
      zip_code:     zip_code    || null,
      company:      company     || null,
      work_phone:   work_phone  || null,
      home_phone:   home_phone  || null,
      license_type: license_type || null,
      target_state: target_state || null,
      target_date:  target_date  || null,
      experience:   experience   || null,
    });

    const { password: _, otp, otpExpires, ...safe } = student.toObject();
    res.status(201).json({ message: 'Student created successfully.', student: safe });

  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
