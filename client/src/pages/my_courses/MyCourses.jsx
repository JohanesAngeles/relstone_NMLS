import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios.js";
import Layout from "../../components/Layout.jsx";
import {
  BookOpen, Clock, CheckCircle, PlayCircle, Award,
  ChevronRight, Heart, Filter, Search, Eye, MessageSquare,
} from "lucide-react";

/* ─── MyCourses ──────────────────────────────────────────────────── */
const MyCourses = () => {
  const navigate = useNavigate();

  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [activeTab, setActiveTab]     = useState("inprogress");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [search, setSearch]           = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [myReviews,   setMyReviews]   = useState([]);   // student's submitted testimonials

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, transcriptRes, reviewsRes] = await Promise.all([
          API.get("/dashboard"),
          API.get("/dashboard/transcript"),
          API.get("/testimonials/mine").catch(() => ({ data: { testimonials: [] } })),
        ]);
        setData({ dashboard: dashRes.data, transcript: transcriptRes.data });
        setMyReviews(reviewsRes.data?.testimonials || []);
      } catch { setError("Failed to load courses"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const { inProgress, completed, allStates, allTypes } = useMemo(() => {
    if (!data) return { inProgress: [], completed: [], allStates: [], allTypes: [] };

    const available  = data.dashboard?.available_courses || [];
    const orders     = data.dashboard?.orders || [];
    const transcript = data.transcript?.transcript || [];

    // ── Completed courses from transcript ──
    const completedCourses = transcript.map((t) => {
      const courseObj = t.course_id || {};
      const courseId  = courseObj?._id || courseObj || t._id;
      return {
        id:              courseId,
        title:           t.course_title || courseObj?.title || "—",
        type:            t.type         || courseObj?.type,
        credit_hours:    t.credit_hours || courseObj?.credit_hours,
        nmls_id:         t.nmls_course_id,
        completed_at:    t.completed_at,
        certificate_course_id: courseObj?._id || courseId,
        state:           t.state || "Federal",
        progress:        100,
        status:          "completed",
      };
    });
const paidCourseIds = new Set(
  orders
    .filter(o => ["paid", "completed"].includes(String(o.status).toLowerCase()))
    .flatMap(o => (o.items || []).map(i => String(i.course_id?._id || i.course_id)))
);
    // ── In-progress courses ──
    const inProgressCourses = available
  .filter((c) => !c.already_completed && paidCourseIds.has(String(c.course_id)))
  .map((c) => {
        const order = orders.find((o) =>
          (o.items || []).some((i) => String(i.course_id?._id) === String(c.course_id))
        );
        const completedCount = Number.isFinite(c.completed_steps) ? c.completed_steps : 0;
        const totalSteps     = Number.isFinite(c.total_steps) ? c.total_steps : 0;
        const progress       = Number.isFinite(c.progress) ? c.progress : 0;
        return {
          id:            c.course_id,
          title:         c.title,
          type:          c.type,
          credit_hours:  c.credit_hours,
          state:         c.state || "Federal",
          progress,
          completedSteps: completedCount,
          totalSteps,
          last_accessed: order?.updatedAt || order?.createdAt || null,
          status:        "inprogress",
        };
      });

    const allStates = [...new Set([
      ...completedCourses.map((c) => c.state),
      ...inProgressCourses.map((c) => c.state),
    ])].filter(Boolean);

    const allTypes = [...new Set([
      ...completedCourses.map((c) => c.type),
      ...inProgressCourses.map((c) => c.type),
    ])].filter(Boolean);

    return { inProgress: inProgressCourses, completed: completedCourses, allStates, allTypes };
  }, [data]);

  const filterCourses = (list) =>
    list.filter((c) => {
      const matchState  = stateFilter === "all" || c.state === stateFilter;
      const matchType   = typeFilter  === "all" || String(c.type).toUpperCase() === typeFilter.toUpperCase();
      const matchSearch = !search.trim() ||
        String(c.title || "").toLowerCase().includes(search.toLowerCase()) ||
        String(c.type  || "").toLowerCase().includes(search.toLowerCase());
      return matchState && matchType && matchSearch;
    });

  const tabList = [
    { key: "inprogress", label: "In Progress", count: inProgress.length },
    { key: "completed",  label: "Completed",   count: completed.length  },
    { key: "wishlist",   label: "Wishlist",     count: 0                 },
  ];

  const currentList = filterCourses(
    activeTab === "inprogress" ? inProgress :
    activeTab === "completed"  ? completed  : []
  );

  if (loading) return (
    <Layout>
      <style>{css}</style>
      <div style={S.center}><div className="mc-spinner" /><div style={{ marginTop:12,color:"rgba(11,18,32,0.55)",fontSize:13 }}>Loading your courses…</div></div>
    </Layout>
  );
  if (error) return (
    <Layout><style>{css}</style><div style={S.center}><div style={S.errorBox}>{error}</div></div></Layout>
  );

  return (
    <Layout>
      <style>{css}</style>
      <div style={S.shell}>

        <div style={S.pageHeader}>
          <div>
            <div style={S.pageKicker}>My Learning</div>
            <div style={S.pageTitle}>My Courses</div>
          </div>
          <button style={S.browsBtn} onClick={() => navigate("/courses")} type="button">
            <BookOpen size={16} /> Browse More Courses <ChevronRight size={16} />
          </button>
        </div>

        <div style={S.toolbar}>
          <div style={S.tabs}>
            {tabList.map((t) => (
              <button key={t.key} type="button"
                style={{ ...S.tab, ...(activeTab === t.key ? S.tabActive : {}) }}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
                <span style={{ ...S.tabCount, ...(activeTab === t.key ? S.tabCountActive : {}) }}>{t.count}</span>
              </button>
            ))}
          </div>
          <div style={S.toolRight}>
            <div style={S.searchWrap}>
              <Search size={14} style={{ color:"rgba(9,25,37,0.45)",flexShrink:0 }} />
              <input style={S.searchInput} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…" />
            </div>
            <button style={{ ...S.filterBtn, ...(showFilters ? S.filterBtnActive : {}) }} onClick={() => setShowFilters((p) => !p)} type="button">
              <Filter size={14} /> Filters
              {(stateFilter !== "all" || typeFilter !== "all") && <span style={S.filterDot} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={S.filterPanel}>
            <div style={S.filterGroup}>
              <div style={S.filterLabel}>State</div>
              <div style={S.filterOptions}>
                <FilterChip label="All States" active={stateFilter === "all"} onClick={() => setStateFilter("all")} />
                {allStates.map((s) => <FilterChip key={s} label={s} active={stateFilter === s} onClick={() => setStateFilter(s)} />)}
              </div>
            </div>
            <div style={S.filterGroup}>
              <div style={S.filterLabel}>Course Type</div>
              <div style={S.filterOptions}>
                <FilterChip label="All Types" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                {allTypes.map((t) => <FilterChip key={t} label={String(t).toUpperCase()} active={typeFilter === t} onClick={() => setTypeFilter(t)} />)}
              </div>
            </div>
            {(stateFilter !== "all" || typeFilter !== "all") && (
              <button style={S.clearFilters} onClick={() => { setStateFilter("all"); setTypeFilter("all"); }} type="button">Clear all filters</button>
            )}
          </div>
        )}

        {/* ── Completed tab info banner ── */}
        {activeTab === "completed" && completed.length > 0 && (
          <div style={S.reviewInfoBanner}>
            <Eye size={14} style={{ flexShrink: 0 }} />
            <span>Click <strong>Review Course</strong> on any completed course to revisit the content and see your quiz answers.</span>
          </div>
        )}

        {currentList.length === 0 ? (
          <EmptyTab tab={activeTab} onBrowse={() => navigate("/courses")} />
        ) : (
          <div style={S.grid}>
            {currentList.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onResume={() => navigate(`/courses/${course.id}/learn`)}
                onViewCertificate={() => navigate(`/certificate/${course.certificate_course_id || course.id}`)}
                onLeaveReview={() => navigate("/testimonials")}
                hasReviewed={myReviews.some(r => String(r.course_id) === String(course.id))}
              />
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
};

/* ─── Course Card ────────────────────────────────────────────────── */
const CourseCard = ({ course, onResume, onViewCertificate, onLeaveReview, hasReviewed }) => {
  const isCompleted = course.status === "completed";
  const isWishlist  = course.status === "wishlist";
  const progress    = course.progress || 0;

  const lastAccessed = course.last_accessed
    ? new Date(course.last_accessed).toLocaleDateString("en-US", { month:"short",day:"numeric",year:"numeric" })
    : null;
  const completedAt = course.completed_at
    ? new Date(course.completed_at).toLocaleDateString("en-US", { month:"short",day:"numeric",year:"numeric" })
    : null;

  const stepsLabel =
    !isCompleted && !isWishlist && course.completedSteps > 0 && course.totalSteps > 0
      ? `${course.completedSteps} / ${course.totalSteps} steps`
      : null;

  return (
    <div style={S.card} className="mc-card">
      {/* ── Colored top accent bar ── */}
      <div style={{ ...S.cardAccent, background: course.type === "PE" ? "#2EABFE" : course.type === "CE" ? "#00B4B4" : "#F59E0B" }} />

      <div style={S.cardBody}>
        <div style={S.cardHeader}>
          <div style={S.cardIconWrap}>
            {isCompleted
              ? <Award size={20} color="#F59E0B" />
              : isWishlist
                ? <Heart size={20} color="#F59E0B" />
                : <BookOpen size={20} color="#2EABFE" />}
          </div>
          <div style={S.cardBadges}>
            <span style={badgeStyle(course.type)}>{String(course.type || "").toUpperCase()}</span>
            {course.state && course.state !== "Federal" && <span style={S.stateBadge}>{course.state}</span>}
            {/* ── Completed badge shown on card header ── */}
            {isCompleted && (
              <span style={S.completedHeaderBadge}>✓ Completed</span>
            )}
          </div>
        </div>

        <div style={S.cardTitle}>{course.title}</div>

        <div style={S.cardMeta}>
          <span style={S.metaItem}><Clock size={12} /> {course.credit_hours} hrs</span>
          {course.nmls_id && <span style={S.metaItem}>NMLS #{course.nmls_id}</span>}
        </div>

        {/* ── Progress bar for in-progress courses ── */}
        {!isCompleted && !isWishlist && (
          <div style={S.progressWrap}>
            <div style={S.progressTop}>
              <span style={S.progressLabel}>Progress</span>
              <span style={S.progressPct}>{progress}%</span>
            </div>
            <div style={S.progressTrack}>
              <div style={{ ...S.progressFill, width:`${progress}%` }} />
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              {lastAccessed && <div style={S.lastAccessed}>Last accessed {lastAccessed}</div>}
              {stepsLabel   && <div style={S.stepsLabel}>{stepsLabel}</div>}
            </div>
          </div>
        )}

        {/* ── Completion date row ── */}
        {isCompleted && (
          <div style={S.completedBadgeRow}>
            <div style={S.completedBadge}>
              <CheckCircle size={13} color="#22C55E" />
              <span>Completed{completedAt ? ` · ${completedAt}` : ""}</span>
            </div>
          </div>
        )}

        {/* ── Action buttons ── */}
        <div style={{ ...S.cardActions, flexDirection: "column", gap: 8 }}>
          {isCompleted ? (
            <>
              {/* Top row — Certificate + Review Course */}
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.certBtn} onClick={onViewCertificate} type="button">
                  <Award size={14} /> Certificate
                </button>
                <button style={S.reviewBtn} onClick={onResume} type="button">
                  <Eye size={14} /> Review Course
                </button>
              </div>
              {/* Bottom row — Leave a Review (only if not yet reviewed) */}
              {!hasReviewed ? (
                <button style={S.leaveReviewBtn} onClick={onLeaveReview} type="button">
                  <MessageSquare size={14} /> Leave a Review
                </button>
              ) : (
                <div style={S.alreadyReviewedBadge}>
                  <CheckCircle size={13} style={{ color: "#22C55E" }} /> Review Submitted
                </div>
              )}
            </>
          ) : isWishlist ? (
            <button style={S.resumeBtn} onClick={onResume} type="button">
              <BookOpen size={14} /> Enroll Now
            </button>
          ) : (
            <button style={S.resumeBtn} onClick={onResume} type="button">
              <PlayCircle size={14} /> {progress > 0 ? "Resume" : "Start"} Learning
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Filter Chip ────────────────────────────────────────────────── */
const FilterChip = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick} style={{ ...S.chip, ...(active ? S.chipActive : {}) }}>{label}</button>
);

/* ─── Empty States ───────────────────────────────────────────────── */
const EmptyTab = ({ tab, onBrowse }) => {
  const config = {
    inprogress: { icon:"📚", title:"No courses in progress",   sub:"Enroll in a course to start learning." },
    completed:  { icon:"🏆", title:"No completed courses yet", sub:"Finish a course to earn your certificate." },
    wishlist:   { icon:"❤️", title:"Your wishlist is empty",    sub:"Save courses you're interested in." },
  };
  const { icon, title, sub } = config[tab] || config.inprogress;
  return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>{icon}</div>
      <div style={S.emptyTitle}>{title}</div>
      <div style={S.emptySub}>{sub}</div>
      <button style={S.emptyBtn} onClick={onBrowse} type="button">Browse Courses <ChevronRight size={16} /></button>
    </div>
  );
};

/* ─── Helpers ────────────────────────────────────────────────────── */
const badgeStyle = (type) => {
  const t = String(type || "").toUpperCase();
  const base = { display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:999,fontSize:11,fontWeight:800 };
  if (t === "PE") return { ...base, color:"#2EABFE",           background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.22)" };
  if (t === "CE") return { ...base, color:"rgba(0,140,140,1)", background:"rgba(0,180,180,0.12)", border:"1px solid rgba(0,180,180,0.20)" };
  return { ...base, color:"rgba(9,25,37,0.78)", background:"rgba(2,8,23,0.06)", border:"1px solid rgba(2,8,23,0.10)" };
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
.mc-spinner{width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:mc-spin 1s linear infinite;}
@keyframes mc-spin{to{transform:rotate(360deg);}}
.mc-card{transition:box-shadow .2s,transform .2s;}
.mc-card:hover{box-shadow:0 16px 48px rgba(2,8,23,0.12) !important;transform:translateY(-3px);}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  shell:      { maxWidth:1180,margin:"0 auto",padding:"24px 18px 48px" },
  center:     { minHeight:"60vh",display:"grid",placeItems:"center" },
  errorBox:   { padding:"14px 20px",borderRadius:14,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.20)",color:"rgba(180,30,30,1)",fontWeight:700,fontSize:13 },

  pageHeader: { display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:22 },
  pageKicker: { fontSize:12,fontWeight:800,color:"#2EABFE",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4 },
  pageTitle:  { fontSize:26,fontWeight:950,color:"#091925",letterSpacing:"-0.4px" },
  browsBtn:   { display:"inline-flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:12,border:"1px solid rgba(2,8,23,0.10)",background:"#fff",cursor:"pointer",fontWeight:800,fontSize:13,color:"rgba(9,25,37,0.75)" },

  toolbar:        { display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:14 },
  tabs:           { display:"flex",gap:6 },
  tab:            { display:"inline-flex",alignItems:"center",gap:7,padding:"9px 14px",borderRadius:999,border:"1px solid rgba(2,8,23,0.10)",background:"#fff",cursor:"pointer",fontWeight:800,fontSize:13,color:"rgba(9,25,37,0.60)" },
  tabActive:      { background:"#091925",color:"#fff",border:"1px solid #091925",boxShadow:"0 4px 14px rgba(9,25,37,0.18)" },
  tabCount:       { display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:20,height:20,borderRadius:999,background:"rgba(2,8,23,0.08)",fontSize:11,fontWeight:900,color:"rgba(9,25,37,0.55)",padding:"0 5px" },
  tabCountActive: { background:"rgba(255,255,255,0.18)",color:"#fff" },
  toolRight:      { display:"flex",alignItems:"center",gap:8 },
  searchWrap:     { display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,border:"1px solid rgba(2,8,23,0.10)",background:"#fff",minWidth:220 },
  searchInput:    { border:"none",outline:"none",fontSize:13,fontWeight:600,color:"rgba(9,25,37,0.80)",background:"transparent",width:"100%" },
  filterBtn:      { display:"inline-flex",alignItems:"center",gap:6,padding:"9px 14px",borderRadius:10,border:"1px solid rgba(2,8,23,0.10)",background:"#fff",cursor:"pointer",fontWeight:800,fontSize:13,color:"rgba(9,25,37,0.65)",position:"relative" },
  filterBtnActive:{ border:"1px solid rgba(46,171,254,0.40)",color:"#2EABFE",background:"rgba(46,171,254,0.06)" },
  filterDot:      { position:"absolute",top:6,right:6,width:7,height:7,borderRadius:999,background:"#2EABFE",border:"2px solid #fff" },

  filterPanel:   { display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start",padding:"16px 18px",borderRadius:16,border:"1px solid rgba(46,171,254,0.18)",background:"rgba(46,171,254,0.04)",marginBottom:16 },
  filterGroup:   { display:"grid",gap:8 },
  filterLabel:   { fontSize:11,fontWeight:900,color:"rgba(9,25,37,0.50)",textTransform:"uppercase",letterSpacing:".06em" },
  filterOptions: { display:"flex",gap:6,flexWrap:"wrap" },
  chip:          { padding:"6px 12px",borderRadius:999,border:"1px solid rgba(2,8,23,0.12)",background:"#fff",cursor:"pointer",fontSize:12,fontWeight:700,color:"rgba(9,25,37,0.65)" },
  chipActive:    { background:"#091925",color:"#fff",border:"1px solid #091925" },
  clearFilters:  { alignSelf:"flex-end",padding:"6px 12px",borderRadius:999,border:"1px solid rgba(239,68,68,0.25)",background:"rgba(239,68,68,0.06)",cursor:"pointer",fontSize:12,fontWeight:700,color:"rgba(180,30,30,0.85)" },

  // ── Review info banner shown on completed tab ──
  reviewInfoBanner: {
    display:"flex",alignItems:"center",gap:10,
    padding:"12px 16px",borderRadius:12,marginBottom:16,
    background:"rgba(245,158,11,0.07)",
    border:"1px solid rgba(245,158,11,0.25)",
    color:"rgba(146,84,0,1)",
    fontSize:13,fontWeight:700,lineHeight:1.5,
  },

  grid: { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16 },

  card:        { borderRadius:18,border:"1px solid rgba(2,8,23,0.08)",background:"#fff",overflow:"hidden",position:"relative" },
  cardAccent:  { height:4,width:"100%" },
  cardBody:    { padding:18 },
  cardHeader:  { display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 },
  cardIconWrap:{ width:38,height:38,borderRadius:12,background:"rgba(2,8,23,0.04)",border:"1px solid rgba(2,8,23,0.07)",display:"grid",placeItems:"center" },
  cardBadges:  { display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end",alignItems:"center" },
  stateBadge:  { display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:999,fontSize:11,fontWeight:700,color:"rgba(9,25,37,0.65)",background:"rgba(2,8,23,0.05)",border:"1px solid rgba(2,8,23,0.10)" },

  // ── Small "✓ Completed" badge shown in card header ──
  completedHeaderBadge: {
    display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:999,
    fontSize:11,fontWeight:800,
    color:"rgba(21,128,61,1)",
    background:"rgba(34,197,94,0.10)",
    border:"1px solid rgba(34,197,94,0.25)",
  },

  cardTitle:   { fontWeight:900,fontSize:14,color:"rgba(9,25,37,0.88)",lineHeight:1.45,marginBottom:8 },
  cardMeta:    { display:"flex",gap:10,flexWrap:"wrap",marginBottom:14 },
  metaItem:    { display:"inline-flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,color:"rgba(9,25,37,0.50)" },

  progressWrap:  { marginBottom:14 },
  progressTop:   { display:"flex",justifyContent:"space-between",marginBottom:6 },
  progressLabel: { fontSize:11,fontWeight:800,color:"rgba(9,25,37,0.50)",textTransform:"uppercase",letterSpacing:".04em" },
  progressPct:   { fontSize:12,fontWeight:900,color:"#2EABFE" },
  progressTrack: { height:6,borderRadius:999,background:"rgba(2,8,23,0.07)",overflow:"hidden",marginBottom:6 },
  progressFill:  { height:"100%",borderRadius:999,background:"linear-gradient(90deg,#2EABFE,#00B4B4)",transition:"width .4s" },
  lastAccessed:  { fontSize:11,fontWeight:700,color:"rgba(9,25,37,0.42)" },
  stepsLabel:    { fontSize:11,fontWeight:700,color:"rgba(9,25,37,0.42)" },

  completedBadgeRow: { marginBottom:12 },
  completedBadge:    { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:999,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.22)",fontSize:12,fontWeight:800,color:"rgba(21,128,61,1)" },

  cardActions: { display:"flex",gap:8,marginTop:4 },

  // ── Resume / Start Learning button ──
  resumeBtn: {
    flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,
    padding:"10px",borderRadius:11,border:"none",
    background:"#091925",color:"#fff",
    cursor:"pointer",fontWeight:800,fontSize:13,
  },

  // ── View Certificate button ──
  certBtn: {
    flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,
    padding:"10px",borderRadius:11,
    border:"1px solid rgba(245,158,11,0.40)",
    background:"linear-gradient(135deg,rgba(245,158,11,0.14),rgba(245,158,11,0.06))",
    color:"rgba(146,84,0,1)",
    cursor:"pointer",fontWeight:800,fontSize:13,
    boxShadow:"0 2px 10px rgba(245,158,11,0.15)",
  },

  // ── Review Course button — new style ──
  reviewBtn: {
    flex:1,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,
    padding:"10px",borderRadius:11,
    border:"1px solid rgba(46,171,254,0.30)",
    background:"rgba(46,171,254,0.08)",
    color:"#2EABFE",
    cursor:"pointer",fontWeight:800,fontSize:13,
  },

  // ── Leave a Review button — full width, amber accent ──
  leaveReviewBtn: {
    width:"100%",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,
    padding:"10px",borderRadius:11,
    border:"1px solid rgba(245,158,11,0.35)",
    background:"linear-gradient(135deg,rgba(245,158,11,0.10),rgba(245,158,11,0.04))",
    color:"rgba(146,84,0,1)",
    cursor:"pointer",fontWeight:800,fontSize:13,
    transition:"all 0.18s",
  },

  // ── Already reviewed badge ──
  alreadyReviewedBadge: {
    width:"100%",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,
    padding:"10px",borderRadius:11,
    background:"rgba(34,197,94,0.06)",
    border:"1px solid rgba(34,197,94,0.22)",
    color:"rgba(21,128,61,1)",
    fontSize:13,fontWeight:800,
  },

  empty:      { textAlign:"center",padding:"60px 20px",borderRadius:20,border:"1px dashed rgba(2,8,23,0.14)",background:"rgba(2,8,23,0.02)",marginTop:8 },
  emptyIcon:  { fontSize:40,marginBottom:14 },
  emptyTitle: { fontWeight:950,fontSize:17,color:"rgba(9,25,37,0.82)",marginBottom:6 },
  emptySub:   { fontSize:13,color:"rgba(9,25,37,0.50)",fontWeight:600,marginBottom:20 },
  emptyBtn:   { display:"inline-flex",alignItems:"center",gap:8,padding:"11px 20px",borderRadius:12,border:"none",background:"#091925",color:"#fff",cursor:"pointer",fontWeight:800,fontSize:13 },
};

export default MyCourses;