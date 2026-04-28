const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const axios   = require('axios');
const authMiddleware = require('../middleware/auth');
const User    = require('../models/User');

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
  callbackUrl: 'https://deafness-triangle-mace.ngrok-free.dev/api/biosig/callback',
};

// ── Key Derivation ─────────────────────────────────────────────────────────
function createSecureKey(pass, salt, count, dklen) {
  let t = pass + salt;
  for (let i = 0; i < count; i++) {
    t = crypto.createHash('sha1').update(t, 'binary').digest('binary');
  }
  return t.slice(0, dklen);
}

function deriveKey() {
  const devkey = createSecureKey(BSI_CONFIG.passPhrase, BSI_CONFIG.salt, 2, 18);
  return Buffer.from(devkey.slice(0, 16), 'binary');
}

// ── Encrypt ────────────────────────────────────────────────────────────────
function encrypt(value) {
  const key    = deriveKey();
  const iv     = Buffer.from(BSI_CONFIG.vector, 'utf8');
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let out = cipher.update(value, 'binary', 'base64');
  out += cipher.final('base64');
  return out;
}

// ── Decrypt ────────────────────────────────────────────────────────────────
// Used to decrypt the encrypted args BioSig POSTs back to our callback URL.
function decrypt(encryptedValue) {
  const key      = deriveKey();
  const iv       = Buffer.from(BSI_CONFIG.vector, 'utf8');
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let out = decipher.update(encryptedValue, 'base64', 'utf8');
  out += decipher.final('utf8');
  return out;
}

// ── Timestamp ──────────────────────────────────────────────────────────────
function buildTimestamp() {
  const now  = new Date();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh   = String(now.getHours()).padStart(2, '0');
  const min  = String(now.getMinutes()).padStart(2, '0');
  const ss   = String(now.getSeconds()).padStart(2, '0');
  return `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
}

// ── Build SSO args param ───────────────────────────────────────────────────
function buildSSOParams({ nmlsId, isResuming, user }) {
  const ts     = buildTimestamp();
  const action = isResuming ? 'Resuming' : 'Begin';

  const argString = [
    `ts=${ts}`,
    `sc=${BSI_CONFIG.sharedCode}`,
    `sid=${BSI_CONFIG.systemId}`,
    `cid=${BSI_CONFIG.customerId}`,
    `lc=${BSI_CONFIG.locale}`,
    `nw=false`,
    `em=${user?.email          || 'test@test.com'}`,
    `fn=${user?.firstName      || 'Test'}`,
    `ln=${user?.lastName       || 'User'}`,
    `lid=${user?.email         || 'test@test.com'}`,
    `uid=${nmlsId}`,
    `ls=NMLS#relstone`,
    `as=CE-course`,
    `d1=${new Date().getFullYear()}`,
    `d2=${user?.courseId       || '1234'}`,
    `d3=${action}`,
    `d4=${user?.courseTitle    || 'Test SAFE Course'}`,
    `d5=${user?.courseDuration || '1'}`,
    `cb=${BSI_CONFIG.callbackUrl}`,
  ].join('&');

  console.log('[BioSig] Raw argString:', argString);
  const encrypted = encrypt(argString);
  return `args=${encodeURIComponent(encrypted)}`;
}

// ── Hit BioSig SSO server-side and return REDIRECT URL ────────────────────
async function getBioSigRedirectUrl({ nmlsId, isResuming, user }) {
  const query  = buildSSOParams({ nmlsId, isResuming, user });
  const ssoUrl = `${BSI_CONFIG.ssoUrl}?${query}`;

  console.log('[BioSig] Calling SSO:', ssoUrl);

  const xmlRes = await axios.get(ssoUrl, {
    responseType: 'text',
    headers: { Accept: 'text/xml, application/xml, */*' },
  });

  const xmlText = typeof xmlRes.data === 'string'
    ? xmlRes.data
    : JSON.stringify(xmlRes.data);

  console.log('[BioSig] SSO Response:', xmlText);

  const code        = xmlText.match(/<CODE>(.*?)<\/CODE>/i)?.[1]?.trim();
  const message     = xmlText.match(/<MESSAGE>(.*?)<\/MESSAGE>/i)?.[1]?.trim();
  const redirectUrl = xmlText.match(/<REDIRECT>(.*?)<\/REDIRECT>/i)?.[1]?.trim() || null;

  if (code !== '100' || !redirectUrl) {
    throw new Error(`BioSig error ${code}: ${message}`);
  }

  return redirectUrl;
}

