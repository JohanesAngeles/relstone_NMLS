import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import {
  FileText, BookOpen, Clock, CheckCircle, Award,
  ChevronRight, Search, PlayCircle, Lock,
  LayoutDashboard, User, ShoppingCart, HelpCircle,
  LogOut, Download, Menu, X,
} from "lucide-react";

/* ─── Dashboard ──────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard,    setDashboard]    = useState(null);
  const [transcript,   setTranscript]   = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [activeTab,    setActiveTab]    = useState("overview");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [q,            setQ]            = useState("");
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, transcriptRes, certsRes] = await Promise.all([
          API.get("/dashboard"),
          API.get("/dashboard/transcript"),
          API.get("/certificates"),
        ]);
        setDashboard(dashRes.data);
        setTranscript(transcriptRes.data);
        // Normalize to same shape as MyCertificates.jsx
        const raw = certsRes.data?.certificates || [];
        setCertificates(raw.map((c) => ({
          _id:             c._id,
          course_id:       String(c.course_id || ""),
          course_title:    c.course_title  || "—",
          course_type:     c.course_type   || "—",
          credit_hours:    c.credit_hours,
          nmls_course_id:  c.nmls_course_id || "—",
          state_approval:  c.state_approval_number || "—",
          completed_at:    c.completed_at,
          state:           c.state,
          certificate_url: c.certificate_url || null,
        })));
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const profile          = dashboard?.profile          || {};
  const completions      = dashboard?.completions      || {};
  const orders           = dashboard?.orders           || [];
  const availableCourses = dashboard?.available_courses || [];
  const ceTracker        = dashboard?.ce_tracker       || null;

  const inProgressCount = availableCourses.filter(c => !c.already_completed).length;

  // allCerts comes directly from /certificates API — same source as MyCertificates page
  const allCerts = certificates;

  const recentCompletions = useMemo(() => {
    // Prefer dashboard completions; fall back to certificates API data
    const fromDash = [...(completions?.PE || []), ...(completions?.CE || [])];
    const list = fromDash.length > 0 ? fromDash : certificates.map(c => ({
      course_id:    { title: c.course_title, type: c.course_type, credit_hours: c.credit_hours },
      completed_at: c.completed_at,
      certificate_url: c.certificate_url,
    }));
    list.sort((a, b) => new Date(b?.completed_at||0) - new Date(a?.completed_at||0));
    return list.slice(0, 5);
  }, [completions, certificates]);

  const filteredTranscript = useMemo(() => {
    const rows = transcript?.transcript || [];
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((t) =>
      String(t.course_title||"").toLowerCase().includes(needle) ||
      String(t.nmls_course_id||"").toLowerCase().includes(needle) ||
      String(t.type||"").toLowerCase().includes(needle)
    );
  }, [transcript, q]);

  // ── Profile completion — derived from real profile fields ──────────
  const profileFields = [
    { label: "Email verified",  done: true                },
    { label: "Password set",    done: true                },
    { label: "Mailing address", done: !!profile?.address  },
    { label: "Phone number",    done: !!profile?.phone    },
    { label: "NMLS ID number",  done: !!profile?.nmls_id  },
  ];
  const profilePct = Math.round(
    (profileFields.filter(f => f.done).length / profileFields.length) * 100
  );

  // ── CE Tracker — derived from API ─────────────────────────────────
  // Expected shape from /dashboard:
  // ce_tracker: {
  //   renewal_year: 2026,
  //   deadline: "Dec 31, 2026",
  //   days_left: 47,
  //   required_hours: 8,
  //   completed_hours: 5,
  //   subjects: [
  //     { label: "Federal Law", completed: 3, total: 3 },
  //     { label: "Ethics",      completed: 2, total: 2 },
  //     ...
  //   ]
  // }
  const renewalYear     = ceTracker?.renewal_year    || new Date().getFullYear();
  const ceDeadline      = ceTracker?.deadline        || `Dec 31, ${renewalYear}`;
  const ceDaysLeft      = ceTracker?.days_left       ?? null;
  const ceRequired      = ceTracker?.required_hours  || 8;
  const ceCompleted     = ceTracker?.completed_hours || 0;
  const ceStillNeeded   = Math.max(0, ceRequired - ceCompleted);
  const ceSubjects      = ceTracker?.subjects        || [];

  // ── Stat card badges — derived from real data ──────────────────────
  const certsBadge    = allCerts.length > 0 ? `+${allCerts.length}` : "0";
  const progressBadge = inProgressCount > 0 ? "Active" : "None";
  const studentIdRaw  = profile?.nmls_id || user?.nmls_id || null;
  const studentId     = studentIdRaw ? `#NM-${studentIdRaw}` : "—";
  const studentBadge  = profile?.role === "student" ? "ST" : profile?.role?.slice(0,2).toUpperCase() || "ST";

  // ── Initials ───────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2)
    : "AC";

  if (loading) return (
    <div style={S.fullCenter}>
      <style>{CSS}</style>
      <div className="spin" />
    </div>
  );

  if (error) return (
    <div style={S.fullCenter}>
      <style>{CSS}</style>
      <div style={{ color: "#ef4444", fontFamily: "'Poppins',sans-serif" }}>{error}</div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={S.root}>

        {/* ══════════════════════════════════════════════════════════
            TOP NAVIGATION BAR
        ══════════════════════════════════════════════════════════ */}
        <header style={S.topbar}>
          <div style={S.topbarLeft}>
            <button style={S.menuToggle} onClick={() => setSidebarOpen(o => !o)} type="button">
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div style={S.logo}>
              <div style={S.logoText}>
                <span style={S.logoNmls}>NMLS</span>
                <span style={S.logoSub}>Mortgage Licensing Education</span>
              </div>
              <div style={S.logoDivider} />
              <span style={S.logoTagline}>Student Portal</span>
            </div>
          </div>

          <div style={S.topSearch}>
            <Search size={15} style={{ color: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
            <input style={S.topSearchInput} placeholder="Search States or Courses..." />
          </div>

          <div style={S.userChip}>
            <div style={S.userAvatar}>{initials}</div>
            <span style={S.userName}>{user?.name || "Student"}</span>
          </div>
        </header>

        <div style={S.body}>

          {/* ════════════════════════════════════════════════════════
              LEFT SIDEBAR
          ════════════════════════════════════════════════════════ */}
          {sidebarOpen && (
            <aside style={S.sidebar}>
              <div style={S.sideProfile}>
                <div style={S.sideAvatar}>{initials}</div>
                <div style={S.sideUserInfo}>
                  <div style={S.sideUserName}>{user?.name || "Student"}</div>
                  <div style={S.sideStudentId}>{studentId}</div>
                </div>
              </div>

              <div style={S.sideDivider} />

              {/* Stats — all from API */}
              <div style={S.sideStats}>
                <div style={S.sideStatRow}>
                  <span style={S.sideStatLabel}>Courses Enrolled</span>
                  <span style={{ ...S.sideStatVal, color: "#1A7AB8" }}>{availableCourses.length}</span>
                </div>
                <div style={S.sideStatRow}>
                  <span style={S.sideStatLabel}>Certificates Earned</span>
                  <span style={{ ...S.sideStatVal, color: "#008000" }}>{allCerts.length}</span>
                </div>
                <div style={S.sideStatRow}>
                  <span style={S.sideStatLabel}>In Progress</span>
                  <span style={{ ...S.sideStatVal, color: "#F59E0B" }}>{inProgressCount}</span>
                </div>
              </div>

              <div style={S.sideDivider} />

              <div style={S.sideSection}>MY ACCOUNT</div>
              <SideNavItem icon={<LayoutDashboard size={20} />} label="Dashboard"  sub="Home / Overview & Summary"      active onClick={() => {}} />
              <SideNavItem icon={<BookOpen size={20} />}        label="My Courses" sub="Progress & Certificates"        onClick={() => navigate("/my-courses")} />

              <div style={S.sideDivider} />

              <div style={S.sideSection}>SUPPORT</div>
              <SideNavItem icon={<User size={20} />}        label="My Profile"       sub="Account & Settings"             onClick={() => navigate("/account-setup")} />
              <SideNavItem icon={<ShoppingCart size={20} />} label="My Orders"       sub="Purchase History & Receipts"    onClick={() => navigate("/orders")} />
              <SideNavItem icon={<HelpCircle size={20} />}  label="Contact Support"  sub="Get Help from RELS NMLS"        onClick={() => {}} />

              <div style={S.sideDivider} />

              <SideNavItem
                icon={<LogOut size={20} style={{ color: "#EF4444" }} />}
                label="Sign out" sub="End Your Session" danger
                onClick={() => { logout?.(); navigate("/"); }}
              />
            </aside>
          )}

          {/* ════════════════════════════════════════════════════════
              MAIN CONTENT
          ════════════════════════════════════════════════════════ */}
          <main style={S.main} className="dash-main">

            <div style={S.pageHead}>
              <div style={S.breadcrumb}>Student Portal › Dashboard</div>
              <h1 style={S.pageTitle}>Dashboard</h1>
              <p style={S.pageSubtitle}>Your enrolled courses, certificates, and recent activity — all in one place.</p>
              <div style={S.headDivider} />
            </div>

            {/* ── STAT CARDS — all values from API ── */}
            <div style={S.statGrid}>
              <StatCard
                color="#2EABFE"
                icon={<BookOpen size={26} style={{ color: "#2EABFE" }} />}
                value={availableCourses.length}
                label="Courses Enrolled"
                badge="TOTAL"
                badgeColor="#2EABFE"
              />
              <StatCard
                color="#008000"
                icon={<Award size={26} style={{ color: "#008000" }} />}
                value={allCerts.length}
                label="Certificates Earned"
                badge={certsBadge}
                badgeColor="#008000"
              />
              <StatCard
                color="#F59E0B"
                icon={<Clock size={26} style={{ color: "#F59E0B" }} />}
                value={inProgressCount}
                label="In Progress"
                badge={progressBadge}
                badgeColor="#F59E0B"
              />
              <StatCard
                color="#9569F7"
                icon={<User size={26} style={{ color: "#9569F7" }} />}
                value={studentId}
                label="Student ID"
                badge={studentBadge}
                badgeColor="#9569F7"
              />
            </div>

            {/* ── MIDDLE ROW ── */}
            <div style={S.midRow}>

              {/* My Courses */}
              <div style={S.panelWhite}>
                <div style={S.panelHdr}>
                  <div style={S.panelHdrLeft}>
                    <div style={S.panelIcon}><BookOpen size={16} style={{ color: "#2EABFE" }} /></div>
                    <div>
                      <div style={S.panelTitle}>My Courses</div>
                      <div style={S.panelSub}>All enrolled courses</div>
                    </div>
                  </div>
                  <button style={S.viewAllBtn} onClick={() => navigate("/my-courses")} type="button">View all →</button>
                </div>
                <div style={S.panelDivider} />
                {availableCourses.length === 0 ? (
                  <div style={S.emptyMsg}>No courses enrolled yet.</div>
                ) : (
                  availableCourses.slice(0, 5).map((course, i) => (
                    <CourseRow key={i} course={course} onStart={() => navigate(`/courses/${course.course_id}/learn`)} />
                  ))
                )}
              </div>

              {/* Right column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 0 }}>

                {/* Profile Completion — all from real profileFields */}
                <div style={S.panelWhite}>
                  <div style={S.panelHdr}>
                    <div style={S.panelTitle}>Profile Completion</div>
                    <span style={{ fontSize: 28, fontWeight: 700, color: "#2EABFE", fontFamily: "'Poppins',sans-serif" }}>
                      {profilePct}%
                    </span>
                  </div>
                  <div style={S.panelDivider} />
                  <div style={{ padding: "12px 0 8px" }}>
                    <div style={S.progressTrack}>
                      <div style={{ ...S.progressFill, width: `${profilePct}%`, background: "#2EABFE" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {profileFields.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {f.done ? (
                          <CheckCircle size={15} style={{ color: "#008000", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 13, height: 13, borderRadius: "50%", border: "0.325px solid #7FA8C4", flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: 14, color: "#091925", fontFamily: "'Poppins',sans-serif", fontWeight: f.done ? 500 : 400 }}>
                          {f.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ ...S.panelDivider, margin: "14px 0" }} />
                  <button style={S.ctaBlue} onClick={() => navigate("/account-setup")} type="button">
                    COMPLETE PROFILE <span style={{ marginLeft: 8, borderLeft: "1.5px solid #091925", paddingLeft: 8 }}>→</span>
                  </button>
                </div>

                {/* Certificates — from allCerts */}
                <div style={S.panelWhite}>
                  <div style={S.panelHdr}>
                    <div style={S.panelTitle}>Certificates</div>
                    <div style={{ ...S.statusBadge, background: "rgba(0,128,0,0.10)", border: "0.5px solid #008000", color: "#008000" }}>
                      {allCerts.length} EARNED
                    </div>
                  </div>
                  <div style={S.panelDivider} />
                  {allCerts.length === 0 ? (
                    <div style={S.emptyMsg}>No certificates yet.</div>
                  ) : (
                    allCerts.slice(0, 2).map((c, i) => <CertRow key={i} item={c} />)
                  )}
                  <div style={{ marginTop: 14 }}>
                    <button style={S.ctaGreen} onClick={() => navigate("/my-courses")} type="button">
                      VIEW ALL CERTIFICATES <span style={{ marginLeft: 8, borderLeft: "1.5px solid #fff", paddingLeft: 8 }}>→</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* ── BOTTOM ROW: CE Tracker + Recent Completions ── */}
            <div style={S.midRow}>

              {/* Annual CE Tracker — all from ceTracker API data */}
              <div style={{ ...S.panelWhite, border: "0.5px solid #F59E0B", background: "rgba(245,158,11,0.04)" }}>
                <div style={S.panelHdr}>
                  <div style={S.panelHdrLeft}>
                    <div style={{ ...S.panelIcon, background: "rgba(208,235,255,0.25)", border: "0.5px solid #2EABFE" }}>
                      <Clock size={16} style={{ color: "#2EABFE" }} />
                    </div>
                    <div>
                      <div style={S.panelTitle}>Annual CE Tracker</div>
                      <div style={S.panelSub}>
                        {renewalYear} renewal year · Deadline {ceDeadline}
                      </div>
                    </div>
                  </div>
                  {ceDaysLeft !== null && (
                    <div style={{ ...S.statusBadge, background: "rgba(46,171,254,0.10)", border: "0.5px solid #2EABFE", color: "#2EABFE" }}>
                      {ceDaysLeft} days left
                    </div>
                  )}
                </div>
                <div style={{ ...S.panelDivider, borderColor: "#F59E0B" }} />

                {ceTracker ? (
                  <>
                    {/* Description — fully dynamic */}
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#091925", lineHeight: 1.6, fontFamily: "'Poppins',sans-serif", marginBottom: 16 }}>
                      Your required <strong>{ceRequired}-hour</strong> annual Continuing Education (CE) must be
                      completed by <strong>{ceDeadline}</strong>.
                      {ceDaysLeft !== null && <> As of now, you have <strong>{ceDaysLeft} days remaining</strong>.</>}
                      {ceStillNeeded > 0 && <> You still need <strong>{ceStillNeeded} more hour{ceStillNeeded !== 1 ? "s" : ""}</strong> to fulfill the requirement.</>}
                      {ceStillNeeded === 0 && <> You have met the CE requirement — great work!</>}
                    </p>

                    {/* CE subject rows — from API */}
                    {ceSubjects.length > 0 ? (
                      ceSubjects.map((row, i) => {
                        const pct   = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0;
                        const color = pct === 100 ? "#008000" : pct > 0 ? "#F59E0B" : "#EF4444";
                        return (
                          <div key={i} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: 14, color: "#091925", fontFamily: "'Poppins',sans-serif" }}>{row.label}</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "'Poppins',sans-serif" }}>
                                {row.completed}/{row.total}
                              </span>
                            </div>
                            <div style={S.progressTrack}>
                              <div style={{ ...S.progressFill, width: `${pct}%`, background: color }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={S.emptyMsg}>No CE subject data available.</div>
                    )}

                    {/* Hours summary — dynamic */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "#7FA8C4", fontFamily: "'Poppins',sans-serif" }}>
                        {ceStillNeeded > 0
                          ? `${ceStillNeeded} hour${ceStillNeeded !== 1 ? "s" : ""} still needed`
                          : "All hours completed ✓"}
                      </span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: "#2EABFE", fontFamily: "'Poppins',sans-serif" }}>
                        {ceCompleted} / {ceRequired} hrs
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={S.emptyMsg}>No CE tracker data. Complete a CE course to begin tracking.</div>
                )}

                <div style={{ ...S.panelDivider, borderColor: "#F59E0B" }} />
                <button style={S.ctaAmber} onClick={() => navigate("/courses")} type="button">
                  COMPLETE CE NOW <span style={{ marginLeft: 8, borderLeft: "1.5px solid #fff", paddingLeft: 8 }}>→</span>
                </button>
              </div>

              {/* Recent Completions — from API */}
              <div style={{ ...S.panelWhite, flex: 1, minWidth: 0 }}>
                <div style={S.panelHdr}>
                  <div style={S.panelTitle}>Recent completions</div>
                </div>
                <div style={S.panelDivider} />
                {recentCompletions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: "#091925", marginBottom: 8, fontFamily: "'Poppins',sans-serif" }}>No completions yet</div>
                    <div style={{ fontSize: 14, color: "#7FA8C4", marginBottom: 20, fontFamily: "'Poppins',sans-serif" }}>
                      Once you complete a course, your certificate and NMLS record will appear here.
                    </div>
                    <button style={S.ctaGreen} onClick={() => navigate("/courses")} type="button">BROWSE COURSES →</button>
                  </div>
                ) : (
                  recentCompletions.map((c, i) => <CompletionRow key={i} item={c} />)
                )}
              </div>
            </div>

            {/* ── TABS ── */}
            <div style={S.tabsCard}>
              <div style={S.tabBar}>
                <TabBtn label="Overview"   active={activeTab === "overview"}   onClick={() => setActiveTab("overview")} />
                <TabBtn label="Transcript" active={activeTab === "transcript"} onClick={() => setActiveTab("transcript")} />
                <TabBtn label="Orders"     active={activeTab === "orders"}     onClick={() => setActiveTab("orders")} />
                {activeTab === "transcript" && (
                  <div style={S.tabSearch}>
                    <Search size={14} style={{ color: "rgba(9,25,37,0.55)" }} />
                    <input style={S.tabSearchInput} value={q} onChange={e => setQ(e.target.value)} placeholder="Search transcript…" />
                  </div>
                )}
                <button style={S.backBtn} onClick={() => navigate("/my-courses")} type="button">
                  Back to My Courses ›
                </button>
              </div>

              {/* Overview */}
              {activeTab === "overview" && (
                <div style={S.tabBody}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.8fr", gap: 14 }}>
                    <div style={S.innerPanel}>
                      <div style={S.innerPanelHdr}>
                        <div style={S.innerPanelTitle}>Recent completions</div>
                        <button style={S.ghostBtn} onClick={() => setActiveTab("transcript")} type="button">
                          View transcript <ChevronRight size={14} />
                        </button>
                      </div>
                      {recentCompletions.length === 0
                        ? <div style={S.emptyMsg}>No completions yet.</div>
                        : recentCompletions.map((c, i) => <CompletionRow key={i} item={c} />)
                      }
                    </div>
                    <div style={S.innerPanel}>
                      <div style={S.innerPanelHdr}><div style={S.innerPanelTitle}>Quick actions</div></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          { icon: <BookOpen size={16} />, title: "Browse courses",  sub: "Find PE and CE courses",      action: () => navigate("/courses")         },
                          { icon: <FileText size={16} />, title: "View transcript", sub: "Download and verify details", action: () => setActiveTab("transcript")    },
                          { icon: <Clock size={16} />,    title: "My orders",       sub: "Track payment and status",    action: () => setActiveTab("orders")       },
                        ].map((a, i) => (
                          <button key={i} style={S.actionCard} onClick={a.action} type="button">
                            <div style={S.actionIcon}>{a.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={S.actionTitle}>{a.title}</div>
                              <div style={S.actionSub}>{a.sub}</div>
                            </div>
                            <ChevronRight size={16} style={{ color: "rgba(9,25,37,0.40)" }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transcript */}
              {activeTab === "transcript" && (
                <div style={S.tabBody}>
                  <div style={S.innerPanelHdr}>
                    <div>
                      <div style={S.innerPanelTitle}>Transcript</div>
                      <div style={{ fontSize: 12, color: "#7FA8C4", marginTop: 2, fontFamily: "'Poppins',sans-serif" }}>
                        {transcript?.student?.name ? `NMLS Transcript — ${transcript.student.name}` : "Your completed courses"}
                      </div>
                    </div>
                  </div>
                  {filteredTranscript.length === 0 ? (
                    <div style={S.emptyMsg}>{q.trim() ? "No matches found." : "Complete a course to populate your transcript."}</div>
                  ) : (
                    <div style={S.tableWrap}>
                      <table style={S.table}>
                        <thead>
                          <tr style={{ background: "rgba(2,8,23,0.02)" }}>
                            <th style={S.th}>Course</th>
                            <th style={S.th}>NMLS ID</th>
                            <th style={S.th}>Type</th>
                            <th style={S.th}>Credit Hrs</th>
                            <th style={S.th}>Completed</th>
                            <th style={S.th}>Certificate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTranscript.map((t, i) => (
                            <tr key={i} className="tr-hover">
                              <td style={S.td}><span style={{ fontWeight: 700 }}>{t.course_title}</span></td>
                              <td style={S.td}>{t.nmls_course_id || "—"}</td>
                              <td style={S.td}><TypeBadge type={t.type} /></td>
                              <td style={S.td}>{t.credit_hours ?? "—"}</td>
                              <td style={S.td}>{t.completed_at ? new Date(t.completed_at).toLocaleDateString() : "—"}</td>
                              <td style={S.td}>
                                {t.certificate_url
                                  ? <a href={t.certificate_url} target="_blank" rel="noreferrer" style={{ color: "#2EABFE", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
                                      <Award size={14} /> View
                                    </a>
                                  : <span style={{ color: "rgba(11,18,32,0.35)" }}>—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Orders */}
              {activeTab === "orders" && (
                <div style={S.tabBody}>
                  <div style={S.innerPanelHdr}>
                    <div>
                      <div style={S.innerPanelTitle}>Orders</div>
                      <div style={{ fontSize: 12, color: "#7FA8C4", marginTop: 2, fontFamily: "'Poppins',sans-serif" }}>Your purchases, receipts, and payment methods</div>
                    </div>
                  </div>
                  {orders.length === 0 ? (
                    <div style={S.emptyMsg}>No orders yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {orders.slice(0, 3).map((order, i) => {
                        const isPaid = String(order?.status||"").toLowerCase() === "paid";
                        return (
                          <div key={i} style={S.orderCard}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                              <div>
                                <div style={{ fontWeight: 800, color: "#091925", display: "flex", alignItems: "center", gap: 8, fontFamily: "'Poppins',sans-serif" }}>
                                  <FileText size={15} />
                                  Order #{String(order?._id||"").slice(-6).toUpperCase()}
                                </div>
                                <div style={{ fontSize: 12, color: "#7FA8C4", marginTop: 4, display: "flex", alignItems: "center", gap: 5, fontFamily: "'Poppins',sans-serif" }}>
                                  <Clock size={12} />
                                  {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                                </div>
                              </div>
                              <StatusBadge status={order?.status} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {(order?.items||[]).map((item, j) => (
                                <div key={j} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, border: "0.5px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.01)" }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(46,171,254,0.10)", border: "0.5px solid rgba(46,171,254,0.18)", display: "grid", placeItems: "center" }}>
                                    <BookOpen size={14} style={{ color: "#2EABFE" }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, color: "#091925", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Poppins',sans-serif" }}>
                                      {item?.course_id?.title || "Course"}
                                    </div>
                                  </div>
                                  {isPaid && item?.course_id?._id ? (
                                    <button style={S.startBtn} onClick={() => navigate(`/courses/${item.course_id._id}/learn`)} type="button">
                                      <PlayCircle size={12} /> Start Learning
                                    </button>
                                  ) : (
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "0.5px solid rgba(245,158,11,0.28)", background: "rgba(245,158,11,0.08)", color: "rgba(140,90,0,1)", fontSize: 11, fontWeight: 700 }}>
                                      <Lock size={11} /> Pending
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "0.5px solid rgba(2,8,23,0.06)", display: "flex", justifyContent: "flex-end" }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: "#091925", fontFamily: "'Poppins',sans-serif" }}>
                                Total: <strong>${Number(order?.total_amount||0).toFixed(2)}</strong>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {orders.length > 3 && (
                        <button style={{ ...S.ctaBlue, maxWidth: 240, margin: "0 auto" }} onClick={() => navigate("/orders")} type="button">
                          View All Orders →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────── */

const SideNavItem = ({ icon, label, sub, active, danger, onClick }) => (
  <button onClick={onClick} type="button" style={{
    display: "flex", alignItems: "center", gap: 14,
    padding: "10px 14px", width: "100%", border: "none",
    background: active ? "rgba(46,171,254,0.10)" : "transparent",
    cursor: "pointer", textAlign: "left", borderRadius: 0,
    borderLeft: active ? "3px solid #2EABFE" : "3px solid transparent",
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 5, flexShrink: 0,
      background: danger ? "rgba(239,68,68,0.10)" : "rgba(127,168,196,0.10)",
      display: "grid", placeItems: "center",
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 16, fontWeight: active ? 600 : 400, color: danger ? "#EF4444" : "#091925", fontFamily: "'Poppins',sans-serif", lineHeight: 1.2 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#7FA8C4", marginTop: 2, fontFamily: "'Poppins',sans-serif" }}>{sub}</div>
    </div>
  </button>
);

const StatCard = ({ color, icon, value, label, badge, badgeColor }) => (
  <div style={{ background: "#fff", borderRadius: 5, overflow: "hidden", boxShadow: `0 3px 0 0 ${color}` }}>
    <div style={{ padding: "20px 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 60, height: 60, borderRadius: 5, border: `0.5px solid ${color}`, background: `${color}1A`, display: "grid", placeItems: "center" }}>
          {icon}
        </div>
        <div style={{ padding: "4px 10px", borderRadius: 999, background: `${badgeColor}1A`, fontSize: 10, fontWeight: 700, color: badgeColor, fontFamily: "'Poppins',sans-serif" }}>
          {badge}
        </div>
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: "#091925", lineHeight: 1.1, fontFamily: "'Poppins',sans-serif" }}>{value}</div>
      <div style={{ fontSize: 14, color: "rgba(9,25,37,0.65)", marginTop: 4, fontFamily: "'Poppins',sans-serif" }}>{label}</div>
    </div>
  </div>
);

const CourseRow = ({ course, onStart }) => {
  const progress    = course.progress || 0;
  const isComplete  = course.already_completed;
  const barColor    = isComplete ? "#008000" : progress > 0 ? "#F59E0B" : "#2EABFE";
  const statusLabel = isComplete ? "Complete" : progress > 0 ? "In Progress" : "Not Started";
  const statusColor = isComplete ? "#008000" : progress > 0 ? "#F59E0B" : "#2EABFE";
  const statusBg    = isComplete ? "rgba(0,128,0,0.10)" : progress > 0 ? "rgba(245,158,11,0.10)" : "rgba(46,171,254,0.10)";
  const statusBorder= isComplete ? "#008000" : progress > 0 ? "#F59E0B" : "#2EABFE";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 0" }}>
        <div style={{ width: 36, height: 36, borderRadius: 5, flexShrink: 0, background: isComplete ? "rgba(0,128,0,0.10)" : "rgba(245,158,11,0.10)", border: `0.5px solid ${isComplete ? "#008000" : "#F59E0B"}`, display: "grid", placeItems: "center" }}>
          <BookOpen size={16} style={{ color: isComplete ? "#008000" : "#F59E0B" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, color: "#091925", fontFamily: "'Poppins',sans-serif", marginBottom: 6, lineHeight: 1.4 }}>{course.title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#7FA8C4", fontFamily: "'Poppins',sans-serif" }}>Progress</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: barColor, fontFamily: "'Poppins',sans-serif" }}>{isComplete ? "100%" : `${progress}%`}</span>
          </div>
          <div style={S.progressTrack}>
            <div style={{ ...S.progressFill, width: isComplete ? "100%" : `${progress}%`, background: barColor }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <div style={{ padding: "4px 10px", borderRadius: 999, background: statusBg, border: `0.5px solid ${statusBorder}`, fontSize: 11, fontWeight: 700, color: statusColor, fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />
            {statusLabel}
          </div>
          {!isComplete && (
            <button onClick={onStart} type="button" style={{ fontSize: 11, fontWeight: 700, color: "#2EABFE", background: "none", border: "none", cursor: "pointer", fontFamily: "'Poppins',sans-serif", padding: 0 }}>
              Resume →
            </button>
          )}
        </div>
      </div>
      <div style={S.panelDivider} />
    </div>
  );
};

const CertRow = ({ item }) => {
  // Supports both flat shape (/certificates API) and nested shape (dashboard completions)
  const title = item?.course_title || item?.course?.title || item?.course_id?.title || "Certificate";
  const date  = item?.completed_at ? new Date(item.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
      <div style={{ width: 50, height: 50, borderRadius: 5, background: "rgba(0,128,0,0.10)", border: "0.5px solid #008000", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Award size={22} style={{ color: "#008000" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#091925", fontFamily: "'Poppins',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {date && <div style={{ fontSize: 12, color: "rgba(9,25,37,0.60)", marginTop: 3, fontFamily: "'Poppins',sans-serif" }}>Issued {date}</div>}
      </div>
      {item?.certificate_url && (
        <a href={item.certificate_url} target="_blank" rel="noreferrer" style={{ width: 40, height: 40, borderRadius: 5, background: "rgba(91,115,132,0.10)", border: "0.5px solid #5B7384", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Download size={14} style={{ color: "#5B7384" }} />
        </a>
      )}
    </div>
  );
};

const CompletionRow = ({ item }) => {
  const title = item?.course?.title || item?.course_id?.title || "Course";
  const type  = item?.course?.type  || item?.course_id?.type  || "";
  const hrs   = item?.course?.credit_hours ?? item?.course_id?.credit_hours ?? "—";
  const date  = item?.completed_at ? new Date(item.completed_at).toLocaleDateString() : "—";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 0", borderBottom: "0.5px solid rgba(2,8,23,0.06)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#091925", marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <TypeBadge type={type} />
          <span style={{ fontSize: 11, color: "rgba(11,18,32,0.55)", display: "flex", alignItems: "center", gap: 4, fontFamily: "'Poppins',sans-serif" }}><Clock size={11} /> {hrs} hrs</span>
          <span style={{ fontSize: 11, color: "rgba(11,18,32,0.55)", display: "flex", alignItems: "center", gap: 4, fontFamily: "'Poppins',sans-serif" }}><CheckCircle size={11} /> {date}</span>
        </div>
      </div>
      <ChevronRight size={16} style={{ color: "rgba(9,25,37,0.35)", flexShrink: 0 }} />
    </div>
  );
};

const TypeBadge = ({ type }) => {
  const t = String(type||"").toUpperCase();
  const style = t === "PE"
    ? { color: "#2EABFE",           background: "rgba(46,171,254,0.12)", border: "0.5px solid rgba(46,171,254,0.22)" }
    : t === "CE"
      ? { color: "rgba(0,140,140,1)", background: "rgba(0,180,180,0.12)", border: "0.5px solid rgba(0,180,180,0.20)" }
      : { color: "rgba(9,25,37,0.78)",background: "rgba(2,8,23,0.06)",   border: "0.5px solid rgba(2,8,23,0.10)" };
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800, fontFamily: "'Poppins',sans-serif" }}>{t || "—"}</span>
  );
};

const StatusBadge = ({ status }) => {
  const s = String(status||"").toLowerCase();
  const style = s === "paid" || s === "completed"
    ? { color: "rgba(0,140,140,1)",  background: "rgba(0,180,180,0.12)",  border: "0.5px solid rgba(0,180,180,0.20)"  }
    : s === "pending"
      ? { color: "rgba(180,120,0,1)", background: "rgba(245,158,11,0.12)", border: "0.5px solid rgba(245,158,11,0.22)" }
      : { color: "rgba(200,50,50,1)", background: "rgba(239,68,68,0.10)",  border: "0.5px solid rgba(239,68,68,0.20)"  };
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, textTransform: "capitalize", fontFamily: "'Poppins',sans-serif" }}>{status}</span>
  );
};

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} type="button" style={{
    padding: "14px 20px", border: "none",
    background: active ? "#2EABFE" : "transparent",
    color: active ? "#091925" : "#5B7384",
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    fontFamily: "'Poppins',sans-serif", borderRadius: 0,
  }}>
    {label}
  </button>
);

/* ─── CSS ────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Poppins',sans-serif;background:#F0F4F8;}
.spin{width:36px;height:36px;border-radius:50%;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.dash-main::-webkit-scrollbar{width:5px;}
.dash-main::-webkit-scrollbar-track{background:transparent;}
.dash-main::-webkit-scrollbar-thumb{background:rgba(9,25,37,0.15);border-radius:99px;}
.tr-hover:hover{background:rgba(46,171,254,0.04);}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  root:            { height:"100vh", display:"flex", flexDirection:"column", background:"#F0F4F8", overflow:"hidden" },
  fullCenter:      { height:"100vh", display:"grid", placeItems:"center", background:"#F0F4F8" },
  topbar:          { height:85, background:"#091925", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", flexShrink:0, borderBottom:"1px solid rgba(255,255,255,0.08)", zIndex:100 },
  topbarLeft:      { display:"flex", alignItems:"center", gap:14, flex:1 },
  menuToggle:      { width:32, height:32, background:"rgba(255,255,255,0.08)", border:"0.5px solid rgba(255,255,255,0.15)", borderRadius:5, display:"grid", placeItems:"center", cursor:"pointer", color:"#fff", flexShrink:0 },
  logo:            { display:"flex", alignItems:"center", gap:14 },
  logoText:        { display:"flex", flexDirection:"column" },
  logoNmls:        { fontSize:20, fontWeight:900, color:"#fff", lineHeight:1.2, fontFamily:"'Poppins',sans-serif" },
  logoSub:         { fontSize:11, fontWeight:400, color:"#fff", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.04em" },
  logoDivider:     { width:0.5, height:35, background:"#2EABFE", opacity:0.6 },
  logoTagline:     { fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.55)", fontFamily:"'Poppins',sans-serif" },
  topSearch:       { display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.10)", border:"0.5px solid #fff", borderRadius:5, padding:"0 14px", height:50, width:380 },
  topSearchInput:  { flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:13, fontFamily:"'Poppins',sans-serif" },
  userChip:        { display:"flex", alignItems:"center", gap:10, background:"#091925", border:"0.5px solid #60C3FF", borderRadius:999, padding:"6px 14px 6px 8px" },
  userAvatar:      { width:38, height:38, borderRadius:"50%", background:"#2EABFE", display:"grid", placeItems:"center", fontSize:12, fontWeight:700, color:"#091925", fontFamily:"'Poppins',sans-serif" },
  userName:        { fontSize:14, fontWeight:700, color:"#fff", fontFamily:"'Poppins',sans-serif" },
  body:            { display:"flex", flex:1, overflow:"hidden" },
  sidebar:         { width:320, flexShrink:0, background:"#fff", borderRight:"0.5px solid rgba(127,168,196,0.25)", overflowY:"auto", display:"flex", flexDirection:"column" },
  sideProfile:     { display:"flex", alignItems:"center", gap:12, padding:"20px 16px 16px" },
  sideAvatar:      { width:38, height:38, borderRadius:"50%", background:"#2EABFE", display:"grid", placeItems:"center", fontSize:12, fontWeight:700, color:"#091925", fontFamily:"'Poppins',sans-serif", flexShrink:0 },
  sideUserInfo:    { display:"flex", flexDirection:"column" },
  sideUserName:    { fontSize:14, fontWeight:700, color:"#091925", fontFamily:"'Poppins',sans-serif" },
  sideStudentId:   { fontSize:12, color:"#2EABFE", fontFamily:"'JetBrains Mono',monospace", marginTop:2 },
  sideDivider:     { height:0.5, background:"#7FA8C4", margin:"6px 16px", opacity:0.4 },
  sideStats:       { padding:"10px 16px", background:"rgba(127,168,196,0.08)", borderRadius:5, margin:"6px 16px" },
  sideStatRow:     { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0" },
  sideStatLabel:   { fontSize:13, color:"#5B7384", fontFamily:"'Poppins',sans-serif" },
  sideStatVal:     { fontSize:13, fontWeight:700, fontFamily:"'Poppins',sans-serif" },
  sideSection:     { fontSize:13, fontWeight:500, color:"#7FA8C4", textTransform:"uppercase", letterSpacing:"0.05em", padding:"10px 16px 4px", fontFamily:"'Poppins',sans-serif" },
  main:            { flex:1, overflowY:"auto", padding:"0 20px 32px" },
  pageHead:        { padding:"20px 0 0" },
  breadcrumb:      { fontSize:14, fontWeight:500, color:"#2EABFE", fontFamily:"'Poppins',sans-serif", marginBottom:6 },
  pageTitle:       { fontSize:38, fontWeight:700, color:"#000", fontFamily:"'Poppins',sans-serif", lineHeight:1.1, marginBottom:6 },
  pageSubtitle:    { fontSize:16, fontWeight:500, color:"#5B7384", fontFamily:"'Poppins',sans-serif", marginBottom:12 },
  headDivider:     { height:0.5, background:"#2EABFE", marginBottom:18 },
  statGrid:        { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 },
  midRow:          { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 },
  panelWhite:      { background:"#fff", borderRadius:5, padding:"16px 20px", display:"flex", flexDirection:"column" },
  panelHdr:        { display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:12 },
  panelHdrLeft:    { display:"flex", alignItems:"center", gap:10 },
  panelIcon:       { width:36, height:36, borderRadius:5, background:"rgba(208,235,255,0.25)", border:"0.5px solid #2EABFE", display:"grid", placeItems:"center", flexShrink:0 },
  panelTitle:      { fontSize:16, fontWeight:600, color:"#091925", fontFamily:"'Poppins',sans-serif" },
  panelSub:        { fontSize:11, color:"#7FA8C4", fontFamily:"'Poppins',sans-serif", marginTop:2 },
  panelDivider:    { height:0.5, background:"#7FA8C4", opacity:0.35, margin:"4px 0" },
  viewAllBtn:      { padding:"8px 14px", borderRadius:5, background:"rgba(46,171,254,0.10)", border:"0.5px solid #2EABFE", color:"#2EABFE", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif" },
  statusBadge:     { padding:"5px 12px", borderRadius:999, fontSize:11, fontWeight:700, fontFamily:"'Poppins',sans-serif" },
  progressTrack:   { height:8, borderRadius:999, background:"rgba(9,25,37,0.07)", overflow:"hidden" },
  progressFill:    { height:"100%", borderRadius:999, transition:"width 0.4s" },
  ctaBlue:         { display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:5, border:"0.5px solid #2EABFE", background:"#2EABFE", color:"#091925", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif", marginTop:"auto" },
  ctaGreen:        { display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:5, border:"0.5px solid #008000", background:"#008000", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif" },
  ctaAmber:        { display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:5, border:"0.5px solid #F59E0B", background:"#F59E0B", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Poppins',sans-serif", marginTop:14 },
  tabsCard:        { background:"#fff", borderRadius:5, overflow:"hidden" },
  tabBar:          { display:"flex", alignItems:"center", borderBottom:"0.5px solid rgba(2,8,23,0.08)", background:"#fff" },
  tabSearch:       { display:"flex", alignItems:"center", gap:8, padding:"0 12px", height:50, borderLeft:"0.5px solid rgba(2,8,23,0.08)", flex:1 },
  tabSearchInput:  { flex:1, border:"none", outline:"none", fontSize:13, fontFamily:"'Poppins',sans-serif", background:"transparent", color:"#091925" },
  backBtn:         { marginLeft:"auto", padding:"0 20px", height:50, border:"0.5px solid #7FA8C4", borderTop:"none", borderBottom:"none", background:"#fff", color:"#5B7384", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Poppins',sans-serif" },
  tabBody:         { padding:"16px" },
  innerPanel:      { background:"#fff", borderRadius:5, border:"0.5px solid rgba(2,8,23,0.08)", padding:"14px" },
  innerPanelHdr:   { display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:12 },
  innerPanelTitle: { fontSize:15, fontWeight:700, color:"#091925", fontFamily:"'Poppins',sans-serif" },
  ghostBtn:        { display:"inline-flex", alignItems:"center", gap:4, padding:"6px 10px", borderRadius:999, border:"0.5px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", cursor:"pointer", fontWeight:700, fontSize:12, color:"rgba(11,18,32,0.65)", fontFamily:"'Poppins',sans-serif" },
  actionCard:      { display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:8, border:"0.5px solid rgba(2,8,23,0.07)", background:"rgba(2,8,23,0.01)", cursor:"pointer", width:"100%", textAlign:"left" },
  actionIcon:      { width:36, height:36, borderRadius:10, background:"rgba(46,171,254,0.10)", border:"0.5px solid rgba(46,171,254,0.18)", display:"grid", placeItems:"center", color:"#091925", flexShrink:0 },
  actionTitle:     { fontSize:13, fontWeight:800, color:"rgba(11,18,32,0.85)", fontFamily:"'Poppins',sans-serif" },
  actionSub:       { fontSize:11, fontWeight:600, color:"rgba(11,18,32,0.50)", fontFamily:"'Poppins',sans-serif", marginTop:2 },
  tableWrap:       { overflowX:"auto", borderRadius:5, border:"0.5px solid rgba(2,8,23,0.08)", background:"#fff" },
  table:           { width:"100%", borderCollapse:"separate", borderSpacing:0, minWidth:720 },
  th:              { textAlign:"left", fontSize:11, fontWeight:800, color:"rgba(11,18,32,0.55)", padding:"10px 12px", borderBottom:"0.5px solid rgba(2,8,23,0.08)", background:"rgba(2,8,23,0.02)", fontFamily:"'Poppins',sans-serif" },
  td:              { padding:"10px 12px", borderBottom:"0.5px solid rgba(2,8,23,0.05)", fontSize:13, color:"rgba(11,18,32,0.78)", fontFamily:"'Poppins',sans-serif" },
  orderCard:       { borderRadius:8, border:"0.5px solid rgba(2,8,23,0.08)", background:"#fff", padding:14 },
  startBtn:        { display:"inline-flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:8, border:"none", background:"#2EABFE", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:11, flexShrink:0, fontFamily:"'Poppins',sans-serif" },
  emptyMsg:        { fontSize:13, color:"#7FA8C4", padding:"20px 0", textAlign:"center", fontFamily:"'Poppins',sans-serif" },
};

export default Dashboard;