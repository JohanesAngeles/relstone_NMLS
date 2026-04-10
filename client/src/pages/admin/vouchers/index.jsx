import { useState, useEffect, useCallback } from 'react';
import {
  Tag, Plus, ToggleLeft, ToggleRight, Pencil, Trash2,
  X, Save, AlertCircle, CheckCircle, RefreshCw, Copy,
  Percent, DollarSign, Hash, BookOpen, Megaphone, Bell, BellOff,
} from 'lucide-react';
import API from '../../../api/axios';

/* ─── Helpers ────────────────────────────────────────────────────── */
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

const genCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const defaultForm = {
  code:               '',
  description:        '',
  discount_type:      'percentage',
  discount_value:     '',
  min_order_amount:   '',
  max_discount:       '',
  max_uses:           '',
  uses_per_user:      '1',
  valid_from:         '',
  valid_until:        '',
  is_active:          true,
  applicable_courses: [],
};

/* ─── Field ──────────────────────────────────────────────────────── */
const Field = ({ label, required, hint, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#5B7384', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
      {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 4 }}>{hint}</div>}
  </div>
);

const inp = {
  width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0',
  background: '#fafbfc', fontSize: 13, fontWeight: 500, color: '#091925',
  outline: 'none', fontFamily: "'Poppins',sans-serif", boxSizing: 'border-box',
};

