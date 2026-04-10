import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import logo from "../../assets/images/Left Side Logo.png";
import EditCourseModal from "./EditCourseModal";
import {
  Users, BookOpen, CheckCircle, Clock, Award,
  ChevronRight, BarChart2, TrendingUp, Search,
  MoreHorizontal, PlayCircle, AlertCircle, Star,
  Eye, RefreshCw, GraduationCap, FileText,
  MessageSquare, ThumbsUp, ThumbsDown, Trash2,
  UserCheck, UserX, Activity, BookPlus, BookMinus,
  Filter, Calendar, User, Pencil, Bell, Plus,
  DollarSign, XCircle, CreditCard, Package,HelpCircle
} from "lucide-react";

/* ─── Logout Confirm ─────────────────────────────────────────────── */
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
      <div style={{ fontSize: 18, fontWeight: 950, color: "rgba(11,18,32,0.88)", marginBottom: 8 }}>Sign out?</div>
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

/* ─── Confirm Toggle Modal ───────────────────────────────────────── */
const ConfirmToggleModal = ({ student, onConfirm, onCancel, loading }) => {
  const willDeactivate = student?.is_active !== false;
  return (
    <>
      <div onClick={onCancel} style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(9,25,37,0.55)", backdropFilter: "blur(5px)",
      }} />
      <div style={{
        position: "fixed", zIndex: 301,
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "100%", maxWidth: 400,
        background: "#fff", borderRadius: 22, padding: "32px 28px 26px",
        boxShadow: "0 28px 70px rgba(9,25,37,0.20)",
        textAlign: "center", fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18, margin: "0 auto 18px",
          background: willDeactivate ? "rgba(239,68,68,0.08)" : "rgba(0,180,180,0.08)",
          border: `1px solid ${willDeactivate ? "rgba(239,68,68,0.18)" : "rgba(0,180,180,0.20)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: willDeactivate ? "rgba(220,38,38,0.85)" : "var(--rs-teal)",
        }}>
          {willDeactivate ? <UserX size={26} /> : <UserCheck size={26} />}
        </div>
        <div style={{ fontSize: 18, fontWeight: 950, color: "rgba(11,18,32,0.88)", marginBottom: 8 }}>
          {willDeactivate ? "Deactivate Student?" : "Activate Student?"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.52)", lineHeight: 1.6, marginBottom: 6 }}>
          <strong>{student?.name}</strong>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(11,18,32,0.52)", lineHeight: 1.6, marginBottom: 24 }}>
          {willDeactivate
            ? "This student will be marked as inactive and will not be able to log in."
            : "This student will be reactivated and can log in again."}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} type="button" disabled={loading} style={{
            flex: 1, height: 44, background: "rgba(2,8,23,0.04)",
            border: "1px solid rgba(2,8,23,0.10)", borderRadius: 12,
            cursor: "pointer", fontSize: 14, fontWeight: 900,
            color: "rgba(11,18,32,0.72)", fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={onConfirm} type="button" disabled={loading} style={{
            flex: 1, height: 44,
            background: willDeactivate ? "rgba(220,38,38,0.90)" : "rgba(0,180,180,0.90)",
            border: "none", borderRadius: 12, cursor: "pointer",
            fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "inherit",
          }}>
            {loading ? "Saving…" : willDeactivate ? "Yes, Deactivate" : "Yes, Activate"}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Confirm Order Action Modal ─────────────────────────────────── */
const ConfirmOrderModal = ({ order, action, onConfirm, onCancel, loading }) => {
  const isApprove = action === "paid";
  const student   = order?.user_id || {};
  const orderId   = String(order?._id || "").slice(-6).toUpperCase();
  const total     = Number(order?.total_amount || 0).toFixed(2);
  return (
    <>
      <div onClick={onCancel} style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(9,25,37,0.55)", backdropFilter: "blur(5px)",
      }} />
      <div style={{
        position: "fixed", zIndex: 301,
        top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: "100%", maxWidth: 420,
        background: "#fff", borderRadius: 22, padding: "32px 28px 26px",
        boxShadow: "0 28px 70px rgba(9,25,37,0.20)",
        textAlign: "center", fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18, margin: "0 auto 18px",
          background: isApprove ? "rgba(0,180,180,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${isApprove ? "rgba(0,180,180,0.22)" : "rgba(239,68,68,0.18)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isApprove ? "var(--rs-teal)" : "rgba(220,38,38,0.85)",
        }}>
          {isApprove ? <CheckCircle size={26} /> : <XCircle size={26} />}
        </div>
        <div style={{ fontSize: 18, fontWeight: 950, color: "rgba(11,18,32,0.88)", marginBottom: 8 }}>
          {isApprove ? "Confirm Payment?" : "Reject Order?"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.65)", marginBottom: 4 }}>
          Order <span style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--rs-teal)" }}>#{orderId}</span> · <strong>${total}</strong>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(11,18,32,0.52)", lineHeight: 1.6, marginBottom: 6 }}>
          {student.name || "—"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(11,18,32,0.45)", lineHeight: 1.6, marginBottom: 20 }}>
          {isApprove
            ? "The student's order status will be set to Paid and a confirmation email will be sent."
            : "This order will be cancelled. The student will not gain access to the courses."}
        </div>
        {isApprove && (
          <div style={{
            background: "rgba(0,180,180,0.06)", border: "1px solid rgba(0,180,180,0.20)",
            borderRadius: 12, padding: "10px 14px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <CheckCircle size={14} style={{ color: "var(--rs-teal)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(9,25,37,0.72)", textAlign: "left" }}>
              A confirmation email will be sent to <strong>{student.email}</strong>
            </span>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} type="button" disabled={loading} style={{
            flex: 1, height: 44, background: "rgba(2,8,23,0.04)",
            border: "1px solid rgba(2,8,23,0.10)", borderRadius: 12,
            cursor: "pointer", fontSize: 14, fontWeight: 900,
            color: "rgba(11,18,32,0.72)", fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={onConfirm} type="button" disabled={loading} style={{
            flex: 1, height: 44,
            background: isApprove ? "rgba(0,180,180,0.90)" : "rgba(220,38,38,0.90)",
            border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "inherit",
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Processing…" : isApprove ? "Yes, Confirm Payment" : "Yes, Reject"}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Activity Log helpers ───────────────────────────────────────── */
const LOG_META = {
  add_course:    { icon: <BookPlus  size={15} />, label: "Course Added",    color: "rgba(0,140,140,1)",   bg: "rgba(0,180,180,0.10)",  border: "rgba(0,180,180,0.25)"  },
  edit_course:   { icon: <Pencil    size={15} />, label: "Course Edited",   color: "rgba(79,70,229,1)",   bg: "rgba(79,70,229,0.10)",  border: "rgba(79,70,229,0.25)"  },
  remove_course: { icon: <BookMinus size={15} />, label: "Course Removed",  color: "rgba(185,28,28,1)",   bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.22)"  },
  assign_course: { icon: <BookPlus  size={15} />, label: "Course Assigned", color: "rgba(46,100,220,1)",  bg: "rgba(46,171,254,0.10)", border: "rgba(46,171,254,0.25)" },
  toggle_active: { icon: <UserCheck size={15} />, label: "Account Changed", color: "rgba(146,84,0,1)",    bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.28)" },
};

const formatLogDateTime = (ts) => {
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return { date, time, full: `${date} at ${time}` };
};

/* ─── ActivityLogPanel ───────────────────────────────────────────── */
const ActivityLogPanel = ({ logs, loading, onRefresh }) => {
  const [actionFilter, setActionFilter] = useState("all");
  const [logSearch,    setLogSearch]    = useState("");

  const filtered = useMemo(() => {
    let list = logs;
    if (actionFilter !== "all") list = list.filter(l => l.action === actionFilter);
    if (logSearch.trim()) {
      const needle = logSearch.toLowerCase();
      list = list.filter(l =>
        String(l.student_name    || "").toLowerCase().includes(needle) ||
        String(l.student_email   || "").toLowerCase().includes(needle) ||
        String(l.course_title    || "").toLowerCase().includes(needle) ||
        String(l.details         || "").toLowerCase().includes(needle) ||
        String(l.instructor_name || "").toLowerCase().includes(needle)
      );
    }
    return list;
  }, [logs, actionFilter, logSearch]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(log => {
      const { date } = formatLogDateTime(log.timestamp || log.createdAt);
      if (!map[date]) map[date] = [];
      map[date].push(log);
    });
    return Object.entries(map);
  }, [filtered]);

  return (
    <div>
      <div style={S.sectionHead}>
        <div>
          <div style={S.sectionTitle}>Activity Logs</div>
          <div style={S.sectionSub}>
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            {actionFilter !== "all" ? ` · ${LOG_META[actionFilter]?.label || actionFilter}` : " · all actions"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={S.searchWrap}>
            <Search size={15} style={{ color: "rgba(9,25,37,0.45)" }} />
            <input
              style={S.searchInput}
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              placeholder="Search by student, course, instructor…"
            />
          </div>
          <button style={S.refreshBtn} type="button" onClick={onRefresh}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <button type="button"
          style={{ ...S.filterChip, ...(actionFilter === "all" ? S.filterChipActive : {}) }}
          onClick={() => setActionFilter("all")}>
          All Actions
        </button>
        {Object.entries(LOG_META).map(([key, meta]) => (
          <button key={key} type="button"
            style={{ ...S.filterChip, ...(actionFilter === key ? S.filterChipActive : {}) }}
            onClick={() => setActionFilter(key)}>
            {meta.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ ...S.center, minHeight: 200 }}><div className="rs-spinner" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Activity size={18} />}
          title="No activity logs found"
          subtitle={logSearch || actionFilter !== "all"
            ? "Try adjusting your filters."
            : "Instructor actions (course edits, assignments, activations) will appear here."}
          actionLabel="Clear filters"
          onAction={() => { setActionFilter("all"); setLogSearch(""); }}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {grouped.map(([date, dayLogs]) => (
            <div key={date} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 999,
                  background: "rgba(2,8,23,0.04)", border: "1px solid rgba(2,8,23,0.09)",
                  fontSize: 11, fontWeight: 900, color: "rgba(11,18,32,0.55)",
                  letterSpacing: "0.04em",
                }}>
                  <Calendar size={12} />
                  {date}
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(2,8,23,0.07)" }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(11,18,32,0.38)" }}>
                  {dayLogs.length} event{dayLogs.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div style={{ position: "relative", paddingLeft: 32 }}>
                <div style={{
                  position: "absolute", left: 11, top: 0, bottom: 0,
                  width: 2, background: "rgba(2,8,23,0.07)", borderRadius: 99,
                }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {dayLogs.map((log, i) => {
                    const meta           = LOG_META[log.action] || LOG_META.toggle_active;
                    const { time, full } = formatLogDateTime(log.timestamp || log.createdAt);
                    const instructorName = log.instructor_name || "Unknown Instructor";

                    return (
                      <div key={log._id || i} style={{ position: "relative" }}>
                        <div style={{
                          position: "absolute", left: -27, top: 14,
                          width: 18, height: 18, borderRadius: "50%",
                          background: meta.bg, border: `2px solid ${meta.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: meta.color, flexShrink: 0,
                          boxShadow: "0 0 0 3px rgba(255,255,255,1)",
                        }} />

                        <div style={{
                          borderRadius: 14, background: "#fff",
                          border: `1px solid ${meta.border}`,
                          boxShadow: "0 2px 10px rgba(2,8,23,0.05)",
                          padding: "12px 14px", transition: "box-shadow .15s",
                        }} className="rs-log-card">

                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: 10,
                                background: meta.bg, border: `1px solid ${meta.border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: meta.color, flexShrink: 0,
                              }}>
                                {meta.icon}
                              </div>
                              <div>
                                <div style={{ fontWeight: 900, fontSize: 13, color: "rgba(11,18,32,0.88)" }}>
                                  {meta.label}
                                </div>
                                {log.course_title && (
                                  <div style={{ fontSize: 12, fontWeight: 700, color: meta.color, marginTop: 1 }}>
                                    {log.course_title}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{
                              fontSize: 11, fontWeight: 800, color: "rgba(11,18,32,0.42)",
                              whiteSpace: "nowrap", marginTop: 2,
                              display: "flex", alignItems: "center", gap: 4,
                            }}>
                              <Clock size={11} />
                              {time}
                            </div>
                          </div>

                          {(log.student_name || log.details) && (
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                              {log.student_name && (
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 5,
                                  fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.65)",
                                }}>
                                  <User size={12} style={{ color: "rgba(11,18,32,0.38)" }} />
                                  {log.student_name}
                                  {log.student_email && (
                                    <span style={{ fontWeight: 600, color: "rgba(11,18,32,0.42)" }}>
                                      · {log.student_email}
                                    </span>
                                  )}
                                </span>
                              )}
                              {log.details && (
                                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(11,18,32,0.52)", fontStyle: "italic" }}>
                                  {log.details}
                                </span>
                              )}
                            </div>
                          )}

                          <div style={{
                            paddingTop: 9,
                            borderTop: "1px solid rgba(2,8,23,0.06)",
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between", gap: 8,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{
                                width: 24, height: 24, borderRadius: "50%",
                                background: "linear-gradient(135deg,#091925,#054040)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--rs-teal)", fontSize: 10, fontWeight: 900,
                                flexShrink: 0, border: "1.5px solid rgba(0,180,180,0.30)",
                              }}>
                                {instructorName[0].toUpperCase()}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ fontSize: 12, fontWeight: 900, color: "rgba(11,18,32,0.75)" }}>
                                  {instructorName}
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(11,18,32,0.40)" }}>
                                  performed this action
                                </span>
                              </div>
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.35)",
                              display: "flex", alignItems: "center", gap: 3,
                              whiteSpace: "nowrap",
                            }}>
                              <Clock size={10} />
                              {full}
                            </span>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Order status config ────────────────────────────────────────── */
const ORDER_STATUS = {
  pending:   { color: "rgba(180,120,0,1)",  bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.30)", label: "⏳ Pending"   },
  paid:      { color: "rgba(0,140,140,1)",  bg: "rgba(0,180,180,0.10)", border: "rgba(0,180,180,0.25)", label: "✅ Paid"      },
  completed: { color: "rgba(22,163,74,1)",  bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)", label: "✅ Completed" },
  cancelled: { color: "rgba(185,28,28,1)",  bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)", label: "✗ Cancelled"  },
};

/* ─── OrderCard ──────────────────────────────────────────────────── */
const OrderCard = ({ order, onConfirm, onReject }) => {
  const student   = order.user_id || {};
  const isPending = order.status === "pending";
  const statusCfg = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
  const orderId   = String(order._id).slice(-6).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const total = Number(order.total_amount || 0).toFixed(2);

  return (
    <div style={{
      borderRadius: 18, background: "#fff", padding: 18,
      border:    isPending ? "1.5px solid rgba(245,158,11,0.38)" : "1px solid rgba(2,8,23,0.08)",
      boxShadow: isPending ? "0 4px 20px rgba(245,158,11,0.10)" : "0 2px 10px rgba(2,8,23,0.05)",
      transition: "box-shadow .15s",
    }}>
      {/* ── Header: student info + status badge ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--rs-teal)", fontWeight: 900, fontSize: 17, flexShrink: 0,
          }}>
            {(student.name || "S")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "rgba(11,18,32,0.88)" }}>
              {student.name || "—"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(11,18,32,0.50)", fontWeight: 600 }}>
              {student.email || "—"}
            </div>
            {student.nmls_id && (
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "rgba(11,18,32,0.40)", marginTop: 2 }}>
                NMLS #{student.nmls_id}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", padding: "4px 12px",
            borderRadius: 999, fontSize: 11, fontWeight: 900,
            color: statusCfg.color, background: statusCfg.bg,
            border: `1px solid ${statusCfg.border}`,
          }}>
            {statusCfg.label}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.42)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <Clock size={11} /> {orderDate}
          </span>
        </div>
      </div>

     {/* ── Order meta strip ── */}
      <div style={{
        display: "flex", gap: 10, alignItems: "center", marginBottom: 12,
        padding: "10px 14px", borderRadius: 12,
        background: "rgba(2,8,23,0.025)", border: "1px solid rgba(2,8,23,0.06)",
      }}>
        <Package size={14} style={{ color: "rgba(11,18,32,0.40)", flexShrink: 0 }} />
        <span style={{
          fontSize: 12, fontWeight: 900, color: "rgba(11,18,32,0.50)",
          fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.04em",
        }}>
          #{orderId}
        </span>
        <div style={{ width: 1, height: 14, background: "rgba(2,8,23,0.10)", flexShrink: 0 }} />
        <DollarSign size={14} style={{ color: "var(--rs-teal)", flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 950, color: "rgba(11,18,32,0.88)", letterSpacing: "-0.3px" }}>
          ${total}
        </span>
        {order.voucher_code && Number(order.voucher_discount) > 0 && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 800,
            color: "rgba(22,101,52,1)",
            background: "rgba(16,185,129,0.10)",
            border: "1px solid rgba(16,185,129,0.25)",
            padding: "3px 9px", borderRadius: 999,
          }}>
            🎟️ {order.voucher_code} &nbsp;-${Number(order.voucher_discount).toFixed(2)}
          </span>
        )}
        <span style={{
          marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.42)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <BookOpen size={12} />
          {(order.items || []).length} course{(order.items || []).length !== 1 ? "s" : ""}
        </span>
      </div>
      {/* ── Course items ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: isPending ? 14 : 0 }}>
        {(order.items || []).map((item, i) => {
          const course    = item.course_id || {};
          const type      = String(course.type || "").toUpperCase();
          const itemTotal = (Number(item.price || 0) + (item.include_textbook ? Number(item.textbook_price || 0) : 0)).toFixed(2);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 10,
              background: "#fff", border: "1px solid rgba(2,8,23,0.07)",
            }}>
              <BookOpen size={14} style={{ color: "var(--rs-teal)", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.80)" }}>
                {course.title || "Unknown Course"}
              </span>
              {type && <span style={typeBadge(type)}>{type}</span>}
              {course.credit_hours && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.40)" }}>
                  {course.credit_hours}h
                </span>
              )}
              {item.include_textbook && (
                <span style={{
                  fontSize: 11, fontWeight: 800, color: "rgba(180,120,0,1)",
                  background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)",
                  padding: "2px 8px", borderRadius: 999,
                }}>
                  + Textbook
                </span>
              )}
              <span style={{ fontSize: 13, fontWeight: 900, color: "rgba(11,18,32,0.70)", minWidth: 52, textAlign: "right" }}>
                ${itemTotal}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Action buttons (pending only) ── */}
      {isPending && (
        <div style={{
          display: "flex", gap: 10, paddingTop: 14,
          borderTop: "1px solid rgba(2,8,23,0.06)",
        }}>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#00B4B4,#2EABFE)",
              color: "#fff", fontSize: 13, fontWeight: 900,
              boxShadow: "0 4px 16px rgba(0,180,180,0.30)",
            }}
          >
            <CheckCircle size={15} />
            Confirm Payment
          </button>
          <button
            type="button"
            onClick={onReject}
            style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "11px 14px", borderRadius: 12, cursor: "pointer",
              border: "1px solid rgba(239,68,68,0.30)", background: "rgba(239,68,68,0.06)",
              color: "rgba(185,28,28,1)", fontSize: 13, fontWeight: 900,
            }}
          >
            <XCircle size={15} />
            Reject Order
          </button>
        </div>
      )}

      {/* ── Resolved state footer ── */}
      {!isPending && (
        <div style={{
          paddingTop: 10, marginTop: 12,
          borderTop: "1px solid rgba(2,8,23,0.06)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {order.status === "cancelled"
            ? <><XCircle size={13} style={{ color: "rgba(185,28,28,0.65)" }} /><span style={{ fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.42)" }}>Order was rejected.</span></>
            : <><CheckCircle size={13} style={{ color: "rgba(0,140,140,0.80)" }} /><span style={{ fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.42)" }}>Payment approved — courses unlocked for student.</span></>
          }
        </div>
      )}
    </div>
  );
};

/* ─── InstructorDashboard ────────────────────────────────────────── */
const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [data,                setData]                = useState(null);
  const [allStudents,         setAllStudents]         = useState([]);
  const [allCourses,          setAllCourses]          = useState([]);
  const [activeTab,           setActiveTab]           = useState("overview");
  const [loading,             setLoading]             = useState(true);
  const [studentsLoading,     setStudentsLoading]     = useState(false);
  const [coursesLoading,      setCoursesLoading]      = useState(false);
  const [error,               setError]               = useState("");
  const [q,                   setQ]                   = useState("");
  const [courseSearch,        setCourseSearch]        = useState("");
  const [showLogout,          setShowLogout]          = useState(false);
  const [expandedStudent,     setExpandedStudent]     = useState(null);
  const [testimonials,        setTestimonials]        = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialFilter,   setTestimonialFilter]   = useState("all");
  const [activityLogs,        setActivityLogs]        = useState([]);
  const [logsLoading,         setLogsLoading]         = useState(false);
  const [supportTickets,      setSupportTickets]      = useState([]);
  const [toggleTarget,        setToggleTarget]        = useState(null);
  const [toggleLoading,       setToggleLoading]       = useState(false);
  const [statusFilter,        setStatusFilter]        = useState("all");
  const [editingCourse,       setEditingCourse]       = useState(null);

  // ── Orders state ──────────────────────────────────────────────────
  const [orders,              setOrders]              = useState([]);
  const [ordersLoading,       setOrdersLoading]       = useState(false);
const [orderFilter, setOrderFilter] = useState("all");
  const [orderConfirmTarget,  setOrderConfirmTarget]  = useState(null); // { order, action }
  const [orderActioning,      setOrderActioning]      = useState(false);

  /* ── Initial load ─────────────────────────────────────────────── */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await API.get("/instructor/dashboard");
        setData(res.data);
        try {
          const ticketRes = await API.get("/support/admin/all?status=open&status=in_progress");
          setSupportTickets(ticketRes.data?.tickets || []);
        } catch {
          setSupportTickets([]);
        }
      } catch (err) {
        if (err.response?.status === 404) setData({});
        else setError("Failed to load instructor dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── Refresh support tickets every 30s ───────────────────────── */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const ticketRes = await API.get("/support/admin/all?status=open&status=in_progress");
        setSupportTickets(ticketRes.data?.tickets || []);
      } catch {
        setSupportTickets([]);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ── Students ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== "students") return;
    if (allStudents.length > 0) return;
    const fetchStudents = async () => {
      setStudentsLoading(true);
      try {
        const res = await API.get("/instructor/students");
        setAllStudents(res.data?.students || res.data || []);
      } catch {
        try {
          const res = await API.get("/instructor/dashboard");
          setAllStudents(res.data?.students || []);
        } catch {
          setAllStudents([]);
        }
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [activeTab]);

  /* ── Courses ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== "courses") return;
    if (allCourses.length > 0) return;
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const res = await API.get("/instructor/courses-stats");
        setAllCourses(res.data?.courses || []);
      } catch {
        setAllCourses(data?.courses || []);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, [activeTab, data]);

  /* ── Logs ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== "logs") return;
    fetchLogs();
  }, [activeTab]);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await API.get("/instructor/logs?limit=200");
      setActivityLogs(res.data?.logs || []);
    } catch {
      setActivityLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  /* ── Orders ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== "orders") return;
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
  setOrdersLoading(true);
  try {
    const res = await API.get("/instructor/orders");
    console.log("Orders response:", res.data); // ← ADD THIS
    setOrders(res.data?.orders || []);
  } catch (err) {
    console.error("Orders fetch error:", err.response?.data || err.message); // ← AND THIS
    setOrders([]);
  } finally {
    setOrdersLoading(false);
  }
};

  /* ── Handle order confirm/reject ──────────────────────────────── */
  const handleOrderAction = async () => {
    if (!orderConfirmTarget) return;
    const { order, action } = orderConfirmTarget;
    setOrderActioning(true);
    try {
      await API.patch(`/instructor/orders/${order._id}/status`, { status: action });
      // Update order in list
      setOrders(prev =>
        prev.map(o => String(o._id) === String(order._id) ? { ...o, status: action } : o)
      );
      // Optimistic activity log entry
      const newLog = {
        _id:             Date.now(),
        action:          "toggle_active",
        instructor_name: user?.name || "Instructor",
        student_name:    order.user_id?.name,
        student_email:   order.user_id?.email,
        details:         `${action === "paid" ? "Payment confirmed" : "Order rejected"} — Order #${String(order._id).slice(-6).toUpperCase()} ($${Number(order.total_amount || 0).toFixed(2)})`,
        timestamp:       new Date().toISOString(),
      };
      setActivityLogs(prev => [newLog, ...prev]);
      setOrderConfirmTarget(null);
    } catch (err) {
      console.error("Order action failed:", err);
    } finally {
      setOrderActioning(false);
    }
  };

  /* ── Testimonials ─────────────────────────────────────────────── */
  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const res  = await API.get("/testimonials/admin/all");
      const list = res.data?.testimonials ?? res.data ?? [];
      setTestimonials(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("[Reviews] error:", err.response?.data || err.message);
      setTestimonials([]);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "reviews") return;
    fetchTestimonials();
  }, [activeTab]);

  /* ── Testimonial actions ──────────────────────────────────────── */
  const handleTestimonialAction = async (id, action) => {
    try {
      if (action === "delete") {
        await API.delete(`/testimonials/admin/${id}`);
        setTestimonials(prev => prev.filter(t => t._id !== id));
      } else if (action === "featured") {
        const t = testimonials.find(t => t._id === id);
        await API.put(`/testimonials/admin/${id}`, { featured: !t?.featured });
        setTestimonials(prev => prev.map(t =>
          t._id === id ? { ...t, featured: !t.featured } : t
        ));
      } else {
        await API.put(`/testimonials/admin/${id}`, { status: action });
        setTestimonials(prev => prev.map(t =>
          t._id === id ? { ...t, status: action } : t
        ));
        setTestimonialFilter("all");
      }
    } catch (err) {
      console.error("Testimonial action failed:", err.response?.data || err.message);
    }
  };

  /* ── Toggle student active ────────────────────────────────────── */
  const handleToggleActive = async () => {
    if (!toggleTarget) return;
    setToggleLoading(true);
    try {
      const res       = await API.put(`/instructor/students/${toggleTarget._id}/toggle-active`);
      const newStatus = res.data.is_active;
      const update    = (list) => list.map(s =>
        String(s._id) === String(toggleTarget._id)
          ? { ...s, is_active: newStatus, deactivated_at: newStatus ? null : new Date().toISOString() }
          : s
      );
      setAllStudents(prev => update(prev));
      setData(prev => prev ? { ...prev, students: update(prev.students || []) } : prev);
      const newLog = {
        _id:             Date.now(),
        action:          "toggle_active",
        instructor_name: user?.name || "Instructor",
        student_name:    toggleTarget.name,
        student_email:   toggleTarget.email,
        details:         `Account ${newStatus ? "activated" : "deactivated"}`,
        timestamp:       new Date().toISOString(),
      };
      setActivityLogs(prev => [newLog, ...prev]);
      setToggleTarget(null);
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setToggleLoading(false);
    }
  };

  /* ── Course saved ─────────────────────────────────────────────── */
  const handleCourseSaved = (updated) => {
    setAllCourses(prev =>
      prev.map(c => String(c._id) === String(updated._id) ? { ...c, ...updated } : c)
    );
    setData(prev => prev ? {
      ...prev,
      courses: (prev.courses || []).map(c =>
        String(c._id) === String(updated._id) ? { ...c, ...updated } : c
      ),
    } : prev);
    const editLog = {
      _id:             Date.now(),
      action:          "edit_course",
      instructor_name: user?.name || "Instructor",
      course_title:    updated.title,
      details:         `Updated course details for "${updated.title}"`,
      timestamp:       new Date().toISOString(),
    };
    setActivityLogs(prev => [editLog, ...prev]);
  };

  const handleLogout = () => { logout(); window.location.href = "/"; };

  /* ── Derived values ───────────────────────────────────────────── */
  const dashCourses      = data?.courses          || [];
  const dashStudents     = data?.students         || [];
  const totalEnrollments = data?.total_enrollments ?? 0;
  const totalCompletions = data?.total_completions  ?? 0;
  const displayStudents  = allStudents.length > 0 ? allStudents : dashStudents;
  const displayCourses   = allCourses.length  > 0 ? allCourses  : dashCourses;
  const activeCourses    = (allCourses.length > 0 ? allCourses : dashCourses).filter(c => c.active !== false).length;

  const inactiveCount = useMemo(
    () => displayStudents.filter(s => s.is_active === false).length,
    [displayStudents]
  );

  const pendingOrderCount = useMemo(
    () => orders.filter(o => o.status === "pending").length,
    [orders]
  );

  // Also count pending from all orders even before the tab is opened
  const [globalPendingOrders, setGlobalPendingOrders] = useState(0);
  useEffect(() => {
    // Fetch pending order count on mount for badge display
    const fetchPendingCount = async () => {
      try {
        const res = await API.get("/instructor/orders?status=pending");
        setGlobalPendingOrders((res.data?.orders || []).length);
      } catch { /* silent */ }
    };
    fetchPendingCount();
  }, []);

  // Once orders tab is loaded, use live count
  const displayPendingCount = orders.length > 0 ? pendingOrderCount : globalPendingOrders;

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter(o => o.status === orderFilter);
  }, [orders, orderFilter]);

  const filteredStudents = useMemo(() => {
    let list = displayStudents;
    if (statusFilter === "active")   list = list.filter(s => s.is_active !== false);
    if (statusFilter === "inactive") list = list.filter(s => s.is_active === false);
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(s =>
      String(s.name         || "").toLowerCase().includes(needle) ||
      String(s.email        || "").toLowerCase().includes(needle) ||
      String(s.course_title || "").toLowerCase().includes(needle) ||
      String(s.nmls_id      || "").toLowerCase().includes(needle)
    );
  }, [displayStudents, q, statusFilter]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return displayCourses;
    const needle = courseSearch.toLowerCase();
    return displayCourses.filter(c =>
      String(c.title          || "").toLowerCase().includes(needle) ||
      String(c.type           || "").toLowerCase().includes(needle) ||
      String(c.nmls_course_id || "").toLowerCase().includes(needle)
    );
  }, [displayCourses, courseSearch]);

  const filteredTestimonials = testimonialFilter === "all"
    ? testimonials
    : testimonials.filter(t => t.status === testimonialFilter);

  const pendingCount      = testimonials.filter(t => t.status === "pending").length;
  const openTicketCount   = supportTickets.filter(t => t.status === "open").length;
  const inProgressCount   = supportTickets.filter(t => t.status === "in_progress").length;
  const urgentTicketCount = supportTickets.filter(t => t.priority === "urgent" && t.status !== "closed" && t.status !== "resolved").length;
  const totalOpenSupport  = openTicketCount + inProgressCount;
  const recentCourses     = useMemo(() => displayCourses.slice(0, 3), [displayCourses]);

  /* ── Loading / error ──────────────────────────────────────────── */
  if (loading) return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.center}>
        <div className="rs-spinner" />
        <div style={{ marginTop: 12, color: "rgba(11,18,32,0.65)" }}>Loading instructor dashboard…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.center}>
        <div className="rs-alert"><span className="rs-alert-dot" /><span>{error}</span></div>
      </div>
    </div>
  );

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div style={S.page}>
      <style>{css}</style>

      {showLogout && <LogoutConfirm onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      {toggleTarget && (
        <ConfirmToggleModal
          student={toggleTarget}
          loading={toggleLoading}
          onConfirm={handleToggleActive}
          onCancel={() => setToggleTarget(null)}
        />
      )}
      {orderConfirmTarget && (
        <ConfirmOrderModal
          order={orderConfirmTarget.order}
          action={orderConfirmTarget.action}
          loading={orderActioning}
          onConfirm={handleOrderAction}
          onCancel={() => setOrderConfirmTarget(null)}
        />
      )}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSaved={handleCourseSaved}
        />
      )}

      {/* ── Topbar ── */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.brandLeft}>
            <img src={logo} alt="Relstone" style={S.brandLogo} />
            <div>
              <div style={S.brandTitle}>NMLS Instructor Portal</div>
              <div style={S.brandSubtitle}>Manage courses and track student progress</div>
            </div>
          </div>
          <div style={S.topbarRight}>
            <div style={S.instructorPill}>
              <Star size={13} style={{ color: "var(--rs-teal)" }} />
              <span style={{ fontWeight: 900, fontSize: 12, color: "var(--rs-teal)" }}>Instructor</span>
            </div>
            <div style={S.userPill}>
              <div style={S.userAvatar}>{(user?.name || "I")[0].toUpperCase()}</div>
              <span style={S.userName}>{user?.name || "Instructor"}</span>
            </div>
            <button style={S.logoutBtn} onClick={() => setShowLogout(true)} type="button">Sign out</button>
          </div>
        </div>
      </header>

      <div style={S.shell}>

        {/* ── Hero ── */}
        <section style={S.hero}>
          <div style={S.heroBg} aria-hidden="true" />
          <div style={S.heroInner}>
            <div style={S.heroTop}>
              <div>
                <div style={S.heroKicker}>Instructor Overview</div>
                <div style={S.heroHeadline}>Welcome back, {user?.name?.split(" ")[0] || "Instructor"}! 👋</div>
                <div style={S.heroSub}>Here's a snapshot of your teaching activity.</div>
              </div>
              <div style={S.heroActions}>
                <button style={S.heroBtn} type="button" onClick={() => setActiveTab("courses")}>
                  <BookOpen size={16} /><span>All Courses</span><ChevronRight size={16} />
                </button>
                <button style={{ ...S.heroBtn, ...S.heroBtnAlt }} type="button" onClick={() => setActiveTab("students")}>
                  <Users size={16} /><span>All Students</span><ChevronRight size={16} />
                </button>
                {displayPendingCount > 0 && (
                  <button style={{ ...S.heroBtn, background: "rgba(245,158,11,0.22)", borderColor: "rgba(245,158,11,0.45)" }} type="button" onClick={() => setActiveTab("orders")}>
                    <DollarSign size={16} /><span>{displayPendingCount} Pending Payment{displayPendingCount !== 1 ? "s" : ""}</span><ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
            <div style={S.kpiGrid}>
              <KpiCard icon={<PlayCircle size={20} />}   title="Active Courses"    value={activeCourses}                              caption="Published"   tone="teal"  />
              <KpiCard icon={<Users size={20} />}         title="Total Students"    value={displayStudents.length || totalEnrollments} caption="Enrolled"    tone="blue"  />
              <KpiCard icon={<CheckCircle size={20} />}   title="Completions"       value={totalCompletions}                           caption="All time"    tone="green" />
              <KpiCard icon={<DollarSign size={20} />}    title="Pending Payments"  value={displayPendingCount}                        caption="Awaiting approval" tone="amber" onClick={() => setActiveTab("orders")} />
            </div>
          </div>
        </section>

        {/* ── Tab card ── */}
        <section style={S.card}>
          <div style={S.tabRow}>
            <div style={S.tabs}>
              <TabButton label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
              <TabButton label={`Courses (${displayCourses.length})`} active={activeTab === "courses"} onClick={() => setActiveTab("courses")} />
              <TabButton
                label={inactiveCount > 0
                  ? `Students (${displayStudents.length}) · ${inactiveCount} inactive`
                  : `Students (${displayStudents.length})`}
                active={activeTab === "students"}
                onClick={() => setActiveTab("students")}
                highlight={inactiveCount > 0}
              />
              <TabButton
                label={pendingCount > 0 ? `Reviews (${pendingCount} pending)` : "Reviews"}
                active={activeTab === "reviews"}
                onClick={() => setActiveTab("reviews")}
                highlight={pendingCount > 0}
              />
              <TabButton
                label={activityLogs.length > 0 ? `Activity Logs (${activityLogs.length})` : "Activity Logs"}
                active={activeTab === "logs"}
                onClick={() => setActiveTab("logs")}
              />
              {/* ── Orders tab ── */}
              <TabButton
                label={displayPendingCount > 0 ? `Orders (${displayPendingCount} pending)` : "Orders"}
                active={activeTab === "orders"}
                onClick={() => setActiveTab("orders")}
                icon={<DollarSign size={14} />}
                badge={displayPendingCount}
                highlight={displayPendingCount > 0}
              />
              <TabButton
                label="Support Inbox"
                active={false}
                onClick={() => navigate("/instructor/support")}
                icon={<MessageSquare size={15} />}
                badge={totalOpenSupport}
                highlight={totalOpenSupport > 0 || urgentTicketCount > 0}
                urgent={urgentTicketCount > 0}
              />
            </div>

            {/* Per-tab toolbar */}
            {activeTab === "students" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { key: "all",      label: "All" },
                    { key: "active",   label: "Active" },
                    { key: "inactive", label: "Inactive", highlight: inactiveCount > 0 },
                  ].map(f => (
                    <button key={f.key} type="button"
                      style={{
                        ...S.filterChip,
                        ...(statusFilter === f.key ? S.filterChipActive : {}),
                        ...(f.highlight && statusFilter !== f.key ? { borderColor: "rgba(239,68,68,0.35)", color: "rgba(185,28,28,1)" } : {}),
                      }}
                      onClick={() => setStatusFilter(f.key)}>
                      {f.label}
                      {f.key === "inactive" && inactiveCount > 0 && (
                        <span style={{ ...S.pendingDot, background: "rgba(239,68,68,0.85)" }}>{inactiveCount}</span>
                      )}
                    </button>
                  ))}
                </div>
                <div style={S.searchWrap}>
                  <Search size={15} style={{ color: "rgba(9,25,37,0.45)" }} />
                  <input style={S.searchInput} value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, email, course, NMLS ID…" />
                </div>
              </div>
            )}
            {activeTab === "courses" && (
              <div style={S.searchWrap}>
                <Search size={15} style={{ color: "rgba(9,25,37,0.45)" }} />
                <input style={S.searchInput} value={courseSearch} onChange={e => setCourseSearch(e.target.value)} placeholder="Search courses…" />
              </div>
            )}
            {activeTab === "reviews" && (
              <div style={{ display: "flex", gap: 8 }}>
                {["pending", "approved", "rejected", "all"].map(f => (
                  <button key={f} type="button"
                    style={{ ...S.filterChip, ...(testimonialFilter === f ? S.filterChipActive : {}) }}
                    onClick={() => setTestimonialFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === "pending" && pendingCount > 0 && (
                      <span style={S.pendingDot}>{pendingCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {/* Orders filter chips */}
            {activeTab === "orders" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { key: "pending",   label: "Pending" },
                  { key: "paid",      label: "Paid" },
                  { key: "completed", label: "Completed" },
                  { key: "cancelled", label: "Cancelled" },
                  { key: "all",       label: "All" },
                ].map(f => (
                  <button key={f.key} type="button"
                    style={{
                      ...S.filterChip,
                      ...(orderFilter === f.key ? S.filterChipActive : {}),
                      ...(f.key === "pending" && pendingOrderCount > 0 && orderFilter !== "pending"
                        ? { borderColor: "rgba(245,158,11,0.45)", color: "rgba(146,84,0,1)" }
                        : {}),
                    }}
                    onClick={() => setOrderFilter(f.key)}>
                    {f.label}
                    {f.key === "pending" && pendingOrderCount > 0 && (
                      <span style={S.pendingDot}>{pendingOrderCount}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={S.cardBody}>

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div style={S.gridTwo}>
                <div style={S.panel}>
                  <div style={S.panelHead}>
                    <div style={S.panelTitle}>Recent Courses</div>
                    <button style={S.ghostBtn} type="button" onClick={() => setActiveTab("courses")}>
                      View all <ChevronRight size={15} />
                    </button>
                  </div>
                  {recentCourses.length === 0 ? (
                    <EmptyState icon={<BookOpen size={18} />} title="No courses yet" subtitle="Courses will appear here." actionLabel="Refresh" onAction={() => window.location.reload()} />
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {recentCourses.map((c, i) => (
                        <CourseMiniRow key={i} course={c} onEdit={() => setEditingCourse(c)} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={S.panel}>
                  <div style={S.panelHead}><div style={S.panelTitle}>Quick Actions</div></div>
                  <div style={S.quickActions}>
                    <ActionCard icon={<BookOpen size={17} />}     title="All Courses"       sub={`${displayCourses.length} courses available`}  onClick={() => setActiveTab("courses")} />
                    <ActionCard icon={<Users size={17} />}         title="All Students"      sub={`${displayStudents.length} students enrolled`}  onClick={() => setActiveTab("students")} />
                    <ActionCard icon={<UserX size={17} />}         title="Inactive Students" sub={`${inactiveCount} student${inactiveCount !== 1 ? "s" : ""} deactivated`} onClick={() => { setActiveTab("students"); setStatusFilter("inactive"); }} />
                    <ActionCard icon={<DollarSign size={17} />}    title="Payment Orders"    sub={displayPendingCount > 0 ? `${displayPendingCount} pending approval` : "Review student payments"} onClick={() => setActiveTab("orders")} highlight={displayPendingCount > 0} />
                    <ActionCard icon={<Activity size={17} />}      title="Activity Logs"     sub="View all course edits and assignments" onClick={() => setActiveTab("logs")} />
                    <ActionCard icon={<Plus size={17} />}          title="Add New Course"    sub="Create a new NMLS course" onClick={() => navigate("/instructor/courses/add")} />
                    <ActionCard icon={<MessageSquare size={17} />} title="Support Inbox"     sub={totalOpenSupport > 0 ? `${totalOpenSupport} open ticket${totalOpenSupport !== 1 ? "s" : ""} waiting` : "View and respond to student tickets"} onClick={() => navigate("/instructor/support")} />
                  <ActionCard icon={<HelpCircle size={17} />} title="Contact Admin" sub="Submit tickets for website concerns or admin help" onClick={() => navigate("/instructor/contact-admin")} />

                  </div>
                </div>
              </div>
            )}

            {/* ── COURSES ── */}
            {activeTab === "courses" && (
              <div>
                <div style={S.sectionHead}>
                  <div>
                    <div style={S.sectionTitle}>All Courses</div>
                    <div style={S.sectionSub}>
                      {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
                      {courseSearch.trim() ? " matching search" : " in the platform"}
                      &nbsp;·&nbsp;{activeCourses} active
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg,#00B4B4,#2EABFE)",
                        cursor: "pointer", fontSize: 12, fontWeight: 900, color: "#fff",
                        boxShadow: "0 4px 14px rgba(0,180,180,0.28)",
                      }}
                      type="button"
                      onClick={() => navigate("/instructor/courses/add")}
                    >
                      <Plus size={13} /> Add Course
                    </button>
                    <button style={S.refreshBtn} type="button" onClick={() => { setAllCourses([]); setCourseSearch(""); }}>
                      <RefreshCw size={13} /> Refresh
                    </button>
                  </div>
                </div>
                {coursesLoading ? (
                  <div style={S.center}><div className="rs-spinner" /></div>
                ) : filteredCourses.length === 0 ? (
                  <EmptyState icon={<BookOpen size={18} />} title="No courses found" subtitle="Try a different search term." actionLabel="Clear search" onAction={() => setCourseSearch("")} />
                ) : (
                  <div style={S.courseGrid}>
                    {filteredCourses.map((c, i) => (
                      <CourseCard key={c._id || i} course={c} onEdit={() => setEditingCourse(c)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STUDENTS ── */}
            {activeTab === "students" && (
              <div>
                <div style={S.sectionHead}>
                  <div>
                    <div style={S.sectionTitle}>All Students</div>
                    <div style={S.sectionSub}>
                      {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
                      {q.trim() ? " matching search" : statusFilter !== "all" ? ` · ${statusFilter}` : " enrolled across all courses"}
                      {inactiveCount > 0 && <> · <span style={{ color: "rgba(185,28,28,0.85)", fontWeight: 800 }}>{inactiveCount} inactive</span></>}
                    </div>
                  </div>
                  <button style={S.refreshBtn} type="button" onClick={() => { setAllStudents([]); setQ(""); }}>
                    <RefreshCw size={13} /> Refresh
                  </button>
                </div>
                {studentsLoading ? (
                  <div style={{ ...S.center, minHeight: 200 }}><div className="rs-spinner" /></div>
                ) : filteredStudents.length === 0 ? (
                  <EmptyState
                    icon={<Users size={18} />}
                    title={q.trim() ? "No students found" : statusFilter === "inactive" ? "No inactive students" : "No students yet"}
                    subtitle={q.trim() ? "Try a different search term." : statusFilter === "inactive" ? "All students are currently active." : "Students enrolled in courses will appear here."}
                    actionLabel={q.trim() || statusFilter !== "all" ? "Clear filters" : "Refresh"}
                    onAction={() => { setQ(""); setStatusFilter("all"); if (!q.trim() && statusFilter === "all") setAllStudents([]); }}
                  />
                ) : (
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>Student</th>
                          <th style={S.th}>NMLS ID</th>
                          <th style={S.th}>Course</th>
                          <th style={S.th}>Status</th>
                          <th style={S.thRight}>Progress</th>
                          <th style={S.th}>Enrolled</th>
                          <th style={S.th}>Account</th>
                          <th style={S.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((s, i) => (
                          <StudentRow
                            key={s._id || s.email || i}
                            student={s}
                            expanded={expandedStudent === (s._id || s.email)}
                            onToggle={() => setExpandedStudent(
                              expandedStudent === (s._id || s.email) ? null : (s._id || s.email)
                            )}
                            onToggleActive={() => setToggleTarget(s)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── REVIEWS ── */}
            {activeTab === "reviews" && (
              <div>
                <div style={S.sectionHead}>
                  <div>
                    <div style={S.sectionTitle}>Student Reviews</div>
                    <div style={S.sectionSub}>
                      {filteredTestimonials.length} review{filteredTestimonials.length !== 1 ? "s" : ""}
                      {testimonialFilter !== "all" ? ` · ${testimonialFilter}` : ""}
                      {" "}· {testimonials.filter(t => t.featured).length} featured
                    </div>
                  </div>
                  <button style={S.refreshBtn} type="button" onClick={fetchTestimonials}>
                    <RefreshCw size={13} /> Refresh
                  </button>
                </div>
                {testimonialsLoading ? (
                  <div style={{ ...S.center, minHeight: 200 }}><div className="rs-spinner" /></div>
                ) : filteredTestimonials.length === 0 ? (
                  <EmptyState
                    icon={<MessageSquare size={18} />}
                    title={testimonialFilter === "pending" ? "No pending reviews" : "No reviews found"}
                    subtitle={testimonialFilter === "pending" ? "All reviews have been actioned." : "Try a different filter."}
                    actionLabel="Show all"
                    onAction={() => setTestimonialFilter("all")}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {filteredTestimonials.map(t => (
                      <TestimonialCard
                        key={t._id}
                        testimonial={t}
                        onApprove={() => handleTestimonialAction(t._id, "approved")}
                        onReject={()  => handleTestimonialAction(t._id, "rejected")}
                        onDelete={()  => handleTestimonialAction(t._id, "delete")}
                        onFeature={()  => handleTestimonialAction(t._id, "featured")}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ACTIVITY LOGS ── */}
            {activeTab === "logs" && (
              <ActivityLogPanel
                logs={activityLogs}
                loading={logsLoading}
                onRefresh={() => { setActivityLogs([]); fetchLogs(); }}
              />
            )}

            {/* ── ORDERS ── */}
            {activeTab === "orders" && (
              <div>
                <div style={S.sectionHead}>
                  <div>
                    <div style={S.sectionTitle}>Payment Orders</div>
                    <div style={S.sectionSub}>
                      {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
                      {orderFilter !== "all" ? ` · ${orderFilter}` : " · all statuses"}
                      {pendingOrderCount > 0 && orderFilter !== "pending" && (
                        <> · <span style={{ color: "rgba(180,120,0,1)", fontWeight: 800 }}>{pendingOrderCount} awaiting approval</span></>
                      )}
                    </div>
                  </div>
                  <button style={S.refreshBtn} type="button" onClick={() => { setOrders([]); fetchOrders(); }}>
                    <RefreshCw size={13} /> Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div style={{ ...S.center, minHeight: 200 }}><div className="rs-spinner" /></div>
                ) : filteredOrders.length === 0 ? (
                  <EmptyState
                    icon={<CreditCard size={18} />}
                    title={orderFilter === "pending" ? "No pending orders" : "No orders found"}
                    subtitle={orderFilter === "pending" ? "All payments have been reviewed." : "Try a different filter."}
                    actionLabel="Show all orders"
                    onAction={() => setOrderFilter("all")}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filteredOrders.map(order => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        onConfirm={() => setOrderConfirmTarget({ order, action: "paid" })}
                        onReject={()  => setOrderConfirmTarget({ order, action: "cancelled" })}
                      />
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

/* ─── Sub-components ──────────────────────────────────────────────── */

const TabButton = ({ label, active, onClick, highlight, badge, icon, urgent }) => (
  <button type="button" onClick={onClick} style={{
    ...S.tabBtn,
    ...(active                  ? S.tabBtnActive    : {}),
    ...(highlight && !active    ? S.tabBtnHighlight : {}),
    ...(urgent                  ? S.tabBtnUrgent    : {}),
    position: "relative",
  }}>
    {icon && <span style={{ display: "flex", alignItems: "center", marginRight: 4 }}>{icon}</span>}
    <span>{label}</span>
    {badge !== undefined && badge > 0 && (
      <span style={S.badgeNotification}>{badge > 9 ? "9+" : badge}</span>
    )}
  </button>
);

const KpiCard = ({ icon, title, value, caption, tone, onClick }) => {
  const toneMap = {
    teal:  { bg: "rgba(0,180,180,0.10)",  border: "rgba(0,180,180,0.22)"  },
    blue:  { bg: "rgba(46,171,254,0.10)", border: "rgba(46,171,254,0.25)" },
    green: { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.22)"  },
    amber: { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)" },
  };
  const t = toneMap[tone] || toneMap.teal;
  return (
    <div
      onClick={onClick}
      style={{ ...S.kpiCard, background: t.bg, borderColor: t.border, cursor: onClick ? "pointer" : "default" }}
    >
      <div style={S.kpiIcon}>{icon}</div>
      <div style={S.kpiText}>
        <div style={S.kpiTitle}>{title}</div>
        <div style={S.kpiValue}>{value}</div>
        <div style={S.kpiCaption}>{caption}</div>
      </div>
    </div>
  );
};

const CourseMiniRow = ({ course, onEdit }) => {
  const navigate  = useNavigate();
  const type      = String(course?.type || "").toUpperCase();
  const enrolled  = course?.enrollment_count ?? course?.enrolled  ?? 0;
  const completed = course?.completion_count  ?? course?.completed ?? 0;
  const active    = course?.active ?? true;
  return (
    <div style={{ ...S.rowCard, cursor: "pointer" }}>
      <div style={{ display: "grid", gap: 6, flex: 1 }} onClick={() => navigate(`/instructor/course/${course._id}`)}>
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
            {enrolled > 0 ? `${Math.round((completed / enrolled) * 100)}% pass` : "No data"}
          </span>
        </div>
      </div>
      <button type="button" onClick={e => { e.stopPropagation(); onEdit(); }} title="Edit course" style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        border: "1px solid rgba(0,180,180,0.28)", background: "rgba(0,180,180,0.07)",
        cursor: "pointer", color: "#00B4B4",
      }}>
        <Pencil size={14} />
      </button>
      <ChevronRight size={17} style={{ color: "rgba(9,25,37,0.35)", cursor: "pointer", flexShrink: 0 }}
        onClick={() => navigate(`/instructor/course/${course._id}`)} />
    </div>
  );
};

const CourseCard = ({ course, onEdit }) => {
  const navigate  = useNavigate();
  const type      = String(course?.type || "").toUpperCase();
  const creditHrs = course?.credit_hours ?? 0;
  const enrolled  = course?.enrollment_count ?? course?.enrolled  ?? 0;
  const completed = course?.completion_count  ?? course?.completed ?? 0;
  const active    = course?.active ?? true;
  const passRate  = enrolled > 0 ? `${Math.round((completed / enrolled) * 100)}%` : "—";
  return (
    <div style={{ ...S.courseCard, cursor: "pointer" }} className="rs-course-card"
      onClick={() => navigate(`/instructor/course/${course._id}`)}>
      <div style={S.courseCardTop}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={typeBadge(type)}>{type || "—"}</span>
          <span style={activeBadge(active)}>{active ? "Active" : "Inactive"}</span>
        </div>
        <button type="button" title="Edit course" onClick={e => { e.stopPropagation(); onEdit(); }} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8,
          border: "1px solid rgba(0,180,180,0.28)", background: "rgba(0,180,180,0.07)",
          cursor: "pointer", color: "#00B4B4", fontSize: 12, fontWeight: 800,
        }}>
          <Pencil size={13} /> Edit
        </button>
      </div>
      <div style={S.courseCardTitle}>{course?.title || "Course"}</div>
      <div style={S.courseCardMeta}>
        <span style={S.metaItem}><Clock size={13} /> {creditHrs} credit hrs</span>
        {course?.nmls_course_id && <span style={S.metaItem}><FileText size={13} /> #{course.nmls_course_id}</span>}
      </div>
      <div style={S.courseCardDivider} />
      <div style={S.courseStatsRow}>
        <CourseStat icon={<Users size={14} />}       label="Enrolled"  value={enrolled}  color="var(--rs-blue)" />
        <CourseStat icon={<CheckCircle size={14} />} label="Completed" value={completed} color="rgba(0,180,180,1)" />
        <CourseStat icon={<BarChart2 size={14} />}   label="Pass Rate" value={passRate}  color="rgba(34,197,94,1)" />
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

const StudentRow = ({ student, expanded, onToggle, onToggleActive }) => {
  const navigate      = useNavigate();
  const status        = String(student?.status || "enrolled").toLowerCase();
  const progress      = student?.progress ?? 0;
  const isActive      = student?.is_active !== false;
  const enrolled      = student?.enrolled_at
    ? new Date(student.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";
  const deactivatedAt = student?.deactivated_at
    ? new Date(student.deactivated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const lastLogin     = student?.last_login_at
    ? new Date(student.last_login_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  const courses       = student?.courses || (student?.course_title ? [{ title: student.course_title, status, progress }] : []);

  return (
    <>
      <tr className="rs-tr" style={{ opacity: isActive ? 1 : 0.65 }}>
        <td style={S.td}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => navigate(`/instructor/students/${student._id}`)} title="View student details">
            <div style={{ ...S.studentAvatar, ...(isActive ? {} : { background: "rgba(2,8,23,0.08)", border: "1px solid rgba(2,8,23,0.12)", color: "rgba(11,18,32,0.45)" }) }}>
              {(student?.name || "S")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "rgba(11,18,32,0.88)", fontSize: 13, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>
                {student?.name || "Student"}
              </div>
              <div style={{ fontSize: 11, color: "rgba(11,18,32,0.50)", fontWeight: 600 }}>{student?.email || "—"}</div>
            </div>
          </div>
        </td>
        <td style={S.td}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.65)" }}>
            {student?.nmls_id || "—"}
          </span>
        </td>
        <td style={S.td}>
          <span style={{ fontWeight: 700, color: "rgba(11,18,32,0.75)", fontSize: 13 }}>
            {student?.course_title || (courses.length > 0 ? `${courses.length} course${courses.length > 1 ? "s" : ""}` : "—")}
          </span>
        </td>
        <td style={S.td}><span style={studentStatusStyle(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
        <td style={S.tdRight}>
          <div style={S.progressWrap}>
            <div style={S.progressBar}><div style={{ ...S.progressFill, width: `${Math.min(progress, 100)}%` }} /></div>
            <span style={S.progressLabel}>{progress}%</span>
          </div>
        </td>
        <td style={S.td}>{enrolled}</td>
        <td style={S.td}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900,
              border: "1px solid transparent", width: "fit-content",
              color:       isActive ? "rgba(22,163,74,1)"    : "rgba(185,28,28,1)",
              background:  isActive ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.08)",
              borderColor: isActive ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)",
            }}>
              {isActive ? <UserCheck size={11} /> : <UserX size={11} />}
              {isActive ? "Active" : "Inactive"}
            </span>
            {!isActive && deactivatedAt && <span style={{ fontSize: 10, color: "rgba(11,18,32,0.42)", fontWeight: 600 }}>Since {deactivatedAt}</span>}
            {isActive  && lastLogin     && <span style={{ fontSize: 10, color: "rgba(11,18,32,0.42)", fontWeight: 600 }}>Last login: {lastLogin}</span>}
          </div>
        </td>
        <td style={S.td}>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={S.viewBtn} type="button" onClick={onToggle}>
              <Eye size={13} /> {expanded ? "Hide" : "Details"}
            </button>
            <button type="button" onClick={onToggleActive} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 800,
              border:     isActive ? "1px solid rgba(239,68,68,0.30)" : "1px solid rgba(0,180,180,0.30)",
              background: isActive ? "rgba(239,68,68,0.06)"           : "rgba(0,180,180,0.08)",
              color:      isActive ? "rgba(185,28,28,1)"              : "var(--rs-teal)",
            }} title={isActive ? "Deactivate student" : "Activate student"}>
              {isActive ? <><UserX size={13} /> Deactivate</> : <><UserCheck size={13} /> Activate</>}
            </button>
          </div>
        </td>
      </tr>
      {expanded && courses.length > 1 && (
        <tr>
          <td colSpan={8} style={{ padding: "0 14px 12px 60px", background: "rgba(0,180,180,0.03)" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(9,25,37,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              All Enrolled Courses
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {courses.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, background: "#fff", border: "0.5px solid rgba(2,8,23,0.08)" }}>
                  <GraduationCap size={14} style={{ color: "var(--rs-teal)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.80)" }}>{c.title}</span>
                  <span style={studentStatusStyle(String(c.status || "enrolled").toLowerCase())}>{String(c.status || "enrolled")}</span>
                  <div style={{ ...S.progressBar, width: 60 }}>
                    <div style={{ ...S.progressFill, width: `${Math.min(c.progress || 0, 100)}%` }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(11,18,32,0.55)", minWidth: 30 }}>{c.progress || 0}%</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const ActionCard = ({ icon, title, sub, onClick, highlight }) => (
  <button style={{
    ...S.actionCard,
    ...(highlight ? { borderColor: "rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.04)" } : {}),
  }} type="button" onClick={onClick}>
    <div style={{
      ...S.actionIcon,
      ...(highlight ? { background: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.28)" } : {}),
    }}>{icon}</div>
    <div style={S.actionText}>
      <div style={S.actionTitle}>{title}</div>
      <div style={{ ...S.actionSub, ...(highlight ? { color: "rgba(146,84,0,0.90)", fontWeight: 800 } : {}) }}>{sub}</div>
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

const StarRating = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="14" height="14" viewBox="0 0 24 24"
        fill={i <= rating ? "#F59E0B" : "none"}
        stroke={i <= rating ? "#F59E0B" : "rgba(11,18,32,0.25)"}
        strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </div>
);

const TestimonialCard = ({ testimonial: t, onApprove, onReject, onDelete, onFeature }) => {
  const isPending  = t.status === "pending";
  const isApproved = t.status === "approved";
  const isRejected = t.status === "rejected";
  const statusStyle = isApproved
    ? { color: "rgba(0,140,140,1)",  background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)" }
    : isRejected
    ? { color: "rgba(185,28,28,1)",  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" }
    : { color: "rgba(180,120,0,1)",  background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)" };

  return (
    <div style={{
      borderRadius: 18, background: "#fff", padding: 18,
      border:    isPending ? "1.5px solid rgba(245,158,11,0.35)" : "1px solid rgba(2,8,23,0.08)",
      boxShadow: isPending ? "0 4px 20px rgba(245,158,11,0.10)" : "0 2px 10px rgba(2,8,23,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--rs-teal)", fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
            {(t.name || "S")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "rgba(11,18,32,0.88)" }}>{t.name || "—"}</div>
            <div style={{ fontSize: 12, color: "rgba(11,18,32,0.50)", fontWeight: 600 }}>{t.email || "—"}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {t.featured && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "#F59E0B", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.30)" }}>
              ★ Featured
            </span>
          )}
          <span style={{ ...statusStyle, display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900, textTransform: "capitalize" }}>
            {t.status}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.65)", background: "rgba(2,8,23,0.04)", border: "1px solid rgba(2,8,23,0.08)", padding: "3px 10px", borderRadius: 8 }}>
          {t.course_title || "—"}
        </span>
        <StarRating rating={t.rating || 0} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.50)" }}>
          {t.would_recommend ? "✓ Would recommend" : "✗ Would not recommend"}
        </span>
        {t.createdAt && (
          <span style={{ fontSize: 11, color: "rgba(11,18,32,0.38)", fontWeight: 600, marginLeft: "auto" }}>
            {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(11,18,32,0.78)", lineHeight: 1.65, padding: "12px 14px", borderRadius: 12, background: "rgba(2,8,23,0.025)", border: "1px solid rgba(2,8,23,0.06)", marginBottom: 14 }}>
        "{t.comment}"
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!isApproved && <button type="button" onClick={onApprove} style={S.approveBtn}><ThumbsUp size={13} /> Approve</button>}
        {!isRejected && <button type="button" onClick={onReject}  style={S.rejectBtn}><ThumbsDown size={13} /> Reject</button>}
        <button type="button" onClick={onFeature} style={{ ...S.featureBtn, ...(t.featured ? S.featureBtnActive : {}) }}>
          <Star size={13} /> {t.featured ? "Unfeature" : "Feature"}
        </button>
        <button type="button" onClick={onDelete} style={S.deleteBtn}><Trash2 size={13} /> Delete</button>
      </div>
    </div>
  );
};

/* ─── Style helpers ───────────────────────────────────────────────── */
const typeBadge = (type) => {
  const isPE = type === "PE", isCE = type === "CE";
  const base = { display: "inline-flex", alignItems: "center", padding: "4px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900, border: "1px solid transparent" };
  if (isPE) return { ...base, color: "var(--rs-blue)", background: "rgba(46,171,254,0.12)", borderColor: "rgba(46,171,254,0.22)" };
  if (isCE) return { ...base, color: "rgba(0,140,140,1)", background: "rgba(0,180,180,0.12)", borderColor: "rgba(0,180,180,0.20)" };
  return { ...base, color: "rgba(9,25,37,0.65)", background: "rgba(2,8,23,0.06)", borderColor: "rgba(2,8,23,0.10)" };
};

const activeBadge = (active) => ({
  display: "inline-flex", alignItems: "center", padding: "4px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900,
  color:      active ? "rgba(22,163,74,1)"    : "rgba(120,120,120,1)",
  background: active ? "rgba(34,197,94,0.10)" : "rgba(0,0,0,0.04)",
  border:     `1px solid ${active ? "rgba(34,197,94,0.22)" : "rgba(0,0,0,0.08)"}`,
});

const studentStatusStyle = (status) => {
  const base = { display: "inline-flex", alignItems: "center", padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900, border: "1px solid transparent", textTransform: "capitalize" };
  if (status === "completed") return { ...base, color: "rgba(0,140,140,1)", background: "rgba(0,180,180,0.12)", borderColor: "rgba(0,180,180,0.20)" };
  if (status === "enrolled")  return { ...base, color: "var(--rs-blue)",    background: "rgba(46,171,254,0.12)", borderColor: "rgba(46,171,254,0.22)" };
  return { ...base, color: "rgba(180,120,0,1)", background: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.22)" };
};

/* ─── CSS ─────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
:root {
  --rs-dark:#091925; --rs-blue:#2EABFE; --rs-teal:#00B4B4;
  --rs-grad:linear-gradient(110deg,#091925 0%,#0a2a2a 45%,#00B4B4 100%);
  --rs-bg:#f6f7fb; --rs-text:rgba(11,18,32,0.92);
  --rs-muted:rgba(11,18,32,0.58); --rs-border:rgba(2,8,23,0.10);
  --rs-shadow:0 18px 48px rgba(2,8,23,0.10); --rs-ring:rgba(0,180,180,0.22);
}
*{box-sizing:border-box;}
body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;background:var(--rs-bg);color:var(--rs-text);}
.rs-link{color:var(--rs-teal);text-decoration:none;font-weight:800;}
.rs-link:hover{text-decoration:underline;}
.rs-spinner{width:36px;height:36px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:var(--rs-teal);animation:spin 1s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.rs-alert{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:14px;border:1px solid rgba(0,180,180,0.25);background:rgba(0,180,180,0.08);color:var(--rs-dark);font-size:13px;}
.rs-alert-dot{width:10px;height:10px;border-radius:999px;background:var(--rs-teal);margin-top:4px;}
.rs-tr:hover{background:rgba(0,180,180,0.04);}
.rs-course-card{transition:box-shadow .2s,transform .2s;}
.rs-course-card:hover{box-shadow:0 12px 36px rgba(2,8,23,0.12);transform:translateY(-2px);}
.rs-log-card:hover{box-shadow:0 4px 18px rgba(2,8,23,0.09);}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
.rs-badge-pulse{animation:pulse 1.5s ease-in-out infinite;}
`;

/* ─── Styles ──────────────────────────────────────────────────────── */
const S = {
  page:            { minHeight: "100vh", background: "var(--rs-bg)" },
  center:          { minHeight: "60vh", display: "grid", placeItems: "center" },
  topbar:          { position: "sticky", top: 0, zIndex: 20, background: "rgba(246,247,251,0.90)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(2,8,23,0.08)" },
  topbarInner:     { maxWidth: 1200, margin: "0 auto", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  brandLeft:       { display: "flex", alignItems: "center", gap: 12 },
  brandLogo:       { height: 32, objectFit: "contain" },
  brandTitle:      { fontWeight: 900, letterSpacing: "-0.2px", fontSize: 15 },
  brandSubtitle:   { fontSize: 11, color: "var(--rs-muted)", marginTop: 2, fontWeight: 700 },
  topbarRight:     { display: "flex", alignItems: "center", gap: 10 },
  instructorPill:  { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(0,180,180,0.28)", background: "rgba(0,180,180,0.08)" },
  userPill:        { display: "inline-flex", alignItems: "center", gap: 9, padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", boxShadow: "0 4px 14px rgba(2,8,23,0.06)" },
  userAvatar:      { width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#091925,#054040)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--rs-teal)", fontWeight: 900, fontSize: 12 },
  userName:        { fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.80)" },
  logoutBtn:       { padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 13, color: "rgba(11,18,32,0.72)" },
  shell:           { maxWidth: 1200, margin: "0 auto", padding: "18px 18px 40px" },
  hero:            { position: "relative", borderRadius: 24, overflow: "hidden", background: "var(--rs-grad)", boxShadow: "0 22px 60px rgba(2,8,23,0.18)" },
  heroBg:          { position: "absolute", inset: 0, background: "radial-gradient(900px 500px at 18% 28%,rgba(0,180,180,0.22),transparent 60%)", pointerEvents: "none" },
  heroInner:       { position: "relative", padding: 22 },
  heroTop:         { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingBottom: 16 },
  heroKicker:      { color: "rgba(255,255,255,0.72)", fontWeight: 800, fontSize: 11, letterSpacing: "0.6px" },
  heroHeadline:    { color: "#fff", fontWeight: 950, fontSize: 20, letterSpacing: "-0.3px", marginTop: 5 },
  heroSub:         { color: "rgba(255,255,255,0.65)", fontWeight: 700, fontSize: 13, marginTop: 4 },
  heroActions:     { display: "flex", gap: 10, flexWrap: "wrap" },
  heroBtn:         { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(9,25,37,0.32)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 13, boxShadow: "0 8px 22px rgba(2,8,23,0.18)" },
  heroBtnAlt:      { background: "rgba(0,180,180,0.22)", borderColor: "rgba(0,180,180,0.35)" },
  kpiGrid:         { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, paddingTop: 4 },
  kpiCard:         { display: "flex", alignItems: "center", gap: 13, padding: 14, borderRadius: 18, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.10)" },
  kpiIcon:         { width: 44, height: 44, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.14)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0 },
  kpiText:         { display: "grid", gap: 2 },
  kpiTitle:        { color: "rgba(255,255,255,0.72)", fontWeight: 800, fontSize: 11 },
  kpiValue:        { color: "#fff", fontWeight: 950, fontSize: 26, letterSpacing: "-0.5px" },
  kpiCaption:      { color: "rgba(255,255,255,0.62)", fontWeight: 700, fontSize: 11 },
  card:            { marginTop: 14, borderRadius: 22, background: "rgba(255,255,255,0.82)", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "var(--rs-shadow)", backdropFilter: "blur(10px)", overflow: "hidden" },
  tabRow:          { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 14px 10px", borderBottom: "1px solid rgba(2,8,23,0.06)" },
  tabs:            { display: "flex", gap: 8, flexWrap: "wrap" },
  tabBtn:          { padding: "9px 14px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 13, color: "rgba(11,18,32,0.65)", display: "inline-flex", alignItems: "center", gap: 6 },
  tabBtnActive:    { borderColor: "rgba(0,180,180,0.35)", boxShadow: "0 0 0 4px var(--rs-ring)", color: "var(--rs-dark)" },
  tabBtnHighlight: { borderColor: "rgba(245,158,11,0.45)", color: "rgba(146,84,0,1)", background: "rgba(245,158,11,0.06)" },
  tabBtnUrgent:    { borderColor: "rgba(239,68,68,0.45)", color: "rgba(185,28,28,1)", background: "rgba(239,68,68,0.06)" },
  badgeNotification:{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, borderRadius: 999, background: "rgba(239,68,68,0.90)", color: "#fff", fontSize: 10, fontWeight: 900, padding: "0 4px", marginLeft: 4, boxShadow: "0 2px 8px rgba(239,68,68,0.30)" },
  searchWrap:      { display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", minWidth: 280 },
  searchInput:     { border: "none", outline: "none", width: "100%", fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.80)", background: "transparent" },
  cardBody:        { padding: 14 },
  gridTwo:         { display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: 12 },
  panel:           { borderRadius: 18, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", padding: 14 },
  panelHead:       { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  panelTitle:      { fontWeight: 950, color: "rgba(11,18,32,0.82)", fontSize: 14 },
  ghostBtn:        { border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)", borderRadius: 999, padding: "7px 10px", cursor: "pointer", fontWeight: 900, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(11,18,32,0.65)" },
  rowCard:         { borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.02)", padding: 12, display: "flex", alignItems: "center", gap: 10 },
  rowTop:          { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  rowTitle:        { fontWeight: 900, color: "rgba(11,18,32,0.86)", fontSize: 13 },
  rowMeta:         { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 4 },
  metaItem:        { display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(11,18,32,0.55)", fontWeight: 800, fontSize: 12 },
  quickActions:    { display: "grid", gap: 9 },
  actionCard:      { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: 11, borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.02)", cursor: "pointer", textAlign: "left" },
  actionIcon:      { width: 38, height: 38, borderRadius: 14, background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.20)", display: "grid", placeItems: "center", color: "var(--rs-dark)", flexShrink: 0 },
  actionText:      { flex: 1, display: "grid", gap: 2 },
  actionTitle:     { fontWeight: 950, color: "rgba(11,18,32,0.84)", fontSize: 13 },
  actionSub:       { fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.50)" },
  sectionHead:     { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 14, flexWrap: "wrap" },
  sectionTitle:    { fontWeight: 950, fontSize: 16, color: "rgba(11,18,32,0.86)" },
  sectionSub:      { marginTop: 4, fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.52)" },
  refreshBtn:      { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.65)" },
  courseGrid:      { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 },
  courseCard:      { borderRadius: 18, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 4px 18px rgba(2,8,23,0.06)", padding: 16 },
  courseCardTop:   { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 },
  courseCardTitle: { fontWeight: 950, fontSize: 15, color: "rgba(11,18,32,0.88)", marginBottom: 6 },
  courseCardMeta:  { display: "flex", gap: 14, flexWrap: "wrap" },
  courseCardDivider:{ borderTop: "1px solid rgba(2,8,23,0.07)", margin: "14px 0" },
  courseStatsRow:  { display: "flex", gap: 8 },
  courseStat:      { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 8px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.02)" },
  courseStatIcon:  { display: "flex" },
  courseStatValue: { fontWeight: 900, fontSize: 18, letterSpacing: "-0.3px" },
  courseStatLabel: { fontSize: 10, fontWeight: 800, color: "rgba(11,18,32,0.50)" },
  tableWrap:       { overflowX: "auto", borderRadius: 16, border: "1px solid rgba(2,8,23,0.08)", background: "#fff" },
  table:           { width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1000 },
  th:              { textAlign: "left", fontSize: 11, fontWeight: 950, color: "rgba(11,18,32,0.55)", padding: "12px 14px", borderBottom: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.02)" },
  thRight:         { textAlign: "right", fontSize: 11, fontWeight: 950, color: "rgba(11,18,32,0.55)", padding: "12px 14px", borderBottom: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.02)" },
  td:              { padding: "13px 14px", borderBottom: "1px solid rgba(2,8,23,0.055)", fontSize: 13 },
  tdRight:         { padding: "13px 14px", borderBottom: "1px solid rgba(2,8,23,0.055)", fontSize: 13, textAlign: "right" },
  studentAvatar:   { width: 32, height: 32, borderRadius: "50%", background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--rs-teal)", fontWeight: 900, fontSize: 13, flexShrink: 0 },
  progressWrap:    { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  progressBar:     { width: 80, height: 6, borderRadius: 99, background: "rgba(2,8,23,0.08)", overflow: "hidden" },
  progressFill:    { height: "100%", borderRadius: 99, background: "var(--rs-teal)", transition: "width .3s ease" },
  progressLabel:   { fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.60)", minWidth: 32, textAlign: "right" },
  viewBtn:         { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.65)" },
  emptyWrap:       { borderRadius: 18, border: "1px dashed rgba(2,8,23,0.15)", background: "rgba(2,8,23,0.02)", padding: 22, textAlign: "center" },
  emptyIcon:       { width: 46, height: 46, borderRadius: 16, background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)", display: "grid", placeItems: "center", color: "var(--rs-dark)", margin: "0 auto" },
  emptyTitle:      { marginTop: 12, fontWeight: 950, color: "rgba(11,18,32,0.84)", fontSize: 14 },
  emptySub:        { marginTop: 6, color: "rgba(11,18,32,0.52)", fontWeight: 700, fontSize: 12, lineHeight: 1.6 },
  primaryBtnSmall: { marginTop: 14, display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", color: "rgba(11,18,32,0.82)", cursor: "pointer", fontWeight: 900, fontSize: 13 },
  filterChip:      { padding: "7px 13px", borderRadius: 999, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 12, color: "rgba(11,18,32,0.62)", display: "inline-flex", alignItems: "center", gap: 6 },
  filterChipActive:{ borderColor: "rgba(0,180,180,0.38)", color: "var(--rs-dark)", boxShadow: "0 0 0 3px rgba(0,180,180,0.14)" },
  pendingDot:      { minWidth: 18, height: 18, borderRadius: 999, background: "rgba(245,158,11,0.90)", color: "#fff", fontSize: 10, fontWeight: 900, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" },
  approveBtn:      { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: "rgba(0,180,180,0.90)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 12 },
  rejectBtn:       { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.30)", background: "rgba(239,68,68,0.06)", color: "rgba(185,28,28,1)", cursor: "pointer", fontWeight: 900, fontSize: 12 },
  featureBtn:      { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.06)", color: "rgba(146,84,0,1)", cursor: "pointer", fontWeight: 900, fontSize: 12 },
  featureBtnActive:{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.55)" },
  deleteBtn:       { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.03)", color: "rgba(11,18,32,0.55)", cursor: "pointer", fontWeight: 900, fontSize: 12, marginLeft: "auto" },
};

export default InstructorDashboard;