// ── Parse key=value arg string (from decrypted callback body) ──────────────
function parseArgString(str) {
  const result = {};
  str.split('&').filter(Boolean).forEach(pair => {
    const [key, ...rest] = pair.split('=');
    result[key] = rest.join('=');
  });
  return result;
}

// ── Build SSO_RESPONSE XML — Ron's exact required format ───────────────────
// BioSig will retry the POST if we don't respond with this exact structure.
function buildSsoResponseXml(status, code, message, redirectUrl) {
  return (
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<SSO_RESPONSE xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n` +
    `\t<STATUS>${status}</STATUS>\n` +
    `\t<CODE>${code}</CODE>\n` +
    `\t<MESSAGE>${message}</MESSAGE>\n` +
    `\t<REDIRECT>${redirectUrl}</REDIRECT>\n` +
    `</SSO_RESPONSE>`
  );
}

// ── Shared verification writer (used by GET + POST callbacks) ──────────────
async function handleVerification({ userId, courseId, result, uid, score, rawBody }) {
  const verified = result === 'pass' || result === '1' || result === 'true';

  const verificationRecord = {
    course_id:     courseId || 'unknown',
    verified_at:   new Date(),
    session_token: `bsi-${userId}-${Date.now()}`,
    provider:      'BioSig-ID (NMLS)',
    result:        result   || 'unknown',
    score:         score    || null,
    uid:           uid      || null,
    raw_response:  rawBody  || null,
    verified,
  };

  const updateFields = { $push: { biosig_verifications: verificationRecord } };
  if (verified) updateFields.$set = { biosig_enrolled_at: new Date() };

  await User.findByIdAndUpdate(userId, updateFields);
  return { verified, verificationRecord };
}

// ── Debug route (NO auth) ──────────────────────────────────────────────────
router.get('/debug', async (req, res) => {
  const nmlsId     = req.query.nmlsId || 'test123';
  const isResuming = req.query.isResuming === 'true';

  const mockUser = {
    email:          'test@test.com',
    firstName:      'Test',
    lastName:       'User',
    courseId:       '1234',
    courseTitle:    'Test SAFE Course',
    courseDuration: '1',
  };

  try {
    const redirectUrl = await getBioSigRedirectUrl({ nmlsId, isResuming, user: mockUser });
    res.json({
      redirect_url: redirectUrl,
      nmlsId,
      isResuming,
      instruction: 'Copy redirect_url and paste in browser to test BioSig page',
    });
  } catch (err) {
    console.error('[BioSig DEBUG] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /callback — NO AUTH REQUIRED ──────────────────────────────────────
// IMPORTANT: Defined BEFORE router.use(authMiddleware).
// Ron's BioSig server POSTs here with no session/token — auth would block it.
// BioSig POSTs an encrypted `args` param (AES-128-CBC, same as SSO outbound).
// We decrypt it, check vs=True for pass, save to MongoDB, respond SSO_RESPONSE XML.
// BioSig retries on any non-200 response — always return 200.
router.post(
  '/callback',
  express.text({ type: '*/*' }),
  async (req, res) => {
    const successRedirect = 'https://www.relstonenmls.com/biosig/finished';
    const failureRedirect = 'https://www.relstonenmls.com/biosig/failure';

    try {
      const rawBody = typeof req.body === 'string' ? req.body : '';
      console.log('[BioSig] POST Callback raw body:', rawBody);

      // Extract encrypted args — BioSig may send via query string or POST body
      let encryptedArgs = req.query.args || new URLSearchParams(rawBody).get('args') || '';
      encryptedArgs = encryptedArgs.replace(/ /g, '+'); // normalize spaces back to +

      if (!encryptedArgs) {
        console.warn('[BioSig] POST Callback: no encrypted args found');
        return res.status(200).type('text/xml').send(
          buildSsoResponseXml('Failure', '250', 'Timestamp not found or not accepted', failureRedirect)
        );
      }

      // Decrypt using same AES-128-CBC key/vector as SSO
      let decrypted;
      try {
        decrypted = decrypt(encryptedArgs);
        console.log('[BioSig] POST Callback decrypted args:', decrypted);
      } catch (decryptErr) {
        console.error('[BioSig] POST Callback decrypt failed:', decryptErr.message);
        return res.status(200).type('text/xml').send(
          buildSsoResponseXml('Failure', '250', 'Decryption failed', failureRedirect)
        );
      }

      // Parse decrypted key=value pairs
      const keyedArgs = parseArgString(decrypted);
      console.log('[BioSig] POST Callback keyedArgs:', keyedArgs);

      // vs=True means biometric verification passed
      const verified = String(keyedArgs.vs || '').toLowerCase() === 'true';
      const uid      = keyedArgs.uid   || null;
      const courseId = keyedArgs.d2    || null;
      const score    = keyedArgs.score || null;
      const result   = verified ? 'pass' : 'fail';

      console.log(`[BioSig] POST Callback: uid=${uid} verified=${verified} courseId=${courseId}`);

      // Resolve user by NMLS uid
      let userId = null;
      if (uid) {
        const userByNmls = await User.findOne({ nmls_id: uid });
        if (userByNmls) userId = userByNmls._id;
      }

      if (!userId) {
        console.warn('[BioSig] POST Callback: cannot resolve user for uid:', uid);
        // Still 200 so BioSig does not retry — user resolution is our problem
        return res.status(200).type('text/xml').send(
          buildSsoResponseXml('Failure', '110', 'User not found', failureRedirect)
        );
      }

      await handleVerification({ userId, courseId, result, uid, score, rawBody });
      console.log(`[BioSig] POST Callback: saved — userId=${userId} verified=${verified}`);

      return res.status(200).type('text/xml').send(
        buildSsoResponseXml(
          verified ? 'Success' : 'Failure',
          verified ? '100'     : '110',
          verified ? 'None'    : 'Verification failed',
          verified ? successRedirect : failureRedirect
        )
      );

    } catch (err) {
      console.error('[BioSig] POST Callback Error:', err);
      return res.status(200).type('text/xml').send(
        buildSsoResponseXml('Failure', '250', err.message, failureRedirect)
      );
    }
  }
);

// ── Auth middleware — everything below requires a valid token ───────────────
router.use(authMiddleware);

// ── GET /sso-url ───────────────────────────────────────────────────────────
router.get('/sso-url', async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isResuming = !!(user.biosig_enrolled_at);
    const nmlsId     = user.nmls_id || user._id.toString();

    let courseTitle    = 'NMLS Course';
    let courseDuration = '1';
    try {
      const Course = require('../models/Course');
      const course = await Course.findById(courseId);
      if (course) {
        courseTitle    = course.title    || courseTitle;
        courseDuration = course.duration || courseDuration;
      }
    } catch (e) {
      console.warn('[BioSig] Could not load course:', e.message);
    }

    const userPayload = {
      email:          user.email,
      firstName:      user.firstName || user.first_name || 'Student',
      lastName:       user.lastName  || user.last_name  || 'User',
      courseId,
      courseTitle,
      courseDuration,
    };

    const redirectUrl = await getBioSigRedirectUrl({ nmlsId, isResuming, user: userPayload });

    req.session = req.session || {};
    req.session.biosig_course_id = courseId;
    req.session.biosig_nmls_id   = nmlsId;

    res.json({
      url:    redirectUrl,
      action: isResuming ? 'Resuming' : 'Enrolling',
    });

  } catch (err) {
    console.error('[BioSig] SSO URL Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /callback — redirect-based callback (browser flow) ─────────────────
router.get('/callback', async (req, res) => {
  try {
    console.log('[BioSig] GET Callback query:', req.query);

    let result, uid, score, courseId;

    if (req.query.args) {
      const encryptedArgs = req.query.args.replace(/ /g, '+');
      try {
        const decrypted = decrypt(encryptedArgs);
        console.log('[BioSig] GET Callback decrypted args:', decrypted);
        const keyedArgs = parseArgString(decrypted);
        result   = String(keyedArgs.vs || '').toLowerCase() === 'true' ? 'pass' : 'fail';
        uid      = keyedArgs.uid   || null;
        score    = keyedArgs.score || null;
        courseId = keyedArgs.d2    || req.session?.biosig_course_id;
      } catch (decryptErr) {
        console.warn('[BioSig] GET Callback decrypt failed, falling back to raw query params:', decryptErr.message);
        result   = req.query.result;
        uid      = req.query.uid;
        score    = req.query.score;
        courseId = req.session?.biosig_course_id;
      }
    } else {
      result   = req.query.result;
      uid      = req.query.uid;
      score    = req.query.score;
      courseId = req.session?.biosig_course_id;
    }

    if (!req.user?.id) {
      return res.redirect('https://www.relstonenmls.com/login?reason=biosig_session_expired');
    }

    const { verified } = await handleVerification({
      userId: req.user.id,
      courseId,
      result,
      uid,
      score,
    });

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
    console.error('[BioSig] GET Callback Error:', err);
    res.redirect('https://www.relstonenmls.com/dashboard?biosig=error');
  }
});

// ── GET /status/:courseId ──────────────────────────────────────────────────
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