// models/Announcement.js
const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type: {
    type:    String,
    enum:    ['voucher', 'general', 'system', 'new_course'],
    default: 'general',
  },
  ref_id:    { type: mongoose.Schema.Types.ObjectId, refPath: 'ref_model' },
  ref_model: { type: String, enum: ['Voucher', 'Course'] },

  is_active:  { type: Boolean, default: true },
  expires_at: { type: Date,    default: null },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);