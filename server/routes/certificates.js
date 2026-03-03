const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/certificates/:courseId
// Get certificate data for a completed course
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('completions.course_id');

    const completion = user.completions.find(
      c => c.course_id._id.toString() === req.params.courseId
    );

    if (!completion) {
      return res.status(404).json({ message: 'No completion record found for this course' });
    }

    const course = completion.course_id;

    res.json({
      certificate: {
        student_name: user.name,
        student_nmls_id: user.nmls_id,
        course_title: course.title,
        nmls_course_id: course.nmls_course_id,
        course_type: course.type,
        credit_hours: course.credit_hours,
        completed_at: completion.completed_at,
        issued_at: new Date()
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;