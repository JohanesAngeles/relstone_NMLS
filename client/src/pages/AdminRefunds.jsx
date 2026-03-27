import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';

// ─── Mock Admin Refunds Data (for demo) ────────────────────────────────────────
const MOCK_REFUNDS = [
  {
    _id: '507f1f77bcf86cd799439011',
    user_id: { name: 'John Doe', email: 'john@example.com' },
    total_amount: 149.00,
    refund_request: {
      reason: 'Purchased by mistake',
      details: 'Accidentally bought the wrong course',
      requested_at: '2025-03-01T10:00:00Z'
    },
    refund_status: 'pending',
    createdAt: '2025-02-28T15:30:00Z'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    user_id: { name: 'Jane Smith', email: 'jane@example.com' },
    total_amount: 79.00,
    refund_request: {
      reason: 'Technical issues prevented access',
      details: 'Could not access course materials',
      requested_at: '2025-02-25T08:15:00Z'
    },
    refund_status: 'approved',
    createdAt: '2025-02-24T12:00:00Z'
  }
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    pending:   { bg: 'rgba(245,158,11,.1)',  color: '#b45309', border: 'rgba(245,158,11,.3)',  label: 'Pending Review'   },
    approved:  { bg: 'rgba(34,197,94,.1)',   color: '#16a34a', border: 'rgba(34,197,94,.25)',  label: 'Approved' },
    rejected:  { bg: 'rgba(239,68,68,.1)',   color: '#dc2626', border: 'rgba(239,68,68,.25)',  label: 'Rejected'  },
    processed: { bg: 'rgba(100,116,139,.1)', color: '#475569', border: 'rgba(100,116,139,.2)', label: 'Processed' },
  };
  const s = cfg[status] || cfg.pending;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 11px', borderRadius:999, fontSize:11.5, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{s.label}</span>;
};

