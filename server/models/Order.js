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
    enum: ['pending', 'paid', 'completed', 'cancelled', 'refund_approved', 'refund_rejected', 'refund_processed'],
    default: 'completed',
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
  /** Refund request fields */
  refund_request: {
    reason: {
      type: String,
      enum: ['Course not as described', 'Technical issues prevented access', 'Purchased by mistake', 'Duplicate purchase', 'Other'],
    },
    details: {
      type: String,
      default: '',
    },
    requested_at: {
      type: Date,
    },
  },
  refund_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: null,
  },
  refund_processed_at: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);