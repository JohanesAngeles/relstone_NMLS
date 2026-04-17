import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Clock, MapPin, ShoppingCart,
  CheckCircle2, Hash, FileText, Layers, Tag, Globe,
  Star, User, MessageSquare, ThumbsUp,
} from "lucide-react";
import API from "../../api/axios";
import Layout from "../../components/Layout";
import InnerBreadcrumbs from "../../components/InnerBreadcrumbs";
import GlobalSearchBar from "../../components/GlobalSearchBar";

// ─── Instructor map keyed by course type ──────────────────────────
const INSTRUCTOR_MAP = {
  PE: { name: "Alicia Harper",  role: "Senior SAFE Act Instructor",   initials: "AH" },
  CE: { name: "Michael Grant",  role: "Continuing Education Faculty",  initials: "MG" },
};
const DEFAULT_INSTRUCTOR = { name: "Staff Instructor", role: "Course Instructor", initials: "SI" };

const CourseDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [course,       setCourse]       = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error,        setError]        = useState("");
  const [added,        setAdded]        = useState(false);

  // ── Fetch course ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/courses/${id}`);
        setCourse(res.data);
      } catch {
        setError("Course not found.");
      } finally {
        setLoadingCourse(false);
      }
    };
    load();
  }, [id]);

  // ── Fetch real testimonials for this course ─────────────────────
  useEffect(() => {
    if (!id) return;
    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        // First try by mongo _id, then by nmls_course_id
        // The testimonials endpoint accepts course_id as a query param
        const res = await API.get(`/testimonials`, {
          params: { course_id: id, limit: 10 },
        });
        const data = res.data;
        // Handle both { testimonials: [...] } and raw array
        setTestimonials(
          Array.isArray(data) ? data :
          Array.isArray(data.testimonials) ? data.testimonials : []
        );
      } catch {
        setTestimonials([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [id]);

  // ── Re-fetch testimonials once course is loaded (use course._id) ─
  useEffect(() => {
    if (!course?._id) return;
    const loadByMongoId = async () => {
      try {
        const res = await API.get(`/testimonials`, {
          params: { course_id: course._id, limit: 10 },
        });
        const data = res.data;
        setTestimonials(
          Array.isArray(data) ? data :
          Array.isArray(data.testimonials) ? data.testimonials : []
        );
      } catch {
        // keep whatever we already have
      } finally {
        setLoadingReviews(false);
      }
    };
    loadByMongoId();
  }, [course?._id]);

  const handleAddToCart = () => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!existing.find((c) => c._id === course._id)) {
      existing.push({ ...course, include_textbook: false });
      localStorage.setItem("cart", JSON.stringify(existing));
    }
    setAdded(true);
  };

  // ── Derived values ──────────────────────────────────────────────
  const type           = String(course?.type || "").toUpperCase();
  const isPE           = type === "PE";
  const isCE           = type === "CE";
  const typeColor      = isPE ? "var(--rs-blue)" : isCE ? "rgba(0,140,140,1)" : "rgba(11,18,32,0.7)";
  const typeBg         = isPE ? "rgba(46,171,254,0.10)" : isCE ? "rgba(0,180,180,0.10)" : "rgba(2,8,23,0.05)";
  const typeBorder     = isPE ? "rgba(46,171,254,0.22)" : isCE ? "rgba(0,180,180,0.20)" : "rgba(2,8,23,0.10)";
  const instructor     = INSTRUCTOR_MAP[type] ?? DEFAULT_INSTRUCTOR;

  // ── Average rating from real testimonials ───────────────────────
  const avgRating = testimonials.length > 0
    ? (testimonials.reduce((s, t) => s + (t.rating || 0), 0) / testimonials.length).toFixed(1)
    : null;

  // ── Loading / error states ──────────────────────────────────────
  if (loadingCourse) return (
    <Layout>
      <style>{css}</style>
      <div style={S.center}>
        <div className="cd-spinner" />
        <div style={S.loadingText}>Loading course…</div>
      </div>
    </Layout>
  );

  if (error || !course) return (
    <Layout>
      <style>{css}</style>
      <div style={S.center}>
        <div style={{ fontWeight: 900, color: "crimson" }}>{error || "Course not found."}</div>
        <button style={S.backBtn} onClick={() => navigate("/courses")} type="button">
          <ArrowLeft size={15} /> Back to Courses
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{css}</style>
      <div style={S.wrap}>

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <div style={S.breadcrumbBar}>
          <button style={S.backBtn} onClick={() => navigate("/courses")} type="button">
            <ArrowLeft size={15} /> Back to Courses
          </button>
          <div style={S.breadcrumb}>
            <span style={{ color: "rgba(11,18,32,0.45)", fontWeight: 700 }}>Courses</span>
            <span style={{ color: "rgba(11,18,32,0.30)" }}>/</span>
            <span style={{ fontWeight: 800, color: "rgba(11,18,32,0.82)" }}>{course.title}</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <GlobalSearchBar minWidth={320} />
          </div>
        </div>
        <div style={S.breadcrumbWrap}>
          <InnerBreadcrumbs />
        </div>

        {/* ── Hero card ──────────────────────────────────────────── */}
        <section style={S.hero}>
          <div style={S.heroBg} />
          <div style={S.heroInner}>
            <div style={S.heroTop}>
              <div style={S.heroLeft}>
                <div style={S.heroIcon}><BookOpen size={24} /></div>
                <div>
                  <div style={S.heroKicker}>Course Details</div>
                  <h1 style={S.heroTitle}>{course.title}</h1>
                  {course.description && <p style={S.heroDesc}>{course.description}</p>}
                  {/* Real rating summary */}
                  {avgRating && (
                    <div style={S.ratingRow}>
                      <StarRow rating={parseFloat(avgRating)} />
                      <span style={S.ratingNum}>{avgRating}</span>
                      <span style={S.ratingCount}>({testimonials.length} review{testimonials.length !== 1 ? "s" : ""})</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={S.heroRight}>
                <span style={{ ...S.typeBadge, color: typeColor, background: typeBg, border: `1px solid ${typeBorder}` }}>
                  {type || "—"}
                </span>
                {course.is_active
                  ? <span style={S.activeBadge}>Active</span>
                  : <span style={S.inactiveBadge}>Inactive</span>
                }
              </div>
            </div>

            <div style={S.kpiRow}>
              <KpiChip icon={<Hash size={14} />}     label="NMLS Course ID" value={course.nmls_course_id || "—"} />
              <KpiChip icon={<Clock size={14} />}    label="Credit Hours"   value={`${course.credit_hours} hrs`} />
              <KpiChip icon={<Tag size={14} />}      label="Course Type"    value={type || "—"} />
              <KpiChip icon={<FileText size={14} />} label="Price"          value={`$${Number(course.price || 0).toFixed(2)}`} />
              {course.has_textbook && (
                <KpiChip icon={<BookOpen size={14} />} label="Textbook" value={`+$${Number(course.textbook_price || 0).toFixed(2)}`} />
              )}
              {avgRating && (
                <KpiChip icon={<Star size={14} />} label="Avg Rating" value={`${avgRating} / 5`} />
              )}
            </div>
          </div>
        </section>

        {/* ── Body grid ──────────────────────────────────────────── */}
        <div style={S.bodyGrid}>

          {/* ── Left col ─────────────────────────────────────────── */}
          <div style={S.leftCol}>

            {/* Modules */}
            {Array.isArray(course.modules) && course.modules.length > 0 && (
              <div style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardIcon}><Layers size={16} /></div>
                  <div style={S.cardTitle}>Course Modules</div>
                  <span style={S.cardCount}>{course.modules.length}</span>
                </div>
                <div style={S.moduleList}>
                  {[...course.modules]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((m, i) => (
                      <div key={i} style={S.moduleRow}>
                        <div style={S.moduleNum}>{m.order ?? i + 1}</div>
                        <div style={S.moduleTitle}>{m.title || "Untitled Module"}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Approved States */}
            {Array.isArray(course.states_approved) && course.states_approved.length > 0 && (
              <div style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardIcon}><Globe size={16} /></div>
                  <div style={S.cardTitle}>Approved States</div>
                  <span style={S.cardCount}>{course.states_approved.length}</span>
                </div>
                <div style={S.statesGrid}>
                  {course.states_approved.map((s) => (
                    <span key={s} style={S.stateChip}><MapPin size={10} />{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardIcon}><User size={17} /></div>
                <div style={S.cardTitle}>Instructor</div>
              </div>
              <div style={S.instructorBlock}>
                <div style={S.instructorAvatar}>{instructor.initials}</div>
                <div>
                  <div style={S.instructorName}>{instructor.name}</div>
                  <div style={S.instructorRole}>{instructor.role}</div>
                </div>
              </div>
            </div>

            {/* ── Real Testimonials / Reviews ─────────────────────── */}
            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardIcon}><MessageSquare size={17} /></div>
                <div style={S.cardTitle}>Student Reviews</div>
                {testimonials.length > 0 && (
                  <span style={S.cardCount}>{testimonials.length}</span>
                )}
              </div>

              {loadingReviews ? (
                <div style={S.reviewsLoading}>
                  <div className="cd-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                  <span style={{ color: "rgba(11,18,32,0.45)", fontSize: 13, fontWeight: 600 }}>
                    Loading reviews…
                  </span>
                </div>
              ) : testimonials.length === 0 ? (
                <div style={S.noReviews}>
                  <MessageSquare size={28} style={{ color: "rgba(11,18,32,0.15)", marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, color: "rgba(11,18,32,0.40)", fontSize: 13 }}>
                    No reviews yet for this course.
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(11,18,32,0.30)", marginTop: 4 }}>
                    Be the first to leave a review after completing it!
                  </div>
                </div>
              ) : (
                <>
                  {/* Summary bar */}
                  {avgRating && (
                    <div style={S.reviewSummary}>
                      <div style={S.reviewSummaryScore}>{avgRating}</div>
                      <div>
                        <StarRow rating={parseFloat(avgRating)} size={16} />
                        <div style={{ fontSize: 12, color: "rgba(11,18,32,0.45)", fontWeight: 600, marginTop: 3 }}>
                          Based on {testimonials.length} verified review{testimonials.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={S.reviewsList}>
                    {testimonials.map((t, i) => (
                      <div key={t._id || i} style={S.reviewItem}>
                        <div style={S.reviewTop}>
                          {/* Avatar */}
                          <div style={S.reviewAvatar}>
                            {(t.name || "?")[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={S.reviewName}>{t.name || "Anonymous"}</div>
                            <StarRow rating={t.rating || 0} size={12} />
                          </div>
                          <div style={S.reviewDate}>
                            {t.createdAt
                              ? new Date(t.createdAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric",
                                })
                              : ""}
                          </div>
                        </div>
                        <div style={S.reviewText}>{t.comment}</div>
                        {t.would_recommend && (
                          <div style={S.recommendBadge}>
                            <ThumbsUp size={11} /> Would recommend
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Right col — purchase card ─────────────────────────── */}
          <div style={S.rightCol}>
            <div style={S.purchaseCard}>
              <div style={S.purchaseTop}>
                <div style={S.purchasePrice}>${Number(course.price || 0).toFixed(2)}</div>
                <div style={S.purchasePriceLabel}>Course price</div>
              </div>

              {course.has_textbook && (
                <div style={S.textbookRow}>
                  <div style={S.textbookInfo}>
                    <BookOpen size={14} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>Textbook available</div>
                      <div style={{ fontSize: 12, color: "rgba(11,18,32,0.55)", fontWeight: 600 }}>
                        Add for ${Number(course.textbook_price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={S.purchaseDivider} />

              <div style={S.purchaseMeta}>
                <PurchaseMeta icon={<Clock size={13} />}  label="Credit Hours" value={`${course.credit_hours} hrs`} />
                <PurchaseMeta icon={<Tag size={13} />}    label="Type"         value={type} />
                <PurchaseMeta icon={<Hash size={13} />}   label="NMLS ID"      value={course.nmls_course_id} />
                <PurchaseMeta icon={<Layers size={13} />} label="Modules"      value={course.modules?.length ?? 0} />
                {avgRating && (
                  <PurchaseMeta icon={<Star size={13} />} label="Rating" value={`${avgRating} / 5`} />
                )}
              </div>

              <div style={S.purchaseDivider} />

              {added ? (
                <div style={S.addedState}>
                  <CheckCircle2 size={17} /><span>Added to cart!</span>
                </div>
              ) : (
                <button style={S.addBtn} type="button" onClick={handleAddToCart}>
                  <ShoppingCart size={16} /><span>Add to Cart</span>
                </button>
              )}

              <button style={S.browseBtn} type="button" onClick={() => navigate("/courses")}>
                Browse more courses
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────── */
const StarRow = ({ rating, size = 13 }) => {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
      {"★".repeat(full).split("").map((_, i) => (
        <span key={`f${i}`} style={{ fontSize: size, color: "#F59E0B", lineHeight: 1 }}>★</span>
      ))}
      {half && <span style={{ fontSize: size, color: "#F59E0B", lineHeight: 1 }}>½</span>}
      {"★".repeat(empty).split("").map((_, i) => (
        <span key={`e${i}`} style={{ fontSize: size, color: "rgba(11,18,32,0.15)", lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
};

const KpiChip = ({ icon, label, value }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 9,
    padding: "9px 13px", borderRadius: 12,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
  }}>
    <div style={{ color: "rgba(255,255,255,0.7)", display: "flex" }}>{icon}</div>
    <div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 10, letterSpacing: "0.3px" }}>{label}</div>
      <div style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>{value}</div>
    </div>
  </div>
);

const PurchaseMeta = ({ icon, label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(11,18,32,0.55)", fontWeight: 700, fontSize: 12 }}>
      {icon}<span>{label}</span>
    </div>
    <div style={{ fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.84)" }}>{value}</div>
  </div>
);

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
:root{--rs-dark:#091925;--rs-blue:#2EABFE;--rs-grad:linear-gradient(110deg,#091925 0%,#0b2a3a 45%,#2EABFE 100%);}
.cd-spinner{width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:var(--rs-blue);animation:cdspin 1s linear infinite;}
@keyframes cdspin{to{transform:rotate(360deg);}}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  wrap:        { padding: "18px 24px 48px" },
  center:      { minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { color: "rgba(11,18,32,0.55)", fontWeight: 700, fontFamily: "'Poppins',sans-serif" },

  breadcrumbBar:  { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 },
  backBtn:        { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.75)", flexShrink: 0, fontFamily: "'Poppins',sans-serif" },
  breadcrumb:     { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: "'Poppins',sans-serif" },
  breadcrumbWrap: {},

  hero:      { position: "relative", borderRadius: 20, overflow: "hidden", background: "var(--rs-grad)", boxShadow: "0 18px 50px rgba(2,8,23,0.16)", marginBottom: 14 },
  heroBg:    { position: "absolute", inset: 0, background: "radial-gradient(900px 500px at 20% 25%,rgba(46,171,254,0.22),transparent 60%)", pointerEvents: "none" },
  heroInner: { position: "relative", padding: "22px 22px 18px" },
  heroTop:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 18 },
  heroLeft:  { display: "flex", gap: 14, alignItems: "flex-start", flex: 1, minWidth: 0 },
  heroIcon:  { width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.16)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0 },
  heroKicker:{ color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: 10, letterSpacing: "0.6px", marginBottom: 4, fontFamily: "'Poppins',sans-serif" },
  heroTitle: { color: "#fff", fontWeight: 900, fontSize: 20, letterSpacing: "-0.3px", margin: 0, lineHeight: 1.2, fontFamily: "'Poppins',sans-serif" },
  heroDesc:  { color: "rgba(255,255,255,0.70)", fontWeight: 500, fontSize: 13, margin: "7px 0 0", lineHeight: 1.6, fontFamily: "'Poppins',sans-serif" },
  heroRight: { display: "flex", gap: 8, flexShrink: 0 },
  typeBadge: { display: "inline-flex", alignItems: "center", padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 900 },
  activeBadge:   { display: "inline-flex", alignItems: "center", padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(22,163,74,1)", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" },
  inactiveBadge: { display: "inline-flex", alignItems: "center", padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(120,120,120,1)", background: "rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.12)" },
  kpiRow:    { display: "flex", gap: 9, flexWrap: "wrap" },
  ratingRow: { display: "flex", alignItems: "center", gap: 7, marginTop: 8 },
  ratingNum: { color: "#fff", fontWeight: 900, fontSize: 14 },
  ratingCount:{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600 },

  bodyGrid:  { display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "start" },
  leftCol:   { display: "grid", gap: 14 },
  rightCol:  { display: "grid", gap: 14 },

  card:      { borderRadius: 18, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 8px 24px rgba(2,8,23,0.07)", padding: 16 },
  cardHead:  { display: "flex", alignItems: "center", gap: 9, marginBottom: 13 },
  cardIcon:  { width: 34, height: 34, borderRadius: 10, background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.18)", display: "grid", placeItems: "center", color: "var(--rs-dark)", flexShrink: 0 },
  cardTitle: { fontWeight: 800, color: "rgba(11,18,32,0.86)", flex: 1, fontFamily: "'Poppins',sans-serif", fontSize: 14 },
  cardCount: { padding: "3px 9px", borderRadius: 999, background: "rgba(2,8,23,0.06)", border: "1px solid rgba(2,8,23,0.10)", fontSize: 11, fontWeight: 800, color: "rgba(11,18,32,0.65)" },

  moduleList:  { display: "grid", gap: 7 },
  moduleRow:   { display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.02)" },
  moduleNum:   { width: 26, height: 26, borderRadius: 8, background: "rgba(46,171,254,0.12)", border: "1px solid rgba(46,171,254,0.20)", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 11, color: "var(--rs-dark)", flexShrink: 0 },
  moduleTitle: { fontWeight: 700, color: "rgba(11,18,32,0.80)", fontSize: 13, lineHeight: 1.4, fontFamily: "'Poppins',sans-serif" },

  statesGrid: { display: "flex", flexWrap: "wrap", gap: 7 },
  stateChip:  { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 999, background: "rgba(46,171,254,0.08)", border: "1px solid rgba(46,171,254,0.18)", fontSize: 11, fontWeight: 800, color: "var(--rs-dark)", fontFamily: "'Poppins',sans-serif" },

  instructorBlock:  { display: "flex", alignItems: "center", gap: 12 },
  instructorAvatar: { width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 14, color: "#fff", background: "linear-gradient(140deg,#2EABFE,#00B4B4)", flexShrink: 0 },
  instructorName:   { fontWeight: 900, color: "rgba(11,18,32,0.85)", fontSize: 14 },
  instructorRole:   { marginTop: 2, fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.55)" },

  // Reviews
  reviewsLoading:  { display: "flex", alignItems: "center", gap: 10, padding: "16px 0" },
  noReviews:       { display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", textAlign: "center" },
  reviewSummary:   { display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, background: "rgba(46,171,254,0.05)", border: "1px solid rgba(46,171,254,0.12)", marginBottom: 14 },
  reviewSummaryScore: { fontWeight: 900, fontSize: 36, color: "rgba(11,18,32,0.85)", lineHeight: 1, fontFamily: "'Poppins',sans-serif" },
  reviewsList:     { display: "grid", gap: 10 },
  reviewItem:      { borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.02)", padding: "12px 14px" },
  reviewTop:       { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  reviewAvatar:    { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(140deg,#2EABFE,#6366F1)", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 12, color: "#fff", flexShrink: 0 },
  reviewName:      { fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.85)", marginBottom: 3 },
  reviewDate:      { fontSize: 11, color: "rgba(11,18,32,0.35)", fontWeight: 600, whiteSpace: "nowrap" },
  reviewText:      { fontSize: 13, lineHeight: 1.6, color: "rgba(11,18,32,0.67)", fontWeight: 500 },
  recommendBadge:  { display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, padding: "3px 10px", borderRadius: 999, background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.20)", fontSize: 11, fontWeight: 700, color: "rgba(22,163,74,1)" },

  purchaseCard:       { borderRadius: 18, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 12px 32px rgba(2,8,23,0.09)", padding: 18, display: "grid", gap: 13, position: "sticky", top: 20 },
  purchaseTop:        { textAlign: "center" },
  purchasePrice:      { fontWeight: 900, fontSize: 34, color: "rgba(11,18,32,0.90)", letterSpacing: "-0.5px", fontFamily: "'Poppins',sans-serif" },
  purchasePriceLabel: { fontSize: 12, fontWeight: 600, color: "rgba(11,18,32,0.50)", marginTop: 2, fontFamily: "'Poppins',sans-serif" },
  textbookRow:        { borderRadius: 12, background: "rgba(46,171,254,0.06)", border: "1px solid rgba(46,171,254,0.16)", padding: "10px 12px" },
  textbookInfo:       { display: "flex", alignItems: "center", gap: 10, color: "rgba(11,18,32,0.78)", fontFamily: "'Poppins',sans-serif" },
  purchaseDivider:    { borderTop: "0.5px solid rgba(2,8,23,0.07)" },
  purchaseMeta:       { display: "grid", gap: 9 },

  addBtn:     { width: "100%", height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 12, border: "none", background: "var(--rs-blue)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 14, boxShadow: "0 6px 20px rgba(46,171,254,0.28)", fontFamily: "'Poppins',sans-serif" },
  addedState: { height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 12, background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)", color: "rgba(0,140,140,1)", fontWeight: 900, fontSize: 14, fontFamily: "'Poppins',sans-serif" },
  browseBtn:  { width: "100%", height: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "rgba(11,18,32,0.70)", fontFamily: "'Poppins',sans-serif" },
};

export default CourseDetails;