const express = require('express');
const router  = express.Router();
const PDFDocument = require('pdfkit');
const { randomBytes } = require('crypto');
const User    = require('../models/User');
const Course  = require('../models/Course');
const authMiddleware = require('../middleware/auth');

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const sanitizeFileName = (value) => String(value || '')
  .replace(/[^a-zA-Z0-9-_\. ]/g, '')
  .replace(/\s+/g, '-');

const createCertificateId = () => `CERT-${randomBytes(5).toString('hex').toUpperCase()}`;
const buildVerificationUrl = (certificateId) => `https://relstone.com/verify-certificate/${certificateId}`;

const ensureCompletionCertificateMetadata = (completion) => {
  let changed = false;
  if (!completion.certificate_id) {
    completion.certificate_id = createCertificateId();
    changed = true;
  }
  if (!completion.certificate_url && completion.certificate_id) {
    completion.certificate_url = buildVerificationUrl(completion.certificate_id);
    changed = true;
  }
  return changed;
};

const getStateApprovalNumber = (course = {}, user = {}) => {
  if (course.state_approval_number) return course.state_approval_number;
  if (course.nmls_course_id) return course.nmls_course_id;
  const courseType = String(course.type || '').toUpperCase();
  const state = (course.states_approved && course.states_approved[0]) || user.state;
  if (courseType === 'PE') return 'PE-NATIONAL-20HR';
  if (state) return `CE-${String(state).toUpperCase()}-8HR`;
  return 'CE-GENERAL-8HR';
};

