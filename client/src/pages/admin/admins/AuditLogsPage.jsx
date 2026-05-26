import { useState, useEffect, useCallback } from 'react';
import API from '../../../api/axios';

// ── Color palette matching your admin layout ──────────────────────────────────
const NAVY   = '#0B1F3A';
const GOLD   = '#C9A84C';
const PURPLE = '#7C3AED';

// ── Action color coding ────────────────────────────────────────────────────────
function actionMeta(action = '') {
  const a = action.toUpperCase();
  if (a.includes('LOGIN') || a.includes('AUTH'))
    return { color: '#0D6EFD', bg: '#EFF6FF', icon: '🔐' };
  if (a.includes('DELETE') || a.includes('REMOVE'))
    return { color: '#DC3545', bg: '#FFF5F5', icon: '🗑️' };
  if (a.includes('CREATE') || a.includes('ADD') || a.includes('ENROLL'))
    return { color: '#198754', bg: '#F0FDF4', icon: '✅' };
  if (a.includes('UPDATE') || a.includes('EDIT') || a.includes('CHANGE'))
    return { color: '#C9A84C', bg: '#FFFBEB', icon: '✏️' };
  if (a.includes('EXPORT') || a.includes('DOWNLOAD'))
    return { color: '#7C3AED', bg: '#F5F3FF', icon: '📤' };
  if (a.includes('SETTING') || a.includes('CONFIG'))
    return { color: '#0E9F8E', bg: '#F0FDFA', icon: '⚙️' };
  return { color: '#6C757D', bg: '#F8F9FA', icon: '📋' };
}

