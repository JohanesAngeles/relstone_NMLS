const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
      },
      price: { type: Number, required: true },
      include_textbook: { type: Boolean, default: false },
      textbook_price: { type: Number, default: 0 }
    }
  ],
  total_amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    // ── FIX: added 'completed' to enum so it saves correctly.
    // 'paid' is kept for backward compat with existing orders.
    // Going forward all new orders will be 'completed'.
    enum: ['pending', 'paid', 'completed', 'cancelled'],
    default: 'completed',  // ← new orders default to completed (no payment gateway)
  },
  payment_reference: {
    type: String,
    default: null
  },
  /** credit_card | ach | payment_plan — set at checkout; gateway ids can live in payment_reference later */
  payment_method: {
    type: String,
    enum: ['credit_card', 'ach', 'payment_plan'],
    default: 'credit_card',
  },
  /** Snapshot from checkout form (billing / shipping fields) */
  billing: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);