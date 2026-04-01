import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, User, Package, Ban } from 'lucide-react';
import API from '../../../api/axios';
import Breadcrumbs from '../components/Breadcrumbs';

/* ─── Confirm Dialog ─────────────────────────────────────────────── */
const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={D.dialogTitle}>Cancel / Refund Order?</div>
      <div style={D.dialogSub}>This will mark the order as cancelled. This action cannot be undone.</div>
      <div style={D.dialogSub2}>Are you sure you want to proceed?</div>
      <div style={D.dialogBtns}>
        <button style={D.cancelBtn}  onClick={onCancel}  type="button">No, keep it</button>
        <button style={D.confirmBtn} onClick={onConfirm} type="button">Yes, cancel order</button>
      </div>
    </div>
  </>
);

/* ─── OrderDetail ────────────────────────────────────────────────── */
const OrderDetail = () => {
  const { id }                    = useParams();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/admin/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleRefund = async () => {
    try {
      const res = await API.patch(`/admin/orders/${id}/refund`);
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
      showToast('Order cancelled successfully!', 'success');
      setShowConfirm(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const statusColor = (s) => {
    if (s === 'completed' || s === 'paid') return { bg: 'rgba(16,185,129,0.1)', color: '#10b981' };
    if (s === 'pending')                   return { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' };
    if (s === 'cancelled')                 return { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' };
    return { bg: 'rgba(127,168,196,0.1)', color: '#7FA8C4' };
  };

  if (loading) return <div style={{ padding: 32, color: '#7FA8C4', fontFamily: "'Poppins',sans-serif" }}>Loading...</div>;
  if (!order)  return <div style={{ padding: 32, color: '#ef4444', fontFamily: "'Poppins',sans-serif" }}>Order not found.</div>;

  const sc = statusColor(order.status);

  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          fontFamily: "'Poppins', sans-serif",
        }}>
          {toast.message}
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleRefund}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Orders',    path: '/admin/orders' },
        { label: `Order #${order._id.toString().slice(-8).toUpperCase()}` },
      ]} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Order Details</h1>
            <p style={{ fontSize: 13, color: '#5B7384' }}>
              Order #{order._id.toString().slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 99,
            background: sc.bg, color: sc.color,
          }}>
            {order.status}
          </span>
        </div>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Student Info */}
          <div style={card}>
            <div style={sectionTitle}>
              <User size={15} color="#2EABFE" />
              <span>Student</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', background: '#2EABFE',
                display: 'grid', placeItems: 'center', fontSize: 14,
                fontWeight: 700, color: '#091925', flexShrink: 0,
              }}>
                {order.user_id?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#091925' }}>{order.user_id?.name || 'N/A'}</div>
                <div style={{ fontSize: 12, color: '#7FA8C4' }}>{order.user_id?.email || 'N/A'}</div>
              </div>
            </div>
            {order.user_id?.phone && (
              <div style={{ fontSize: 12, color: '#7FA8C4' }}>
                Phone: <strong style={{ color: '#091925' }}>{order.user_id.phone}</strong>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={card}>
            <div style={sectionTitle}>
              <ShoppingCart size={15} color="#10b981" />
              <span>Order Summary</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>Order ID</span>
                <span style={{ fontWeight: 600, color: '#091925', fontFamily: 'monospace', fontSize: 11 }}>
                  #{order._id.toString().slice(-8).toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>Date</span>
                <span style={{ fontWeight: 600, color: '#091925' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>Items</span>
                <span style={{ fontWeight: 600, color: '#091925' }}>{order.items?.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>Status</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, background: sc.bg, color: sc.color }}>
                  {order.status}
                </span>
              </div>
              {order.payment_reference && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#7FA8C4' }}>Payment Ref</span>
                  <span style={{ fontWeight: 600, color: '#091925', fontSize: 11, fontFamily: 'monospace' }}>{order.payment_reference}</span>
                </div>
              )}
              <div style={{ height: '0.5px', background: '#e2e8f0', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
                <span style={{ fontWeight: 700, color: '#091925' }}>Total</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>${order.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Refund Button */}
          {order.status !== 'cancelled' && (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                width: '100%', height: 44, borderRadius: 10, border: 'none',
                background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <Ban size={15} /> Cancel / Refund Order
            </button>
          )}

        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Order Items */}
          <div style={card}>
            <div style={sectionTitle}>
              <Package size={15} color="#f59e0b" />
              <span>Order Items ({order.items?.length})</span>
            </div>
            {!order.items?.length ? (
              <p style={{ fontSize: 13, color: '#7FA8C4' }}>No items found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.items.map((item, i) => (
                  <div key={i} style={{
                    background: '#f8fafc', borderRadius: 12, padding: '14px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#091925', marginBottom: 4 }}>
                        {item.course_id?.title || 'Unknown Course'}
                      </div>
                      <div style={{ fontSize: 11, color: '#7FA8C4' }}>
                        {item.course_id?.nmls_course_id} • {item.course_id?.type}
                        {item.include_textbook && ' • Includes Textbook'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#091925' }}>
                        ${(item.price + (item.include_textbook ? item.textbook_price : 0)).toFixed(2)}
                      </div>
                      {item.include_textbook && (
                        <div style={{ fontSize: 11, color: '#7FA8C4' }}>
                          Course: ${item.price} + Textbook: ${item.textbook_price}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Total Row */}
                <div style={{
                  background: '#f0fdf4', borderRadius: 12, padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#091925' }}>Total Amount</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>
                    ${order.total_amount?.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─── Dialog Styles ──────────────────────────────────────────────── */
const D = {
  backdrop:    { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)' },
  dialog:      { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 400, background: '#fff', borderRadius: 22, padding: '32px 28px 26px', boxShadow: '0 28px 70px rgba(9,25,37,0.20)', textAlign: 'center', fontFamily: "'Poppins', sans-serif" },
  dialogTitle: { fontSize: 18, fontWeight: 700, color: '#091925', marginBottom: 8 },
  dialogSub:   { fontSize: 13, color: '#5B7384', marginBottom: 6 },
  dialogSub2:  { fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 24 },
  dialogBtns:  { display: 'flex', gap: 10 },
  cancelBtn:   { flex: 1, height: 44, background: 'rgba(2,8,23,0.04)', border: '1px solid rgba(2,8,23,0.10)', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'rgba(11,18,32,0.72)', fontFamily: 'inherit' },
  confirmBtn:  { flex: 1, height: 44, background: 'rgba(220,38,38,0.90)', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'inherit' },
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const card         = { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const sectionTitle = { fontSize: 14, fontWeight: 700, color: '#091925', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 };

export default OrderDetail;