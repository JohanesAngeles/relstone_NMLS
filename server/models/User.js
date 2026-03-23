const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ── Core ─────────────────────────────────────────────────────────
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  otp:        { type: String,  default: null },
  otpExpires: { type: Date,    default: null },
  is_active:       { type: Boolean, default: true },
deactivated_at:  { type: Date,    default: null  },
last_login_at:   { type: Date,    default: null  },

  // ── Profile ───────────────────────────────────────────────────────
  nmls_id:  { type: String, trim: true, default: null },
  state:    { type: String, default: null },
  phone:    { type: String, trim: true, default: null },
  address:  { type: String, trim: true, default: null },

  // ── License Goals ─────────────────────────────────────────────────
  license_type:  { type: String, default: null }, // 'new' | 'renewal' | 'both'
  target_state:  { type: String, default: null },
  target_date:   { type: String, default: null },
  experience:    { type: String, default: null }, // 'none' | 'some' | 'experienced' | 'renewing'

  // ── Notification Preferences ──────────────────────────────────────
  notification_prefs: {
    email_course_updates: { type: Boolean, default: true  },
    email_promotions:     { type: Boolean, default: false },
    email_reminders:      { type: Boolean, default: true  },
    email_completions:    { type: Boolean, default: true  },
    sms_course_updates:   { type: Boolean, default: false },
    sms_promotions:       { type: Boolean, default: false },
    sms_reminders:        { type: Boolean, default: false },
    sms_completions:      { type: Boolean, default: false },
  },

  // ── Course History ────────────────────────────────────────────────
  completions: [
    {
      course_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      completed_at:    { type: Date },
      certificate_url: { type: String },
    }
  ],

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);