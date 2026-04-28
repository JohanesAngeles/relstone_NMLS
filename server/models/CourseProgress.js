const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // removed index: true — covered by compound index below
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      // removed index: true — covered by compound index below
    },
    completed_idxs: {
      type: [Number],
      default: [],
    },
    current_idx: {
      type: Number,
      default: 0,
    },
    total_steps: {
      type: Number,
      default: 0,
    },
    is_completed: {
      type: Boolean,
      default: false,
      index: true, // keep — standalone index for filtering completed courses
    },
    completed_at: {
      type: Date,
      default: null,
    },
    last_activity_at: {
      type: Date,
      default: Date.now,
    },
    reset_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

courseProgressSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);