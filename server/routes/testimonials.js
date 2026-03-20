const express      = require("express");
const router       = express.Router();
const jwt          = require("jsonwebtoken");
const Testimonial  = require("../models/Testimonial");
const User         = require("../models/User");

/* ── Auth middleware ─────────────────────────────────────────────── */
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.user = { ...decoded, id: decoded.id || decoded._id };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
const adminOnly = (req, res, next) => {
  console.log("adminOnly check — role:", req.user?.role); // ← ADD
  if (!["admin", "instructor"].includes(req.user?.role))
    return res.status(403).json({ message: "Admin or instructor access required" });
  next();
};

/* ─────────────────────────────────────────────────────────────────
   GET /api/testimonials/my-courses
   ⚠️  MUST be before any /:id wildcard routes
   Returns completed courses for the logged-in student.
───────────────────────────────────────────────────────────────── */
router.get("/my-courses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("completions.course_id", "title type credit_hours nmls_course_id");

    if (!user) return res.status(404).json({ message: "User not found" });

    const courses = (user.completions || [])
      .filter(c => c.course_id)
      .map(c => ({
        course_id:    c.course_id._id,
        title:        c.course_id.title,
        type:         c.course_id.type,
        credit_hours: c.course_id.credit_hours,
        completed_at: c.completed_at,
      }));

    res.json({ courses });
  } catch (err) {
    console.error("Testimonial my-courses error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/testimonials/mine
   ⚠️  MUST be before any /:id wildcard routes
   Student sees their own submissions.
───────────────────────────────────────────────────────────────── */
router.get("/mine", auth, async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ user_id: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (err) {
    console.error("Testimonial mine error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/testimonials/admin/all
   ⚠️  MUST be before any /:id wildcard routes
   Admin: all testimonials with optional status filter.
───────────────────────────────────────────────────────────────── */
router.get("/admin/all", auth, adminOnly, async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const testimonials = await Testimonial.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Testimonial.countDocuments(filter);
    res.json({ testimonials, total });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/testimonials
   Public — approved testimonials for marketing pages.
───────────────────────────────────────────────────────────────── */
router.get("/", async (req, res) => {
  try {
    const { course_id, featured, limit = 20, skip = 0 } = req.query;
    const filter = { status: "approved" };
    if (course_id)          filter.course_id = course_id;
    if (featured === "true") filter.featured = true;

    const testimonials = await Testimonial.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .select("-email");

    const total = await Testimonial.countDocuments(filter);
    res.json({ testimonials, total });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/testimonials
   Submit or update a testimonial (upsert — one per student per course).
───────────────────────────────────────────────────────────────── */
router.post("/", auth, async (req, res) => {
  try {
    const { course_id, rating, comment, would_recommend } = req.body;

    if (!course_id)
      return res.status(400).json({ message: "course_id is required" });
    if (!rating)
      return res.status(400).json({ message: "rating is required (1–5)" });
    if (!comment?.trim())
      return res.status(400).json({ message: "comment is required" });
    if (would_recommend === undefined || would_recommend === null)
      return res.status(400).json({ message: "would_recommend is required" });

    // Verify student completed this course
    const user = await User.findById(req.user.id)
      .populate("completions.course_id", "title type");

    if (!user) return res.status(404).json({ message: "User not found" });

    const completion = (user.completions || []).find(
      c => String(c.course_id?._id || c.course_id) === String(course_id)
    );

    if (!completion)
      return res.status(403).json({
        message: "You can only leave a testimonial for courses you have completed.",
      });

    const courseTitle = completion.course_id?.title || "Unknown Course";
    const courseType  = completion.course_id?.type  || null;

    const testimonial = await Testimonial.findOneAndUpdate(
      { user_id: req.user.id, course_id },
      {
        user_id:         req.user.id,
        name:            user.name,
        email:           user.email,
        course_id,
        course_title:    courseTitle,
        course_type:     courseType,
        rating:          Number(rating),
        comment:         comment.trim(),
        would_recommend: Boolean(would_recommend),
        status:          "pending",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      message: "Testimonial submitted successfully. It will appear after review.",
      testimonial,
    });
  } catch (err) {
    console.error("Testimonial submit error:", err);
    if (err.code === 11000)
      return res.status(409).json({ message: "You have already submitted a testimonial for this course." });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────────
   PUT  /api/testimonials/admin/:id  — Admin: approve / reject / feature
   DELETE /api/testimonials/admin/:id — Admin: delete
   ⚠️  These use /admin/:id so they don't collide with student /:id
───────────────────────────────────────────────────────────────── */
router.put("/admin/:id", auth, adminOnly, async (req, res) => {
  try {
    const { status, featured } = req.body;
    const update = {};
    if (status   !== undefined) update.status   = status;
    if (featured !== undefined) update.featured = featured;

    const t = await Testimonial.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!t) return res.status(404).json({ message: "Testimonial not found" });
    res.json({ message: "Updated", testimonial: t });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/admin/:id", auth, adminOnly, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;