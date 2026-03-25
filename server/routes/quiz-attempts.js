const express      = require('express');
const router       = express.Router();
const QuizAttempt  = require('../models/QuizAttempt');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

const safeAnswers = (answers) => {
  if (!answers) return null;
  try {
    if (typeof answers.get === 'function') return Object.fromEntries(answers);
    if (typeof answers === 'object' && !Array.isArray(answers))
      return answers.toObject ? answers.toObject() : answers;
    return null;
  } catch { return null; }
};

router.post('/', async (req, res) => {
  try {
    const {
      courseId, quizId, quizTitle, quizType,
      moduleOrder, scorePct, correct, total,
      passed, passingScore, timeSpentSeconds, answers,
    } = req.body;

    if (!courseId || !quizId || !quizType)
      return res.status(400).json({ message: 'courseId, quizId, quizType required' });

    let answersMap = null;
    if (answers && typeof answers === 'object' && !Array.isArray(answers))
      answersMap = new Map(Object.entries(answers).map(([k, v]) => [k, Number(v)]));

    const attempt = await QuizAttempt.create({
      user_id:            req.user.id,
      course_id:          courseId,
      quiz_id:            quizId,
      quiz_title:         quizTitle,
      quiz_type:          quizType,
      module_order:       moduleOrder ?? null,
      score_pct:          scorePct,
      correct, total, passed,
      passing_score:      passingScore ?? 70,
      time_spent_seconds: timeSpentSeconds ?? null,
      submitted_at:       new Date(),
      answers:            answersMap,
    });

    const attemptCount = await QuizAttempt.countDocuments({
      user_id: req.user.id, course_id: courseId, quiz_id: quizId,
    });

    res.status(201).json({ attempt, attempt_count: attemptCount });
  } catch (err) {
    console.error('[quiz-attempts POST]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// MUST be before /:courseId
router.get('/instructor/pending', async (req, res) => {
  try {
    if (!['instructor', 'admin'].includes(req.user.role))
      return res.status(403).json({ message: 'Instructors only' });

    const pipeline = [
      { $match: { passed: false, unlocked_by_instructor: { $ne: true } } },
      { $group: {
          _id:          { user_id: '$user_id', course_id: '$course_id', quiz_id: '$quiz_id' },
          count:        { $sum: 1 },
          quiz_title:   { $first: '$quiz_title' },
          quiz_type:    { $first: '$quiz_type' },
          last_attempt: { $max: '$submitted_at' },
      }},
      { $match: { count: { $gte: 3 } } },
      { $sort:  { last_attempt: -1 } },
    ];

    const results   = await QuizAttempt.aggregate(pipeline);
    const User      = require('../models/User');
    const Course    = require('../models/Course');
    const userIds   = [...new Set(results.map(r => String(r._id.user_id)))];
    const courseIds = [...new Set(results.map(r => String(r._id.course_id)))];
    const [users, courses] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select('name email nmls_id'),
      Course.find({ _id: { $in: courseIds } }).select('title nmls_course_id'),
    ]);
    const userMap   = Object.fromEntries(users.map(u => [String(u._id), u]));
    const courseMap = Object.fromEntries(courses.map(c => [String(c._id), c]));

    res.json({ pending: results.map(r => ({
      user_id:      String(r._id.user_id),
      course_id:    String(r._id.course_id),
      quiz_id:      r._id.quiz_id,
      quiz_title:   r.quiz_title,
      quiz_type:    r.quiz_type,
      fail_count:   r.count,
      last_attempt: r.last_attempt,
      student:      userMap[String(r._id.user_id)]    || null,
      course:       courseMap[String(r._id.course_id)] || null,
    })) });
  } catch (err) {
    console.error('[quiz-attempts GET /instructor/pending]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/instructor/unlock', async (req, res) => {
  try {
    if (!['instructor', 'admin'].includes(req.user.role))
      return res.status(403).json({ message: 'Instructors only' });

    const { userId, courseId, quizId } = req.body;
    if (!userId || !courseId || !quizId)
      return res.status(400).json({ message: 'userId, courseId, quizId required' });

    await QuizAttempt.updateMany(
      { user_id: userId, course_id: courseId, quiz_id: quizId },
      { $set: { unlocked_by_instructor: true, unlocked_at: new Date(), unlocked_by: req.user.id } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[quiz-attempts POST /instructor/unlock]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    if (courseId === 'instructor')
      return res.status(400).json({ message: 'Invalid courseId' });

    const raw = await QuizAttempt.find({
      user_id:   req.user.id,
      course_id: courseId,
    }).sort({ submitted_at: 1 });

    console.log(`[quiz-attempts] GET /${courseId} — ${raw.length} attempts for user ${req.user.id}`);

    const map = {};
    raw.forEach((a) => {
      if (!map[a.quiz_id]) {
        map[a.quiz_id] = {
          quiz_id:                a.quiz_id,
          quiz_title:             a.quiz_title,
          quiz_type:              a.quiz_type,
          count:                  0,
          passed:                 false,
          locked:                 false,
          unlocked_by_instructor: false,
          attempts:               [],
        };
      }
      const entry = map[a.quiz_id];
      entry.attempts.push({
        _id:                a._id,
        score_pct:          a.score_pct,
        correct:            a.correct,
        total:              a.total,
        passed:             a.passed,
        submitted_at:       a.submitted_at,
        time_spent_seconds: a.time_spent_seconds,
        answers:            safeAnswers(a.answers),
      });
      entry.count = entry.attempts.length;
      if (a.passed)                 entry.passed = true;
      if (a.unlocked_by_instructor) entry.unlocked_by_instructor = true;
    });

    Object.values(map).forEach((q) => {
      if (q.count >= 3 && !q.passed && !q.unlocked_by_instructor) q.locked = true;
    });

    res.json({ attempts: map });
  } catch (err) {
    console.error('[quiz-attempts GET /:courseId]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;