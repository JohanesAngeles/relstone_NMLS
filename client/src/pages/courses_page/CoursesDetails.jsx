import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Clock, MapPin, ShoppingCart,
  CheckCircle2, Hash, FileText, Layers, Tag, Globe,
} from "lucide-react";
import API from "../../api/axios";
<<<<<<< HEAD
import InnerBreadcrumbs from "../../components/InnerBreadcrumbs";
import GlobalSearchBar from "../../components/GlobalSearchBar";

const REVIEW_BANK = [
  { name: 'Sarah M.', text: 'Clear explanations and great pacing. I felt fully ready for testing.', rating: 5 },
  { name: 'James T.', text: 'The modules are practical and easy to follow while working full-time.', rating: 5 },
  { name: 'Maria L.', text: 'Best course experience I have used for NMLS requirements.', rating: 4 },
];
=======
import Layout from "../../components/Layout";
>>>>>>> feat/matt

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course,   setCourse]  = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState("");
  const [added,    setAdded]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/courses/${id}`);
        setCourse(res.data);
      } catch { setError("Course not found."); }
      finally  { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAddToCart = () => {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!existing.find((c) => c._id === course._id)) {
      existing.push({ ...course, include_textbook: false });
      localStorage.setItem("cart", JSON.stringify(existing));
    }
    setAdded(true);
  };

  if (loading) return (
    <Layout>
      <style>{css}</style>
      <div style={S.center}><div className="cd-spinner" /><div style={S.loadingText}>Loading course…</div></div>
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

<<<<<<< HEAD
  const type      = String(course.type || "").toUpperCase();
  const isPE      = type === "PE";
  const isCE      = type === "CE";
  const typeColor = isPE ? "var(--rs-blue)" : isCE ? "rgba(0,140,140,1)" : "rgba(11,18,32,0.7)";
  const typeBg    = isPE ? "rgba(46,171,254,0.10)" : isCE ? "rgba(0,180,180,0.10)" : "rgba(2,8,23,0.05)";
  const typeBorder= isPE ? "rgba(46,171,254,0.22)" : isCE ? "rgba(0,180,180,0.20)" : "rgba(2,8,23,0.10)";
  const instructorName = isPE ? 'Alicia Harper' : 'Michael Grant';
  const instructorRole = isPE ? 'Senior SAFE Act Instructor' : 'Continuing Education Faculty';
  const reviews = REVIEW_BANK;
=======
  const type       = String(course.type || "").toUpperCase();
  const isPE       = type === "PE";
  const isCE       = type === "CE";
  const typeColor  = isPE ? "var(--rs-blue)" : isCE ? "rgba(0,140,140,1)" : "rgba(11,18,32,0.7)";
  const typeBg     = isPE ? "rgba(46,171,254,0.10)" : isCE ? "rgba(0,180,180,0.10)" : "rgba(2,8,23,0.05)";
  const typeBorder = isPE ? "rgba(46,171,254,0.22)" : isCE ? "rgba(0,180,180,0.20)" : "rgba(2,8,23,0.10)";
>>>>>>> feat/matt

  return (
    <Layout>
      <style>{css}</style>
      <div style={S.wrap}>

        {/* ── Breadcrumb ───────────────────────────────────────── */}
        <div style={S.breadcrumbBar}>
          <button style={S.backBtn} onClick={() => navigate("/courses")} type="button">
            <ArrowLeft size={15} /> Back to Courses
          </button>
          <div style={S.breadcrumb}>
            <span style={{ color: "rgba(11,18,32,0.45)", fontWeight: 700 }}>Courses</span>
            <span style={{ color: "rgba(11,18,32,0.30)" }}>/</span>
            <span style={{ fontWeight: 800, color: "rgba(11,18,32,0.82)" }}>{course.title}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <GlobalSearchBar minWidth={320} />
          </div>
        </div>
        <div style={S.breadcrumbWrap}>
          <InnerBreadcrumbs />
        </div>

        {/* ── Hero card ─────────────────────────────────────────── */}
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
                </div>
              </div>
              <div style={S.heroRight}>
                <span style={{ ...S.typeBadge, color: typeColor, background: typeBg, border: `1px solid ${typeBorder}` }}>{type || "—"}</span>
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
            </div>
          </div>
        </section>

        {/* ── Body grid ─────────────────────────────────────────── */}
        <div style={S.bodyGrid}>

          {/* Left col */}
          <div style={S.leftCol}>
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

            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardIcon}><BookOpen size={17} /></div>
                <div style={S.cardTitle}>Instructor</div>
              </div>
              <div style={S.instructorBlock}>
                <div style={S.instructorAvatar}>{instructorName.split(' ').map((part) => part[0]).join('')}</div>
                <div>
                  <div style={S.instructorName}>{instructorName}</div>
                  <div style={S.instructorRole}>{instructorRole}</div>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.cardHead}>
                <div style={S.cardIcon}><CheckCircle2 size={17} /></div>
                <div style={S.cardTitle}>Student Reviews</div>
              </div>
              <div style={S.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.name} style={S.reviewItem}>
                    <div style={S.reviewTop}>
                      <strong>{review.name}</strong>
                      <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <div style={S.reviewText}>{review.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col — purchase card */}
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

  breadcrumbBar:{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 },
  backBtn:      { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.75)", flexShrink: 0, fontFamily: "'Poppins',sans-serif" },
  breadcrumb:   { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontFamily: "'Poppins',sans-serif" },

  hero:     { position: "relative", borderRadius: 20, overflow: "hidden", background: "var(--rs-grad)", boxShadow: "0 18px 50px rgba(2,8,23,0.16)", marginBottom: 14 },
  heroBg:   { position: "absolute", inset: 0, background: "radial-gradient(900px 500px at 20% 25%,rgba(46,171,254,0.22),transparent 60%)", pointerEvents: "none" },
  heroInner:{ position: "relative", padding: "22px 22px 18px" },
  heroTop:  { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 18 },
  heroLeft: { display: "flex", gap: 14, alignItems: "flex-start", flex: 1, minWidth: 0 },
  heroIcon: { width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.16)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0 },
  heroKicker: { color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: 10, letterSpacing: "0.6px", marginBottom: 4, fontFamily: "'Poppins',sans-serif" },
  heroTitle:  { color: "#fff", fontWeight: 900, fontSize: 20, letterSpacing: "-0.3px", margin: 0, lineHeight: 1.2, fontFamily: "'Poppins',sans-serif" },
  heroDesc:   { color: "rgba(255,255,255,0.70)", fontWeight: 500, fontSize: 13, margin: "7px 0 0", lineHeight: 1.6, fontFamily: "'Poppins',sans-serif" },
  heroRight:  { display: "flex", gap: 8, flexShrink: 0 },
  typeBadge:  { display: "inline-flex", alignItems: "center", padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 900 },
  activeBadge:  { display: "inline-flex", alignItems: "center", padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(22,163,74,1)", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" },
  inactiveBadge:{ display: "inline-flex", alignItems: "center", padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(120,120,120,1)", background: "rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.12)" },
  kpiRow:   { display: "flex", gap: 9, flexWrap: "wrap" },

  bodyGrid: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "start" },
  leftCol:  { display: "grid", gap: 14 },
  rightCol: { display: "grid", gap: 14 },

  card:      { borderRadius: 18, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 8px 24px rgba(2,8,23,0.07)", padding: 16 },
  cardHead:  { display: "flex", alignItems: "center", gap: 9, marginBottom: 13 },
  cardIcon:  { width: 34, height: 34, borderRadius: 10, background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.18)", display: "grid", placeItems: "center", color: "var(--rs-dark)", flexShrink: 0 },
  cardTitle: { fontWeight: 800, color: "rgba(11,18,32,0.86)", flex: 1, fontFamily: "'Poppins',sans-serif", fontSize: 14 },
  cardCount: { padding: "3px 9px", borderRadius: 999, background: "rgba(2,8,23,0.06)", border: "1px solid rgba(2,8,23,0.10)", fontSize: 11, fontWeight: 800, color: "rgba(11,18,32,0.65)" },

  moduleList:  { display: "grid", gap: 7 },
  moduleRow:   { display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.02)" },
  moduleNum:   { width: 26, height: 26, borderRadius: 8, background: "rgba(46,171,254,0.12)", border: "1px solid rgba(46,171,254,0.20)", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 11, color: "var(--rs-dark)", flexShrink: 0 },
  moduleTitle: { fontWeight: 700, color: "rgba(11,18,32,0.80)", fontSize: 13, lineHeight: 1.4, fontFamily: "'Poppins',sans-serif" },

  statesGrid:  { display: "flex", flexWrap: "wrap", gap: 7 },
  stateChip:   { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 999, background: "rgba(46,171,254,0.08)", border: "1px solid rgba(46,171,254,0.18)", fontSize: 11, fontWeight: 800, color: "var(--rs-dark)", fontFamily: "'Poppins',sans-serif" },

<<<<<<< HEAD
  statesGrid:  { display: "flex", flexWrap: "wrap", gap: 8 },
  stateChip:   { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, background: "rgba(46,171,254,0.08)", border: "1px solid rgba(46,171,254,0.18)", fontSize: 12, fontWeight: 900, color: "var(--rs-dark)" },
  instructorBlock: { display: "flex", alignItems: "center", gap: 12 },
  instructorAvatar: { width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 13, color: "#fff", background: "linear-gradient(140deg,#2EABFE,#00B4B4)" },
  instructorName: { fontWeight: 900, color: "rgba(11,18,32,0.85)" },
  instructorRole: { marginTop: 2, fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.55)" },
  reviewsList: { display: "grid", gap: 10 },
  reviewItem: { borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.02)", padding: "10px 12px" },
  reviewTop: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(11,18,32,0.8)", fontSize: 13 },
  reviewText: { marginTop: 6, fontSize: 13, lineHeight: 1.5, color: "rgba(11,18,32,0.67)", fontWeight: 650 },
=======
  purchaseCard:      { borderRadius: 18, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 12px 32px rgba(2,8,23,0.09)", padding: 18, display: "grid", gap: 13, position: "sticky", top: 20 },
  purchaseTop:       { textAlign: "center" },
  purchasePrice:     { fontWeight: 900, fontSize: 34, color: "rgba(11,18,32,0.90)", letterSpacing: "-0.5px", fontFamily: "'Poppins',sans-serif" },
  purchasePriceLabel:{ fontSize: 12, fontWeight: 600, color: "rgba(11,18,32,0.50)", marginTop: 2, fontFamily: "'Poppins',sans-serif" },
  textbookRow:  { borderRadius: 12, background: "rgba(46,171,254,0.06)", border: "1px solid rgba(46,171,254,0.16)", padding: "10px 12px" },
  textbookInfo: { display: "flex", alignItems: "center", gap: 10, color: "rgba(11,18,32,0.78)", fontFamily: "'Poppins',sans-serif" },
  purchaseDivider: { borderTop: "0.5px solid rgba(2,8,23,0.07)" },
  purchaseMeta:    { display: "grid", gap: 9 },
>>>>>>> feat/matt

  addBtn:    { width: "100%", height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 12, border: "none", background: "var(--rs-blue)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 14, boxShadow: "0 6px 20px rgba(46,171,254,0.28)", fontFamily: "'Poppins',sans-serif" },
  addedState:{ height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, borderRadius: 12, background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)", color: "rgba(0,140,140,1)", fontWeight: 900, fontSize: 14, fontFamily: "'Poppins',sans-serif" },
  browseBtn: { width: "100%", height: 42, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "rgba(11,18,32,0.70)", fontFamily: "'Poppins',sans-serif" },
};

export default CourseDetails;