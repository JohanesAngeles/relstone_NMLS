import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import logo from "../../assets/images/Left Side Logo.png";
import {
  ArrowLeft, Star, Check, X, Sparkles, Filter,
  Search, RefreshCw, ThumbsUp, ThumbsDown, Award,
  MessageSquare, Clock, ChevronDown,
} from "lucide-react";

/* ─── Helpers ────────────────────────────────────────────────────── */
const Stars = ({ rating, size = 14 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size}
        style={{ color: i <= rating ? "#F59E0B" : "rgba(2,8,23,0.15)",
          fill: i <= rating ? "#F59E0B" : "none" }} />
    ))}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.30)", color: "rgba(146,84,0,1)",   label: "Pending"  },
    approved: { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.30)",  color: "rgba(21,128,61,1)",  label: "Approved" },
    rejected: { bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.30)",  color: "rgba(185,28,28,1)",  label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px",
      borderRadius: 999, fontSize: 11, fontWeight: 900, letterSpacing: "0.3px",
      background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const t = String(type || "").toUpperCase();
  const isPE = t === "PE", isCE = t === "CE";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px",
      borderRadius: 999, fontSize: 11, fontWeight: 900,
      color:       isPE ? "#2EABFE" : isCE ? "rgba(0,140,140,1)" : "rgba(9,25,37,0.65)",
      background:  isPE ? "rgba(46,171,254,0.12)" : isCE ? "rgba(0,180,180,0.12)" : "rgba(2,8,23,0.06)",
      border:      `1px solid ${isPE ? "rgba(46,171,254,0.22)" : isCE ? "rgba(0,180,180,0.20)" : "rgba(2,8,23,0.10)"}`,
    }}>
      {t || "—"}
    </span>
  );
};

