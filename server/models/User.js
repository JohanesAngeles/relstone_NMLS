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
  is_active:      { type: Boolean, default: true },
  deactivated_at: { type: Date,    default: null },
  last_login_at:  { type: Date,    default: null },

  // ── Profile ───────────────────────────────────────────────────────
  nmls_id:  { type: String, trim: true, default: null },
  state:    { type: String, default: null },
  phone:    { type: String, trim: true, default: null },
  address:  { type: String, trim: true, default: null },

  // ── BioSig-ID (BSI) History (NEW) ─────────────────────────────────
  // NMLS requires biometric verification logs for audits. 
  // This stores every successful identity verification.
  biosig_verifications: [
    {
      course_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      verified_at:   { type: Date, default: Date.now },
      session_token: { type: String }, // Token received from BSI API
      provider:      { type: String, default: 'BioSig-ID' },
      module_order:  { type: Number }  // Optional: tracking which module triggered it
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

  // CE Renewal Tracking
  ce_renewal_deadline: { type: Date, default: null },
  ce_hours_required: { type: Number, default: 0 },
  ce_renewal_cycle_start: { type: Date, default: null },
  renewal_status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  renewal_reminders_sent: [
    {
      days_before: { type: Number }, // 90, 60, or 30
      sent_at: { type: Date },
    }
  ],

}, { timestamps: true });

// Indexing for faster BioSig status lookups
userSchema.index({ "biosig_verifications.course_id": 1 });

module.exports = mongoose.model('User', userSchema);