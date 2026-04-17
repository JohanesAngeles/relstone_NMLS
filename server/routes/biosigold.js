const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// ── NMLS BioSig-ID Credentials ─────────────────────────────────────────────
const BSI_CONFIG = {
  ssoUrl:      'https://sandbox.verifyexpress.com/interface/standard/nmls/relstone/ssoinbound.aspx',
  sharedCode:  'NML$.SrR_Pr0j3cT!',
  systemId:    'nmls',
  customerId:  'nmls_relstone',
  locale:      'en_US',
  passPhrase:  '1000f370-2302-4c90-be1a-d78eaf9ed330',
  salt:        'a71fcb46-f86a-4ec0-bbb6-ae61e2ec8e67',
  vector:      'eccc351afa28460c',
  callbackUrl: 'http://localhost:3000/api/biosig/callback',
};

/**
 * Encrypts a value using AES-256-CBC with the configured pass phrase, salt, and vector.
 * The key is derived by combining passPhrase + salt, then taking the first 32 bytes (256-bit).
 */
function encrypt(value) {
  const key = Buffer.from((BSI_CONFIG.passPhrase + BSI_CONFIG.salt).slice(0, 32), 'utf8');
  const iv  = Buffer.from(BSI_CONFIG.vector, 'utf8').slice(0, 16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(value, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/**
 * Builds the SSO query string to append to the BioSig-ID SSO URL.
 *
 * NMLS parameter mapping:
 *   uid  = NMLS-prefixed user ID  (NMLS uses 'uid', not 'em')
 *   d1   = System ID
 *   d2   = Customer ID
 *   d3   = Action: 'Enrolling' | 'Resuming' (Resuming = returning user)
 *   d4   = Locale
 *   d5   = Callback/return URL after verification
 *   code = Shared Code (encrypted)
 */
function buildSSOParams({ nmlsId, isResuming }) {
  const uid    = `NMLS-ID#${nmlsId}`;
  const action = isResuming ? 'Resuming' : 'Enrolling';

  // Timestamp in format BioSig-ID expects: yyyyMMddHHmmss (UTC)
  const now = new Date();
  const ts  = now.getUTCFullYear().toString()
    + String(now.getUTCMonth() + 1).padStart(2, '0')
    + String(now.getUTCDate()).padStart(2, '0')
    + String(now.getUTCHours()).padStart(2, '0')
    + String(now.getUTCMinutes()).padStart(2, '0')
    + String(now.getUTCSeconds()).padStart(2, '0');

  // Encrypt uid, sharedCode, and timestamp per BioSig-ID spec
  const encryptedUid  = encrypt(uid);
  const encryptedCode = encrypt(BSI_CONFIG.sharedCode);
  const encryptedTs   = encrypt(ts);

  const params = new URLSearchParams({
    uid:  encryptedUid,
    code: encryptedCode,
    ts:   encryptedTs,
    d1:   BSI_CONFIG.systemId,
    d2:   BSI_CONFIG.customerId,
    d3:   action,
    d4:   BSI_CONFIG.locale,
    d5:   BSI_CONFIG.callbackUrl,
  });

  return params.toString();
}

// ── Apply auth to all routes ────────────────────────────────────────────────
router.use(authMiddleware);

/**
 * GET /api/biosig/sso-url
 * Returns the full SSO redirect URL for the frontend to redirect to.
 * The frontend calls this, then redirects window.location to the returned URL.
 */
router.get('/sso-url', async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Determine if user has previously enrolled with BioSig-ID
    const hasEnrolled = !!(user.biosig_enrolled_at);
    const isResuming  = hasEnrolled;

    // Store courseId in session so callback can retrieve it
    req.session = req.session || {};
    req.session.biosig_course_id = courseId;
    req.session.biosig_nmls_id   = user.nmls_id || user._id.toString();

    const nmlsId   = user.nmls_id || user._id.toString();
    const query    = buildSSOParams({ nmlsId, isResuming });
    const fullUrl  = `${BSI_CONFIG.ssoUrl}?${query}`;

    res.json({ url: fullUrl, action: isResuming ? 'Resuming' : 'Enrolling' });
  } catch (err) {
    console.error('BioSig SSO URL Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * GET /api/biosig/callback
 * BioSig-ID redirects here after verification.
 * Records the result, then redirects back to the course.
 *
 * BioSig-ID typically appends result params to this URL, e.g.:
 *   ?result=pass&uid=NMLS-ID%231234&score=...
 */
router.get('/callback', async (req, res) => {
  try {
    const { result, uid, score } = req.query;

    // Derive courseId from session (set during /sso-url call)
    const courseId = req.session?.biosig_course_id;
    const verified = result === 'pass' || result === '1' || result === 'true';

    if (!req.user?.id) {
      // User session may have expired — redirect to login
      return res.redirect('http://localhost:3000/login?reason=biosig_session_expired');
    }

    const verificationRecord = {
      course_id:     courseId || 'unknown',
      verified_at:   new Date(),
      session_token: `bsi-${req.user.id}-${Date.now()}`,
      provider:      'BioSig-ID (NMLS)',
      result:        result || 'unknown',
      score:         score  || null,
      uid:           uid    || null,
      verified,
    };

    const updateFields = {
      $push: { biosig_verifications: verificationRecord },
    };

    // Mark enrolled if this is first successful verification
    if (verified) {
      updateFields.$set = { biosig_enrolled_at: new Date() };
    }

    await User.findByIdAndUpdate(req.user.id, updateFields);

    // Redirect back to course (or failure page)
    if (verified) {
      const returnUrl = courseId
        ? `http://localhost:3000/courses/${courseId}?biosig=verified`
        : `http://localhost:3000/dashboard?biosig=verified`;
      return res.redirect(returnUrl);
    } else {
      return res.redirect(
        `http://localhost:3000/courses/${courseId || ''}?biosig=failed&reason=${encodeURIComponent(result || 'unknown')}`
      );
    }
  } catch (err) {
    console.error('BioSig Callback Error:', err);
    res.redirect('http://localhost:3000/dashboard?biosig=error');
  }
});

/**
 * GET /api/biosig/status/:courseId
 * Checks if the student has a recent verified session for this course (within 2 hours).
 */
router.get('/status/:courseId', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const recentVerification = (user.biosig_verifications || []).find(v =>
      String(v.course_id) === String(req.params.courseId) &&
      v.verified_at > twoHoursAgo &&
      v.verified === true
    );

    res.json({
      verified:      !!recentVerification,
      last_verified: recentVerification ? recentVerification.verified_at : null,
      enrolled:      !!user.biosig_enrolled_at,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;