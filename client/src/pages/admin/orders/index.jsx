import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import API from '../../../api/axios';

/* ─── Mini Bar Chart ─────────────────────────────────────────────── */
const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: '#7FA8C4', fontSize: 13 }}>
      No revenue data yet.
    </div>
  );

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const max    = Math.max(...data.map(d => d.total));

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
          <div style={{ fontSize: 10, color: '#7FA8C4', fontWeight: 600 }}>${d.total}</div>
          <div style={{
            width: '100%', borderRadius: 4,
            background: 'linear-gradient(180deg, #2EABFE, #60C3FF)',
            height: `${Math.max((d.total / max) * 80, 4)}px`,
            transition: 'height .3s',
          }} />
          <div style={{ fontSize: 9, color: '#7FA8C4' }}>
            {months[(d._id.month - 1)]}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── AdminOrders ────────────────────────────────────────────────── */
const AdminOrders = () => {
  const navigate                    = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [stats, setStats]           = useState(null);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [status, setStatus]         = useState('');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [search, status, page]);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/orders/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/orders', {
        params: { search, status, page, limit: 10 },
      });
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Total Revenue',      value: `$${stats.totalRevenue.toLocaleString()}`,          icon: <DollarSign size={22} />,  color: '#10b981' },
    { label: 'Total Orders',       value: stats.totalOrders,                                   icon: <ShoppingCart size={22} />, color: '#2EABFE' },
    { label: 'Avg Order Value',    value: `$${stats.avgOrderValue.toFixed(2)}`,                icon: <TrendingUp size={22} />,  color: '#f59e0b' },
  ] : [];

  const statusColor = (s) => {
    if (s === 'completed' || s === 'paid') return { bg: 'rgba(16,185,129,0.1)', color: '#10b981' };
    if (s === 'pending')                   return { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' };
    if (s === 'cancelled')                 return { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' };
    return { bg: 'rgba(127,168,196,0.1)', color: '#7FA8C4' };
  };

  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Orders & Revenue</h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>Track all orders and revenue across the platform.</p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      {/* Stat Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          {statCards.map((c) => (
            <div key={c.label} style={{
              background: '#fff', borderRadius: 14, padding: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `3px solid ${c.color}`,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${c.color}18`, color: c.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#091925', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#7FA8C4', marginTop: 4 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      {stats?.revenueByMonth && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#091925', marginBottom: 16 }}>Revenue by Month</div>
          <RevenueChart data={stats.revenueByMonth} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: '0 14px', height: 42, flex: 1, maxWidth: 360,
        }}>
          <Search size={15} color="#7FA8C4" />
          <input
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, fontFamily: "'Poppins', sans-serif", color: '#091925' }}
          />
        </div>

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
            <option value="completed">Completed</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: 13, color: '#7FA8C4', fontWeight: 500 }}>
          {total} order{total !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={th}>Order ID</th>
              <th style={th}>Student</th>
              <th style={th}>Items</th>
              <th style={th}>Total</th>
              <th style={th}>Status</th>
              <th style={th}>Date</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7FA8C4' }}>Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#7FA8C4' }}>No orders found.</td></tr>
            ) : orders.map((o) => {
              const sc = statusColor(o.status);
              return (
                <tr
                  key={o._id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...td, color: '#7FA8C4', fontFamily: 'monospace', fontSize: 11 }}>
                    #{o._id.toString().slice(-8).toUpperCase()}
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: '#091925' }}>{o.user_id?.name || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: '#7FA8C4' }}>{o.user_id?.email || ''}</div>
                  </td>
                  <td style={{ ...td, color: '#7FA8C4' }}>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                  <td style={{ ...td, fontWeight: 700, color: '#091925' }}>${o.total_amount?.toFixed(2)}</td>
                  <td style={td}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: sc.bg, color: sc.color }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#7FA8C4' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={td}>
                    <button
                      onClick={() => navigate(`/admin/orders/${o._id}`)}
                      title="View Details"
                      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(46,171,254,0.1)', color: '#2EABFE', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
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

export default AdminOrders;