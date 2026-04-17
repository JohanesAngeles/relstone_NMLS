const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    // Who submitted: optional for public, required for verified
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
      default: null,
    },

    // Course info: manual string for public, ID for verified
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
      default: null,
    },
    course_title: {
      type: String,
      required: false,
      trim: true,
    },
    course_type: {
      type: String,
      default: null,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    would_recommend: {
      type: Boolean,
      required: true,
    },

    // Moderation & Metadata
    source: {
      type: String,
      enum: ["verified", "public"],
      default: "verified",
    },
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

/**
 * ⚠️ CRITICAL: PARTIAL INDEX
 * This replaces the standard unique index. It allows multiple reviews where 
 * user_id is null (public), but enforces "one review per course" for logged-in users.
 */
testimonialSchema.index(
  { user_id: 1, course_id: 1 },
  { 
    unique: true, 
    partialFilterExpression: { user_id: { $type: "objectId" } } 
  }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);