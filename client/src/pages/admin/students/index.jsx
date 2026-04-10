import { useEffect, useState } from 'react';
import {
  Eye, ToggleLeft, ToggleRight, Mail, Hash,
  MapPin, User, RefreshCw, UserPlus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/axios';

/* ─── Search Row ─────────────────────────────────────────────────── */
const SearchRow = ({ icon, label, placeholder, value, onChange, onSearch, color = '#2EABFE', buttonLabel }) => (
  <div style={{ display:'flex', alignItems:'center', borderBottom:'1px solid #f1f5f9', padding:'0' }}>
    <div style={{ width:140, padding:'14px 16px', fontSize:11, fontWeight:800, color:'#5B7384', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0 }}>
      {label}
    </div>
    <div style={{ flex:1, padding:'10px 0' }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch()}
        placeholder={placeholder}
        style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#091925', fontFamily:"'Poppins',sans-serif", outline:'none', background:'#fafbfc', boxSizing:'border-box' }}
      />
    </div>
    <div style={{ padding:'10px 16px', flexShrink:0 }}>
      <button
        onClick={onSearch}
        style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:9, border:'none', background:color, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Poppins',sans-serif", whiteSpace:'nowrap' }}
      >
        {icon} {buttonLabel}
      </button>
    </div>
  </div>
);

/* ─── AdminStudents ──────────────────────────────────────────────── */
const AdminStudents = () => {
  const navigate = useNavigate();

  const [students,     setStudents]     = useState([]);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [searchName,   setSearchName]   = useState('');
  const [searchEmail,  setSearchEmail]  = useState('');
  const [searchNmls,   setSearchNmls]   = useState('');
  const [searchState,  setSearchState]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState({ field: '', value: '' });

  const fetchStudents = async (field = activeFilter.field, value = activeFilter.value, pg = page) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (field && value) params[field] = value;
      const res = await API.get('/admin/students', { params });
      setStudents(res.data.students || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page, statusFilter]);

  const applyFilter = (field, value) => {
    if (!value.trim()) return;
    setActiveFilter({ field, value });
    setPage(1);
    fetchStudents(field, value, 1);
  };

  const clearAll = () => {
    setSearchName(''); setSearchEmail(''); setSearchNmls(''); setSearchState('');
    setActiveFilter({ field: '', value: '' });
    setStatusFilter('');
    setPage(1);
    fetchStudents('', '', 1);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.patch(`/admin/students/${id}/toggle-status`);
      setStudents(prev => prev.map(s => s._id === id ? { ...s, is_active: res.data.is_active } : s));
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const hasActiveFilter = activeFilter.field && activeFilter.value;

  return (
    <div style={{ padding:'28px 0', fontFamily:"'Poppins',sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#091925', marginBottom:4 }}>Students</h1>
        <p style={{ fontSize:13, color:'#5B7384' }}>Search and manage all registered students.</p>
        <div style={{ height:2, background:'linear-gradient(90deg,#2EABFE,transparent)', borderRadius:99, marginTop:12 }} />
      </div>

      {/* ── Search Panel ── */}
      <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:20, overflow:'hidden' }}>

        {/* Panel Header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:'#091925' }}>Search Student Records</div>
            <div style={{ fontSize:12, color:'#7FA8C4', marginTop:2 }}>Use any of the methods below to find a student</div>
          </div>
          {hasActiveFilter && (
            <button
              onClick={clearAll}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:'1px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.06)', color:'#ef4444', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}
            >
              <RefreshCw size={12} /> Clear Search
            </button>
          )}
        </div>

        {/* Search Rows */}
        <SearchRow
          label="BY FULL NAME"
          placeholder="e.g. Juan dela Cruz"
          icon={<User size={13} />}
          buttonLabel="Filter by Name"
          color="#2EABFE"
          value={searchName}
          onChange={setSearchName}
          onSearch={() => applyFilter('search', searchName)}
        />
        <SearchRow
          label="BY EMAIL"
          placeholder="e.g. student@gmail.com"
          icon={<Mail size={13} />}
          buttonLabel="Filter by Email"
          color="#8b5cf6"
          value={searchEmail}
          onChange={setSearchEmail}
          onSearch={() => applyFilter('email', searchEmail)}
        />
        <SearchRow
          label="BY NMLS ID"
          placeholder="e.g. 1234567"
          icon={<Hash size={13} />}
          buttonLabel="Filter by NMLS ID"
          color="#f59e0b"
          value={searchNmls}
          onChange={setSearchNmls}
          onSearch={() => applyFilter('nmls_id', searchNmls)}
        />
        <SearchRow
          label="BY STATE"
          placeholder="e.g. NY, CA, FL"
          icon={<MapPin size={13} />}
          buttonLabel="Filter by State"
          color="#10b981"
          value={searchState}
          onChange={setSearchState}
          onSearch={() => applyFilter('state', searchState)}
        />

        {/* Status + Stats row */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 16px', background:'#f8fafc', borderTop:'1px solid #f1f5f9', flexWrap:'wrap' }}>
          <div style={{ fontSize:11, fontWeight:800, color:'#5B7384', textTransform:'uppercase', letterSpacing:'0.06em', width:124, flexShrink:0 }}>
            BY STATUS
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {[
              { val:'',         label:'All Students'  },
              { val:'active',   label:'Active Only'   },
              { val:'inactive', label:'Inactive Only' },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => { setStatusFilter(opt.val); setPage(1); }}
                style={{ padding:'6px 14px', borderRadius:999, background: statusFilter === opt.val ? '#2EABFE' : '#fff', color: statusFilter === opt.val ? '#fff' : '#5B7384', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Poppins',sans-serif", border: statusFilter === opt.val ? '2px solid #2EABFE' : '1px solid #e2e8f0' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ marginLeft:'auto', fontSize:13, color:'#7FA8C4', fontWeight:500 }}>
            {total} student{total !== 1 ? 's' : ''} found
            {hasActiveFilter && (
              <span style={{ marginLeft:8, fontSize:11, color:'#2EABFE', fontWeight:700 }}>
                · Filtered by {activeFilter.field}: "{activeFilter.value}"
              </span>
            )}
          </div>
        </div>

        {/* ── Add New Student Row ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderTop:'1px solid #f1f5f9', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:'#091925', marginBottom:3 }}>
              Need To Add A New Student?
            </div>
            <div style={{ fontSize:12, color:'#7FA8C4', fontWeight:500 }}>
              Create a new student record in the system. You can add exam data after the record is created.
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/students/add')}
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:10, border:'none', background:'#166534', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Poppins',sans-serif", flexShrink:0, boxShadow:'0 4px 14px rgba(22,101,52,0.25)' }}
          >
            <UserPlus size={15} /> + Add New Student Records
          </button>
        </div>

      </div>{/* end search panel */}

      {/* ── Results Table ── */}
      <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>NMLS ID</th>
              <th style={th}>State</th>
              <th style={th}>Status</th>
              <th style={th}>Joined</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign:'center', padding:40, color:'#7FA8C4' }}>
                  <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#2EABFE', animation:'spin .8s linear infinite' }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    Loading students…
                  </div>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign:'center', padding:40, color:'#7FA8C4' }}>
                  No students found. Try a different search.
                </td>
              </tr>
            ) : students.map(s => (
              <tr
                key={s._id}
                style={{ borderBottom:'1px solid #f1f5f9' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={td}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(46,171,254,0.12)', border:'1px solid rgba(46,171,254,0.25)', display:'grid', placeItems:'center', fontSize:11, fontWeight:800, color:'#2EABFE', flexShrink:0 }}>
                      {s.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?'}
                    </div>
                    <span style={{ fontWeight:600 }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ ...td, color:'#7FA8C4' }}>{s.email}</td>
                <td style={{ ...td, color:'#7FA8C4', fontFamily:'monospace' }}>{s.nmls_id || '—'}</td>
                <td style={{ ...td, color:'#7FA8C4' }}>{s.state || '—'}</td>
                <td style={td}>
                  <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99, background: s.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.is_active ? '#10b981' : '#ef4444' }}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ ...td, color:'#7FA8C4' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td style={td}>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => navigate(`/admin/students/${s._id}`)} title="View Details" style={actionBtn('#2EABFE')}>
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleToggleStatus(s._id)} title={s.is_active ? 'Deactivate' : 'Activate'} style={actionBtn(s.is_active ? '#ef4444' : '#10b981')}>
                      {s.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6, padding:16, borderTop:'1px solid #f1f5f9' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ width:34, height:34, borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color: page === 1 ? '#cbd5e1' : '#091925', cursor: page === 1 ? 'not-allowed' : 'pointer', display:'grid', placeItems:'center' }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{ width:34, height:34, borderRadius:8, border:'none', background: p === page ? '#2EABFE' : '#f1f5f9', color: p === page ? '#fff' : '#091925', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ width:34, height:34, borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color: page === totalPages ? '#cbd5e1' : '#091925', cursor: page === totalPages ? 'not-allowed' : 'pointer', display:'grid', placeItems:'center' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

/* ── Styles ── */
const th        = { textAlign:'left', padding:'14px 16px', fontSize:12, fontWeight:600, color:'#7FA8C4' };
const td        = { padding:'14px 16px', color:'#091925', fontWeight:500 };
const actionBtn = (color) => ({ width:30, height:30, borderRadius:8, border:'none', background:`${color}18`, color, cursor:'pointer', display:'grid', placeItems:'center' });

export default AdminStudents;