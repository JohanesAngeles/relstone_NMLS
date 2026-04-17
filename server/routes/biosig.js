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
  callbackUrl: 'https://www.relstonenmls.com/biosig/callback',
};

function deriveKeyMD5() {
  const md5 = crypto.createHash('md5').update(BSI_CONFIG.passPhrase + BSI_CONFIG.salt).digest();
  return Buffer.concat([md5, md5]);
}

function encrypt(value) {
  const key    = deriveKeyMD5();
  const iv     = Buffer.from(BSI_CONFIG.vector, 'utf8').slice(0, 16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let out = cipher.update(value, 'utf8', 'base64');
  out += cipher.final('base64');
  return out;
}

function buildSSOParams({ nmlsId, isResuming }) {
  const uid    = `NMLS-ID#${nmlsId}`;
  const action = isResuming ? 'Resuming' : 'Enrolling';

  const encryptedUid  = encrypt(uid);
  const encryptedCode = encrypt(BSI_CONFIG.sharedCode);

  // ── NO ts param — parameter validation is disabled per BioSig-ID email ──
  const params = new URLSearchParams({
    uid:  encryptedUid,
    code: encryptedCode,
    d1:   BSI_CONFIG.systemId,
    d2:   BSI_CONFIG.customerId,
    d3:   action,
    d4:   BSI_CONFIG.locale,
    d5:   BSI_CONFIG.callbackUrl,
  });

  return params.toString();
}

// ── Debug route ─────────────────────────────────────────────────────────────
router.get('/debug', (req, res) => {
  const nmlsId = 'test123';
  const query  = buildSSOParams({ nmlsId, isResuming: false });
  res.json({
    full_url: `${BSI_CONFIG.ssoUrl}?${query}`,
    note: 'ts param removed — testing without it since validation is disabled',
  });
});

// ── Apply auth ───────────────────────────────────────────────────────────────
router.use(authMiddleware);

router.get('/sso-url', async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isResuming = !!(user.biosig_enrolled_at);

    req.session = req.session || {};
    req.session.biosig_course_id = courseId;
    req.session.biosig_nmls_id   = user.nmls_id || user._id.toString();

    const nmlsId  = user.nmls_id || user._id.toString();
    const query   = buildSSOParams({ nmlsId, isResuming });
    const fullUrl = `${BSI_CONFIG.ssoUrl}?${query}`;

    console.log('[BioSig] SSO URL built:', fullUrl);

    res.json({ url: fullUrl, action: isResuming ? 'Resuming' : 'Enrolling' });
  } catch (err) {
    console.error('BioSig SSO URL Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/callback', async (req, res) => {
  try {
    console.log('[BioSig] Callback received:', req.query);
    const { result, uid, score } = req.query;
    const courseId = req.session?.biosig_course_id;
    const verified = result === 'pass' || result === '1' || result === 'true';

    if (!req.user?.id) {
      return res.redirect('https://www.relstonenmls.com/login?reason=biosig_session_expired');
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

    const updateFields = { $push: { biosig_verifications: verificationRecord } };
    if (verified) updateFields.$set = { biosig_enrolled_at: new Date() };

    await User.findByIdAndUpdate(req.user.id, updateFields);

    if (verified) {
      return res.redirect(courseId
        ? `https://www.relstonenmls.com/courses/${courseId}?biosig=verified`
        : `https://www.relstonenmls.com/dashboard?biosig=verified`);
    } else {
      return res.redirect(
        `https://www.relstonenmls.com/courses/${courseId || ''}?biosig=failed&reason=${encodeURIComponent(result || 'unknown')}`
      );
    }
  } catch (err) {
    console.error('BioSig Callback Error:', err);
    res.redirect('https://www.relstonenmls.com/dashboard?biosig=error');
  }
});

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