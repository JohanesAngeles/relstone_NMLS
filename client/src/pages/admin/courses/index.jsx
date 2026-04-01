import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import API from '../../../api/axios';

const AdminCourses = () => {
  const navigate                    = useNavigate();
  const [courses, setCourses]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [type, setType]             = useState('');
  const [status, setStatus]         = useState('');
  const [loading, setLoading]       = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/courses', {
        params: { search, type, status, page, limit: 10 },
      });
      setCourses(res.data.courses);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [search, type, status, page]);

  const handleToggleStatus = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await API.patch(`/admin/courses/${id}/toggle-status`);
      setCourses(prev => prev.map(c =>
        c._id === id ? { ...c, is_active: res.data.is_active } : c
      ));
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>
          Courses
        </h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>
          Manage and view all NMLS courses.
        </p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '0 14px', height: 42, flex: 1, maxWidth: 360,
        }}>
          <Search size={15} color="#7FA8C4" />
          <input
            placeholder="Search by title or NMLS ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, fontFamily: "'Poppins', sans-serif", color: '#091925' }}
          />
        </div>

        {/* Type Filter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '0 14px', height: 42,
        }}>
          <Filter size={15} color="#7FA8C4" />
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif", color: '#091925', background: 'transparent', cursor: 'pointer' }}
          >
            <option value="">All Types</option>
            <option value="PE">PE</option>
            <option value="CE">CE</option>
          </select>
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
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Total count */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: 13, color: '#7FA8C4', fontWeight: 500 }}>
          {total} course{total !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={th}>Title</th>
              <th style={th}>NMLS ID</th>
              <th style={th}>Type</th>
              <th style={th}>Credit Hours</th>
              <th style={th}>Price</th>
              <th style={th}>Status</th>
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
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7FA8C4' }}>
                  No courses found.
                </td>
              </tr>
            ) : courses.map((c) => (
              <tr
                key={c._id}
                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...td, maxWidth: 280 }}>
                  <div style={{ fontWeight: 600, color: '#091925', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.title}
                  </div>
                </td>
                <td style={{ ...td, color: '#7FA8C4' }}>{c.nmls_course_id}</td>
                <td style={td}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                    background: c.type === 'PE' ? 'rgba(139,92,246,0.1)' : 'rgba(46,171,254,0.1)',
                    color: c.type === 'PE' ? '#8b5cf6' : '#2EABFE',
                  }}>
                    {c.type}
                  </span>
                </td>
                <td style={{ ...td, color: '#7FA8C4' }}>{c.credit_hours}h</td>
                <td style={{ ...td, color: '#091925', fontWeight: 600 }}>${c.price}</td>
                <td style={td}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                    background: c.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: c.is_active ? '#10b981' : '#ef4444',
                  }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/admin/courses/${c._id}`)}
                      title="View Details"
                      style={actionBtn('#2EABFE')}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => handleToggleStatus(c._id, e)}
                      title={c.is_active ? 'Deactivate' : 'Activate'}
                      style={actionBtn(c.is_active ? '#ef4444' : '#10b981')}
                    >
                      {c.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
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
    </div>
  );
};

const th = { textAlign: 'left', padding: '14px 16px', fontSize: 12, fontWeight: 600, color: '#7FA8C4' };
const td = { padding: '14px 16px', color: '#091925', fontWeight: 500 };
const actionBtn = (color) => ({
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
});

export default AdminCourses;