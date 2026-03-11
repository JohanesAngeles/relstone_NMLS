import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import logo from "../../assets/images/Left Side Logo.png";
import {
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  ChevronRight,
  BarChart2,
  TrendingUp,
  Search,
  MoreHorizontal,
  PlayCircle,
  AlertCircle,
  Star,
} from "lucide-react";

/* ─── Logout Confirm (inline) ────────────────────────────────────── */
const LogoutConfirm = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(9,25,37,0.55)", backdropFilter: "blur(5px)",
    }} />
    <div style={{
      position: "fixed", zIndex: 301,
      top: "50%", left: "50%", transform: "translate(-50%,-50%)",
      width: "100%", maxWidth: 360,
      background: "#fff", borderRadius: 22, padding: "32px 28px 26px",
      boxShadow: "0 28px 70px rgba(9,25,37,0.20), 0 0 0 1px rgba(9,25,37,0.06)",
      textAlign: "center", fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 18, margin: "0 auto 18px",
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(220,38,38,0.85)",
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 950, color: "rgba(11,18,32,0.88)", marginBottom: 8 }}>
        Sign out?
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.52)", lineHeight: 1.6, marginBottom: 24 }}>
        Are you sure you want to sign out of your account?
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} type="button" style={{
          flex: 1, height: 44, background: "rgba(2,8,23,0.04)",
          border: "1px solid rgba(2,8,23,0.10)", borderRadius: 12,
          cursor: "pointer", fontSize: 14, fontWeight: 900,
          color: "rgba(11,18,32,0.72)", fontFamily: "inherit",
        }}>No, stay</button>
        <button onClick={onConfirm} type="button" style={{
          flex: 1, height: 44, background: "rgba(220,38,38,0.90)",
          border: "none", borderRadius: 12, cursor: "pointer",
          fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "inherit",
          boxShadow: "0 4px 14px rgba(220,38,38,0.25)",
        }}>Yes, sign out</button>
      </div>
    </div>
  </>
);

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData]           = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [q, setQ]                 = useState("");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/instructor/dashboard");
        setData(res.data);
      } catch (err) {
        // Graceful fallback — show empty states instead of crashing
        if (err.response?.status === 404) {
          setData({});
        } else {
          setError("Failed to load instructor dashboard");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => { logout(); window.location.href = "/"; };

  // ── derived data ──────────────────────────────────────────────────
  const courses          = data?.courses          || [];
  const students         = data?.students         || [];
  const totalEnrollments = data?.total_enrollments ?? 0;
  const totalCompletions = data?.total_completions  ?? 0;
  const pendingReviews   = data?.pending_reviews    ?? 0;
  const activeCourses    = courses.filter((c) => c.active).length;

  const filteredStudents = useMemo(() => {
    if (!q.trim()) return students;
    const needle = q.toLowerCase();
    return students.filter((s) =>
      String(s.name        || "").toLowerCase().includes(needle) ||
      String(s.email       || "").toLowerCase().includes(needle) ||
      String(s.course_title|| "").toLowerCase().includes(needle)
    );
  }, [students, q]);

  const recentCourses = useMemo(() => [...courses].slice(0, 3), [courses]);

  // ── loading ───────────────────────────────────────────────────────
  if (loading) return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.center}>
        <div className="rs-spinner" />
        <div style={{ marginTop: 12, color: "rgba(11,18,32,0.65)" }}>
          Loading instructor dashboard…
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.center}>
        <div className="rs-alert">
          <span className="rs-alert-dot" />
          <span>{error}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Logout confirm dialog ────────────────────────────────── */}
      {showLogout && (
        <LogoutConfirm
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.brandLeft}>
            <img src={logo} alt="Relstone" style={S.brandLogo} />
            <div>
              <div style={S.brandTitle}>NMLS Instructor Portal</div>
              <div style={S.brandSubtitle}>
                Manage your courses and track student progress
              </div>
            </div>
          </div>

          <div style={S.topbarRight}>
            {/* role badge */}
            <div style={S.instructorPill}>
              <Star size={13} style={{ color: "var(--rs-teal)" }} />
              <span style={{ fontWeight: 900, fontSize: 12, color: "var(--rs-teal)" }}>
                Instructor
              </span>
            </div>

            <div style={S.userPill}>
              <div style={S.userAvatar}>
                {(user?.name || "I")[0].toUpperCase()}
              </div>
              <span style={S.userName}>{user?.name || "Instructor"}</span>
            </div>

            <button style={S.logoutBtn} onClick={() => setShowLogout(true)} type="button">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Page shell ──────────────────────────────────────────── */}
      <div style={S.shell}>

        {/* ── Hero card ─────────────────────────────────────────── */}
        <section style={S.hero}>
          <div style={S.heroBg} aria-hidden="true" />

          <div style={S.heroInner}>
            <div style={S.heroTop}>
              <div>
                <div style={S.heroKicker}>Instructor Overview</div>
                <div style={S.heroHeadline}>
                  Welcome back, {user?.name?.split(" ")[0] || "Instructor"}! 👋
                </div>
                <div style={S.heroSub}>
                  Here's a snapshot of your teaching activity.
                </div>
              </div>

              <div style={S.heroActions}>
                <button
                  style={S.heroBtn}
                  type="button"
                  onClick={() => setActiveTab("courses")}
                >
                  <BookOpen size={16} />
                  <span>My Courses</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  style={{ ...S.heroBtn, ...S.heroBtnAlt }}
                  type="button"
                  onClick={() => navigate("/instructor/students")}
                >
                  <Users size={16} />
                  <span>View Students</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* KPI grid */}
            <div style={S.kpiGrid}>
              <KpiCard
                icon={<PlayCircle size={20} />}
                title="Active Courses"
                value={activeCourses}
                caption="Published"
                tone="teal"
              />
              <KpiCard
                icon={<Users size={20} />}
                title="Total Enrolled"
                value={totalEnrollments}
                caption="Students"
                tone="blue"
              />
              <KpiCard
                icon={<CheckCircle size={20} />}
                title="Completions"
                value={totalCompletions}
                caption="All time"
                tone="green"
              />
              <KpiCard
                icon={<AlertCircle size={20} />}
                title="Pending Reviews"
                value={pendingReviews}
                caption="Needs action"
                tone="amber"
              />
            </div>
          </div>
        </section>

        {/* ── Tab card ──────────────────────────────────────────── */}
        <section style={S.card}>
          {/* tab row */}
          <div style={S.tabRow}>
            <div style={S.tabs}>
              <TabButton label="Overview"   active={activeTab === "overview"}  onClick={() => setActiveTab("overview")} />
              <TabButton label="My Courses" active={activeTab === "courses"}   onClick={() => setActiveTab("courses")} />
              <TabButton label="Students"   active={activeTab === "students"}  onClick={() => setActiveTab("students")} />
            </div>

            {activeTab === "students" && (
              <div style={S.searchWrap}>
                <Search size={15} style={{ color: "rgba(9,25,37,0.45)" }} />
                <input
                  style={S.searchInput}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search students…"
                />
              </div>
            )}
          </div>

          {/* tab body */}
          <div style={S.cardBody}>

            {/* ── OVERVIEW ────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div style={S.gridTwo}>

                {/* left: recent courses */}
                <div style={S.panel}>
                  <div style={S.panelHead}>
                    <div style={S.panelTitle}>Recent Courses</div>
                    <button
                      style={S.ghostBtn}
                      type="button"
                      onClick={() => setActiveTab("courses")}
                    >
                      View all <ChevronRight size={15} />
                    </button>
                  </div>

                  {recentCourses.length === 0 ? (
                    <EmptyState
                      icon={<BookOpen size={18} />}
                      title="No courses yet"
                      subtitle="Courses assigned to you will appear here."
                      actionLabel="Refresh"
                      onAction={() => window.location.reload()}
                    />
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {recentCourses.map((c, i) => (
                        <CourseMiniRow key={i} course={c} />
                      ))}
                    </div>
                  )}
                </div>

                {/* right: quick actions */}
                <div style={S.panel}>
                  <div style={S.panelHead}>
                    <div style={S.panelTitle}>Quick Actions</div>
                  </div>
                  <div style={S.quickActions}>
                    <ActionCard
                      icon={<BookOpen size={17} />}
                      title="Manage Courses"
                      sub="View and update your assigned courses"
                      onClick={() => setActiveTab("courses")}
                    />
                    <ActionCard
                      icon={<Users size={17} />}
                      title="View Students"
                      sub="Monitor enrollment and completion"
                      onClick={() => setActiveTab("students")}
                    />
                    <ActionCard
                      icon={<BarChart2 size={17} />}
                      title="Performance"
                      sub={`${totalCompletions} completions across all courses`}
                      onClick={() => {}}
                    />
                    <ActionCard
                      icon={<TrendingUp size={17} />}
                      title="Pass Rate Overview"
                      sub={`${activeCourses} active course${activeCourses !== 1 ? "s" : ""} running`}
                      onClick={() => {}}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── MY COURSES ──────────────────────────────────── */}
            {activeTab === "courses" && (
              <div>
                <div style={S.sectionHead}>
                  <div>
                    <div style={S.sectionTitle}>My Courses</div>
                    <div style={S.sectionSub}>
                      {courses.length} course{courses.length !== 1 ? "s" : ""} assigned
                      &nbsp;·&nbsp;
                      {activeCourses} active
                    </div>
                  </div>
                </div>

                {courses.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen size={18} />}
                    title="No courses assigned"
                    subtitle="Courses assigned to you as instructor will appear here."
                    actionLabel="Refresh"
                    onAction={() => window.location.reload()}
                  />
                ) : (
                  <div style={S.courseGrid}>
                    {courses.map((c, i) => (
                      <CourseCard key={i} course={c} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STUDENTS ────────────────────────────────────── */}
            {activeTab === "students" && (
              <div>
                <div style={S.sectionHead}>
                  <div>
                    <div style={S.sectionTitle}>Enrolled Students</div>
                    <div style={S.sectionSub}>
                      {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
                      {q.trim() ? " matching search" : " enrolled across your courses"}
                    </div>
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <EmptyState
                    icon={<Users size={18} />}
                    title={q.trim() ? "No students found" : "No students yet"}
                    subtitle={
                      q.trim()
                        ? "Try a different name or course."
                        : "Students enrolled in your courses will appear here."
                    }
                    actionLabel="Clear search"
                    onAction={() => setQ("")}
                  />
                ) : (
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>Student</th>
                          <th style={S.th}>Course</th>
                          <th style={S.th}>Status</th>
                          <th style={S.thRight}>Progress</th>
                          <th style={S.th}>Enrolled</th>
                          <th style={S.th}>Certificate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((s, i) => (
                          <StudentRow key={i} student={s} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

/* ─── Sub-components ──────────────────────────────────────────────── */

const TabButton = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick}
    style={{ ...S.tabBtn, ...(active ? S.tabBtnActive : {}) }}>
    {label}
  </button>
);

const KpiCard = ({ icon, title, value, caption, tone }) => {
  const toneMap = {
    teal:  { bg: "rgba(0,180,180,0.10)",  border: "rgba(0,180,180,0.22)"  },
    blue:  { bg: "rgba(46,171,254,0.10)", border: "rgba(46,171,254,0.25)" },
    green: { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.22)"  },
    amber: { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)" },
  };
  const t = toneMap[tone] || toneMap.teal;
  return (
    <div style={{ ...S.kpiCard, background: t.bg, borderColor: t.border }}>
      <div style={S.kpiIcon}>{icon}</div>
      <div style={S.kpiText}>
        <div style={S.kpiTitle}>{title}</div>
        <div style={S.kpiValue}>{value}</div>
        <div style={S.kpiCaption}>{caption}</div>
      </div>
    </div>
  );
};

const CourseMiniRow = ({ course }) => {
  const type      = String(course?.type || "").toUpperCase();
  const enrolled  = course?.enrollment_count ?? course?.enrolled ?? 0;
  const completed = course?.completion_count  ?? course?.completed ?? 0;
  const active    = course?.active ?? true;
  return (
    <div style={S.rowCard}>
      <div style={{ display: "grid", gap: 6, flex: 1 }}>
        <div style={S.rowTop}>
          <div style={S.rowTitle}>{course?.title || "Course"}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={typeBadge(type)}>{type || "—"}</span>
            <span style={activeBadge(active)}>{active ? "Active" : "Inactive"}</span>
          </div>
        </div>
        <div style={S.rowMeta}>
          <span style={S.metaItem}><Users size={13} /> {enrolled} enrolled</span>
          <span style={S.metaItem}><CheckCircle size={13} /> {completed} completed</span>
          <span style={S.metaItem}>
            <BarChart2 size={13} />
            {enrolled > 0 ? `${Math.round((completed / enrolled) * 100)}% pass rate` : "No data"}
          </span>
        </div>
      </div>
      <ChevronRight size={17} style={{ color: "rgba(9,25,37,0.35)" }} />
    </div>
  );
};

const CourseCard = ({ course }) => {
  const type      = String(course?.type || "").toUpperCase();
  const creditHrs = course?.credit_hours ?? 0;
  const enrolled  = course?.enrollment_count ?? course?.enrolled  ?? 0;
  const completed = course?.completion_count  ?? course?.completed ?? 0;
  const active    = course?.active ?? true;
  const passRate  = enrolled > 0
    ? `${Math.round((completed / enrolled) * 100)}%` : "—";

  return (
    <div style={S.courseCard}>
      <div style={S.courseCardTop}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={typeBadge(type)}>{type || "—"}</span>
          <span style={activeBadge(active)}>{active ? "Active" : "Inactive"}</span>
        </div>
        <button style={S.moreBtn} type="button">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div style={S.courseCardTitle}>{course?.title || "Course"}</div>
      <div style={S.courseCardMeta}>
        <span style={S.metaItem}><Clock size={13} /> {creditHrs} credit hours</span>
      </div>

      <div style={S.courseCardDivider} />

      <div style={S.courseStatsRow}>
        <CourseStat icon={<Users size={14} />}       label="Enrolled"   value={enrolled}  color="var(--rs-blue)" />
        <CourseStat icon={<CheckCircle size={14} />} label="Completed"  value={completed} color="rgba(0,180,180,1)" />
        <CourseStat icon={<BarChart2 size={14} />}   label="Pass Rate"  value={passRate}  color="rgba(34,197,94,1)" />
      </div>
    </div>
  );
};

const CourseStat = ({ icon, label, value, color }) => (
  <div style={S.courseStat}>
    <div style={{ ...S.courseStatIcon, color }}>{icon}</div>
    <div style={{ ...S.courseStatValue, color }}>{value}</div>
    <div style={S.courseStatLabel}>{label}</div>
  </div>
);

const StudentRow = ({ student }) => {
  const status   = String(student?.status || "enrolled").toLowerCase();
  const progress = student?.progress ?? 0;
  const enrolled = student?.enrolled_at
    ? new Date(student.enrolled_at).toLocaleDateString() : "—";

  return (
    <tr className="rs-tr">
      <td style={S.td}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={S.studentAvatar}>
            {(student?.name || "S")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: "rgba(11,18,32,0.88)", fontSize: 13 }}>
              {student?.name || "Student"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(11,18,32,0.50)", fontWeight: 700 }}>
              {student?.email || "—"}
            </div>
          </div>
        </div>
      </td>
      <td style={S.td}>
        <span style={{ fontWeight: 700, color: "rgba(11,18,32,0.75)", fontSize: 13 }}>
          {student?.course_title || student?.course || "—"}
        </span>
      </td>
      <td style={S.td}>
        <span style={studentStatusStyle(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
      <td style={S.tdRight}>
        <div style={S.progressWrap}>
          <div style={S.progressBar}>
            <div style={{ ...S.progressFill, width: `${Math.min(progress, 100)}%` }} />
          </div>
          <span style={S.progressLabel}>{progress}%</span>
        </div>
      </td>
      <td style={S.td}>{enrolled}</td>
      <td style={S.td}>
        {student?.certificate_url ? (
          <a
            href={student.certificate_url}
            target="_blank"
            rel="noreferrer"
            className="rs-link"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13 }}
          >
            <Award size={14} /> View
          </a>
        ) : (
          <span style={{ color: "rgba(11,18,32,0.35)" }}>—</span>
        )}
      </td>
    </tr>
  );
};

const ActionCard = ({ icon, title, sub, onClick }) => (
  <button style={S.actionCard} type="button" onClick={onClick}>
    <div style={S.actionIcon}>{icon}</div>
    <div style={S.actionText}>
      <div style={S.actionTitle}>{title}</div>
      <div style={S.actionSub}>{sub}</div>
    </div>
    <ChevronRight size={17} />
  </button>
);

const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }) => (
  <div style={S.emptyWrap}>
    <div style={S.emptyIcon}>{icon}</div>
    <div style={S.emptyTitle}>{title}</div>
    <div style={S.emptySub}>{subtitle}</div>
    <button style={S.primaryBtnSmall} type="button" onClick={onAction}>
      {actionLabel} <ChevronRight size={15} />
    </button>
  </div>
);

/* ─── Style helpers ───────────────────────────────────────────────── */
const typeBadge = (type) => {
  const isPE = type === "PE";
  const isCE = type === "CE";
  const base = {
    display: "inline-flex", alignItems: "center",
    padding: "4px 9px", borderRadius: 999,
    fontSize: 11, fontWeight: 900, letterSpacing: "0.2px",
    border: "1px solid transparent",
  };
  if (isPE) return { ...base, color: "var(--rs-blue)", background: "rgba(46,171,254,0.12)", borderColor: "rgba(46,171,254,0.22)" };
  if (isCE) return { ...base, color: "rgba(0,140,140,1)", background: "rgba(0,180,180,0.12)", borderColor: "rgba(0,180,180,0.20)" };
  return { ...base, color: "rgba(9,25,37,0.65)", background: "rgba(2,8,23,0.06)", borderColor: "rgba(2,8,23,0.10)" };
};

const activeBadge = (active) => ({
  display: "inline-flex", alignItems: "center",
  padding: "4px 9px", borderRadius: 999,
  fontSize: 11, fontWeight: 900,
  color:        active ? "rgba(22,163,74,1)"   : "rgba(120,120,120,1)",
  background:   active ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.04)",
  border:       `1px solid ${active ? "rgba(34,197,94,0.22)" : "rgba(0,0,0,0.08)"}`,
});

const studentStatusStyle = (status) => {
  const base = {
    display: "inline-flex", alignItems: "center",
    padding: "5px 10px", borderRadius: 999,
    fontSize: 11, fontWeight: 900,
    border: "1px solid transparent",
    textTransform: "capitalize",
  };
  if (status === "completed") return { ...base, color: "rgba(0,140,140,1)", background: "rgba(0,180,180,0.12)", borderColor: "rgba(0,180,180,0.20)" };
  if (status === "enrolled")  return { ...base, color: "var(--rs-blue)",     background: "rgba(46,171,254,0.12)", borderColor: "rgba(46,171,254,0.22)" };
  return { ...base, color: "rgba(180,120,0,1)", background: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.22)" };
};

/* ─── Styles ──────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root {
  --rs-dark:   #091925;
  --rs-blue:   #2EABFE;
  --rs-teal:   #00B4B4;
  --rs-grad:   linear-gradient(110deg, #091925 0%, #0a2a2a 45%, #00B4B4 100%);
  --rs-bg:     #f6f7fb;
  --rs-text:   rgba(11,18,32,0.92);
  --rs-muted:  rgba(11,18,32,0.58);
  --rs-border: rgba(2,8,23,0.10);
  --rs-shadow: 0 18px 48px rgba(2,8,23,0.10);
  --rs-ring:   rgba(0,180,180,0.22);
}

* { box-sizing: border-box; }
body { margin:0; font-family: Inter, system-ui, -apple-system, sans-serif; background: var(--rs-bg); color: var(--rs-text); }

.rs-link { color: var(--rs-teal); text-decoration: none; font-weight: 800; }
.rs-link:hover { text-decoration: underline; }

.rs-spinner {
  width: 36px; height: 36px; border-radius: 999px;
  border: 3px solid rgba(2,8,23,0.10);
  border-top-color: var(--rs-teal);
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.rs-alert {
  display:flex; gap:10px; align-items:flex-start;
  padding:12px 14px; border-radius:14px;
  border:1px solid rgba(0,180,180,0.25);
  background: rgba(0,180,180,0.08);
  color: var(--rs-dark); font-size:13px;
}
.rs-alert-dot { width:10px; height:10px; border-radius:999px; background: var(--rs-teal); margin-top:4px; }

.rs-tr:hover { background: rgba(0,180,180,0.04); }
`;

const S = {
  page:   { minHeight: "100vh", background: "var(--rs-bg)" },
  center: { minHeight: "100vh", display: "grid", placeItems: "center" },

  topbar: {
    position: "sticky", top: 0, zIndex: 20,
    background: "rgba(246,247,251,0.82)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
  },
  topbarInner: {
    maxWidth: 1200, margin: "0 auto",
    padding: "13px 18px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 12,
  },
  brandLeft:    { display: "flex", alignItems: "center", gap: 12 },
  brandLogo:    { height: 32, objectFit: "contain" },
  brandTitle:   { fontWeight: 900, letterSpacing: "-0.2px", fontSize: 15 },
  brandSubtitle:{ fontSize: 11, color: "var(--rs-muted)", marginTop: 2, fontWeight: 700 },

  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  instructorPill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 12px", borderRadius: 999,
    border: "1px solid rgba(0,180,180,0.28)",
    background: "rgba(0,180,180,0.08)",
  },
  userPill: {
    display: "inline-flex", alignItems: "center", gap: 9,
    padding: "8px 12px", borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    boxShadow: "0 4px 14px rgba(2,8,23,0.06)",
  },
  userAvatar: {
    width: 26, height: 26, borderRadius: "50%",
    background: "linear-gradient(135deg,#091925,#054040)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--rs-teal)", fontWeight: 900, fontSize: 12,
  },
  userName: { fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.80)" },
  logoutBtn: {
    padding: "9px 14px", borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)", background: "#fff",
    cursor: "pointer", fontWeight: 900, fontSize: 13,
    color: "rgba(11,18,32,0.72)",
  },

  shell: { maxWidth: 1200, margin: "0 auto", padding: "18px 18px 40px" },

  hero: {
    position: "relative", borderRadius: 24, overflow: "hidden",
    background: "var(--rs-grad)",
    boxShadow: "0 22px 60px rgba(2,8,23,0.18)",
  },
  heroBg: {
    position: "absolute", inset: 0,
    background: "radial-gradient(900px 500px at 18% 28%, rgba(0,180,180,0.22), transparent 60%), radial-gradient(700px 500px at 90% 85%, rgba(255,255,255,0.08), transparent 55%)",
    pointerEvents: "none",
  },
  heroInner:   { position: "relative", padding: 22 },
  heroTop: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", gap: 16,
    flexWrap: "wrap", paddingBottom: 16,
  },
  heroKicker:  { color: "rgba(255,255,255,0.72)", fontWeight: 800, fontSize: 11, letterSpacing: "0.6px" },
  heroHeadline:{ color: "#fff", fontWeight: 950, fontSize: 20, letterSpacing: "-0.3px", marginTop: 5 },
  heroSub:     { color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: 13, marginTop: 4 },
  heroActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  heroBtn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "11px 14px", borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(9,25,37,0.32)",
    color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 13,
    boxShadow: "0 8px 22px rgba(2,8,23,0.18)",
  },
  heroBtnAlt: { background: "rgba(0,180,180,0.22)", borderColor: "rgba(0,180,180,0.35)" },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: 12, paddingTop: 4,
  },
  kpiCard: {
    display: "flex", alignItems: "center", gap: 13,
    padding: 14, borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.10)",
  },
  kpiIcon: {
    width: 44, height: 44, borderRadius: 16,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "grid", placeItems: "center", color: "#fff", flexShrink: 0,
  },
  kpiText:    { display: "grid", gap: 2 },
  kpiTitle:   { color: "rgba(255,255,255,0.72)", fontWeight: 800, fontSize: 11 },
  kpiValue:   { color: "#fff", fontWeight: 950, fontSize: 26, letterSpacing: "-0.5px" },
  kpiCaption: { color: "rgba(255,255,255,0.62)", fontWeight: 700, fontSize: 11 },

  card: {
    marginTop: 14, borderRadius: 22,
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(2,8,23,0.08)",
    boxShadow: "var(--rs-shadow)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  tabRow: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 12,
    flexWrap: "wrap", padding: "14px 14px 10px",
    borderBottom: "1px solid rgba(2,8,23,0.06)",
  },
  tabs:      { display: "flex", gap: 8 },
  tabBtn: {
    padding: "9px 14px", borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)", background: "#fff",
    cursor: "pointer", fontWeight: 900, fontSize: 13,
    color: "rgba(11,18,32,0.65)",
  },
  tabBtnActive: {
    borderColor: "rgba(0,180,180,0.35)",
    boxShadow: "0 0 0 4px var(--rs-ring)",
    color: "var(--rs-dark)",
  },

  searchWrap: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "9px 12px", borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)", background: "#fff",
    minWidth: 240,
  },
  searchInput: {
    border: "none", outline: "none", width: "100%",
    fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.80)",
    background: "transparent",
  },

  cardBody: { padding: 14 },

  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.9fr",
    gap: 12,
  },
  panel: {
    borderRadius: 18, background: "#fff",
    border: "1px solid rgba(2,8,23,0.08)", padding: 14,
  },
  panelHead: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 12, marginBottom: 12,
  },
  panelTitle: { fontWeight: 950, color: "rgba(11,18,32,0.82)", fontSize: 14 },
  ghostBtn: {
    border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)",
    borderRadius: 999, padding: "7px 10px", cursor: "pointer",
    fontWeight: 900, fontSize: 12,
    display: "inline-flex", alignItems: "center", gap: 5,
    color: "rgba(11,18,32,0.65)",
  },

  rowCard: {
    borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)", padding: 12,
    display: "flex", alignItems: "center", gap: 10,
  },
  rowTop: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 10, flexWrap: "wrap",
  },
  rowTitle:  { fontWeight: 900, color: "rgba(11,18,32,0.86)", fontSize: 13 },
  rowMeta:   { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 4 },
  metaItem: {
    display: "inline-flex", alignItems: "center", gap: 5,
    color: "rgba(11,18,32,0.55)", fontWeight: 800, fontSize: 12,
  },

  quickActions:  { display: "grid", gap: 9 },
  actionCard: {
    width: "100%", display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 12, padding: 11,
    borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)", cursor: "pointer", textAlign: "left",
  },
  actionIcon: {
    width: 38, height: 38, borderRadius: 14,
    background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.20)",
    display: "grid", placeItems: "center", color: "var(--rs-dark)", flexShrink: 0,
  },
  actionText:  { flex: 1, display: "grid", gap: 2 },
  actionTitle: { fontWeight: 950, color: "rgba(11,18,32,0.84)", fontSize: 13 },
  actionSub:   { fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.50)" },

  sectionHead: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-end", gap: 12, marginBottom: 14, flexWrap: "wrap",
  },
  sectionTitle: { fontWeight: 950, fontSize: 16, color: "rgba(11,18,32,0.86)" },
  sectionSub:   { marginTop: 4, fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.52)" },

  courseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 14,
  },
  courseCard: {
    borderRadius: 18, background: "#fff",
    border: "1px solid rgba(2,8,23,0.08)",
    boxShadow: "0 4px 18px rgba(2,8,23,0.06)",
    padding: 16,
  },
  courseCardTop: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 8, marginBottom: 12,
  },
  courseCardTitle: {
    fontWeight: 950, fontSize: 15, color: "rgba(11,18,32,0.88)",
    marginBottom: 6,
  },
  courseCardMeta:    { display: "flex", gap: 14, flexWrap: "wrap" },
  courseCardDivider: { borderTop: "1px solid rgba(2,8,23,0.07)", margin: "14px 0" },
  courseStatsRow: { display: "flex", gap: 8 },
  courseStat: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4,
    padding: "10px 8px", borderRadius: 12,
    border: "1px solid rgba(2,8,23,0.07)",
    background: "rgba(2,8,23,0.02)",
  },
  courseStatIcon:  { display: "flex" },
  courseStatValue: { fontWeight: 900, fontSize: 18, letterSpacing: "-0.3px" },
  courseStatLabel: { fontSize: 10, fontWeight: 800, color: "rgba(11,18,32,0.50)" },
  moreBtn: {
    width: 30, height: 30, borderRadius: 8,
    border: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "rgba(11,18,32,0.50)",
  },

  tableWrap: {
    overflowX: "auto", borderRadius: 16,
    border: "1px solid rgba(2,8,23,0.08)", background: "#fff",
  },
  table: {
    width: "100%", borderCollapse: "separate",
    borderSpacing: 0, minWidth: 820,
  },
  th: {
    textAlign: "left", fontSize: 11, fontWeight: 950,
    color: "rgba(11,18,32,0.55)", padding: "12px 14px",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)",
  },
  thRight: {
    textAlign: "right", fontSize: 11, fontWeight: 950,
    color: "rgba(11,18,32,0.55)", padding: "12px 14px",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)",
  },
  td:      { padding: "13px 14px", borderBottom: "1px solid rgba(2,8,23,0.055)", fontSize: 13 },
  tdRight: { padding: "13px 14px", borderBottom: "1px solid rgba(2,8,23,0.055)", fontSize: 13, textAlign: "right" },

  studentAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(0,180,180,0.12)",
    border: "1px solid rgba(0,180,180,0.28)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "var(--rs-teal)", fontWeight: 900, fontSize: 13, flexShrink: 0,
  },

  progressWrap:  { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  progressBar:   { width: 80, height: 6, borderRadius: 99, background: "rgba(2,8,23,0.08)", overflow: "hidden" },
  progressFill:  { height: "100%", borderRadius: 99, background: "var(--rs-teal)", transition: "width .3s ease" },
  progressLabel: { fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.60)", minWidth: 32, textAlign: "right" },

  emptyWrap: {
    borderRadius: 18, border: "1px dashed rgba(2,8,23,0.15)",
    background: "rgba(2,8,23,0.02)", padding: 22, textAlign: "center",
  },
  emptyIcon: {
    width: 46, height: 46, borderRadius: 16,
    background: "rgba(0,180,180,0.10)",
    border: "1px solid rgba(0,180,180,0.22)",
    display: "grid", placeItems: "center",
    color: "var(--rs-dark)", margin: "0 auto",
  },
  emptyTitle: { marginTop: 12, fontWeight: 950, color: "rgba(11,18,32,0.84)", fontSize: 14 },
  emptySub:   { marginTop: 6, color: "rgba(11,18,32,0.52)", fontWeight: 700, fontSize: 12, lineHeight: 1.6 },
  primaryBtnSmall: {
    marginTop: 14,
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "10px 14px", borderRadius: 12,
    border: "1px solid rgba(2,8,23,0.10)", background: "#fff",
    color: "rgba(11,18,32,0.82)", cursor: "pointer", fontWeight: 900, fontSize: 13,
  },
};

export default InstructorDashboard;