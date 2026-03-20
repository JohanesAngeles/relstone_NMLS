import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import Layout from "../../components/Layout";
import {
  Star, ThumbsUp, ThumbsDown, BookOpen, Send,
  CheckCircle2, AlertCircle, ChevronDown, Loader2,
  MessageSquare, Award, Clock,
} from "lucide-react";

/* ─── Testimonial Page ───────────────────────────────────────────── */
const TestimonialPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── Data ─────────────────────────────────────────────────────────
  const [courses,     setCourses]     = useState([]);   // completed courses from API
  const [myReviews,   setMyReviews]   = useState([]);   // student's existing reviews
  const [loadingCourses, setLoadingCourses] = useState(true);

  // ── Form state ────────────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState(null); // full course object
  const [rating,         setRating]         = useState(0);
  const [hoverRating,    setHoverRating]     = useState(0);
  const [comment,        setComment]         = useState("");
  const [recommend,      setRecommend]       = useState(null); // true | false | null

  // ── UI state ──────────────────────────────────────────────────────
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [errors,   setErrors]   = useState({});

  /* ── Fetch completed courses + existing reviews on mount ─────────── */
  useEffect(() => {
    const init = async () => {
      try {
        const [coursesRes, reviewsRes] = await Promise.all([
          API.get("/testimonials/my-courses"),
          API.get("/testimonials/mine"),
        ]);
        setCourses(coursesRes.data?.courses || []);
        setMyReviews(reviewsRes.data?.testimonials || []);
      } catch {
        setError("Could not load your course data. Please try again.");
      } finally {
        setLoadingCourses(false);
      }
    };
    init();
  }, []);

  /* ── Auto-fill name/email from user context ───────────────────────── */
  const displayName  = user?.name  || "";
  const displayEmail = user?.email || "";

  /* ── Has student already reviewed this course? ────────────────────── */
  const existingReview = selectedCourse
    ? myReviews.find(r => String(r.course_id) === String(selectedCourse.course_id))
    : null;

  /* ── When course changes, pre-fill from existing review ─────────── */
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setComment(existingReview.comment || "");
      setRecommend(existingReview.would_recommend ?? null);
    } else {
      setRating(0);
      setComment("");
      setRecommend(null);
    }
    setErrors({});
    setError("");
    setSuccess(false);
  }, [selectedCourse]);

  /* ── Validate ─────────────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!selectedCourse)       e.course   = "Please select a course.";
    if (rating === 0)          e.rating   = "Please give a star rating.";
    if (!comment.trim())       e.comment  = "Please write a comment.";
    if (comment.trim().length < 20) e.comment = "Comment must be at least 20 characters.";
    if (recommend === null)    e.recommend = "Please tell us if you'd recommend this course.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ───────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      await API.post("/testimonials", {
        course_id:       selectedCourse.course_id,
        rating,
        comment:         comment.trim(),
        would_recommend: recommend,
      });
      setSuccess(true);
      // Refresh existing reviews
      const res = await API.get("/testimonials/mine");
      setMyReviews(res.data?.testimonials || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not submit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Initials avatar ──────────────────────────────────────────────── */
  const initials = displayName
    ? displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "ST";

  return (
    <Layout>
      <style>{CSS}</style>
      <div style={S.shell}>

        {/* ── Page Header ── */}
        <div style={S.pageHdr}>
          <div style={S.hdrLeft}>
            <div style={S.hdrKicker}><MessageSquare size={13} /> Student Feedback</div>
            <h1 style={S.hdrTitle}>Share Your Experience</h1>
            <p style={S.hdrSub}>Help future students by reviewing a course you've completed.</p>
          </div>
          {myReviews.length > 0 && (
            <div style={S.hdrBadge}>
              <Star size={14} style={{ fill: "#F59E0B", color: "#F59E0B" }} />
              {myReviews.length} Review{myReviews.length !== 1 ? "s" : ""} Submitted
            </div>
          )}
        </div>

        <div style={S.layout}>

          {/* ══════════════════════════════════════════════════════════
              LEFT — FORM
          ══════════════════════════════════════════════════════════ */}
          <div style={S.formCol}>

            {/* Success state */}
            {success && (
              <div style={S.successCard}>
                <div style={S.successIcon}><CheckCircle2 size={32} style={{ color: "#22C55E" }} /></div>
                <div style={S.successTitle}>Thank you, {displayName.split(" ")[0]}!</div>
                <div style={S.successSub}>Your review has been submitted and is pending approval. It will appear publicly once reviewed by our team.</div>
                <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
                  <button style={S.successBtnPrimary} onClick={() => { setSuccess(false); setSelectedCourse(null); }} type="button">
                    Review Another Course
                  </button>
                  <button style={S.successBtnSecondary} onClick={() => navigate("/dashboard")} type="button">
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {!success && (
              <>
                {/* Error banner */}
                {error && (
                  <div style={S.errorBanner}>
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                {/* ── SECTION 1: Student Info (read-only, auto-filled) ── */}
                <div style={S.card}>
                  <div style={S.cardHdr}>
                    <div style={S.cardHdrIcon}><Award size={16} style={{ color: "#2EABFE" }} /></div>
                    <div>
                      <div style={S.cardHdrTitle}>Your Information</div>
                      <div style={S.cardHdrSub}>Auto-filled from your account</div>
                    </div>
                  </div>
                  <div style={S.cardDivider} />
                  <div style={S.infoRow}>
                    <div style={S.avatarCircle}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={S.infoName}>{displayName || "—"}</div>
                      <div style={S.infoEmail}>{displayEmail || "—"}</div>
                    </div>
                    <div style={S.verifiedBadge}><CheckCircle2 size={12} /> Verified Student</div>
                  </div>
                </div>

                {/* ── SECTION 2: Course Selection (auto from completed courses) ── */}
                <div style={S.card}>
                  <div style={S.cardHdr}>
                    <div style={S.cardHdrIcon}><BookOpen size={16} style={{ color: "#2EABFE" }} /></div>
                    <div>
                      <div style={S.cardHdrTitle}>Select Course</div>
                      <div style={S.cardHdrSub}>Only your completed courses appear here</div>
                    </div>
                  </div>
                  <div style={S.cardDivider} />

                  {loadingCourses ? (
                    <div style={S.loadingRow}><Loader2 size={18} className="spin-icon" /> Loading your courses…</div>
                  ) : courses.length === 0 ? (
                    <div style={S.emptyCoursesMsg}>
                      <BookOpen size={24} style={{ color: "rgba(9,25,37,0.25)", marginBottom: 8 }} />
                      <div>You haven't completed any courses yet.</div>
                      <button style={S.browseCTA} onClick={() => navigate("/courses")} type="button">Browse Courses</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {courses.map((course) => {
                        const isSelected  = selectedCourse?.course_id === course.course_id;
                        const isReviewed  = myReviews.some(r => String(r.course_id) === String(course.course_id));
                        const typeColor   = String(course.type).toUpperCase() === "PE" ? "#2EABFE" : "#00B4B4";
                        return (
                          <button
                            key={course.course_id}
                            type="button"
                            onClick={() => setSelectedCourse(course)}
                            style={{
                              display: "flex", alignItems: "center", gap: 14,
                              padding: "14px 16px", borderRadius: 10, textAlign: "left",
                              border: isSelected ? `1.5px solid #2EABFE` : "1px solid rgba(2,8,23,0.10)",
                              background: isSelected ? "rgba(46,171,254,0.06)" : "#fff",
                              cursor: "pointer", transition: "all 0.18s",
                              boxShadow: isSelected ? "0 0 0 4px rgba(46,171,254,0.12)" : "none",
                            }}
                          >
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${typeColor}18`, border: `1px solid ${typeColor}40`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                              <BookOpen size={18} style={{ color: typeColor }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#091925", fontFamily: "'Poppins',sans-serif", lineHeight: 1.35, marginBottom: 4 }}>
                                {course.title}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800, color: typeColor, background: `${typeColor}18`, border: `0.5px solid ${typeColor}40` }}>
                                  {String(course.type || "").toUpperCase()}
                                </span>
                                {course.credit_hours && (
                                  <span style={{ fontSize: 11, color: "rgba(9,25,37,0.50)", display: "flex", alignItems: "center", gap: 4, fontFamily: "'Poppins',sans-serif" }}>
                                    <Clock size={11} /> {course.credit_hours} hrs
                                  </span>
                                )}
                                {isReviewed && (
                                  <span style={{ fontSize: 10, fontWeight: 800, color: "#F59E0B", background: "rgba(245,158,11,0.10)", border: "0.5px solid rgba(245,158,11,0.30)", padding: "2px 8px", borderRadius: 999 }}>
                                    ★ Reviewed
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 size={18} style={{ color: "#2EABFE", flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                      {errors.course && <div style={S.fieldError}><AlertCircle size={12} /> {errors.course}</div>}
                    </div>
                  )}
                </div>

                {/* ── SECTION 3: Star Rating ── */}
                <div style={S.card}>
                  <div style={S.cardHdr}>
                    <div style={S.cardHdrIcon}><Star size={16} style={{ color: "#F59E0B" }} /></div>
                    <div>
                      <div style={S.cardHdrTitle}>Star Rating</div>
                      <div style={S.cardHdrSub}>How would you rate this course overall?</div>
                    </div>
                  </div>
                  <div style={S.cardDivider} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 0" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || rating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, transition: "transform 0.15s" }}
                            className={active ? "star-active" : "star-inactive"}
                          >
                            <Star
                              size={36}
                              style={{
                                color: active ? "#F59E0B" : "rgba(9,25,37,0.18)",
                                fill:  active ? "#F59E0B" : "none",
                                transition: "all 0.15s",
                                transform: active ? "scale(1.15)" : "scale(1)",
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: rating > 0 ? "#F59E0B" : "rgba(9,25,37,0.35)", fontFamily: "'Poppins',sans-serif" }}>
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] || "Click to rate"}
                    </div>
                    {errors.rating && <div style={S.fieldError}><AlertCircle size={12} /> {errors.rating}</div>}
                  </div>
                </div>

                {/* ── SECTION 4: Would you recommend? ── */}
                <div style={S.card}>
                  <div style={S.cardHdr}>
                    <div style={S.cardHdrIcon}><ThumbsUp size={16} style={{ color: "#22C55E" }} /></div>
                    <div>
                      <div style={S.cardHdrTitle}>Would You Recommend This Course?</div>
                      <div style={S.cardHdrSub}>Your honest opinion helps future students</div>
                    </div>
                  </div>
                  <div style={S.cardDivider} />
                  <div style={{ display: "flex", gap: 14, padding: "8px 0" }}>
                    {/* YES */}
                    <button
                      type="button"
                      onClick={() => setRecommend(true)}
                      style={{
                        flex: 1, padding: "18px 12px", borderRadius: 12, border: "none",
                        background: recommend === true ? "rgba(34,197,94,0.10)" : "rgba(2,8,23,0.03)",
                        border: recommend === true ? "2px solid #22C55E" : "2px solid rgba(2,8,23,0.08)",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        transition: "all 0.18s",
                        boxShadow: recommend === true ? "0 0 0 4px rgba(34,197,94,0.12)" : "none",
                      }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: recommend === true ? "rgba(34,197,94,0.15)" : "rgba(2,8,23,0.06)", display: "grid", placeItems: "center", transition: "all 0.18s" }}>
                        <ThumbsUp size={22} style={{ color: recommend === true ? "#22C55E" : "rgba(9,25,37,0.40)" }} />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: recommend === true ? "#15803D" : "rgba(9,25,37,0.55)", fontFamily: "'Poppins',sans-serif" }}>Yes</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: recommend === true ? "#22C55E" : "rgba(9,25,37,0.40)", fontFamily: "'Poppins',sans-serif" }}>I recommend it</div>
                    </button>

                    {/* NO */}
                    <button
                      type="button"
                      onClick={() => setRecommend(false)}
                      style={{
                        flex: 1, padding: "18px 12px", borderRadius: 12,
                        background: recommend === false ? "rgba(239,68,68,0.08)" : "rgba(2,8,23,0.03)",
                        border: recommend === false ? "2px solid #EF4444" : "2px solid rgba(2,8,23,0.08)",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        transition: "all 0.18s",
                        boxShadow: recommend === false ? "0 0 0 4px rgba(239,68,68,0.10)" : "none",
                      }}
                    >
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: recommend === false ? "rgba(239,68,68,0.12)" : "rgba(2,8,23,0.06)", display: "grid", placeItems: "center", transition: "all 0.18s" }}>
                        <ThumbsDown size={22} style={{ color: recommend === false ? "#EF4444" : "rgba(9,25,37,0.40)" }} />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: recommend === false ? "#B91C1C" : "rgba(9,25,37,0.55)", fontFamily: "'Poppins',sans-serif" }}>No</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: recommend === false ? "#EF4444" : "rgba(9,25,37,0.40)", fontFamily: "'Poppins',sans-serif" }}>Not for me</div>
                    </button>
                  </div>
                  {errors.recommend && <div style={{ ...S.fieldError, marginTop: 8 }}><AlertCircle size={12} /> {errors.recommend}</div>}
                </div>

                {/* ── SECTION 5: Comment ── */}
                <div style={S.card}>
                  <div style={S.cardHdr}>
                    <div style={S.cardHdrIcon}><MessageSquare size={16} style={{ color: "#2EABFE" }} /></div>
                    <div>
                      <div style={S.cardHdrTitle}>Your Review</div>
                      <div style={S.cardHdrSub}>Share what you learned and how it helped you</div>
                    </div>
                  </div>
                  <div style={S.cardDivider} />
                  <div style={{ position: "relative" }}>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Tell future students about your experience. What did you learn? Was the content clear? How has it helped your career?"
                      maxLength={2000}
                      rows={6}
                      style={{
                        width: "100%", padding: "14px 16px", borderRadius: 10, resize: "vertical",
                        border: errors.comment ? "1.5px solid #EF4444" : "1px solid rgba(2,8,23,0.14)",
                        fontSize: 14, fontFamily: "'Poppins',sans-serif", fontWeight: 500,
                        color: "#091925", background: "rgba(2,8,23,0.02)", outline: "none",
                        lineHeight: 1.65, transition: "border-color 0.2s",
                        boxSizing: "border-box",
                      }}
                      className="textarea-focus"
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, alignItems: "center" }}>
                      {errors.comment
                        ? <div style={S.fieldError}><AlertCircle size={12} /> {errors.comment}</div>
                        : <div style={{ fontSize: 11, color: "rgba(9,25,37,0.40)", fontFamily: "'Poppins',sans-serif" }}>Minimum 20 characters</div>
                      }
                      <div style={{ fontSize: 11, color: comment.length > 1800 ? "#EF4444" : "rgba(9,25,37,0.40)", fontFamily: "'Poppins',sans-serif" }}>
                        {comment.length}/2000
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Submit button ── */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  style={{
                    width: "100%", padding: "16px", borderRadius: 12,
                    border: "none", background: saving ? "rgba(46,171,254,0.65)" : "#091925",
                    color: "#fff", fontSize: 16, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 10, transition: "all 0.2s",
                    boxShadow: "0 8px 24px rgba(9,25,37,0.20)",
                  }}
                >
                  {saving
                    ? <><Loader2 size={18} className="spin-icon" /> Submitting…</>
                    : <><Send size={16} /> Submit Review</>
                  }
                </button>

                {/* Moderation note */}
                <div style={S.moderationNote}>
                  <CheckCircle2 size={13} style={{ color: "#7FA8C4", flexShrink: 0 }} />
                  Reviews are moderated and will appear publicly after approval. Your email is never shown publicly.
                </div>
              </>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT — My Previous Reviews
          ══════════════════════════════════════════════════════════ */}
          <div style={S.reviewsCol}>
            <div style={S.reviewsHdr}>
              <Star size={15} style={{ color: "#F59E0B" }} />
              <span>My Reviews ({myReviews.length})</span>
            </div>

            {myReviews.length === 0 ? (
              <div style={S.noReviews}>No reviews submitted yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myReviews.map((r, i) => (
                  <div key={i} style={S.reviewCard}>
                    {/* Status pill */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#091925", fontFamily: "'Poppins',sans-serif", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                        {r.course_title}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, flexShrink: 0,
                        ...(r.status === "approved"
                          ? { color: "#15803D", background: "rgba(34,197,94,0.10)", border: "0.5px solid rgba(34,197,94,0.30)" }
                          : r.status === "rejected"
                            ? { color: "#B91C1C", background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.25)" }
                            : { color: "#92400E", background: "rgba(245,158,11,0.10)", border: "0.5px solid rgba(245,158,11,0.30)" }),
                        fontFamily: "'Poppins',sans-serif",
                      }}>
                        {r.status === "approved" ? "✓ Approved" : r.status === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                      </span>
                    </div>

                    {/* Stars */}
                    <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={13} style={{ color: s <= r.rating ? "#F59E0B" : "rgba(9,25,37,0.15)", fill: s <= r.rating ? "#F59E0B" : "none" }} />
                      ))}
                    </div>

                    {/* Comment preview */}
                    <div style={{ fontSize: 12, color: "rgba(9,25,37,0.65)", fontFamily: "'Poppins',sans-serif", lineHeight: 1.6, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      "{r.comment}"
                    </div>

                    {/* Recommend */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {r.would_recommend
                        ? <><ThumbsUp size={12} style={{ color: "#22C55E" }} /><span style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", fontFamily: "'Poppins',sans-serif" }}>Recommended</span></>
                        : <><ThumbsDown size={12} style={{ color: "#EF4444" }} /><span style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", fontFamily: "'Poppins',sans-serif" }}>Not recommended</span></>
                      }
                    </div>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => {
                        const course = courses.find(c => String(c.course_id) === String(r.course_id));
                        if (course) { setSelectedCourse(course); setSuccess(false); }
                      }}
                      style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: "#2EABFE", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'Poppins',sans-serif" }}
                    >
                      Edit review →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Poppins',sans-serif;background:#F0F4F8;}
.spin-icon{animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.textarea-focus:focus{border-color:#2EABFE !important;box-shadow:0 0 0 3px rgba(46,171,254,0.12);}
.star-active button:hover{transform:scale(1.2);}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  shell:              { maxWidth: 1100, margin: "0 auto", padding: "28px 18px 56px" },

  pageHdr:            { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  hdrLeft:            { flex: 1 },
  hdrKicker:          { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: "#2EABFE", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontFamily: "'Poppins',sans-serif" },
  hdrTitle:           { fontSize: 28, fontWeight: 900, color: "#091925", letterSpacing: "-0.4px", marginBottom: 6, fontFamily: "'Poppins',sans-serif" },
  hdrSub:             { fontSize: 14, fontWeight: 500, color: "rgba(9,25,37,0.55)", fontFamily: "'Poppins',sans-serif" },
  hdrBadge:           { display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.06)", fontSize: 13, fontWeight: 800, color: "rgba(9,25,37,0.80)", fontFamily: "'Poppins',sans-serif" },

  layout:             { display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" },
  formCol:            { display: "flex", flexDirection: "column", gap: 16 },
  reviewsCol:         { display: "flex", flexDirection: "column", gap: 12 },

  card:               { background: "#fff", borderRadius: 14, padding: "20px", boxShadow: "0 2px 12px rgba(9,25,37,0.07)", border: "1px solid rgba(2,8,23,0.06)" },
  cardHdr:            { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  cardHdrIcon:        { width: 36, height: 36, borderRadius: 9, background: "rgba(46,171,254,0.08)", border: "1px solid rgba(46,171,254,0.18)", display: "grid", placeItems: "center", flexShrink: 0 },
  cardHdrTitle:       { fontSize: 15, fontWeight: 800, color: "#091925", fontFamily: "'Poppins',sans-serif" },
  cardHdrSub:         { fontSize: 11, color: "rgba(9,25,37,0.50)", fontFamily: "'Poppins',sans-serif", marginTop: 2 },
  cardDivider:        { height: 0.5, background: "rgba(2,8,23,0.08)", margin: "0 0 16px" },

  infoRow:            { display: "flex", alignItems: "center", gap: 14 },
  avatarCircle:       { width: 44, height: 44, borderRadius: "50%", background: "#2EABFE", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 800, color: "#091925", fontFamily: "'Poppins',sans-serif", flexShrink: 0 },
  infoName:           { fontSize: 16, fontWeight: 800, color: "#091925", fontFamily: "'Poppins',sans-serif" },
  infoEmail:          { fontSize: 12, color: "rgba(9,25,37,0.55)", fontFamily: "'Poppins',sans-serif", marginTop: 3 },
  verifiedBadge:      { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", fontSize: 11, fontWeight: 800, color: "#15803D", fontFamily: "'Poppins',sans-serif", flexShrink: 0 },

  loadingRow:         { display: "flex", alignItems: "center", gap: 10, color: "rgba(9,25,37,0.55)", fontSize: 13, fontFamily: "'Poppins',sans-serif", padding: "16px 0" },
  emptyCoursesMsg:    { textAlign: "center", padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "rgba(9,25,37,0.50)", fontSize: 13, fontFamily: "'Poppins',sans-serif" },
  browseCTA:          { marginTop: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: "#091925", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Poppins',sans-serif" },

  fieldError:         { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "#B91C1C", fontFamily: "'Poppins',sans-serif" },
  errorBanner:        { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", color: "#B91C1C", fontSize: 13, fontWeight: 700, fontFamily: "'Poppins',sans-serif" },
  moderationNote:     { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "rgba(9,25,37,0.45)", fontFamily: "'Poppins',sans-serif", lineHeight: 1.6 },

  successCard:        { background: "#fff", borderRadius: 18, padding: "40px 32px", textAlign: "center", border: "1px solid rgba(34,197,94,0.20)", boxShadow: "0 8px 32px rgba(9,25,37,0.08)" },
  successIcon:        { marginBottom: 16 },
  successTitle:       { fontSize: 22, fontWeight: 900, color: "#091925", fontFamily: "'Poppins',sans-serif", marginBottom: 10 },
  successSub:         { fontSize: 14, color: "rgba(9,25,37,0.60)", fontFamily: "'Poppins',sans-serif", lineHeight: 1.7, maxWidth: 420, margin: "0 auto" },
  successBtnPrimary:  { padding: "12px 24px", borderRadius: 10, border: "none", background: "#091925", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Poppins',sans-serif" },
  successBtnSecondary:{ padding: "12px 24px", borderRadius: 10, border: "1px solid rgba(2,8,23,0.15)", background: "#fff", color: "rgba(9,25,37,0.70)", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Poppins',sans-serif" },

  reviewsHdr:         { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: "#091925", fontFamily: "'Poppins',sans-serif", marginBottom: 4 },
  noReviews:          { fontSize: 13, color: "rgba(9,25,37,0.45)", fontFamily: "'Poppins',sans-serif", padding: "20px 0" },
  reviewCard:         { background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 2px 8px rgba(9,25,37,0.05)" },
};

export default TestimonialPage;