const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ── Core ─────────────────────────────────────────────────────────
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, default: null }, // null for Google OAuth users
  role: { type: String, enum: ['student', 'instructor', 'admin', 'super_admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  otp:        { type: String,  default: null },
  otpExpires: { type: Date,    default: null },
  is_active:      { type: Boolean, default: true },
  deactivated_at: { type: Date,    default: null },
  last_login_at:  { type: Date,    default: null },
  company:    { type: String, trim: true, default: null },
  work_phone: { type: String, trim: true, default: null },
  home_phone: { type: String, trim: true, default: null },
  course_type:{ type: String, default: null },
  town_city:  { type: String, trim: true, default: null },
  zip_code:   { type: String, trim: true, default: null },

  // ── Google OAuth ──────────────────────────────────────────────────
  googleId:       { type: String, default: null },
  profilePicture: { type: String, default: null },

  // ── Profile ───────────────────────────────────────────────────────
  nmls_id:  { type: String, trim: true, default: null },
  state:    { type: String, default: null },
  phone:    { type: String, trim: true, default: null },
  address:  { type: String, trim: true, default: null },

  // ── BioSig-ID (BSI) ───────────────────────────────────────────────
  biosig_enrolled_at: { type: Date, default: null }, // set on first successful verification
  biosig_verifications: [
    {
      course_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      verified_at:   { type: Date, default: Date.now },
      session_token: { type: String },
      provider:      { type: String, default: 'BioSig-ID' },
      module_order:  { type: Number },
      result:        { type: String, default: null },  // 'pass' | 'fail' | raw value from callback
      verified:      { type: Boolean, default: false }, // true only on confirmed pass
      score:         { type: String, default: null },   // biometric score from BioSig-ID
      uid:           { type: String, default: null },   // NMLS-ID#... value returned by BioSig-ID
    }
  ],

  // ── License Goals ─────────────────────────────────────────────────
  license_type:  { type: String, default: null },
  target_state:  { type: String, default: null },
  target_date:   { type: String, default: null },
  experience:    { type: String, default: null },

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

  // ── CE Renewal Tracking ───────────────────────────────────────────
  ce_renewal_deadline:    { type: Date,   default: null },
  ce_hours_required:      { type: Number, default: 0 },
  ce_renewal_cycle_start: { type: Date,   default: null },
  renewal_status:         { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  renewal_reminders_sent: [
    {
      days_before: { type: Number },
      sent_at:     { type: Date },
    }
  ],

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────
userSchema.index({ 'biosig_verifications.course_id': 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);