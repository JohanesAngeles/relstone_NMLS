import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import Layout from "../../components/Layout";
import {
  Bell,
  CheckCircle2,
  BookOpen,
  Award,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  Trophy,
  FileText,
  Clock3,
  Tag,
} from "lucide-react";

const NOTIFICATION_TYPES = [
  { key: "all", label: "All", icon: <Bell size={14} /> },
  { key: "milestones", label: "Milestones", icon: <BadgeCheck size={14} /> },
  { key: "quiz", label: "Quiz Results", icon: <Sparkles size={14} /> },
  { key: "ce", label: "CE Renewals", icon: <CheckCircle2 size={14} /> },
  { key: "new", label: "New Courses", icon: <BookOpen size={14} /> },
  { key: "promotions", label: "Promotions", icon: <Award size={14} /> },
  { key: "system", label: "System", icon: <Bell size={14} /> },
];

const NotificationsCenter = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    markAsUnread,
    triggerNotification,
    triggerEvent,
  } = useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.heading}>Notifications</div>
            <div style={styles.subheading}>
              You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            style={styles.markAllBtn}
            onClick={markAllAsRead}
            type="button"
          >
            Mark all as read
          </button>
        </div>

        {/* QA / dev: exercises POST /notifications/trigger and /trigger/:event (email follows user prefs on server) */}
        <div style={styles.qaSection} aria-label="Email notification tests">
          <div style={styles.qaLabel}>Test emails (staging / QA)</div>
          <div style={styles.qaButtons}>
            <button
              style={styles.triggerBtn}
              type="button"
              onClick={() =>
                triggerNotification({
                  type: 'milestones',
                  title: 'Milestone notification',
                  body: 'You reached 75% progress!',
                  sendEmail: true,
                })
              }
            >
              Trigger milestone test
            </button>
            <button style={styles.triggerBtn} type="button" onClick={() => triggerEvent('welcome')}>
              Trigger welcome event
            </button>
            <button style={styles.triggerBtn} type="button" onClick={() => triggerEvent('renewal')}>
              Trigger renewal event
            </button>
          </div>
        </div>

        <div style={styles.tabs}>
          {NOTIFICATION_TYPES.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              style={{
                ...styles.tab,
                ...(activeFilter === tab.key ? styles.tabActive : {}),
              }}
            >
              <span style={{ marginRight: 6 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.list}>
          {filteredItems.length === 0 && (
            <div style={styles.empty}>No notifications found.</div>
          )}

          {filteredItems.map((item) => {
            const id = item._id || item.id;
            return (
              <div
                key={id}
                style={{
                  ...styles.note,
                  ...(item.read ? styles.noteRead : {}),
                }}
              >
                <div style={styles.noteMeta}>
                  <div style={styles.noteTitleRow}>
                    <div style={styles.badge}>
                      {item.type === "milestones" && <Trophy size={13} />}
                      {item.type === "quiz" && <FileText size={13} />}
                      {item.type === "ce" && <Clock3 size={13} />}
                      {item.type === "new" && <BookOpen size={13} />}
                      {item.type === "promotions" && <Tag size={13} />}
                      {item.type === "system" && <Bell size={13} />}
                    </div>
                    <div>
                      <div style={styles.noteTitle}>{item.title}</div>
                      <div style={styles.noteBody}>{item.body}</div>
                    </div>
                  </div>
                  <div style={styles.noteTime}>{item.time || "Just now"}</div>
                </div>
                <div style={styles.noteActions}>
                  {item.read ? (
                    <button
                      style={styles.linkBtn}
                      onClick={() => markAsUnread(id)}
                      type="button"
                    >
                      Mark as unread
                    </button>
                  ) : (
                    <button
                      style={styles.linkBtn}
                      onClick={() => markAsRead(id)}
                      type="button"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={styles.quick}
          onClick={() => navigate("/profile")}
          onKeyDown={() => {}}
          role="button"
          tabIndex={0}
        >
          <ChevronRight size={14} />
          Back to Profile settings
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  page: { maxWidth: 980, margin: "24px auto", padding: "0 14px" },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  heading: {
    fontSize: 34,
    fontWeight: 900,
    marginTop: 2,
    color: "#0f172a",
    letterSpacing: "-0.3px",
  },
  subheading: { fontSize: 14, marginTop: 4, color: "#475569", fontWeight: 600 },
  qaSection: {
    marginBottom: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px dashed #93c5fd",
    background: "#f8fafc",
  },
  qaLabel: { fontSize: 12, fontWeight: 800, color: "#475569", marginBottom: 8, letterSpacing: "0.02em" },
  qaButtons: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  markAllBtn: {
    background: "white",
    border: "1px solid #dbeafe",
    borderRadius: 10,
    fontWeight: 700,
    color: "#1d4ed8",
    padding: "10px 13px",
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(37,99,235,0.15)",
  },
  triggerBtn: { border: "1px solid #dbeafe", borderRadius: 10, background: "#fff", color: "#1d4ed8", fontWeight: 700, cursor: "pointer", padding: "8px 12px" },
  tabs: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  tab: {
    border: "1px solid #d1d5db",
    borderRadius: 999,
    background: "#fff",
    color: "#334155",
    fontWeight: 700,
    fontSize: 13,
    padding: "8px 14px",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    minHeight: 34,
    transition: "all 0.15s ease",
  },
  tabActive: {
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(17,24,39,0.2)",
  },
  list: { display: "grid", gap: 10 },
  empty: {
    border: "1px dashed #cbd5e1",
    borderRadius: 12,
    background: "#f8fafc",
    padding: 20,
    color: "#475569",
    textAlign: "center",
  },
  note: {
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: "12px 14px",
    background: "#fff",
    display: "grid",
    gap: 8,
  },
  noteRead: { opacity: 0.74, background: "#f9fafb" },
  noteMeta: { display: "flex", justifyContent: "space-between", gap: 10 },
  noteTitleRow: { display: "flex", gap: 10, flex: 1 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid #c7d9ff",
    background: "#eaf2ff",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 0 0 1px #eef4ff inset",
    fontSize: 15,
    color: "#0f172a",
    marginRight: 10,
  },
  noteTitle: { fontWeight: 800, color: "#0b1120" },
  noteBody: { color: "#475569", fontSize: 14, marginTop: 4, lineHeight: 1.35 },
  noteTime: {
    color: "#94a3b8",
    fontSize: 12,
    minWidth: 88,
    textAlign: "right",
  },
  noteActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  linkBtn: {
    border: "none",
    background: "none",
    color: "#2563eb",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
  },
  quick: {
    color: "#1d4ed8",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
};

export default NotificationsCenter;
