const mongoose = require('mongoose');

const rocsLogSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  course_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  agreed_at:    { type: Date,   default: Date.now },
  ip_address:   { type: String, default: null },
  user_agent:   { type: String, default: null },
  rocs_version: { type: String, default: 'V4' },
}, { timestamps: true });

// Fast lookup by student + course
rocsLogSchema.index({ user_id: 1, course_id: 1 });

module.exports = mongoose.model('RocsLog', rocsLogSchema);