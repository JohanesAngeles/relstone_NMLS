import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import Layout from "../../components/Layout.jsx";
import StateSubmissionModal from "../../components/StateSubmissionModal.jsx";
import {
  BookOpen, Clock, CheckCircle, TrendingUp, Calendar,
  ChevronRight, AlertCircle, Download, FileText
} from "lucide-react";

/* ─── CE Tracker ──────────────────────────────────────────────────── */
const CETracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStateModal, setShowStateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/dashboard/ce-tracker");
        setTracker(res.data);
      } catch {
        setError("Failed to load CE tracker data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <Layout>
      <style>{css}</style>
      <div style={S.center}><div className="rs-spinner" /><div style={{ marginTop: 12, color: "rgba(11,18,32,0.65)" }}>Loading CE tracker…</div></div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <style>{css}</style>
      <div style={S.center}><div className="rs-alert"><span className="rs-alert-dot" /><span>{error}</span></div></div>
    </Layout>
  );

  const ceRequired = tracker?.ce_required || 0;
  const ceCompleted = tracker?.ce_completed || 0;
  const ceRemaining = Math.max(0, ceRequired - ceCompleted);
  const renewalDeadline = tracker?.renewal_deadline || null;
  const completedCourses = tracker?.completed_courses || [];
  const renewalStatus = tracker?.renewal_status || "in-progress";

  const progressPercent = ceRequired > 0 ? (ceCompleted / ceRequired) * 100 : 0;
  const isOnTrack = ceRemaining === 0 || (renewalDeadline && new Date(renewalDeadline) > new Date());

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  const daysUntilDeadline = renewalDeadline 
    ? Math.ceil((new Date(renewalDeadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Layout>
      <style>{css}</style>
      <div style={S.shell}>

        {/* ── Hero Section ── */}
        <section style={S.hero}>
          <div style={S.heroBg} />
          <div style={S.heroInner}>
            <div style={S.heroTop}>
              <div>
                <div style={S.heroKicker}>Continuing Education</div>
                <div style={S.heroHeadline}>Track your CE hours and renewal progress</div>
              </div>
              <button 
                type="button" 
                style={S.primaryBtn} 
                onClick={() => navigate("/courses")}
              >
                <BookOpen size={18} />
                <span>Browse More CE Courses</span>
                <ChevronRight size={18} />
              </button>
            </div>
            {renewalDeadline && (
              <div style={S.profileRow}>
                <div style={S.profileChip}>
                  <span>State: <strong>{tracker?.state || "Not set"}</strong></span>
                </div>
                <div style={S.profileChip}>
                  <span>Renewal Deadline: <strong>{formatDate(renewalDeadline)}</strong></span>
                </div>
                {daysUntilDeadline !== null && (
                  <div style={{
                    ...S.profileChip,
                    backgroundColor: daysUntilDeadline < 30 ? "rgba(239, 68, 68, 0.08)" : "rgba(34, 197, 94, 0.08)",
                    borderColor: daysUntilDeadline < 30 ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"
                  }}>
                    <span style={{ color: daysUntilDeadline < 30 ? "#ef4444" : "#22c55e" }}>
                      <strong>{daysUntilDeadline} days remaining</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Progress Card ── */}
        <section style={S.card}>
          <div style={S.cardHead}>
            <div>
              <div style={S.cardTitle}>
                <TrendingUp size={20} style={{ color: "rgba(11,18,32,0.7)" }} />
                CE Hours Progress
              </div>
              <div style={S.cardSub}>Your progress toward meeting renewal requirements</div>
            </div>
          </div>

          <div style={S.progressSection}>
            <div style={S.progressMetrics}>
              <div style={S.metricCard}>
                <div style={S.metricLabel}>Hours Required</div>
                <div style={S.metricValue}>{ceRequired}</div>
              </div>
              <div style={S.metricCard}>
                <div style={S.metricLabel}>Hours Completed</div>
                <div style={{ ...S.metricValue, color: "#22c55e" }}>{ceCompleted}</div>
              </div>
              <div style={S.metricCard}>
                <div style={S.metricLabel}>Hours Remaining</div>
                <div style={{ ...S.metricValue, color: ceRemaining > 0 ? "#f59e0b" : "#22c55e" }}>{ceRemaining}</div>
              </div>
            </div>

            <div style={S.progressBar}>
              <div style={S.progressTrack}>
                <div 
                  style={{
                    ...S.progressFill,
                    width: `${Math.min(progressPercent, 100)}%`
                  }} 
                />
              </div>
              <div style={S.progressLabel}>{Math.round(progressPercent)}% Complete</div>
            </div>

            {ceRemaining === 0 && (
              <div style={S.successBanner}>
                <CheckCircle size={18} />
                <span>You've met your CE renewal requirements!</span>
              </div>
            )}

            {ceRemaining > 0 && daysUntilDeadline && daysUntilDeadline < 30 && (
              <div style={S.warningBanner}>
                <AlertCircle size={18} />
                <span>Only {daysUntilDeadline} days left to complete {ceRemaining} more hours</span>
              </div>
            )}
          </div>
        </section>

        {/* ── State Submission Section ── */}
        {ceRemaining === 0 && (
          <section style={S.card}>
            <div style={S.cardHead}>
              <div>
                <div style={S.cardTitle}>
                  <FileText size={20} style={{ color: "rgba(11,18,32,0.7)" }} />
                  Next: Submit to State
                </div>
                <div style={S.cardSub}>Your CE hours are complete. Here's what to do next.</div>
              </div>
            </div>

            <div style={S.submissionContent}>
              <div style={S.submissionSteps}>
                <div style={S.submissionStep}>
                  <div style={S.submissionStepNum}>1</div>
                  <div>
                    <div style={S.submissionStepTitle}>Download Your Certificates</div>
                    <div style={S.submissionStepDesc}>Get your CE completion certificates from the table above</div>
                  </div>
                </div>
                <div style={S.submissionStep}>
                  <div style={S.submissionStepNum}>2</div>
                  <div>
                    <div style={S.submissionStepTitle}>Review State Requirements</div>
                    <div style={S.submissionStepDesc}>Understand your state's specific submission process</div>
                  </div>
                </div>
                <div style={S.submissionStep}>
                  <div style={S.submissionStepNum}>3</div>
                  <div>
                    <div style={S.submissionStepTitle}>Submit to Your State</div>
                    <div style={S.submissionStepDesc}>Upload certificates to your state's licensing portal</div>
                  </div>
                </div>
                <div style={S.submissionStep}>
                  <div style={S.submissionStepNum}>4</div>
                  <div>
                    <div style={S.submissionStepTitle}>Complete Renewal</div>
                    <div style={S.submissionStepDesc}>Finish your license renewal through your state's process</div>
                  </div>
                </div>
              </div>

              <div style={S.submissionActions}>
                <button
                  type="button"
                  style={S.submissionPrimaryBtn}
                  onClick={() => setShowStateModal(true)}
                >
                  <FileText size={16} />
                  <span>View Renewal Instructions</span>
                  <ChevronRight size={16} />
                </button>
                <p style={S.submissionHint}>
                  💡 We've compiled state-specific instructions to make the renewal process easy.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Completed CE Courses ── */}
        <section style={S.card}>
          <div style={S.cardHead}>
            <div>
              <div style={S.cardTitle}>
                <CheckCircle size={20} style={{ color: "rgba(11,18,32,0.7)" }} />
                Completed CE Courses
              </div>
              <div style={S.cardSub}>Courses credited toward your renewal requirement</div>
            </div>
            {completedCourses.length > 0 && (
              <button type="button" style={S.ghostBtn}>
                <Download size={16} /> Export Transcript
              </button>
            )}
          </div>

          {completedCourses.length === 0 ? (
            <div style={S.emptyState}>
              <BookOpen size={32} style={{ color: "rgba(11,18,32,0.3)" }} />
              <div style={S.emptyTitle}>No CE courses completed yet</div>
              <div style={S.emptySub}>Start taking CE courses to track your progress</div>
              <button 
                type="button" 
                style={S.primaryBtn}
                onClick={() => navigate("/courses")}
              >
                <BookOpen size={16} />
                Browse CE Courses
              </button>
            </div>
          ) : (
            <div style={S.coursesList}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Course Title</th>
                    <th style={S.th}>Completed Date</th>
                    <th style={S.thRight}>Credit Hours</th>
                    <th style={S.th}>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {completedCourses.map((course, i) => (
                    <tr key={i} className="rs-tr">
                      <td style={S.td}>
                        <span style={{ fontWeight: 700, color: "rgba(11,18,32,0.88)" }}>
                          {course.title}
                        </span>
                      </td>
                      <td style={S.td}>{formatDate(course.completed_at)}</td>
                      <td style={S.tdRight}>
                        <span style={{ 
                          fontWeight: 600, 
                          color: "#22c55e",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}>
                          <Clock size={14} />
                          {course.credit_hours} hrs
                        </span>
                      </td>
                      <td style={S.td}>
                        {course.certificate_url ? (
                          <a 
                            href={course.certificate_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="rs-link"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                          >
                            <Download size={14} /> Download
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
        </section>

        {/* ── CTA Section ── */}
        <section style={S.ctaSection}>
          <div style={S.ctaContent}>
            <div style={S.ctaText}>
              <div style={S.ctaTitle}>Ready to complete your CE requirements?</div>
              <div style={S.ctaSub}>Browse our catalog of approved CE courses for your state</div>
            </div>
            <button 
              type="button" 
              style={S.primaryBtn}
              onClick={() => navigate("/courses")}
            >
              <BookOpen size={18} />
              <span>Browse More CE Courses</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

      </div>

      {/* ── State Submission Modal ── */}
      <StateSubmissionModal
        isOpen={showStateModal}
        onClose={() => setShowStateModal(false)}
        state={tracker?.state}
        hoursRequired={ceRequired}
      />
    </Layout>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────── */
const S = {
  shell: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 16px",
    display: "grid",
    gap: "32px",
  },
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    flexDirection: "column",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    opacity: 0.1,
    backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23fff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
  },
  heroInner: {
    position: "relative",
    zIndex: 1,
    padding: "40px 32px",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "24px",
  },
  heroKicker: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
    opacity: 0.85,
    marginBottom: "8px",
  },
  heroHeadline: {
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "1.3",
  },
  profileRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  profileChip: {
    padding: "10px 16px",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "8px",
    fontSize: "13px",
    border: "1px solid rgba(255,255,255,0.25)",
    display: "inline-flex",
    alignItems: "center",
  },
  primaryBtn: {
    padding: "10px 20px",
    background: "#fff",
    color: "#667eea",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
    }
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(11,18,32,0.1)",
    borderRadius: "12px",
    overflow: "hidden",
  },
  cardHead: {
    padding: "24px 32px",
    borderBottom: "1px solid rgba(11,18,32,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "rgba(11,18,32,0.88)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px",
  },
  cardSub: {
    fontSize: "13px",
    color: "rgba(11,18,32,0.55)",
  },
  ghostBtn: {
    padding: "8px 16px",
    background: "transparent",
    color: "#667eea",
    border: "1px solid #667eea",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  },
  progressSection: {
    padding: "32px",
    display: "grid",
    gap: "24px",
  },
  progressMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },
  metricCard: {
    padding: "16px",
    background: "rgba(11,18,32,0.02)",
    border: "1px solid rgba(11,18,32,0.08)",
    borderRadius: "8px",
    display: "grid",
    gap: "8px",
  },
  metricLabel: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "rgba(11,18,32,0.55)",
    letterSpacing: "0.5px",
  },
  metricValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#667eea",
  },
  progressBar: {
    display: "grid",
    gap: "12px",
  },
  progressTrack: {
    width: "100%",
    height: "12px",
    background: "rgba(11,18,32,0.08)",
    borderRadius: "6px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "6px",
    transition: "width 0.3s ease",
  },
  progressLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "rgba(11,18,32,0.7)",
    textAlign: "right",
  },
  successBanner: {
    padding: "12px 16px",
    background: "rgba(34, 197, 94, 0.08)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    borderRadius: "8px",
    color: "#22c55e",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  warningBanner: {
    padding: "12px 16px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "8px",
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  emptyState: {
    padding: "60px 32px",
    display: "grid",
    gap: "12px",
    alignItems: "center",
    justifyItems: "center",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "rgba(11,18,32,0.88)",
  },
  emptySub: {
    fontSize: "13px",
    color: "rgba(11,18,32,0.55)",
    marginBottom: "12px",
  },
  coursesList: {
    padding: "24px 32px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "12px 0",
    borderBottom: "1px solid rgba(11,18,32,0.08)",
    fontWeight: "700",
    color: "rgba(11,18,32,0.7)",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  thRight: {
    textAlign: "right",
    padding: "12px 0",
    borderBottom: "1px solid rgba(11,18,32,0.08)",
    fontWeight: "700",
    color: "rgba(11,18,32,0.7)",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "12px 0",
    borderBottom: "1px solid rgba(11,18,32,0.04)",
    color: "rgba(11,18,32,0.7)",
  },
  tdRight: {
    padding: "12px 0",
    borderBottom: "1px solid rgba(11,18,32,0.04)",
    color: "rgba(11,18,32,0.7)",
    textAlign: "right",
  },
  ctaSection: {
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
    border: "1px solid rgba(102, 126, 234, 0.2)",
    borderRadius: "12px",
    padding: "40px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
  },
  ctaContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "32px",
    width: "100%",
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "rgba(11,18,32,0.88)",
    marginBottom: "4px",
  },
  ctaSub: {
    fontSize: "13px",
    color: "rgba(11,18,32,0.55)",
  },
  submissionContent: {
    padding: "32px",
    display: "grid",
    gap: "32px",
  },
  submissionSteps: {
    display: "grid",
    gap: "16px",
  },
  submissionStep: {
    display: "flex",
    gap: "16px",
    padding: "16px",
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: "8px",
    border: "1px solid rgba(11,18,32,0.04)",
  },
  submissionStepNum: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  submissionStepTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "rgba(11,18,32,0.88)",
    marginBottom: "4px",
  },
  submissionStepDesc: {
    fontSize: "12px",
    color: "rgba(11,18,32,0.55)",
  },
  submissionActions: {
    display: "grid",
    gap: "16px",
    padding: "24px",
    background: "rgba(102,126,234,0.04)",
    borderRadius: "8px",
    border: "1px solid rgba(102,126,234,0.1)",
  },
  submissionPrimaryBtn: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
  },
  submissionHint: {
    fontSize: "12px",
    color: "rgba(11,18,32,0.55)",
    margin: 0,
  },
};

const css = `
  .rs-spinner { width:24px; height:24px; border:2px solid rgba(11,18,32,0.1); border-top-color:#667eea; border-radius:50%; animation:spin 0.6s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .rs-alert { padding:12px 16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:8px; color:#ef4444; font-weight:600; font-size:13px; display:flex; align-items:center; gap:8px; }
  .rs-alert-dot { width:8px; height:8px; background:#ef4444; border-radius:50%; flex-shrink:0; }
  .rs-tr:hover { background:rgba(11,18,32,0.02); }
  .rs-link { color:#667eea; font-weight:600; text-decoration:none; transition:all 0.2s; }
  .rs-link:hover { text-decoration:underline; }
`;

export default CETracker;
