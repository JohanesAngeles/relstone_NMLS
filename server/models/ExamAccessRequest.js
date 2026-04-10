const mongoose = require('mongoose');

const examAccessRequestSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  course_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  quiz_id:    { type: String, required: true },
  quiz_title: { type: String },
  quiz_type:  { type: String },

  // Student info (denormalized for quick display)
  user_name:  { type: String },
  user_email: { type: String },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending',
    index: true,
  },

  // Message from student (optional)
  student_message: { type: String, default: '' },

  // Admin response
  admin_note:    { type: String, default: '' },
  reviewed_by:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewed_at:   { type: Date, default: null },

}, { timestamps: true });

// Unique: one pending request per student per quiz
examAccessRequestSchema.index({ user_id: 1, course_id: 1, quiz_id: 1, status: 1 });

module.exports = mongoose.model('ExamAccessRequest', examAccessRequestSchema);