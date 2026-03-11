const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Course  = require('../models/Course');
const Order   = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// ── middleware: instructors + admins only ─────────────────────────────
const instructorOnly = (req, res, next) => {
  if (!['instructor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Instructors only' });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/instructor/dashboard
// Returns: courses (all active), students who completed any course,
//          aggregate KPIs
// ─────────────────────────────────────────────────────────────────────
router.get('/dashboard', authMiddleware, instructorOnly, async (req, res) => {
  try {
    // 1. All active courses (instructors can see everything)
    const courses = await Course.find({ is_active: true }).lean();

    // 2. All students (role = 'student') with their completions populated
    const students = await User.find({ role: 'student' })
      .select('name email nmls_id state completions createdAt')
      .populate('completions.course_id', 'title type credit_hours')
      .lean();

    // 3. Flatten into a student-per-course row list for the frontend
    const studentRows = [];
    let totalCompletions = 0;

    students.forEach((student) => {
      if (!student.completions || student.completions.length === 0) {
        // Student enrolled but no completions yet
        studentRows.push({
          _id:          student._id,
          name:         student.name,
          email:        student.email,
          course_title: null,
          course_id:    null,
          status:       'enrolled',
          progress:     0,
          completed_at: null,
          certificate_url: null,
          enrolled_at:  student.createdAt,
        });
      } else {
        student.completions.forEach((c) => {
          totalCompletions++;
          studentRows.push({
            _id:          student._id,
            name:         student.name,
            email:        student.email,
            course_title: c.course_id?.title   || 'Unknown Course',
            course_id:    c.course_id?._id      || null,
            status:       'completed',
            progress:     100,
            completed_at: c.completed_at,
            certificate_url: c.certificate_url || null,
            enrolled_at:  student.createdAt,
          });
        });
      }
    });

    // 4. Enrich each course with enrollment / completion counts
    const enrichedCourses = courses.map((course) => {
      const courseId = course._id.toString();
      const completedCount = students.filter((s) =>
        s.completions?.some((c) => c.course_id?._id?.toString() === courseId ||
                                    c.course_id?.toString()      === courseId)
      ).length;

      return {
        ...course,
        active:           course.is_active,
        enrollment_count: students.length,   // all students can take any course
        completion_count: completedCount,
      };
    });

    // 5. KPI aggregates
    res.json({
      courses:           enrichedCourses,
      students:          studentRows,
      total_enrollments: students.length,
      total_completions: totalCompletions,
      active_courses:    courses.filter((c) => c.is_active).length,
      pending_reviews:   0,   // placeholder — wire up when review feature exists
    });

  } catch (err) {
    console.error('[instructor/dashboard]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/instructor/students
// All students with full completion history
// ─────────────────────────────────────────────────────────────────────
router.get('/students', authMiddleware, instructorOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('completions.course_id', 'title type credit_hours nmls_course_id')
      .lean();

    res.json({ students, total: students.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────
// GET /api/instructor/students/:id
// Single student detail
// ─────────────────────────────────────────────────────────────────────
router.get('/students/:id', authMiddleware, instructorOnly, async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('-password')
      .populate('completions.course_id', 'title type credit_hours nmls_course_id')
      .lean();

    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;