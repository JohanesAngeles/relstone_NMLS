const express = require('express');
const router  = express.Router();
const Course  = require('../models/Course');
const authMiddleware = require('../middleware/auth');
const InstructorLog  = require('../models/InstructorLog');

// ─────────────────────────────────────────────────────────────────
// GET /api/courses
// Get all active courses (with optional filters)
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// GET /api/courses/:id
// Get single course by MongoDB _id OR by nmls_course_id
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// POST /api/courses
// Create course (instructor only)
// ─────────────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Instructors only' });
    }
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/courses/:id
// Update course (admin and instructor)
// ─────────────────────────────────────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // 1. Permission check
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins and instructors only' });
    }

    // 2. Strip fields that must never be overwritten
    const {
      nmls_course_id, // locked — set only at creation
      _id,            // immutable
      __v,            // mongoose version key
      createdAt,      // set at creation
      updatedAt,      // managed by mongoose timestamps
      ...updateData
    } = req.body;

    // 3. Load existing course so we can guard against accidental data loss
    const existing = await Course.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: 'Course not found' });

    // Guard: if frontend sends empty modules array, keep existing modules
    if (Array.isArray(updateData.modules) && updateData.modules.length === 0) {
      delete updateData.modules;
    }

    // Guard: if existing exam had questions but payload sends none,
    // something went wrong on the frontend — keep the existing exam untouched.
    if (updateData.final_exam) {
      const fe               = updateData.final_exam;
      const hasQuestions     = Array.isArray(fe.questions)     && fe.questions.length     > 0;
      const hasBank          = Array.isArray(fe.question_bank) && fe.question_bank.length > 0;
      const existingHasData  =
        (existing.final_exam?.questions?.length     > 0) ||
        (existing.final_exam?.question_bank?.length > 0);

      if (existingHasData && !hasQuestions && !hasBank) {
        delete updateData.final_exam;
      }
    }

    // 4. $set ensures ONLY the provided fields are touched.
    //    Without $set, MongoDB replaces the whole document and wipes
    //    any field not present in the payload (modules, final_exam, etc.)
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // 5. Activity log
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