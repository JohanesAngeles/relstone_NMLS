import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import logo from "../../assets/images/Left Side Logo.png";
import {
  User,
  LogOut,
  FileText,
  BookOpen,
  Clock,
  CheckCircle,
  Award,
  MapPin,
  Hash,
  ChevronRight,
  Search,
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [transcript, setTranscript] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, transcriptRes] = await Promise.all([
          API.get("/dashboard"),
          API.get("/dashboard/transcript"),
        ]);
        setDashboard(dashRes.data);
        setTranscript(transcriptRes.data);
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profile = dashboard?.profile || {};
  const completions = dashboard?.completions || {};
  const orders = dashboard?.orders || [];
  const pendingCourses = dashboard?.pending_courses || [];

  const peCount = completions?.PE?.length || 0;
  const ceCount = completions?.CE?.length || 0;
  const pendingCount = pendingCourses?.length || 0;

  const recentCompletions = useMemo(() => {
    const list = [...(completions?.PE || []), ...(completions?.CE || [])];
    // newest first if completed_at exists
    list.sort((a, b) => {
      const da = a?.completed_at ? new Date(a.completed_at).getTime() : 0;
      const db = b?.completed_at ? new Date(b.completed_at).getTime() : 0;
      return db - da;
    });
    return list.slice(0, 5);
  }, [completions]);

  const filteredTranscript = useMemo(() => {
    const rows = transcript?.transcript || [];
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((t) => {
      const title = String(t.course_title || "").toLowerCase();
      const nmls = String(t.nmls_course_id || "").toLowerCase();
      const type = String(t.type || "").toLowerCase();
      return title.includes(needle) || nmls.includes(needle) || type.includes(needle);
    });
  }, [transcript, q]);

  if (loading) {
    return (
      <div style={S.page}>
        <style>{css}</style>
        <div style={S.center}>
          <div className="rs-spinner" />
          <div style={{ marginTop: 12, color: "rgba(11,18,32,0.65)" }}>Loading dashboard…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
  }

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* Top bar */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.brandLeft}>
  <img src={logo} alt="Relstone" style={S.brandLogo} />

  <div>
    <div style={S.brandTitle}>NMLS Student Portal</div>
    <div style={S.brandSubtitle}>Your learning status, transcript, and orders</div>
  </div>