/* ─── Voucher Form Modal ─────────────────────────────────────────── */
const VoucherModal = ({ voucher, onClose, onSaved, showToast }) => {
  const isEdit = !!voucher?._id;
  const [courses, setCourses]           = useState([]);
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    API.get('/admin/courses', { params: { limit: 200 } })
      .then(res => setCourses(res.data.courses || []))
      .catch(() => {});
  }, []);

  const [form, setForm] = useState(voucher ? {
    ...defaultForm,
    code:               voucher.code               || '',
    description:        voucher.description        || '',
    discount_type:      voucher.discount_type      || 'percentage',
    discount_value:     voucher.discount_value     ?? '',
    min_order_amount:   voucher.min_order_amount   ?? '',
    max_discount:       voucher.max_discount       ?? '',
    max_uses:           voucher.max_uses           ?? '',
    uses_per_user:      voucher.uses_per_user      ?? 1,
    valid_from:         voucher.valid_from  ? voucher.valid_from.slice(0, 10)  : '',
    valid_until:        voucher.valid_until ? voucher.valid_until.slice(0, 10) : '',
    is_active:          voucher.is_active !== false,
    applicable_courses: (voucher.applicable_courses || []).map(c => String(c._id || c)),
  } : { ...defaultForm });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const toggleCourse = (id) => {
    const current = form.applicable_courses || [];
    set('applicable_courses',
      current.includes(id) ? current.filter(c => c !== id) : [...current, id]
    );
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim())    e.code           = 'Code is required';
    if (!form.discount_value) e.discount_value = 'Discount value is required';
    if (form.discount_type === 'percentage' && (Number(form.discount_value) < 1 || Number(form.discount_value) > 100))
      e.discount_value = 'Percentage must be 1–100';
    if (form.discount_type === 'fixed' && Number(form.discount_value) <= 0)
      e.discount_value = 'Fixed discount must be > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        code:               form.code.toUpperCase().trim(),
        discount_value:     Number(form.discount_value),
        min_order_amount:   form.min_order_amount ? Number(form.min_order_amount) : 0,
        max_discount:       form.max_discount     ? Number(form.max_discount)     : null,
        max_uses:           form.max_uses         ? Number(form.max_uses)         : null,
        uses_per_user:      Number(form.uses_per_user || 1),
        valid_from:         form.valid_from  || null,
        valid_until:        form.valid_until || null,
        applicable_courses: form.applicable_courses || [],
      };
      if (isEdit) {
        await API.put(`/admin/vouchers/${voucher._id}`, payload);
      } else {
        await API.post('/admin/vouchers', payload);
      }
      showToast(isEdit ? 'Voucher updated!' : 'Voucher created!', 'success');
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save voucher.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const selectedCount = form.applicable_courses?.length || 0;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)', zIndex: 300 }} />
      <div style={{ position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 620, background: '#fff', borderRadius: 20, padding: 0, boxShadow: '0 28px 70px rgba(9,25,37,0.20)', fontFamily: "'Poppins',sans-serif", maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(46,171,254,0.12)', display: 'grid', placeItems: 'center', color: '#2EABFE' }}>
              <Tag size={16} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#091925' }}>{isEdit ? 'Edit Voucher' : 'Create Voucher'}</div>
              <div style={{ fontSize: 12, color: '#7FA8C4' }}>{isEdit ? `Code: ${voucher.code}` : 'Fill in the details below'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#7FA8C4' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Code row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
            <Field label="Voucher Code" required hint="Letters and numbers only. Will be uppercased.">
              <input
                style={{ ...inp, borderColor: errors.code ? '#ef4444' : '#e2e8f0', fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.05em' }}
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                disabled={isEdit}
              />
              {errors.code && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.code}</div>}
            </Field>
            {!isEdit && (
              <button
                type="button"
                onClick={() => set('code', genCode())}
                style={{ padding: '9px 14px', borderRadius: 9, border: '1px solid rgba(46,171,254,0.30)', background: 'rgba(46,171,254,0.08)', color: '#2EABFE', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Poppins',sans-serif" }}
              >
                Generate
              </button>
            )}
          </div>

          {/* Description */}
          <Field label="Description" hint="Internal note — not shown to students">
            <input style={inp} placeholder="e.g. Summer 2025 promo" value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>

          {/* Discount type + value */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Discount Type" required>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['percentage', 'Percentage (%)'], ['fixed', 'Fixed Amount ($)']].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set('discount_type', val)}
                    style={{ flex: 1, padding: '9px 10px', borderRadius: 9, border: `1.5px solid ${form.discount_type === val ? '#2EABFE' : '#e2e8f0'}`, background: form.discount_type === val ? 'rgba(46,171,254,0.08)' : 'transparent', color: form.discount_type === val ? '#2EABFE' : '#5B7384', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}
                  >
                    {form.discount_type === val && (val === 'percentage' ? <Percent size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> : <DollarSign size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />)}
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={form.discount_type === 'percentage' ? 'Discount (%)' : 'Discount ($)'} required>
              <input
                style={{ ...inp, borderColor: errors.discount_value ? '#ef4444' : '#e2e8f0' }}
                type="number" min="0"
                max={form.discount_type === 'percentage' ? 100 : undefined}
                placeholder={form.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 15.00'}
                value={form.discount_value}
                onChange={e => set('discount_value', e.target.value)}
              />
              {errors.discount_value && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.discount_value}</div>}
            </Field>
          </div>

          {/* Limits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Field label="Min Order ($)" hint="0 = no minimum">
              <input style={inp} type="number" min="0" placeholder="0" value={form.min_order_amount} onChange={e => set('min_order_amount', e.target.value)} />
            </Field>
            {form.discount_type === 'percentage' && (
              <Field label="Max Discount ($)" hint="Cap for % discounts">
                <input style={inp} type="number" min="0" placeholder="No cap" value={form.max_discount} onChange={e => set('max_discount', e.target.value)} />
              </Field>
            )}
            <Field label="Max Uses" hint="Leave blank = unlimited">
              <input style={inp} type="number" min="1" placeholder="Unlimited" value={form.max_uses} onChange={e => set('max_uses', e.target.value)} />
            </Field>
            <Field label="Uses Per User" hint="How many times one user can use it">
              <input style={inp} type="number" min="1" placeholder="1" value={form.uses_per_user} onChange={e => set('uses_per_user', e.target.value)} />
            </Field>
          </div>

          {/* Validity dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Valid From" hint="Leave blank = today">
              <input style={inp} type="date" value={form.valid_from} onChange={e => set('valid_from', e.target.value)} />
            </Field>
            <Field label="Valid Until" hint="Leave blank = no expiry">
              <input style={inp} type="date" value={form.valid_until} onChange={e => set('valid_until', e.target.value)} />
            </Field>
          </div>

          {/* Applicable Courses */}
          <Field
            label="Applicable Courses"
            hint={selectedCount === 0 ? 'No courses selected = valid for ALL courses' : `${selectedCount} course${selectedCount !== 1 ? 's' : ''} selected — only valid for these courses`}
          >
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fafbfc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                <Hash size={13} color="#7FA8C4" />
                <input
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                  placeholder="Search courses…"
                  style={{ border: 'none', outline: 'none', fontSize: 12, flex: 1, fontFamily: "'Poppins',sans-serif", color: '#091925', background: 'transparent' }}
                />
                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => set('applicable_courses', [])}
                    style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", padding: '2px 6px', borderRadius: 6 }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                {filteredCourses.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', fontSize: 12, color: '#7FA8C4' }}>
                    {courses.length === 0 ? 'Loading courses…' : 'No courses match your search'}
                  </div>
                ) : filteredCourses.map(c => {
                  const selected = form.applicable_courses?.includes(String(c._id));
                  return (
                    <label
                      key={c._id}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid #f8fafc', background: selected ? 'rgba(46,171,254,0.04)' : 'transparent', transition: 'background .1s' }}
                    >
                      <input
                        type="checkbox"
                        checked={selected || false}
                        onChange={() => toggleCourse(String(c._id))}
                        style={{ accentColor: '#2EABFE', width: 14, height: 14, flexShrink: 0 }}
                      />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: selected ? 700 : 500, color: selected ? '#091925' : 'rgba(11,18,32,0.70)', lineHeight: 1.4 }}>
                        {c.title}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999, flexShrink: 0, color: c.type === 'PE' ? '#2EABFE' : '#00B4B4', background: c.type === 'PE' ? 'rgba(46,171,254,0.10)' : 'rgba(0,180,180,0.10)' }}>
                        {c.type}
                      </span>
                    </label>
                  );
                })}
              </div>
              {selectedCount > 0 && (
                <div style={{ padding: '8px 14px', borderTop: '1px solid #f1f5f9', background: 'rgba(46,171,254,0.04)', fontSize: 11, fontWeight: 700, color: '#2EABFE' }}>
                  ✓ {selectedCount} course{selectedCount !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          </Field>

          {/* Status toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#091925' }}>Active</div>
              <div style={{ fontSize: 12, color: '#7FA8C4' }}>Students can use this voucher when active</div>
            </div>
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.is_active ? '#10b981' : '#7FA8C4' }}
            >
              {form.is_active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', color: '#5B7384', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: 'none', background: saving ? '#7FA8C4' : '#091925', color: '#fff', fontWeight: 800, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'Poppins',sans-serif" }}
          >
            <Save size={14} /> {saving ? 'Saving…' : isEdit ? 'Update Voucher' : 'Create Voucher'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────── */
const AdminVouchers = () => {
  /* ── Voucher state ── */
  const [vouchers, setVouchers] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast,    setToast]    = useState(null);

  /* ── Announcement state ── */
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading,    setAnnLoading]    = useState(true);
  const [annPage,       setAnnPage]       = useState(1);
  const [annTotal,      setAnnTotal]      = useState(0);
  const [annDeleting,   setAnnDeleting]   = useState(null);
  const ANN_LIMIT = 5;

  /* ── Toast ── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch vouchers ── */
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/vouchers', { params: { search, status } });
      setVouchers(res.data.vouchers || []);
      setTotal(res.data.total || 0);
    } catch {
      showToast('Failed to load vouchers.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  /* ── Fetch announcements ── */
  const fetchAnnouncements = useCallback(async (page = 1) => {
    setAnnLoading(true);
    try {
      const res = await API.get('/admin/announcements', {
        params: { status: 'active', page, limit: ANN_LIMIT },
      });
      setAnnouncements(res.data.announcements || []);
      setAnnTotal(res.data.total || 0);
      setAnnPage(page);
    } catch {
      showToast('Failed to load announcements.', 'error');
    } finally {
      setAnnLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
    fetchAnnouncements(1);
  }, [fetchVouchers, fetchAnnouncements]);

  /* ── Voucher handlers ── */
  const handleToggle = async (v) => {
    try {
      const res = await API.patch(`/admin/vouchers/${v._id}/toggle`);
      setVouchers(prev => prev.map(x => x._id === v._id ? res.data.voucher : x));
      showToast(res.data.message, 'success');
    } catch {
      showToast('Failed to toggle voucher.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/vouchers/${id}`);
      setVouchers(prev => prev.filter(x => x._id !== id));
      setDeleting(null);
      showToast('Voucher deleted.', 'success');
    } catch {
      showToast('Failed to delete.', 'error');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => showToast(`Copied: ${code}`, 'success'));
  };

  /* ── Announcement handlers ── */
  const handleAnnToggle = async (ann) => {
    try {
      const res = await API.patch(`/admin/announcements/${ann._id}/toggle`);
      setAnnouncements(prev =>
        prev.map(a => a._id === ann._id ? res.data.announcement : a)
      );
      showToast(res.data.message, 'success');
    } catch {
      showToast('Failed to toggle announcement.', 'error');
    }
  };

  const handleAnnDelete = async (id) => {
    try {
      await API.delete(`/admin/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      setAnnTotal(t => t - 1);
      setAnnDeleting(null);
      showToast('Announcement deleted.', 'success');
    } catch {
      showToast('Failed to delete announcement.', 'error');
    }
  };

  /* ── Status helpers ── */
  const isExpired    = (v) => v.valid_until && new Date(v.valid_until) < new Date();
  const isNotStarted = (v) => v.valid_from  && new Date(v.valid_from)  > new Date();

  const getVoucherStatus = (v) => {
    if (!v.is_active)    return { label: 'Inactive',  color: '#ef4444', bg: 'rgba(239,68,68,0.10)'  };
    if (isExpired(v))    return { label: 'Expired',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' };
    if (isNotStarted(v)) return { label: 'Scheduled', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' };
    return                      { label: 'Active',    color: '#10b981', bg: 'rgba(16,185,129,0.10)' };
  };

  const getAnnStatus = (ann) => {
    const expired = ann.expires_at && new Date(ann.expires_at) < new Date();
    if (expired)        return { label: 'Expired',  color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' };
    if (ann.is_active)  return { label: 'Active',   color: '#10b981', bg: 'rgba(16,185,129,0.10)' };
    return                     { label: 'Inactive', color: '#ef4444', bg: 'rgba(239,68,68,0.10)'  };
  };

  /* ── Render ── */
  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins',sans-serif" }}>

      {/* ── Spinner keyframe ── */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 999, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, background: toast.type === 'success' ? '#10b981' : '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', fontFamily: "'Poppins',sans-serif" }}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}

      {/* ── Voucher delete confirm ── */}
      {deleting && (
        <>
          <div onClick={() => setDeleting(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(9,25,37,0.55)', zIndex: 400 }} />
          <div style={{ position: 'fixed', zIndex: 401, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 380, background: '#fff', borderRadius: 20, padding: 28, textAlign: 'center', fontFamily: "'Poppins',sans-serif", boxShadow: '0 28px 70px rgba(9,25,37,0.20)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#091925', marginBottom: 8 }}>Delete Voucher?</div>
            <div style={{ fontSize: 13, color: '#5B7384', marginBottom: 22 }}>
              Delete <strong style={{ fontFamily: 'monospace' }}>{deleting.code}</strong>? This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleting(null)} style={{ flex: 1, height: 42, borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', color: '#5B7384', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>Cancel</button>
              <button onClick={() => handleDelete(deleting._id)} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>Delete</button>
            </div>
          </div>
        </>
      )}

      {/* ── Announcement delete confirm ── */}
      {annDeleting && (
        <>
          <div onClick={() => setAnnDeleting(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(9,25,37,0.55)', zIndex: 400 }} />
          <div style={{ position: 'fixed', zIndex: 401, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 380, background: '#fff', borderRadius: 20, padding: 28, textAlign: 'center', fontFamily: "'Poppins',sans-serif", boxShadow: '0 28px 70px rgba(9,25,37,0.20)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <Megaphone size={22} color="#ef4444" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#091925', marginBottom: 8 }}>Delete Announcement?</div>
            <div style={{ fontSize: 13, color: '#5B7384', marginBottom: 22 }}>
              "<strong>{annDeleting.title}</strong>" will be permanently removed.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setAnnDeleting(null)} style={{ flex: 1, height: 42, borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', color: '#5B7384', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>Cancel</button>
              <button onClick={() => handleAnnDelete(annDeleting._id)} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>Delete</button>
            </div>
          </div>
        </>
      )}

      {/* ── Voucher modal ── */}
      {modal && (
        <VoucherModal
          voucher={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { fetchVouchers(); fetchAnnouncements(1); }}
          showToast={showToast}
        />
      )}

      {/* ════════════════════════════════════════════════════════════
          VOUCHERS SECTION
      ════════════════════════════════════════════════════════════ */}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Tag size={22} color="#2EABFE" />
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', margin: 0 }}>Vouchers</h1>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(46,171,254,0.10)', color: '#2EABFE', border: '1px solid rgba(46,171,254,0.22)' }}>
                {total} total
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#5B7384', margin: 0 }}>Create and manage discount voucher codes for students.</p>
            <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12, width: 200 }} />
          </div>
          <button
            onClick={() => setModal('create')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 11, border: 'none', background: '#091925', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", flexShrink: 0 }}
          >
            <Plus size={15} /> Create Voucher
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0 14px', height: 42, flex: 1, maxWidth: 320 }}>
          <Hash size={14} color="#7FA8C4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search voucher code…"
            style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, fontFamily: "'Poppins',sans-serif", color: '#091925' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 12, padding: 4 }}>
          {[['', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatus(val)}
              style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: status === val ? '#fff' : 'transparent', color: status === val ? '#091925' : '#7FA8C4', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", boxShadow: status === val ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchVouchers}
          style={{ width: 42, height: 42, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#7FA8C4' }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Voucher Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#7FA8C4' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#2EABFE', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
            Loading vouchers…
          </div>
        ) : vouchers.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Tag size={36} color="#e2e8f0" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(11,18,32,0.50)', marginBottom: 6 }}>No vouchers found</div>
            <div style={{ fontSize: 13, color: '#7FA8C4', marginBottom: 20 }}>Create your first voucher to get started.</div>
            <button
              onClick={() => setModal('create')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: 'none', background: '#091925', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}
            >
              <Plus size={14} /> Create Voucher
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Code', 'Discount', 'Courses', 'Usage', 'Validity', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '13px 16px', fontSize: 11, fontWeight: 700, color: '#7FA8C4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => {
                const st          = getVoucherStatus(v);
                const courseCount = v.applicable_courses?.length || 0;
                return (
                  <tr
                    key={v._id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Code */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 14, color: '#091925', background: 'rgba(2,8,23,0.05)', padding: '4px 10px', borderRadius: 7, letterSpacing: '0.05em' }}>{v.code}</span>
                        <button onClick={() => copyCode(v.code)} title="Copy" style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#7FA8C4' }}>
                          <Copy size={11} />
                        </button>
                      </div>
                      {v.description && <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 4, fontWeight: 600 }}>{v.description}</div>}
                    </td>

                    {/* Discount */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: v.discount_type === 'percentage' ? 'rgba(46,171,254,0.10)' : 'rgba(16,185,129,0.10)', color: v.discount_type === 'percentage' ? '#2EABFE' : '#10b981', fontWeight: 800, fontSize: 13 }}>
                        {v.discount_type === 'percentage' ? <Percent size={12} /> : <DollarSign size={12} />}
                        {v.discount_type === 'percentage' ? `${v.discount_value}% off` : `$${v.discount_value} off`}
                      </div>
                      {v.min_order_amount > 0 && <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 4 }}>Min: {fmtMoney(v.min_order_amount)}</div>}
                      {v.max_discount     && <div style={{ fontSize: 11, color: '#7FA8C4' }}>Max: {fmtMoney(v.max_discount)}</div>}
                    </td>

                    {/* Courses */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: courseCount === 0 ? 'rgba(16,185,129,0.10)' : 'rgba(46,171,254,0.10)', color: courseCount === 0 ? '#10b981' : '#2EABFE' }}>
                        <BookOpen size={11} />
                        {courseCount === 0 ? 'All courses' : `${courseCount} course${courseCount !== 1 ? 's' : ''}`}
                      </span>
                    </td>

                    {/* Usage */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#091925' }}>
                        {v.used_count} / {v.max_uses ?? '∞'}
                      </div>
                      <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 2 }}>
                        {v.uses_per_user}x per user
                      </div>
                    </td>

                    {/* Validity */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#5B7384' }}>
                        {v.valid_from ? fmtDate(v.valid_from) : 'Anytime'}
                        {' → '}
                        {v.valid_until ? fmtDate(v.valid_until) : 'No expiry'}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setModal(v)} title="Edit" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(46,171,254,0.10)', color: '#2EABFE', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleToggle(v)}
                          title={v.is_active ? 'Deactivate' : 'Activate'}
                          style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: v.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', color: v.is_active ? '#ef4444' : '#10b981', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                        >
                          {v.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                        <button onClick={() => setDeleting(v)} title="Delete" style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          ANNOUNCEMENTS SECTION
      ════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: 44 }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(46,171,254,0.10)', display: 'grid', placeItems: 'center', color: '#2EABFE' }}>
              <Megaphone size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#091925' }}>Active Announcements</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(46,171,254,0.10)', color: '#2EABFE', border: '1px solid rgba(46,171,254,0.22)' }}>
                  {annTotal} total
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#7FA8C4', marginTop: 2 }}>
                Auto-generated when active vouchers are created
              </div>
            </div>
          </div>
          <button
            onClick={() => fetchAnnouncements(1)}
            title="Refresh"
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#7FA8C4' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginBottom: 20, width: 200 }} />

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {annLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#7FA8C4', background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#2EABFE', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
              Loading announcements…
            </div>
          ) : announcements.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Megaphone size={34} color="#e2e8f0" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(11,18,32,0.40)', marginBottom: 4 }}>No active announcements</div>
              <div style={{ fontSize: 12, color: '#7FA8C4' }}>They'll appear here automatically when vouchers are created.</div>
            </div>
          ) : announcements.map(ann => {
            const st         = getAnnStatus(ann);
            const annExpired = ann.expires_at && new Date(ann.expires_at) < new Date();
            const accentColor = ann.is_active && !annExpired ? '#2EABFE' : '#e2e8f0';
            return (
              <div
                key={ann._id}
                style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 16, borderLeft: `4px solid ${accentColor}`, transition: 'box-shadow .15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.07)'}
              >
                {/* Bell icon */}
                <div style={{ width: 40, height: 40, borderRadius: 11, background: ann.is_active && !annExpired ? 'rgba(46,171,254,0.10)' : '#f8fafc', display: 'grid', placeItems: 'center', color: ann.is_active && !annExpired ? '#2EABFE' : '#b0c4ce', flexShrink: 0, marginTop: 2 }}>
                  <Bell size={17} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#091925' }}>{ann.title}</span>
                    {/* Type badge */}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: 'rgba(46,171,254,0.10)', color: '#2EABFE', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {ann.type}
                    </span>
                    {/* Status badge */}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Message */}
                  <div style={{ fontSize: 13, color: '#5B7384', fontWeight: 500, lineHeight: 1.6 }}>{ann.message}</div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 11, color: '#7FA8C4', fontWeight: 600, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>Created: {fmtDate(ann.createdAt)}</span>
                    {ann.expires_at && (
                      <span style={{ color: annExpired ? '#f59e0b' : '#7FA8C4' }}>
                        Expires: {fmtDate(ann.expires_at)}
                      </span>
                    )}
                    {!ann.expires_at && (
                      <span style={{ color: '#10b981' }}>No expiry</span>
                    )}
                    {ann.created_by?.name && (
                      <span>By: {ann.created_by.name}</span>
                    )}
                    {/* Linked voucher pill */}
                    {ann.ref_id?.code && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: 'rgba(2,8,23,0.05)', color: '#5B7384', fontFamily: 'monospace', fontWeight: 800, fontSize: 11 }}>
                        <Tag size={9} /> {ann.ref_id.code}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => handleAnnToggle(ann)}
                    title={ann.is_active ? 'Deactivate' : 'Activate'}
                    style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: ann.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', color: ann.is_active ? '#ef4444' : '#10b981', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                  >
                    {ann.is_active ? <BellOff size={14} /> : <Bell size={14} />}
                  </button>
                  <button
                    onClick={() => setAnnDeleting(ann)}
                    title="Delete"
                    style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {annTotal > ANN_LIMIT && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
            <button
              onClick={() => annPage > 1 && fetchAnnouncements(annPage - 1)}
              disabled={annPage === 1}
              style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: annPage === 1 ? '#d1d5db' : '#5B7384', fontWeight: 700, fontSize: 12, cursor: annPage === 1 ? 'default' : 'pointer', fontFamily: "'Poppins',sans-serif" }}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.ceil(annTotal / ANN_LIMIT) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => fetchAnnouncements(p)}
                style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${annPage === p ? '#2EABFE' : '#e2e8f0'}`, background: annPage === p ? 'rgba(46,171,254,0.08)' : '#fff', color: annPage === p ? '#2EABFE' : '#7FA8C4', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => annPage < Math.ceil(annTotal / ANN_LIMIT) && fetchAnnouncements(annPage + 1)}
              disabled={annPage === Math.ceil(annTotal / ANN_LIMIT)}
              style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid #e2e8f0', background: '#fff', color: annPage === Math.ceil(annTotal / ANN_LIMIT) ? '#d1d5db' : '#5B7384', fontWeight: 700, fontSize: 12, cursor: annPage === Math.ceil(annTotal / ANN_LIMIT) ? 'default' : 'pointer', fontFamily: "'Poppins',sans-serif" }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminVouchers;