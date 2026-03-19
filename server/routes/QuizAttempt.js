const express      = require('express');
const router       = express.Router();
const QuizAttempt  = require('../models/QuizAttempt');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ── POST /api/quiz-attempts ───────────────────────────────────────────
// Log a quiz attempt. Called by CoursePortal on every quiz submission.
router.post('/', async (req, res) => {
  try {
    const {
      courseId, quizId, quizTitle, quizType,
      moduleOrder, scorePct, correct, total,
      passed, passingScore, timeSpentSeconds,
    } = req.body;

    if (!courseId || !quizId || !quizType) {
      return res.status(400).json({ message: 'courseId, quizId, quizType required' });
    }

    const attempt = await QuizAttempt.create({
      user_id:            req.user.id,
      course_id:          courseId,
      quiz_id:            quizId,
      quiz_title:         quizTitle,
      quiz_type:          quizType,
      module_order:       moduleOrder ?? null,
      score_pct:          scorePct,
      correct,
      total,
      passed,
      passing_score:      passingScore ?? 70,
      time_spent_seconds: timeSpentSeconds ?? null,
      submitted_at:       new Date(),
    });

    // Count total attempts for this quiz
    const attemptCount = await QuizAttempt.countDocuments({
      user_id:   req.user.id,
      course_id: courseId,
      quiz_id:   quizId,
    });

    res.status(201).json({ attempt, attempt_count: attemptCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/quiz-attempts/:courseId ──────────────────────────────────
// Get all quiz attempts for a student in a course.
// Returns attempt counts per quiz_id so CoursePortal knows what to show.
router.get('/:courseId', async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user_id:   req.user.id,
      course_id: req.params.courseId,
    }).sort({ submitted_at: 1 });

    // Build a map: quiz_id → { attempts[], count, passed, locked, unlocked_by_instructor }
    const map = {};
    attempts.forEach((a) => {
      if (!map[a.quiz_id]) {
        map[a.quiz_id] = {
          quiz_id:                a.quiz_id,
          quiz_title:             a.quiz_title,
          quiz_type:              a.quiz_type,
          attempts:               [],
          count:                  0,
          passed:                 false,
          locked:                 false,
          unlocked_by_instructor: a.unlocked_by_instructor || false,
        };
      }
      map[a.quiz_id].attempts.push({
        score_pct:    a.score_pct,
        passed:       a.passed,
        submitted_at: a.submitted_at,
      });
      map[a.quiz_id].count = map[a.quiz_id].attempts.length;
      if (a.passed) map[a.quiz_id].passed = true;
      if (a.unlocked_by_instructor) map[a.quiz_id].unlocked_by_instructor = true;
    });

    // Apply lock logic:
    // - 3rd+ attempt → locked UNLESS instructor has unlocked
    Object.values(map).forEach((q) => {
      if (q.count >= 3 && !q.unlocked_by_instructor) {
        q.locked = true;
      }
    });

    res.json({ attempts: map });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/quiz-attempts/instructor/pending ─────────────────────────
// Instructor only — get all students with 2+ failed attempts needing unlock.
router.get('/instructor/pending', async (req, res) => {
  try {
    if (!['instructor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Instructors only' });
    }

    // Find quiz_ids where a student has 2+ failed attempts and not yet unlocked
    const pipeline = [
      { $match: { passed: false, unlocked_by_instructor: { $ne: true } } },
      {
        $group: {
          _id:       { user_id: '$user_id', course_id: '$course_id', quiz_id: '$quiz_id' },
          count:     { $sum: 1 },
          quiz_title:{ $first: '$quiz_title' },
          quiz_type: { $first: '$quiz_type' },
          last_attempt: { $max: '$submitted_at' },
        },
      },
      { $match: { count: { $gte: 2 } } },
      { $sort: { last_attempt: -1 } },
    ];

    const results = await QuizAttempt.aggregate(pipeline);

    // Populate user info
    const User = require('../models/User');
    const Course = require('../models/Course');

    const userIds   = [...new Set(results.map(r => String(r._id.user_id)))];
    const courseIds = [...new Set(results.map(r => String(r._id.course_id)))];

    const [users, courses] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select('name email nmls_id'),
      Course.find({ _id: { $in: courseIds } }).select('title nmls_course_id'),
    ]);

    const userMap   = Object.fromEntries(users.map(u   => [String(u._id),   u]));
    const courseMap = Object.fromEntries(courses.map(c => [String(c._id), c]));

    const pending = results.map(r => ({
      user_id:    String(r._id.user_id),
      course_id:  String(r._id.course_id),
      quiz_id:    r._id.quiz_id,
      quiz_title: r.quiz_title,
      quiz_type:  r.quiz_type,
      fail_count: r.count,
      last_attempt: r.last_attempt,
      student:    userMap[String(r._id.user_id)]   || null,
      course:     courseMap[String(r._id.course_id)] || null,
    }));

    res.json({ pending });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/quiz-attempts/instructor/unlock ─────────────────────────
// Instructor unlocks a specific quiz for a student.
// Resets the lock so student can take one more attempt.
router.post('/instructor/unlock', async (req, res) => {
  try {
    if (!['instructor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Instructors only' });
    }

    const { userId, courseId, quizId } = req.body;
    if (!userId || !courseId || !quizId) {
      return res.status(400).json({ message: 'userId, courseId, quizId required' });
    }

    // Mark all existing failed attempts for this quiz as unlocked
    await QuizAttempt.updateMany(
      { user_id: userId, course_id: courseId, quiz_id: quizId },
      { $set: { unlocked_by_instructor: true, unlocked_at: new Date(), unlocked_by: req.user.id } }
    );

    res.json({ success: true, message: 'Quiz unlocked for student' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;