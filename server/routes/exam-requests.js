const express           = require('express');
const router            = express.Router();
const ExamAccessRequest = require('../models/ExamAccessRequest');
const QuizAttempt       = require('../models/QuizAttempt');

const STAFF_ROLES = ['instructor', 'admin', 'super_admin'];

/* ── POST /api/exam-requests ─────────────────────────────────────────
   Student submits a request to unlock another attempt                */
router.post('/', async (req, res) => {
  try {
    const { courseId, quizId, quizTitle, quizType, message } = req.body;
    if (!courseId || !quizId)
      return res.status(400).json({ message: 'courseId and quizId are required' });

    const User   = require('../models/User');
    const Course = require('../models/Course');

    const [user, course] = await Promise.all([
      User.findById(req.user.id).select('name email').lean(),
      Course.findById(courseId).select('title').lean(),
    ]);

    // Must have at least 2 failed attempts
    const attemptCount = await QuizAttempt.countDocuments({
      user_id:   req.user.id,
      course_id: courseId,
      quiz_id:   quizId,
      passed:    false,
    });

    if (attemptCount < 2)
      return res.status(400).json({ message: 'You need at least 2 failed attempts to request access.' });

    // Already has a pending request
    const existing = await ExamAccessRequest.findOne({
      user_id:   req.user.id,
      course_id: courseId,
      quiz_id:   quizId,
      status:    'pending',
    });

    if (existing)
      return res.status(400).json({ message: 'You already have a pending request for this exam.' });

    // Already approved — only block if the approved attempt hasn't been used yet
    const approved = await ExamAccessRequest.findOne({
      user_id:   req.user.id,
      course_id: courseId,
      quiz_id:   quizId,
      status:    'approved',
    });

    if (approved) {
      // Count total failed attempts — if still only 3, they haven't used the approved attempt yet
      const totalFailed = await QuizAttempt.countDocuments({
        user_id:   req.user.id,
        course_id: courseId,
        quiz_id:   quizId,
        passed:    false,
      });

      if (totalFailed <= 3) {
        return res.status(400).json({ message: 'Your request has already been approved. You may take the exam.' });
      }
      // More than 3 failed = approved attempt was used and failed again → allow new request
    }

    const request = await ExamAccessRequest.create({
      user_id:         req.user.id,
      course_id:       courseId,
      quiz_id:         quizId,
      quiz_title:      quizTitle || 'Exam',
      quiz_type:       quizType  || 'final_exam',
      user_name:       user?.name  || 'Unknown',
      user_email:      user?.email || '',
      student_message: message?.trim() || '',
    });

    res.status(201).json({ request, message: 'Request submitted successfully.' });
  } catch (err) {
    console.error('[exam-requests POST]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/exam-requests/admin/all ───────────────────────────────
   Admin/instructor sees all requests
   IMPORTANT: must be before /:id routes to avoid route conflicts     */
router.get('/admin/all', async (req, res) => {
  try {
    if (!STAFF_ROLES.includes(req.user.role))
      return res.status(403).json({ message: 'Access denied' });

    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const requests = await ExamAccessRequest.find(filter)
      .populate('user_id',   'name email')
      .populate('course_id', 'title')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ requests, total: requests.length });
  } catch (err) {
    console.error('[exam-requests GET /admin/all]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/exam-requests/mine/:courseId/:quizId ──────────────────
   Student checks their own request status
   Returns the MOST RECENT request (not just any one)
   IMPORTANT: must be before /:id/review to avoid route conflicts     */
router.get('/mine/:courseId/:quizId', async (req, res) => {
  try {
    // Get the most recent request for this quiz
    const request = await ExamAccessRequest.findOne({
      user_id:   req.user.id,
      course_id: req.params.courseId,
      quiz_id:   req.params.quizId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ request: request || null });
  } catch (err) {
    console.error('[exam-requests GET /mine]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── PATCH /api/exam-requests/:id/review ────────────────────────────
   Admin approves or denies a request                                 */
router.patch('/:id/review', async (req, res) => {
  try {
    if (!STAFF_ROLES.includes(req.user.role))
      return res.status(403).json({ message: 'Access denied' });

    const { status, admin_note } = req.body;
    if (!['approved', 'denied'].includes(status))
      return res.status(400).json({ message: 'status must be approved or denied' });

    const request = await ExamAccessRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending')
      return res.status(400).json({ message: 'Request already reviewed' });

    request.status      = status;
    request.admin_note  = admin_note?.trim() || '';
    request.reviewed_by = req.user.id;
    request.reviewed_at = new Date();
    await request.save();

    // If approved → unlock the quiz attempts so student can retry
    if (status === 'approved') {
      await QuizAttempt.updateMany(
        {
          user_id:   request.user_id,
          course_id: request.course_id,
          quiz_id:   request.quiz_id,
        },
        {
          $set: {
            unlocked_by_instructor: true,
            unlocked_at:            new Date(),
            unlocked_by:            req.user.id,
          },
        }
      );
    }

    res.json({ request, message: `Request ${status}` });
  } catch (err) {
    console.error('[exam-requests PATCH /review]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;