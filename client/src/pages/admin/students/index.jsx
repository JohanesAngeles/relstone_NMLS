import { useEffect, useState } from 'react';
import { Search, Filter, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/axios';

const AdminStudents = () => {
const navigate = useNavigate();
  const [students, setStudents]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null); // for student detail modal

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/students', {
        params: { search, status, page, limit: 10 },
      });
      setStudents(res.data.students);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [search, status, page]);

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.patch(`/admin/students/${id}/toggle-status`);
      setStudents(prev => prev.map(s =>
        s._id === id ? { ...s, is_active: res.data.is_active } : s
      ));
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Replace this function
const handleViewDetails = (id) => {
  navigate(`/admin/students/${id}`);
};

  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>
          Students
        </h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>
          Manage and view all registered students.
        </p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '0 14px', height: 42, flex: 1,
          maxWidth: 360,
        }}>
          <Search size={15} color="#7FA8C4" />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, fontFamily: "'Poppins', sans-serif", color: '#091925' }}
          />
        </div>

        {/* Status Filter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '0 14px', height: 42,
        }}>
          <Filter size={15} color="#7FA8C4" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif", color: '#091925', background: 'transparent', cursor: 'pointer' }}
          >
            <option value="">All Students</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Total count */}
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center',
          fontSize: 13, color: '#7FA8C4', fontWeight: 500,
        }}>
          {total} student{total !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
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
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7FA8C4' }}>
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7FA8C4' }}>
                  No students found.
                </td>
              </tr>
            ) : students.map((s) => (
              <tr key={s._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={td}>{s.name}</td>
                <td style={{ ...td, color: '#7FA8C4' }}>{s.email}</td>
                <td style={{ ...td, color: '#7FA8C4' }}>{s.nmls_id || '—'}</td>
                <td style={{ ...td, color: '#7FA8C4' }}>{s.state || '—'}</td>
                <td style={td}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                    background: s.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: s.is_active ? '#10b981' : '#ef4444',
                  }}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ ...td, color: '#7FA8C4' }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* View Details */}
                    <button
                      onClick={() => handleViewDetails(s._id)}
                      title="View Details"
                      style={actionBtn('#2EABFE')}
                    >
                      <Eye size={14} />
                    </button>
                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(s._id)}
                      title={s.is_active ? 'Deactivate' : 'Activate'}
                      style={actionBtn(s.is_active ? '#ef4444' : '#10b981')}
                    >
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: 'none',
                  background: p === page ? '#2EABFE' : '#f1f5f9',
                  color: p === page ? '#fff' : '#091925',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Student Detail Modal ── */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={backdrop} />
          <div style={modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#091925' }}>Student Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4', fontSize: 18 }}>✕</button>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#2EABFE', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700, color: '#091925' }}>
                {selected.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#091925' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#7FA8C4' }}>{selected.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'NMLS ID',     value: selected.nmls_id    || '—' },
                { label: 'State',       value: selected.state      || '—' },
                { label: 'Phone',       value: selected.phone      || '—' },
                { label: 'Role',        value: selected.role },
                { label: 'Status',      value: selected.is_active ? 'Active' : 'Inactive' },
                { label: 'Joined',      value: new Date(selected.createdAt).toLocaleDateString() },
                { label: 'Last Login',  value: selected.last_login_at ? new Date(selected.last_login_at).toLocaleString() : '—' },
                { label: 'License Type', value: selected.license_type || '—' },
              ].map(item => (
                <div key={item.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#091925' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ── Styles ── */
const th = { textAlign: 'left', padding: '14px 16px', fontSize: 12, fontWeight: 600, color: '#7FA8C4' };
const td = { padding: '14px 16px', color: '#091925', fontWeight: 500 };
const actionBtn = (color) => ({
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
});
const backdrop = { position: 'fixed', inset: 0, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)', zIndex: 300 };
const modal = {
  position: 'fixed', zIndex: 301, top: '50%', left: '50%',
  transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 520,
  background: '#fff', borderRadius: 20, padding: '28px',
  boxShadow: '0 28px 70px rgba(9,25,37,0.20)',
  fontFamily: "'Poppins', sans-serif", maxHeight: '90vh', overflowY: 'auto',
};

export default AdminStudents;