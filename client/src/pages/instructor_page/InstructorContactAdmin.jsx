import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import {
  ArrowLeft, X, Send, ChevronRight, ChevronDown,
  MessageSquare, Clock, CheckCircle, AlertCircle,
  Plus, HelpCircle, Search, RefreshCw,
} from "lucide-react";

const CATEGORIES = [
  { key: "technical",   label: "Technical Issue",   color: "#EF4444" },
  { key: "billing",     label: "Billing & Payment", color: "#F59E0B" },
  { key: "course",      label: "Course Content",    color: "#2EABFE" },
  { key: "account",     label: "Account Issue",     color: "#9569F7" },
  { key: "other",       label: "Other",             color: "#5B7384" },
];

const PRIORITIES = [
  { key: "low",    label: "Low",    color: "#5B7384" },
  { key: "normal", label: "Normal", color: "#2EABFE" },
  { key: "high",   label: "High",   color: "#F59E0B" },
  { key: "urgent", label: "Urgent", color: "#EF4444" },
];

/* ─── Status & Priority Pills ────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const map = {
    open:        { color: "#2EABFE", bg: "rgba(46,171,254,0.10)",  label: "Open"        },
    in_progress: { color: "#F59E0B", bg: "rgba(245,158,11,0.10)",  label: "In Progress" },
    resolved:    { color: "#10b981", bg: "rgba(16,185,129,0.10)",  label: "Resolved"    },
    closed:      { color: "#5B7384", bg: "rgba(91,115,132,0.10)",  label: "Closed"      },
  };
  const s = map[status] || map.open;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:999, fontSize:10, fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.color}30` }}>
      {s.label}
    </span>
  );
};

const PriorityPill = ({ priority }) => {
  const map = { low:"#5B7384", normal:"#2EABFE", high:"#F59E0B", urgent:"#EF4444" };
  const color = map[priority] || "#2EABFE";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:999, fontSize:10, fontWeight:700, color, background:`${color}12`, border:`1px solid ${color}30` }}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
};

const CategoryPill = ({ category }) => {
  const cat = CATEGORIES.find(c => c.key === category) || CATEGORIES[4];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:999, fontSize:10, fontWeight:700, color:cat.color, background:`${cat.color}10`, border:`1px solid ${cat.color}25` }}>
      {cat.label}
    </span>
  );
};

/* ─── TicketRow ──────────────────────────────────────────────────── */
const TicketRow = ({ ticket, onClick }) => {
  const cat        = CATEGORIES.find(c => c.key === ticket.category) || CATEGORIES[4];
  const replyCount = (ticket.replies || []).length;
  const hasNew     = replyCount > 0 && (ticket.replies || []).some(r => r.sender_role === 'admin' || r.sender_role === 'instructor');
  return (
    <div
      onClick={onClick}
      style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 15px", borderRadius:11, border:`1px solid ${hasNew ? "rgba(46,171,254,0.35)" : "rgba(2,8,23,0.08)"}`, background:"#fff", boxShadow: hasNew ? "0 2px 10px rgba(46,171,254,0.12)" : "0 2px 6px rgba(2,8,23,0.05)", cursor:"pointer", transition:"box-shadow .15s, transform .15s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 5px 16px rgba(2,8,23,0.10)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 6px rgba(2,8,23,0.05)"; e.currentTarget.style.transform="none"; }}
    >
      <div style={{ width:8, height:8, borderRadius:"50%", background:cat.color, flexShrink:0 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:5 }}>
          <div style={{ fontWeight:700, fontSize:13, color:"#091925", fontFamily:"'Poppins',sans-serif" }}>{ticket.subject}</div>
          {hasNew && <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 6px", borderRadius:999, fontSize:9, fontWeight:900, color:"#2EABFE", background:"rgba(46,171,254,0.10)", border:"1px solid rgba(46,171,254,0.25)" }}>New reply</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
          <StatusPill status={ticket.status} />
          <PriorityPill priority={ticket.priority} />
          <CategoryPill category={ticket.category} />
          <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:10, fontWeight:600, color:"rgba(11,18,32,0.45)" }}>
            <Clock size={9} />
            {new Date(ticket.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
          </span>
          {replyCount > 0 && (
            <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:10, fontWeight:600, color:"rgba(11,18,32,0.45)" }}>
              <MessageSquare size={9} /> {replyCount} repl{replyCount !== 1 ? "ies" : "y"}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={15} style={{ color:"rgba(11,18,32,0.35)", flexShrink:0 }} />
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────── */
const InstructorContactAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view,         setView]         = useState("list");
  const [tickets,      setTickets]      = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [replyText,    setReplyText]    = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [success,      setSuccess]      = useState("");
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");

  const [form, setForm] = useState({
    subject:  "",
    category: "other",
    priority: "normal",
    message:  "",
  });

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await API.get("/support/mine");
      // only show tickets submitted by this instructor
      setTickets(res.data?.tickets || []);
    } catch {
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      setError("Subject and message are required.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      await API.post("/support", {
        ...form,
        // tag this ticket as coming from an instructor so admin can filter
        category: form.category,
      });
      setSuccess("Your ticket has been submitted! Admin will get back to you.");
      setForm({ subject:"", category:"other", priority:"normal", message:"" });
      await loadTickets();
      setTimeout(() => { setSuccess(""); setView("list"); }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const openTicket = async (ticket) => {
    setSelected(ticket);
    setView("detail");
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
      setSelected(res.data?.ticket);
      setReplyText("");
      setTickets(prev => prev.map(t => t._id === selected._id ? res.data.ticket : t));
    } catch { setError("Failed to send reply."); }
    finally { setReplyLoading(false); }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter(t =>
      t.subject?.toLowerCase().includes(q) ||
      t.message?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  const openCount = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;

  return (
    <div style={{ minHeight:"100vh", background:"#F0F4F8", fontFamily:"'Poppins',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .ica-spin{width:28px;height:28px;border-radius:50%;border:3px solid #e2e8f0;border-top-color:#2EABFE;animation:spin .8s linear infinite;}`}</style>

      {/* Back Bar */}
      <div style={{ background:"rgba(246,247,251,0.95)", borderBottom:"1px solid rgba(2,8,23,0.08)", backdropFilter:"blur(10px)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"12px 18px", display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={() => navigate("/instructor/dashboard")} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(2,8,23,0.12)", background:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, color:"rgba(11,18,32,0.72)", fontFamily:"'Poppins',sans-serif" }}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <span style={{ fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.50)" }}>Instructor → Admin Support</span>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 18px 48px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6, flexWrap:"wrap" }}>
          <div style={{ width:48, height:48, borderRadius:14, background:"rgba(46,171,254,0.10)", border:"1px solid rgba(46,171,254,0.22)", display:"grid", placeItems:"center", flexShrink:0 }}>
            <MessageSquare size={22} color="#2EABFE" />
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#091925", letterSpacing:"-0.2px" }}>Contact Admin</div>
            <div style={{ fontSize:12, fontWeight:600, color:"#5B7384", marginTop:2 }}>Submit tickets for website concerns, technical issues, or anything you need admin help with.</div>
          </div>
          {openCount > 0 && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:999, background:"rgba(245,158,11,0.10)", border:"1px solid rgba(245,158,11,0.30)", color:"rgba(146,84,0,1)", fontSize:11, fontWeight:800, marginLeft:"auto" }}>
              <Clock size={12} /> {openCount} open ticket{openCount !== 1 ? "s" : ""}
            </div>
          )}
          {view === "list" ? (
            <button
              onClick={() => { setView("new"); setError(""); setSuccess(""); }}
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"'Poppins',sans-serif", marginLeft: openCount > 0 ? 0 : "auto" }}
            >
              <Plus size={13} /> New Ticket
            </button>
          ) : (
            <button onClick={() => { setView("list"); setSelected(null); setError(""); }} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(2,8,23,0.12)", background:"#fff", cursor:"pointer", fontWeight:700, fontSize:12, color:"rgba(11,18,32,0.65)", fontFamily:"'Poppins',sans-serif", marginLeft:"auto" }}>
              ← Back to tickets
            </button>
          )}
        </div>
        <div style={{ height:2, background:"linear-gradient(90deg,#2EABFE,transparent)", borderRadius:99, margin:"10px 0 20px" }} />

        {/* ── New Ticket Form ── */}
        {view === "new" && (
          <div style={{ background:"#fff", borderRadius:14, border:"0.5px solid rgba(2,8,23,0.08)", boxShadow:"0 3px 14px rgba(2,8,23,0.07)", padding:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#091925" }}>Submit a Ticket to Admin</div>
              <button onClick={() => { setView("list"); setError(""); }} style={{ width:30, height:30, borderRadius:7, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.03)", cursor:"pointer", display:"grid", placeItems:"center", color:"rgba(11,18,32,0.55)" }}>
                <X size={16} />
              </button>
            </div>

            {success && <div style={S.successBanner}><CheckCircle size={14} style={{ flexShrink:0 }} />{success}</div>}
            {error   && <div style={S.errorBanner}><AlertCircle size={14} style={{ flexShrink:0 }} />{error}</div>}

            {/* Category */}
            <div style={{ marginBottom:16 }}>
              <div style={S.fieldLabel}>Category</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.key} type="button" onClick={() => setForm(f => ({ ...f, category:cat.key }))} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 12px", borderRadius:9, border:`1px solid ${form.category===cat.key ? cat.color : "rgba(2,8,23,0.10)"}`, background: form.category===cat.key ? `${cat.color}12` : "rgba(2,8,23,0.02)", cursor:"pointer", fontSize:12, fontWeight:700, color: form.category===cat.key ? cat.color : "rgba(11,18,32,0.65)", fontFamily:"'Poppins',sans-serif" }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div style={{ marginBottom:16 }}>
              <div style={S.fieldLabel}>Priority</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {PRIORITIES.map(p => (
                  <button key={p.key} type="button" onClick={() => setForm(f => ({ ...f, priority:p.key }))} style={{ padding:"6px 14px", borderRadius:999, border:`1px solid ${form.priority===p.key ? p.color : "rgba(2,8,23,0.12)"}`, background: form.priority===p.key ? `${p.color}15` : "#fff", cursor:"pointer", fontSize:12, fontWeight:700, color: form.priority===p.key ? p.color : "rgba(11,18,32,0.65)", fontFamily:"'Poppins',sans-serif" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom:16 }}>
              <label style={S.fieldLabel}>Subject *</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject:e.target.value }))} placeholder="Brief description of your concern..." maxLength={120} style={S.input} />
              <div style={{ fontSize:10, color:"rgba(11,18,32,0.40)", textAlign:"right", marginTop:3 }}>{form.subject.length}/120</div>
            </div>

            {/* Message */}
            <div style={{ marginBottom:20 }}>
              <label style={S.fieldLabel}>Message *</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message:e.target.value }))} placeholder="Describe your concern in detail. Include any relevant links, error messages, or screenshots..." rows={6} style={{ ...S.input, resize:"vertical", lineHeight:1.6 }} />
              <div style={{ fontSize:10, color:"rgba(11,18,32,0.40)", textAlign:"right", marginTop:3 }}>{form.message.length} characters</div>
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", gap:9, paddingTop:16, borderTop:"0.5px solid rgba(2,8,23,0.07)" }}>
              <button onClick={() => { setView("list"); setError(""); }} style={{ padding:"9px 16px", borderRadius:9, border:"1px solid rgba(2,8,23,0.12)", background:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, color:"rgba(11,18,32,0.65)", fontFamily:"'Poppins',sans-serif" }}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 20px", borderRadius:9, border:"none", background: submitting ? "#7FA8C4" : "#091925", color:"#fff", cursor: submitting ? "not-allowed" : "pointer", fontWeight:700, fontSize:13, fontFamily:"'Poppins',sans-serif" }}>
                {submitting ? "Submitting…" : <><Send size={13} /> Submit Ticket</>}
              </button>
            </div>
          </div>
        )}

        {/* ── Ticket Detail ── */}
        {view === "detail" && selected && (
          <div style={{ background:"#fff", borderRadius:14, border:"0.5px solid rgba(2,8,23,0.08)", boxShadow:"0 3px 14px rgba(2,8,23,0.07)", padding:24 }}>
            {/* Meta */}
            <div style={{ marginBottom:16, paddingBottom:16, borderBottom:"0.5px solid rgba(2,8,23,0.07)" }}>
              <div style={{ fontSize:17, fontWeight:800, color:"#091925", letterSpacing:"-0.2px", marginBottom:8 }}>{selected.subject}</div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <StatusPill status={selected.status} />
                <PriorityPill priority={selected.priority} />
                <CategoryPill category={selected.category} />
                <span style={{ fontSize:11, color:"rgba(11,18,32,0.45)", fontWeight:600, display:"inline-flex", alignItems:"center", gap:4 }}>
                  <Clock size={10} />
                  {new Date(selected.createdAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}
                </span>
              </div>
            </div>

            {error && <div style={{ ...S.errorBanner, marginBottom:14 }}><AlertCircle size={14} />{error}</div>}

            {/* Thread */}
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
              {/* Original message */}
              <div style={{ display:"flex", gap:11, padding:14, borderRadius:11, border:"0.5px solid rgba(2,8,23,0.07)", background:"rgba(2,8,23,0.015)" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#091925,#054040)", display:"flex", alignItems:"center", justifyContent:"center", color:"#2EABFE", fontWeight:900, fontSize:14, flexShrink:0 }}>
                  {(user?.name || "I")[0].toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700, fontSize:13, color:"#091925" }}>{selected.user_name}</span>
                    <span style={{ display:"inline-flex", padding:"2px 7px", borderRadius:999, fontSize:10, fontWeight:800, color:"#8b5cf6", background:"rgba(139,92,246,0.10)", border:"1px solid rgba(139,92,246,0.22)" }}>Instructor</span>
                    <span style={{ fontSize:11, color:"rgba(11,18,32,0.45)" }}>{new Date(selected.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric" })}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:500, color:"rgba(11,18,32,0.80)", lineHeight:1.65 }}>{selected.message}</div>
                </div>
              </div>

              {/* Replies */}
              {(selected.replies || []).map((r, i) => {
                const isAdmin = r.sender_role === "admin" || r.sender_role === "instructor";
                return (
                  <div key={i} style={{ display:"flex", gap:11, padding:14, borderRadius:11, border: isAdmin ? "1px solid rgba(46,171,254,0.18)" : "0.5px solid rgba(2,8,23,0.07)", background: isAdmin ? "rgba(46,171,254,0.04)" : "rgba(2,8,23,0.015)" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background: isAdmin ? "rgba(46,171,254,0.15)" : "linear-gradient(135deg,#091925,#054040)", display:"flex", alignItems:"center", justifyContent:"center", color: isAdmin ? "#2EABFE" : "#2EABFE", fontWeight:900, fontSize:14, flexShrink:0 }}>
                      {isAdmin ? "A" : (r.sender_name || "U")[0].toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:13, color:"#091925" }}>{r.sender_name}</span>
                        <span style={{ display:"inline-flex", padding:"2px 7px", borderRadius:999, fontSize:10, fontWeight:800, color: isAdmin ? "#2EABFE" : "#8b5cf6", background: isAdmin ? "rgba(46,171,254,0.10)" : "rgba(139,92,246,0.10)", border:`1px solid ${isAdmin ? "rgba(46,171,254,0.22)" : "rgba(139,92,246,0.22)"}` }}>
                          {isAdmin ? "Admin" : "You"}
                        </span>
                        <span style={{ fontSize:11, color:"rgba(11,18,32,0.45)" }}>{new Date(r.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric" })}</span>
                      </div>
                      <div style={{ fontSize:13, fontWeight:500, color:"rgba(11,18,32,0.80)", lineHeight:1.65 }}>{r.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply box */}
            {selected.status !== "closed" && selected.status !== "resolved" ? (
              <div style={{ paddingTop:16, borderTop:"0.5px solid rgba(2,8,23,0.07)" }}>
                <div style={S.fieldLabel}>Add a reply</div>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your message to admin here..." rows={4} style={{ ...S.input, resize:"vertical", lineHeight:1.6 }} />
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:10 }}>
                  <button onClick={handleReply} disabled={replyLoading || !replyText.trim()} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:9, border:"none", background: (!replyText.trim()||replyLoading) ? "#c8d8e4" : "#091925", color:"#fff", cursor: (!replyText.trim()||replyLoading) ? "not-allowed" : "pointer", fontWeight:700, fontSize:13, fontFamily:"'Poppins',sans-serif" }}>
                    {replyLoading ? "Sending…" : <><Send size={13} /> Send Reply</>}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 14px", borderRadius:9, background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.20)", color:"rgba(0,100,0,1)", fontSize:12, fontWeight:700 }}>
                <CheckCircle size={13} style={{ flexShrink:0 }} />
                This ticket has been {selected.status}. Open a new ticket if you need further help.
              </div>
            )}
          </div>
        )}

        {/* ── Ticket List ── */}
        {view === "list" && (
          <div>
            {error   && <div style={{ ...S.errorBanner,   marginBottom:12 }}><AlertCircle size={14} style={{ flexShrink:0 }} />{error}</div>}
            {success && <div style={{ ...S.successBanner, marginBottom:12 }}><CheckCircle size={14} style={{ flexShrink:0 }} />{success}</div>}

            {/* CTA card */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap", marginBottom:20, padding:"18px 20px", borderRadius:14, background:"linear-gradient(180deg,#ffffff,rgba(46,171,254,0.04))", border:"1px solid rgba(46,171,254,0.16)", boxShadow:"0 4px 14px rgba(46,171,254,0.08)" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#091925", marginBottom:4, fontFamily:"'Poppins',sans-serif" }}>Need help from Admin?</div>
                <div style={{ fontSize:12, fontWeight:600, color:"rgba(11,18,32,0.55)", lineHeight:1.6, fontFamily:"'Poppins',sans-serif" }}>Submit a ticket for website concerns, technical issues, content requests, or anything requiring admin attention.</div>
              </div>
              <button onClick={() => { setView("new"); setError(""); setSuccess(""); }} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:10, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"'Poppins',sans-serif", flexShrink:0 }}>
                <Plus size={13} /> Submit a Ticket
              </button>
            </div>

            {/* Search */}
            <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:"0 14px", height:42, marginBottom:16 }}>
              <Search size={14} color="#7FA8C4" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your tickets..." style={{ border:"none", outline:"none", fontSize:13, flex:1, fontFamily:"'Poppins',sans-serif", color:"#091925" }} />
              <button onClick={loadTickets} style={{ background:"none", border:"none", cursor:"pointer", color:"#7FA8C4", display:"grid", placeItems:"center" }}>
                <RefreshCw size={13} />
              </button>
            </div>

            <div style={{ fontSize:13, fontWeight:700, color:"#091925", marginBottom:10, fontFamily:"'Poppins',sans-serif" }}>My Tickets</div>

            {loading ? (
              <div style={{ padding:"48px 0", textAlign:"center" }}><div className="ica-spin" style={{ margin:"0 auto" }} /></div>
            ) : filtered.length === 0 ? (
              <div style={{ borderRadius:13, border:"1px dashed rgba(2,8,23,0.13)", background:"rgba(2,8,23,0.02)", padding:"40px 18px", textAlign:"center" }}>
                <MessageSquare size={32} color="#e2e8f0" style={{ marginBottom:10 }} />
                <div style={{ fontSize:14, fontWeight:800, color:"rgba(11,18,32,0.60)", marginBottom:6, fontFamily:"'Poppins',sans-serif" }}>No tickets yet</div>
                <div style={{ fontSize:12, fontWeight:600, color:"rgba(11,18,32,0.45)", marginBottom:16, fontFamily:"'Poppins',sans-serif" }}>Submit your first ticket if you need help from admin.</div>
                <button onClick={() => { setView("new"); setError(""); }} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:9, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"'Poppins',sans-serif" }}>
                  <Plus size={13} /> Submit a Ticket
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {filtered.map(t => <TicketRow key={t._id} ticket={t} onClick={() => openTicket(t)} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Shared Styles ──────────────────────────────────────────────── */
const S = {
  fieldLabel: { fontSize:11, fontWeight:700, color:"rgba(11,18,32,0.55)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:7, display:"block", fontFamily:"'Poppins',sans-serif" },
  input: { width:"100%", padding:"10px 13px", borderRadius:9, border:"1px solid rgba(2,8,23,0.13)", background:"#fff", fontSize:13, fontWeight:500, color:"rgba(11,18,32,0.85)", outline:"none", fontFamily:"'Poppins',sans-serif", boxSizing:"border-box" },
  successBanner: { display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:9, background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.22)", color:"rgba(0,100,0,1)", fontSize:12, fontWeight:700, marginBottom:16, fontFamily:"'Poppins',sans-serif" },
  errorBanner:   { display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:9, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.22)", color:"rgba(185,28,28,1)", fontSize:12, fontWeight:700, marginBottom:16, fontFamily:"'Poppins',sans-serif" },
};

export default InstructorContactAdmin;