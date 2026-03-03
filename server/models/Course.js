const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  nmls_course_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['PE', 'CE'],
    required: true
  },
  credit_hours: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  states_approved: [
    {
      type: String
    }
  ],
  modules: [
    {
      title: { type: String },
      order: { type: Number }
    }
  ],
  has_textbook: {
    type: Boolean,
    default: false
  },
  textbook_price: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);