// ─── Main Admin Refunds Page ─────────────────────────────────────────────────
export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const loadRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/orders/refunds/admin');
      const data = res.data?.refunds || [];
      setRefunds(data.map(r => ({ ...r, id: r._id })));
      if (data.length > 0) {
        showToast(`Loaded ${data.length} refund request(s)`);
      }
    } catch (err) {
      console.error('Failed to load refunds:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      setError(`API Error: ${errMsg}`);
      setRefunds(MOCK_REFUNDS);
      showToast(`Unable to load live refunds (${errMsg}). Showing sample data.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = filterStatus === 'all' ? refunds : refunds.filter(r => r.refund_status === filterStatus);

  const handleAction = async (orderId, action, adminNotes = '') => {
    try {
      const res = await API.post(`/orders/${orderId}/refund/${action}`, { admin_notes: adminNotes });
      const updated = res.data?.order;
      if (!updated) throw new Error('No order returned from API');

      const newRefundStatus = updated.refund_status || action;
      const newStatus = updated.status || `refund_${newRefundStatus}`;
      setRefunds(prev => prev.map(r => r._id === orderId ? {
        ...r,
        refund_status: newRefundStatus,
        status: newStatus,
        refund_processed_at: updated.refund_processed_at || r.refund_processed_at,
      } : r));

      showToast(`Refund ${action} successfully.`);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || `Failed to ${action} refund.`;
      showToast(msg);
      console.error('Refund action error:', error);
    }
  };

  const handleProcess = async (orderId) => {
    try {
      const res = await API.post(`/orders/${orderId}/refund/process`);
      const updated = res.data?.order;
      if (!updated) throw new Error('No order returned from API');

      const newRefundStatus = updated.refund_status || 'processed';
      const newStatus = updated.status || 'refund_processed';
      setRefunds(prev => prev.map(r => r._id === orderId ? {
        ...r,
        refund_status: newRefundStatus,
        status: newStatus,
      } : r));

      showToast('Refund marked as processed.');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to process refund.';
      showToast(msg);
      console.error('Refund process error:', error);
    }
  };

  return (
    <Layout>
      <style>{`
        .ar-page { padding: 32px; max-width: 1200px; margin: 0 auto; font-family: 'Poppins', sans-serif; }
        .ar-title { font-size: 28px; font-weight: 800; color: #091925; margin-bottom: 8px; }
        .ar-subtitle { font-size: 14px; color: #64748b; margin-bottom: 32px; }

        .ar-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .ar-stat { background: #fff; border: 1px solid rgba(9,25,37,.05); border-radius: 16px; padding: 24px; text-align: center; }
        .ar-stat-val { font-size: 32px; font-weight: 800; color: #091925; margin-bottom: 4px; }
        .ar-stat-lbl { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }

        .ar-panel { background: #fff; border: 1px solid rgba(9,25,37,.05); border-radius: 20px; overflow: hidden; }
        .ar-panel-head { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .ar-panel-title { font-size: 18px; font-weight: 700; color: #091925; }
        .ar-panel-sub { font-size: 13px; color: #64748b; margin-top: 2px; }

        .ar-filters { display: flex; gap: 8px; }
        .ar-filter { padding: 6px 14px; border: 1px solid rgba(9,25,37,.1); border-radius: 8px; background: #f8fafc; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
        .ar-filter:hover { background: #e2e8f0; }
        .ar-filter--on { background: #2EABFE; color: #fff; border-color: #2EABFE; }

        .ar-table-wrap { overflow-x: auto; }
        .ar-table { width: 100%; border-collapse: collapse; }
        .ar-table th { text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #94a3b8; padding: 16px 24px; border-bottom: 2px solid #e2e8f0; }
        .ar-table td { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .ar-tr:hover { background: #f8fafc; }

        .ar-user { font-weight: 600; color: #091925; margin-bottom: 2px; }
        .ar-email { font-size: 12px; color: #64748b; }

        .ar-amount { font-size: 16px; font-weight: 800; color: #091925; }

        .ar-reason { font-weight: 600; color: #091925; margin-bottom: 4px; }
        .ar-details { font-size: 12px; color: #64748b; max-width: 200px; }

        .ar-acts { display: flex; gap: 8px; flex-wrap: wrap; }
        .ar-act { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all .15s; }
        .ar-act--approve { background: rgba(34,197,94,.1); color: #16a34a; border: 1px solid rgba(34,197,94,.2); }
        .ar-act--approve:hover { background: rgba(34,197,94,.15); }
        .ar-act--reject { background: rgba(239,68,68,.1); color: #dc2626; border: 1px solid rgba(239,68,68,.2); }
        .ar-act--reject:hover { background: rgba(239,68,68,.15); }
        .ar-act--process { background: rgba(100,116,139,.1); color: #475569; border: 1px solid rgba(100,116,139,.2); }
        .ar-act--process:hover { background: rgba(100,116,139,.15); }

        .ar-toast { position: fixed; top: 20px; right: 20px; background: #16a34a; color: #fff; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; z-index: 1000; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(9,25,37,.15); }
      `}</style>

      {toast && (
        <div className="ar-toast">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}

      <div className="ar-page">
        <div className="ar-title">Refund Management</div>
        <div className="ar-subtitle">Review and process refund requests from users</div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <div className="ar-stats">
          {[
            { label: 'Total Requests', value: refunds.length },
            { label: 'Pending Review', value: refunds.filter(r => r.refund_status === 'pending').length },
            { label: 'Approved', value: refunds.filter(r => r.refund_status === 'approved').length },
            { label: 'Processed', value: refunds.filter(r => r.refund_status === 'processed').length },
          ].map((s, i) => (
            <div key={i} className="ar-stat">
              <div className="ar-stat-val">{s.value}</div>
              <div className="ar-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="ar-panel">
          <div className="ar-panel-head">
            <div>
              <div className="ar-panel-title">Refund Requests</div>
              <div className="ar-panel-sub">Review each request and take appropriate action</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={loadRefunds}
                disabled={loading}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(9,25,37,.1)', background: '#f8fafc', fontSize: 12, fontWeight: 600, color: '#475569', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </button>
              <div className="ar-filters">
                {['all', 'pending', 'approved', 'rejected', 'processed'].map(f => (
                  <button key={f} className={`ar-filter${filterStatus === f ? ' ar-filter--on' : ''}`} onClick={() => setFilterStatus(f)}>
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ar-table-wrap">
            <table className="ar-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '52px 0', color: '#94a3b8', fontSize: 14 }}>No refunds match this filter.</td></tr>
                ) : filtered.map(r => (
                  <tr key={r._id} className="ar-tr">
                    <td>
                      <div className="ar-user">{r.user_id.name}</div>
                      <div className="ar-email">{r.user_id.email}</div>
                    </td>
                    <td className="ar-amount">${r.total_amount.toFixed(2)}</td>
                    <td>
                      <div className="ar-reason">{r.refund_request.reason}</div>
                      {r.refund_request.details && <div className="ar-details">{r.refund_request.details}</div>}
                    </td>
                    <td><StatusBadge status={r.refund_status ? `refund_${r.refund_status}` : (r.status || 'unknown')} /></td>
                    <td>{new Date(r.refund_request.requested_at).toLocaleDateString()}</td>
                    <td>
                      <div className="ar-acts">
                        {r.refund_status === 'pending' && (
                          <>
                            <button className="ar-act ar-act--approve" onClick={() => handleAction(r._id, 'approve')}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                              Approve
                            </button>
                            <button className="ar-act ar-act--reject" onClick={() => handleAction(r._id, 'reject')}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              Reject
                            </button>
                          </>
                        )}
                        {r.refund_status === 'approved' && (
                          <button className="ar-act ar-act--process" onClick={() => handleProcess(r._id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.03"/></svg>
                            Mark Processed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}