const express    = require('express');
const router     = express.Router();
const Course     = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');

// GET /api/admin/courses — Get all courses with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title:          { $regex: search, $options: 'i' } },
        { nmls_course_id: { $regex: search, $options: 'i' } },
      ];
    }

    if (type)            query.type      = type;
    if (status === 'active')   query.is_active = true;
    if (status === 'inactive') query.is_active = false;

    const total   = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('title nmls_course_id type credit_hours price is_active states_approved createdAt');

    res.json({ courses, total, page: Number(page), totalPages: Math.ceil(total / limit) });

  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/courses/:id — Get single course details
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrolledCount = await Enrollment.countDocuments({ course_id: req.params.id });
    const enrollments   = await Enrollment.find({ course_id: req.params.id })
      .populate('user_id', 'name email is_active')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('user_id progress status createdAt');

    res.json({ course, enrolledCount, enrollments });

  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/courses/:id — Update course
// Uses $set so only explicitly sent fields are touched.
// modules and final_exam are NEVER overwritten unless present in the payload.
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const {
      title, description, price, credit_hours, type,
      provider, level, has_textbook, textbook_price,
      states_approved, pdf_url, video_url, is_active,
      modules, final_exam,
      // strip fields that must never be overwritten
      nmls_course_id, _id, __v, createdAt, updatedAt,
      ...rest
    } = req.body;

    // Build the $set payload — only include fields that were actually sent
    const setPayload = {};

    if (title           !== undefined) setPayload.title           = title;
    if (description     !== undefined) setPayload.description     = description;
    if (price           !== undefined) setPayload.price           = Number(price);
    if (credit_hours    !== undefined) setPayload.credit_hours    = Number(credit_hours);
    if (type            !== undefined) setPayload.type            = type;
    if (provider        !== undefined) setPayload.provider        = provider;
    if (level           !== undefined) setPayload.level           = level;
    if (has_textbook    !== undefined) setPayload.has_textbook    = has_textbook;
    if (textbook_price  !== undefined) setPayload.textbook_price  = Number(textbook_price);
    if (states_approved !== undefined) setPayload.states_approved = states_approved;
    if (pdf_url         !== undefined) setPayload.pdf_url         = pdf_url;
    if (video_url       !== undefined) setPayload.video_url       = video_url;
    if (is_active       !== undefined) setPayload.is_active       = is_active;

    // ── Modules: only update if sent AND not empty ────────────────
    if (Array.isArray(modules) && modules.length > 0) {
      setPayload.modules = modules;
    }

    // ── Final exam: only update if sent AND has questions ─────────
    if (final_exam) {
      const hasQuestions = Array.isArray(final_exam.questions)     && final_exam.questions.length     > 0;
      const hasBank      = Array.isArray(final_exam.question_bank) && final_exam.question_bank.length > 0;
      const existingHasData =
        (course.final_exam?.questions?.length     > 0) ||
        (course.final_exam?.question_bank?.length > 0);

      // Guard: don't wipe existing exam data if payload sends empty arrays
      if (!existingHasData || hasQuestions || hasBank) {
        setPayload.final_exam = final_exam;
      }
    }

    if (Object.keys(setPayload).length === 0) {
      return res.json({ message: 'No changes to save', course });
    }

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: setPayload },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Course updated successfully', course: updated });

  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/admin/courses/:id/toggle-status — Activate / Deactivate
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.is_active = !course.is_active;
    await course.save();

    res.json({
      message:   `Course ${course.is_active ? 'activated' : 'deactivated'} successfully`,
      is_active: course.is_active,
    });

  } catch (err) {
    console.error('Toggle course status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;