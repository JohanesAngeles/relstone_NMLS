const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  nmls_id:  { type: String, trim: true, default: null },
  state:    { type: String, default: null },
  role:     { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  otp:        { type: String, default: null },
  otpExpires: { type: Date,   default: null },
  completions: [
    {
      course_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      completed_at:    { type: Date },
      certificate_url: { type: String }
    }
  ],
  // CE Renewal Tracking
  ce_renewal_deadline: { type: Date, default: null },
  ce_hours_required:   { type: Number, default: 0 },
  ce_renewal_cycle_start: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);