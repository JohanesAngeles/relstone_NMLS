const express = require('express');
const router = express.Router();
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');

// GET /api/admin/courses — Get all courses with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search by title or nmls_course_id
    if (search) {
      query.$or = [
        { title:          { $regex: search, $options: 'i' } },
        { nmls_course_id: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by type
    if (type) query.type = type;

    // Filter by status
    if (status === 'active')   query.is_active = true;
    if (status === 'inactive') query.is_active = false;

    const total   = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('title nmls_course_id type credit_hours price is_active states_approved createdAt');

    res.json({ courses, total, page: Number(page), totalPages: Math.ceil(total / limit) });

  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/courses/:id — Get single course details
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Get enrolled students count
    const enrolledCount = await Enrollment.countDocuments({ course_id: req.params.id });

    // Get enrolled students list
    const enrollments = await Enrollment.find({ course_id: req.params.id })
      .populate('user_id', 'name email is_active')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('user_id progress status createdAt');

    res.json({ course, enrolledCount, enrollments });

  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/courses/:id — Update course details
router.put('/:id', async (req, res) => {
  try {
    const {
      title, description, price, credit_hours,
      provider, level, has_textbook, textbook_price,
      states_approved, pdf_url, video_url,
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...(title           !== undefined && { title }),
        ...(description     !== undefined && { description }),
        ...(price           !== undefined && { price: Number(price) }),
        ...(credit_hours    !== undefined && { credit_hours: Number(credit_hours) }),
        ...(provider        !== undefined && { provider }),
        ...(level           !== undefined && { level }),
        ...(has_textbook    !== undefined && { has_textbook }),
        ...(textbook_price  !== undefined && { textbook_price: Number(textbook_price) }),
        ...(states_approved !== undefined && { states_approved }),
        ...(pdf_url         !== undefined && { pdf_url }),
        ...(video_url       !== undefined && { video_url }),
      },
      { new: true }
    );

    res.json({ message: 'Course updated successfully', course: updated });

  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/courses/:id/toggle-status — Activate / Deactivate
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.is_active = !course.is_active;
    await course.save();

    res.json({
      message: `Course ${course.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: course.is_active,
    });

  } catch (err) {
    console.error('Toggle course status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;