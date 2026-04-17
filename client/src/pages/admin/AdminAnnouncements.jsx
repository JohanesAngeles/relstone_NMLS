import { useState, useEffect, useCallback } from 'react';
import {
  Megaphone, Plus, Search, Filter, Trash2, ToggleLeft,
  ToggleRight, ChevronLeft, ChevronRight, AlertCircle,
  CheckCircle, Loader, X, Edit3, Eye, EyeOff, BookOpen,
  Tag, Info, Calendar, Clock, RefreshCw
} from 'lucide-react';
import API from '../../api/axios';

/* ══════════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════════ */
const TYPE_META = {
  new_course: { label: 'New Course', color: '#00B4B4',  bg: 'rgba(0,180,180,0.10)',  icon: <BookOpen size={11} /> },
  voucher:    { label: 'Voucher',    color: '#F59E0B',  bg: 'rgba(245,158,11,0.10)', icon: <Tag size={11} /> },
  general:    { label: 'General',    color: '#2EABFE',  bg: 'rgba(46,171,254,0.10)', icon: <Megaphone size={11} /> },
  system:     { label: 'System',     color: '#8B5CF6',  bg: 'rgba(139,92,246,0.10)', icon: <Info size={11} /> },
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtRelative = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return fmtDate(d);
};

/* ══════════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════════ */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '13px 20px', borderRadius: 14,
      background: toast.type === 'error' ? '#EF4444' : '#091925',
      color: '#fff', fontWeight: 700, fontSize: 13,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      fontFamily: "'Poppins', sans-serif",
      animation: 'slideUp .25s ease',
    }}>
      {toast.type === 'error'
        ? <AlertCircle size={15} />
        : <CheckCircle size={15} color="#00B4B4" />}
      {toast.msg}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
══════════════════════════════════════════════════════════════════ */
const DeleteConfirm = ({ item, onConfirm, onCancel, loading }) => (
  <>
    <div onClick={onCancel} style={M.backdrop} />
    <div style={M.dialog}>
      <div style={{ ...M.dialogIcon, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
        <Trash2 size={22} color="rgba(220,38,38,0.85)" />
      </div>
      <div style={M.dialogTitle}>Delete Announcement?</div>
      <div style={M.dialogSub}>
        "<strong>{item?.title}</strong>" will be permanently removed and cannot be undone.
      </div>
      <div style={M.dialogBtns}>
        <button style={M.cancelBtn} onClick={onCancel} type="button" disabled={loading}>Cancel</button>
        <button style={M.confirmBtn} onClick={onConfirm} type="button" disabled={loading}>
          {loading ? <Loader size={14} className="spin" /> : <Trash2 size={14} />}
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </>
);

/* ══════════════════════════════════════════════════════════════════
   CREATE / EDIT MODAL
══════════════════════════════════════════════════════════════════ */
const AnnouncementModal = ({ item, onClose, onSaved }) => {
  const isEdit = !!item?._id;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title:      item?.title      ?? '',
    message:    item?.message    ?? '',
    type:       item?.type       ?? 'general',
    is_active:  item?.is_active  ?? true,
    expires_at: item?.expires_at ? item.expires_at.slice(0, 10) : '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at || null,
      };
      if (isEdit) {
        await API.patch(`/announcements/${item._id}`, payload);
      } else {
        await API.post('/announcements', payload);
      }
      onSaved(isEdit ? 'Announcement updated.' : 'Announcement created.');
    } catch (err) {
      onSaved(null, err?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={M.backdrop} />
      <div style={{ ...M.dialog, maxWidth: 520, padding: '28px 26px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(0,180,180,0.10)', border: '1px solid rgba(0,180,180,0.22)', display: 'grid', placeItems: 'center', color: '#00B4B4', flexShrink: 0 }}>
            {isEdit ? <Edit3 size={17} /> : <Plus size={17} />}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#091925' }}>
              {isEdit ? 'Edit Announcement' : 'New Announcement'}
            </div>
            <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 1 }}>
              {isEdit ? `Editing: ${item.title}` : 'Post a new announcement to all users'}
            </div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(2,8,23,0.10)', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'rgba(11,18,32,0.50)' }} type="button">
            <X size={14} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MField label="Title *">
            <input style={M.input} placeholder="e.g. New Course Available" value={form.title} onChange={e => set('title', e.target.value)} />
          </MField>
          <MField label="Message *">
            <textarea style={{ ...M.input, minHeight: 88, resize: 'vertical' }} placeholder="Write the announcement message…" value={form.message} onChange={e => set('message', e.target.value)} />
          </MField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MField label="Type">
              <select style={M.input} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="general">General</option>
                <option value="new_course">New Course</option>
                <option value="voucher">Voucher</option>
                <option value="system">System</option>
              </select>
            </MField>
            <MField label="Expires At (optional)">
              <input style={M.input} type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} />
            </MField>
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ accentColor: '#00B4B4', width: 15, height: 15 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(11,18,32,0.72)' }}>Active (visible to users)</span>
          </label>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button style={M.cancelBtn} onClick={onClose} type="button" disabled={saving}>Cancel</button>
          <button
            style={{ ...M.confirmBtn, background: 'linear-gradient(135deg,#00B4B4,#2EABFE)', opacity: (!form.title.trim() || !form.message.trim()) ? 0.45 : 1 }}
            onClick={handleSave}
            type="button"
            disabled={saving || !form.title.trim() || !form.message.trim()}
          >
            {saving ? <Loader size={14} className="spin" /> : (isEdit ? <Edit3 size={14} /> : <Plus size={14} />)}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </>
  );
};

