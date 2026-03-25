import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../api/axios';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt     = (n) => `$${Number(n).toFixed(2)}`;
const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date) ? '—' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const BRAND_COLORS = { Visa: '#1A1F71', Mastercard: '#252525', Amex: '#007BC1', Discover: '#E65C00' };

const MOCK_CARDS = [
  { id: 1, brand: 'Visa',       last4: '4242', expiry: '08/26', isDefault: true  },
  { id: 2, brand: 'Mastercard', last4: '5555', expiry: '03/27', isDefault: false },
];

// ─── Download HTML Receipt ───────────────────────────────────────────────────
const downloadReceipt = (order) => {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Receipt ${order.id}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Poppins',Arial,sans-serif;background:#f4f7fb;padding:40px 20px;color:#091925}
.card{background:#fff;max-width:580px;margin:0 auto;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(9,25,37,.1)}
.hdr{background:#091925;padding:28px 32px;display:flex;justify-content:space-between;align-items:center}
.brand{font-size:20px;font-weight:800;color:#fff}.brand span{color:#2EABFE}
.pill{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(46,171,254,.8);border:1px solid rgba(46,171,254,.3);padding:4px 12px;border-radius:999px}
.body{padding:32px}
.kv{display:flex;justify-content:space-between;margin-bottom:8px}
.lbl{font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.8px}
.val{font-size:13px;color:#091925;font-weight:600}
.div{height:1px;background:#e2e8f0;margin:20px 0}
table{width:100%;border-collapse:collapse;margin-top:8px}
th{text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#94a3b8;padding:8px 0;border-bottom:2px solid #e2e8f0}
td{padding:14px 0;font-size:13px;border-bottom:1px solid #f1f5f9}
.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;background:#dcfce7;color:#16a34a}
.foot{background:#f8fafc;padding:20px 32px;text-align:center;font-size:11.5px;color:#94a3b8;line-height:1.7}
</style></head><body>
<div class="card">
<div class="hdr"><div class="brand">Relstone <span>NMLS</span></div><div class="pill">Receipt</div></div>
<div class="body">
  <div style="margin-bottom:24px"><div style="font-size:22px;font-weight:800;margin-bottom:4px">Payment Confirmed</div><div style="font-size:13px;color:#64748b">Thank you for your purchase.</div></div>
  <div class="kv"><span class="lbl">Order ID</span><span class="val" style="font-family:monospace;color:#2EABFE">${order.displayId || order.id}</span></div>
  <div class="kv"><span class="lbl">Date</span><span class="val">${fmtDate(order.date)}</span></div>
  <div class="kv"><span class="lbl">Status</span><span class="badge">Paid</span></div>
  <div class="div"></div>
  <table>
    <thead><tr><th>Course</th><th>Type</th><th>Hrs</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      ${(order.items || [{ course: order.course, type: order.type, hours: order.hours, amount: order.amount }]).map(item => `
      <tr><td>${item.course || item.course_id?.title || '—'}</td><td>${item.type || item.course_id?.type || '—'}</td><td>${item.hours || item.course_id?.credit_hours || 0}</td><td style="text-align:right;font-weight:700">${fmt(item.amount || item.price || 0)}</td></tr>
      `).join('')}
      <tr><td colspan="3" style="font-weight:800;font-size:15px;border-bottom:none;padding-top:16px">Total Paid</td><td style="text-align:right;font-size:16px;font-weight:800;border-bottom:none;padding-top:16px">${fmt(order.amount)}</td></tr>
    </tbody>
  </table>
</div>
<div class="foot">Relstone NMLS Education Platform &nbsp;·&nbsp; NMLS Approved Provider<br/>support@relstone.com &nbsp;·&nbsp; Keep this receipt for your records.</div>
</div></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `receipt-${order.displayId || order.id}.html` });
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Normalize API order to UI shape ─────────────────────────────────────────
const normalizeOrder = (order) => {
  const firstItem = order.items?.[0];
  const course    = firstItem?.course_id;
  const extraItems = order.items?.slice(1) || [];

  return {
    id:             order._id,
    displayId:      `INV-${String(order._id).slice(-8).toUpperCase()}`,
    date:           order.createdAt || order.created_at || '',
    course:         course?.title || 'Unknown Course',
    type:           course?.type  || '—',
    hours:          course?.credit_hours || 0,
    amount:         order.total_amount || 0,
    status:         order.status || 'pending',
    refundEligible: order.status === 'pending',
    itemCount:      order.items?.length || 1,
    extraItems,
    // keep raw items for receipt
    items: (order.items || []).map(it => ({
      course:  it.course_id?.title || '—',
      type:    it.course_id?.type  || '—',
      hours:   it.course_id?.credit_hours || 0,
      amount:  it.price || 0,
    })),
  };
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    completed: { bg: 'rgba(34,197,94,.1)',   color: '#16a34a', border: 'rgba(34,197,94,.25)',  label: 'Completed' },
    paid:      { bg: 'rgba(34,197,94,.1)',   color: '#16a34a', border: 'rgba(34,197,94,.25)',  label: 'Paid'      },
    pending:   { bg: 'rgba(245,158,11,.1)',  color: '#b45309', border: 'rgba(245,158,11,.3)',  label: 'Pending'   },
    refunded:  { bg: 'rgba(100,116,139,.1)', color: '#475569', border: 'rgba(100,116,139,.2)', label: 'Refunded'  },
    cancelled: { bg: 'rgba(239,68,68,.1)',   color: '#dc2626', border: 'rgba(239,68,68,.25)',  label: 'Cancelled' },
    failed:    { bg: 'rgba(239,68,68,.1)',   color: '#dc2626', border: 'rgba(239,68,68,.25)',  label: 'Failed'    },
  };
  const s = cfg[status] || cfg.pending;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 11px', borderRadius:999, fontSize:11.5, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
};

// ─── Brand Mark ───────────────────────────────────────────────────────────────
const BrandMark = ({ brand }) => (
  <div style={{ width:40, height:26, borderRadius:5, flexShrink:0, background:BRAND_COLORS[brand]||'#334155', display:'flex', alignItems:'center', justifyContent:'center' }}>
    <span style={{ fontSize:9, fontWeight:900, color:'#fff', letterSpacing:.5 }}>{brand.slice(0,4).toUpperCase()}</span>
  </div>
);

// ─── Add Card Modal ───────────────────────────────────────────────────────────
const AddCardModal = ({ onClose, onAdd }) => {
  const [form, setForm]     = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [errors, setErrors] = useState({});

  const fmtNum = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp = (v) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  const validate = () => {
    const e = {};
    if (form.number.replace(/\s/g,'').length < 16) e.number = 'Enter a valid 16-digit card number';
    if (!form.name.trim()) e.name = 'Cardholder name is required';
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Use MM/YY format';
    if (form.cvv.length < 3) e.cvv = 'Enter a valid CVV';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const brands = { '4':'Visa','5':'Mastercard','3':'Amex','6':'Discover' };
    onAdd({ id:Date.now(), brand:brands[form.number[0]]||'Visa', last4:form.number.replace(/\s/g,'').slice(-4), expiry:form.expiry, isDefault:false });
    onClose();
  };

  const Field = ({ fkey, label, placeholder, half, transform }) => (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'rgba(9,25,37,.55)', marginBottom:6, letterSpacing:.3 }}>{label}</label>
      <input
        value={form[fkey]}
        onChange={e => setForm({ ...form, [fkey]: transform ? transform(e.target.value) : e.target.value })}
        placeholder={placeholder}
        style={{ width:'100%', height:44, padding:'0 14px', borderRadius:11, border:`1.5px solid ${errors[fkey]?'#fca5a5':'rgba(9,25,37,.1)'}`, background:errors[fkey]?'#fef2f2':'#f8fafc', fontSize:13.5, color:'#091925', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
      />
      {errors[fkey] && <div style={{ fontSize:11, color:'#dc2626', marginTop:4, fontWeight:600 }}>{errors[fkey]}</div>}
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(9,25,37,.65)', backdropFilter:'blur(7px)' }} />
      <div style={{ position:'fixed', zIndex:501, top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'100%', maxWidth:440, background:'#fff', borderRadius:22, padding:'32px 28px 28px', boxShadow:'0 32px 80px rgba(9,25,37,.25)', fontFamily:"'Poppins',sans-serif" }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#091925' }}>Add Payment Card</div>
            <div style={{ fontSize:12.5, color:'#94a3b8', marginTop:3 }}>Encrypted &amp; secured via Authorize.Net</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, border:'1px solid rgba(9,25,37,.1)', background:'#f8fafc', cursor:'pointer', display:'grid', placeItems:'center', color:'#64748b', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field fkey="number" label="Card Number"     placeholder="1234 5678 9012 3456" transform={fmtNum} />
          <Field fkey="name"   label="Cardholder Name" placeholder="Name on card" />
          <Field fkey="expiry" label="Expiry Date"     placeholder="MM/YY" half transform={fmtExp} />
          <Field fkey="cvv"    label="CVV"             placeholder="•••"   half transform={v => v.replace(/\D/g,'').slice(0,4)} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 13px', background:'rgba(46,171,254,.05)', border:'1px solid rgba(46,171,254,.15)', borderRadius:10, margin:'16px 0' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize:11.5, color:'#475569', fontWeight:500 }}>256-bit SSL encryption. CVV is never stored.</span>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, height:44, background:'#f8fafc', border:'1px solid rgba(9,25,37,.1)', borderRadius:11, cursor:'pointer', fontSize:13, fontWeight:700, color:'#64748b', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} style={{ flex:2, height:44, background:'#091925', border:'none', borderRadius:11, cursor:'pointer', fontSize:13, fontWeight:700, color:'#fff', fontFamily:'inherit', transition:'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background='#2EABFE'}
            onMouseLeave={e => e.currentTarget.style.background='#091925'}
          >Add Card</button>
        </div>
      </div>
    </>
  );
};

// ─── Refund Modal ─────────────────────────────────────────────────────────────
const REFUND_REASONS = ['Course not as described','Technical issues prevented access','Purchased by mistake','Duplicate purchase','Other'];

const RefundModal = ({ order, onClose, onSubmit }) => {
  const [reason,  setReason]  = useState('');
  const [details, setDetails] = useState('');

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(9,25,37,.65)', backdropFilter:'blur(7px)' }} />
      <div style={{ position:'fixed', zIndex:501, top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'100%', maxWidth:460, background:'#fff', borderRadius:22, padding:'32px 28px 28px', boxShadow:'0 32px 80px rgba(9,25,37,.25)', fontFamily:"'Poppins',sans-serif" }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:'#091925' }}>Request a Refund</div>
            <div style={{ fontSize:12.5, color:'#94a3b8', marginTop:3 }}>Processed within 5–7 business days</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, border:'1px solid rgba(9,25,37,.1)', background:'#f8fafc', cursor:'pointer', display:'grid', placeItems:'center', color:'#64748b', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ background:'#f8fafc', border:'1px solid rgba(9,25,37,.07)', borderRadius:12, padding:'13px 16px', marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>Order</div>
          <div style={{ fontSize:13.5, fontWeight:700, color:'#091925', marginBottom:3 }}>{order.course}</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12.5, color:'#64748b' }}>{order.displayId} · {fmtDate(order.date)}</span>
            <span style={{ fontSize:15, fontWeight:800, color:'#091925' }}>{fmt(order.amount)}</span>
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11.5, fontWeight:700, color:'rgba(9,25,37,.5)', marginBottom:9, letterSpacing:.3, textTransform:'uppercase' }}>Reason for Refund</div>
          <div style={{ display:'grid', gap:7 }}>
            {REFUND_REASONS.map(r => (
              <label key={r} onClick={() => setReason(r)} style={{ display:'flex', alignItems:'center', gap:11, cursor:'pointer', padding:'10px 14px', borderRadius:10, border:`1.5px solid ${reason===r?'rgba(46,171,254,.45)':'rgba(9,25,37,.08)'}`, background:reason===r?'rgba(46,171,254,.04)':'#fff', transition:'all .15s' }}>
                <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, border:`2px solid ${reason===r?'#2EABFE':'#cbd5e1'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
                  {reason===r && <div style={{ width:7, height:7, borderRadius:'50%', background:'#2EABFE' }} />}
                </div>
                <span style={{ fontSize:13, fontWeight:reason===r?600:500, color:reason===r?'#091925':'#475569' }}>{r}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11.5, fontWeight:700, color:'rgba(9,25,37,.5)', marginBottom:6, letterSpacing:.3, textTransform:'uppercase' }}>Additional Details <span style={{ fontWeight:400, color:'#94a3b8', textTransform:'none' }}>(optional)</span></div>
          <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Describe your issue..."
            style={{ width:'100%', padding:'10px 14px', borderRadius:11, border:'1.5px solid rgba(9,25,37,.1)', background:'#f8fafc', fontSize:13, color:'#091925', outline:'none', fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, height:44, background:'#f8fafc', border:'1px solid rgba(9,25,37,.1)', borderRadius:11, cursor:'pointer', fontSize:13, fontWeight:700, color:'#64748b', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={() => { if (reason) { onSubmit(order.id); onClose(); } }} disabled={!reason}
            style={{ flex:2, height:44, border:'none', borderRadius:11, fontFamily:'inherit', fontSize:13, fontWeight:700, cursor:reason?'pointer':'not-allowed', transition:'all .2s', background:reason?'#dc2626':'#e2e8f0', color:reason?'#fff':'#94a3b8' }}>
            Submit Refund Request
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(9,25,37,.6)', backdropFilter:'blur(6px)' }} />
    <div style={{ position:'fixed', zIndex:501, top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'100%', maxWidth:340, background:'#fff', borderRadius:20, padding:'30px 26px', textAlign:'center', fontFamily:"'Poppins',sans-serif", boxShadow:'0 28px 70px rgba(9,25,37,.22)' }}>
      <div style={{ width:48, height:48, borderRadius:14, background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.2)', display:'grid', placeItems:'center', margin:'0 auto 14px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(220,38,38,.8)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </div>
      <div style={{ fontSize:16, fontWeight:800, color:'#091925', marginBottom:8 }}>Remove Card?</div>
      <div style={{ fontSize:13, color:'#64748b', marginBottom:24, lineHeight:1.6 }}>This card will be permanently removed from your account.</div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onCancel}  style={{ flex:1, height:42, background:'#f8fafc', border:'1px solid rgba(9,25,37,.1)', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700, color:'#64748b', fontFamily:'inherit' }}>Cancel</button>
        <button onClick={onConfirm} style={{ flex:1, height:42, background:'#dc2626', border:'none', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:700, color:'#fff', fontFamily:'inherit' }}>Remove</button>
      </div>
    </div>
  </>
);

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[180, 100, 220, 80, 90, 120].map((w, i) => (
      <td key={i} style={{ padding:'16px' }}>
        <div style={{ height:14, width:w, borderRadius:6, background:'linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%)', backgroundSize:'200% 100%', animation:'ob-shimmer 1.4s infinite' }} />
      </td>
    ))}
  </tr>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrdersBilling() {
  const [tab,           setTab]           = useState('orders');
  const [orders,        setOrders]        = useState([]);
  const [cards,         setCards]         = useState(MOCK_CARDS);
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [showAddCard,   setShowAddCard]   = useState(false);
  const [refundTarget,  setRefundTarget]  = useState(null);
  const [removeTarget,  setRemoveTarget]  = useState(null);
  const [toast,         setToast]         = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError,   setOrdersError]   = useState(null);

  // ── Fetch real orders ─────────────────────────────────────────────
  useEffect(() => {
    setOrdersLoading(true);
    setOrdersError(null);
    API.get('/orders/my')
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : [];
        setOrders(raw.map(normalizeOrder));
      })
      .catch(err => {
        console.error('Failed to load orders:', err);
        setOrdersError('Failed to load orders. Please try again.');
      })
      .finally(() => setOrdersLoading(false));
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const filtered       = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
  const totalSpent     = orders.filter(o => ['completed','paid'].includes(o.status)).reduce((s, o) => s + o.amount, 0);
  const completedCount = orders.filter(o => ['completed','paid'].includes(o.status)).length;

  const handleAddCard    = (card) => { setCards(p => [...p, card]); showToast('Card added successfully.'); };
  const handleSetDefault = (id)   => setCards(p => p.map(c => ({ ...c, isDefault: c.id === id })));
  const handleRemove     = ()     => { setCards(p => p.filter(c => c.id !== removeTarget)); setRemoveTarget(null); showToast('Card removed.'); };
  const handleRefund     = (id)   => {
    setOrders(p => p.map(o => o.id === id ? { ...o, status:'refunded', refundEligible:false } : o));
    showToast('Refund request submitted. Confirmation email sent shortly.');
  };

  return (
    <Layout>
      <style>{CSS}</style>

      {showAddCard  && <AddCardModal onClose={() => setShowAddCard(false)} onAdd={handleAddCard} />}
      {refundTarget && <RefundModal  order={refundTarget} onClose={() => setRefundTarget(null)} onSubmit={handleRefund} />}
      {removeTarget && <ConfirmDialog onConfirm={handleRemove} onCancel={() => setRemoveTarget(null)} />}

      <div className="ob-page">

        {toast && (
          <div className="ob-toast">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {toast}
          </div>
        )}

        {/* Page header */}
        <div className="ob-pg-header">
          <h1 className="ob-title">Orders &amp; Billing</h1>
          <p className="ob-subtitle">Purchase history, receipts, and payment methods</p>
        </div>

        {/* Stats */}
        <div className="ob-stats">
          {[
            { label:'Total Spent',      value: ordersLoading ? '—' : fmt(totalSpent),    icon:'dollar'  },
            { label:'Completed Orders', value: ordersLoading ? '—' : completedCount,     icon:'check'   },
            { label:'Total Orders',     value: ordersLoading ? '—' : orders.length,      icon:'file'    },
            { label:'Saved Cards',      value: cards.length,                              icon:'card'    },
          ].map((s, i) => (
            <div key={i} className="ob-stat">
              <div className="ob-stat-icon">
                {s.icon === 'dollar' && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                {s.icon === 'check'  && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>}
                {s.icon === 'file'   && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                {s.icon === 'card'   && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
              </div>
              <div className="ob-stat-val">{s.value}</div>
              <div className="ob-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ob-tabs">
          <button className={`ob-tab${tab==='orders'  ? ' ob-tab--on' : ''}`} onClick={() => setTab('orders')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Order History
          </button>
          <button className={`ob-tab${tab==='payments' ? ' ob-tab--on' : ''}`} onClick={() => setTab('payments')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Payment Methods
          </button>
        </div>

        {/* ════ ORDER HISTORY ════ */}
        {tab === 'orders' && (
          <div className="ob-panel">
            <div className="ob-panel-head">
              <div>
                <div className="ob-panel-title">Purchase History</div>
                <div className="ob-panel-sub">
                  {ordersLoading
                    ? 'Loading your orders…'
                    : `${orders.length} order${orders.length !== 1 ? 's' : ''} · Download receipts or request refunds`}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <div className="ob-filters">
                  {['all','completed','pending','refunded'].map(f => (
                    <button key={f} className={`ob-filter${filterStatus===f?' ob-filter--on':''}`} onClick={() => setFilterStatus(f)}>
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  className="ob-refresh-btn"
                  onClick={() => {
                    setOrdersLoading(true);
                    setOrdersError(null);
                    API.get('/orders/my')
                      .then(res => setOrders((Array.isArray(res.data) ? res.data : []).map(normalizeOrder)))
                      .catch(() => setOrdersError('Failed to reload.'))
                      .finally(() => setOrdersLoading(false));
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.03"/></svg>
                  Refresh
                </button>
              </div>
            </div>

            {/* Error state */}
            {ordersError && (
              <div style={{ margin:'16px 20px', padding:'12px 16px', borderRadius:10, background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.2)', color:'#dc2626', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {ordersError}
              </div>
            )}

            <div className="ob-table-wrap">
              <table className="ob-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loading skeleton */}
                  {ordersLoading && [1,2,3].map(i => <SkeletonRow key={i} />)}

                  {/* Empty state */}
                  {!ordersLoading && filtered.length === 0 && !ordersError && (
                    <tr>
                      <td colSpan={6} style={{ textAlign:'center', padding:'52px 0' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <div style={{ fontSize:14, fontWeight:700, color:'#64748b' }}>
                            {filterStatus === 'all' ? 'No orders yet.' : `No ${filterStatus} orders.`}
                          </div>
                          {filterStatus === 'all' && (
                            <a href="/courses" style={{ fontSize:13, color:'#2EABFE', fontWeight:700, textDecoration:'none' }}>Browse courses →</a>
                          )}
                          {filterStatus !== 'all' && (
                            <button onClick={() => setFilterStatus('all')} style={{ fontSize:12, color:'#2EABFE', fontWeight:700, background:'none', border:'none', cursor:'pointer', padding:0 }}>Show all orders</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Real data */}
                  {!ordersLoading && filtered.map(o => (
                    <tr key={o.id} className="ob-tr">
                      <td>
                        <span className="ob-oid">{o.displayId}</span>
                        {o.itemCount > 1 && (
                          <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, marginTop:2 }}>
                            {o.itemCount} courses
                          </div>
                        )}
                      </td>
                      <td className="ob-date">{fmtDate(o.date)}</td>
                      <td>
                        <div className="ob-cname">{o.course}</div>
                        <div className="ob-cmeta">
                          {o.type !== '—' && (
                            <span className={`ob-type ob-type--${o.type.toLowerCase()}`}>{o.type}</span>
                          )}
                          {o.hours > 0 && `${o.hours} hrs`}
                          {o.itemCount > 1 && (
                            <span style={{ color:'#2EABFE', fontWeight:700 }}>+{o.itemCount - 1} more</span>
                          )}
                        </div>
                      </td>
                      <td className="ob-amt">{fmt(o.amount)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>
                        <div className="ob-acts">
                          <button className="ob-act" onClick={() => downloadReceipt(o)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Receipt
                          </button>
                          {o.refundEligible && (
                            <button className="ob-act ob-act--red" onClick={() => setRefundTarget(o)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.03"/></svg>
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ob-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span><strong>Refund Policy:</strong> Refunds are available within 7 days of purchase if the course has not been started. Once any module is accessed, refunds are not available per NMLS provider policy.</span>
            </div>
          </div>
        )}

        {/* ════ PAYMENT METHODS ════ */}
        {tab === 'payments' && (
          <div className="ob-panel">
            <div className="ob-panel-head">
              <div>
                <div className="ob-panel-title">Payment Methods</div>
                <div className="ob-panel-sub">Manage saved cards for faster checkout</div>
              </div>
              <button className="ob-add-btn" onClick={() => setShowAddCard(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Card
              </button>
            </div>

            <div className="ob-cards-grid">
              {cards.map(card => (
                <div key={card.id} className={`ob-pcard${card.isDefault?' ob-pcard--default':''}`}>
                  <div className="ob-pcard-top">
                    <BrandMark brand={card.brand} />
                    {card.isDefault && <span className="ob-default-pill">Default</span>}
                  </div>
                  <div className="ob-pcard-num">•••• •••• •••• {card.last4}</div>
                  <div className="ob-pcard-foot">
                    <div>
                      <div className="ob-exp-lbl">Expires</div>
                      <div className="ob-exp-val">{card.expiry}</div>
                    </div>
                    <div className="ob-pcard-btns">
                      {!card.isDefault && <button className="ob-pb" onClick={() => handleSetDefault(card.id)}>Set Default</button>}
                      <button className="ob-pb ob-pb--rm" onClick={() => setRemoveTarget(card.id)}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button className="ob-ghost-card" onClick={() => setShowAddCard(true)}>
                <div className="ob-ghost-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <div className="ob-ghost-label">Add New Card</div>
                <div className="ob-ghost-sub">Visa · Mastercard · Amex</div>
              </button>
            </div>

            <div className="ob-note" style={{ marginTop:0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2EABFE" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span><strong>Secure Storage:</strong> Payment info is encrypted via Authorize.Net. Full card numbers are never stored on our servers.</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.ob-page { max-width:1080px; margin:0 auto; padding:30px 22px 64px; font-family:'Poppins',sans-serif; }

/* header */
.ob-pg-header { margin-bottom:22px; }
.ob-title     { font-size:22px; font-weight:800; color:#091925; margin:0 0 4px; }
.ob-subtitle  { font-size:13px; color:#94a3b8; font-weight:500; margin:0; }

/* toast */
.ob-toast { display:flex; align-items:center; gap:10px; padding:13px 18px; border-radius:12px; font-size:13px; font-weight:600; margin-bottom:22px; background:#f0fdf4; border:1px solid #bbf7d0; color:#15803d; animation:ob-in .28s ease; }
@keyframes ob-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

/* shimmer */
@keyframes ob-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* stats */
.ob-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
.ob-stat  { background:#fff; border:1px solid rgba(9,25,37,.08); border-radius:16px; padding:20px 18px; display:flex; flex-direction:column; gap:8px; transition:box-shadow .2s; }
.ob-stat:hover { box-shadow:0 6px 22px rgba(9,25,37,.07); }
.ob-stat-icon { width:36px; height:36px; background:rgba(46,171,254,.07); border:1px solid rgba(46,171,254,.18); border-radius:10px; display:flex; align-items:center; justify-content:center; }
.ob-stat-val  { font-size:22px; font-weight:800; color:#091925; line-height:1; }
.ob-stat-lbl  { font-size:11.5px; font-weight:600; color:#94a3b8; }

/* tabs */
.ob-tabs { display:flex; gap:5px; background:rgba(9,25,37,.04); border-radius:12px; padding:4px; width:fit-content; margin-bottom:20px; }
.ob-tab  { display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:9px; border:none; background:transparent; font-family:'Poppins',sans-serif; font-size:13px; font-weight:600; color:#64748b; cursor:pointer; transition:all .18s; }
.ob-tab--on { background:#fff; color:#091925; box-shadow:0 2px 8px rgba(9,25,37,.08); }

/* panel */
.ob-panel      { background:#fff; border:1px solid rgba(9,25,37,.07); border-radius:20px; overflow:hidden; }
.ob-panel-head { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:22px 24px; border-bottom:1px solid rgba(9,25,37,.06); }
.ob-panel-title { font-size:15px; font-weight:800; color:#091925; margin-bottom:2px; }
.ob-panel-sub   { font-size:12px; color:#94a3b8; font-weight:500; }

/* filters */
.ob-filters   { display:flex; gap:6px; flex-wrap:wrap; }
.ob-filter    { padding:6px 14px; border-radius:8px; border:1.5px solid rgba(9,25,37,.09); background:transparent; font-family:'Poppins',sans-serif; font-size:12px; font-weight:600; color:#64748b; cursor:pointer; transition:all .15s; }
.ob-filter--on { background:#091925; color:#fff; border-color:#091925; }

/* refresh btn */
.ob-refresh-btn { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; border:1.5px solid rgba(9,25,37,.09); background:#fff; font-family:'Poppins',sans-serif; font-size:12px; font-weight:600; color:#64748b; cursor:pointer; transition:all .15s; }
.ob-refresh-btn:hover { border-color:#2EABFE; color:#2EABFE; }

/* table */
.ob-table-wrap { overflow-x:auto; }
.ob-table      { width:100%; border-collapse:collapse; }
.ob-table thead tr { border-bottom:1px solid rgba(9,25,37,.07); }
.ob-table th   { text-align:left; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; padding:11px 16px; background:#fafbfc; }
.ob-tr         { border-bottom:1px solid rgba(9,25,37,.05); transition:background .13s; }
.ob-tr:last-child { border-bottom:none; }
.ob-tr:hover   { background:#fafbfc; }
.ob-table td   { padding:14px 16px; vertical-align:middle; }
.ob-oid        { font-size:12px; font-weight:700; color:#2EABFE; font-family:'Courier New',monospace; }
.ob-date       { font-size:13px; color:#64748b; white-space:nowrap; }
.ob-cname      { font-size:13.5px; font-weight:600; color:#091925; margin-bottom:5px; }
.ob-cmeta      { display:flex; align-items:center; gap:7px; font-size:12px; color:#94a3b8; font-weight:500; }
.ob-type       { display:inline-block; padding:2px 8px; border-radius:5px; font-size:10.5px; font-weight:700; }
.ob-type--pe   { background:rgba(46,171,254,.1); color:#2EABFE; }
.ob-type--ce   { background:rgba(0,180,180,.1); color:#00B4B4; }
.ob-amt        { font-size:14.5px; font-weight:800; color:#091925; white-space:nowrap; }
.ob-acts       { display:flex; gap:7px; flex-wrap:wrap; }
.ob-act        { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; border-radius:8px; border:1.5px solid rgba(9,25,37,.1); background:#fff; font-family:'Poppins',sans-serif; font-size:12px; font-weight:600; color:#475569; cursor:pointer; transition:all .15s; white-space:nowrap; }
.ob-act:hover  { border-color:#2EABFE; color:#2EABFE; background:rgba(46,171,254,.04); }
.ob-act--red   { border-color:rgba(220,38,38,.2); color:#dc2626; }
.ob-act--red:hover { border-color:#dc2626; background:rgba(220,38,38,.04); }

/* note */
.ob-note { display:flex; align-items:flex-start; gap:10px; padding:13px 20px; background:rgba(46,171,254,.04); border-top:1px solid rgba(46,171,254,.1); font-size:12px; color:#475569; line-height:1.65; }
.ob-note strong { color:#091925; }

/* add card btn */
.ob-add-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; background:#091925; color:#fff; border:none; border-radius:10px; font-family:'Poppins',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:all .2s; }
.ob-add-btn:hover { background:#2EABFE; box-shadow:0 6px 20px rgba(46,171,254,.3); }

/* cards grid */
.ob-cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:16px; padding:20px; }
.ob-pcard      { background:linear-gradient(140deg,#0f2b3d 0%,#091925 100%); border-radius:16px; padding:20px; border:2px solid rgba(255,255,255,.05); position:relative; overflow:hidden; transition:transform .2s,box-shadow .2s; }
.ob-pcard::before { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(135deg,rgba(46,171,254,.07) 0%,transparent 55%); }
.ob-pcard--default { border-color:#2EABFE; }
.ob-pcard:hover { transform:translateY(-2px); box-shadow:0 14px 36px rgba(9,25,37,.22); }
.ob-pcard-top  { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
.ob-default-pill { font-size:9.5px; font-weight:700; padding:3px 9px; background:rgba(46,171,254,.18); border:1px solid rgba(46,171,254,.35); border-radius:999px; color:#60C3FF; text-transform:uppercase; letter-spacing:.5px; }
.ob-pcard-num  { font-size:15px; font-weight:700; color:#fff; letter-spacing:2.5px; margin-bottom:18px; font-family:'Courier New',monospace; }
.ob-pcard-foot { display:flex; align-items:flex-end; justify-content:space-between; }
.ob-exp-lbl    { font-size:9px; font-weight:700; color:rgba(255,255,255,.35); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; }
.ob-exp-val    { font-size:13px; font-weight:700; color:rgba(255,255,255,.8); }
.ob-pcard-btns { display:flex; gap:6px; align-items:center; }
.ob-pb         { padding:5px 10px; border-radius:7px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); font-family:'Poppins',sans-serif; font-size:11px; font-weight:600; color:rgba(255,255,255,.75); cursor:pointer; transition:all .15s; display:inline-flex; align-items:center; gap:4px; }
.ob-pb:hover   { background:rgba(255,255,255,.2); color:#fff; }
.ob-pb--rm     { padding:5px 8px; color:rgba(252,165,165,.8); border-color:rgba(252,165,165,.18); }
.ob-pb--rm:hover { background:rgba(239,68,68,.22); color:#fca5a5; }

/* ghost add */
.ob-ghost-card  { background:transparent; border:2px dashed rgba(9,25,37,.12); border-radius:16px; padding:28px 20px; cursor:pointer; transition:all .2s; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; min-height:162px; font-family:'Poppins',sans-serif; }
.ob-ghost-card:hover { border-color:#2EABFE; background:rgba(46,171,254,.02); }
.ob-ghost-icon  { width:42px; height:42px; background:rgba(46,171,254,.07); border:1px solid rgba(46,171,254,.2); border-radius:12px; display:flex; align-items:center; justify-content:center; }
.ob-ghost-label { font-size:13.5px; font-weight:700; color:#091925; }
.ob-ghost-sub   { font-size:12px; color:#94a3b8; font-weight:500; }

/* responsive */
@media (max-width:860px) { .ob-stats { grid-template-columns:repeat(2,1fr); } }
@media (max-width:640px) {
  .ob-stats { grid-template-columns:repeat(2,1fr); }
  .ob-panel-head { flex-direction:column; align-items:flex-start; }
  .ob-table th:nth-child(2), .ob-table td:nth-child(2) { display:none; }
  .ob-page { padding:18px 14px 52px; }
}
`;