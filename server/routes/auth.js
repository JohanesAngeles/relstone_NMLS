const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const User       = require('../models/User');

// ── Google OAuth Client ───────────────────────────────────────────
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Auth middleware ───────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

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

// ─────────────────────────────────────────────────────────────────
// ── PUBLIC ROUTES ─────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────

// ── POST /api/auth/google ─────────────────────────────────────────
/**
 * Google OAuth Sign-In
 * 
 * Request body:
 * {
 *   token: "google_jwt_token_from_frontend"
 * }
 * 
 * Responses:
 * - Success: { user: {...}, token: "jwt_token" }
 * - Needs Verification: { needsVerification: true, email: "user@example.com" }
 * - Inactive Account: { isInactive: true, message: "..." }
 */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required.' });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google data
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      user = new User({
        name: name || email.split('@')[0],
        email,
        password: null, // OAuth users don't have passwords
        googleId,
        profilePicture: picture,
        isVerified: false, // Require OTP verification
        otp,
        otpExpires,
        role: 'student',
        is_active: true,
        createdAt: new Date(),
      });

      await user.save();
      console.log(`✅ New user created via Google OAuth: ${email}`);

      // Send OTP for new users
      try {
        await sendOTPEmail(email, user.name, otp);
      } catch (emailErr) {
        console.error('Failed to send OTP email:', emailErr);
      }

      return res.json({
        needsVerification: true,
        email,
        message: 'Please verify your email with the code we sent.',
      });
    }

    // Existing user - check status before proceeding
    if (user.is_active === false) {
      return res.status(403).json({
        isInactive: true,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Update Google ID if not already set
    if (!user.googleId) {
      user.googleId = googleId;
      user.profilePicture = picture || user.profilePicture;
    }

    // Check if already verified
    if (!user.isVerified) {
      // Send OTP for unverified returning users
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      try {
        await sendOTPEmail(email, user.name, otp);
      } catch (emailErr) {
        console.error('Failed to send OTP email:', emailErr);
      }

      return res.json({
        needsVerification: true,
        email,
        message: 'Please verify your email with the code we sent.',
      });
    }

    // User is verified and active - proceed to login
    user.last_login_at = new Date();
    await user.save();

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        nmls_id: user.nmls_id,
        state: user.state,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });

  } catch (error) {
    console.error('❌ Google OAuth error:', error);

    // Handle specific error types
    if (error.message.includes('Invalid value for `idToken`')) {
      return res.status(401).json({
        message: 'Invalid Google token. Please try again.',
      });
    }

    if (error.message.includes('audience')) {
      return res.status(401).json({
        message: 'Token audience mismatch. Configuration error.',
      });
    }

    res.status(500).json({
      message: 'Google authentication failed. Please try again later.',
    });
  }
});

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
        is_active: true,
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

    // ✅ Block deactivated accounts from completing OTP verification
    if (user.is_active === false) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact support.',
        isInactive: true,
      });
    }

    user.isVerified = true;
    user.otp        = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        nmls_id: user.nmls_id,
        state:   user.state,
        role:    user.role,
      },
    });

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

    // ✅ Check email verification first
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Email not verified.',
        needsVerification: true,
        email,
      });
    }

    // ✅ Check active status
    if (user.is_active === false) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact support.',
        isInactive: true,
      });
    }

    // ✅ Check password (allow null password for Google-only accounts)
    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created with Google Sign-In. Please use Google to log in.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // ── Update last login ──
    user.last_login_at = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        nmls_id: user.nmls_id,
        state:   user.state,
        role:    user.role,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(200).json({ message: 'If that email exists, a reset code has been sent.' });
    }

    const otp        = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
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

    const salt      = await bcrypt.genSalt(10);
    user.password   = await bcrypt.hash(newPassword, salt);
    user.otp        = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// ── PROTECTED ROUTES ──────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      name, phone, address, nmls_id, state,
      license_type, target_state, target_date, experience,
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name         && { name }),
        ...(phone        !== undefined && { phone }),
        ...(address      !== undefined && { address }),
        ...(nmls_id      !== undefined && { nmls_id }),
        ...(state        !== undefined && { state }),
        ...(license_type !== undefined && { license_type }),
        ...(target_state !== undefined && { target_state }),
        ...(target_date  !== undefined && { target_date }),
        ...(experience   !== undefined && { experience }),
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id:      updated._id,
        name:    updated.name,
        email:   updated.email,
        nmls_id: updated.nmls_id,
        state:   updated.state,
        role:    updated.role,
        phone:   updated.phone,
        address: updated.address,
      },
    });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── PUT /api/auth/change-password ─────────────────────────────────
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt    = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── PUT /api/auth/notifications ───────────────────────────────────
router.put('/notifications', authMiddleware, async (req, res) => {
  try {
    const {
      email_course_updates,
      email_promotions,
      email_reminders,
      email_completions,
      sms_course_updates,
      sms_promotions,
      sms_reminders,
      sms_completions,
    } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      notification_prefs: {
        email_course_updates: !!email_course_updates,
        email_promotions:     !!email_promotions,
        email_reminders:      !!email_reminders,
        email_completions:    !!email_completions,
        sms_course_updates:   !!sms_course_updates,
        sms_promotions:       !!sms_promotions,
        sms_reminders:        !!sms_reminders,
        sms_completions:      !!sms_completions,
      },
    });

    res.json({ message: 'Notification preferences saved' });

  } catch (err) {
    console.error('Notifications update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── POST /api/auth/google/link ───────────────────────────────────
/**
 * Link existing email/password account with Google
 * 
 * Headers:
 * {
 *   Authorization: "Bearer jwt_token"
 * }
 * 
 * Request body:
 * {
 *   token: "google_jwt_token"
 * }
 */
router.post('/google/link', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required.' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, picture } = payload;

    // Update user with Google ID
    const user = await User.findByIdAndUpdate(
      userId,
      {
        googleId,
        profilePicture: picture || undefined,
      },
      { new: true }
    ).select('-password -otp -otpExpires');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Google account linked successfully.',
      user: {
        id:      user._id,
        name:    user.name,
        email:   user.email,
        googleId: user.googleId,
      },
    });
  } catch (error) {
    console.error('❌ Google link error:', error);
    res.status(500).json({
      message: 'Failed to link Google account.',
    });
  }
});

