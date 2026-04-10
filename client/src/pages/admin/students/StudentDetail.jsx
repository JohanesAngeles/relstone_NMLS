import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ToggleLeft, ToggleRight, Pencil, X, Check, BookOpen, Award,
  Trash2, AlertTriangle, RefreshCw, User, Mail, Phone, MapPin,
  Hash, Shield, Target, Clock, CheckCircle, BarChart2, Calendar,
} from 'lucide-react';
import API from '../../../api/axios';
import Breadcrumbs from '../components/Breadcrumbs';

/* ─── Confirmation Dialog ────────────────────────────────────────── */
const ConfirmDialog = ({ title, message, danger, onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={{ ...D.dialogTitle, color: danger ? '#ef4444' : '#091925' }}>
        {danger && <AlertTriangle size={20} style={{ marginBottom: 4 }} />}
        <div>{title || 'Save Changes?'}</div>
      </div>
      <div style={D.dialogSub}>{message || 'This action is permanent.'}</div>
      <div style={D.dialogSub2}>Are you sure you want to proceed?</div>
      <div style={D.dialogBtns}>
        <button style={D.cancelBtn} onClick={onCancel} type="button">No, cancel</button>
        <button
          style={{ ...D.confirmBtn, background: danger ? '#ef4444' : '#2EABFE' }}
          onClick={onConfirm}
          type="button"
        >
          Yes, proceed
        </button>
      </div>
    </div>
  </>
);

/* ─── Inline Editable Field ──────────────────────────────────────── */
const EditableField = ({ label, value, fieldKey, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value || '');
  const [confirm, setConfirm] = useState(false);
  const [dirty, setDirty]     = useState(false);

  const handleChange = (e) => {
    setCurrent(e.target.value);
    setDirty(e.target.value !== (value || ''));
  };

  const handleConfirm = () => {
    setConfirm(false);
    setEditing(false);
    setDirty(false);
    onSave(fieldKey, current);
  };

  const handleCancel = () => {
    setEditing(false);
    setCurrent(value || '');
    setDirty(false);
  };

  return (
    <>
      {confirm && (
        <ConfirmDialog
          title="Save Changes?"
          message="You are about to update this student's data."
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(false)}
        />
      )}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: editing ? 'rgba(46,171,254,0.04)' : '#f8fafc',
        borderRadius: 10,
        border: editing ? '1px solid rgba(46,171,254,0.3)' : '1px solid transparent',
        transition: 'all .2s',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600, marginBottom: 4 }}>{label}</div>
          {editing ? (
            <input
              value={current}
              onChange={handleChange}
              autoFocus
              style={{
                width: '100%', border: 'none', outline: 'none',
                fontSize: 13, fontWeight: 600, color: '#091925',
                background: 'transparent', fontFamily: "'Poppins', sans-serif",
              }}
            />
          ) : (
            <div style={{ fontSize: 13, fontWeight: 600, color: current ? '#091925' : '#7FA8C4' }}>
              {current || '—'}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
          {editing ? (
            <>
              {dirty && (
                <button onClick={() => setConfirm(true)} title="Save" style={iconBtn('#10b981')}>
                  <Check size={13} />
                </button>
              )}
              <button onClick={handleCancel} title="Cancel" style={iconBtn('#ef4444')}>
                <X size={13} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} title="Edit" style={iconBtn('#2EABFE')}>
              <Pencil size={13} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── Course Management Card ─────────────────────────────────────── */
const CourseManagement = ({ studentId, enrollments, onUpdate, showToast }) => {
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(null);
  const [reason, setReason]   = useState('');
  const [filter, setFilter]   = useState('all');

  // Status helpers — matches enrollment schema:
  // 'enrolled' | 'in_progress' | 'completed' | 'removed'
  const isActive    = (e) => e.status === 'enrolled' || e.status === 'in_progress';
  const isCompleted = (e) => e.status === 'completed';
  const isRemoved   = (e) => e.status === 'removed';

  const statusColor = (status) => {
    if (status === 'completed')  return { bg: 'rgba(16,185,129,0.10)',  color: '#10b981' };
    if (status === 'removed')    return { bg: 'rgba(239,68,68,0.10)',   color: '#ef4444' };
    if (status === 'enrolled')   return { bg: 'rgba(245,158,11,0.10)',  color: '#d97706' };
    return                              { bg: 'rgba(46,171,254,0.10)',  color: '#2EABFE' }; // in_progress
  };

  const statusLabel = (status) => {
    if (status === 'in_progress') return 'In Progress';
    if (status === 'enrolled')    return 'Enrolled';
    if (status === 'completed')   return 'Completed';
    if (status === 'removed')     return 'Removed';
    return status || 'Unknown';
  };

  const handleRemove = async () => {
    if (!confirm) return;
    setLoading(confirm.enrollmentId);
    try {
      await API.delete(`/admin/students/${studentId}/enrollments/${confirm.enrollmentId}`, {
        data: { reason: reason || 'Removed by admin' },
      });
      showToast('Course removed successfully.', 'success');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove course.', 'error');
    } finally {
      setLoading(null);
      setConfirm(null);
      setReason('');
    }
  };

  const handleReenroll = async () => {
    if (!confirm) return;
    setLoading(confirm.enrollmentId);
    try {
      await API.patch(`/admin/students/${studentId}/enrollments/${confirm.enrollmentId}/reenroll`);
      showToast('Student re-enrolled successfully.', 'success');
      onUpdate();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to re-enroll.', 'error');
    } finally {
      setLoading(null);
      setConfirm(null);
    }
  };

  const filtered = enrollments.filter(e => {
    if (filter === 'active')    return isActive(e);
    if (filter === 'completed') return isCompleted(e);
    if (filter === 'removed')   return isRemoved(e);
    return true;
  });

  const counts = {
    all:       enrollments.length,
    active:    enrollments.filter(isActive).length,
    completed: enrollments.filter(isCompleted).length,
    removed:   enrollments.filter(isRemoved).length,
  };

  const filterBtns = [
    { key: 'all',       label: 'All',       count: counts.all },
    { key: 'active',    label: 'Active',    count: counts.active },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'removed',   label: 'Removed',   count: counts.removed },
  ];

  return (
    <>
      {/* Remove Confirmation */}
      {confirm?.type === 'remove' && (
        <>
          <div onClick={() => { setConfirm(null); setReason(''); }} style={D.backdrop} />
          <div style={D.dialog}>
            <div style={{ ...D.dialogTitle, color: '#ef4444' }}>
              <AlertTriangle size={22} style={{ marginBottom: 6 }} />
              <div>Remove Course?</div>
            </div>
            <div style={D.dialogSub}>
              You are about to remove <strong>{confirm.courseTitle}</strong> from this student.
            </div>
            <div style={D.dialogSub2}>This will revoke their access immediately.</div>
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7FA8C4', display: 'block', marginBottom: 6 }}>
                Reason (optional)
              </label>
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Duplicate enrollment, payment issue…"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 10,
                  border: '1px solid rgba(2,8,23,0.12)', outline: 'none',
                  fontSize: 13, fontWeight: 500, color: '#091925',
                  fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={D.dialogBtns}>
              <button style={D.cancelBtn} onClick={() => { setConfirm(null); setReason(''); }} type="button">Cancel</button>
              <button style={{ ...D.confirmBtn, background: '#ef4444' }} onClick={handleRemove} type="button">
                {loading === confirm.enrollmentId ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Re-enroll Confirmation */}
      {confirm?.type === 'reenroll' && (
        <ConfirmDialog
          title="Re-enroll Student?"
          message={`Re-enroll this student in "${confirm.courseTitle}"? Their progress will be reset.`}
          onConfirm={handleReenroll}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div style={card}>
        {/* Header */}
        <div style={sectionTitle}>
          <BookOpen size={15} color="#2EABFE" />
          Course Management
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 700,
            padding: '2px 10px', borderRadius: 99,
            background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            border: '1px solid rgba(239,68,68,0.20)',
          }}>
            Admin Only
          </span>
        </div>

        {/* Warning banner */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '10px 14px', borderRadius: 10, marginBottom: 14,
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.25)',
        }}>
          <AlertTriangle size={14} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', lineHeight: 1.5 }}>
            Removing a course will immediately revoke the student's access. Use only for emergencies such as duplicate enrollments, payment disputes, or data errors.
          </div>
        </div>

        {/* Filter tabs */}
        {enrollments.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {filterBtns.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                type="button"
                style={{
                  padding: '5px 12px', borderRadius: 99, border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
                  background: filter === f.key ? '#091925' : 'rgba(2,8,23,0.05)',
                  color: filter === f.key ? '#fff' : '#5B7384',
                  transition: 'all .15s',
                }}
              >
                {f.label}
                <span style={{
                  marginLeft: 5, fontSize: 10, fontWeight: 800,
                  padding: '1px 6px', borderRadius: 99,
                  background: filter === f.key ? 'rgba(255,255,255,0.20)' : 'rgba(2,8,23,0.08)',
                  color: filter === f.key ? '#fff' : '#7FA8C4',
                }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Course list */}
        {enrollments.length === 0 ? (
          <div style={{ padding: '28px 0', textAlign: 'center', color: '#7FA8C4', fontSize: 13, fontWeight: 600 }}>
            No enrolled courses yet.
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '28px 0', textAlign: 'center', color: '#7FA8C4', fontSize: 13, fontWeight: 600 }}>
            No courses in this category.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((e) => {
              const sc          = statusColor(e.status);
              const removed     = isRemoved(e);
              const done        = isCompleted(e);
              const active      = isActive(e);
              const isLoading   = loading === e._id;
              const courseTitle = e.course_id?.title || 'Unknown Course';
              const courseType  = e.course_id?.type ? String(e.course_id.type).toUpperCase() : null;
              const creditHrs   = e.course_id?.credit_hours;

              // Derive progress from completed_idxs/total_steps (from enrollment route)
              // or fall back to a progress field if it exists
              const progressPct = (() => {
                if (e.total_steps && e.completed_idxs?.length) {
                  return Math.round((e.completed_idxs.length / e.total_steps) * 100);
                }
                return e.progress || 0;
              })();

              return (
                <div key={e._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 14, gap: 12,
                  background: removed ? 'rgba(239,68,68,0.02)' : done ? 'rgba(16,185,129,0.02)' : '#f8fafc',
                  border: `1px solid ${removed ? 'rgba(239,68,68,0.12)' : done ? 'rgba(16,185,129,0.15)' : 'rgba(2,8,23,0.07)'}`,
                  opacity: removed ? 0.80 : 1,
                  transition: 'all .2s',
                }}>

                  {/* Left accent bar */}
                  <div style={{
                    width: 3, borderRadius: 99, alignSelf: 'stretch', flexShrink: 0,
                    background: removed ? '#ef4444' : done ? '#10b981' : '#2EABFE',
                  }} />

                  {/* Course info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, lineHeight: 1.3, marginBottom: 5,
                      textDecoration: removed ? 'line-through' : 'none',
                      color: removed ? '#7FA8C4' : '#091925',
                    }}>
                      {courseTitle}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {/* Status badge */}
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                        background: sc.bg, color: sc.color,
                      }}>
                        {statusLabel(e.status)}
                      </span>

                      {/* Course type */}
                      {courseType && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: courseType === 'PE' ? 'rgba(46,171,254,0.10)' : 'rgba(16,185,129,0.10)',
                          color: courseType === 'PE' ? '#2EABFE' : '#10b981',
                          border: `1px solid ${courseType === 'PE' ? 'rgba(46,171,254,0.20)' : 'rgba(16,185,129,0.20)'}`,
                        }}>
                          {courseType}
                        </span>
                      )}

                      {/* Progress % */}
                      {!removed && (
                        <span style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600 }}>
                          {progressPct}% complete
                        </span>
                      )}

                      {/* Credit hours */}
                      {creditHrs != null && (
                        <span style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} /> {creditHrs} hrs
                        </span>
                      )}

                      {/* Seat time */}
                      {e.total_seat_seconds > 0 && (
                        <span style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600 }}>
                          ⏱ {Math.round(e.total_seat_seconds / 60)} min seat time
                        </span>
                      )}

                      {/* Removed metadata */}
                      {e.removed_at && (
                        <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                          Removed {new Date(e.removed_at).toLocaleDateString()}
                        </span>
                      )}
                      {e.removal_reason && (
                        <span style={{ fontSize: 11, color: '#7FA8C4', fontStyle: 'italic' }}>
                          "{e.removal_reason}"
                        </span>
                      )}

                      {/* Completed date */}
                      {done && e.completed_at && (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <CheckCircle size={10} />
                          Completed {new Date(e.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Progress bar — active only */}
                    {active && (
                      <div style={{ height: 4, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginTop: 8, maxWidth: 200 }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          width: `${progressPct}%`,
                          background: '#2EABFE',
                          transition: 'width .4s ease',
                        }} />
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {removed ? (
                      <button
                        onClick={() => setConfirm({ type: 'reenroll', enrollmentId: e._id, courseTitle })}
                        disabled={isLoading}
                        type="button"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '7px 13px', borderRadius: 9,
                          border: '1px solid rgba(16,185,129,0.30)',
                          background: 'rgba(16,185,129,0.08)', color: '#10b981',
                          cursor: 'pointer', fontSize: 12, fontWeight: 700,
                          fontFamily: "'Poppins', sans-serif",
                          opacity: isLoading ? 0.6 : 1,
                        }}
                      >
                        <RefreshCw size={12} />
                        {isLoading ? 'Working…' : 'Re-enroll'}
                      </button>
                    ) : done ? (
                      e.certificate_url ? (
                        <a
                          href={e.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '7px 13px', borderRadius: 9,
                            border: '1px solid rgba(245,158,11,0.30)',
                            background: 'rgba(245,158,11,0.07)', color: '#d97706',
                            fontSize: 12, fontWeight: 700, textDecoration: 'none',
                          }}
                        >
                          <Award size={12} /> Certificate
                        </a>
                      ) : (
                        <span style={{
                          padding: '7px 13px', borderRadius: 9, fontSize: 11,
                          fontWeight: 600, color: '#10b981',
                          background: 'rgba(16,185,129,0.06)',
                          border: '1px solid rgba(16,185,129,0.15)',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          <CheckCircle size={11} /> Completed
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => setConfirm({ type: 'remove', enrollmentId: e._id, courseTitle })}
                        disabled={isLoading}
                        type="button"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '7px 13px', borderRadius: 9,
                          border: '1px solid rgba(239,68,68,0.30)',
                          background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                          cursor: 'pointer', fontSize: 12, fontWeight: 700,
                          fontFamily: "'Poppins', sans-serif",
                          opacity: isLoading ? 0.5 : 1,
                        }}
                      >
                        <Trash2 size={12} />
                        {isLoading ? 'Removing…' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

/* ─── StudentDetail (Admin) ──────────────────────────────────────── */
const StudentDetail = () => {
  const { id }                        = useParams();
  const [student, setStudent]         = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [activeTab, setActiveTab]     = useState('info');

  const fetchStudent = async () => {
  try {
    const res = await API.get(`/admin/students/${id}`);
    setStudent(res.data.student);
    setEnrollments(res.data.enrollments || []);
    console.log('Enrollments:', res.data.enrollments); // ← ADD THIS
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchStudent(); }, [id]);

  const handleSave = async (field, value) => {
    try {
      const res = await API.put(`/admin/students/${id}`, { [field]: value });
      setStudent(res.data.student);
      showToast('Saved successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save.', 'error');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await API.patch(`/admin/students/${id}/toggle-status`);
      setStudent(prev => ({ ...prev, is_active: res.data.is_active }));
      showToast(`Student ${res.data.is_active ? 'activated' : 'deactivated'}!`, 'success');
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  if (loading) return (
    <div style={{ padding: 32, color: '#7FA8C4', fontFamily: "'Poppins',sans-serif" }}>Loading…</div>
  );
  if (!student) return (
    <div style={{ padding: 32, color: '#ef4444', fontFamily: "'Poppins',sans-serif" }}>Student not found.</div>
  );

  const initials = student.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const isActive    = (e) => e.status === 'enrolled' || e.status === 'in_progress';
  const activeEnrollments    = enrollments.filter(isActive);
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const removedEnrollments   = enrollments.filter(e => e.status === 'removed');

  const tabs = [
    { key: 'info',    label: 'Student Info' },
    { key: 'courses', label: `Courses (${enrollments.length})` },
  ];

  return (
    <div style={{ padding: '28px 0', fontFamily: "'Poppins', sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 12,
          fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          fontFamily: "'Poppins', sans-serif", animation: 'slideUp .25s ease',
        }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Students',  path: '/admin/students' },
        { label: student.name },
      ]} />

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Student Details</h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>Viewing and editing profile for {student.name}.</p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 10 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Profile card */}
          <div style={card}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'linear-gradient(135deg,#091925,#0c2e45)',
                display: 'grid', placeItems: 'center',
                fontSize: 22, fontWeight: 700, color: '#2EABFE',
                margin: '0 auto 12px',
                boxShadow: '0 8px 24px rgba(46,171,254,0.20)',
              }}>
                {initials}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#091925' }}>{student.name}</div>
              <div style={{ fontSize: 12, color: '#7FA8C4', marginTop: 2 }}>{student.email}</div>
              <div style={{ marginTop: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 99,
                  background: student.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: student.is_active ? '#10b981' : '#ef4444',
                  border: `1px solid ${student.is_active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                }}>
                  {student.is_active ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>

            <div style={divider} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
              <InfoRow icon={<Calendar size={12} />} label="Joined">
                {new Date(student.createdAt).toLocaleDateString()}
              </InfoRow>
              <InfoRow icon={<Clock size={12} />} label="Last Login">
                {student.last_login_at ? new Date(student.last_login_at).toLocaleString() : '—'}
              </InfoRow>
              {student.nmls_id && (
                <InfoRow icon={<Hash size={12} />} label="NMLS ID">{student.nmls_id}</InfoRow>
              )}
              {student.state && (
                <InfoRow icon={<MapPin size={12} />} label="State">{student.state}</InfoRow>
              )}
            </div>

            <div style={divider} />

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              <MiniStat label="Active"  value={activeEnrollments.length}    color="#2EABFE" />
              <MiniStat label="Done"    value={completedEnrollments.length} color="#10b981" />
              <MiniStat label="Removed" value={removedEnrollments.length}   color="#ef4444" />
            </div>

            <div style={divider} />

            <button
              onClick={handleToggleStatus}
              type="button"
              style={{
                width: '100%', height: 40, borderRadius: 10,
                background: student.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                color: student.is_active ? '#ef4444' : '#10b981',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Poppins', sans-serif",
                border: `1px solid ${student.is_active ? 'rgba(239,68,68,0.20)' : 'rgba(16,185,129,0.20)'}`,
              }}
            >
              {student.is_active
                ? <><ToggleRight size={15} /> Deactivate Student</>
                : <><ToggleLeft  size={15} /> Activate Student</>}
            </button>
          </div>

          {/* Certificates card */}
          <div style={card}>
            <div style={sectionTitle}>
              <Award size={14} color="#f59e0b" />
              Certificates Earned
            </div>
            {!student.completions?.length ? (
              <p style={emptyText}>No certificates earned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {student.completions.map((c) => (
                  <div key={c._id} style={{
                    background: '#f8fafc', borderRadius: 10, padding: '10px 12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid rgba(2,8,23,0.06)',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#091925', lineHeight: 1.3 }}>
                        {c.course_id?.title || 'Unknown Course'}
                      </div>
                      <div style={{ fontSize: 10, color: '#7FA8C4', marginTop: 2, fontWeight: 600 }}>
                        {new Date(c.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                    {c.certificate_url && (
                      <a href={c.certificate_url} target="_blank" rel="noreferrer" style={{
                        fontSize: 11, fontWeight: 700, color: '#2EABFE',
                        textDecoration: 'none', padding: '4px 10px',
                        background: 'rgba(46,171,254,0.08)', borderRadius: 7,
                        border: '1px solid rgba(46,171,254,0.20)',
                      }}>
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT CONTENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 5, borderRadius: 12, width: 'fit-content' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '8px 18px', borderRadius: 9, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
                  background: activeTab === t.key ? '#fff' : 'transparent',
                  color: activeTab === t.key ? '#091925' : '#7FA8C4',
                  boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── STUDENT INFO TAB ── */}
          {activeTab === 'info' && (
            <>
              <div style={card}>
                <div style={sectionTitle}><User size={14} color="#2EABFE" />Personal Information</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <EditableField label="Full Name" fieldKey="name"    value={student.name}    onSave={handleSave} />
                  <EditableField label="Email"     fieldKey="email"   value={student.email}   onSave={handleSave} />
                  <EditableField label="Phone"     fieldKey="phone"   value={student.phone}   onSave={handleSave} />
                  <EditableField label="Address"   fieldKey="address" value={student.address} onSave={handleSave} />
                </div>
              </div>

              <div style={card}>
                <div style={sectionTitle}><Shield size={14} color="#2EABFE" />NMLS Information</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <EditableField label="NMLS ID" fieldKey="nmls_id" value={student.nmls_id} onSave={handleSave} />
                  <EditableField label="State"   fieldKey="state"   value={student.state}   onSave={handleSave} />
                </div>
              </div>

              <div style={card}>
                <div style={sectionTitle}><Target size={14} color="#2EABFE" />License & Goals</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <EditableField label="License Type" fieldKey="license_type" value={student.license_type} onSave={handleSave} />
                  <EditableField label="Target State" fieldKey="target_state" value={student.target_state} onSave={handleSave} />
                  <EditableField label="Target Date"  fieldKey="target_date"  value={student.target_date}  onSave={handleSave} />
                  <EditableField label="Experience"   fieldKey="experience"   value={student.experience}   onSave={handleSave} />
                </div>
              </div>

              <div style={card}>
                <div style={sectionTitle}><BarChart2 size={14} color="#2EABFE" />CE Renewal</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <EditableField label="Renewal Status"   fieldKey="renewal_status"         value={student.renewal_status}          onSave={handleSave} />
                  <EditableField label="Hours Required"   fieldKey="ce_hours_required"      value={student.ce_hours_required?.toString()} onSave={handleSave} />
                  <EditableField label="Renewal Deadline" fieldKey="ce_renewal_deadline"    value={student.ce_renewal_deadline    ? new Date(student.ce_renewal_deadline).toLocaleDateString()    : ''} onSave={handleSave} />
                  <EditableField label="Cycle Start"      fieldKey="ce_renewal_cycle_start" value={student.ce_renewal_cycle_start ? new Date(student.ce_renewal_cycle_start).toLocaleDateString() : ''} onSave={handleSave} />
                </div>
              </div>
            </>
          )}

          {/* ── COURSES TAB ── */}
          {activeTab === 'courses' && (
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <SummaryCard label="Active"    value={activeEnrollments.length}    color="#2EABFE" icon={<BookOpen size={16} />} />
                <SummaryCard label="Completed" value={completedEnrollments.length} color="#10b981" icon={<CheckCircle size={16} />} />
                <SummaryCard label="Removed"   value={removedEnrollments.length}   color="#ef4444" icon={<Trash2 size={16} />} />
              </div>

              {/* Progress overview — active courses only */}
              {activeEnrollments.length > 0 && (
                <div style={card}>
                  <div style={sectionTitle}><BookOpen size={14} color="#2EABFE" />Course Progress</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {activeEnrollments.map((e) => {
                      const pct = e.total_steps && e.completed_idxs?.length
                        ? Math.round((e.completed_idxs.length / e.total_steps) * 100)
                        : (e.progress || 0);
                      return (
                        <div key={e._id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#091925', flex: 1, marginRight: 8 }}>
                              {e.course_id?.title || 'Unknown Course'}
                            </span>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                              background: 'rgba(46,171,254,0.1)', color: '#2EABFE',
                            }}>
                              {pct}%
                            </span>
                          </div>
                          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              width: `${pct}%`, background: '#2EABFE',
                              transition: 'width .4s ease',
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Full course management with remove / re-enroll */}
              <CourseManagement
                studentId={id}
                enrollments={enrollments}
                onUpdate={fetchStudent}
                showToast={showToast}
              />
            </>
          )}

        </div>
      </div>
    </div>
  );
};

/* ─── Helper components ──────────────────────────────────────────── */
const InfoRow = ({ icon, label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <span style={{ color: '#7FA8C4', flexShrink: 0 }}>{icon}</span>
    <span style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600, flexShrink: 0 }}>{label}:</span>
    <span style={{ fontSize: 11, fontWeight: 700, color: '#091925' }}>{children}</span>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div style={{
    textAlign: 'center', padding: '10px 6px', borderRadius: 10,
    background: `${color}08`, border: `1px solid ${color}22`,
  }}>
    <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 9, fontWeight: 700, color: '#7FA8C4', marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
  </div>
);

const SummaryCard = ({ label, value, color, icon }) => (
  <div style={{
    background: '#fff', borderRadius: 12, padding: '14px 16px',
    border: `1px solid ${color}22`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${color}12`, display: 'grid', placeItems: 'center', color }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#091925', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#7FA8C4', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

/* ─── Dialog Styles ──────────────────────────────────────────────── */
const D = {
  backdrop:    { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)' },
  dialog:      { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 420, background: '#fff', borderRadius: 22, padding: '32px 28px 26px', boxShadow: '0 28px 70px rgba(9,25,37,0.20)', textAlign: 'center', fontFamily: "'Poppins', sans-serif" },
  dialogTitle: { fontSize: 18, fontWeight: 700, color: '#091925', marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  dialogSub:   { fontSize: 13, color: '#5B7384', marginBottom: 6 },
  dialogSub2:  { fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 24 },
  dialogBtns:  { display: 'flex', gap: 10 },
  cancelBtn:   { flex: 1, height: 44, background: 'rgba(2,8,23,0.04)', border: '1px solid rgba(2,8,23,0.10)', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'rgba(11,18,32,0.72)', fontFamily: 'inherit' },
  confirmBtn:  { flex: 1, height: 44, background: '#2EABFE', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'inherit' },
};

/* ─── Shared Styles ──────────────────────────────────────────────── */
const card         = { background: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(2,8,23,0.06)' };
const sectionTitle = { fontSize: 13, fontWeight: 700, color: '#091925', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 };
const divider      = { height: '0.5px', background: '#e2e8f0', margin: '12px 0' };
const emptyText    = { fontSize: 12, color: '#7FA8C4', fontWeight: 600, margin: 0 };
const iconBtn      = (color) => ({
  width: 28, height: 28, borderRadius: 7, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
});

export default StudentDetail;