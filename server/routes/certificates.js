const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Course  = require('../models/Course');
const authMiddleware = require('../middleware/auth');

// ── GET /api/certificates ─────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Step 1: get user with completions populated
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path:   'completions.course_id',
        model:  'Course',
        select: 'title type credit_hours nmls_course_id state_approval_number states_approved',
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 2: if no completions, return empty array (not an error)
    if (!user.completions || user.completions.length === 0) {
      return res.json({ certificates: [] });
    }

    // Step 3: map completions to certificate objects
    const certificates = user.completions.map((c) => {
      // course_id is populated — it's either a Course object or null
      const course = (c.course_id && typeof c.course_id === 'object')
        ? c.course_id
        : {};

      return {
        _id:                  String(c._id || ''),
        course_id:            String(course._id || c.course_id || ''),
        student_name:         user.name         || '—',
        student_nmls_id:      user.nmls_id      || '—',
        course_title:         course.title      || '—',
        nmls_course_id:       course.nmls_course_id   || '—',
        course_type:          course.type             || '—',
        credit_hours:         course.credit_hours     || 0,
        state:                (course.states_approved && course.states_approved[0])
                                || user.state || '—',
        state_approval_number: course.state_approval_number || '—',
        completed_at:         c.completed_at  || null,
        issued_at:            c.completed_at  || null,
        certificate_url:      c.certificate_url || null,
      };
    });

    res.json({ certificates });

  } catch (err) {
    // Log the full error so you can see it in your server console
    console.error('GET /api/certificates ERROR:', err);
    res.status(500).json({
      message: 'Server error',
      error:   err.message,
      stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

// ── GET /api/certificates/:courseId ──────────────────────────────────────────
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path:   'completions.course_id',
        model:  'Course',
        select: 'title type credit_hours nmls_course_id state_approval_number states_approved',
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the matching completion
    const completion = (user.completions || []).find((c) => {
      const cId = String(c.course_id?._id || c.course_id || '');
      return cId === String(req.params.courseId);
    });

    if (!completion) {
      return res.status(404).json({
        message: 'Certificate not found. Complete this course first.',
      });
    }

    const course = (completion.course_id && typeof completion.course_id === 'object')
      ? completion.course_id
      : {};

    res.json({
      certificate: {
        _id:                  String(completion._id || ''),
        student_name:         user.name        || '—',
        student_nmls_id:      user.nmls_id     || '—',
        course_title:         course.title     || '—',
        nmls_course_id:       course.nmls_course_id  || '—',
        course_type:          course.type            || '—',
        credit_hours:         course.credit_hours    || 0,
        state:                (course.states_approved && course.states_approved[0])
                                || user.state || '—',
        state_approval_number: course.state_approval_number || '—',
        completed_at:         completion.completed_at || null,
        issued_at:            completion.completed_at || null,
        certificate_url:      completion.certificate_url || null,
      }
    });

  } catch (err) {
    console.error('GET /api/certificates/:courseId ERROR:', err);
    res.status(500).json({
      message: 'Server error',
      error:   err.message,
      stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

module.exports = router;