const express = require('express');
const router  = express.Router();
const Course  = require('../models/Course');
const authMiddleware = require('../middleware/auth');
// Import the log model to record instructor/admin actions
const InstructorLog = require('../models/InstructorLog');

// @route   GET /api/courses
// Get all active courses (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, state } = req.query;
    const filter = { is_active: true };
    if (type)  filter.type = type;
    if (state) filter.states_approved = state;

    const courses = await Course.find(filter);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/courses/:id
// Get single course by MongoDB _id OR by nmls_course_id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);

    const course = isObjectId
      ? await Course.findById(id)
      : await Course.findOne({ nmls_course_id: id });

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/courses
// Create course (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/courses/:id
// Update course (admin and instructor)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // 1. Permission Check
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins and instructors only' });
    }

    // 2. Data Sanitization
    const { nmls_course_id, ...updateData } = req.body;

    // 3. Update Database
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!course) return res.status(404).json({ message: 'Course not found' });

    // 4. Activity Log Generation
    await InstructorLog.create({
      instructor_id:   req.user._id || req.user.id,
      instructor_name: req.user.name,
      action:          'edit_course',
      course_id:       course._id,
      course_title:    course.title,
      details:         `Updated course details for "${course.title}"`,
      timestamp:       new Date(),
    });

    res.json(course);
  } catch (err) {
    console.error('[PUT /api/courses/:id Error]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;