function roleMeta(role = '') {
  if (role === 'super_admin') return { label: 'Super Admin', color: '#7C3AED', bg: '#F5F3FF' };
  if (role === 'admin')       return { label: 'Admin',       color: '#0B1F3A', bg: '#E8EDF3' };
  if (role === 'instructor')  return { label: 'Instructor',  color: '#0D6EFD', bg: '#EFF6FF' };
  return { label: role || 'N/A', color: '#6C757D', bg: '#F8F9FA' };
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AuditLogsPage() {
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [expanded,   setExpanded]   = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search)     params.set('search',  search);
      if (roleFilter) params.set('role',    roleFilter);
      const res = await API.get(`/admin/logs?${params}`);
      setLogs(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      setError('Failed to load audit logs. Make sure the route is registered in app.js.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const LIMIT = 20;
  const startRow = (page - 1) * LIMIT + 1;
  const endRow   = Math.min(page * LIMIT, total);

  return (
    <div style={{ padding: '28px 32px', fontFamily: 'Source Sans 3, sans-serif', minHeight: '100vh', background: '#F1F3F5' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${NAVY}`, border: `1px solid ${GOLD}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 20 }}>📋</span>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NAVY, fontFamily: 'Playfair Display, serif' }}>
              System Activity Logs
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6C757D' }}>
              {loading ? 'Loading…' : `${total.toLocaleString()} total events recorded`}
            </p>
          </div>
        </div>
        <button onClick={fetchLogs} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 8,
          border: '1px solid #E9ECEF', background: '#fff',
          fontSize: 13, fontWeight: 600, color: NAVY, cursor: 'pointer',
        }}>
          <span style={{ fontSize: 14 }}>↻</span> Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '14px 18px',
        border: '1px solid #E9ECEF', marginBottom: 18,
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#ADB5BD' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, action, or details…"
            style={{
              width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8,
              border: '1px solid #DEE2E6', fontSize: 13, outline: 'none',
              fontFamily: 'Source Sans 3, sans-serif', boxSizing: 'border-box',
              color: NAVY,
            }}
          />
        </div>
        {['', 'super_admin', 'admin', 'instructor'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            border: `1px solid ${roleFilter === r ? PURPLE : '#DEE2E6'}`,
            background: roleFilter === r ? PURPLE : '#fff',
            color: roleFilter === r ? '#fff' : '#6C757D',
          }}>
            {r === '' ? 'All Roles' : r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 10,
          padding: '14px 18px', marginBottom: 16, color: '#DC3545', fontSize: 13,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{error}</div>
            <div style={{ color: '#6C757D', fontSize: 12 }}>
              Add this to your <code>app.js</code>:{' '}
              <code style={{ background: '#F1F3F5', padding: '2px 6px', borderRadius: 4 }}>
                app.use('/api/admin/logs', authMiddleware, require('./routes/admin/logs'));
              </code>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div style={{
        background: '#fff', borderRadius: 14,
        border: '1px solid #E9ECEF',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '190px 1fr 120px 160px 1fr 36px',
          gap: 0, padding: '10px 18px',
          background: '#F8F9FA', borderBottom: '1px solid #E9ECEF',
        }}>
          {['Date & Time', 'User', 'Role', 'Action', 'Details', ''].map((h, i) => (
            <div key={i} style={{
              fontSize: 10, fontWeight: 800, color: '#ADB5BD',
              letterSpacing: '0.6px', textTransform: 'uppercase',
              padding: '0 6px',
            }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `3px solid ${PURPLE}`, borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
            }} />
            <p style={{ color: '#6C757D', fontSize: 14, margin: 0 }}>Loading audit logs…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>No logs found</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6C757D' }}>
              {search || roleFilter
                ? 'Try adjusting your filters'
                : 'No activity has been recorded yet'}
            </p>
          </div>
        ) : (
          logs.map((log, idx) => {
            const act  = actionMeta(log.action);
            const role = roleMeta(log.user?.role);
            const isExp = expanded === log._id;

            return (
              <div key={log._id} style={{ borderBottom: idx < logs.length - 1 ? '1px solid #F1F3F5' : 'none' }}>
                <div
                  onClick={() => setExpanded(isExp ? null : log._id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '190px 1fr 120px 160px 1fr 36px',
                    gap: 0, padding: '13px 18px',
                    alignItems: 'center', cursor: 'pointer',
                    background: isExp ? '#FAFBFF' : idx % 2 === 0 ? '#fff' : '#FAFAFA',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = '#F8F9FF'; }}
                  onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFAFA'; }}
                >
                  {/* Date */}
                  <div style={{ padding: '0 6px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>
                      {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 11, color: '#ADB5BD', marginTop: 1 }}>
                      {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                  </div>

                  {/* User */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 6px' }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      background: `${NAVY}15`, border: `1px solid ${NAVY}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: NAVY,
                    }}>
                      {initials(log.user?.name || 'System')}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NAVY,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.user?.name || 'System'}
                      </div>
                      <div style={{ fontSize: 11, color: '#ADB5BD',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.user?.email || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div style={{ padding: '0 6px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                      color: role.color, background: role.bg,
                    }}>
                      {role.label}
                    </span>
                  </div>

                  {/* Action */}
                  <div style={{ padding: '0 6px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                      color: act.color, background: act.bg,
                    }}>
                      <span>{act.icon}</span>
                      <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.action}
                      </span>
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ padding: '0 6px', fontSize: 13, color: '#6C757D',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.details || <span style={{ color: '#ADB5BD' }}>—</span>}
                  </div>

                  {/* Expand */}
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#ADB5BD',
                    transition: 'transform 0.2s', transform: isExp ? 'rotate(180deg)' : 'none' }}>
                    ▼
                  </div>
                </div>

                {/* Expanded row */}
                {isExp && (
                  <div style={{
                    padding: '12px 24px 16px', background: '#F8F9FF',
                    borderTop: '1px solid #E9ECEF',
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
                  }}>
                    {[
                      { label: 'Full Timestamp', value: fmtDate(log.createdAt) },
                      { label: 'Target Model',   value: log.targetModel || '—' },
                      { label: 'Target ID',      value: log.targetId    || '—' },
                      { label: 'IP Address',     value: log.ipAddress   || '—' },
                      { label: 'Log ID',         value: log._id         || '—' },
                      { label: 'Full Details',   value: log.details     || '—' },
                    ].map((row, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#ADB5BD',
                          letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 3 }}>
                          {row.label}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: NAVY,
                          wordBreak: 'break-all', lineHeight: 1.5 }}>
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', background: '#F8F9FA', borderTop: '1px solid #E9ECEF',
          }}>
            <span style={{ fontSize: 13, color: '#6C757D' }}>
              Showing <strong>{startRow}–{endRow}</strong> of <strong>{total.toLocaleString()}</strong> events
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                disabled={page === 1} onClick={() => setPage(1)}
                style={pageBtnStyle(false, page === 1)}>«</button>
              <button
                disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={pageBtnStyle(false, page === 1)}>‹ Prev</button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3)  p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    style={pageBtnStyle(p === page, false)}>
                    {p}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                style={pageBtnStyle(false, page === totalPages)}>Next ›</button>
              <button
                disabled={page === totalPages} onClick={() => setPage(totalPages)}
                style={pageBtnStyle(false, page === totalPages)}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function pageBtnStyle(active, disabled) {
  return {
    padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
    border: `1px solid ${active ? '#0B1F3A' : '#DEE2E6'}`,
    background: active ? '#0B1F3A' : '#fff',
    color: active ? '#fff' : disabled ? '#ADB5BD' : '#343A40',
    opacity: disabled ? 0.5 : 1,
  };
}