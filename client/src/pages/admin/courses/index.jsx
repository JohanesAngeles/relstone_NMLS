import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Eye, Power, Wrench,
  ChevronLeft, ChevronRight, X, AlertTriangle,
  CheckSquare, Square, Minus, Download, FileText,
  ChevronDown, ChevronUp, BookOpen, Users, Clock,
  DollarSign, Activity, WrenchIcon, TrendingUp,
} from 'lucide-react';
import API from '../../../api/axios';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRM MODAL
═══════════════════════════════════════════════════════════════════════════ */
const ConfirmModal = ({ open, title, description, confirmLabel, confirmColor, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(9,25,37,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .15s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '32px 36px',
        width: 420, boxShadow: '0 24px 64px rgba(9,25,37,0.18)',
        animation: 'slideUp .2s cubic-bezier(.34,1.56,.64,1)',
        fontFamily: "'Poppins', sans-serif",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, marginBottom: 20,
          background: confirmColor === '#ef4444' ? 'rgba(239,68,68,0.1)' : confirmColor === '#10b981' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
          display: 'grid', placeItems: 'center',
        }}>
          <AlertTriangle size={24} color={confirmColor} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#091925', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: '#5B7384', lineHeight: 1.65, marginBottom: 28 }}>{description}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 42, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#5B7384', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: confirmColor, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════════════════ */
const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
    background: type === 'success' ? '#10b981' : '#ef4444',
    color: '#fff', borderRadius: 12, padding: '12px 20px',
    fontSize: 13.5, fontWeight: 600, fontFamily: "'Poppins', sans-serif",
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    animation: 'slideUp .25s cubic-bezier(.34,1.56,.64,1)',
  }}>
    {message}
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
      <X size={14} />
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════════════════════ */
const StatCard = ({ label, value, icon, color, bg, onClick, active }) => (
  <button onClick={onClick} style={{
    flex: 1, minWidth: 140, background: active ? color + '12' : '#fff',
    border: `1.5px solid ${active ? color : '#e2e8f0'}`,
    borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 14,
    transition: 'all .18s', textAlign: 'left', fontFamily: "'Poppins', sans-serif",
    boxShadow: active ? `0 0 0 3px ${color}22` : '0 1px 4px rgba(0,0,0,0.04)',
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = color; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = '#e2e8f0'; }}
  >
    <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#091925', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#7FA8C4', fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT DROPDOWN
═══════════════════════════════════════════════════════════════════════════ */
const ExportDropdown = ({ onExportCSV, onExportExcel }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        height: 42, padding: '0 16px', borderRadius: 10,
        border: '1.5px solid #e2e8f0', background: '#fff',
        color: '#091925', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
        transition: 'all .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#2EABFE'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = '#e2e8f0'; }}
      >
        <Download size={14} color="#2EABFE" />
        Export
        <ChevronDown size={13} color="#94a3b8" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
          background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(9,25,37,0.12)',
          border: '1px solid #e2e8f0', overflow: 'hidden', minWidth: 180,
          animation: 'slideUp .15s ease',
        }}>
          {[
            { label: 'Export as CSV', sub: 'Comma-separated values', icon: <FileText size={15} color="#2EABFE" />, action: onExportCSV },
            { label: 'Export as Excel', sub: 'Microsoft Excel (.xlsx)', icon: <FileText size={15} color="#10b981" />, action: onExportExcel },
          ].map((item, i) => (
            <button key={i} onClick={() => { item.action(); setOpen(false); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', border: 'none', background: 'none',
              cursor: 'pointer', fontFamily: "'Poppins', sans-serif", textAlign: 'left',
              borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none',
              transition: 'background .12s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {item.icon}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#091925' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   EXPANDED ROW
═══════════════════════════════════════════════════════════════════════════ */
const ExpandedRow = ({ course }) => (
  <tr style={{ background: 'linear-gradient(to bottom, #f8fafc, #fff)' }}>
    <td colSpan={8} style={{ padding: '0 16px 20px 52px', borderBottom: '2px solid #e2e8f0' }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 16 }}>

        {/* Description */}
        <div style={{ flex: 2, minWidth: 240 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Description</div>
          <p style={{ fontSize: 13, color: '#5B7384', lineHeight: 1.7, margin: 0 }}>
            {course.description || 'No description available for this course.'}
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {[
            { label: 'Enrolled', value: course.enrolled_count ?? '—', icon: <Users size={13} />, color: '#2EABFE' },
            { label: 'Completions', value: course.completion_count ?? '—', icon: <TrendingUp size={13} />, color: '#10b981' },
            { label: 'Credit Hours', value: `${course.credit_hours}h`, icon: <Clock size={13} />, color: '#8b5cf6' },
            { label: 'Price', value: `$${course.price}`, icon: <DollarSign size={13} />, color: '#d97706' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12,
              padding: '12px 18px', minWidth: 110, textAlign: 'center',
            }}>
              <div style={{ color: s.color, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#091925' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div style={{ minWidth: 180 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>Course Info</div>
          {[
            { label: 'NMLS ID', value: course.nmls_course_id },
            { label: 'Type', value: course.type },
            { label: 'Status', value: course.is_active ? 'Active' : 'Inactive' },
            { label: 'Maintenance', value: course.is_under_maintenance ? 'Yes' : 'No' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 12.5, marginBottom: 6 }}>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>{m.label}</span>
              <span style={{ color: '#091925', fontWeight: 600 }}>{m.value}</span>
            </div>
          ))}
        </div>

      </div>
    </td>
  </tr>
);

/* ═══════════════════════════════════════════════════════════════════════════
   BULK ACTION BAR
═══════════════════════════════════════════════════════════════════════════ */
const BulkBar = ({ count, onActivate, onDeactivate, onClear }) => (
  <div style={{
    position: 'sticky', top: 16, zIndex: 40,
    background: '#091925', borderRadius: 14, padding: '12px 20px',
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16,
    boxShadow: '0 8px 32px rgba(9,25,37,0.25)',
    animation: 'slideDown .2s cubic-bezier(.34,1.56,.64,1)',
    fontFamily: "'Poppins', sans-serif",
  }}>
    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', flex: 1 }}>
      {count} course{count !== 1 ? 's' : ''} selected
    </span>
    <BulkBtn label="Activate" color="#10b981" onClick={onActivate} />
    <BulkBtn label="Deactivate" color="#ef4444" onClick={onDeactivate} />
    <button onClick={onClear} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#94a3b8', transition: 'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
      <X size={15} />
    </button>
  </div>
);

const BulkBtn = ({ label, color, onClick }) => (
  <button onClick={onClick} style={{
    height: 34, padding: '0 16px', borderRadius: 8, border: 'none',
    background: color, color: '#fff', fontSize: 12.5, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif", transition: 'opacity .15s',
  }}
    onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
    {label}
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const AdminCourses = () => {
  const navigate = useNavigate();

  // Data
  const [courses, setCourses]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats]           = useState({ total: 0, active: 0, inactive: 0, maintenance: 0 });

  // UI
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [type, setType]             = useState('');
  const [status, setStatus]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);
  const [modal, setModal]           = useState(null);

  // New features
  const [selected, setSelected]     = useState(new Set());
  const [expanded, setExpanded]     = useState(new Set());
  const [bulkModal, setBulkModal]   = useState(null); // { action: 'activate'|'deactivate' }
  const [exporting, setExporting]   = useState(false);

  /* ── Helpers ── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch ── */
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/courses', {
        params: { search, type, status, page, limit: 10 },
      });
      setCourses(res.data.courses);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      // Expect stats in response or compute from all courses
      if (res.data.stats) {
        setStats(res.data.stats);
      } else {
        // Fallback: derive from current page (server should ideally send global stats)
        setStats(s => ({ ...s, total: res.data.total }));
      }
    } catch {
      showToast('Failed to load courses.', 'error');
    } finally {
      setLoading(false);
      setSelected(new Set());
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/courses/stats');
      setStats(res.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchCourses(); fetchStats(); }, [search, type, status, page]);

  /* ── Selection ── */
  const allIds        = courses.map(c => c._id);
  const allSelected   = allIds.length > 0 && allIds.every(id => selected.has(id));
  const someSelected  = allIds.some(id => selected.has(id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); allIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelected(prev => new Set([...prev, ...allIds]));
    }
  };

  const toggleOne = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  /* ── Expand ── */
  const toggleExpand = (id) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  /* ── Single toggle modals ── */
  const openStatusModal       = (id, is_active, e)           => { e.stopPropagation(); setModal({ id, mode: 'status', current: is_active }); };
  const openMaintenanceModal  = (id, is_under_maintenance, e) => { e.stopPropagation(); setModal({ id, mode: 'maintenance', current: is_under_maintenance }); };

  const handleConfirm = async () => {
    if (!modal) return;
    const { id, mode } = modal;
    setModal(null);
    try {
      if (mode === 'status') {
        const res = await API.patch(`/admin/courses/${id}/toggle-status`);
        setCourses(prev => prev.map(c => c._id === id ? { ...c, is_active: res.data.is_active } : c));
        showToast(`Course ${res.data.is_active ? 'activated' : 'deactivated'} successfully.`);
        fetchStats();
      } else {
        const res = await API.patch(`/admin/courses/${id}/toggle-maintenance`);
        setCourses(prev => prev.map(c => c._id === id ? { ...c, is_under_maintenance: res.data.is_under_maintenance } : c));
        showToast(`Maintenance mode ${res.data.is_under_maintenance ? 'enabled' : 'disabled'}.`);
        fetchStats();
      }
    } catch {
      showToast('Action failed. Please try again.', 'error');
    }
  };

  /* ── Bulk actions ── */
  const handleBulkConfirm = async () => {
    if (!bulkModal) return;
    const action = bulkModal.action;
    const ids    = [...selected];
    setBulkModal(null);
    try {
      await API.patch('/admin/courses/bulk-status', { ids, is_active: action === 'activate' });
      setCourses(prev => prev.map(c => ids.includes(c._id) ? { ...c, is_active: action === 'activate' } : c));
      setSelected(new Set());
      showToast(`${ids.length} course${ids.length !== 1 ? 's' : ''} ${action === 'activate' ? 'activated' : 'deactivated'}.`);
      fetchStats();
    } catch {
      showToast('Bulk action failed. Please try again.', 'error');
    }
  };

  /* ── Export ── */
  const buildExportRows = async () => {
    // Fetch all filtered records for export (no pagination limit)
    try {
      const res = await API.get('/admin/courses', {
        params: { search, type, status, page: 1, limit: 10000 },
      });
      return res.data.courses;
    } catch {
      return courses; // fallback to current page
    }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const rows = await buildExportRows();
      const headers = ['Title', 'NMLS ID', 'Type', 'Credit Hours', 'Price', 'Status', 'Maintenance'];
      const csvRows = [
        headers.join(','),
        ...rows.map(c => [
          `"${c.title.replace(/"/g, '""')}"`,
          c.nmls_course_id,
          c.type,
          c.credit_hours,
          c.price,
          c.is_active ? 'Active' : 'Inactive',
          c.is_under_maintenance ? 'Yes' : 'No',
        ].join(',')),
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `courses-export-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${rows.length} courses as CSV.`);
    } catch {
      showToast('Export failed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const rows = await buildExportRows();
      // Build a simple XML-based Excel file (works without xlsx library)
      const headers = ['Title', 'NMLS ID', 'Type', 'Credit Hours', 'Price', 'Status', 'Maintenance'];
      const xmlRows = rows.map(c => `
        <Row>
          <Cell><Data ss:Type="String">${c.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</Data></Cell>
          <Cell><Data ss:Type="Number">${c.nmls_course_id}</Data></Cell>
          <Cell><Data ss:Type="String">${c.type}</Data></Cell>
          <Cell><Data ss:Type="Number">${c.credit_hours}</Data></Cell>
          <Cell><Data ss:Type="Number">${c.price}</Data></Cell>
          <Cell><Data ss:Type="String">${c.is_active ? 'Active' : 'Inactive'}</Data></Cell>
          <Cell><Data ss:Type="String">${c.is_under_maintenance ? 'Yes' : 'No'}</Data></Cell>
        </Row>`).join('');

      const headerRow = `<Row>${headers.map(h => `<Cell ss:StyleID="header"><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>`;

      const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#EBF4FF" ss:Pattern="Solid"/></Style>
 </Styles>
 <Worksheet ss:Name="Courses">
  <Table>${headerRow}${xmlRows}</Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `courses-export-${new Date().toISOString().slice(0,10)}.xls`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${rows.length} courses as Excel.`);
    } catch {
      showToast('Export failed.', 'error');
    } finally {
      setExporting(false);
    }
  };

  /* ── Modal config ── */
  const modalConfig = modal ? (
    modal.mode === 'status' ? {
      title: modal.current ? 'Deactivate Course?' : 'Activate Course?',
      description: modal.current
        ? 'This course will be hidden from students and unavailable for enrollment.'
        : 'This course will become visible and available for enrollment.',
      confirmLabel: modal.current ? 'Deactivate' : 'Activate',
      confirmColor: modal.current ? '#ef4444' : '#10b981',
    } : {
      title: modal.current ? 'Disable Maintenance Mode?' : 'Enable Maintenance Mode?',
      description: modal.current
        ? 'Students will regain access to this course immediately.'
        : 'Students will not be able to access this course while it is under maintenance.',
      confirmLabel: modal.current ? 'Disable Maintenance' : 'Enable Maintenance',
      confirmColor: '#d97706',
    }
  ) : {};

  const bulkModalConfig = bulkModal ? {
    title: bulkModal.action === 'activate'
      ? `Activate ${selected.size} Course${selected.size !== 1 ? 's' : ''}?`
      : `Deactivate ${selected.size} Course${selected.size !== 1 ? 's' : ''}?`,
    description: bulkModal.action === 'activate'
      ? 'All selected courses will become visible and available for enrollment.'
      : 'All selected courses will be hidden from students.',
    confirmLabel: bulkModal.action === 'activate' ? 'Activate All' : 'Deactivate All',
    confirmColor: bulkModal.action === 'activate' ? '#10b981' : '#ef4444',
  } : {};

  /* ── Stat card filter ── */
  const handleStatClick = (filterVal) => {
    setStatus(prev => prev === filterVal ? '' : filterVal);
    setPage(1);
  };

  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Courses</h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>Manage and view all NMLS courses.</p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      {/* ══════════════════════════════════════════════════
          QUICK STATS BAR
      ══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard
          label="Total Courses"
          value={stats.total || total}
          icon={<BookOpen size={18} color="#2EABFE" />}
          color="#2EABFE"
          bg="rgba(46,171,254,0.1)"
          onClick={() => { setStatus(''); setPage(1); }}
          active={status === ''}
        />
        <StatCard
          label="Active"
          value={stats.active ?? '—'}
          icon={<Activity size={18} color="#10b981" />}
          color="#10b981"
          bg="rgba(16,185,129,0.1)"
          onClick={() => handleStatClick('active')}
          active={status === 'active'}
        />
        <StatCard
          label="Inactive"
          value={stats.inactive ?? '—'}
          icon={<Power size={18} color="#ef4444" />}
          color="#ef4444"
          bg="rgba(239,68,68,0.1)"
          onClick={() => handleStatClick('inactive')}
          active={status === 'inactive'}
        />
        <StatCard
          label="Maintenance"
          value={stats.maintenance ?? '—'}
          icon={<WrenchIcon size={18} color="#d97706" />}
          color="#d97706"
          bg="rgba(245,158,11,0.1)"
          onClick={() => handleStatClick('maintenance')}
          active={status === 'maintenance'}
        />
      </div>

      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          onActivate={() => setBulkModal({ action: 'activate' })}
          onDeactivate={() => setBulkModal({ action: 'deactivate' })}
          onClear={() => setSelected(new Set())}
        />
      )}

      {/* ── Filters row ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1.5px solid #e2e8f0',
          borderRadius: 10, padding: '0 14px', height: 42, flex: 1, maxWidth: 360,
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = '#2EABFE'}
          onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <Search size={15} color="#7FA8C4" />
          <input placeholder="Search by title or NMLS ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, fontFamily: "'Poppins', sans-serif", color: '#091925' }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0 14px', height: 42 }}>
          <SlidersHorizontal size={14} color="#7FA8C4" />
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif", color: type ? '#091925' : '#7FA8C4', background: 'transparent', cursor: 'pointer' }}>
            <option value="">All Types</option>
            <option value="PE">PE</option>
            <option value="CE">CE</option>
          </select>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '0 14px', height: 42 }}>
          <SlidersHorizontal size={14} color="#7FA8C4" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: "'Poppins', sans-serif", color: status ? '#091925' : '#7FA8C4', background: 'transparent', cursor: 'pointer' }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Spacer */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#f1f5f9', borderRadius: 8, padding: '6px 14px', fontSize: 12.5, color: '#5B7384', fontWeight: 600 }}>
            {total} course{total !== 1 ? 's' : ''}
          </div>

          {/* Export */}
          <ExportDropdown onExportCSV={exportCSV} onExportExcel={exportExcel} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          TABLE
      ══════════════════════════════════════════════════ */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
              {/* Checkbox column */}
              <th style={{ ...th, width: 44, textAlign: 'center', paddingRight: 0 }}>
                <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: allSelected ? '#2EABFE' : someSelected ? '#2EABFE' : '#cbd5e1' }}>
                  {allSelected ? <CheckSquare size={16} /> : someSelected ? <Minus size={16} /> : <Square size={16} />}
                </button>
              </th>
              {/* Expand column */}
              <th style={{ ...th, width: 36, paddingLeft: 4, paddingRight: 4 }} />
              <th style={th}>Title</th>
              <th style={th}>NMLS ID</th>
              <th style={th}>Type</th>
              <th style={th}>Credit Hours</th>
              <th style={th}>Price</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} style={{ padding: '16px' }}>
                      <div style={{ height: 13, borderRadius: 6, background: '#f1f5f9', width: j === 2 ? '75%' : '50%', animation: 'pulse 1.4s ease infinite', animationDelay: `${i * 0.06}s` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '52px 32px' }}>
                  <div style={{ color: '#c4d4df', marginBottom: 10 }}><Search size={38} /></div>
                  <p style={{ fontSize: 14, color: '#7FA8C4', fontWeight: 600, marginBottom: 4 }}>No courses found</p>
                  <p style={{ fontSize: 12.5, color: '#94a3b8' }}>Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : courses.map((c) => {
              const isSelected = selected.has(c._id);
              const isExpanded = expanded.has(c._id);
              return (
                <>
                  <tr key={c._id}
                    style={{
                      borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                      transition: 'background .12s',
                      background: isSelected ? 'rgba(46,171,254,0.04)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #2EABFE' : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#fbfcfe'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Checkbox */}
                    <td style={{ ...td, textAlign: 'center', paddingRight: 0, width: 44 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleOne(c._id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: isSelected ? '#2EABFE' : '#cbd5e1', transition: 'color .15s' }}
                      >
                        {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>
                    </td>

                    {/* Expand toggle */}
                    <td style={{ ...td, paddingLeft: 4, paddingRight: 4, width: 36 }}>
                      <button
                        onClick={() => toggleExpand(c._id)}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', color: isExpanded ? '#2EABFE' : '#cbd5e1', transition: 'color .15s, transform .2s', transform: isExpanded ? 'rotate(0deg)' : 'none' }}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </td>

                    {/* Title */}
                    <td style={{ ...td, maxWidth: 260 }}>
                      <div style={{ fontWeight: 700, color: '#091925', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                        {c.title}
                      </div>
                    </td>

                    {/* NMLS */}
                    <td style={{ ...td, color: '#94a3b8', fontFamily: 'monospace', fontSize: 12.5 }}>{c.nmls_course_id}</td>

                    {/* Type */}
                    <td style={td}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '.3px',
                        background: c.type === 'PE' ? 'rgba(139,92,246,0.1)' : 'rgba(46,171,254,0.1)',
                        color: c.type === 'PE' ? '#8b5cf6' : '#2EABFE',
                      }}>{c.type}</span>
                    </td>

                    {/* Credit Hours */}
                    <td style={{ ...td, color: '#5B7384' }}>{c.credit_hours}h</td>

                    {/* Price */}
                    <td style={{ ...td, fontWeight: 700, color: '#091925' }}>${c.price}</td>

                    {/* Status */}
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                          background: c.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
                          color: c.is_active ? '#10b981' : '#ef4444',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {c.is_under_maintenance && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Wrench size={10} /> Maintenance
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ ...td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <ActionBtn icon={<Eye size={14} />} label="View details" color="#2EABFE" onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses/${c._id}`); }} />
                        <ActionBtn icon={<Power size={14} />} label={c.is_active ? 'Deactivate' : 'Activate'} color={c.is_active ? '#ef4444' : '#10b981'} onClick={(e) => openStatusModal(c._id, c.is_active, e)} />
                        <ActionBtn icon={<Wrench size={14} />} label={c.is_under_maintenance ? 'Disable maintenance' : 'Enable maintenance'} color={c.is_under_maintenance ? '#d97706' : '#94a3b8'} onClick={(e) => openMaintenanceModal(c._id, c.is_under_maintenance, e)} />
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isExpanded && <ExpandedRow key={`exp-${c._id}`} course={c} />}
                </>
              );
            })}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
            <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={15} /></PagBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
              const isActive = p === page;
              const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
              const isEllipsis = !show && (p === 2 || p === totalPages - 1);
              if (!show && !isEllipsis) return null;
              if (isEllipsis) return <span key={p} style={{ color: '#94a3b8', fontSize: 13 }}>…</span>;
              return (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 34, height: 34, borderRadius: 8, border: 'none',
                  background: isActive ? '#2EABFE' : '#f8fafc',
                  color: isActive ? '#fff' : '#5B7384',
                  fontWeight: isActive ? 700 : 500, fontSize: 13, cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif", transition: 'all .15s',
                  boxShadow: isActive ? '0 2px 8px rgba(46,171,254,0.3)' : 'none',
                }}>{p}</button>
              );
            })}
            <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={15} /></PagBtn>
          </div>
        )}
      </div>

      {/* ── Single-item confirm modal ── */}
      <ConfirmModal open={!!modal} {...modalConfig} onConfirm={handleConfirm} onCancel={() => setModal(null)} />

      {/* ── Bulk confirm modal ── */}
      <ConfirmModal open={!!bulkModal} {...bulkModalConfig} onConfirm={handleBulkConfirm} onCancel={() => setBulkModal(null)} />

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Export loading overlay ── */}
      {exporting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(9,25,37,0.3)', backdropFilter: 'blur(2px)', display: 'grid', placeItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px 36px', fontSize: 14, fontWeight: 600, color: '#091925', fontFamily: "'Poppins',sans-serif", display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 16px 48px rgba(9,25,37,0.18)' }}>
            <div style={{ width: 20, height: 20, border: '3px solid #e2e8f0', borderTopColor: '#2EABFE', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            Preparing export…
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideDown{ from{transform:translateY(-12px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
};

/* ─── Tiny helpers ─────────────────────────────────────────────────────── */
const ActionBtn = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} title={label} aria-label={label} style={{
    width: 32, height: 32, borderRadius: 8, border: 'none',
    background: `${color}16`, color, cursor: 'pointer',
    display: 'grid', placeItems: 'center', transition: 'background .15s, transform .1s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}28`; e.currentTarget.style.transform = 'scale(1.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = `${color}16`; e.currentTarget.style.transform = 'scale(1)'; }}>
    {icon}
  </button>
);

const PagBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e2e8f0',
    background: '#fff', color: disabled ? '#c4d4df' : '#5B7384',
    cursor: disabled ? 'default' : 'pointer', display: 'grid', placeItems: 'center',
    transition: 'all .15s', fontFamily: "'Poppins', sans-serif",
  }}>
    {children}
  </button>
);

const th = { textAlign: 'left', padding: '13px 16px', fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px' };
const td = { padding: '14px 16px', color: '#091925', fontWeight: 500, verticalAlign: 'middle' };

export default AdminCourses;