</div>

          <div style={S.topbarRight}>
            <div style={S.userPill}>
              <User size={16} />
              <span style={S.userName}>{user?.name || "Student"}</span>
            </div>

            <button style={S.logoutBtn} onClick={handleLogout} type="button">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content shell */}
      <div style={S.shell}>
        {/* Hero card */}
        <section style={S.hero}>
          <div style={S.heroBg} aria-hidden="true" />

          <div style={S.heroInner}>
            <div style={S.heroTop}>
              <div>
                <div style={S.heroKicker}>Account Snapshot</div>
                <div style={S.heroHeadline}>Stay on track with your NMLS progress.</div>
              </div>

              <button
                type="button"
                style={S.primaryBtn}
                onClick={() => navigate("/courses")}
                title="Browse available courses"
              >
                <BookOpen size={18} />
                <span>Browse courses</span>
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={S.profileRow}>
              <div style={S.profileChip}>
                <Hash size={16} style={{ color: "var(--rs-blue)" }} />
                <span>
                  NMLS ID: <strong>{profile?.nmls_id || "Not set"}</strong>
                </span>
              </div>

              <div style={S.profileChip}>
                <MapPin size={16} style={{ color: "var(--rs-blue)" }} />
                <span>
                  State: <strong>{profile?.state || "Not set"}</strong>
                </span>
              </div>

              <div style={S.profileChip}>
                <CheckCircle size={16} style={{ color: "var(--rs-blue)" }} />
                <span>
                  Total Completions: <strong>{completions?.total || 0}</strong>
                </span>
              </div>
            </div>

            <div style={S.kpiGrid}>
              <KpiCard
                icon={<BookOpen size={20} />}
                title="Pre-Licensing (PE)"
                value={peCount}
                caption="Completed"
                tone="blue"
              />
              <KpiCard
                icon={<FileText size={20} />}
                title="Continuing Ed (CE)"
                value={ceCount}
                caption="Completed"
                tone="teal"
              />
              <KpiCard
                icon={<Clock size={20} />}
                title="Pending Courses"
                value={pendingCount}
                caption="In progress"
                tone="amber"
              />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section style={S.card}>
          <div style={S.tabRow}>
            <div style={S.tabs}>
              <TabButton label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
              <TabButton label="Transcript" active={activeTab === "transcript"} onClick={() => setActiveTab("transcript")} />
              <TabButton label="Orders" active={activeTab === "orders"} onClick={() => setActiveTab("orders")} />
            </div>

            {activeTab === "transcript" && (
              <div style={S.searchWrap}>
                <Search size={16} style={{ color: "rgba(9,25,37,0.55)" }} />
                <input
                  style={S.searchInput}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search transcript…"
                />
              </div>
            )}
          </div>

          <div style={S.cardBody}>
            {/* Overview */}
            {activeTab === "overview" && (
              <div style={S.gridTwo}>
                <div style={S.panel}>
                  <div style={S.panelHead}>
                    <div style={S.panelTitle}>Recent completions</div>
                    <button style={S.ghostBtn} type="button" onClick={() => setActiveTab("transcript")}>
                      View transcript <ChevronRight size={16} />
                    </button>
                  </div>

                  {recentCompletions.length === 0 ? (
                    <EmptyState
                      icon={<Award size={18} />}
                      title="No completions yet"
                      subtitle="Once you complete a course, it will show here."
                      actionLabel="Browse courses"
                      onAction={() => navigate("/courses")}
                    />
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {recentCompletions.map((c, i) => (
                        <CompletionRow key={i} item={c} />
                      ))}
                    </div>
                  )}
                </div>

                <div style={S.panel}>
                  <div style={S.panelHead}>
                    <div style={S.panelTitle}>Quick actions</div>
                  </div>

                  <div style={S.quickActions}>
                    <button style={S.actionCard} type="button" onClick={() => navigate("/courses")}>
                      <div style={S.actionIcon}>
                        <BookOpen size={18} />
                      </div>
                      <div style={S.actionText}>
                        <div style={S.actionTitle}>Browse courses</div>
                        <div style={S.actionSub}>Find PE and CE courses</div>
                      </div>
                      <ChevronRight size={18} />
                    </button>

                    <button style={S.actionCard} type="button" onClick={() => setActiveTab("transcript")}>
                      <div style={S.actionIcon}>
                        <FileText size={18} />
                      </div>
                      <div style={S.actionText}>
                        <div style={S.actionTitle}>View transcript</div>
                        <div style={S.actionSub}>Download and verify details</div>
                      </div>
                      <ChevronRight size={18} />
                    </button>

                    <button style={S.actionCard} type="button" onClick={() => setActiveTab("orders")}>
                      <div style={S.actionIcon}>
                        <Clock size={18} />
                      </div>
                      <div style={S.actionText}>
                        <div style={S.actionTitle}>Check orders</div>
                        <div style={S.actionSub}>Track payment and status</div>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transcript */}
            {activeTab === "transcript" && (
              <div>
                <div style={S.sectionHead}>
                  <div>
                    <div style={S.sectionTitle}>Transcript</div>
                    <div style={S.sectionSub}>
                      {transcript?.student?.name ? `NMLS Transcript — ${transcript.student.name}` : "Your completed courses"}
                    </div>
                  </div>
                </div>

                {filteredTranscript.length === 0 ? (
                  <EmptyState
                    icon={<FileText size={18} />}
                    title={q.trim() ? "No matches found" : "No completed courses yet"}
                    subtitle={q.trim() ? "Try a different search keyword." : "Complete a course to populate your transcript."}
                    actionLabel="Browse courses"
                    onAction={() => navigate("/courses")}
                  />
                ) : (
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>Course</th>
                          <th style={S.th}>NMLS ID</th>
                          <th style={S.th}>Type</th>
                          <th style={S.thRight}>Credit Hrs</th>
                          <th style={S.th}>Completed</th>
                          <th style={S.th}>Certificate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTranscript.map((t, i) => (
                          <tr key={i} className="rs-tr">
                            <td style={S.td}>
                              <div style={{ display: "grid" }}>
                                <span style={{ fontWeight: 700, color: "rgba(11,18,32,0.88)" }}>
                                  {t.course_title}
                                </span>
                              </div>
                            </td>
                            <td style={S.td}>{t.nmls_course_id}</td>
                            <td style={S.td}>
                              <span style={badgeStyle(t.type)}>{String(t.type || "").toUpperCase()}</span>
                            </td>
                            <td style={S.tdRight}>{t.credit_hours}</td>
                            <td style={S.td}>
                              {t.completed_at ? new Date(t.completed_at).toLocaleDateString() : "-"}
                            </td>
                            <td style={S.td}>
                              {t.certificate_url ? (
                                <a
                                  href={t.certificate_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rs-link"
                                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                                >
                                  <Award size={16} />
                                  View
                                </a>
                              ) : (
                                <span style={{ color: "rgba(11,18,32,0.45)" }}>—</span>
                              )}
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
              <div>
                <div style={S.sectionHead}>
                  <div>
                    <div style={S.sectionTitle}>Orders</div>
                    <div style={S.sectionSub}>Your purchases and payment status</div>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <EmptyState
                    icon={<Clock size={18} />}
                    title="No orders yet"
                    subtitle="When you purchase courses, your orders will show here."
                    actionLabel="Browse courses"
                    onAction={() => navigate("/courses")}
                  />
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {orders.map((order, i) => (
                      <div key={i} style={S.orderCard}>
                        <div style={S.orderTop}>
                          <div style={S.orderLeft}>
                            <div style={S.orderTitle}>
                              <FileText size={16} />
                              <span>Order #{String(order?._id || "").slice(-6).toUpperCase()}</span>
                            </div>
                            <div style={S.orderMeta}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <Clock size={14} />
                                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                              </span>
                            </div>
                          </div>
                          <span style={orderStatusStyle(order?.status)}>{order?.status}</span>
                        </div>

                        <div style={S.orderItems}>
                          {(order?.items || []).map((item, j) => (
                            <div key={j} style={S.orderItem}>
                              <BookOpen size={15} style={{ opacity: 0.8 }} />
                              <span>{item?.course_id?.title || "Course"}</span>
                              {item?.include_textbook && <span style={S.pill}>+ Textbook</span>}
                            </div>
                          ))}
                        </div>

                        <div style={S.orderBottom}>
                          <div style={S.total}>
                            Total:{" "}
                            <strong>
                              ${Number(order?.total_amount || 0).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
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

/* ---------- Small UI components (same file) ---------- */

const TabButton = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...S.tabBtn,
      ...(active ? S.tabBtnActive : {}),
    }}
  >
    {label}
  </button>
);

const KpiCard = ({ icon, title, value, caption, tone }) => {
  const toneMap = {
    blue: { bg: "rgba(46,171,254,0.10)", border: "rgba(46,171,254,0.25)" },
    teal: { bg: "rgba(0, 180, 180, 0.10)", border: "rgba(0, 180, 180, 0.22)" },
    amber: { bg: "rgba(245, 158, 11, 0.10)", border: "rgba(245, 158, 11, 0.22)" },
  };
  const t = toneMap[tone] || toneMap.blue;

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

const CompletionRow = ({ item }) => {
  const title = item?.course?.title || "Course";
  const type = item?.course?.type || "";
  const hrs = item?.course?.credit_hours ?? "-";
  const completedAt = item?.completed_at ? new Date(item.completed_at).toLocaleDateString() : "-";

  return (
    <div style={S.rowCard}>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={S.rowTop}>
          <div style={S.rowTitle}>{title}</div>
          <span style={badgeStyle(type)}>{String(type || "").toUpperCase()}</span>
        </div>
        <div style={S.rowMeta}>
          <span style={S.metaItem}>
            <Clock size={14} /> {hrs} hrs
          </span>
          <span style={S.metaItem}>
            <CheckCircle size={14} /> {completedAt}
          </span>
          {item?.certificate_url ? (
            <a
              href={item.certificate_url}
              target="_blank"
              rel="noreferrer"
              className="rs-link"
              style={S.metaLink}
            >
              <Award size={14} />
              Certificate
            </a>
          ) : null}
        </div>
      </div>
      <ChevronRight size={18} style={{ color: "rgba(9,25,37,0.45)" }} />
    </div>
  );
};

const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }) => (
  <div style={S.emptyWrap}>
    <div style={S.emptyIcon}>{icon}</div>
    <div style={S.emptyTitle}>{title}</div>
    <div style={S.emptySub}>{subtitle}</div>
    <button style={S.primaryBtnSmall} type="button" onClick={onAction}>
      {actionLabel} <ChevronRight size={16} />
    </button>
  </div>
);

/* ---------- Styling helpers ---------- */

const badgeStyle = (type) => {
  const t = String(type || "").toUpperCase();
  const isPE = t === "PE" || t.includes("PRE");
  const isCE = t === "CE" || t.includes("CONT");

  if (isPE) {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: "0.2px",
      color: "var(--rs-blue)",
      background: "rgba(46,171,254,0.12)",
      border: "1px solid rgba(46,171,254,0.22)",
    };
  }

  if (isCE) {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: "0.2px",
      color: "rgba(0,140,140,1)",
      background: "rgba(0,180,180,0.12)",
      border: "1px solid rgba(0,180,180,0.20)",
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.2px",
    color: "rgba(9,25,37,0.78)",
    background: "rgba(2,8,23,0.06)",
    border: "1px solid rgba(2,8,23,0.10)",
  };
};

const orderStatusStyle = (status) => {
  const s = String(status || "").toLowerCase();

  const base = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.2px",
    border: "1px solid transparent",
    textTransform: "capitalize",
  };

  if (s === "paid" || s === "completed" || s === "success") {
    return {
      ...base,
      color: "rgba(0,140,140,1)",
      background: "rgba(0,180,180,0.12)",
      borderColor: "rgba(0,180,180,0.20)",
    };
  }

  if (s === "pending") {
    return {
      ...base,
      color: "rgba(180, 120, 0, 1)",
      background: "rgba(245,158,11,0.12)",
      borderColor: "rgba(245,158,11,0.22)",
    };
  }

  return {
    ...base,
    color: "rgba(200, 50, 50, 1)",
    background: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.20)",
  };
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root{
  --rs-dark:#091925;
  --rs-blue:#2EABFE;
  --rs-grad: linear-gradient(110deg, #091925 0%, #0b2a3a 45%, #2EABFE 100%);
  --rs-bg:#f6f7fb;
  --rs-text: rgba(11,18,32,0.92);
  --rs-muted: rgba(11,18,32,0.60);
  --rs-border: rgba(2,8,23,0.10);
  --rs-shadow: 0 18px 48px rgba(2, 8, 23, 0.10);
  --rs-ring: rgba(46,171,254,0.28);
}

*{box-sizing:border-box}
body{margin:0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: var(--rs-bg); color: var(--rs-text);}

.rs-link{ color: var(--rs-blue); text-decoration: none; font-weight: 800; }
.rs-link:hover{ text-decoration: underline; }

.rs-spinner{
  width: 36px; height: 36px; border-radius: 999px;
  border: 3px solid rgba(2,8,23,0.12);
  border-top-color: var(--rs-blue);
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.rs-alert{
  display:flex;
  gap:10px;
  align-items:flex-start;
  padding:12px 12px;
  border-radius:14px;
  border:1px solid rgba(46,171,254,0.25);
  background: rgba(46,171,254,0.10);
  color: var(--rs-dark);
  font-size:13px;
}
.rs-alert-dot{
  width:10px; height:10px; border-radius:999px;
  background: var(--rs-blue);
  margin-top:4px;
}

.rs-tr:hover{ background: rgba(46,171,254,0.05); }
`;

const S = {
  page: { minHeight: "100vh", background: "var(--rs-bg)" },
  center: { minHeight: "100vh", display: "grid", placeItems: "center" },

  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(246,247,251,0.82)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
  },
  topbarInner: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brandLeft: { display: "flex", alignItems: "center", gap: 12 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 14,
    background: "var(--rs-grad)",
    boxShadow: "0 10px 22px rgba(46,171,254,0.18)",
  },
  brandTitle: { fontWeight: 900, letterSpacing: "-0.2px" },
  brandSubtitle: { fontSize: 12, color: "var(--rs-muted)", marginTop: 2 },

  topbarRight: { display: "flex", alignItems: "center", gap: 10 },
  userPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    boxShadow: "0 8px 20px rgba(2,8,23,0.06)",
  },
  userName: { fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.80)" },
  logoutBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    color: "rgba(11,18,32,0.82)",
    transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
  },

  shell: { maxWidth: 1180, margin: "0 auto", padding: "18px 18px 40px" },

  hero: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
    border: "none",
    background: "var(--rs-grad)",
    boxShadow: "0 22px 60px rgba(2,8,23,0.16)",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(900px 500px at 20% 25%, rgba(46,171,254,0.22), transparent 60%), radial-gradient(700px 520px at 88% 80%, rgba(255,255,255,0.10), transparent 55%)",
    pointerEvents: "none",
  },
  heroInner: { position: "relative", padding: 20 },
  heroTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: "8px 8px 14px",
  },
  heroKicker: { color: "rgba(255,255,255,0.78)", fontWeight: 800, fontSize: 12 },
  heroHeadline: { color: "#fff", fontWeight: 950, fontSize: 18, letterSpacing: "-0.2px", marginTop: 4 },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(9,25,37,0.35)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 14px 30px rgba(2,8,23,0.20)",
  },
  primaryBtnSmall: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    color: "rgba(11,18,32,0.85)",
    cursor: "pointer",
    fontWeight: 900,
  },

  profileRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    padding: "0 8px 14px",
  },
  profileChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "rgba(255,255,255,0.88)",
    fontWeight: 700,
    fontSize: 13,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    padding: 8,
  },
  kpiCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
  },
  kpiIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "grid",
    placeItems: "center",
    color: "#fff",
  },
  kpiText: { display: "grid", gap: 2 },
  kpiTitle: { color: "rgba(255,255,255,0.78)", fontWeight: 800, fontSize: 12 },
  kpiValue: { color: "#fff", fontWeight: 950, fontSize: 24, letterSpacing: "-0.4px" },
  kpiCaption: { color: "rgba(255,255,255,0.70)", fontWeight: 700, fontSize: 12 },

  card: {
    marginTop: 14,
    borderRadius: 22,
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(2,8,23,0.08)",
    boxShadow: "var(--rs-shadow)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  tabRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: "14px 14px 10px",
    borderBottom: "1px solid rgba(2,8,23,0.06)",
  },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap" },
  tabBtn: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    color: "rgba(11,18,32,0.72)",
    fontSize: 13,
  },
  tabBtnActive: {
    borderColor: "rgba(46,171,254,0.32)",
    boxShadow: "0 0 0 5px var(--rs-ring)",
    color: "var(--rs-dark)",
  },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    minWidth: 260,
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(11,18,32,0.80)",
    background: "transparent",
  },

  cardBody: { padding: 14 },

  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.85fr",
    gap: 12,
  },
  panel: {
    borderRadius: 18,
    background: "#fff",
    border: "1px solid rgba(2,8,23,0.08)",
    padding: 14,
  },
  panelHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 },
  panelTitle: { fontWeight: 950, color: "rgba(11,18,32,0.82)" },
  ghostBtn: {
    border: "1px solid rgba(2,8,23,0.10)",
    background: "rgba(2,8,23,0.02)",
    borderRadius: 999,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: "rgba(11,18,32,0.72)",
  },

  rowCard: {
    borderRadius: 16,
    border: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)",
    padding: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  rowTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  rowTitle: { fontWeight: 950, color: "rgba(11,18,32,0.88)" },
  rowMeta: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  metaItem: { display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(11,18,32,0.62)", fontWeight: 800, fontSize: 12 },
  metaLink: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 },

  quickActions: { display: "grid", gap: 10 },
  actionCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)",
    cursor: "pointer",
    textAlign: "left",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    background: "rgba(46,171,254,0.12)",
    border: "1px solid rgba(46,171,254,0.18)",
    display: "grid",
    placeItems: "center",
    color: "var(--rs-dark)",
    flexShrink: 0,
  },
  actionText: { flex: 1, display: "grid", gap: 2 },
  actionTitle: { fontWeight: 950, color: "rgba(11,18,32,0.84)" },
  actionSub: { fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.55)" },

  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 10, flexWrap: "wrap" },
  sectionTitle: { fontWeight: 950, fontSize: 16, color: "rgba(11,18,32,0.86)" },
  sectionSub: { marginTop: 4, fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.55)" },

  tableWrap: { overflowX: "auto", borderRadius: 16, border: "1px solid rgba(2,8,23,0.08)", background: "#fff" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 820 },
  th: {
    textAlign: "left",
    fontSize: 12,
    fontWeight: 950,
    color: "rgba(11,18,32,0.62)",
    padding: "12px 12px",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)",
  },
  thRight: {
    textAlign: "right",
    fontSize: 12,
    fontWeight: 950,
    color: "rgba(11,18,32,0.62)",
    padding: "12px 12px",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(2,8,23,0.02)",
  },
  td: { padding: "12px 12px", borderBottom: "1px solid rgba(2,8,23,0.06)", fontSize: 13, color: "rgba(11,18,32,0.78)" },
  tdRight: { padding: "12px 12px", borderBottom: "1px solid rgba(2,8,23,0.06)", fontSize: 13, textAlign: "right", color: "rgba(11,18,32,0.78)" },

  orderCard: { borderRadius: 18, border: "1px solid rgba(2,8,23,0.08)", background: "#fff", padding: 14 },
  orderTop: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },
  orderLeft: { display: "grid", gap: 6 },
  orderTitle: { display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 950, color: "rgba(11,18,32,0.86)" },
  orderMeta: { color: "rgba(11,18,32,0.55)", fontWeight: 750, fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" },
  orderItems: { marginTop: 12, display: "grid", gap: 8 },
  orderItem: { display: "flex", alignItems: "center", gap: 10, color: "rgba(11,18,32,0.78)", fontWeight: 700 },
  pill: { marginLeft: 8, padding: "3px 8px", borderRadius: 999, background: "rgba(2,8,23,0.06)", border: "1px solid rgba(2,8,23,0.08)", fontSize: 12, fontWeight: 850, color: "rgba(11,18,32,0.70)" },
  orderBottom: { marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(2,8,23,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  total: { color: "rgba(11,18,32,0.70)", fontWeight: 800 },

  emptyWrap: {
    borderRadius: 18,
    border: "1px dashed rgba(2,8,23,0.16)",
    background: "rgba(2,8,23,0.02)",
    padding: 18,
    textAlign: "center",
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    background: "rgba(46,171,254,0.12)",
    border: "1px solid rgba(46,171,254,0.18)",
    display: "grid",
    placeItems: "center",
    color: "var(--rs-dark)",
    margin: "0 auto",
  },
  emptyTitle: { marginTop: 10, fontWeight: 950, color: "rgba(11,18,32,0.86)" },
  emptySub: { marginTop: 6, color: "rgba(11,18,32,0.55)", fontWeight: 700, fontSize: 12, lineHeight: 1.6 },

  // responsive note:
  // if you want tighter behavior on mobile without media queries,
  // keep it simple; the layout is already flexible and wraps.
};

export default Dashboard;