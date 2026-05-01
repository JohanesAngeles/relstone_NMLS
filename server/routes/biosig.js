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
  callbackUrl: 'https://www.relstonenmls.com/api/biosig/callback',
};

// ── Valid BioSig action values per NMLS requirements ──────────────────────
// Begin     → first access of course content
// Resuming  → returning after logout or inactivity
// FinalExam → before taking the final exam
// Middle#1  → midpoint check on longer courses (~2-3hr content)
// Middle#2  → second midpoint check on longer courses
const VALID_ACTIONS = ['Begin', 'Resuming', 'FinalExam', 'Middle#1', 'Middle#2'];

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
// action: 'Begin' | 'Resuming' | 'FinalExam' | 'Middle#1' | 'Middle#2'
function buildSSOParams({ nmlsId, action, user }) {
  const ts = buildTimestamp();

  // Validate action — default to Begin if invalid
  const d3 = VALID_ACTIONS.includes(action) ? action : 'Begin';

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
    `d3=${d3}`,
    `d4=${user?.courseTitle    || 'Test SAFE Course'}`,
    `d5=${user?.courseDuration || '1'}`,
    `cb=${BSI_CONFIG.callbackUrl}`,
  ].join('&');

  console.log('[BioSig] Raw argString:', argString);
  const encrypted = encrypt(argString);
  return `args=${encodeURIComponent(encrypted)}`;
}

