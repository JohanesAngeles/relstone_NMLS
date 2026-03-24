const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  sender_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sender_name: { type: String },
  sender_role: { type: String },
  message:     { type: String, required: true },
  created_at:  { type: Date, default: Date.now },
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name:   { type: String },
  user_email:  { type: String },
  subject:     { type: String, required: true, trim: true },
  category:    {
    type:    String,
    enum:    ['technical', 'billing', 'course', 'certificate', 'account', 'other'],
    default: 'other',
  },
  message:     { type: String, required: true, trim: true },
  priority:    { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  status:      { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  replies:     [replySchema],
  resolved_at: { type: Date, default: null },
  closed_at:   { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', ticketSchema);