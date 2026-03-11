import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import logo from "../../assets/images/Left Side Logo.png";
import {
  Users,
  Search,
  ChevronRight,
  CheckCircle,
  Clock,
  Award,
  BookOpen,
  ArrowLeft,
  Filter,
  Download,
  Eye,
} from "lucide-react";

const ViewStudents = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [q,        setQ]        = useState("");
  const [filter,   setFilter]   = useState("all"); // all | completed | enrolled
  const [selected, setSelected] = useState(null);  // student detail modal

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/instructor/students");
        setStudents(res.data.students || []);
      } catch (err) {
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── filtered list ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...students];

    // text search
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((s) =>
        String(s.name    || "").toLowerCase().includes(needle) ||
        String(s.email   || "").toLowerCase().includes(needle) ||
        String(s.nmls_id || "").toLowerCase().includes(needle)
      );
    }

    // status filter
    if (filter === "completed") {
      list = list.filter((s) => (s.completions?.length ?? 0) > 0);
    } else if (filter === "enrolled") {
      list = list.filter((s) => (s.completions?.length ?? 0) === 0);
    }

    return list;
  }, [students, q, filter]);

  const totalCompletions = students.reduce(
    (acc, s) => acc + (s.completions?.length ?? 0), 0
  );

  if (loading) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.center}>
        <div className="rs-spinner" />
        <p style={{ marginTop: 12, color: "rgba(11,18,32,0.55)", fontWeight: 700 }}>
          Loading students…
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.center}>
        <div className="rs-alert"><span className="rs-alert-dot" />{error}</div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.brandLeft}>
            <img src={logo} alt="Relstone" style={S.brandLogo} />
            <div>
              <div style={S.brandTitle}>Student Management</div>
              <div style={S.brandSub}>View and monitor all enrolled students</div>
            </div>
          </div>
          <div style={S.topbarRight}>
            <button
              style={S.backBtn}
              onClick={() => navigate("/instructor/dashboard")}
              type="button"
            >
              <ArrowLeft size={15} /> Back to Dashboard
            </button>
            <button style={S.logoutBtn} onClick={() => { logout(); navigate("/"); }} type="button">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={S.shell}>

        {/* ── Stat strip ───────────────────────────────────────── */}
        <div style={S.statStrip}>
          <StatPill icon={<Users size={15} />}        label="Total Students"    value={students.length}    color="var(--rs-teal)" />
          <StatPill icon={<CheckCircle size={15} />}  label="Total Completions" value={totalCompletions}   color="rgba(34,197,94,1)" />
          <StatPill icon={<Clock size={15} />}        label="Not Yet Completed" value={students.filter(s => !s.completions?.length).length} color="rgba(245,158,11,1)" />
          <StatPill icon={<Award size={15} />}        label="Certificates Issued"
            value={students.reduce((a, s) => a + (s.completions?.filter(c => c.certificate_url).length ?? 0), 0)}
            color="var(--rs-blue)"
          />
        </div>

        {/* ── Main card ────────────────────────────────────────── */}
        <div style={S.card}>

          {/* toolbar */}
          <div style={S.toolbar}>
            <div style={S.toolbarLeft}>
              <div style={S.searchWrap}>
                <Search size={15} style={{ color: "rgba(9,25,37,0.40)" }} />
                <input
                  style={S.searchInput}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, email or NMLS ID…"
                />
                {q && (
                  <button style={S.clearBtn} onClick={() => setQ("")} type="button">✕</button>
                )}
              </div>

              {/* filter chips */}
              <div style={S.chips}>
                {["all", "completed", "enrolled"].map((f) => (
                  <button
                    key={f}
                    style={{ ...S.chip, ...(filter === f ? S.chipActive : {}) }}
                    onClick={() => setFilter(f)}
                    type="button"
                  >
                    {f === "all" ? "All" : f === "completed" ? "Completed" : "Not yet completed"}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.toolbarRight}>
              <span style={S.resultCount}>
                {filtered.length} student{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* table */}
          {filtered.length === 0 ? (
            <div style={S.emptyWrap}>
              <div style={S.emptyIcon}><Users size={22} /></div>
              <div style={S.emptyTitle}>
                {q.trim() ? "No students match your search" : "No students yet"}
              </div>
              <div style={S.emptySub}>
                {q.trim()
                  ? "Try a different name, email, or NMLS ID."
                  : "Students who register will appear here."}
              </div>
              {q && (
                <button style={S.clearSearchBtn} onClick={() => setQ("")} type="button">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Student</th>
                    <th style={S.th}>NMLS ID</th>
                    <th style={S.th}>State</th>
                    <th style={S.th}>Completions</th>
                    <th style={S.th}>Latest Course</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Joined</th>
                    <th style={S.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <StudentRow
                      key={s._id}
                      student={s}
                      onView={() => setSelected(s)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Student detail modal ─────────────────────────────────── */}
      {selected && (
        <StudentModal student={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

/* ─── Student table row ──────────────────────────────────────────── */
const StudentRow = ({ student, onView }) => {
  const completions  = student.completions || [];
  const completed    = completions.length > 0;
  const latest       = completions[completions.length - 1];
  const latestTitle  = latest?.course_id?.title || "—";
  const joined       = student.createdAt
    ? new Date(student.createdAt).toLocaleDateString() : "—";

  return (
    <tr className="rs-tr">
      {/* student info */}
      <td style={S.td}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={S.avatar}>
            {(student.name || "S")[0].toUpperCase()}
          </div>
          <div>
            <div style={S.studentName}>{student.name}</div>
            <div style={S.studentEmail}>{student.email}</div>
          </div>
        </div>
      </td>
      <td style={S.td}>
        <span style={S.mono}>{student.nmls_id || "—"}</span>
      </td>
      <td style={S.td}>
        {student.state
          ? <span style={S.stateBadge}>{student.state}</span>
          : <span style={S.dash}>—</span>}
      </td>
      <td style={S.td}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={S.completionCount}>{completions.length}</span>
          {completions.length > 0 && (
            <span style={S.completionLabel}>
              course{completions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </td>
      <td style={S.td}>
        <span style={S.courseTitle}>{latestTitle}</span>
      </td>
      <td style={S.td}>
        <span style={completed ? S.badgeCompleted : S.badgeEnrolled}>
          {completed ? "Completed" : "Enrolled"}
        </span>
      </td>
      <td style={S.td}>
        <span style={S.dateText}>{joined}</span>
      </td>
      <td style={S.td}>
        <button style={S.viewBtn} onClick={onView} type="button">
          <Eye size={14} /> View
        </button>
      </td>
    </tr>
  );
};

/* ─── Student detail modal ───────────────────────────────────────── */
const StudentModal = ({ student, onClose }) => {
  const completions = student.completions || [];

  return (
    <>
      {/* backdrop */}
      <div style={S.backdrop} onClick={onClose} />

      {/* modal */}
      <div style={S.modal}>
        {/* header */}
        <div style={S.modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={S.modalAvatar}>
              {(student.name || "S")[0].toUpperCase()}
            </div>
            <div>
              <div style={S.modalName}>{student.name}</div>
              <div style={S.modalEmail}>{student.email}</div>
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose} type="button">✕</button>
        </div>

        {/* info grid */}
        <div style={S.infoGrid}>
          <InfoField label="NMLS ID"      value={student.nmls_id  || "Not set"} />
          <InfoField label="State"        value={student.state    || "Not set"} />
          <InfoField label="Role"         value="Student" />
          <InfoField label="Joined"
            value={student.createdAt
              ? new Date(student.createdAt).toLocaleDateString() : "—"} />
        </div>

        {/* completions */}
        <div style={S.modalSection}>
          <div style={S.modalSectionTitle}>
            Completed Courses
            <span style={S.modalBadge}>{completions.length}</span>
          </div>

          {completions.length === 0 ? (
            <div style={S.modalEmpty}>
              <BookOpen size={18} style={{ opacity: 0.4 }} />
              <span>No completed courses yet.</span>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {completions.map((c, i) => {
                const course = c.course_id || {};
                const type   = (course.type || "").toUpperCase();
                const isPE   = type === "PE";
                return (
                  <div key={i} style={S.completionCard}>
                    <div style={S.completionTop}>
                      <span style={isPE ? S.typePE : S.typeCE}>{type || "—"}</span>
                      <span style={S.completionTitle}>
                        {course.title || "Course"}
                      </span>
                    </div>
                    <div style={S.completionMeta}>
                      <span style={S.metaItem}>
                        <Clock size={12} />
                        {course.credit_hours ?? "—"} credit hrs
                      </span>
                      <span style={S.metaItem}>
                        <CheckCircle size={12} />
                        {c.completed_at
                          ? new Date(c.completed_at).toLocaleDateString()
                          : "—"}
                      </span>
                      {c.certificate_url && (
                        <a
                          href={c.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          style={S.certLink}
                        >
                          <Award size={12} /> Certificate
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── Small shared components ────────────────────────────────────── */
const StatPill = ({ icon, label, value, color }) => (
  <div style={S.statPill}>
    <div style={{ ...S.statPillIcon, color }}>{icon}</div>
    <div>
      <div style={{ ...S.statPillValue, color }}>{value}</div>
      <div style={S.statPillLabel}>{label}</div>
    </div>
  </div>
);

const InfoField = ({ label, value }) => (
  <div style={S.infoField}>
    <div style={S.infoLabel}>{label}</div>
    <div style={S.infoValue}>{value}</div>
  </div>
);

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root {
  --rs-dark:   #091925;
  --rs-blue:   #2EABFE;
  --rs-teal:   #00B4B4;
  --rs-bg:     #f6f7fb;
  --rs-muted:  rgba(11,18,32,0.55);
  --rs-border: rgba(2,8,23,0.09);
  --rs-shadow: 0 16px 42px rgba(2,8,23,0.09);
}
* { box-sizing: border-box; }
body { margin:0; font-family: Inter, system-ui, sans-serif; background: var(--rs-bg); }
.rs-spinner {
  width:36px; height:36px; border-radius:50%;
  border:3px solid rgba(2,8,23,0.10);
  border-top-color:var(--rs-teal);
  animation:spin 1s linear infinite;
}
@keyframes spin { to { transform:rotate(360deg); } }
.rs-alert { display:flex; gap:10px; padding:13px 16px; border-radius:14px;
  border:1px solid rgba(0,180,180,0.25); background:rgba(0,180,180,0.08);
  font-size:13px; font-weight:700; color:var(--rs-dark); }
.rs-alert-dot { width:9px; height:9px; border-radius:50%; background:var(--rs-teal); margin-top:3px; flex-shrink:0; }
.rs-tr:hover { background:rgba(0,180,180,0.04); }
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:   { minHeight: "100vh", background: "var(--rs-bg)" },
  center: { minHeight: "100vh", display: "grid", placeItems: "center" },

  // topbar
  topbar: {
    position: "sticky", top: 0, zIndex: 30,
    background: "rgba(246,247,251,0.88)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
  },
  topbarInner: {
    maxWidth: 1200, margin: "0 auto", padding: "13px 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
  },
  brandLeft:  { display: "flex", alignItems: "center", gap: 12 },
  brandLogo:  { height: 30, objectFit: "contain" },
  brandTitle: { fontWeight: 900, fontSize: 15, color: "var(--rs-dark)", letterSpacing: "-0.2px" },
  brandSub:   { fontSize: 11, color: "var(--rs-muted)", marginTop: 2, fontWeight: 700 },
  topbarRight:{ display: "flex", alignItems: "center", gap: 10 },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "9px 14px", borderRadius: 999,
    border: "1px solid rgba(0,180,180,0.30)",
    background: "rgba(0,180,180,0.08)",
    color: "var(--rs-teal)", cursor: "pointer",
    fontWeight: 900, fontSize: 13,
  },
  logoutBtn: {
    padding: "9px 14px", borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)", background: "#fff",
    cursor: "pointer", fontWeight: 900, fontSize: 13,
    color: "rgba(11,18,32,0.65)",
  },

  shell: { maxWidth: 1200, margin: "0 auto", padding: "20px 20px 48px" },

  // stat strip
  statStrip: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12,
    marginBottom: 16,
  },
  statPill: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 16px", borderRadius: 18,
    background: "#fff", border: "1px solid rgba(2,8,23,0.08)",
    boxShadow: "0 4px 14px rgba(2,8,23,0.05)",
  },
  statPillIcon:  { width: 38, height: 38, borderRadius: 12, background: "rgba(2,8,23,0.04)", display: "grid", placeItems: "center", flexShrink: 0 },
  statPillValue: { fontWeight: 950, fontSize: 22, letterSpacing: "-0.4px" },
  statPillLabel: { fontSize: 11, fontWeight: 700, color: "var(--rs-muted)", marginTop: 1 },

  // card
  card: {
    borderRadius: 22, background: "#fff",
    border: "1px solid rgba(2,8,23,0.08)",
    boxShadow: "var(--rs-shadow)", overflow: "hidden",
  },

  // toolbar
  toolbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 14, padding: "14px 16px",
    borderBottom: "1px solid rgba(2,8,23,0.07)", flexWrap: "wrap",
  },
  toolbarLeft:  { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  toolbarRight: { display: "flex", alignItems: "center", gap: 10 },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "9px 14px", borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)",
    minWidth: 280,
  },
  searchInput: {
    border: "none", outline: "none", flex: 1,
    fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.82)",
    background: "transparent",
  },
  clearBtn: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 12, color: "var(--rs-muted)", padding: "0 2px",
  },
  chips: { display: "flex", gap: 7 },
  chip: {
    padding: "7px 13px", borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)", background: "#fff",
    cursor: "pointer", fontWeight: 800, fontSize: 12,
    color: "rgba(11,18,32,0.62)",
  },
  chipActive: {
    borderColor: "rgba(0,180,180,0.38)", color: "var(--rs-dark)",
    boxShadow: "0 0 0 3px rgba(0,180,180,0.14)",
  },
  resultCount: { fontSize: 12, fontWeight: 900, color: "var(--rs-muted)" },

  // table
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 900 },
  th: {
    textAlign: "left", fontSize: 11, fontWeight: 950,
    color: "rgba(11,18,32,0.50)", padding: "11px 16px",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.018)", whiteSpace: "nowrap",
  },
  td: { padding: "13px 16px", borderBottom: "1px solid rgba(2,8,23,0.055)", fontSize: 13, verticalAlign: "middle" },

  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "rgba(0,180,180,0.12)", border: "1.5px solid rgba(0,180,180,0.28)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--rs-teal)", fontWeight: 900, fontSize: 14, flexShrink: 0,
  },
  studentName:  { fontWeight: 800, color: "rgba(11,18,32,0.88)", fontSize: 13 },
  studentEmail: { fontSize: 11, color: "var(--rs-muted)", fontWeight: 700, marginTop: 2 },
  mono:         { fontFamily: "monospace", fontSize: 12, color: "rgba(11,18,32,0.70)", fontWeight: 700 },
  stateBadge: {
    padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900,
    background: "rgba(46,171,254,0.10)", color: "var(--rs-blue)",
    border: "1px solid rgba(46,171,254,0.22)",
  },
  dash:          { color: "rgba(11,18,32,0.30)", fontWeight: 700 },
  completionCount: { fontWeight: 950, fontSize: 16, color: "var(--rs-dark)" },
  completionLabel: { fontSize: 11, color: "var(--rs-muted)", fontWeight: 700 },
  courseTitle:   { fontWeight: 700, color: "rgba(11,18,32,0.75)", fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" },
  badgeCompleted:{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(0,140,140,1)", background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)" },
  badgeEnrolled: { padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "var(--rs-blue)", background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.22)" },
  dateText:      { fontSize: 12, color: "var(--rs-muted)", fontWeight: 700 },
  viewBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 12px", borderRadius: 9,
    border: "1px solid rgba(0,180,180,0.28)",
    background: "rgba(0,180,180,0.08)",
    color: "var(--rs-teal)", cursor: "pointer",
    fontWeight: 900, fontSize: 12,
  },

  // empty
  emptyWrap: { padding: "48px 24px", textAlign: "center" },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 18,
    background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.20)",
    display: "grid", placeItems: "center", color: "var(--rs-dark)",
    margin: "0 auto",
  },
  emptyTitle:     { marginTop: 14, fontWeight: 950, fontSize: 16, color: "rgba(11,18,32,0.84)" },
  emptySub:       { marginTop: 6, fontSize: 13, color: "var(--rs-muted)", fontWeight: 700, lineHeight: 1.6 },
  clearSearchBtn: { marginTop: 14, padding: "9px 18px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 13, color: "rgba(11,18,32,0.72)" },

  // modal
  backdrop: { position: "fixed", inset: 0, zIndex: 40, background: "rgba(9,25,37,0.55)", backdropFilter: "blur(4px)" },
  modal: {
    position: "fixed", zIndex: 41,
    top: "50%", left: "50%",
    transform: "translate(-50%,-50%)",
    width: "100%", maxWidth: 560,
    maxHeight: "88vh", overflowY: "auto",
    background: "#fff", borderRadius: 24,
    boxShadow: "0 32px 80px rgba(9,25,37,0.22)",
    padding: 28,
  },
  modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22 },
  modalAvatar: {
    width: 52, height: 52, borderRadius: "50%",
    background: "linear-gradient(135deg,#091925,#054040)",
    border: "2px solid rgba(0,180,180,0.30)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--rs-teal)", fontWeight: 900, fontSize: 20, flexShrink: 0,
  },
  modalName:  { fontWeight: 950, fontSize: 18, color: "var(--rs-dark)", letterSpacing: "-0.2px" },
  modalEmail: { fontSize: 13, color: "var(--rs-muted)", fontWeight: 700, marginTop: 3 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 9,
    border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.04)",
    cursor: "pointer", fontWeight: 900, fontSize: 14,
    color: "rgba(11,18,32,0.50)", display: "grid", placeItems: "center",
    flexShrink: 0,
  },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 },
  infoField: { padding: "11px 14px", borderRadius: 14, background: "rgba(2,8,23,0.02)", border: "1px solid rgba(2,8,23,0.07)" },
  infoLabel: { fontSize: 11, fontWeight: 800, color: "var(--rs-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" },
  infoValue: { fontSize: 14, fontWeight: 900, color: "var(--rs-dark)" },
  modalSection: { borderTop: "1px solid rgba(2,8,23,0.08)", paddingTop: 20 },
  modalSectionTitle: { fontWeight: 950, fontSize: 14, color: "var(--rs-dark)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
  modalBadge: { padding: "2px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900, background: "rgba(0,180,180,0.10)", color: "var(--rs-teal)", border: "1px solid rgba(0,180,180,0.22)" },
  modalEmpty: { display: "flex", alignItems: "center", gap: 10, padding: "18px 14px", borderRadius: 14, background: "rgba(2,8,23,0.02)", border: "1px dashed rgba(2,8,23,0.12)", color: "var(--rs-muted)", fontWeight: 700, fontSize: 13 },
  completionCard: { padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.02)" },
  completionTop: { display: "flex", alignItems: "center", gap: 9, marginBottom: 8 },
  completionTitle: { fontWeight: 800, color: "rgba(11,18,32,0.86)", fontSize: 13 },
  completionMeta: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  metaItem: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--rs-muted)", fontWeight: 700 },
  certLink: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 900, color: "var(--rs-teal)", textDecoration: "none" },
  typePE: { padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "var(--rs-blue)", background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.22)", flexShrink: 0 },
  typeCE: { padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(0,140,140,1)", background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.20)", flexShrink: 0 },
};

export default ViewStudents;