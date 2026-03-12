const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User       = require('../models/User');

// ── Nodemailer transporter ────────────────────────────────────────
const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Helpers ───────────────────────────────────────────────────────
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, name, otp) => {
  await getTransporter().sendMail({
    from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Relstone NMLS Verification Code',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:rgba(46,171,254,0.08);border:1px solid rgba(46,171,254,0.2);border-radius:12px;padding:12px 18px;">
            <span style="font-size:18px;font-weight:800;color:#091925;">Relstone <span style="color:#2EABFE;">NMLS</span></span>
          </div>
        </div>
        <h2 style="color:#091925;font-size:22px;font-weight:800;margin-bottom:8px;">Hi ${name} 👋</h2>
        <p style="color:#64748b;font-size:15px;margin-bottom:28px;">Use the code below to verify your email. It expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#f0f6fa;border:2px dashed #2EABFE;border-radius:14px;padding:18px 36px;">
            <span style="font-size:36px;font-weight:900;color:#091925;letter-spacing:10px;">${otp}</span>
          </div>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;">If you didn't create a Relstone NMLS account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

// ── NEW: Password reset email ─────────────────────────────────────
const sendResetEmail = async (email, name, otp) => {
  await getTransporter().sendMail({
    from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Relstone NMLS Password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:rgba(46,171,254,0.08);border:1px solid rgba(46,171,254,0.2);border-radius:12px;padding:12px 18px;">
            <span style="font-size:18px;font-weight:800;color:#091925;">Relstone <span style="color:#2EABFE;">NMLS</span></span>
          </div>
        </div>
        <h2 style="color:#091925;font-size:22px;font-weight:800;margin-bottom:8px;">Hi ${name} 👋</h2>
        <p style="color:#64748b;font-size:15px;margin-bottom:28px;">We received a request to reset your password. Use the code below — it expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-block;background:#f0f6fa;border:2px dashed #2EABFE;border-radius:14px;padding:18px 36px;">
            <span style="font-size:36px;font-weight:900;color:#091925;letter-spacing:10px;">${otp}</span>
          </div>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
};

// ── POST /api/auth/register ───────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, nmls_id, state, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp            = generateOTP();
    const otpExpires     = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser && !existingUser.isVerified) {
      existingUser.name       = name;
      existingUser.password   = hashedPassword;
      existingUser.nmls_id    = nmls_id || null;
      existingUser.state      = state   || null;
      existingUser.role       = role    || 'student';
      existingUser.otp        = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      await User.create({
        name, email, password: hashedPassword,
        nmls_id: nmls_id || null, state: state || null,
        role: role || 'student',
        isVerified: false, otp, otpExpires,
      });
    }

    await sendOTPEmail(email, name, otp);
    res.status(200).json({ message: 'OTP sent to your email.', email });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user)                         return res.status(404).json({ message: 'User not found' });
    if (user.isVerified)               return res.status(400).json({ message: 'Email already verified' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpires < new Date())  return res.status(400).json({ message: 'OTP expired. Please register again.' });

    user.isVerified = true;
    user.otp        = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, nmls_id: user.nmls_id, state: user.state, role: user.role } });

  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/resend-otp ─────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)           return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp        = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otp         = otp;
    user.otpExpires  = otpExpires;
    await user.save();

    await sendOTPEmail(email, user.name, otp);
    res.json({ message: 'New OTP sent to your email.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified.', needsVerification: true, email });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, nmls_id: user.nmls_id, state: user.state, role: user.role } });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// ── FORGOT PASSWORD ROUTES (NEW) ─────────────────────────────────
// ─────────────────────────────────────────────────────────────────

// ── POST /api/auth/forgot-password ───────────────────────────────
// Send reset OTP to email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return 200 to avoid email enumeration
    if (!user || !user.isVerified) {
      return res.status(200).json({ message: 'If that email exists, a reset code has been sent.' });
    }

    const otp        = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.otp         = otp;
    user.otpExpires  = otpExpires;
    await user.save();

    await sendResetEmail(email, user.name, otp);
    res.status(200).json({ message: 'Reset code sent to your email.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/verify-reset-otp ──────────────────────────────
// Verify OTP only — does NOT log in, just confirms code is valid
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user)                         return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid or expired code' });
    if (user.otpExpires < new Date())  return res.status(400).json({ message: 'Code has expired. Please request a new one.' });

    res.json({ message: 'Code verified. You may now reset your password.' });

  } catch (err) {
    console.error('Verify reset OTP error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────
// Verify OTP + set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({ email });
    if (!user)                         return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid or expired code' });
    if (user.otpExpires < new Date())  return res.status(400).json({ message: 'Code has expired. Please request a new one.' });

    const salt       = await bcrypt.genSalt(10);
    user.password    = await bcrypt.hash(newPassword, salt);
    user.otp         = null;
    user.otpExpires  = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;