const mongoose = require('mongoose');

// ── Quiz Question (reused in module quizzes and final exam) ───────────
const questionSchema = new mongoose.Schema({
  number:        { type: Number },
  question:      { type: String, required: true },
  options:       [{ type: String }],
  correct_index: { type: Number, required: true },
  explanation:   { type: String },
}, { _id: false });

// ── Module ────────────────────────────────────────────────────────────
const moduleSchema = new mongoose.Schema({
  order:        { type: Number, required: true },
  title:        { type: String, required: true },
  credit_hours: { type: Number, default: 0 },
  sections:     [{ type: String }],
  pdf_url:      { type: String, default: null },
  video_url:    { type: String, default: null },
  quiz:         [questionSchema],
}, { _id: false });

// ── Final Exam ────────────────────────────────────────────────────────
const finalExamSchema = new mongoose.Schema({
  title:              { type: String },
  passing_score:      { type: Number, default: 70 },
  time_limit_minutes: { type: Number, default: 90 },
  questions:          [questionSchema],
}, { _id: false });

// ── Course ────────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: true,
    trim:     true,
  },
  nmls_course_id: {
    type:     String,
    required: true,
    unique:   true,
    trim:     true,
  },
  type: {
    type: String,
    enum: ['PE', 'CE'],
    required: true,
  },
  credit_hours: {
    type:     Number,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type:     Number,
    required: true,
  },
  states_approved: [{ type: String }],
  state_approval_number: { type: String, trim: true, default: null },

  // ── Course-level PDF / Video (fallback for all modules) ───────────
  pdf_url:   { type: String, default: null },
  video_url: { type: String, default: null },

  // ── Modules (each has its own pdf_url / video_url override) ───────
  modules: [moduleSchema],

  // ── Final Exam ────────────────────────────────────────────────────
  final_exam: finalExamSchema,

  // ── Optional metadata ─────────────────────────────────────────────
  provider:             { type: String },
  nmls_provider_number: { type: String },
  level:                { type: String },

  has_textbook:   { type: Boolean, default: false },
  textbook_price: { type: Number,  default: 0 },
  is_active:      { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);