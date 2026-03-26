const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Course  = require('../models/Course');
const Order   = require('../models/Order');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/auth');
const { getNotificationChannelStatus } = require('./notifications');

// Helper: Send completion email notification
const sendCompletionEmail = async (user, courseName) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[sendCompletionEmail] EMAIL_USER or EMAIL_PASS not configured in .env');
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await transporter.sendMail({
      from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Congratulations! You Completed "${courseName}"`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:rgba(46,171,254,0.08);border:1px solid rgba(46,171,254,0.2);border-radius:12px;padding:12px 18px;">
              <span style="font-size:18px;font-weight:800;color:#091925;">Relstone <span style="color:#2EABFE;">NMLS</span></span>
            </div>
          </div>
          <h2 style="color:#091925;font-size:22px;font-weight:800;margin-bottom:8px;">Congratulations! 🎉</h2>
          <p style="color:#64748b;font-size:15px;margin-bottom:28px;">You've successfully completed <strong>${courseName}</strong>. Your certificate is now available on your dashboard.</p>
          <p style="color:#64748b;font-size:15px;">Great job on your progress—keep learning and growing with Relstone NMLS!</p>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:28px;">If you have any questions, feel free to contact us.</p>
        </div>
      `,
    });
    console.log(`[sendCompletionEmail] Email sent to ${user.email} for course: ${courseName}`);
    return true;
  } catch (err) {
    console.error('[sendCompletionEmail] Failed to send email to', user.email, ':', err.message);
    return false;
  }
};

// In-app notification row (same User.notifications schema as server/routes/notifications.js).
const createNotification = async (user, title, body) => {
  if (!user.notifications) user.notifications = [];
  const note = {
    type: 'completions',
    title: title,
    body: body,
    read: false,
    createdAt: new Date(),
  };
  user.notifications.unshift(note);
  return note;
};

// Helper: build enriched transcript from user.completions
const buildTranscript = async (user) => {
  const completions = user.completions || [];
  if (completions.length === 0) return [];

  const courseIds = completions
    .map((c) => c.course_id?._id || c.course_id)
    .filter(Boolean);

  const courses = await Course.find({ _id: { $in: courseIds } })
    .select('title type credit_hours nmls_course_id state_approval_number states_approved');

  const courseMap = {};
  courses.forEach((c) => { courseMap[String(c._id)] = c; });

  return completions.map((c) => {
    const cId    = String(c.course_id?._id || c.course_id || '');
    const course = courseMap[cId] || {};

    return {
      _id:             c._id,
      course_id: {
        _id:                   cId,
        title:                 course.title                || '—',
        type:                  course.type                 || '—',
        credit_hours:          course.credit_hours         || 0,
        nmls_course_id:        course.nmls_course_id       || '—',
        state_approval_number: course.state_approval_number || '—',
      },
      course_title:    course.title           || '—',
      type:            course.type            || '—',
      credit_hours:    course.credit_hours    || 0,
      nmls_course_id:  course.nmls_course_id  || '—',
      completed_at:    c.completed_at,
      certificate_url: c.certificate_url || null,
      state:           course.states_approved?.[0] || user.state || '—',
    };
  });
};

// GET /api/dashboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Paid or completed orders unlock courses on the dashboard; pending (e.g. payment plan) excluded until fulfilled
    const orders = await Order.find({
      user_id: req.user.id,
      status: { $in: ['paid', 'completed'] },
    }).populate('items.course_id', 'title type credit_hours nmls_course_id states_approved pdf_url');

    // Set of completed course IDs for quick lookup
    const completedCourseIds = new Set(
      (user.completions || []).map((c) => String(c.course_id?._id || c.course_id))
    );

    const seen = new Set();
    const available_courses = [];

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const course = item.course_id;
        if (!course) return;
        const courseId = String(course._id);
        if (seen.has(courseId)) return;
        seen.add(courseId);

        available_courses.push({
          course_id:         courseId,
          title:             course.title,
          type:              course.type,
          credit_hours:      course.credit_hours,
          nmls_course_id:    course.nmls_course_id,
          state:             course.states_approved?.[0] || 'Federal',
          already_completed: completedCourseIds.has(courseId),
          progress:          0,
        });
      });
    });

    res.json({
      user: {
        name:    user.name,
        email:   user.email,
        state:   user.state,
        nmls_id: user.nmls_id,
        role:    user.role,
      },
      available_courses,
      orders,
    });
  } catch (err) {
    console.error('GET /dashboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/dashboard/transcript
router.get('/transcript', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transcript = await buildTranscript(user);
    res.json({ transcript });
  } catch (err) {
    console.error('GET /dashboard/transcript error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/dashboard/complete
// Called by CoursePortal when student passes the final exam.
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;

    // ── FIX: log incoming data so you can debug if this still fails
    console.log(`POST /dashboard/complete — user: ${req.user.id}, courseId: ${courseId}`);

    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const [user, course] = await Promise.all([
      User.findById(req.user.id),
      Course.findById(courseId).select('title type credit_hours nmls_course_id states_approved'),
    ]);

    if (!user)   return res.status(404).json({ message: 'User not found' });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Idempotent — don't double-save
    const alreadyDone = (user.completions || []).some(
      (c) => String(c.course_id?._id || c.course_id) === String(courseId)
    );

    if (alreadyDone) {
      console.log(`Course ${courseId} already completed for user ${req.user.id}`);
      return res.json({ message: 'Already completed', already_existed: true });
    }

    user.completions.push({
      course_id:    courseId,
      completed_at: new Date(),
    });

    // FIX: Create notification record and send email if preferences allow
    const notificationTitle = `Course Completed: ${course.title}`;
    const notificationBody = `Congratulations! You completed "${course.title}". Your certificate is ready.`;

    console.log(`[POST /complete] user prefs:`, JSON.stringify(user.notification_prefs, null, 2));

    const allowInApp = getNotificationChannelStatus(user, 'completion', 'inapp');
    const allowEmail = getNotificationChannelStatus(user, 'completion', 'email');

    console.log(`[POST /complete] preference milestone.inapp=${allowInApp} milestone.email=${allowEmail} for user=${user.email}`);

    if (allowInApp) {
      await createNotification(user, notificationTitle, notificationBody);
    } else {
      console.log(`[POST /complete] In-app completion notification skipped for ${user.email} (milestone.inapp disabled)`);
    }

    if (allowEmail) {
      await sendCompletionEmail(user, course.title);
    } else {
      console.log(`[POST /complete] Email completion notification skipped for ${user.email} (milestone.email disabled)`);
    }

    await user.save();

    console.log(`✅ Completion saved — user: ${req.user.id}, course: ${courseId}`);

    res.json({
      message:         'Course completion saved successfully',
      already_existed: false,
      completion: {
        course_id:    courseId,
        course_title: course.title,
        completed_at: new Date(),
      },
    });
  } catch (err) {
    console.error('POST /dashboard/complete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;