const createCertificatePdf = (doc, payload) => {
  doc.info.Title = 'Relstone Certificate of Completion';
  doc.info.Author = 'Relstone NMLS';

  doc.fillColor('#0B2447').fontSize(10);
  doc.rect(0, 0, doc.page.width, 72).fill('#f5f9ff');
  doc.fillColor('#2EABFE').fontSize(28).text('Certificate of Completion', { align: 'center', valign: 'center' });
  doc.moveDown(1.5);

  doc.fillColor('#475569').fontSize(12).text('This certifies that', { align: 'center' });
  doc.moveDown(0.4);
  doc.fillColor('#091925').font('Helvetica-Bold').fontSize(24).text(payload.student_name, { align: 'center' });
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(12).fillColor('#475569').text('has successfully completed', { align: 'center' });
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#1F2937').text(payload.course_title, { align: 'center' });

  doc.moveDown(1.5);
  doc.fontSize(11).fillColor('#334155');
  doc.text(`Completion Date: ${payload.completed_at}`, { align: 'center' });
  doc.moveDown(0.3);
  doc.text(`State Approval Number: ${payload.state_approval_number}`, { align: 'center' });
  doc.moveDown(0.3);
  doc.text(`Certificate ID: ${payload.cert_id}`, { align: 'center' });
  doc.moveDown(0.3);
  doc.text(`Verification URL: ${payload.verification_url}`, { align: 'center' });

  doc.moveDown(1.5);
  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(72, doc.y).lineTo(doc.page.width - 72, doc.y).stroke();
  doc.moveDown(0.8);

  const signatureY = doc.y;
  doc.fontSize(10).fillColor('#475569');
  doc.text('Authorized Signature', 72, signatureY, { align: 'left' });
  doc.text('Date Issued', 72, signatureY, { align: 'right' });
  doc.moveDown(1.2);
  doc.rect(72, doc.y, 180, 0.5).fill('#475569');
  doc.rect(doc.page.width - 252, doc.y, 180, 0.5).fill('#475569');
  doc.moveDown(0.8);
  doc.text('Relstone NMLS', 72, doc.y, { align: 'left' });
  doc.text(payload.completed_at, 72, doc.y, { align: 'right' });

  doc.moveDown(2);
  doc.fontSize(9).fillColor('#64748B');
  doc.text('This certificate is issued in accordance with the SAFE Mortgage Licensing Act and confirms completion of NMLS-approved education requirements.', {
    align: 'center',
    width: doc.page.width - 144,
  });
};

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
    let shouldSave = false;
    const certificates = user.completions.map((c) => {
      // course_id is populated — it's either a Course object or null
      const course = (c.course_id && typeof c.course_id === 'object')
        ? c.course_id
        : {};

      if (ensureCompletionCertificateMetadata(c)) {
        shouldSave = true;
      }

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
        state_approval_number: getStateApprovalNumber(course, user),
        completed_at:         c.completed_at  || null,
        issued_at:            c.completed_at  || null,
        certificate_id:       c.certificate_id || null,
        certificate_url:      c.certificate_url || null,
      };
    });
    if (shouldSave) await user.save();

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
router.get('/download/:courseId', authMiddleware, async (req, res) => {
  try {
    const [user, course] = await Promise.all([
      User.findById(req.user.id).select('name nmls_id state completions'),
      Course.findById(req.params.courseId)
        .select('title type credit_hours nmls_course_id state_approval_number states_approved'),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const completion = (user.completions || []).find((c) => {
      const cId = String(c.course_id?._id || c.course_id || '');
      return cId === String(req.params.courseId);
    });

    if (!completion) {
      return res.status(403).json({ message: 'Unauthorized or incomplete course. Certificate generation denied.' });
    }

    const metadataUpdated = ensureCompletionCertificateMetadata(completion);
    if (metadataUpdated) await user.save();

    const payload = {
      student_name:         user.name || '—',
      student_nmls_id:      user.nmls_id || '—',
      course_title:         course.title || '—',
      completed_at:         formatDate(completion.completed_at || new Date()),
      state_approval_number: getStateApprovalNumber(course, user),
      cert_id:              completion.certificate_id || String(completion._id || '').slice(-10).toUpperCase() || 'N/A',
      verification_url:     buildVerificationUrl(completion.certificate_id || String(completion._id || '').slice(-10).toUpperCase()),
    };

    const filename = sanitizeFileName(`Relstone-Certificate-${course.title}.pdf`) || 'certificate.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);
    createCertificatePdf(doc, payload);
    doc.end();
  } catch (err) {
    console.error('GET /api/certificates/download/:courseId ERROR:', err);
    res.status(500).json({
      message: 'Certificate generation failed',
      error:   err.message,
      stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

router.get('/verify/:certificateId', async (req, res) => {
  try {
    const certificateId = String(req.params.certificateId || '').trim();
    if (!certificateId) {
      return res.status(400).json({ message: 'Certificate ID is required' });
    }

    const user = await User.findOne({ 'completions.certificate_id': certificateId })
      .select('-password')
      .populate({
        path:   'completions.course_id',
        model:  'Course',
        select: 'title type credit_hours nmls_course_id state_approval_number states_approved',
      });

    if (!user) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const completion = (user.completions || []).find((c) => c.certificate_id === certificateId);
    if (!completion) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const course = (completion.course_id && typeof completion.course_id === 'object')
      ? completion.course_id
      : {};

    res.json({
      valid: true,
      certificate: {
        certificate_id:       completion.certificate_id || certificateId,
        student_name:         user.name                        || '—',
        student_nmls_id:      user.nmls_id                     || '—',
        course_title:         course.title                     || '—',
        nmls_course_id:       course.nmls_course_id           || '—',
        course_type:          course.type                     || '—',
        credit_hours:         course.credit_hours             || 0,
        state:                (course.states_approved && course.states_approved[0]) || user.state || '—',
        state_approval_number: getStateApprovalNumber(course, user),
        completed_at:         completion.completed_at         || null,
        issued_at:            completion.completed_at         || null,
        certificate_url:      completion.certificate_url      || buildVerificationUrl(certificateId),
        verification_url:     buildVerificationUrl(certificateId),
      },
    });
  } catch (err) {
    console.error('GET /api/certificates/verify/:certificateId ERROR:', err);
    res.status(500).json({
      message: 'Certificate verification failed',
      error:   err.message,
      stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

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

    const metadataUpdated = ensureCompletionCertificateMetadata(completion);
    if (metadataUpdated) await user.save();

    const course = (completion.course_id && typeof completion.course_id === 'object')
      ? completion.course_id
      : {};

    res.json({
      certificate: {
        _id:                  String(completion._id || ''),
        certificate_id:       completion.certificate_id || null,
        student_name:         user.name        || '—',
        student_nmls_id:      user.nmls_id     || '—',
        course_title:         course.title     || '—',
        nmls_course_id:       course.nmls_course_id  || '—',
        course_type:          course.type            || '—',
        credit_hours:         course.credit_hours    || 0,
        state:                (course.states_approved && course.states_approved[0])
                                || user.state || '—',
        state_approval_number: getStateApprovalNumber(course, user),
        completed_at:         completion.completed_at || null,
        issued_at:            completion.completed_at || null,
        certificate_url:      completion.certificate_url || buildVerificationUrl(completion.certificate_id || ''),
        verification_url:     buildVerificationUrl(completion.certificate_id || ''),
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