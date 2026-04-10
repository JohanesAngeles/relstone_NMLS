const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
      },
      price:            { type: Number,  required: true },
      include_textbook: { type: Boolean, default: false },
      textbook_price:   { type: Number,  default: 0 },
    }
  ],
  total_amount: {
    type: Number,
    required: true,
  },

  // ── Voucher / Promo Code ──────────────────────────────────────
  voucher_code:     { type: String, default: null },
  voucher_discount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'paid', 'completed', 'cancelled'],
    default: 'pending',
  },
  payment_reference: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);