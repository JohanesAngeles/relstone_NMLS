const mongoose = require('mongoose');

const instructorLogSchema = new mongoose.Schema(
  {
    instructor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructor_name: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      // Added 'edit_course' to the enum so the database accepts the new log type
      enum: [
        'add_course', 
        'edit_course', 
        'remove_course', 
        'assign_course', 
        'toggle_active'
      ],
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    student_name: {
      type: String,
      default: '',
    },
    student_email: {
      type: String,
      default: '',
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    course_title: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Index for fast queries by instructor, student, or action
instructorLogSchema.index({ instructor_id: 1, timestamp: -1 });
instructorLogSchema.index({ student_id: 1, timestamp: -1 });
instructorLogSchema.index({ action: 1, timestamp: -1 });
instructorLogSchema.index({ course_id: 1, timestamp: -1 }); // Added index for course-specific lookups

module.exports = mongoose.model('InstructorLog', instructorLogSchema);