import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import logo from "../../assets/images/Left Side Logo.png";
import {
  Users, Search, CheckCircle, Clock, Award,
  BookOpen, ArrowLeft, Eye, PlusCircle, X, Check,
  Unlock, AlertTriangle,
} from "lucide-react";

const ViewStudents = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [students, setStudents]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState("");
  const [q,        setQ]          = useState("");
  const [filter,   setFilter]     = useState("all");
  const [selected, setSelected]   = useState(null);
  const [assigning, setAssigning] = useState(null);

  const reload = async () => {
    try {
      const res = await API.get("/instructor/students");
      setStudents(res.data.students || []);
    } catch (err) {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    let list = [...students];
    if (q.trim()) {
      const n = q.toLowerCase();
      list = list.filter((s) =>
        String(s.name    || "").toLowerCase().includes(n) ||
        String(s.email   || "").toLowerCase().includes(n) ||
        String(s.nmls_id || "").toLowerCase().includes(n)
      );
    }
    if (filter === "completed") list = list.filter((s) => (s.completions?.length ?? 0) > 0);
    if (filter === "enrolled")  list = list.filter((s) => (s.completions?.length ?? 0) === 0);
    return list;
  }, [students, q, filter]);

  const totalCompletions = students.reduce((a, s) => a + (s.completions?.length ?? 0), 0);

  if (loading) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.center}><div className="rs-spinner" /></div>
    </div>
  );
  if (error) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.center}><div style={{ color: "crimson", fontWeight: 900 }}>{error}</div></div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Top bar ── */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.brandLeft}>
            <img src={logo} alt="Relstone" style={S.brandLogo} />
            <div>
              <div style={S.brandTitle}>Student Management</div>
              <div style={S.brandSub}>View and assign courses to enrolled students</div>
            </div>
          </div>
          <div style={S.topbarRight}>
            <button style={S.backBtn} onClick={() => navigate("/instructor/dashboard")} type="button">
              <ArrowLeft size={15} /> Back to Dashboard
            </button>
            <button style={S.logoutBtn} onClick={() => { logout(); navigate("/"); }} type="button">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={S.shell}>

        {/* ── Stat strip ── */}
        <div style={S.statStrip}>
          <StatPill icon={<Users size={15} />}       label="Total Students"     value={students.length}     color="var(--rs-teal)" />
          <StatPill icon={<CheckCircle size={15} />} label="Total Completions"  value={totalCompletions}    color="rgba(34,197,94,1)" />
          <StatPill icon={<Clock size={15} />}       label="Not Yet Completed"  value={students.filter(s => !s.completions?.length).length} color="rgba(245,158,11,1)" />
          <StatPill icon={<Award size={15} />}       label="Certificates Issued"
            value={students.reduce((a, s) => a + (s.completions?.filter(c => c.certificate_url).length ?? 0), 0)}
            color="var(--rs-blue)"
          />
        </div>

        {/* ── Main card ── */}
        <div style={S.card}>
          <div style={S.toolbar}>
            <div style={S.toolbarLeft}>
              <div style={S.searchWrap}>
                <Search size={15} style={{ color: "rgba(9,25,37,0.40)" }} />
                <input style={S.searchInput} value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, email or NMLS ID…" />
                {q && <button style={S.clearBtn} onClick={() => setQ("")} type="button">✕</button>}
              </div>
              <div style={S.chips}>
                {["all","completed","enrolled"].map((f) => (
                  <button key={f} style={{ ...S.chip, ...(filter === f ? S.chipActive : {}) }}
                    onClick={() => setFilter(f)} type="button">
                    {f === "all" ? "All" : f === "completed" ? "Completed" : "Not yet completed"}
                  </button>
                ))}
              </div>
            </div>
            <span style={S.resultCount}>{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {filtered.length === 0 ? (
            <div style={S.emptyWrap}>
              <div style={S.emptyIcon}><Users size={22} /></div>
              <div style={S.emptyTitle}>{q.trim() ? "No students match your search" : "No students yet"}</div>
              <div style={S.emptySub}>{q.trim() ? "Try a different name, email, or NMLS ID." : "Students who register will appear here."}</div>
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
                    <StudentRow key={s._id} student={s}
                      onView={() => setSelected(s)}
                      onAssign={() => setAssigning(s)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected  && <StudentModal student={selected} onClose={() => setSelected(null)} />}
      {assigning && (
        <AssignModal
          student={assigning}
          onClose={() => setAssigning(null)}
          onAssigned={() => { setAssigning(null); reload(); }}
        />
      )}
    </div>
  );
};

/* ─── Student row ─────────────────────────────────────────────────── */
const StudentRow = ({ student, onView, onAssign }) => {
  const completions = student.completions || [];
  const completed   = completions.length > 0;
  const latest      = completions[completions.length - 1];
  const latestTitle = latest?.course_id?.title || "—";
  const joined      = student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—";

  return (
    <tr className="rs-tr">
      <td style={S.td}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={S.avatar}>{(student.name || "S")[0].toUpperCase()}</div>
          <div>
            <div style={S.studentName}>{student.name}</div>
            <div style={S.studentEmail}>{student.email}</div>
          </div>
        </div>
      </td>
      <td style={S.td}><span style={S.mono}>{student.nmls_id || "—"}</span></td>
      <td style={S.td}>
        {student.state ? <span style={S.stateBadge}>{student.state}</span> : <span style={S.dash}>—</span>}
      </td>
      <td style={S.td}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={S.completionCount}>{completions.length}</span>
          {completions.length > 0 && <span style={S.completionLabel}>course{completions.length !== 1 ? "s" : ""}</span>}
        </div>
      </td>
      <td style={S.td}><span style={S.courseTitle}>{latestTitle}</span></td>
      <td style={S.td}>
        <span style={completed ? S.badgeCompleted : S.badgeEnrolled}>
          {completed ? "Completed" : "Enrolled"}
        </span>
      </td>
      <td style={S.td}><span style={S.dateText}>{joined}</span></td>
      <td style={S.td}>
        <div style={{ display:"flex", gap:7 }}>
          <button style={S.viewBtn} onClick={onView} type="button">
            <Eye size={13} /> View
          </button>
          <button style={S.assignBtn} onClick={onAssign} type="button">
            <PlusCircle size={13} /> Assign
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ─── Student detail modal ────────────────────────────────────────── */
const StudentModal = ({ student, onClose }) => {
  const completions = student.completions || [];

  // ── Quiz lock state ───────────────────────────────────────────────
  const [locks,         setLocks]         = useState([]);
  const [locksLoading,  setLocksLoading]  = useState(true);
  const [unlocking,     setUnlocking]     = useState(null); // quizId being unlocked
  const [unlockSuccess, setUnlockSuccess] = useState({});   // quizId → true

  useEffect(() => {
    const fetchLocks = async () => {
      try {
        const res = await API.get("/quiz-attempts/instructor/pending");
        // Filter only this student's locks
        const myLocks = (res.data?.pending || []).filter(
          (p) => String(p.user_id) === String(student._id)
        );
        setLocks(myLocks);
      } catch { /* silent */ }
      finally { setLocksLoading(false); }
    };
    fetchLocks();
  }, [student._id]);

  const handleUnlock = async (lock) => {
    setUnlocking(lock.quiz_id);
    try {
      await API.post("/quiz-attempts/instructor/unlock", {
        userId:   student._id,
        courseId: lock.course_id,
        quizId:   lock.quiz_id,
      });
      setUnlockSuccess((prev) => ({ ...prev, [lock.quiz_id]: true }));
      setLocks((prev) => prev.filter((l) => l.quiz_id !== lock.quiz_id));
    } catch {
      /* silent — show nothing, user can retry */
    } finally {
      setUnlocking(null);
    }
  };

  return (
    <>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={S.modalAvatar}>{(student.name || "S")[0].toUpperCase()}</div>
            <div>
              <div style={S.modalName}>{student.name}</div>
              <div style={S.modalEmail}>{student.email}</div>
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose} type="button">✕</button>
        </div>

        <div style={S.infoGrid}>
          <InfoField label="NMLS ID" value={student.nmls_id  || "Not set"} />
          <InfoField label="State"   value={student.state    || "Not set"} />
          <InfoField label="Role"    value="Student" />
          <InfoField label="Joined"  value={student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"} />
        </div>

        {/* ── Quiz Locks section ───────────────────────────────────── */}
        <div style={{ ...S.modalSection, marginBottom: 20 }}>
          <div style={S.modalSectionTitle}>
            <AlertTriangle size={14} style={{ color: "rgba(185,28,28,0.80)" }} />
            Quiz Locks
            {locks.length > 0 && (
              <span style={{ ...S.modalBadge, background:"rgba(239,68,68,0.10)", color:"rgba(185,28,28,1)", border:"1px solid rgba(239,68,68,0.25)" }}>
                {locks.length}
              </span>
            )}
          </div>

          {locksLoading ? (
            <div style={S.modalEmpty}><span>Checking for locked quizzes…</span></div>
          ) : locks.length === 0 ? (
            <div style={S.modalEmpty}>
              <Check size={16} style={{ color: "rgba(34,197,94,0.7)" }} />
              <span>No locked quizzes — student is in good standing.</span>
            </div>
          ) : (
            <div style={{ display:"grid", gap:10 }}>
              {locks.map((lock) => {
                const isUnlocking = unlocking === lock.quiz_id;
                const isDone      = unlockSuccess[lock.quiz_id];
                return (
                  <div key={lock.quiz_id} style={S.lockCard}>
                    <div style={S.lockCardLeft}>
                      <div style={S.lockCardTitle}>{lock.quiz_title || lock.quiz_id}</div>
                      <div style={S.lockCardMeta}>
                        {lock.course?.title || "Unknown course"} · {lock.fail_count} failed attempt{lock.fail_count !== 1 ? "s" : ""}
                        <span style={S.lockCardDate}>
                          · Last attempt: {lock.last_attempt ? new Date(lock.last_attempt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                    <button
                      style={{ ...S.unlockBtn, ...(isUnlocking || isDone ? S.unlockBtnDim : {}) }}
                      onClick={() => !isUnlocking && !isDone && handleUnlock(lock)}
                      disabled={isUnlocking || isDone}
                      type="button"
                    >
                      {isDone
                        ? <><Check size={13} /> Unlocked</>
                        : isUnlocking
                          ? "Unlocking…"
                          : <><Unlock size={13} /> Unlock</>
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Completed courses ────────────────────────────────────── */}
        <div style={S.modalSection}>
          <div style={S.modalSectionTitle}>
            Completed Courses <span style={S.modalBadge}>{completions.length}</span>
          </div>
          {completions.length === 0 ? (
            <div style={S.modalEmpty}><BookOpen size={18} style={{ opacity:0.4 }} /><span>No completed courses yet.</span></div>
          ) : (
            <div style={{ display:"grid", gap:10 }}>
              {completions.map((c, i) => {
                const course = c.course_id || {};
                const type   = (course.type || "").toUpperCase();
                return (
                  <div key={i} style={S.completionCard}>
                    <div style={S.completionTop}>
                      <span style={type === "PE" ? S.typePE : S.typeCE}>{type || "—"}</span>
                      <span style={S.completionTitle}>{course.title || "Course"}</span>
                    </div>
                    <div style={S.completionMeta}>
                      <span style={S.metaItem}><Clock size={12} />{course.credit_hours ?? "—"} credit hrs</span>
                      <span style={S.metaItem}><CheckCircle size={12} />{c.completed_at ? new Date(c.completed_at).toLocaleDateString() : "—"}</span>
                      {c.certificate_url && (
                        <a href={c.certificate_url} target="_blank" rel="noreferrer" style={S.certLink}>
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

/* ─── Assign Course Modal ─────────────────────────────────────────── */
const AssignModal = ({ student, onClose, onAssigned }) => {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [q,        setQ]        = useState("");

  const completedIds = new Set(
    (student.completions || []).map((c) => c.course_id?._id || c.course_id)
  );

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/courses");
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return courses;
    const n = q.toLowerCase();
    return courses.filter((c) =>
      String(c.title || "").toLowerCase().includes(n) ||
      String(c.type  || "").toLowerCase().includes(n)
    );
  }, [courses, q]);

  const handleAssign = async () => {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      await API.post("/instructor/assign-course", {
        student_id: student._id,
        course_id:  selected,
      });
      setSuccess(true);
      setTimeout(() => onAssigned(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign course.");
      setSaving(false);
    }
  };

  return (
    <>
      <div style={S.backdrop} onClick={onClose} />
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <div>
            <div style={S.modalName}>Assign Course</div>
            <div style={S.modalEmail}>to {student.name} ({student.email})</div>
          </div>
          <button style={S.closeBtn} onClick={onClose} type="button">✕</button>
        </div>

        <div style={S.assignSearch}>
          <Search size={14} style={{ opacity: 0.5 }} />
          <input style={S.searchInput} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Filter courses…" />
        </div>

        <div style={S.courseList}>
          {loading ? (
            <div style={{ padding:18, color:"rgba(11,18,32,0.55)", fontWeight:700 }}>Loading courses…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:18, color:"rgba(11,18,32,0.55)", fontWeight:700 }}>No courses found.</div>
          ) : (
            filtered.map((course) => {
              const alreadyDone = completedIds.has(course._id);
              const isSelected  = selected === course._id;
              return (
                <div key={course._id}
                  style={{ ...S.courseOption, ...(isSelected ? S.courseOptionSelected : {}), ...(alreadyDone ? S.courseOptionDone : {}) }}
                  onClick={() => !alreadyDone && setSelected(course._id)}
                >
                  <div style={S.courseOptionLeft}>
                    <span style={course.type === "PE" ? S.typePE : S.typeCE}>{course.type}</span>
                    <div>
                      <div style={S.courseOptionTitle}>{course.title}</div>
                      <div style={S.courseOptionMeta}>{course.credit_hours} credit hrs · ${Number(course.price||0).toFixed(2)}</div>
                    </div>
                  </div>
                  {alreadyDone && <span style={S.doneTag}><Check size={11} /> Done</span>}
                  {isSelected && !alreadyDone && <span style={S.selectedTag}><Check size={11} /> Selected</span>}
                </div>
              );
            })
          )}
        </div>

        {error && <div style={S.errorMsg}>{error}</div>}

        <div style={S.assignFooter}>
          <button style={S.cancelBtn} onClick={onClose} type="button">Cancel</button>
          <button
            style={{ ...S.confirmBtn, ...((!selected || saving || success) ? S.confirmBtnDisabled : {}) }}
            onClick={handleAssign}
            disabled={!selected || saving || success}
            type="button"
          >
            {success ? <><Check size={15} /> Assigned!</> : saving ? "Assigning…" : <><PlusCircle size={15} /> Assign Course</>}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Shared small components ─────────────────────────────────────── */
const StatPill  = ({ icon, label, value, color }) => (
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

/* ─── CSS ─────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root{--rs-dark:#091925;--rs-blue:#2EABFE;--rs-teal:#00B4B4;--rs-bg:#f6f7fb;--rs-muted:rgba(11,18,32,0.55);--rs-border:rgba(2,8,23,0.09);--rs-shadow:0 16px 42px rgba(2,8,23,0.09);}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--rs-bg);}
.rs-spinner{width:36px;height:36px;border-radius:50%;border:3px solid rgba(2,8,23,0.10);border-top-color:var(--rs-teal);animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.rs-tr:hover{background:rgba(0,180,180,0.04);}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:    { minHeight:"100vh", background:"var(--rs-bg)", fontFamily:"Inter,system-ui,sans-serif" },
  center:  { minHeight:"100vh", display:"grid", placeItems:"center" },
  topbar:  { background:"#fff", borderBottom:"1px solid rgba(2,8,23,0.08)", boxShadow:"0 2px 12px rgba(2,8,23,0.05)" },
  topbarInner: { maxWidth:1200, margin:"0 auto", padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 },
  brandLeft:   { display:"flex", alignItems:"center", gap:12 },
  brandLogo:   { height:30, objectFit:"contain" },
  brandTitle:  { fontWeight:900, fontSize:15, color:"var(--rs-dark)", letterSpacing:"-0.2px" },
  brandSub:    { fontSize:11, color:"var(--rs-muted)", marginTop:2, fontWeight:700 },
  topbarRight: { display:"flex", alignItems:"center", gap:10 },
  backBtn:     { display:"inline-flex", alignItems:"center", gap:7, padding:"9px 14px", borderRadius:999, border:"1px solid rgba(0,180,180,0.30)", background:"rgba(0,180,180,0.08)", color:"var(--rs-teal)", cursor:"pointer", fontWeight:900, fontSize:13 },
  logoutBtn:   { padding:"9px 14px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.65)" },
  shell:       { maxWidth:1200, margin:"0 auto", padding:"20px 20px 48px" },
  statStrip:   { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 },
  statPill:    { display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:18, background:"#fff", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"0 4px 14px rgba(2,8,23,0.05)" },
  statPillIcon:  { width:38, height:38, borderRadius:12, background:"rgba(2,8,23,0.04)", display:"grid", placeItems:"center", flexShrink:0 },
  statPillValue: { fontWeight:950, fontSize:22, letterSpacing:"-0.4px" },
  statPillLabel: { fontSize:11, fontWeight:700, color:"var(--rs-muted)", marginTop:1 },
  card:        { borderRadius:22, background:"#fff", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"var(--rs-shadow)", overflow:"hidden" },
  toolbar:     { display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, padding:"14px 16px", borderBottom:"1px solid rgba(2,8,23,0.07)", flexWrap:"wrap" },
  toolbarLeft: { display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" },
  searchWrap:  { display:"flex", alignItems:"center", gap:8, padding:"9px 14px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", minWidth:280 },
  searchInput: { border:"none", outline:"none", flex:1, fontSize:13, fontWeight:700, color:"rgba(11,18,32,0.82)", background:"transparent" },
  clearBtn:    { background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--rs-muted)", padding:"0 2px" },
  chips:       { display:"flex", gap:7 },
  chip:        { padding:"7px 13px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:800, fontSize:12, color:"rgba(11,18,32,0.62)" },
  chipActive:  { borderColor:"rgba(0,180,180,0.38)", color:"var(--rs-dark)", boxShadow:"0 0 0 3px rgba(0,180,180,0.14)" },
  resultCount: { fontSize:12, fontWeight:900, color:"var(--rs-muted)" },
  tableWrap:   { overflowX:"auto" },
  table:       { width:"100%", borderCollapse:"separate", borderSpacing:0, minWidth:950 },
  th:          { textAlign:"left", fontSize:11, fontWeight:950, color:"rgba(11,18,32,0.50)", padding:"11px 16px", borderBottom:"1px solid rgba(2,8,23,0.08)", background:"rgba(2,8,23,0.018)", whiteSpace:"nowrap" },
  td:          { padding:"13px 16px", borderBottom:"1px solid rgba(2,8,23,0.055)", fontSize:13, verticalAlign:"middle" },
  avatar:      { width:34, height:34, borderRadius:"50%", background:"rgba(0,180,180,0.12)", border:"1.5px solid rgba(0,180,180,0.28)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--rs-teal)", fontWeight:900, fontSize:14, flexShrink:0 },
  studentName: { fontWeight:800, color:"rgba(11,18,32,0.88)", fontSize:13 },
  studentEmail:{ fontSize:11, color:"var(--rs-muted)", fontWeight:700, marginTop:2 },
  mono:        { fontFamily:"monospace", fontSize:12, color:"rgba(11,18,32,0.70)", fontWeight:700 },
  stateBadge:  { padding:"3px 9px", borderRadius:999, fontSize:11, fontWeight:900, background:"rgba(46,171,254,0.10)", color:"var(--rs-blue)", border:"1px solid rgba(46,171,254,0.22)" },
  dash:        { color:"rgba(11,18,32,0.30)", fontWeight:700 },
  completionCount: { fontWeight:950, fontSize:16, color:"var(--rs-dark)" },
  completionLabel: { fontSize:11, color:"var(--rs-muted)", fontWeight:700 },
  courseTitle: { fontWeight:700, color:"rgba(11,18,32,0.75)", fontSize:12, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"block" },
  badgeCompleted:{ padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:900, color:"rgba(0,140,140,1)", background:"rgba(0,180,180,0.10)", border:"1px solid rgba(0,180,180,0.22)" },
  badgeEnrolled: { padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:900, color:"var(--rs-blue)", background:"rgba(46,171,254,0.10)", border:"1px solid rgba(46,171,254,0.22)" },
  dateText:    { fontSize:12, color:"var(--rs-muted)", fontWeight:700 },
  viewBtn:     { display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:9, border:"1px solid rgba(0,180,180,0.28)", background:"rgba(0,180,180,0.08)", color:"var(--rs-teal)", cursor:"pointer", fontWeight:900, fontSize:12 },
  assignBtn:   { display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:9, border:"1px solid rgba(46,171,254,0.28)", background:"rgba(46,171,254,0.08)", color:"var(--rs-blue)", cursor:"pointer", fontWeight:900, fontSize:12 },
  emptyWrap:   { padding:"48px 24px", textAlign:"center" },
  emptyIcon:   { width:52, height:52, borderRadius:18, background:"rgba(0,180,180,0.08)", border:"1px solid rgba(0,180,180,0.20)", display:"grid", placeItems:"center", color:"var(--rs-dark)", margin:"0 auto" },
  emptyTitle:  { marginTop:14, fontWeight:950, fontSize:16, color:"rgba(11,18,32,0.84)" },
  emptySub:    { marginTop:6, fontSize:13, color:"var(--rs-muted)", fontWeight:700, lineHeight:1.6 },

  // modals shared
  backdrop:    { position:"fixed", inset:0, zIndex:40, background:"rgba(9,25,37,0.55)", backdropFilter:"blur(4px)" },
  modal:       { position:"fixed", zIndex:41, top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"100%", maxWidth:580, maxHeight:"88vh", overflowY:"auto", background:"#fff", borderRadius:24, boxShadow:"0 32px 80px rgba(9,25,37,0.22)", padding:28 },
  modalHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:20 },
  modalAvatar: { width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#091925,#054040)", border:"2px solid rgba(0,180,180,0.30)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--rs-teal)", fontWeight:900, fontSize:20, flexShrink:0 },
  modalName:   { fontWeight:950, fontSize:18, color:"var(--rs-dark)", letterSpacing:"-0.2px" },
  modalEmail:  { fontSize:13, color:"var(--rs-muted)", fontWeight:700, marginTop:3 },
  closeBtn:    { width:32, height:32, borderRadius:9, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.04)", cursor:"pointer", fontWeight:900, fontSize:14, color:"rgba(11,18,32,0.50)", display:"grid", placeItems:"center", flexShrink:0 },
  infoGrid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:22 },
  infoField:   { padding:"11px 14px", borderRadius:14, background:"rgba(2,8,23,0.02)", border:"1px solid rgba(2,8,23,0.07)" },
  infoLabel:   { fontSize:11, fontWeight:800, color:"var(--rs-muted)", marginBottom:4, textTransform:"uppercase", letterSpacing:"0.5px" },
  infoValue:   { fontSize:14, fontWeight:900, color:"var(--rs-dark)" },
  modalSection:{ borderTop:"1px solid rgba(2,8,23,0.08)", paddingTop:20 },
  modalSectionTitle:{ fontWeight:950, fontSize:14, color:"var(--rs-dark)", marginBottom:12, display:"flex", alignItems:"center", gap:8 },
  modalBadge:  { padding:"2px 9px", borderRadius:999, fontSize:11, fontWeight:900, background:"rgba(0,180,180,0.10)", color:"var(--rs-teal)", border:"1px solid rgba(0,180,180,0.22)" },
  modalEmpty:  { display:"flex", alignItems:"center", gap:10, padding:"14px", borderRadius:14, background:"rgba(2,8,23,0.02)", border:"1px dashed rgba(2,8,23,0.12)", color:"var(--rs-muted)", fontWeight:700, fontSize:13 },

  // quiz lock card
  lockCard:     { display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 14px", borderRadius:14, border:"1px solid rgba(239,68,68,0.22)", background:"rgba(239,68,68,0.04)" },
  lockCardLeft: { flex:1, minWidth:0 },
  lockCardTitle:{ fontWeight:800, fontSize:13, color:"rgba(185,28,28,1)", marginBottom:3 },
  lockCardMeta: { fontSize:12, fontWeight:700, color:"var(--rs-muted)", lineHeight:1.5 },
  lockCardDate: { color:"rgba(11,18,32,0.40)" },
  unlockBtn:    { display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"none", background:"rgba(34,197,94,0.90)", color:"#fff", cursor:"pointer", fontWeight:900, fontSize:12, flexShrink:0, whiteSpace:"nowrap" },
  unlockBtnDim: { opacity:0.55, cursor:"not-allowed" },

  completionCard: { padding:"12px 14px", borderRadius:14, border:"1px solid rgba(2,8,23,0.08)", background:"rgba(2,8,23,0.02)" },
  completionTop:  { display:"flex", alignItems:"center", gap:9, marginBottom:8 },
  completionTitle:{ fontWeight:800, color:"rgba(11,18,32,0.86)", fontSize:13 },
  completionMeta: { display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" },
  metaItem:    { display:"inline-flex", alignItems:"center", gap:5, fontSize:12, color:"var(--rs-muted)", fontWeight:700 },
  certLink:    { display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:900, color:"var(--rs-teal)", textDecoration:"none" },
  typePE:      { padding:"3px 8px", borderRadius:999, fontSize:11, fontWeight:900, color:"var(--rs-blue)", background:"rgba(46,171,254,0.10)", border:"1px solid rgba(46,171,254,0.22)", flexShrink:0 },
  typeCE:      { padding:"3px 8px", borderRadius:999, fontSize:11, fontWeight:900, color:"rgba(0,140,140,1)", background:"rgba(0,180,180,0.10)", border:"1px solid rgba(0,180,180,0.20)", flexShrink:0 },

  // assign modal
  assignSearch:{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:14, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", marginBottom:12 },
  courseList:  { display:"grid", gap:8, maxHeight:320, overflowY:"auto", marginBottom:16 },
  courseOption:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 14px", borderRadius:14, border:"1px solid rgba(2,8,23,0.08)", background:"rgba(2,8,23,0.01)", cursor:"pointer", transition:"all 0.15s" },
  courseOptionSelected:{ border:"1.5px solid rgba(46,171,254,0.45)", background:"rgba(46,171,254,0.06)", boxShadow:"0 0 0 3px rgba(46,171,254,0.12)" },
  courseOptionDone:    { opacity:0.45, cursor:"not-allowed", background:"rgba(2,8,23,0.02)" },
  courseOptionLeft:    { display:"flex", alignItems:"center", gap:10, minWidth:0 },
  courseOptionTitle:   { fontWeight:800, color:"rgba(11,18,32,0.86)", fontSize:13 },
  courseOptionMeta:    { fontSize:11, color:"var(--rs-muted)", fontWeight:700, marginTop:2 },
  doneTag:     { display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:999, fontSize:11, fontWeight:900, background:"rgba(0,180,180,0.10)", color:"rgba(0,140,140,1)", border:"1px solid rgba(0,180,180,0.22)", flexShrink:0 },
  selectedTag: { display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:999, fontSize:11, fontWeight:900, background:"rgba(46,171,254,0.12)", color:"var(--rs-blue)", border:"1px solid rgba(46,171,254,0.28)", flexShrink:0 },
  errorMsg:    { padding:"10px 14px", borderRadius:12, background:"rgba(220,38,38,0.06)", border:"1px solid rgba(220,38,38,0.20)", color:"rgb(185,28,28)", fontWeight:800, fontSize:13, marginBottom:12 },
  assignFooter:{ display:"flex", gap:10, justifyContent:"flex-end", borderTop:"1px solid rgba(2,8,23,0.08)", paddingTop:16 },
  cancelBtn:   { padding:"10px 18px", borderRadius:12, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.72)" },
  confirmBtn:  { display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12, border:"none", background:"var(--rs-blue)", color:"#fff", cursor:"pointer", fontWeight:950, fontSize:13 },
  confirmBtnDisabled: { opacity:0.5, cursor:"not-allowed" },
};

export default ViewStudents;