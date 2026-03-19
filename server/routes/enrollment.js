const express    = require('express');
const router     = express.Router();
const Enrollment = require('../models/Enrollment');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ── POST /api/enrollment/enroll ───────────────────────────────────────
// Enroll student in a course (creates enrollment record if not exists)
router.post('/enroll', async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    let enrollment = await Enrollment.findOne({ user_id: req.user.id, course_id: courseId });
    if (enrollment) return res.json({ enrollment, already_enrolled: true });

    enrollment = await Enrollment.create({
      user_id:   req.user.id,
      course_id: courseId,
      status:    'enrolled',
    });

    res.status(201).json({ enrollment, already_enrolled: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/enrollment/:courseId ─────────────────────────────────────
// Get enrollment + progress for a course
router.get('/:courseId', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user_id:   req.user.id,
      course_id: req.params.courseId,
    });

    if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── PUT /api/enrollment/:courseId/progress ────────────────────────────
// Update progress + accumulate seat time (called by useSeatTimer every 30s)
router.put('/:courseId/progress', async (req, res) => {
  try {
    const { completed_idxs, current_idx, total_steps, seat_seconds_delta, module_order } = req.body;

    const enrollment = await Enrollment.findOne({
      user_id:   req.user.id,
      course_id: req.params.courseId,
    });

    if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
    if (!enrollment.rocs_agreed) return res.status(403).json({ message: 'ROCS agreement required' });

    // Update progress fields
    if (Array.isArray(completed_idxs))  enrollment.completed_idxs = completed_idxs;
    if (Number.isFinite(current_idx))   enrollment.current_idx    = current_idx;
    if (Number.isFinite(total_steps))   enrollment.total_steps    = total_steps;

    // Accumulate seat time
    if (Number.isFinite(seat_seconds_delta) && seat_seconds_delta > 0) {
      enrollment.total_seat_seconds = (enrollment.total_seat_seconds || 0) + seat_seconds_delta;

      // Per-module seat time
      if (Number.isFinite(module_order)) {
        const modEntry = enrollment.module_progress.find(m => m.module_order === module_order);
        if (modEntry) {
          modEntry.seat_seconds = (modEntry.seat_seconds || 0) + seat_seconds_delta;
        } else {
          enrollment.module_progress.push({ module_order, seat_seconds: seat_seconds_delta });
        }
      }
    }

    if (enrollment.status === 'enrolled') enrollment.status = 'in_progress';
    enrollment.last_active_at = new Date();

    await enrollment.save();
    res.json({ success: true, total_seat_seconds: enrollment.total_seat_seconds });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/enrollment/:courseId/complete-module ────────────────────
// Mark a specific module as complete
router.post('/:courseId/complete-module', async (req, res) => {
  try {
    const { module_order, module_title, quiz_passed, quiz_score } = req.body;

    const enrollment = await Enrollment.findOne({
      user_id:   req.user.id,
      course_id: req.params.courseId,
    });

    if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
    if (!enrollment.rocs_agreed) return res.status(403).json({ message: 'ROCS agreement required' });

    const existing = enrollment.module_progress.find(m => m.module_order === module_order);
    if (existing) {
      existing.completed    = true;
      existing.completed_at = new Date();
      if (quiz_passed !== undefined) existing.quiz_passed = quiz_passed;
      if (quiz_score  !== undefined) existing.quiz_score  = quiz_score;
    } else {
      enrollment.module_progress.push({
        module_order, module_title,
        completed: true, completed_at: new Date(),
        quiz_passed: quiz_passed ?? false,
        quiz_score:  quiz_score  ?? null,
      });
    }

    await enrollment.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/enrollment/:courseId/complete ───────────────────────────
// Mark entire course as complete
router.post('/:courseId/complete', async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user_id:   req.user.id,
      course_id: req.params.courseId,
    });

    if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
    if (!enrollment.rocs_agreed) return res.status(403).json({ message: 'ROCS agreement required' });

    enrollment.status       = 'completed';
    enrollment.completed_at = new Date();
    await enrollment.save();

    res.json({ success: true, completed_at: enrollment.completed_at });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;