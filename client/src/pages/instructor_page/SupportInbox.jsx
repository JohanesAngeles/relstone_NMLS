import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  ArrowLeft, MessageSquare, Clock, CheckCircle,
  AlertCircle, Search, RefreshCw, Send, ChevronRight,
  Filter, User, X,
} from "lucide-react";

const CATEGORIES = [
  { key: "technical",   label: "Technical",   color: "#EF4444" },
  { key: "billing",     label: "Billing",     color: "#F59E0B" },
  { key: "course",      label: "Course",      color: "#2EABFE" },
  { key: "certificate", label: "Certificate", color: "#008000" },
  { key: "account",     label: "Account",     color: "#9569F7" },
  { key: "other",       label: "Other",       color: "#5B7384" },
];

const STATUS_OPTIONS  = ["all","open","in_progress","resolved","closed"];
const PRIORITY_OPTIONS = ["all","urgent","high","normal","low"];

/* ─── SupportInbox ───────────────────────────────────────────────── */
const SupportInbox = () => {
  const navigate = useNavigate();

  const [tickets,      setTickets]      = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [replyText,    setReplyText]    = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search,       setSearch]       = useState("");
  const [updating,     setUpdating]     = useState(false);
  const [error,        setError]        = useState("");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter   !== "all") params.status   = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      const res = await API.get("/support/admin/all", { params });
      setTickets(res.data?.tickets || []);
    } catch {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, [statusFilter, priorityFilter]);

  const openTicket = async (ticket) => {
    setSelected(ticket);
    setReplyText("");
    try {
      const res = await API.get(`/support/${ticket._id}`);
      setSelected(res.data?.ticket || ticket);
    } catch { /* use cached */ }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setReplyLoading(true);
    try {
      const res = await API.post(`/support/${selected._id}/reply`, { message: replyText });
      const updated = res.data?.ticket;
      setSelected(updated);
      setReplyText("");
      setTickets(prev => prev.map(t => t._id === selected._id ? updated : t));
    } catch { setError("Failed to send reply."); }
    finally { setReplyLoading(false); }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await API.put(`/support/${selected._id}/status`, { status: newStatus });
      const updated = res.data?.ticket;
      setSelected(updated);
      setTickets(prev => prev.map(t => t._id === selected._id ? updated : t));
    } catch { setError("Failed to update status."); }
    finally { setUpdating(false); }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await API.put(`/support/${selected._id}/status`, { priority: newPriority });
      const updated = res.data?.ticket;
      setSelected(updated);
      setTickets(prev => prev.map(t => t._id === selected._id ? updated : t));
    } catch { setError("Failed to update priority."); }
    finally { setUpdating(false); }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return tickets;
    const needle = search.toLowerCase();
    return tickets.filter(t =>
      String(t.subject    || "").toLowerCase().includes(needle) ||
      String(t.user_name  || "").toLowerCase().includes(needle) ||
      String(t.user_email || "").toLowerCase().includes(needle) ||
      String(t.message    || "").toLowerCase().includes(needle)
    );
  }, [tickets, search]);

  const openCount     = tickets.filter(t => t.status === "open").length;
  const urgentCount   = tickets.filter(t => t.priority === "urgent" && t.status !== "closed" && t.status !== "resolved").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Back bar ─────────────────────────────────────────────── */}
      <div style={S.backBar}>
        <div style={S.backBarInner}>
          <button style={S.backBtn} onClick={() => navigate("/instructor/dashboard")} type="button">
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <div style={S.breadcrumb}>
            <span style={{ color: "rgba(11,18,32,0.45)" }}>Instructor</span>
            <span style={{ margin: "0 6px", color: "rgba(11,18,32,0.30)" }}>›</span>
            <span style={{ color: "rgba(11,18,32,0.80)", fontWeight: 800 }}>Support Inbox</span>
          </div>
        </div>
      </div>

      <div style={S.shell}>

        {/* ── Header ───────────────────────────────────────────── */}
        <div style={S.pageHeader}>
          <div style={S.headerIconWrap}><MessageSquare size={24} style={{ color: "#2EABFE" }} /></div>
          <div>
            <div style={S.pageTitle}>Support Inbox</div>
            <div style={S.pageSub}>Manage and respond to student support tickets</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            {openCount > 0 && (
              <div style={S.statPill}>
                <Clock size={12} /> {openCount} open
              </div>
            )}
            {urgentCount > 0 && (
              <div style={{ ...S.statPill, color: "rgba(185,28,28,1)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" }}>
                <AlertCircle size={12} /> {urgentCount} urgent
              </div>
            )}
            <div style={{ ...S.statPill, color: "rgba(0,100,0,1)", background: "rgba(0,128,0,0.08)", border: "1px solid rgba(0,128,0,0.20)" }}>
              <CheckCircle size={12} /> {resolvedCount} resolved
            </div>
          </div>
        </div>

        {error && (
          <div style={S.errorBanner}><AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}</div>
        )}

        <div style={S.layout}>

          {/* ── Left panel: ticket list ────────────────────────── */}
          <div style={S.listPanel}>

            {/* Filters */}
            <div style={S.filterBar}>
              <div style={S.searchWrap}>
                <Search size={13} style={{ color: "rgba(11,18,32,0.40)", flexShrink: 0 }} />
                <input style={S.searchInput} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <select style={S.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s === "all" ? "All Status" : s.replace("_"," ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
                <select style={S.select} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p} value={p}>{p === "all" ? "All Priority" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <button style={S.refreshBtn} onClick={loadTickets} type="button">
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* Ticket list */}
            {loading ? (
              <div style={S.center}><div className="si-spinner" /></div>
            ) : filtered.length === 0 ? (
              <div style={S.emptyList}>
                <MessageSquare size={24} style={{ color: "#5B7384", marginBottom: 10 }} />
                <div style={{ fontWeight: 800, color: "rgba(11,18,32,0.70)", fontSize: 14 }}>No tickets found</div>
                <div style={{ fontSize: 12, color: "rgba(11,18,32,0.45)", marginTop: 4 }}>Try adjusting your filters</div>
              </div>
            ) : (
              <div style={S.ticketList}>
                {filtered.map(t => {
                  const cat      = CATEGORIES.find(c => c.key === t.category) || CATEGORIES[5];
                  const isSelected = selected?._id === t._id;
                  return (
                    <div key={t._id}
                      onClick={() => openTicket(t)}
                      style={{ ...S.ticketItem, ...(isSelected ? S.ticketItemActive : {}) }}
                      className="si-ticket-item"
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ ...S.catDot, background: cat.color }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={S.ticketSubject}>{t.subject}</div>
                          <div style={{ fontSize: 11, color: "rgba(11,18,32,0.50)", fontWeight: 600, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {t.user_name} · {t.user_email}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                            <StatusPill   status={t.status}     small />
                            <PriorityPill priority={t.priority} small />
                          </div>
                          <div style={{ fontSize: 10, color: "rgba(11,18,32,0.40)", marginTop: 5, fontWeight: 600 }}>
                            {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {(t.replies||[]).length > 0 && ` · ${(t.replies||[]).length} repl${(t.replies||[]).length !== 1 ? "ies" : "y"}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right panel: ticket detail ─────────────────────── */}
          <div style={S.detailPanel}>
            {!selected ? (
              <div style={S.noSelect}>
                <MessageSquare size={32} style={{ color: "rgba(11,18,32,0.25)", marginBottom: 14 }} />
                <div style={{ fontWeight: 800, color: "rgba(11,18,32,0.50)", fontSize: 15 }}>Select a ticket</div>
                <div style={{ fontSize: 13, color: "rgba(11,18,32,0.35)", marginTop: 6 }}>Click any ticket on the left to view and respond</div>
              </div>
            ) : (
              <div style={S.detailContent}>

                {/* Ticket header */}
                <div style={S.detailHeader}>
                  <div style={{ flex: 1 }}>
                    <div style={S.detailSubject}>{selected.subject}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <div style={S.studentChip}>
                        <User size={11} /> {selected.user_name}
                        <span style={{ opacity: 0.6 }}>· {selected.user_email}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(11,18,32,0.45)" }}>
                        {new Date(selected.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <button style={S.closeDetailBtn} onClick={() => setSelected(null)} type="button">
                    <X size={16} />
                  </button>
                </div>

                {/* Controls */}
                <div style={S.controls}>
                  <div style={S.controlGroup}>
                    <div style={S.controlLabel}>Status</div>
                    <select
                      style={S.controlSelect}
                      value={selected.status}
                      onChange={e => handleStatusChange(e.target.value)}
                      disabled={updating}
                    >
                      {["open","in_progress","resolved","closed"].map(s => (
                        <option key={s} value={s}>{s.replace("_"," ").replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                  <div style={S.controlGroup}>
                    <div style={S.controlLabel}>Priority</div>
                    <select
                      style={S.controlSelect}
                      value={selected.priority}
                      onChange={e => handlePriorityChange(e.target.value)}
                      disabled={updating}
                    >
                      {["low","normal","high","urgent"].map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div style={S.controlGroup}>
                    <div style={S.controlLabel}>Category</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: CATEGORIES.find(c => c.key === selected.category)?.color || "#5B7384" }}>
                      {CATEGORIES.find(c => c.key === selected.category)?.label || "Other"}
                    </div>
                  </div>
                </div>

                {/* Thread */}
                <div style={S.thread}>
                  {/* Original message */}
                  <div style={S.msgBlock}>
                    <div style={S.msgAvatarWrap}>
                      <div style={S.msgAvatar}>{(selected.user_name || "S")[0].toUpperCase()}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={S.msgMeta}>
                        <span style={S.msgName}>{selected.user_name}</span>
                        <span style={S.msgRoleBadge}>Student</span>
                        <span style={S.msgTime}>{new Date(selected.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div style={S.msgBody}>{selected.message}</div>
                    </div>
                  </div>

                  {/* Replies */}
                  {(selected.replies || []).map((r, i) => {
                    const isSupport = r.sender_role === "instructor" || r.sender_role === "admin";
                    return (
                      <div key={i} style={{ ...S.msgBlock, ...(isSupport ? S.msgBlockSupport : {}) }}>
                        <div style={S.msgAvatarWrap}>
                          <div style={{ ...S.msgAvatar, ...(isSupport ? S.msgAvatarSupport : {}) }}>
                            {isSupport ? "S" : (r.sender_name || "U")[0].toUpperCase()}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={S.msgMeta}>
                            <span style={S.msgName}>{r.sender_name}</span>
                            <span style={{ ...S.msgRoleBadge, ...(isSupport ? S.msgRoleBadgeSupport : {}) }}>
                              {isSupport ? "Support" : "Student"}
                            </span>
                            <span style={S.msgTime}>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <div style={S.msgBody}>{r.message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply box */}
                {selected.status !== "closed" ? (
                  <div style={S.replyBox}>
                    <textarea
                      style={S.replyTextarea}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply to the student…"
                      rows={4}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <div style={{ fontSize: 12, color: "rgba(11,18,32,0.45)" }}>
                        Replying as Support · Reply will be visible to student
                      </div>
                      <button
                        style={{ ...S.replyBtn, ...(!replyText.trim() || replyLoading ? { opacity: 0.55, cursor: "not-allowed" } : {}) }}
                        onClick={handleReply}
                        disabled={!replyText.trim() || replyLoading}
                        type="button"
                      >
                        {replyLoading ? "Sending…" : <><Send size={14} /> Send Reply</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={S.closedNote}>
                    Ticket is closed. Reopen by changing status above.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Pills ──────────────────────────────────────────────────────── */
const StatusPill = ({ status, small }) => {
  const map = {
    open:        { color: "#2EABFE",  bg: "rgba(46,171,254,0.10)",  label: "Open"        },
    in_progress: { color: "#F59E0B",  bg: "rgba(245,158,11,0.10)",  label: "In Progress" },
    resolved:    { color: "#008000",  bg: "rgba(0,128,0,0.10)",     label: "Resolved"    },
    closed:      { color: "#5B7384",  bg: "rgba(91,115,132,0.10)",  label: "Closed"      },
  };
  const s = map[status] || map.open;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: small ? "2px 7px" : "3px 9px", borderRadius: 999, fontSize: small ? 9 : 10, fontWeight: 900, color: s.color, background: s.bg, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  );
};

const PriorityPill = ({ priority, small }) => {
  const map = {
    low:    "#5B7384",
    normal: "#2EABFE",
    high:   "#F59E0B",
    urgent: "#EF4444",
  };
  const color = map[priority] || "#2EABFE";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: small ? "2px 7px" : "3px 8px", borderRadius: 999, fontSize: small ? 9 : 10, fontWeight: 800, color, background: `${color}12`, border: `1px solid ${color}30` }}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;}
body{margin:0;font-family:Inter,system-ui,sans-serif;}
.si-spinner{width:32px;height:32px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:sispin 1s linear infinite;}
@keyframes sispin{to{transform:rotate(360deg);}}
.si-ticket-item{cursor:pointer;transition:background .12s;}
.si-ticket-item:hover{background:rgba(46,171,254,0.04);}
textarea{resize:vertical;}
select{appearance:auto;}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:    { minHeight: "100vh", background: "#F0F4F8", fontFamily: "Inter, sans-serif" },
  center:  { minHeight: 200, display: "grid", placeItems: "center" },
  backBar: { background: "rgba(246,247,251,0.95)", borderBottom: "1px solid rgba(2,8,23,0.08)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 20 },
  backBarInner: { maxWidth: 1200, margin: "0 auto", padding: "12px 18px", display: "flex", alignItems: "center", gap: 16 },
  backBtn:      { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(2,8,23,0.12)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.72)" },
  breadcrumb:   { fontSize: 12, fontWeight: 700 },

  shell:      { maxWidth: 1200, margin: "0 auto", padding: "20px 18px 40px" },
  pageHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" },
  headerIconWrap: { width: 48, height: 48, borderRadius: 14, background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.22)", display: "grid", placeItems: "center", flexShrink: 0 },
  pageTitle:  { fontSize: 20, fontWeight: 950, color: "rgba(11,18,32,0.92)", letterSpacing: "-0.3px" },
  pageSub:    { fontSize: 12, fontWeight: 600, color: "rgba(11,18,32,0.50)", marginTop: 3 },
  statPill:   { display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.28)", color: "rgba(146,84,0,1)", fontSize: 12, fontWeight: 800 },
  errorBanner:{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", color: "rgba(185,28,28,1)", fontSize: 13, fontWeight: 700, marginBottom: 14 },

  layout:      { display: "grid", gridTemplateColumns: "360px 1fr", gap: 14, height: "calc(100vh - 180px)", minHeight: 500 },
  listPanel:   { borderRadius: 18, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 4px 18px rgba(2,8,23,0.07)", display: "flex", flexDirection: "column", overflow: "hidden" },
  detailPanel: { borderRadius: 18, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 4px 18px rgba(2,8,23,0.07)", overflow: "hidden" },

  filterBar:   { padding: "14px", borderBottom: "1px solid rgba(2,8,23,0.07)", display: "flex", flexDirection: "column", gap: 8 },
  searchWrap:  { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)" },
  searchInput: { flex: 1, border: "none", outline: "none", fontSize: 12, fontWeight: 600, color: "rgba(11,18,32,0.80)", background: "transparent" },
  select:      { padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(2,8,23,0.12)", background: "#fff", fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.70)", cursor: "pointer", flex: 1 },
  refreshBtn:  { width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", cursor: "pointer", display: "grid", placeItems: "center", color: "rgba(11,18,32,0.55)" },

  ticketList:  { flex: 1, overflowY: "auto", padding: "6px 0" },
  ticketItem:  { padding: "14px 16px", borderBottom: "1px solid rgba(2,8,23,0.05)" },
  ticketItemActive: { background: "rgba(46,171,254,0.06)", borderLeft: "3px solid #2EABFE" },
  catDot:      { width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4 },
  ticketSubject: { fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.88)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  emptyList:   { flex: 1, display: "grid", placeItems: "center", textAlign: "center", padding: 24 },

  noSelect:    { height: "100%", display: "grid", placeItems: "center", textAlign: "center", padding: 24 },
  detailContent:{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" },
  detailHeader: { padding: "18px 20px", borderBottom: "1px solid rgba(2,8,23,0.07)", display: "flex", alignItems: "flex-start", gap: 12, flexShrink: 0 },
  detailSubject:{ fontSize: 16, fontWeight: 950, color: "rgba(11,18,32,0.90)", letterSpacing: "-0.2px" },
  studentChip: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: "rgba(2,8,23,0.05)", border: "1px solid rgba(2,8,23,0.10)", fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.65)" },
  closeDetailBtn: { width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)", cursor: "pointer", display: "grid", placeItems: "center", color: "rgba(11,18,32,0.55)", flexShrink: 0 },

  controls:    { display: "flex", gap: 24, padding: "12px 20px", borderBottom: "1px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.01)", flexShrink: 0 },
  controlGroup:{ display: "flex", flexDirection: "column", gap: 4 },
  controlLabel:{ fontSize: 10, fontWeight: 900, color: "rgba(11,18,32,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" },
  controlSelect:{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(2,8,23,0.12)", background: "#fff", fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.80)", cursor: "pointer" },

  thread:      { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 },

  msgBlock:        { display: "flex", gap: 12, padding: "14px", borderRadius: 14, border: "1px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.015)" },
  msgBlockSupport: { background: "rgba(46,171,254,0.04)", border: "1px solid rgba(46,171,254,0.15)" },
  msgAvatarWrap:   { flexShrink: 0 },
  msgAvatar:       { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#091925,#054040)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00B4B4", fontWeight: 900, fontSize: 14 },
  msgAvatarSupport:{ background: "rgba(46,171,254,0.15)", color: "#2EABFE" },
  msgMeta:         { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" },
  msgName:         { fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.88)" },
  msgRoleBadge:    { display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 999, fontSize: 10, fontWeight: 900, color: "rgba(11,18,32,0.55)", background: "rgba(2,8,23,0.06)", border: "1px solid rgba(2,8,23,0.10)" },
  msgRoleBadgeSupport: { color: "#2EABFE", background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.22)" },
  msgTime:         { fontSize: 11, color: "rgba(11,18,32,0.40)", fontWeight: 600 },
  msgBody:         { fontSize: 13, fontWeight: 500, color: "rgba(11,18,32,0.78)", lineHeight: 1.65 },

  replyBox:      { padding: "14px 20px", borderTop: "1px solid rgba(2,8,23,0.07)", flexShrink: 0 },
  replyTextarea: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(2,8,23,0.14)", background: "#fff", fontSize: 13, fontWeight: 500, color: "rgba(11,18,32,0.85)", outline: "none", lineHeight: 1.6 },
  replyBtn:      { display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "none", background: "#091925", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 13 },

  closedNote: { padding: "12px 20px", borderTop: "1px solid rgba(2,8,23,0.07)", fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.50)", textAlign: "center" },
};

export default SupportInbox;