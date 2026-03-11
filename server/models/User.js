const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  nmls_id: {
    type: String,
    trim: true,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],  
    default: 'student'
  },
  completions: [
    {
      course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      completed_at: { type: Date },
      certificate_url: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);