const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Course  = require('../models/Course');
const Order   = require('../models/Order');
const authMiddleware = require('../middleware/auth');

/* ── instructor + admin only ─────────────────────────────────────── */
const instructorOnly = (req, res, next) => {
  if (!['instructor', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Instructors only' });
  }
  next();
};

/* ─────────────────────────────────────────────────────────────────
   GET /api/instructor/dashboard
───────────────────────────────────────────────────────────────── */
router.get('/dashboard', authMiddleware, instructorOnly, async (req, res) => {
  try {
    const courses = await Course.find({ is_active: true }).lean();

    const students = await User.find({ role: 'student' })
      .select('name email nmls_id state completions createdAt')
      .populate('completions.course_id', 'title type credit_hours')
      .lean();

    const studentRows = [];
    let totalCompletions = 0;

    students.forEach((student) => {
      if (!student.completions || student.completions.length === 0) {
        studentRows.push({
          _id:             student._id,
          name:            student.name,
          email:           student.email,
          course_title:    null,
          course_id:       null,
          status:          'enrolled',
          progress:        0,
          completed_at:    null,
          certificate_url: null,
          enrolled_at:     student.createdAt,
        });
      } else {
        student.completions.forEach((c) => {
          totalCompletions++;
          studentRows.push({
            _id:             student._id,
            name:            student.name,
            email:           student.email,
            course_title:    c.course_id?.title   || 'Unknown Course',
            course_id:       c.course_id?._id      || null,
            status:          'completed',
            progress:        100,
            completed_at:    c.completed_at,
            certificate_url: c.certificate_url || null,
            enrolled_at:     student.createdAt,
          });
        });
      }
    });

    const allOrders = await Order.find({ status: 'completed' })
      .populate('items.course_id', '_id');

    const enrollMap = {};
    for (const order of allOrders) {
      for (const item of order.items || []) {
        const cid = String(item.course_id?._id || item.course_id);
        enrollMap[cid] = (enrollMap[cid] || 0) + 1;
      }
    }

    const enrichedCourses = courses.map((course) => {
      const courseId       = course._id.toString();
      const enrolledCount  = enrollMap[courseId] || 0;
      const completedCount = students.filter((s) =>
        s.completions?.some((c) =>
          c.course_id?._id?.toString() === courseId ||
          c.course_id?.toString()      === courseId
        )
      ).length;
      return {
        ...course,
        active:           course.is_active,
        enrollment_count: enrolledCount,
        completion_count: completedCount,
      };
    });

    res.json({
      courses:           enrichedCourses,
      students:          studentRows,
      total_enrollments: students.length,
      total_completions: totalCompletions,
      active_courses:    courses.filter((c) => c.is_active).length,
      pending_reviews:   0,
    });
  } catch (err) {
    console.error('[instructor/dashboard]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/instructor/students
   Returns ALL students with enrolled courses + progress
───────────────────────────────────────────────────────────────── */
router.get('/students', authMiddleware, instructorOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('completions.course_id', 'title type credit_hours nmls_course_id')
      .sort({ createdAt: -1 })
      .lean();

    const allOrders = await Order.find({ status: 'completed' })
      .populate('items.course_id', 'title type credit_hours');

    // Build enrollment map: userId → [courses]
    const enrollmentMap = {};
    for (const order of allOrders) {
      const uid = String(order.user_id);
      if (!enrollmentMap[uid]) enrollmentMap[uid] = [];
      for (const item of order.items || []) {
        if (item.course_id) {
          enrollmentMap[uid].push({
            course_id:    item.course_id._id,
            title:        item.course_id.title,
            type:         item.course_id.type,
            credit_hours: item.course_id.credit_hours,
          });
        }
      }
    }

    const result = students.map(s => {
      const uid             = String(s._id);
      const enrolledCourses = enrollmentMap[uid] || [];
      const completedIds    = new Set(
        (s.completions || []).map(c => String(c.course_id?._id || c.course_id))
      );

      const courses = enrolledCourses.map(ec => ({
        course_id: ec.course_id,
        title:     ec.title,
        type:      ec.type,
        status:    completedIds.has(String(ec.course_id)) ? 'completed' : 'enrolled',
        progress:  completedIds.has(String(ec.course_id)) ? 100 : 0,
      }));

      const completed = courses.filter(c => c.status === 'completed').length;
      const progress  = courses.length > 0
        ? Math.round((completed / courses.length) * 100) : 0;
      const firstCourse = courses[0] || {};

      return {
        _id:             s._id,
        name:            s.name,
        email:           s.email,
        nmls_id:         s.nmls_id || null,
        state:           s.state   || null,
        course_title:    firstCourse.title || (courses.length > 1 ? `${courses.length} courses` : '—'),
        status:          courses.length > 0 ? (progress === 100 ? 'completed' : 'enrolled') : 'enrolled',
        progress,
        courses,
        completions:     s.completions || [],
        enrolled_at:     s.createdAt,
        certificate_url: (s.completions || []).find(c => c.certificate_url)?.certificate_url || null,
        createdAt:       s.createdAt,
      };
    });

    res.json({ students: result, total: result.length });
  } catch (err) {
    console.error('[instructor/students]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/instructor/students/:id
───────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────
   GET /api/instructor/courses-stats
   All courses with enrollment + completion counts
───────────────────────────────────────────────────────────────── */
router.get('/courses-stats', authMiddleware, instructorOnly, async (req, res) => {
  try {
    const [courses, paidOrders, allUsers] = await Promise.all([
      Course.find({}).sort({ createdAt: -1 }),
      Order.find({ status: 'completed' }).populate('items.course_id', '_id'),
      User.find({ role: 'student' }).select('completions'),
    ]);

    const enrollMap = {};
    for (const order of paidOrders) {
      for (const item of order.items || []) {
        const cid = String(item.course_id?._id || item.course_id);
        enrollMap[cid] = (enrollMap[cid] || 0) + 1;
      }
    }

    const completeMap = {};
    for (const user of allUsers) {
      for (const comp of user.completions || []) {
        const cid = String(comp.course_id);
        completeMap[cid] = (completeMap[cid] || 0) + 1;
      }
    }

    const result = courses.map(c => ({
      _id:              c._id,
      title:            c.title,
      type:             c.type,
      credit_hours:     c.credit_hours,
      nmls_course_id:   c.nmls_course_id,
      active:           c.active ?? c.is_active ?? true,
      enrollment_count: enrollMap[String(c._id)] || 0,
      completion_count: completeMap[String(c._id)] || 0,
    }));

    res.json({ courses: result, total: result.length });
  } catch (err) {
    console.error('[instructor/courses-stats]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/instructor/assign-course
   Body: { student_id, course_id }
───────────────────────────────────────────────────────────────── */
router.post('/assign-course', authMiddleware, instructorOnly, async (req, res) => {
  try {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id)
      return res.status(400).json({ message: 'student_id and course_id are required' });

    const student = await User.findById(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const course = await Course.findById(course_id);
    if (!course)  return res.status(404).json({ message: 'Course not found' });

    const alreadyDone = student.completions.some(
      (c) => c.course_id?.toString() === course_id
    );
    if (alreadyDone)
      return res.status(400).json({ message: 'Course already assigned to this student' });

    student.completions.push({
      course_id:       course._id,
      completed_at:    new Date(),
      certificate_url: null,
    });
    await student.save();

    res.json({ message: `Course "${course.title}" assigned to ${student.name} successfully` });
  } catch (err) {
    console.error('[instructor/assign-course]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.get('/course/:courseId/students', authMiddleware, instructorOnly, async (req, res) => {
  try {
    const { courseId } = req.params;
 
    // 1. Get the course
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
 
    // 2. Get all paid orders that include this course
    const orders = await Order.find({
      status: 'completed',
      'items.course_id': courseId,
    }).lean();
 
    const enrolledUserIds = [...new Set(orders.map(o => String(o.user_id)))];
 
    if (enrolledUserIds.length === 0) {
      return res.json({ students: [], course });
    }
 
    // 3. Get all enrolled users with completions
    const users = await User.find({ _id: { $in: enrolledUserIds } })
      .select('name email nmls_id state completions createdAt')
      .lean();
 
    // 4. Get CourseProgress for each user (if model exists)
    let progressDocs = [];
    try {
      const CourseProgress = require('../models/CourseProgress');
      progressDocs = await CourseProgress.find({
        course_id: courseId,
        user_id:   { $in: enrolledUserIds },
      }).lean();
    } catch { /* CourseProgress model may not exist */ }
 
    const progressMap = {};
    progressDocs.forEach(p => { progressMap[String(p.user_id)] = p; });
 
    // 5. Get QuizAttempts for each user in this course (if model exists)
    let quizDocs = [];
    try {
      const QuizAttempt = require('../models/QuizAttempt');
      quizDocs = await QuizAttempt.find({
        course_id: courseId,
        user_id:   { $in: enrolledUserIds },
      }).sort({ submitted_at: -1 }).lean();
    } catch { /* QuizAttempt model may not exist */ }
 
    // Group quiz attempts by user
    const quizMap = {};
    quizDocs.forEach(q => {
      const uid = String(q.user_id);
      if (!quizMap[uid]) quizMap[uid] = [];
      quizMap[uid].push({
        quiz_id:            q.quiz_id,
        quiz_title:         q.quiz_title,
        quiz_type:          q.quiz_type,
        score_pct:          q.score_pct,
        correct:            q.correct,
        total:              q.total,
        passed:             q.passed,
        passing_score:      q.passing_score,
        time_spent_seconds: q.time_spent_seconds,
        submitted_at:       q.submitted_at,
      });
    });
 
    // 6. Get Enrollment docs for seat time + module progress (if model exists)
    let enrollmentDocs = [];
    try {
      const Enrollment = require('../models/Enrollment');
      enrollmentDocs = await Enrollment.find({
        course_id: courseId,
        user_id:   { $in: enrolledUserIds },
      }).lean();
    } catch { /* Enrollment model may not exist */ }
 
    const enrollmentMap = {};
    enrollmentDocs.forEach(e => { enrollmentMap[String(e.user_id)] = e; });
 
    // 7. Build student result rows
    const students = users.map(u => {
      const uid        = String(u._id);
      const progress   = progressMap[uid];
      const enrollment = enrollmentMap[uid];
      const quizzes    = quizMap[uid] || [];
 
      // Check if completed this course
      const completion = (u.completions || []).find(
        c => String(c.course_id?._id || c.course_id) === String(courseId)
      );
      const isCompleted = !!completion;
 
      // Calculate best/final score from quiz attempts
      const finalExamAttempts = quizzes.filter(q => q.quiz_type === 'final_exam');
      const bestScore = finalExamAttempts.length > 0
        ? Math.max(...finalExamAttempts.map(q => q.score_pct))
        : quizzes.length > 0
          ? Math.max(...quizzes.map(q => q.score_pct))
          : null;
 
      const isPassed = isCompleted && (
        finalExamAttempts.some(q => q.passed) ||
        (bestScore != null && bestScore >= 70)
      );
 
      // Seat hours from enrollment or progress
      const seatSeconds = enrollment?.total_seat_seconds
        || (progress?.total_steps ? null : null)
        || null;
      const seatHours = seatSeconds != null
        ? Math.round((seatSeconds / 3600) * 10) / 10
        : null;
 
      // Progress percentage
      const progressPct = progress
        ? (progress.total_steps > 0
            ? Math.min(100, Math.round((progress.completed_idxs?.length || 0) / progress.total_steps * 100))
            : isCompleted ? 100 : 0)
        : isCompleted ? 100 : 0;
 
      return {
        _id:             u._id,
        name:            u.name,
        email:           u.email,
        nmls_id:         u.nmls_id || null,
        state:           u.state   || null,
        completed:       isCompleted,
        passed:          isPassed,
        score:           bestScore,
        seat_hours:      seatHours,
        progress:        progressPct,
        completed_at:    completion?.completed_at || null,
        certificate_url: completion?.certificate_url || null,
        enrolled_at:     u.createdAt,
        quiz_attempts:   quizzes,
        module_progress: enrollment?.module_progress || progress?.module_progress || [],
      };
    });
 
    // Sort: completed first, then by name
    students.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? -1 : 1;
      return (a.name || "").localeCompare(b.name || "");
    });
 
    res.json({ students, course, total: students.length });
  } catch (err) {
    console.error('[instructor/course/:courseId/students]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
module.exports = router;