import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  User, LogOut, FileText, BookOpen, Clock,
  CheckCircle, Award, MapPin, Hash
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, transcriptRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/dashboard/transcript')
        ]);
        setDashboard(dashRes.data);
        setTranscript(transcriptRes.data);
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>NMLS Student Portal</h1>
        <div style={styles.headerRight}>
          <User size={16} style={{ marginRight: 6 }} />
          <span style={styles.headerUser}>{user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: 4 }} />
            Logout
          </button>
        </div>
      </div>

      {/* Profile Bar */}
      <div style={styles.profileBar}>
        <span style={styles.profileItem}>
          <Hash size={14} style={styles.profileIcon} />
          NMLS ID: <strong>{dashboard?.profile?.nmls_id || 'Not set'}</strong>
        </span>
        <span style={styles.profileItem}>
          <MapPin size={14} style={styles.profileIcon} />
          State: <strong>{dashboard?.profile?.state || 'Not set'}</strong>
        </span>
        <span style={styles.profileItem}>
          <CheckCircle size={14} style={styles.profileIcon} />
          Total Completions: <strong>{dashboard?.completions?.total || 0}</strong>
        </span>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['overview', 'transcript', 'orders'].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.content}>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={styles.grid}>
              <div style={styles.statCard}>
                <BookOpen size={28} color="#1a73e8" />
                <h3>Pre-Licensing (PE)</h3>
                <p style={styles.statNumber}>{dashboard?.completions?.PE?.length || 0}</p>
                <p style={styles.statLabel}>Completed</p>
              </div>
              <div style={styles.statCard}>
                <FileText size={28} color="#34a853" />
                <h3>Continuing Ed (CE)</h3>
                <p style={styles.statNumber}>{dashboard?.completions?.CE?.length || 0}</p>
                <p style={styles.statLabel}>Completed</p>
              </div>
              <div style={styles.statCard}>
                <Clock size={28} color="#fbbc04" />
                <h3>Pending Courses</h3>
                <p style={styles.statNumber}>{dashboard?.pending_courses?.length || 0}</p>
                <p style={styles.statLabel}>In Progress</p>
              </div>
            </div>

            <h3 style={styles.sectionTitle}>Recent Completions</h3>
            {dashboard?.completions?.PE?.length === 0 && dashboard?.completions?.CE?.length === 0 ? (
                <p style={styles.empty}>No completions yet. <span style={{ color: '#1a73e8', cursor: 'pointer' }} onClick={() => navigate('/courses')}>Browse courses</span></p>
                ) : (
              [...(dashboard?.completions?.PE || []), ...(dashboard?.completions?.CE || [])]
                .slice(0, 5)
                .map((c, i) => (
                  <div key={i} style={styles.courseCard}>
                    <div style={styles.courseCardTop}>
                      <strong>{c.course?.title}</strong>
                      <span style={styles.badge(c.course?.type)}>{c.course?.type}</span>
                    </div>
                    <div style={styles.courseInfo}>
                      <span style={styles.courseInfoItem}>
                        <Clock size={13} style={{ marginRight: 4 }} />
                        {c.course?.credit_hours} hrs
                      </span>
                      <span style={styles.courseInfoItem}>
                        <CheckCircle size={13} style={{ marginRight: 4 }} />
                        {new Date(c.completed_at).toLocaleDateString()}
                      </span>
                      {c.certificate_url && (
                        <a href={c.certificate_url} target="_blank" rel="noreferrer" style={styles.certLink}>
                          <Award size={13} style={{ marginRight: 4 }} />
                          Certificate
                        </a>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Transcript Tab */}
        {activeTab === 'transcript' && (
          <div>
            <h3 style={styles.sectionTitle}>NMLS Transcript — {transcript?.student?.name}</h3>
            {transcript?.transcript?.length === 0 ? (
              <p style={styles.empty}>No completed courses yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Course</th>
                    <th style={styles.th}>NMLS ID</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Credit Hrs</th>
                    <th style={styles.th}>Completed</th>
                    <th style={styles.th}>Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {transcript?.transcript?.map((t, i) => (
                    <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                      <td style={styles.td}>{t.course_title}</td>
                      <td style={styles.td}>{t.nmls_course_id}</td>
                      <td style={styles.td}>
                        <span style={styles.badge(t.type)}>{t.type}</span>
                      </td>
                      <td style={styles.td}>{t.credit_hours}</td>
                      <td style={styles.td}>{new Date(t.completed_at).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        {t.certificate_url && (
                          <a href={t.certificate_url} target="_blank" rel="noreferrer" style={styles.certLink}>
                            <Award size={14} style={{ marginRight: 4 }} />
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h3 style={styles.sectionTitle}>My Orders</h3>
            {dashboard?.orders?.length === 0 ? (
              <p style={styles.empty}>No orders yet.</p>
            ) : (
              dashboard?.orders?.map((order, i) => (
                <div key={i} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderId}>
                      <FileText size={14} style={{ marginRight: 6 }} />
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={styles.orderStatus(order.status)}>{order.status}</span>
                  </div>
                  <div style={styles.orderItems}>
                    {order.items.map((item, j) => (
                      <div key={j} style={styles.orderItem}>
                        <BookOpen size={13} style={{ marginRight: 6, color: '#666' }} />
                        {item.course_id?.title}
                        {item.include_textbook && (
                          <span style={styles.textbookTag}>+ Textbook</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={styles.orderFooter}>
                    <span>Total: <strong>${order.total_amount}</strong></span>
                    <span style={styles.orderDate}>
                      <Clock size={12} style={{ marginRight: 4 }} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  header: { background: '#1a73e8', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '1.2rem' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  headerUser: { fontSize: '0.9rem' },
  logoutBtn: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  profileBar: { background: '#fff', padding: '0.75rem 2rem', display: 'flex', gap: '2rem', borderBottom: '1px solid #e0e0e0', flexWrap: 'wrap' },
  profileItem: { display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', color: '#555' },
  profileIcon: { color: '#1a73e8' },
  tabs: { background: '#fff', padding: '0 2rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e0e0e0' },
  tab: { padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.95rem', color: '#666', borderBottom: '3px solid transparent' },
  activeTab: { color: '#1a73e8', borderBottom: '3px solid #1a73e8', fontWeight: 600 },
  content: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '2rem', fontWeight: 700, color: '#1a73e8', margin: '0.5rem 0' },
  statLabel: { color: '#888', fontSize: '0.85rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#333' },
  empty: { color: '#888', fontStyle: 'italic' },
  courseCard: { background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  courseCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  courseInfo: { display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#666', alignItems: 'center' },
  courseInfoItem: { display: 'flex', alignItems: 'center' },
  badge: (type) => ({ background: type === 'PE' ? '#e8f0fe' : '#e6f4ea', color: type === 'PE' ? '#1a73e8' : '#34a853', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }),
  certLink: { display: 'flex', alignItems: 'center', color: '#1a73e8', textDecoration: 'none', fontSize: '0.85rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  th: { background: '#f8f9fa', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#555', borderBottom: '1px solid #e0e0e0' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #f0f0f0' },
  trEven: { background: '#fafafa' },
  orderCard: { background: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  orderId: { display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '0.9rem' },
  orderStatus: (status) => ({ padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: status === 'paid' ? '#e6f4ea' : status === 'pending' ? '#fff8e1' : '#fce8e6', color: status === 'paid' ? '#34a853' : status === 'pending' ? '#f9ab00' : '#ea4335' }),
  orderItems: { marginBottom: '0.75rem' },
  orderItem: { display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: '#555', marginBottom: '0.25rem' },
  textbookTag: { marginLeft: '0.5rem', background: '#f0f0f0', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' },
  orderDate: { display: 'flex', alignItems: 'center' }
};

export default Dashboard;