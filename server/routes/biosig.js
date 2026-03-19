const express    = require('express');
const router     = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ── POST /api/biosig/verify ───────────────────────────────────────────
// Placeholder for BioSig-ID (BSI) identity verification.
//
// Once NMLS provides the BSI Interface Specifications (contact nmls.ed1@csbs.org),
// replace the placeholder logic below with the real BSI API call.
//
// Real integration will:
//   1. Send student identity data to BSI API
//   2. Receive a session token / verification result
//   3. Store the verification record for audit purposes
//
router.post('/verify', async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId required' });

    // ── PLACEHOLDER ───────────────────────────────────────────────────
    // TODO: Replace with real BSI API call once spec is received from NMLS.
    //
    // Example of what real integration will look like:
    //
    // const bsiRes = await fetch(process.env.BSI_API_URL + '/verify', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.BSI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     userId:   req.user.id,
    //     courseId: courseId,
    //     // BSI will specify additional fields (biometric data, session token, etc.)
    //   }),
    // });
    // const bsiData = await bsiRes.json();
    // if (!bsiData.verified) return res.status(403).json({ message: 'Identity verification failed' });
    //
    // ── END PLACEHOLDER ───────────────────────────────────────────────

    // For now: always return verified = true (placeholder)
    res.json({
      verified:      true,
      session_token: `placeholder-${req.user.id}-${courseId}-${Date.now()}`,
      message:       'BioSig-ID verification placeholder — replace with real BSI API',
      placeholder:   true,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET /api/biosig/status/:courseId ─────────────────────────────────
// Check if student has already completed BioSig verification for this course.
router.get('/status/:courseId', async (req, res) => {
  try {
    // ── PLACEHOLDER ───────────────────────────────────────────────────
    // TODO: Query BSI API or local verification log once spec arrives.
    // For now: always return verified = false so modal shows each session.
    // Once real BSI is integrated, this should persist verification per session.
    // ── END PLACEHOLDER ───────────────────────────────────────────────

    res.json({
      verified:    false,
      placeholder: true,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;