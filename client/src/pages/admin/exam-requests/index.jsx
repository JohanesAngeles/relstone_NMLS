import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, CheckCircle, XCircle, Clock,
  RefreshCw, AlertTriangle, User, BookOpen,
  ChevronDown, ChevronUp, MessageSquare, Search, Filter,
} from 'lucide-react';
import API from '../../../api/axios';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
}) : '—';

const STATUS_MAP = {
  pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', label: 'Pending'  },
  approved: { color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Approved' },
  denied:   { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  label: 'Denied'   },
};

const TYPE_MAP = {
  final_exam:      'Final Exam',
  checkpoint:      'Checkpoint',
  quiz_fundamentals: 'Fundamentals Exam',
};

/* ─── Review Modal ───────────────────────────────────────────────── */
const ReviewModal = ({ request, onClose, onDone }) => {
  const [note,       setNote]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const handle = async (status) => {
    setLoading(true); setError('');
    try {
      await API.patch(`/exam-requests/${request._id}/review`, {
        status, admin_note: note,
      });
      onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request.');
    } finally {
      setLoading(false);
    }
  };

  const student = request.user_id || {};
  const course  = request.course_id || {};

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(9,25,37,0.55)', backdropFilter:'blur(5px)', zIndex:300 }} />
      <div style={{ position:'fixed', zIndex:301, top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'90%', maxWidth:520, background:'#fff', borderRadius:20, padding:28, boxShadow:'0 28px 70px rgba(9,25,37,0.20)', fontFamily:"'Poppins',sans-serif" }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontSize:17, fontWeight:800, color:'#091925' }}>Review Access Request</div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#7FA8C4', fontSize:20, lineHeight:1 }}>×</button>
        </div>

        {/* Student info */}
        <div style={{ background:'#f8fafc', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'#2EABFE', display:'grid', placeItems:'center', fontSize:13, fontWeight:700, color:'#091925', flexShrink:0 }}>
              {(student.name || request.user_name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#091925' }}>{student.name || request.user_name}</div>
              <div style={{ fontSize:12, color:'#7FA8C4' }}>{student.email || request.user_email}</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div style={{ background:'#fff', borderRadius:8, padding:'8px 12px', border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#7FA8C4', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Course</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#091925' }}>{course.title || '—'}</div>
            </div>
            <div style={{ background:'#fff', borderRadius:8, padding:'8px 12px', border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#7FA8C4', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Exam Type</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#091925' }}>{TYPE_MAP[request.quiz_type] || request.quiz_type}</div>
            </div>
            <div style={{ background:'#fff', borderRadius:8, padding:'8px 12px', border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#7FA8C4', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Exam</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#091925' }}>{request.quiz_title}</div>
            </div>
            <div style={{ background:'#fff', borderRadius:8, padding:'8px 12px', border:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#7FA8C4', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Submitted</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#091925' }}>{fmtDate(request.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Student message */}
        {request.student_message && (
          <div style={{ background:'rgba(46,171,254,0.06)', border:'1px solid rgba(46,171,254,0.20)', borderRadius:10, padding:'12px 14px', marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#2EABFE', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Student Message</div>
            <div style={{ fontSize:13, fontWeight:500, color:'#091925', lineHeight:1.6 }}>{request.student_message}</div>
          </div>
        )}

        {/* Admin note */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:12, fontWeight:700, color:'#5B7384', display:'block', marginBottom:6 }}>
            Admin Note <span style={{ fontWeight:400, color:'#7FA8C4' }}>(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note for the student (e.g. reason for denial or instructions)..."
            rows={3}
            style={{ width:'100%', padding:'10px 13px', borderRadius:9, border:'1px solid #e2e8f0', fontSize:13, fontWeight:500, color:'#091925', outline:'none', resize:'vertical', lineHeight:1.6, fontFamily:"'Poppins',sans-serif", boxSizing:'border-box' }}
          />
        </div>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:9, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.22)', color:'rgba(185,28,28,1)', fontSize:12, fontWeight:700, marginBottom:16 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} disabled={loading} style={{ flex:1, height:44, borderRadius:10, border:'1px solid #e2e8f0', background:'transparent', color:'#7FA8C4', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>
            Cancel
          </button>
          <button onClick={() => handle('denied')} disabled={loading} style={{ flex:1, height:44, borderRadius:10, border:'1px solid rgba(239,68,68,0.30)', background:'rgba(239,68,68,0.06)', color:'#ef4444', fontWeight:700, fontSize:13, cursor:loading?'not-allowed':'pointer', fontFamily:"'Poppins',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <XCircle size={15} /> {loading ? '…' : 'Deny'}
          </button>
          <button onClick={() => handle('approved')} disabled={loading} style={{ flex:2, height:44, borderRadius:10, border:'none', background:'#10b981', color:'#fff', fontWeight:700, fontSize:13, cursor:loading?'not-allowed':'pointer', fontFamily:"'Poppins',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow:'0 4px 14px rgba(16,185,129,0.30)' }}>
            <CheckCircle size={15} /> {loading ? 'Processing…' : 'Approve Access'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Request Row ────────────────────────────────────────────────── */
const RequestRow = ({ request, onReview }) => {
  const [expanded, setExpanded] = useState(false);
  const s       = STATUS_MAP[request.status] || STATUS_MAP.pending;
  const student = request.user_id || {};
  const course  = request.course_id || {};

  return (
    <div style={{ background:'#fff', borderRadius:14, border:`1px solid ${request.status === 'pending' ? 'rgba(245,158,11,0.35)' : '#e2e8f0'}`, boxShadow: request.status === 'pending' ? '0 2px 12px rgba(245,158,11,0.10)' : '0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden', transition:'box-shadow .15s' }}>

      {/* Main row */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', flexWrap:'wrap' }}>

        {/* Avatar */}
        <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(46,171,254,0.12)', border:'1px solid rgba(46,171,254,0.25)', display:'grid', placeItems:'center', fontSize:14, fontWeight:700, color:'#2EABFE', flexShrink:0 }}>
          {(student.name || request.user_name || 'S')[0].toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, color:'#091925' }}>{student.name || request.user_name || '—'}</div>
          <div style={{ fontSize:12, color:'#7FA8C4' }}>{student.email || request.user_email || '—'}</div>
        </div>

        {/* Course */}
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#7FA8C4', marginBottom:2 }}>Course</div>
          <div style={{ fontSize:13, fontWeight:600, color:'#091925', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{course.title || '—'}</div>
        </div>

        {/* Exam */}
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#7FA8C4', marginBottom:2 }}>Exam</div>
          <div style={{ fontSize:13, fontWeight:600, color:'#091925' }}>{TYPE_MAP[request.quiz_type] || request.quiz_type}</div>
        </div>

        {/* Date */}
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#7FA8C4', marginBottom:2 }}>Submitted</div>
          <div style={{ fontSize:12, fontWeight:600, color:'#5B7384' }}>{fmtDate(request.createdAt)}</div>
        </div>

        {/* Status badge */}
        <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:99, background:s.bg, color:s.color, whiteSpace:'nowrap', flexShrink:0 }}>
          {s.label}
        </span>

        {/* Actions */}
        <div style={{ display:'flex', gap:8, flexShrink:0 }}>
          {request.status === 'pending' && (
            <button onClick={() => onReview(request)} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:'none', background:'#2EABFE', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>
              Review
            </button>
          )}
          <button onClick={() => setExpanded(e => !e)} style={{ width:32, height:32, borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', display:'grid', placeItems:'center', color:'#7FA8C4' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding:'14px 18px', borderTop:'1px solid #f1f5f9', background:'#fafbfc', display:'flex', flexDirection:'column', gap:10 }}>
          {request.student_message && (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#7FA8C4', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>Student Message</div>
              <div style={{ fontSize:13, fontWeight:500, color:'#091925', lineHeight:1.6, background:'#fff', padding:'10px 13px', borderRadius:8, border:'1px solid #e2e8f0' }}>{request.student_message}</div>
            </div>
          )}
          {request.admin_note && (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'#7FA8C4', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>Admin Note</div>
              <div style={{ fontSize:13, fontWeight:500, color:'#091925', lineHeight:1.6, background:'#fff', padding:'10px 13px', borderRadius:8, border:'1px solid #e2e8f0' }}>{request.admin_note}</div>
            </div>
          )}
          {request.reviewed_at && (
            <div style={{ fontSize:12, color:'#7FA8C4', fontWeight:600 }}>
              Reviewed: {fmtDate(request.reviewed_at)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────── */
const AdminExamRequests = () => {
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search,      setSearch]      = useState('');
  const [reviewing,   setReviewing]   = useState(null); // request being reviewed

  const fetchRequests = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await API.get('/exam-requests/admin/all', {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined },
      });
      setRequests(res.data.requests || []);
    } catch (err) {
      setError('Failed to load exam access requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = requests.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const student = r.user_id || {};
    const course  = r.course_id || {};
    return (
      (student.name  || r.user_name  || '').toLowerCase().includes(q) ||
      (student.email || r.user_email || '').toLowerCase().includes(q) ||
      (course.title  || '').toLowerCase().includes(q) ||
      (r.quiz_title  || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ padding:'28px 0', fontFamily:"'Poppins',sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <ClipboardList size={22} color="#2EABFE" />
              <h1 style={{ fontSize:26, fontWeight:800, color:'#091925', margin:0 }}>Exam Access Requests</h1>
              {pendingCount > 0 && (
                <span style={{ fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:99, background:'rgba(245,158,11,0.12)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.30)' }}>
                  {pendingCount} pending
                </span>
              )}
            </div>
            <p style={{ fontSize:13, color:'#5B7384', margin:0 }}>Review and approve student requests for additional exam attempts.</p>
            <div style={{ height:2, background:'linear-gradient(90deg,#2EABFE,transparent)', borderRadius:99, marginTop:12, width:200 }} />
          </div>
          <button onClick={fetchRequests} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', color:'#5B7384', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:"'Poppins',sans-serif" }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #e2e8f0', borderRadius:10, padding:'0 14px', height:42, flex:1, maxWidth:340 }}>
          <Search size={14} color="#7FA8C4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, course, exam..."
            style={{ border:'none', outline:'none', fontSize:13, flex:1, fontFamily:"'Poppins',sans-serif", color:'#091925' }}
          />
        </div>

        {/* Status filter tabs */}
        <div style={{ display:'flex', gap:4, background:'#f8fafc', borderRadius:12, padding:4 }}>
          {[
            { key:'pending',  label:'Pending'  },
            { key:'approved', label:'Approved' },
            { key:'denied',   label:'Denied'   },
            { key:'all',      label:'All'       },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              style={{
                padding:'7px 16px', borderRadius:9, border:'none',
                background: statusFilter === t.key ? '#fff' : 'transparent',
                color: statusFilter === t.key ? '#091925' : '#7FA8C4',
                fontWeight:600, fontSize:13, cursor:'pointer',
                fontFamily:"'Poppins',sans-serif",
                boxShadow: statusFilter === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition:'all .15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize:12, color:'#7FA8C4', fontWeight:500, marginLeft:'auto' }}>
          {filtered.length} request{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding:'60px 0', textAlign:'center', color:'#7FA8C4' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', margin:'0 auto 10px', border:'3px solid #e2e8f0', borderTopColor:'#2EABFE', animation:'spin .8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading requests…
        </div>
      ) : error ? (
        <div style={{ padding:'40px 0', textAlign:'center' }}>
          <AlertTriangle size={28} color="#ef4444" style={{ marginBottom:10 }} />
          <div style={{ color:'#ef4444', fontSize:13, marginBottom:14 }}>{error}</div>
          <button onClick={fetchRequests} style={{ padding:'9px 18px', borderRadius:10, border:'none', background:'#2EABFE', color:'#fff', fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding:'60px 0', textAlign:'center', color:'#7FA8C4' }}>
          <ClipboardList size={36} color="#e2e8f0" style={{ marginBottom:12 }} />
          <div style={{ fontSize:15, fontWeight:700, color:'rgba(11,18,32,0.50)', marginBottom:6 }}>
            {statusFilter === 'pending' ? 'No pending requests' : 'No requests found'}
          </div>
          <div style={{ fontSize:13 }}>
            {statusFilter === 'pending' ? 'All requests have been reviewed.' : 'Try a different filter.'}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(r => (
            <RequestRow key={r._id} request={r} onReview={setReviewing} />
          ))}
        </div>
      )}

      {/* Review modal */}
      {reviewing && (
        <ReviewModal
          request={reviewing}
          onClose={() => setReviewing(null)}
          onDone={fetchRequests}
        />
      )}
    </div>
  );
};

export default AdminExamRequests;