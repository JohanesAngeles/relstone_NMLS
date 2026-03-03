const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/courses
// Get all courses (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, state } = req.query;
    let filter = { is_active: true };

    if (type) filter.type = type;
    if (state) filter.states_approved = state;

    const courses = await Course.find(filter);
    res.json(courses);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/courses/:id
// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
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
// Update course (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;