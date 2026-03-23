const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    // ── Who submitted ────────────────────────────────────────────────
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ── Which course ─────────────────────────────────────────────────
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Course",
      required: true,
    },
    course_title: {
      type: String,
      required: true,
      trim: true,
    },
    course_type: {
      type: String,   // "PE" | "CE"
      default: null,
    },

    // ── Rating (1–5 stars) ───────────────────────────────────────────
    rating: {
      type: Number,
      min:  1,
      max:  5,
      required: true,
    },

    // ── Written comment ──────────────────────────────────────────────
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // ── Would recommend? ─────────────────────────────────────────────
    would_recommend: {
      type: Boolean,
      required: true,
    },

    // ── Moderation ───────────────────────────────────────────────────
    // "pending" → admin review → "approved" | "rejected"
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One testimonial per user per course
testimonialSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model("Testimonial", testimonialSchema);