/* ─── Main component ─────────────────────────────────────────────── */
const TestimonialApproval = () => {
  const navigate = useNavigate();

  const [testimonials, setTestimonials] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search,       setSearch]       = useState("");
  const [acting,       setActing]       = useState({}); // id → true while saving
  const [toast,        setToast]        = useState(null);

  const load = async (status = statusFilter) => {
    setLoading(true);
    try {
      const params = status !== "all" ? `?status=${status}` : "";
      const res = await API.get(`/testimonials/admin/all${params}`);
      setTestimonials(res.data?.testimonials || []);
    } catch {
      setError("Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const act = async (id, update, successMsg) => {
    setActing(a => ({ ...a, [id]: true }));
    try {
      await API.put(`/testimonials/admin/${id}`, update);
      setTestimonials(prev => {
        // If we filtered by status and the new status doesn't match, remove it
        if (statusFilter !== "all" && update.status && update.status !== statusFilter) {
          return prev.filter(t => t._id !== id);
        }
        return prev.map(t => t._id === id ? { ...t, ...update } : t);
      });
      showToast(successMsg);
    } catch {
      showToast("Action failed. Try again.", "error");
    } finally {
      setActing(a => ({ ...a, [id]: false }));
    }
  };

  const approve  = (id) => act(id, { status: "approved" }, "✓ Testimonial approved");
  const reject   = (id) => act(id, { status: "rejected" }, "✗ Testimonial rejected");
  const feature  = (id, current) => act(id, { featured: !current }, current ? "Removed from featured" : "★ Marked as featured");
  const del      = async (id) => {
    if (!window.confirm("Delete this testimonial permanently?")) return;
    setActing(a => ({ ...a, [id]: true }));
    try {
      await API.delete(`/testimonials/admin/${id}`);
      setTestimonials(prev => prev.filter(t => t._id !== id));
      showToast("Testimonial deleted");
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setActing(a => ({ ...a, [id]: false }));
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return testimonials;
    const n = search.toLowerCase();
    return testimonials.filter(t =>
      String(t.name         || "").toLowerCase().includes(n) ||
      String(t.email        || "").toLowerCase().includes(n) ||
      String(t.course_title || "").toLowerCase().includes(n) ||
      String(t.comment      || "").toLowerCase().includes(n)
    );
  }, [testimonials, search]);

  // ── Counts for tab badges ──────────────────────────────────────────
  const counts = useMemo(() => ({
    pending:  testimonials.filter(t => t.status === "pending").length,
    approved: testimonials.filter(t => t.status === "approved").length,
    rejected: testimonials.filter(t => t.status === "rejected").length,
  }), [testimonials]);

  const tabs = [
    { key: "pending",  label: "Pending"  },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all",      label: "All"      },
  ];

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ ...S.toast, ...(toast.type === "error" ? S.toastError : {}) }}>
          {toast.msg}
        </div>
      )}

      {/* ── Top bar ── */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.brandLeft}>
            <img src={logo} alt="Relstone" style={S.brandLogo} />
            <div>
              <div style={S.brandTitle}>Testimonial Moderation</div>
              <div style={S.brandSub}>Review, approve, and feature student testimonials</div>
            </div>
          </div>
          <div style={S.topbarRight}>
            <button style={S.backBtn} onClick={() => navigate("/instructor/dashboard")} type="button">
              <ArrowLeft size={14} /> Dashboard
            </button>
            <button style={S.refreshBtn} onClick={() => load()} type="button">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <div style={S.shell}>

        {/* ── Stat strip ── */}
        <div style={S.statStrip}>
          <StatCard icon={<Clock size={18} />}       label="Pending Review" value={counts.pending}  color="#F59E0B" />
          <StatCard icon={<Check size={18} />}        label="Approved"       value={counts.approved} color="rgba(34,197,94,1)" />
          <StatCard icon={<X size={18} />}            label="Rejected"       value={counts.rejected} color="rgba(239,68,68,1)" />
          <StatCard icon={<Sparkles size={18} />}     label="Total Loaded"   value={testimonials.length} color="#2EABFE" />
        </div>

        {/* ── Main card ── */}
        <div style={S.card}>

          {/* Toolbar */}
          <div style={S.toolbar}>
            <div style={S.tabs}>
              {tabs.map(tab => (
                <button key={tab.key} type="button"
                  style={{ ...S.tab, ...(statusFilter === tab.key ? S.tabActive : {}) }}
                  onClick={() => setStatusFilter(tab.key)}>
                  {tab.label}
                  {tab.key !== "all" && counts[tab.key] > 0 && (
                    <span style={{ ...S.tabBadge, ...(statusFilter === tab.key ? S.tabBadgeActive : {}) }}>
                      {counts[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div style={S.searchWrap}>
              <Search size={14} style={{ color: "rgba(9,25,37,0.40)", flexShrink: 0 }} />
              <input style={S.searchInput} value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, course, comment…" />
              {search && (
                <button style={S.clearBtn} onClick={() => setSearch("")} type="button">✕</button>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={S.cardBody}>
            {loading ? (
              <div style={S.center}><div className="ta-spinner" /></div>
            ) : error ? (
              <div style={S.errorBox}>{error}</div>
            ) : filtered.length === 0 ? (
              <div style={S.emptyWrap}>
                <div style={S.emptyIcon}><MessageSquare size={22} /></div>
                <div style={S.emptyTitle}>
                  {search.trim() ? "No testimonials match your search" : `No ${statusFilter === "all" ? "" : statusFilter} testimonials`}
                </div>
                <div style={S.emptySub}>
                  {search.trim() ? "Try a different search term." : "They'll appear here once submitted."}
                </div>
              </div>
            ) : (
              <div style={S.grid}>
                {filtered.map(t => (
                  <TestimonialCard
                    key={t._id}
                    t={t}
                    busy={!!acting[t._id]}
                    onApprove={() => approve(t._id)}
                    onReject={() => reject(t._id)}
                    onFeature={() => feature(t._id, t.featured)}
                    onDelete={() => del(t._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Testimonial Card ───────────────────────────────────────────── */
const TestimonialCard = ({ t, busy, onApprove, onReject, onFeature, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const date = t.createdAt
    ? new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const isLong = (t.comment || "").length > 180;
  const displayComment = isLong && !expanded
    ? t.comment.slice(0, 180) + "…"
    : t.comment;

  return (
    <div style={{ ...S.tcard, ...(t.featured ? S.tcardFeatured : {}), ...(busy ? S.tcardBusy : {}) }}
      className="ta-card">

      {/* Featured ribbon */}
      {t.featured && (
        <div style={S.featuredRibbon}>
          <Sparkles size={11} /> Featured
        </div>
      )}

      {/* Header */}
      <div style={S.tcardHeader}>
        <div style={S.tcardAvatar}>{(t.name || "S")[0].toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.tcardName}>{t.name || "—"}</div>
          <div style={S.tcardEmail}>{t.email || "—"}</div>
        </div>
        <StatusBadge status={t.status} />
      </div>

      {/* Course + rating row */}
      <div style={S.tcardMeta}>
        <TypeBadge type={t.course_type} />
        <span style={S.tcardCourse}>{t.course_title || "—"}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Stars rating={t.rating} />
        <span style={S.tcardRating}>{t.rating}/5</span>
        {t.would_recommend && (
          <span style={S.recommendBadge}>
            <ThumbsUp size={10} /> Recommends
          </span>
        )}
        {t.would_recommend === false && (
          <span style={{ ...S.recommendBadge, ...S.noRecommendBadge }}>
            <ThumbsDown size={10} /> Doesn't recommend
          </span>
        )}
      </div>

      {/* Comment */}
      <div style={S.tcardComment}>
        "{displayComment}"
      </div>
      {isLong && (
        <button style={S.expandBtn} onClick={() => setExpanded(e => !e)} type="button">
          {expanded ? "Show less" : "Read more"} <ChevronDown size={12} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      )}

      {/* Date */}
      <div style={S.tcardDate}>Submitted {date}</div>

      {/* Actions */}
      <div style={S.tcardActions}>
        {t.status !== "approved" && (
          <button style={S.approveBtn} onClick={onApprove} disabled={busy} type="button">
            <Check size={13} /> Approve
          </button>
        )}
        {t.status !== "rejected" && (
          <button style={S.rejectBtn} onClick={onReject} disabled={busy} type="button">
            <X size={13} /> Reject
          </button>
        )}
        <button
          style={{ ...S.featureBtn, ...(t.featured ? S.featureBtnActive : {}) }}
          onClick={onFeature} disabled={busy} type="button">
          <Sparkles size={13} /> {t.featured ? "Unfeature" : "Feature"}
        </button>
        <button style={S.deleteBtn} onClick={onDelete} disabled={busy} type="button">
          <X size={13} />
        </button>
      </div>

      {busy && <div style={S.busyOverlay}><div className="ta-spinner" /></div>}
    </div>
  );
};

/* ─── Stat Card ──────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color }) => (
  <div style={S.statCard}>
    <div style={{ ...S.statIcon, color }}>{icon}</div>
    <div>
      <div style={{ ...S.statValue, color }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  </div>
);

/* ─── CSS ────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root {
  --rs-dark: #091925; --rs-blue: #2EABFE; --rs-teal: #00B4B4;
  --rs-bg: #f6f7fb; --rs-muted: rgba(11,18,32,0.55);
  --rs-border: rgba(2,8,23,0.09); --rs-shadow: 0 16px 42px rgba(2,8,23,0.09);
}
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: var(--rs-bg); }
.ta-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid rgba(2,8,23,0.10); border-top-color: var(--rs-teal); animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ta-card { transition: box-shadow 0.2s, transform 0.2s; }
.ta-card:hover { box-shadow: 0 16px 44px rgba(2,8,23,0.12) !important; transform: translateY(-2px); }
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:     { minHeight: "100vh", background: "var(--rs-bg)", fontFamily: "Inter, system-ui, sans-serif" },
  center:   { minHeight: 200, display: "grid", placeItems: "center" },

  // Toast
  toast:      { position: "fixed", bottom: 24, right: 24, zIndex: 999, padding: "12px 20px", borderRadius: 12, background: "rgba(21,128,61,0.95)", color: "#fff", fontWeight: 800, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", backdropFilter: "blur(8px)" },
  toastError: { background: "rgba(185,28,28,0.95)" },

  // Topbar
  topbar:      { background: "#fff", borderBottom: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 2px 12px rgba(2,8,23,0.05)" },
  topbarInner: { maxWidth: 1200, margin: "0 auto", padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  brandLeft:   { display: "flex", alignItems: "center", gap: 12 },
  brandLogo:   { height: 30, objectFit: "contain" },
  brandTitle:  { fontWeight: 900, fontSize: 15, color: "var(--rs-dark)", letterSpacing: "-0.2px" },
  brandSub:    { fontSize: 11, color: "var(--rs-muted)", marginTop: 2, fontWeight: 700 },
  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  backBtn:     { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(0,180,180,0.30)", background: "rgba(0,180,180,0.08)", color: "var(--rs-teal)", cursor: "pointer", fontWeight: 900, fontSize: 13 },
  refreshBtn:  { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.65)" },

  // Shell
  shell: { maxWidth: 1200, margin: "0 auto", padding: "20px 20px 48px" },

  // Stat strip
  statStrip: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 },
  statCard:  { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 18, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 4px 14px rgba(2,8,23,0.05)" },
  statIcon:  { width: 40, height: 40, borderRadius: 12, background: "rgba(2,8,23,0.04)", display: "grid", placeItems: "center", flexShrink: 0 },
  statValue: { fontWeight: 950, fontSize: 24, letterSpacing: "-0.4px", lineHeight: 1.1 },
  statLabel: { fontSize: 11, fontWeight: 700, color: "var(--rs-muted)", marginTop: 2 },

  // Main card
  card:     { borderRadius: 22, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "var(--rs-shadow)", overflow: "hidden" },
  toolbar:  { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 16px", borderBottom: "1px solid rgba(2,8,23,0.07)", flexWrap: "wrap" },
  tabs:     { display: "flex", gap: 6 },
  tab:      { padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.60)", display: "inline-flex", alignItems: "center", gap: 6 },
  tabActive:{ background: "#091925", color: "#fff", border: "1px solid #091925", boxShadow: "0 4px 12px rgba(9,25,37,0.18)" },
  tabBadge: { padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 900, background: "rgba(2,8,23,0.08)", color: "rgba(9,25,37,0.60)" },
  tabBadgeActive: { background: "rgba(255,255,255,0.18)", color: "#fff" },

  searchWrap:  { display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)", minWidth: 280 },
  searchInput: { border: "none", outline: "none", flex: 1, fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.82)", background: "transparent" },
  clearBtn:    { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--rs-muted)", padding: "0 2px" },

  cardBody: { padding: 16 },

  // Grid of cards
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },

  // Testimonial card
  tcard: {
    position: "relative", borderRadius: 18, border: "1px solid rgba(2,8,23,0.08)",
    background: "#fff", padding: 18, overflow: "hidden",
    boxShadow: "0 4px 16px rgba(2,8,23,0.06)",
  },
  tcardFeatured: { border: "1.5px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.02)" },
  tcardBusy:     { opacity: 0.65, pointerEvents: "none" },
  featuredRibbon:{ position: "absolute", top: 12, right: 12, display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.30)", color: "rgba(146,84,0,1)" },

  tcardHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  tcardAvatar: { width: 36, height: 36, borderRadius: "50%", background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--rs-teal)", fontWeight: 900, fontSize: 14, flexShrink: 0 },
  tcardName:   { fontWeight: 800, fontSize: 14, color: "rgba(11,18,32,0.88)", lineHeight: 1.2 },
  tcardEmail:  { fontSize: 11, color: "var(--rs-muted)", fontWeight: 600, marginTop: 2 },

  tcardMeta:   { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  tcardCourse: { fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.70)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 },
  tcardRating: { fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.55)" },

  recommendBadge:   { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.22)", color: "rgba(21,128,61,1)" },
  noRecommendBadge: { background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.22)", color: "rgba(185,28,28,1)" },

  tcardComment: { fontSize: 13, fontWeight: 500, color: "rgba(11,18,32,0.75)", lineHeight: 1.65, fontStyle: "italic", marginBottom: 4, padding: "10px 12px", borderRadius: 10, background: "rgba(2,8,23,0.025)", border: "1px solid rgba(2,8,23,0.06)" },
  expandBtn:    { background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#2EABFE", padding: "4px 0", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 4 },
  tcardDate:    { fontSize: 11, color: "var(--rs-muted)", fontWeight: 600, marginBottom: 14 },

  // Action buttons
  tcardActions: { display: "flex", gap: 7, flexWrap: "wrap" },
  approveBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "1px solid rgba(34,197,94,0.30)", background: "rgba(34,197,94,0.08)", color: "rgba(21,128,61,1)", cursor: "pointer", fontWeight: 800, fontSize: 12 },
  rejectBtn:  { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.30)", background: "rgba(239,68,68,0.08)", color: "rgba(185,28,28,1)", cursor: "pointer", fontWeight: 800, fontSize: 12 },
  featureBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "1px solid rgba(245,158,11,0.30)", background: "rgba(245,158,11,0.06)", color: "rgba(146,84,0,1)", cursor: "pointer", fontWeight: 800, fontSize: 12 },
  featureBtnActive: { background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.45)", color: "rgba(120,68,0,1)" },
  deleteBtn:  { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 9, border: "1px solid rgba(239,68,68,0.20)", background: "rgba(239,68,68,0.05)", color: "rgba(185,28,28,0.80)", cursor: "pointer", marginLeft: "auto" },

  // Busy overlay
  busyOverlay: { position: "absolute", inset: 0, borderRadius: 18, background: "rgba(255,255,255,0.70)", display: "grid", placeItems: "center", backdropFilter: "blur(2px)" },

  // Empty state
  emptyWrap:  { padding: "52px 24px", textAlign: "center" },
  emptyIcon:  { width: 52, height: 52, borderRadius: 18, background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.20)", display: "grid", placeItems: "center", color: "var(--rs-dark)", margin: "0 auto" },
  emptyTitle: { marginTop: 14, fontWeight: 950, fontSize: 16, color: "rgba(11,18,32,0.84)" },
  emptySub:   { marginTop: 6, fontSize: 13, color: "var(--rs-muted)", fontWeight: 700, lineHeight: 1.6 },

  // Error
  errorBox: { padding: "14px 18px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "rgba(185,28,28,1)", fontWeight: 700, fontSize: 13 },
};

export default TestimonialApproval;