const mongoose = require('mongoose');

// ── Per-module progress entry ─────────────────────────────────────────
const moduleProgressSchema = new mongoose.Schema({
  module_order:  { type: Number, required: true },
  module_title:  { type: String },
  seat_seconds:  { type: Number, default: 0 },
  completed:     { type: Boolean, default: false },
  completed_at:  { type: Date, default: null },
  quiz_passed:   { type: Boolean, default: false },
  quiz_score:    { type: Number, default: null },
  quiz_attempts: { type: Number, default: 0 },
}, { _id: false });

// ── Enrollment ────────────────────────────────────────────────────────
const enrollmentSchema = new mongoose.Schema({
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // ROCS agreement must be logged before any progress is recorded
  rocs_agreed:    { type: Boolean, default: false },
  rocs_agreed_at: { type: Date,    default: null },

  // Overall progress
  status: {
    type:    String,
    enum:    ['enrolled', 'in_progress', 'completed', 'removed'], // ← added 'removed'
    default: 'enrolled',
  },
  current_idx:    { type: Number, default: 0 },
  completed_idxs: [{ type: Number }],
  total_steps:    { type: Number, default: 0 },

  // Total seat time in seconds across all modules
  total_seat_seconds: { type: Number, default: 0 },

  // Per-module breakdown
  module_progress: [moduleProgressSchema],

  // Completion
  completed_at:    { type: Date,   default: null },
  certificate_url: { type: String, default: null },

  // Removal tracking ← added
  removed_at:     { type: Date,   default: null },
  removal_reason: { type: String, default: null },

  // Last activity (for inactivity tracking)
  last_active_at: { type: Date, default: Date.now },

}, { timestamps: true });

// One enrollment per student per course
enrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);