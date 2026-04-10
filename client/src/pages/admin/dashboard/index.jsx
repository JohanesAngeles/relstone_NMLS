import { useEffect, useState } from 'react';
import { Users, BookOpen, BookCheck, DollarSign, UserCheck, Activity,  MessageSquare, } from 'lucide-react';
import API from '../../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalRevenue: 0,
    recentEnrollments: [],
    recentStudents: [],
  });
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          API.get('/admin/dashboard/stats'),
          API.get('/admin/dashboard/logs'),
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data.logs);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const cards = [
    { label: 'Total Students',  value: stats.totalStudents,            icon: <Users size={22} />,     color: '#2EABFE' },
    { label: 'Total Courses',   value: stats.totalCourses,             icon: <BookOpen size={22} />,  color: '#10b981' },
    { label: 'Active Courses',  value: stats.activeCourses,            icon: <BookCheck size={22} />, color: '#f59e0b' },
    { label: 'Total Revenue',   value: `$${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign size={22} />, color: '#8b5cf6' },
  ];

  if (loading) return (
    <div style={{ padding: 32, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>
      Loading dashboard...
    </div>
  );

  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>
          Welcome back! Here's what's happening.
        </p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {cards.map((card) => (
          <div key={card.label} style={{
            background: '#fff',
            borderRadius: 14,
            padding: '20px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            borderTop: `3px solid ${card.color}`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: `${card.color}18`,
              color: card.color,
              display: 'grid', placeItems: 'center',
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#091925', lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: '#7FA8C4', marginTop: 4 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Recent Enrollments */}
        <div style={card}>
          <div style={cardHeader}>
            <UserCheck size={16} color="#2EABFE" />
            <span style={cardTitle}>Recent Enrollments</span>
          </div>
          {stats.recentEnrollments.length === 0 ? (
            <p style={empty}>No enrollments yet.</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Student</th>
                  <th style={th}>Course</th>
                  <th style={th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEnrollments.map((e) => (
                  <tr key={e._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={td}>{e.user_id?.name || 'N/A'}</td>
                    <td style={{ ...td, color: '#7FA8C4', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.course_id?.title || 'N/A'}
                    </td>
                    <td style={{ ...td, color: '#7FA8C4' }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Students */}
        <div style={card}>
          <div style={cardHeader}>
            <Users size={16} color="#10b981" />
            <span style={cardTitle}>Recent Students</span>
          </div>
          {stats.recentStudents.length === 0 ? (
            <p style={empty}>No students yet.</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentStudents.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={td}>{s.name}</td>
                    <td style={{ ...td, color: '#7FA8C4' }}>{s.email}</td>
                    <td style={td}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                        background: s.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: s.is_active ? '#10b981' : '#ef4444',
                      }}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── System Logs ── */}
      <div style={card}>
        <div style={cardHeader}>
          <Activity size={16} color="#8b5cf6" />
          <span style={cardTitle}>System Logs — Recent Logins</span>
        </div>
        {logs.length === 0 ? (
          <p style={empty}>No logs yet.</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={td}>{log.name}</td>
                  <td style={{ ...td, color: '#7FA8C4' }}>{log.email}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: log.role === 'super_admin' ? 'rgba(139,92,246,0.1)' :
                                  log.role === 'admin'       ? 'rgba(46,171,254,0.1)' :
                                  log.role === 'instructor'  ? 'rgba(245,158,11,0.1)' :
                                                               'rgba(16,185,129,0.1)',
                      color: log.role === 'super_admin' ? '#8b5cf6' :
                             log.role === 'admin'       ? '#2EABFE' :
                             log.role === 'instructor'  ? '#f59e0b' :
                                                          '#10b981',
                    }}>
                      {log.role}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#7FA8C4' }}>
                    {new Date(log.last_login_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

/* ── Shared table styles ── */
const card       = { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const cardHeader = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 };
const cardTitle  = { fontSize: 14, fontWeight: 700, color: '#091925' };
const table      = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th         = { textAlign: 'left', padding: '0 0 10px', color: '#7FA8C4', fontWeight: 600, fontSize: 12 };
const td         = { padding: '10px 0', color: '#091925', fontWeight: 500 };
const empty      = { color: '#94a3b8', fontSize: 13 };

export default AdminDashboard;