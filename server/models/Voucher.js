const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },

  description: { type: String, default: '' },

  // Discount type
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discount_value: {
    type: Number,
    required: true,
    min: 0,
  },

  // Limits
  min_order_amount: { type: Number, default: 0 },
  max_discount:     { type: Number, default: null }, // cap for percentage discounts
  max_uses:         { type: Number, default: null }, // null = unlimited
  uses_per_user:    { type: Number, default: 1 },

  // Validity
  valid_from:  { type: Date, default: Date.now },
  valid_until: { type: Date, default: null }, // null = no expiry

  // Course restriction (null = applies to all courses)
  applicable_courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // Status
  is_active: { type: Boolean, default: true },

  // Usage tracking
  used_count: { type: Number, default: 0 },
  used_by: [
    {
      user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      order_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      used_at:   { type: Date, default: Date.now },
      discount_applied: { type: Number },
    }
  ],

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

voucherSchema.index({ code: 1 });
voucherSchema.index({ is_active: 1, valid_until: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);