import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Clock, MapPin, ShoppingCart,
  CheckCircle2, Hash, FileText, Layers, Tag, Globe,
} from "lucide-react";
import API from "../../api/axios";
import InnerBreadcrumbs from "../../components/InnerBreadcrumbs";
import GlobalSearchBar from "../../components/GlobalSearchBar";

const REVIEW_BANK = [
  { name: 'Sarah M.', text: 'Clear explanations and great pacing. I felt fully ready for testing.', rating: 5 },
  { name: 'James T.', text: 'The modules are practical and easy to follow while working full-time.', rating: 5 },
  { name: 'Maria L.', text: 'Best course experience I have used for NMLS requirements.', rating: 4 },
];

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [added, setAdded]   = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        setError("Course not found.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => {
    // Get existing cart from localStorage (set by Courses.jsx)
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!existing.find((c) => c._id === course._id)) {
      existing.push({ ...course, include_textbook: false });
      localStorage.setItem("cart", JSON.stringify(existing));
    }
    setAdded(true);
  };

  if (loading) return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.center}>
        <div className="cd-spinner" />
        <div style={{ marginTop: 12, color: "rgba(11,18,32,0.55)", fontWeight: 700 }}>Loading course…</div>
      </div>
    </div>
  );

  if (error || !course) return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.center}>
        <div style={{ fontWeight: 900, color: "crimson" }}>{error || "Course not found."}</div>
        <button style={S.backBtn} onClick={() => navigate("/courses")} type="button">
          <ArrowLeft size={16} /> Back to Courses
        </button>
      </div>
    </div>
  );

  const type      = String(course.type || "").toUpperCase();
  const isPE      = type === "PE";
  const isCE      = type === "CE";
  const typeColor = isPE ? "var(--rs-blue)" : isCE ? "rgba(0,140,140,1)" : "rgba(11,18,32,0.7)";
  const typeBg    = isPE ? "rgba(46,171,254,0.10)" : isCE ? "rgba(0,180,180,0.10)" : "rgba(2,8,23,0.05)";
  const typeBorder= isPE ? "rgba(46,171,254,0.22)" : isCE ? "rgba(0,180,180,0.20)" : "rgba(2,8,23,0.10)";
  const instructorName = isPE ? 'Alicia Harper' : 'Michael Grant';
  const instructorRole = isPE ? 'Senior SAFE Act Instructor' : 'Continuing Education Faculty';
  const reviews = REVIEW_BANK;

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* Top bar */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <button style={S.backBtn} onClick={() => navigate("/courses")} type="button">
            <ArrowLeft size={16} /><span>Back to Courses</span>
          </button>
          <div style={S.breadcrumb}>
            <span style={{ color: "rgba(11,18,32,0.45)", fontWeight: 700 }}>Courses</span>
            <span style={{ color: "rgba(11,18,32,0.30)" }}>/</span>
            <span style={{ fontWeight: 900, color: "rgba(11,18,32,0.82)" }}>{course.title}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <GlobalSearchBar minWidth={320} />
          </div>
        </div>
        <div style={S.breadcrumbWrap}>
          <InnerBreadcrumbs />
        </div>
      </header>

      <main style={S.shell}>

        {/* Hero card */}
        <section style={S.hero}>
          <div style={S.heroBg} />
          <div style={S.heroInner}>
            <div style={S.heroTop}>
              <div style={S.heroLeft}>
                <div style={S.heroIcon}><BookOpen size={26} /></div>
                <div>
                  <div style={S.heroKicker}>Course Details</div>
                  <h1 style={S.heroTitle}>{course.title}</h1>
                  {course.description && (
                    <p style={S.heroDesc}>{course.description}</p>
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

            {/* KPI row */}
            <div style={S.kpiRow}>
              <KpiChip icon={<Hash size={15} />}      label="NMLS Course ID" value={course.nmls_course_id || "—"} />
              <KpiChip icon={<Clock size={15} />}     label="Credit Hours"   value={`${course.credit_hours} hrs`} />
              <KpiChip icon={<Tag size={15} />}       label="Course Type"    value={type || "—"} />
              <KpiChip icon={<FileText size={15} />}  label="Price"          value={`$${Number(course.price || 0).toFixed(2)}`} />
              {course.has_textbook && (
                <KpiChip icon={<BookOpen size={15} />} label="Textbook" value={`+$${Number(course.textbook_price || 0).toFixed(2)}`} />
              )}
            </div>
          </div>
        </section>

        {/* Body grid */}
        <div style={S.bodyGrid}>

          {/* LEFT col */}
          <div style={S.leftCol}>

            {/* Modules */}
            {Array.isArray(course.modules) && course.modules.length > 0 && (
              <div style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardIcon}><Layers size={17} /></div>
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

            {/* States approved */}
            {Array.isArray(course.states_approved) && course.states_approved.length > 0 && (
              <div style={S.card}>
                <div style={S.cardHead}>
                  <div style={S.cardIcon}><Globe size={17} /></div>
                  <div style={S.cardTitle}>Approved States</div>
                  <span style={S.cardCount}>{course.states_approved.length}</span>
                </div>
                <div style={S.statesGrid}>
                  {course.states_approved.map((s) => (
                    <span key={s} style={S.stateChip}>
                      <MapPin size={11} />{s}
                    </span>
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

          {/* RIGHT col — purchase card */}
          <div style={S.rightCol}>
            <div style={S.purchaseCard}>
              <div style={S.purchaseTop}>
                <div style={S.purchasePrice}>${Number(course.price || 0).toFixed(2)}</div>
                <div style={S.purchasePriceLabel}>Course price</div>
              </div>

              {course.has_textbook && (
                <div style={S.textbookRow}>
                  <div style={S.textbookInfo}>
                    <BookOpen size={15} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 13 }}>Textbook available</div>
                      <div style={{ fontSize: 12, color: "rgba(11,18,32,0.55)", fontWeight: 700 }}>
                        Add for ${Number(course.textbook_price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={S.purchaseDivider} />

              <div style={S.purchaseMeta}>
                <PurchaseMeta icon={<Clock size={14} />}     label="Credit Hours" value={`${course.credit_hours} hrs`} />
                <PurchaseMeta icon={<Tag size={14} />}       label="Type"         value={type} />
                <PurchaseMeta icon={<Hash size={14} />}      label="NMLS ID"      value={course.nmls_course_id} />
                <PurchaseMeta icon={<Layers size={14} />}    label="Modules"      value={course.modules?.length ?? 0} />
              </div>

              <div style={S.purchaseDivider} />

              {added ? (
                <div style={S.addedState}>
                  <CheckCircle2 size={18} />
                  <span>Added to cart!</span>
                </div>
              ) : (
                <button style={S.addBtn} type="button" onClick={handleAddToCart}>
                  <ShoppingCart size={17} />
                  <span>Add to Cart</span>
                </button>
              )}

              <button style={S.browseBtn} type="button" onClick={() => navigate("/courses")}>
                Browse more courses
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────── */
const KpiChip = ({ icon, label, value }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 14px", borderRadius: 14,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
  }}>
    <div style={{ color: "rgba(255,255,255,0.7)", display: "flex" }}>{icon}</div>
    <div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 10, letterSpacing: "0.3px" }}>{label}</div>
      <div style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>{value}</div>
    </div>
  </div>
);

const PurchaseMeta = ({ icon, label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(11,18,32,0.55)", fontWeight: 700, fontSize: 13 }}>
      {icon}<span>{label}</span>
    </div>
    <div style={{ fontWeight: 900, fontSize: 13, color: "rgba(11,18,32,0.84)" }}>{value}</div>
  </div>
);

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root {
  --rs-dark:#091925; --rs-blue:#2EABFE;
  --rs-grad:linear-gradient(110deg,#091925 0%,#0b2a3a 45%,#2EABFE 100%);
  --rs-bg:#f6f7fb;
}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--rs-bg);color:rgba(11,18,32,0.92);}
.cd-spinner{width:36px;height:36px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:var(--rs-blue);animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:    { minHeight: "100vh", background: "var(--rs-bg)" },
  center:  { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 },

  topbar:  { position: "sticky", top: 0, zIndex: 20, background: "rgba(246,247,251,0.88)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(2,8,23,0.08)" },
  topbarInner: { maxWidth: 1180, margin: "0 auto", padding: "13px 18px", display: "flex", alignItems: "center", gap: 14 },
  breadcrumbWrap: { maxWidth: 1180, margin: "0 auto", padding: "0 18px 10px" },
  backBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 13, color: "rgba(11,18,32,0.82)", flexShrink: 0 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, minWidth: 0, overflow: "hidden" },

  shell:   { maxWidth: 1180, margin: "0 auto", padding: "18px 18px 40px" },

  hero:    { position: "relative", borderRadius: 24, overflow: "hidden", background: "var(--rs-grad)", boxShadow: "0 22px 60px rgba(2,8,23,0.16)", marginBottom: 14 },
  heroBg:  { position: "absolute", inset: 0, background: "radial-gradient(900px 500px at 20% 25%, rgba(46,171,254,0.22), transparent 60%)", pointerEvents: "none" },
  heroInner:{ position: "relative", padding: "24px 24px 20px" },
  heroTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 20 },
  heroLeft:{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1, minWidth: 0 },
  heroIcon:{ width: 56, height: 56, borderRadius: 18, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.16)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0 },
  heroKicker: { color: "rgba(255,255,255,0.65)", fontWeight: 800, fontSize: 11, letterSpacing: "0.6px", marginBottom: 5 },
  heroTitle:  { color: "#fff", fontWeight: 950, fontSize: 22, letterSpacing: "-0.3px", margin: 0, lineHeight: 1.2 },
  heroDesc:   { color: "rgba(255,255,255,0.72)", fontWeight: 600, fontSize: 14, margin: "8px 0 0", lineHeight: 1.6 },
  heroRight:  { display: "flex", gap: 8, flexShrink: 0 },
  typeBadge:  { display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 900 },
  activeBadge:  { display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 900, color: "rgba(22,163,74,1)", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" },
  inactiveBadge:{ display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 900, color: "rgba(120,120,120,1)", background: "rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.12)" },

  kpiRow:  { display: "flex", gap: 10, flexWrap: "wrap" },

  bodyGrid:{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14, alignItems: "start" },
  leftCol: { display: "grid", gap: 14 },
  rightCol:{ display: "grid", gap: 14 },

  card:    { borderRadius: 22, background: "rgba(255,255,255,0.88)", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 12px 32px rgba(2,8,23,0.08)", padding: 16 },
  cardHead:{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  cardIcon:{ width: 36, height: 36, borderRadius: 12, background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.18)", display: "grid", placeItems: "center", color: "var(--rs-dark)", flexShrink: 0 },
  cardTitle:{ fontWeight: 950, color: "rgba(11,18,32,0.86)", flex: 1 },
  cardCount:{ padding: "4px 10px", borderRadius: 999, background: "rgba(2,8,23,0.06)", border: "1px solid rgba(2,8,23,0.10)", fontSize: 12, fontWeight: 900, color: "rgba(11,18,32,0.65)" },

  moduleList:  { display: "grid", gap: 8 },
  moduleRow:   { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.02)" },
  moduleNum:   { width: 28, height: 28, borderRadius: 10, background: "rgba(46,171,254,0.12)", border: "1px solid rgba(46,171,254,0.20)", display: "grid", placeItems: "center", fontWeight: 950, fontSize: 12, color: "var(--rs-dark)", flexShrink: 0 },
  moduleTitle: { fontWeight: 750, color: "rgba(11,18,32,0.80)", fontSize: 13, lineHeight: 1.4 },

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

  purchaseCard:{ borderRadius: 22, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 16px 40px rgba(2,8,23,0.10)", padding: 18, display: "grid", gap: 14, position: "sticky", top: 76 },
  purchaseTop: { textAlign: "center" },
  purchasePrice:     { fontWeight: 950, fontSize: 36, color: "rgba(11,18,32,0.90)", letterSpacing: "-0.5px" },
  purchasePriceLabel:{ fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.50)", marginTop: 2 },
  textbookRow: { borderRadius: 14, background: "rgba(46,171,254,0.06)", border: "1px solid rgba(46,171,254,0.16)", padding: "10px 12px" },
  textbookInfo:{ display: "flex", alignItems: "center", gap: 10, color: "rgba(11,18,32,0.78)" },
  purchaseDivider: { borderTop: "1px solid rgba(2,8,23,0.07)" },
  purchaseMeta:{ display: "grid", gap: 10 },

  addBtn:  { width: "100%", height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, border: "none", background: "var(--rs-blue)", color: "#fff", cursor: "pointer", fontWeight: 950, fontSize: 15, boxShadow: "0 8px 24px rgba(46,171,254,0.28)" },
  addedState:{ height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)", color: "rgba(0,140,140,1)", fontWeight: 950, fontSize: 15 },
  browseBtn: { width: "100%", height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 14, color: "rgba(11,18,32,0.72)" },
};

export default CourseDetails;