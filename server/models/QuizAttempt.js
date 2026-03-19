const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  course_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  quiz_id:       { type: String, required: true },
  quiz_title:    { type: String },
  quiz_type:     { type: String, enum: ['checkpoint', 'quiz_fundamentals', 'final_exam'], required: true },
  module_order:  { type: Number, default: null },

  score_pct:     { type: Number, required: true },
  correct:       { type: Number, required: true },
  total:         { type: Number, required: true },
  passed:        { type: Boolean, required: true },
  passing_score: { type: Number, default: 70 },

  // ── NEW: stores student's answers for review mode
  // key = question id (e.g. "mod1-q0"), value = selected option index (0-3)
  answers: { type: Map, of: Number, default: null },

  submitted_at:       { type: Date, default: Date.now },
  time_spent_seconds: { type: Number, default: null },

  unlocked_by_instructor: { type: Boolean, default: false },
  unlocked_at:            { type: Date,    default: null },
  unlocked_by:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

quizAttemptSchema.index({ user_id: 1, course_id: 1 });
quizAttemptSchema.index({ user_id: 1, course_id: 1, quiz_id: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);