const MField = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(11,18,32,0.50)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{label}</label>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   ANNOUNCEMENT ROW CARD
══════════════════════════════════════════════════════════════════ */
const AnnouncementRow = ({ a, onToggle, onEdit, onDelete }) => {
  const meta = TYPE_META[a.type] ?? TYPE_META.general;
  const expired = a.expires_at && new Date(a.expires_at) < new Date();

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${a.is_active && !expired ? 'rgba(0,180,180,0.18)' : 'rgba(2,8,23,0.08)'}`,
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      transition: 'box-shadow .15s',
      opacity: (!a.is_active || expired) ? 0.72 : 1,
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 18px rgba(2,8,23,0.07)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Type icon */}
      <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.bg, border: `1px solid ${meta.color}28`, display: 'grid', placeItems: 'center', color: meta.color, flexShrink: 0, marginTop: 1 }}>
        <Megaphone size={16} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#091925', lineHeight: 1.3 }}>{a.title}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30`, borderRadius: 999, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {meta.icon} {meta.label}
          </span>
          {!a.is_active && (
            <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.20)', borderRadius: 999, padding: '2px 8px' }}>
              Inactive
            </span>
          )}
          {expired && (
            <span style={{ fontSize: 10, fontWeight: 800, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 999, padding: '2px 8px' }}>
              Expired
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(11,18,32,0.58)', fontWeight: 500, lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {a.message}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7FA8C4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {fmtRelative(a.createdAt)}
          </span>
          {a.expires_at && (
            <span style={{ fontSize: 11, fontWeight: 600, color: expired ? '#EF4444' : '#7FA8C4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} /> Expires {fmtDate(a.expires_at)}
            </span>
          )}
          {a.ref_id?.title && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#00B4B4', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={11} /> {a.ref_id.title}
            </span>
          )}
          {a.ref_id?.code && (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Tag size={11} /> {a.ref_id.code}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <ActionBtn title={a.is_active ? 'Deactivate' : 'Activate'} onClick={() => onToggle(a)}>
          {a.is_active ? <EyeOff size={14} color="#7FA8C4" /> : <Eye size={14} color="#00B4B4" />}
        </ActionBtn>
        <ActionBtn title="Edit" onClick={() => onEdit(a)}>
          <Edit3 size={14} color="#2EABFE" />
        </ActionBtn>
        <ActionBtn title="Delete" onClick={() => onDelete(a)}>
          <Trash2 size={14} color="#EF4444" />
        </ActionBtn>
      </div>
    </div>
  );
};

const ActionBtn = ({ children, title, onClick }) => (
  <button
    title={title}
    type="button"
    onClick={onClick}
    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(2,8,23,0.10)', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
  >
    {children}
  </button>
);

/* ══════════════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════════════ */
const StatCard = ({ label, value, icon, color, bg }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(2,8,23,0.08)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: 'grid', placeItems: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 900, color: '#091925', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#7FA8C4', marginTop: 3 }}>{label}</div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');   // all | active | inactive
  const [typeFilter, setTypeFilter] = useState('all');
  const [toast, setToast]     = useState(null);
  const [modal, setModal]     = useState(null);    // null | { mode: 'create' | 'edit', item }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const LIMIT = 8;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch ── */
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filter !== 'all') params.append('status', filter);
      const res = await API.get(`/announcements?${params}`);
      setAnnouncements(res.data.announcements ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      showToast('Failed to load announcements.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  /* ── Client-side search + type filter ── */
  const visible = announcements.filter(a => {
    const matchSearch = !search
      || a.title.toLowerCase().includes(search.toLowerCase())
      || a.message.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    return matchSearch && matchType;
  });

  /* ── Toggle active ── */
  const handleToggle = async (a) => {
    try {
      await API.patch(`/announcements/${a._id}`, { is_active: !a.is_active });
      setAnnouncements(prev => prev.map(x => x._id === a._id ? { ...x, is_active: !x.is_active } : x));
      showToast(`Announcement ${!a.is_active ? 'activated' : 'deactivated'}.`);
    } catch {
      showToast('Failed to update announcement.', 'error');
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/announcements/${deleteTarget._id}`);
      setDeleteTarget(null);
      showToast('Announcement deleted.');
      fetchAnnouncements();
    } catch {
      showToast('Failed to delete.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── After save ── */
  const handleSaved = (successMsg, errMsg) => {
    setModal(null);
    if (errMsg) { showToast(errMsg, 'error'); return; }
    showToast(successMsg);
    fetchAnnouncements();
  };

  /* ── Stats ── */
  const activeCount   = announcements.filter(a => a.is_active).length;
  const inactiveCount = announcements.filter(a => !a.is_active).length;
  const expiredCount  = announcements.filter(a => a.expires_at && new Date(a.expires_at) < new Date()).length;
  const totalPages    = Math.ceil(total / LIMIT);

  return (
    <div style={P.page}>
      <style>{css}</style>
      <Toast toast={toast} />

      {/* ── Modals ── */}
      {modal && (
        <AnnouncementModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* ── Page Header ── */}
      <div style={P.header}>
        <div>
          <div style={P.headerTitle}>
            <div style={P.headerIcon}><Megaphone size={18} /></div>
            Announcements
          </div>
          <div style={P.headerSub}>Manage system-wide announcements for students and instructors</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={P.refreshBtn} type="button" onClick={fetchAnnouncements} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button style={P.createBtn} type="button" onClick={() => setModal({ mode: 'create', item: null })}>
            <Plus size={15} /> New Announcement
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={P.statsRow}>
        <StatCard label="Total"    value={total}         icon={<Megaphone size={18} />} color="#2EABFE"  bg="rgba(46,171,254,0.10)" />
        <StatCard label="Active"   value={activeCount}   icon={<Eye size={18} />}       color="#00B4B4"  bg="rgba(0,180,180,0.10)"  />
        <StatCard label="Inactive" value={inactiveCount} icon={<EyeOff size={18} />}    color="#7FA8C4"  bg="rgba(127,168,196,0.10)"/>
        <StatCard label="Expired"  value={expiredCount}  icon={<Clock size={18} />}     color="#EF4444"  bg="rgba(239,68,68,0.08)"  />
      </div>

      {/* ── Filters ── */}
      <div style={P.filterRow}>
        {/* Search */}
        <div style={P.searchWrap}>
          <Search size={14} style={{ color: '#7FA8C4', flexShrink: 0 }} />
          <input
            style={P.searchInput}
            placeholder="Search announcements…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7FA8C4', display: 'grid', placeItems: 'center' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div style={P.filterGroup}>
          {['all', 'active', 'inactive'].map(f => (
            <button
              key={f}
              type="button"
              style={{ ...P.filterBtn, ...(filter === f ? P.filterBtnActive : {}) }}
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          style={P.typeSelect}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="general">General</option>
          <option value="new_course">New Course</option>
          <option value="voucher">Voucher</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* ── List ── */}
      <div style={P.list}>
        {loading ? (
          <div style={P.empty}>
            <Loader size={28} className="spin" style={{ color: '#2EABFE' }} />
            <span style={{ color: '#7FA8C4', fontWeight: 600, fontSize: 14 }}>Loading announcements…</span>
          </div>
        ) : visible.length === 0 ? (
          <div style={P.empty}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(46,171,254,0.08)', border: '1px solid rgba(46,171,254,0.15)', display: 'grid', placeItems: 'center' }}>
              <Megaphone size={22} color="#2EABFE" />
            </div>
            <span style={{ color: '#7FA8C4', fontWeight: 700, fontSize: 14 }}>
              {search ? 'No announcements match your search.' : 'No announcements yet.'}
            </span>
            {!search && (
              <button style={P.createBtn} type="button" onClick={() => setModal({ mode: 'create', item: null })}>
                <Plus size={14} /> Create First Announcement
              </button>
            )}
          </div>
        ) : (
          visible.map(a => (
            <AnnouncementRow
              key={a._id}
              a={a}
              onToggle={handleToggle}
              onEdit={(a) => setModal({ mode: 'edit', item: a })}
              onDelete={setDeleteTarget}
            />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && !loading && (
        <div style={P.pagination}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7FA8C4' }}>
            Page {page} of {totalPages} · {total} total
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              style={{ ...P.pageBtn, opacity: page <= 1 ? 0.38 : 1 }}
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              type="button"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              style={{ ...P.pageBtn, opacity: page >= totalPages ? 0.38 : 1 }}
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              type="button"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MODAL STYLES
══════════════════════════════════════════════════════════════════ */
const M = {
  backdrop:   { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)' },
  dialog:     { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 380, background: '#fff', borderRadius: 22, padding: '32px 28px 26px', boxShadow: '0 28px 70px rgba(9,25,37,0.20)', textAlign: 'center', fontFamily: "'Poppins', sans-serif" },
  dialogIcon: { width: 52, height: 52, borderRadius: 16, display: 'grid', placeItems: 'center', margin: '0 auto 16px' },
  dialogTitle:{ fontSize: 18, fontWeight: 700, color: 'rgba(11,18,32,0.88)', marginBottom: 8 },
  dialogSub:  { fontSize: 13, color: 'rgba(11,18,32,0.52)', marginBottom: 24 },
  dialogBtns: { display: 'flex', gap: 10 },
  cancelBtn:  { flex: 1, height: 44, background: 'rgba(2,8,23,0.04)', border: '1px solid rgba(2,8,23,0.10)', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'rgba(11,18,32,0.72)', fontFamily: 'inherit' },
  confirmBtn: { flex: 1, height: 44, background: 'rgba(220,38,38,0.90)', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 },
  input:      { width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid rgba(2,8,23,0.12)', background: '#fff', fontSize: 13, fontWeight: 600, color: 'rgba(11,18,32,0.85)', outline: 'none', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box' },
};

/* ══════════════════════════════════════════════════════════════════
   PAGE STYLES
══════════════════════════════════════════════════════════════════ */
const P = {
  page:        { padding: '28px 0 60px', fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column', gap: 20 },
  header:      { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  headerTitle: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, fontWeight: 900, color: '#091925' },
  headerIcon:  { width: 42, height: 42, borderRadius: 12, background: 'rgba(0,180,180,0.10)', border: '1px solid rgba(0,180,180,0.22)', display: 'grid', placeItems: 'center', color: '#00B4B4', flexShrink: 0 },
  headerSub:   { fontSize: 13, color: '#7FA8C4', fontWeight: 500, marginTop: 4, paddingLeft: 54 },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  filterRow:   { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  searchWrap:  { flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid rgba(2,8,23,0.10)', borderRadius: 10, padding: '0 12px', height: 40 },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 13, fontWeight: 600, color: '#091925', fontFamily: "'Poppins', sans-serif", background: 'transparent' },
  filterGroup: { display: 'flex', gap: 4, background: 'rgba(2,8,23,0.04)', borderRadius: 10, padding: 4 },
  filterBtn:   { height: 32, padding: '0 14px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#7FA8C4', fontFamily: "'Poppins', sans-serif" },
  filterBtnActive: { background: '#fff', color: '#091925', boxShadow: '0 1px 4px rgba(2,8,23,0.10)' },
  typeSelect:  { height: 40, padding: '0 12px', borderRadius: 10, border: '1.5px solid rgba(2,8,23,0.10)', background: '#fff', fontSize: 12, fontWeight: 700, color: '#091925', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", outline: 'none' },
  list:        { display: 'flex', flexDirection: 'column', gap: 10 },
  empty:       { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '60px 20px', background: '#fff', borderRadius: 16, border: '1px dashed rgba(2,8,23,0.12)' },
  pagination:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#fff', borderRadius: 12, border: '1px solid rgba(2,8,23,0.08)' },
  pageBtn:     { width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(2,8,23,0.12)', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#091925' },
  createBtn:   { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#00B4B4,#2EABFE)', color: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 13, fontFamily: "'Poppins', sans-serif", boxShadow: '0 4px 14px rgba(0,180,180,0.28)' },
  refreshBtn:  { width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(2,8,23,0.10)', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#7FA8C4' },
};

/* ══════════════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════════════ */
const css = `
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr 1fr !important; }
}
`;