// ── Hit BioSig SSO server-side and return REDIRECT URL ────────────────────
async function getBioSigRedirectUrl({ nmlsId, action, user }) {
  const query  = buildSSOParams({ nmlsId, action, user });
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

// ── Parse key=value arg string ─────────────────────────────────────────────
function parseArgString(str) {
  const result = {};
  str.split('&').filter(Boolean).forEach(pair => {
    const [key, ...rest] = pair.split('=');
    result[key] = rest.join('=');
  });
  return result;
}

// ── Build SSO_RESPONSE XML — Ron's exact required format ───────────────────
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

// ── Shared verification writer ─────────────────────────────────────────────
async function handleVerification({ userId, courseId, action, result, uid, score, rawBody }) {
  const verified = result === 'pass' || result === '1' || result === 'true';

  const verificationRecord = {
    course_id:     courseId || 'unknown',
    verified_at:   new Date(),
    session_token: `bsi-${userId}-${Date.now()}`,
    provider:      'BioSig-ID (NMLS)',
    action:        action   || 'Begin',   // Begin | Resuming | FinalExam | Middle#1 | Middle#2
    result:        result   || 'unknown',
    score:         score    || null,
    uid:           uid      || null,
    raw_response:  rawBody  || null,
    verified,
  };

  const updateFields = { $push: { biosig_verifications: verificationRecord } };

  // Only stamp biosig_enrolled_at on first successful Begin
  if (verified && action === 'Begin') {
    updateFields.$set = { biosig_enrolled_at: new Date() };
  }

  // Fix Mongoose deprecation warning
  await User.findByIdAndUpdate(userId, updateFields, { returnDocument: 'after' });
  return { verified, verificationRecord };
}

// ── Shared callback handler (used by both GET and POST) ────────────────────
async function handleCallbackArgs(encryptedArgs, fallbackCourseId, res) {
  const successRedirect = 'https://www.relstonenmls.com/biosig/finished';
const failureRedirect = 'https://www.relstonenmls.com/biosig/failure';

  encryptedArgs = (encryptedArgs || '').replace(/ /g, '+');

  if (!encryptedArgs) {
    console.warn('[BioSig] Callback: no encrypted args found');
    return res.status(200).type('text/xml').send(
buildSsoResponseXml('Failure', '250', err.message, 'https://www.relstonenmls.com/biosig/failure')
    );
  }

  let decrypted;
  try {
    decrypted = decrypt(encryptedArgs);
    console.log('[BioSig] Callback decrypted args:', decrypted);
  } catch (decryptErr) {
    console.error('[BioSig] Callback decrypt failed:', decryptErr.message);
    return res.status(200).type('text/xml').send(
      buildSsoResponseXml('Failure', '250', 'Decryption failed', failureRedirect)
    );
  }

  const keyedArgs = parseArgString(decrypted);
  console.log('[BioSig] Callback keyedArgs:', keyedArgs);

  const verified = String(keyedArgs.vs || '').toLowerCase() === 'true';
  const uid      = keyedArgs.uid   || null;
  const courseId = keyedArgs.d2    || fallbackCourseId || null;
  const action   = keyedArgs.d3    || 'Begin';
  const score    = keyedArgs.score || null;
  const result   = verified ? 'pass' : 'fail';

  console.log(`[BioSig] Callback: uid=${uid} action=${action} verified=${verified} courseId=${courseId}`);

 let userId = null;
if (uid) {
  // First try nmls_id field
  const userByNmls = await User.findOne({ nmls_id: uid });
  if (userByNmls) {
    userId = userByNmls._id;
  } else {
    // Fallback: uid is the MongoDB _id (used when user has no nmls_id)
    try {
      const userById = await User.findById(uid);
      if (userById) userId = userById._id;
    } catch (_) {}
  }
}

if (!userId) {
  console.warn('[BioSig] Callback: cannot resolve user for uid:', uid);
  return res.status(200).type('text/xml').send(
    buildSsoResponseXml('Failure', '110', 'User not found', failureRedirect)
  );
}

  await handleVerification({ userId, courseId, action, result, uid, score, rawBody: encryptedArgs });
  console.log(`[BioSig] Callback: saved — userId=${userId} action=${action} verified=${verified}`);

  return res.status(200).type('text/xml').send(
    buildSsoResponseXml(
      verified ? 'Success' : 'Failure',
      verified ? '100'     : '110',
      verified ? 'None'    : 'Verification failed',
      verified ? successRedirect : failureRedirect
    )
  );
}

// ── Debug route (NO auth) ──────────────────────────────────────────────────
router.get('/debug', async (req, res) => {
  const nmlsId = req.query.nmlsId || 'test123';
  const action = req.query.action || 'Begin';

  const mockUser = {
    email:          'test@test.com',
    firstName:      'Test',
    lastName:       'User',
    courseId:       '1234',
    courseTitle:    'Test SAFE Course',
    courseDuration: '1',
  };

  try {
    const redirectUrl = await getBioSigRedirectUrl({ nmlsId, action, user: mockUser });
    res.json({
      redirect_url: redirectUrl,
      nmlsId,
      action,
      instruction: 'Copy redirect_url and paste in browser to test BioSig page',
    });
  } catch (err) {
    console.error('[BioSig DEBUG] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /callback — NO AUTH — Ron's C# app sends GET ?args= ───────────────
router.get('/callback', async (req, res) => {
  console.log('[BioSig] GET Callback (server-side) query keys:', Object.keys(req.query));
  try {
    const encryptedArgs = req.query.args || '';
    await handleCallbackArgs(encryptedArgs, null, res);
  } catch (err) {
    console.error('[BioSig] GET Callback Error:', err);
    return res.status(200).type('text/xml').send(
      buildSsoResponseXml('Failure', '250', err.message, 'https://www.relstonenmls.com/biosig/failure')
    );
  }
});

// ── POST /callback — NO AUTH — fallback if BioSig ever POSTs ──────────────
router.post(
  '/callback',
  express.text({ type: '*/*' }),
  async (req, res) => {
    console.log('[BioSig] POST Callback raw body:', typeof req.body === 'string' ? req.body.slice(0, 200) : '(non-string)');
    try {
      const rawBody       = typeof req.body === 'string' ? req.body : '';
      const encryptedArgs = req.query.args || new URLSearchParams(rawBody).get('args') || '';
      await handleCallbackArgs(encryptedArgs, null, res);
    } catch (err) {
      console.error('[BioSig] POST Callback Error:', err);
      return res.status(200).type('text/xml').send(
        buildSsoResponseXml('Failure', '250', err.message, 'https://www.relstonenmls.com/biosig/failure')
      );
    }
  }
);

// ── Auth middleware — everything below requires a valid token ───────────────
router.use(authMiddleware);

// ── GET /sso-url ───────────────────────────────────────────────────────────
// action query param: 'Begin' | 'Resuming' | 'FinalExam' | 'Middle#1' | 'Middle#2'
// Frontend must pass the correct action depending on where in the course the student is.
router.get('/sso-url', async (req, res) => {
  try {
    const { courseId, action } = req.query;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    // Validate action — default to Begin, or Resuming if enrolled and no action given
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Determine action:
    // - If frontend explicitly passes action, use it
    // - If user is already enrolled and no action given, default to Resuming
    // - Otherwise Begin
    let resolvedAction = 'Begin';
    if (action && VALID_ACTIONS.includes(action)) {
      resolvedAction = action;
    } else if (user.biosig_enrolled_at) {
      resolvedAction = 'Resuming';
    }

    const nmlsId = user.nmls_id || user._id.toString();

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

    const redirectUrl = await getBioSigRedirectUrl({ nmlsId, action: resolvedAction, user: userPayload });

    req.session = req.session || {};
    req.session.biosig_course_id = courseId;
    req.session.biosig_nmls_id   = nmlsId;

    console.log(`[BioSig] SSO URL generated: action=${resolvedAction} courseId=${courseId} uid=${nmlsId}`);

    res.json({
      url:    redirectUrl,
      action: resolvedAction,
    });

  } catch (err) {
    console.error('[BioSig] SSO URL Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /status/:courseId ──────────────────────────────────────────────────
// Returns verification status for a specific course and action type.
// Frontend can pass ?action=FinalExam to check if final exam is cleared.
router.get('/status/:courseId', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const actionFilter = req.query.action || null;

    const recentVerification = (user.biosig_verifications || []).find(v => {
      const courseMatch  = String(v.course_id) === String(req.params.courseId);
      const recentEnough = v.verified_at > twoHoursAgo;
      const isVerified   = v.verified === true;
      const actionMatch  = actionFilter ? v.action === actionFilter : true;
      return courseMatch && recentEnough && isVerified && actionMatch;
    });

    res.json({
      verified:      !!recentVerification,
      action:        recentVerification?.action || null,
      last_verified: recentVerification ? recentVerification.verified_at : null,
      enrolled:      !!user.biosig_enrolled_at,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;