// ── POST /api/auth/google/unlink ─────────────────────────────────
/**
 * Unlink Google from account (if user has password)
 * 
 * Headers:
 * {
 *   Authorization: "Bearer jwt_token"
 * }
 */
router.post('/google/unlink', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent unlinking if user has no password (Google-only account)
    if (!user.password) {
      return res.status(400).json({
        message: 'Cannot unlink Google from a Google-only account. Set a password first.',
      });
    }

    // Unlink Google ID
    user.googleId = null;
    await user.save();

    res.json({
      message: 'Google account unlinked successfully.',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Google unlink error:', error);
    res.status(500).json({
      message: 'Failed to unlink Google account.',
    });
  }
});

module.exports = router;

/**
 * ─────────────────────────────────────────────────────────────────
 * INSTALLATION & USAGE
 * ─────────────────────────────────────────────────────────────────
 * 
 * 1. Install google-auth-library:
 *    npm install google-auth-library
 * 
 * 2. Update .env with Google credentials:
 *    GOOGLE_CLIENT_ID=your_client_id
 *    GOOGLE_CLIENT_SECRET=your_client_secret
 * 
 * 3. Update User model to include:
 *    - googleId: { type: String, unique: true, sparse: true }
 *    - profilePicture: String
 * 
 * 4. Use in main app:
 *    const authRoutes = require('./routes/auth.routes');
 *    app.use('/api/auth', authRoutes);
 * 
 * 5. New endpoints available:
 *    POST /api/auth/google
 *    POST /api/auth/google/link (protected)
 *    POST /api/auth/google/unlink (protected)
 */