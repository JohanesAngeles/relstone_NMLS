import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  ArrowLeft, Users, CheckCircle, Award, Clock,
  Search, ChevronDown, ChevronUp, BarChart2,
  TrendingUp, BookOpen, Star, FileText, Download,
  Filter,
} from "lucide-react";

/* ─── CourseDetail ───────────────────────────────────────────────── */
const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  const [course,   setCourse]   = useState(null);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [q,        setQ]        = useState("");
  const [filter,   setFilter]   = useState("all"); // all | enrolled | completed | passed | failed
  const [sortBy,   setSortBy]   = useState("name"); // name | score | hours | status | date
  const [sortDir,  setSortDir]  = useState("asc");
  const [expanded,    setExpanded]    = useState(null);
  const [courseSteps, setCourseSteps] = useState([]); // step titles from course content

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch course info + all students for this course
        const [courseRes, studentsRes] = await Promise.all([
          API.get(`/courses/${courseId}`),
          API.get(`/instructor/course/${courseId}/students`),
        ]);
        const courseData = courseRes.data?.course || courseRes.data;
        setCourse(courseData);
        setStudents(studentsRes.data?.students || []);

        // Extract step titles from course content for module name mapping
        // Supports content[], steps[], modules[], sections[]
        const raw = courseData?.content || courseData?.steps || courseData?.modules || courseData?.sections || [];
        // Flatten if nested (some courses have sections with lessons inside)
        const flat = [];
        raw.forEach((item, idx) => {
          if (item.lessons && Array.isArray(item.lessons)) {
            // Section with nested lessons
            item.lessons.forEach((lesson, li) => {
              flat.push({ idx: flat.length, title: lesson.title || lesson.name || item.title || `Module ${flat.length + 1}`, type: lesson.type || item.type });
            });
          } else {
            flat.push({ idx: flat.length, title: item.title || item.name || `Module ${flat.length + 1}`, type: item.type });
          }
        });
        setCourseSteps(flat);
      } catch (err) {
        setError("Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  // ── Derived stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const enrolled  = students.length;
    const completed = students.filter(s => s.completed).length;
    const passed    = students.filter(s => s.passed).length;
    const avgScore  = students.filter(s => s.score != null).length > 0
      ? Math.round(students.filter(s => s.score != null).reduce((a, s) => a + (s.score || 0), 0) / students.filter(s => s.score != null).length)
      : null;
    const avgHours  = students.filter(s => s.seat_hours != null).length > 0
      ? (students.filter(s => s.seat_hours != null).reduce((a, s) => a + (s.seat_hours || 0), 0) / students.filter(s => s.seat_hours != null).length).toFixed(1)
      : null;
    const passRate  = completed > 0 ? Math.round((passed / completed) * 100) : 0;
    const completionRate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
    return { enrolled, completed, passed, avgScore, avgHours, passRate, completionRate };
  }, [students]);

  // ── Filter + Search + Sort ─────────────────────────────────────────
  const displayStudents = useMemo(() => {
    let list = [...students];

    // Filter
    if (filter === "enrolled")  list = list.filter(s => !s.completed);
    if (filter === "completed") list = list.filter(s => s.completed);
    if (filter === "passed")    list = list.filter(s => s.passed);
    if (filter === "failed")    list = list.filter(s => s.completed && !s.passed);

    // Search
    if (q.trim()) {
      const n = q.toLowerCase();
      list = list.filter(s =>
        String(s.name    || "").toLowerCase().includes(n) ||
        String(s.email   || "").toLowerCase().includes(n) ||
        String(s.nmls_id || "").toLowerCase().includes(n)
      );
    }

    // Sort
    list.sort((a, b) => {
      let va, vb;
      if (sortBy === "name")   { va = a.name  || ""; vb = b.name  || ""; }
      if (sortBy === "score")  { va = a.score  ?? -1; vb = b.score  ?? -1; }
      if (sortBy === "hours")  { va = a.seat_hours ?? -1; vb = b.seat_hours ?? -1; }
      if (sortBy === "status") { va = a.completed ? 1 : 0; vb = b.completed ? 1 : 0; }
      if (sortBy === "date")   { va = a.completed_at || ""; vb = b.completed_at || ""; }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    });

    return list;
  }, [students, filter, q, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  if (loading) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.center}><div className="cd-spinner" /></div>
    </div>
  );

  if (error) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.center}><div style={{ color: "crimson", fontWeight: 800 }}>{error}</div></div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Top bar ── */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <button style={S.backBtn} onClick={() => navigate("/instructor/dashboard")} type="button">
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <div style={S.breadcrumb}>
            <span style={{ opacity: 0.5 }}>Instructor Portal</span>
            <span style={{ opacity: 0.35 }}> / </span>
            <span style={{ opacity: 0.5 }}>Courses</span>
            <span style={{ opacity: 0.35 }}> / </span>
            <span>{course?.title || "Course Detail"}</span>
          </div>
        </div>
      </header>

      <div style={S.shell}>

        {/* ── Course Hero ── */}
        <div style={S.hero}>
          <div style={S.heroBg} />
          <div style={S.heroInner}>
            <div style={S.heroLeft}>
              <div style={S.courseTypeBadge}>
                <span style={typeBadge(course?.type)}>{String(course?.type || "").toUpperCase() || "—"}</span>
                {course?.active !== false && <span style={S.activeBadge}>● Active</span>}
              </div>
              <h1 style={S.heroTitle}>{course?.title || "Course"}</h1>
              <div style={S.heroMeta}>
                {course?.credit_hours && <span style={S.heroMetaItem}><Clock size={14} /> {course.credit_hours} credit hours</span>}
                {course?.nmls_course_id && <span style={S.heroMetaItem}><FileText size={14} /> NMLS #{course.nmls_course_id}</span>}
                {course?.state && <span style={S.heroMetaItem}><BookOpen size={14} /> {course.state}</span>}
              </div>
            </div>

            {/* ── KPI strip ── */}
            <div style={S.kpiStrip}>
              <KpiBox value={stats.enrolled}        label="Enrolled"        color="#2EABFE" icon={<Users size={18} />} />
              <KpiBox value={stats.completed}       label="Completed"       color="#00B4B4" icon={<CheckCircle size={18} />} />
              <KpiBox value={stats.passed}          label="Passed"          color="rgba(34,197,94,1)" icon={<Award size={18} />} />
              <KpiBox value={`${stats.passRate}%`}  label="Pass Rate"       color="rgba(34,197,94,1)" icon={<TrendingUp size={18} />} />
              <KpiBox value={`${stats.completionRate}%`} label="Completion" color="#F59E0B" icon={<BarChart2 size={18} />} />
              {stats.avgScore  != null && <KpiBox value={`${stats.avgScore}%`} label="Avg Score" color="#9569F7" icon={<Star size={18} />} />}
              {stats.avgHours  != null && <KpiBox value={`${stats.avgHours}h`} label="Avg Seat Time" color="#2EABFE" icon={<Clock size={18} />} />}
            </div>
          </div>
        </div>

        {/* ── Students table card ── */}
        <div style={S.card}>

          {/* ── Toolbar ── */}
          <div style={S.toolbar}>
            <div style={S.toolbarLeft}>
              <div style={S.searchWrap}>
                <Search size={14} style={{ color: "rgba(9,25,37,0.40)", flexShrink: 0 }} />
                <input style={S.searchInput} value={q} onChange={e => setQ(e.target.value)} placeholder="Search students…" />
              </div>
              <div style={S.chips}>
                {[
                  { key: "all",       label: "All",       count: students.length },
                  { key: "enrolled",  label: "In Progress", count: students.filter(s => !s.completed).length },
                  { key: "completed", label: "Completed", count: stats.completed },
                  { key: "passed",    label: "Passed",    count: stats.passed },
                  { key: "failed",    label: "Failed",    count: students.filter(s => s.completed && !s.passed).length },
                ].map(f => (
                  <button key={f.key} type="button"
                    style={{ ...S.chip, ...(filter === f.key ? S.chipActive : {}) }}
                    onClick={() => setFilter(f.key)}>
                    {f.label}
                    <span style={{ ...S.chipCount, ...(filter === f.key ? S.chipCountActive : {}) }}>{f.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <span style={S.resultCount}>{displayStudents.length} student{displayStudents.length !== 1 ? "s" : ""}</span>
          </div>

          {/* ── Table ── */}
          {displayStudents.length === 0 ? (
            <div style={S.empty}>
              <Users size={28} style={{ color: "rgba(11,18,32,0.20)", margin: "0 auto 12px", display: "block" }} />
              <div style={{ fontWeight: 800, color: "rgba(11,18,32,0.50)" }}>No students found</div>
            </div>
          ) : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <Th label="Student"    col="name"   sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                    <Th label="NMLS ID"    col={null} />
                    <Th label="Status"     col="status"  sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                    <Th label="Score"      col="score"   sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} align="right" />
                    <Th label="Seat Hours" col="hours"   sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} align="right" />
                    <Th label="Completed"  col="date"    sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                    <Th label="Certificate" col={null} />
                    <Th label="Details"    col={null} />
                  </tr>
                </thead>
                <tbody>
                  {displayStudents.map((s, i) => (
                    <StudentRow
                      key={s._id || i}
                      student={s}
                      course={course}
                      courseSteps={courseSteps}
                      expanded={expanded === (s._id || s.email)}
                      onToggle={() => setExpanded(
                        expanded === (s._id || s.email) ? null : (s._id || s.email)
                      )}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── KPI Box ────────────────────────────────────────────────────── */
const KpiBox = ({ value, label, color, icon }) => (
  <div style={S.kpiBox}>
    <div style={{ ...S.kpiIcon, color }}>{icon}</div>
    <div style={{ ...S.kpiValue, color }}>{value}</div>
    <div style={S.kpiLabel}>{label}</div>
  </div>
);

/* ─── Sortable TH ────────────────────────────────────────────────── */
const Th = ({ label, col, sortBy, sortDir, onSort, align }) => (
  <th style={{ ...S.th, textAlign: align || "left", cursor: col ? "pointer" : "default" }}
    onClick={() => col && onSort(col)}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {label}
      {col && sortBy === col && (
        sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />
      )}
    </span>
  </th>
);

/* ─── Student Row ────────────────────────────────────────────────── */
const StudentRow = ({ student: s, course, courseSteps, expanded, onToggle }) => {
  const isCompleted = s.completed;
  const isPassed    = s.passed;
  const isFailed    = isCompleted && !isPassed;
  const score       = s.score    != null ? `${s.score}%` : "—";
  const hours       = s.seat_hours != null ? `${Number(s.seat_hours).toFixed(1)}h` : "—";
  const completedAt = s.completed_at
    ? new Date(s.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const statusStyle = isCompleted
    ? isPassed
      ? { color: "rgba(22,163,74,1)", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)" }
      : { color: "rgba(185,28,28,1)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)" }
    : { color: "#2EABFE", bg: "rgba(46,171,254,0.10)", border: "rgba(46,171,254,0.25)" };

  const statusLabel = isCompleted ? (isPassed ? "Passed" : "Failed") : "In Progress";

  // Quiz breakdown if available
  const quizzes = s.quiz_attempts || [];
  const modules = s.module_progress || [];

  // Build a map: step index → title from course content
  // Used when module_progress entries have no module_title stored
  const stepTitleMap = useMemo(() => {
    const map = {};
    (courseSteps || []).forEach((step, idx) => {
      map[idx] = step.title;
    });
    return map;
  }, [courseSteps]);

  return (
    <>
      <tr className="cd-tr">
        {/* Student */}
        <td style={S.td}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...S.avatar, background: isCompleted ? (isPassed ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)") : "rgba(46,171,254,0.10)", borderColor: isCompleted ? (isPassed ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.25)") : "rgba(46,171,254,0.30)", color: isCompleted ? (isPassed ? "rgba(22,163,74,1)" : "rgba(185,28,28,1)") : "#2EABFE" }}>
              {(s.name || "S")[0].toUpperCase()}
            </div>
            <div>
              <div style={S.studentName}>{s.name || "—"}</div>
              <div style={S.studentEmail}>{s.email || "—"}</div>
            </div>
          </div>
        </td>

        {/* NMLS ID */}
        <td style={S.td}>
          <span style={S.mono}>{s.nmls_id || "—"}</span>
        </td>

        {/* Status */}
        <td style={S.td}>
          <span style={{ ...S.badge, color: statusStyle.color, background: statusStyle.bg, border: `1px solid ${statusStyle.border}` }}>
            {statusLabel}
          </span>
        </td>

        {/* Score */}
        <td style={{ ...S.td, textAlign: "right" }}>
          {s.score != null ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 40, height: 5, borderRadius: 99, background: "rgba(2,8,23,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${s.score}%`, background: s.score >= 70 ? "rgba(34,197,94,0.80)" : "rgba(239,68,68,0.70)" }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 13, color: s.score >= 70 ? "rgba(22,163,74,1)" : "rgba(185,28,28,1)" }}>{score}</span>
            </div>
          ) : <span style={S.dash}>—</span>}
        </td>

        {/* Seat Hours */}
        <td style={{ ...S.td, textAlign: "right" }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.75)" }}>{hours}</span>
        </td>

        {/* Completed date */}
        <td style={S.td}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.55)" }}>{completedAt}</span>
        </td>

        {/* Certificate */}
        <td style={S.td}>
          {s.certificate_url ? (
            <a href={s.certificate_url} target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 900, color: "#00B4B4", textDecoration: "none" }}>
              <Award size={13} /> View
            </a>
          ) : <span style={S.dash}>—</span>}
        </td>

        {/* Details toggle */}
        <td style={S.td}>
          <button type="button" style={S.detailsBtn} onClick={onToggle}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>

      {/* ── Expanded detail row ── */}
      {expanded && (
        <tr>
          <td colSpan={8} style={S.expandedCell}>
            <div style={S.expandedInner}>

              {/* Progress bar */}
              <div style={S.expandedSection}>
                <div style={S.expandedLabel}>Course Progress</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 99, background: "rgba(2,8,23,0.08)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${s.progress || 0}%`, background: "linear-gradient(90deg,#2EABFE,#00B4B4)", transition: "width .4s" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: "#2EABFE", minWidth: 36 }}>{s.progress || 0}%</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* Quiz attempts */}
                {quizzes.length > 0 && (
                  <div style={S.expandedSection}>
                    <div style={S.expandedLabel}>Quiz Attempts ({quizzes.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[...quizzes].sort((a, b) => {
                        if (a.quiz_type === 'final_exam' && b.quiz_type !== 'final_exam') return 1;
                        if (b.quiz_type === 'final_exam' && a.quiz_type !== 'final_exam') return -1;
                        return new Date(a.submitted_at) - new Date(b.submitted_at);
                      }).map((q, i) => (
                        <div key={i} style={S.quizRow}>
                          <div style={{ flex: 1 }}>
                            <div style={S.quizTitle}>{q.quiz_title || q.quiz_id || `Quiz ${i + 1}`}</div>
                            <div style={{ fontSize: 11, color: "rgba(11,18,32,0.45)", fontWeight: 700, marginTop: 2 }}>
                              {q.correct}/{q.total} correct · {q.time_spent_seconds ? `${Math.round(q.time_spent_seconds / 60)}min` : "—"}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 50, height: 5, borderRadius: 99, background: "rgba(2,8,23,0.08)", overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 99, width: `${q.score_pct}%`, background: q.passed ? "rgba(34,197,94,0.80)" : "rgba(239,68,68,0.70)" }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 900, color: q.passed ? "rgba(22,163,74,1)" : "rgba(185,28,28,1)", minWidth: 36 }}>
                              {q.score_pct}%
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 999, background: q.passed ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.08)", color: q.passed ? "rgba(22,163,74,1)" : "rgba(185,28,28,1)", border: `1px solid ${q.passed ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.22)"}` }}>
                              {q.passed ? "Pass" : "Fail"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Module progress */}
                {modules.length > 0 && (() => {
                  // Deduplicate by module_order — skip checkpoints, keep best entry per module
                  const deduped = Object.values(
                    modules.reduce((acc, m) => {
                      const title = String(m.module_title || "").toLowerCase();
                      // Skip checkpoint entries
                      if (title.includes("checkpoint")) return acc;
                      const key = m.module_order;
                      if (!acc[key] || m.completed || new Date(m.completed_at) > new Date(acc[key].completed_at || 0)) {
                        acc[key] = m;
                      }
                      return acc;
                    }, {})
                  ).sort((a, b) => {
                    if (a.module_order === 999) return 1;
                    if (b.module_order === 999) return -1;
                    return a.module_order - b.module_order;
                  });

                  return (
                    <div style={S.expandedSection}>
                      <div style={S.expandedLabel}>Module Progress ({deduped.length})</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {deduped.map((m, i) => (
                          <div key={i} style={S.moduleRow}>
                            <div style={{ ...S.moduleStatus, background: m.completed ? "rgba(34,197,94,0.10)" : "rgba(2,8,23,0.05)", border: `1px solid ${m.completed ? "rgba(34,197,94,0.25)" : "rgba(2,8,23,0.10)"}` }}>
                              {m.completed
                                ? <CheckCircle size={12} style={{ color: "rgba(22,163,74,1)" }} />
                                : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(2,8,23,0.25)" }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={S.moduleName}>
                                {m.module_order === 999
                                  ? "Final Exam"
                                  : m.module_title
                                    ? m.module_title
                                    : stepTitleMap[m.module_order - 1]
                                      ? stepTitleMap[m.module_order - 1]
                                      : stepTitleMap[m.module_order]
                                        ? stepTitleMap[m.module_order]
                                        : `Module ${m.module_order}`}
                              </div>
                              {m.seat_seconds > 0 && (
                                <div style={{ fontSize: 11, color: "rgba(11,18,32,0.45)", fontWeight: 700, marginTop: 1 }}>
                                  {(m.seat_seconds / 3600).toFixed(1)}h seat time
                                </div>
                              )}
                            </div>
                            {m.quiz_score != null && (
                              <span style={{ fontSize: 12, fontWeight: 800, color: m.quiz_passed ? "rgba(22,163,74,1)" : "rgba(185,28,28,1)" }}>
                                {m.quiz_score}%
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* No detail data fallback */}
                {quizzes.length === 0 && modules.length === 0 && (
                  <div style={{ ...S.expandedSection, gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 13, color: "rgba(11,18,32,0.40)", fontWeight: 700, textAlign: "center", padding: "12px 0" }}>
                      No detailed quiz or module data available for this student.
                    </div>
                  </div>
                )}
              </div>

              {/* Summary row */}
              <div style={S.summaryRow}>
                <SummaryPill label="Total Seat Time" value={hours} />
                <SummaryPill label="Final Score"     value={score} />
                <SummaryPill label="Quiz Attempts"   value={quizzes.length || "—"} />
                <SummaryPill label="Modules Done"    value={modules.filter(m => m.completed).length || "—"} />
                <SummaryPill label="Status"          value={statusLabel} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const SummaryPill = ({ label, value }) => (
  <div style={S.summaryPill}>
    <div style={S.summaryValue}>{value}</div>
    <div style={S.summaryLabel}>{label}</div>
  </div>
);

/* ─── Style helpers ──────────────────────────────────────────────── */
const typeBadge = (type) => {
  const t = String(type || "").toUpperCase();
  const base = { display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900, border: "1px solid transparent" };
  if (t === "PE") return { ...base, color: "#fff", background: "rgba(46,171,254,0.85)", borderColor: "rgba(46,171,254,0.40)" };
  if (t === "CE") return { ...base, color: "#fff", background: "rgba(0,180,180,0.85)",  borderColor: "rgba(0,180,180,0.40)" };
  return { ...base, color: "#fff", background: "rgba(255,255,255,0.20)", borderColor: "rgba(255,255,255,0.30)" };
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root{--rs-dark:#091925;--rs-blue:#2EABFE;--rs-teal:#00B4B4;--rs-bg:#f6f7fb;}
*{box-sizing:border-box;}
body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--rs-bg);}
.cd-spinner{width:36px;height:36px;border-radius:50%;border:3px solid rgba(2,8,23,0.10);border-top-color:var(--rs-teal);animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.cd-tr:hover{background:rgba(0,180,180,0.03);}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:    { minHeight: "100vh", background: "var(--rs-bg)", fontFamily: "Inter,system-ui,sans-serif" },
  center:  { minHeight: "100vh", display: "grid", placeItems: "center" },
  topbar:  { background: "#fff", borderBottom: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 2px 12px rgba(2,8,23,0.05)" },
  topbarInner: { maxWidth: 1280, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: 16 },
  backBtn: { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(0,180,180,0.28)", background: "rgba(0,180,180,0.07)", color: "var(--rs-teal)", cursor: "pointer", fontWeight: 900, fontSize: 13, flexShrink: 0 },
  breadcrumb: { fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.80)" },
  shell:   { maxWidth: 1280, margin: "0 auto", padding: "20px 20px 48px" },

  // Hero
  hero:    { position: "relative", borderRadius: 20, overflow: "hidden", background: "linear-gradient(120deg,#091925 0%,#0a2a2a 50%,#00B4B4 100%)", marginBottom: 16, boxShadow: "0 18px 48px rgba(2,8,23,0.18)" },
  heroBg:  { position: "absolute", inset: 0, background: "radial-gradient(800px 400px at 20% 30%,rgba(0,180,180,0.18),transparent 60%)", pointerEvents: "none" },
  heroInner: { position: "relative", padding: "24px 28px" },
  heroLeft:  { marginBottom: 20 },
  courseTypeBadge: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  activeBadge: { fontSize: 12, fontWeight: 800, color: "rgba(34,197,94,0.90)", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.30)", padding: "3px 10px", borderRadius: 999 },
  heroTitle: { fontSize: 22, fontWeight: 950, color: "#fff", letterSpacing: "-0.3px", margin: "0 0 10px", lineHeight: 1.2 },
  heroMeta:  { display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" },
  heroMetaItem: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.65)" },

  // KPI strip
  kpiStrip: { display: "flex", gap: 12, flexWrap: "wrap" },
  kpiBox:   { background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, padding: "12px 16px", minWidth: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  kpiIcon:  { display: "flex", opacity: 0.85 },
  kpiValue: { fontWeight: 950, fontSize: 22, letterSpacing: "-0.5px" },
  kpiLabel: { fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" },

  // Card
  card:    { background: "#fff", borderRadius: 20, border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 8px 28px rgba(2,8,23,0.07)", overflow: "hidden" },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 16px", borderBottom: "1px solid rgba(2,8,23,0.07)", flexWrap: "wrap" },
  toolbarLeft: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)", minWidth: 220 },
  searchInput:{ border: "none", outline: "none", flex: 1, fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.82)", background: "transparent" },
  chips:   { display: "flex", gap: 7, flexWrap: "wrap" },
  chip:    { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 12, color: "rgba(11,18,32,0.60)" },
  chipActive: { borderColor: "rgba(0,180,180,0.38)", color: "var(--rs-dark)", boxShadow: "0 0 0 3px rgba(0,180,180,0.12)" },
  chipCount:  { minWidth: 18, height: 18, borderRadius: 999, background: "rgba(2,8,23,0.08)", fontSize: 10, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px", color: "rgba(11,18,32,0.55)" },
  chipCountActive: { background: "rgba(0,180,180,0.15)", color: "var(--rs-teal)" },
  resultCount: { fontSize: 12, fontWeight: 900, color: "rgba(11,18,32,0.45)", whiteSpace: "nowrap" },

  // Table
  tableWrap: { overflowX: "auto" },
  table:     { width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 950 },
  th:        { fontSize: 11, fontWeight: 950, color: "rgba(11,18,32,0.48)", padding: "11px 16px", borderBottom: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.018)", whiteSpace: "nowrap", userSelect: "none" },
  td:        { padding: "13px 16px", borderBottom: "1px solid rgba(2,8,23,0.05)", fontSize: 13, verticalAlign: "middle" },
  avatar:    { width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, flexShrink: 0 },
  studentName:  { fontWeight: 800, color: "rgba(11,18,32,0.88)", fontSize: 13 },
  studentEmail: { fontSize: 11, color: "rgba(11,18,32,0.48)", fontWeight: 600, marginTop: 2 },
  mono:      { fontFamily: "monospace", fontSize: 12, color: "rgba(11,18,32,0.65)", fontWeight: 700 },
  badge:     { display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900 },
  dash:      { color: "rgba(11,18,32,0.28)", fontWeight: 700 },
  detailsBtn:{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.60)" },
  empty:     { padding: "48px 24px", textAlign: "center" },

  // Expanded row
  expandedCell:  { padding: "0 16px 16px 60px", background: "rgba(0,180,180,0.025)", borderBottom: "1px solid rgba(2,8,23,0.06)" },
  expandedInner: { display: "flex", flexDirection: "column", gap: 16, paddingTop: 14 },
  expandedSection: { display: "flex", flexDirection: "column", gap: 10 },
  expandedLabel:   { fontSize: 11, fontWeight: 900, color: "rgba(11,18,32,0.45)", textTransform: "uppercase", letterSpacing: "0.5px" },

  // Quiz row
  quizRow:   { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "#fff", border: "1px solid rgba(2,8,23,0.07)" },
  quizTitle: { fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.82)" },

  // Module row
  moduleRow:    { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#fff", border: "1px solid rgba(2,8,23,0.07)" },
  moduleStatus: { width: 26, height: 26, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  moduleName:   { fontWeight: 700, fontSize: 13, color: "rgba(11,18,32,0.80)" },

  // Summary strip
  summaryRow:  { display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 4, borderTop: "1px solid rgba(2,8,23,0.07)" },
  summaryPill: { padding: "8px 14px", borderRadius: 12, background: "rgba(2,8,23,0.03)", border: "1px solid rgba(2,8,23,0.08)", display: "flex", flexDirection: "column", gap: 2 },
  summaryValue:{ fontWeight: 900, fontSize: 14, color: "rgba(11,18,32,0.85)" },
  summaryLabel:{ fontSize: 10, fontWeight: 700, color: "rgba(11,18,32,0.42)", textTransform: "uppercase", letterSpacing: "0.4px" },
};

export default CourseDetail;