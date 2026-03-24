import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, Send, X, CheckCircle2, AlertCircle, Loader2, Award } from "lucide-react";
import API from "../api/axios";

/**
 * TestimonialGateModal
 *
 * Shows as a full-screen overlay when a student tries to view their
 * certificate without having submitted a testimonial first.
 *
 * Props:
 *   courseId    — MongoDB course _id
 *   courseName  — display name of the course
 *   onDone      — called after submission OR if already reviewed (proceed to cert)
 *   onSkip      — called if user explicitly dismisses (optional, hides skip if omitted)
 */
const TestimonialGateModal = ({ courseId, courseName, onDone, onSkip }) => {
  const [step,        setStep]        = useState("loading"); // loading | form | success | already
  const [rating,      setRating]      = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment,     setComment]     = useState("");
  const [recommend,   setRecommend]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});
  const [apiError,    setApiError]    = useState("");

  /* ── Check if already submitted ────────────────────────────── */
  useEffect(() => {
    API.get("/testimonials/mine")
      .then(res => {
        const reviews = res.data?.testimonials || [];
        const already = reviews.some(r => String(r.course_id) === String(courseId));
        setStep(already ? "already" : "form");
      })
      .catch(() => setStep("form")); // fail open — show form anyway
  }, [courseId]);

  /* ── If already reviewed, auto-proceed after brief delay ────── */
  useEffect(() => {
    if (step === "already") {
      const t = setTimeout(() => onDone(), 1800);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  /* ── Validate ───────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (rating === 0)               e.rating    = "Please give a star rating.";
    if (!comment.trim())            e.comment   = "Please write a short comment.";
    if (comment.trim().length < 20) e.comment   = "Comment must be at least 20 characters.";
    if (recommend === null)         e.recommend = "Please select yes or no.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      await API.post("/testimonials", {
        course_id:       courseId,
        rating,
        comment:         comment.trim(),
        would_recommend: recommend,
      });
      setStep("success");
      setTimeout(() => onDone(), 2200);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Could not submit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const starLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating] || "Click to rate";

  return (
    <>
      {/* Backdrop */}
      <div style={S.backdrop} />

      {/* Modal */}
      <div style={S.modal}>

        {/* ── Loading ── */}
        {step === "loading" && (
          <div style={S.center}>
            <div style={S.spinnerWrap}><Loader2 size={28} style={{ animation: "tg-spin 1s linear infinite", color: "#2EABFE" }} /></div>
            <div style={S.loadingText}>Checking your review status…</div>
          </div>
        )}

        {/* ── Already reviewed ── */}
        {step === "already" && (
          <div style={S.center}>
            <div style={S.alreadyIcon}><CheckCircle2 size={40} style={{ color: "#22C55E" }} /></div>
            <div style={S.alreadyTitle}>Review Already Submitted ✓</div>
            <div style={S.alreadySub}>Taking you to your certificate…</div>
            <div style={S.progressBar}><div style={S.progressFill} /></div>
          </div>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <div style={S.center}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🎉</div>
            <div style={S.successTitle}>Thank you for your review!</div>
            <div style={S.successSub}>Your feedback helps future students. Taking you to your certificate now…</div>
            <div style={S.progressBar}><div style={S.progressFill} /></div>
          </div>
        )}

        {/* ── Form ── */}
        {step === "form" && (
          <>
            {/* Header */}
            <div style={S.header}>
              <div style={S.headerLeft}>
                <div style={S.headerIcon}><Award size={18} style={{ color: "#F59E0B" }} /></div>
                <div>
                  <div style={S.headerTitle}>One last step before your certificate</div>
                  <div style={S.headerSub}>Share your experience to unlock your certificate</div>
                </div>
              </div>
              {onSkip && (
                <button style={S.skipBtn} onClick={onSkip} type="button" title="Skip for now">
                  <X size={15} /> Skip
                </button>
              )}
            </div>

            {/* Course chip */}
            <div style={S.courseChip}>
              <div style={S.courseChipDot} />
              <span style={S.courseChipText}>{courseName}</span>
            </div>

            <div style={S.body}>

              {/* API error */}
              {apiError && (
                <div style={S.apiError}>
                  <AlertCircle size={14} /> {apiError}
                </div>
              )}

              {/* ── Star Rating ── */}
              <div style={S.section}>
                <div style={S.sectionLabel}>Overall Rating <span style={S.required}>*</span></div>
                <div style={S.starsRow}>
                  {[1,2,3,4,5].map(star => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button key={star} type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        style={S.starBtn}>
                        <Star size={32} style={{
                          color:     active ? "#F59E0B" : "rgba(9,25,37,0.18)",
                          fill:      active ? "#F59E0B" : "none",
                          transform: active ? "scale(1.18)" : "scale(1)",
                          transition: "all 0.14s",
                        }} />
                      </button>
                    );
                  })}
                  <span style={{ fontSize: 13, fontWeight: 700, color: rating > 0 ? "#F59E0B" : "rgba(9,25,37,0.35)", marginLeft: 10 }}>
                    {starLabel}
                  </span>
                </div>
                {errors.rating && <div style={S.fieldErr}><AlertCircle size={11} /> {errors.rating}</div>}
              </div>

              {/* ── Recommend ── */}
              <div style={S.section}>
                <div style={S.sectionLabel}>Would you recommend this course? <span style={S.required}>*</span></div>
                <div style={S.recommendRow}>
                  <button type="button" onClick={() => setRecommend(true)}
                    style={{ ...S.recommendBtn, ...(recommend === true ? S.recommendBtnYes : {}) }}>
                    <ThumbsUp size={18} style={{ color: recommend === true ? "#22C55E" : "rgba(9,25,37,0.40)" }} />
                    <span>Yes, recommend it</span>
                  </button>
                  <button type="button" onClick={() => setRecommend(false)}
                    style={{ ...S.recommendBtn, ...(recommend === false ? S.recommendBtnNo : {}) }}>
                    <ThumbsDown size={18} style={{ color: recommend === false ? "#EF4444" : "rgba(9,25,37,0.40)" }} />
                    <span>Not for me</span>
                  </button>
                </div>
                {errors.recommend && <div style={S.fieldErr}><AlertCircle size={11} /> {errors.recommend}</div>}
              </div>

              {/* ── Comment ── */}
              <div style={S.section}>
                <div style={S.sectionLabel}>
                  Your Review <span style={S.required}>*</span>
                  <span style={S.charCount}>{comment.length}/2000</span>
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="What did you think of the course? Was the content clear and useful? How has it helped your career?"
                  style={{ ...S.textarea, ...(errors.comment ? S.textareaErr : {}) }}
                />
                {errors.comment
                  ? <div style={S.fieldErr}><AlertCircle size={11} /> {errors.comment}</div>
                  : <div style={S.hint}>Minimum 20 characters</div>
                }
              </div>

              {/* ── Submit ── */}
              <button type="button" onClick={handleSubmit} disabled={saving} style={{ ...S.submitBtn, ...(saving ? S.submitBtnDisabled : {}) }}>
                {saving
                  ? <><Loader2 size={16} style={{ animation: "tg-spin 1s linear infinite" }} /> Submitting…</>
                  : <><Send size={15} /> Submit & Get My Certificate</>
                }
              </button>

              <div style={S.note}>
                <CheckCircle2 size={12} style={{ color: "#7FA8C4", flexShrink: 0 }} />
                Reviews are moderated and may appear publicly after approval. Your email is never shown.
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes tg-spin { to { transform: rotate(360deg); } }
        @keyframes tg-prog { from { width: 0% } to { width: 100% } }
      `}</style>
    </>
  );
};

const S = {
  backdrop: {
    position: "fixed", inset: 0, zIndex: 400,
    background: "rgba(9,25,37,0.75)", backdropFilter: "blur(8px)",
  },
  modal: {
    position: "fixed", zIndex: 401,
    top: "50%", left: "50%", transform: "translate(-50%,-50%)",
    width: "100%", maxWidth: 540, maxHeight: "90vh",
    background: "#fff", borderRadius: 22, overflow: "hidden",
    boxShadow: "0 40px 100px rgba(9,25,37,0.30)",
    display: "flex", flexDirection: "column",
    fontFamily: "'Poppins', system-ui, sans-serif",
  },
  center: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "52px 32px", gap: 12, textAlign: "center",
  },
  spinnerWrap:  { marginBottom: 8 },
  loadingText:  { fontSize: 14, fontWeight: 600, color: "rgba(9,25,37,0.55)" },
  alreadyIcon:  { marginBottom: 6 },
  alreadyTitle: { fontSize: 20, fontWeight: 900, color: "#091925" },
  alreadySub:   { fontSize: 13, fontWeight: 600, color: "rgba(9,25,37,0.55)" },
  successTitle: { fontSize: 20, fontWeight: 900, color: "#091925" },
  successSub:   { fontSize: 13, fontWeight: 600, color: "rgba(9,25,37,0.55)", maxWidth: 340 },
  progressBar:  { width: "100%", height: 4, borderRadius: 999, background: "rgba(46,171,254,0.15)", overflow: "hidden", marginTop: 20 },
  progressFill: { height: "100%", borderRadius: 999, background: "#2EABFE", animation: "tg-prog 1.8s linear forwards" },

  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 22px 14px",
    background: "linear-gradient(135deg,#091925 0%,#0d2a3a 100%)",
    borderBottom: "1px solid rgba(46,171,254,0.15)",
  },
  headerLeft:  { display: "flex", alignItems: "center", gap: 12 },
  headerIcon:  {
    width: 42, height: 42, borderRadius: 14, flexShrink: 0,
    background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.30)",
    display: "grid", placeItems: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 3 },
  headerSub:   { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)" },
  skipBtn: {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "7px 12px", borderRadius: 9, cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 700,
    fontFamily: "inherit",
  },
  courseChip: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 22px",
    background: "rgba(46,171,254,0.06)", borderBottom: "1px solid rgba(46,171,254,0.12)",
  },
  courseChipDot:  { width: 7, height: 7, borderRadius: "50%", background: "#2EABFE", flexShrink: 0 },
  courseChipText: { fontSize: 12, fontWeight: 700, color: "#2EABFE", lineHeight: 1.4 },

  body: {
    overflowY: "auto", padding: "18px 22px 22px",
    display: "flex", flexDirection: "column", gap: 18,
  },
  apiError: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px", borderRadius: 10,
    background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)",
    color: "#B91C1C", fontSize: 13, fontWeight: 700,
  },
  section:      { display: "flex", flexDirection: "column", gap: 8 },
  sectionLabel: { fontSize: 12, fontWeight: 800, color: "rgba(9,25,37,0.70)", display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.04em" },
  required:     { color: "#EF4444", fontWeight: 900 },
  charCount:    { marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "rgba(9,25,37,0.35)", textTransform: "none", letterSpacing: 0 },

  starsRow: { display: "flex", alignItems: "center", gap: 2 },
  starBtn: { background: "none", border: "none", cursor: "pointer", padding: 3 },

  recommendRow: { display: "flex", gap: 10 },
  recommendBtn: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "12px 10px", borderRadius: 10, cursor: "pointer",
    border: "1.5px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)",
    fontSize: 13, fontWeight: 700, color: "rgba(9,25,37,0.70)",
    fontFamily: "inherit", transition: "all 0.15s",
  },
  recommendBtnYes: {
    border: "1.5px solid #22C55E", background: "rgba(34,197,94,0.08)",
    color: "#15803D", boxShadow: "0 0 0 3px rgba(34,197,94,0.12)",
  },
  recommendBtnNo: {
    border: "1.5px solid #EF4444", background: "rgba(239,68,68,0.07)",
    color: "#B91C1C", boxShadow: "0 0 0 3px rgba(239,68,68,0.10)",
  },

  textarea: {
    width: "100%", padding: "12px 14px", borderRadius: 10, resize: "vertical",
    border: "1.5px solid rgba(2,8,23,0.12)", fontSize: 13, lineHeight: 1.65,
    fontFamily: "inherit", fontWeight: 500, color: "#091925",
    background: "rgba(2,8,23,0.02)", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.18s",
  },
  textareaErr: { border: "1.5px solid #EF4444" },
  fieldErr: {
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 11, fontWeight: 700, color: "#B91C1C",
  },
  hint: { fontSize: 11, color: "rgba(9,25,37,0.38)", fontWeight: 600 },

  submitBtn: {
    width: "100%", padding: "14px", borderRadius: 12, border: "none",
    background: "#091925", color: "#fff", fontSize: 15, fontWeight: 800,
    cursor: "pointer", fontFamily: "inherit",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
    boxShadow: "0 8px 24px rgba(9,25,37,0.20)", transition: "all 0.18s",
  },
  submitBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },

  note: {
    display: "flex", alignItems: "flex-start", gap: 7,
    fontSize: 11, color: "rgba(9,25,37,0.42)", lineHeight: 1.6, fontWeight: 600,
  },
};

export default TestimonialGateModal;