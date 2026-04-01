import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ToggleLeft, ToggleRight, Pencil, X, Check, BookOpen, Award } from 'lucide-react';
import API from '../../../api/axios';
import Breadcrumbs from '../components/Breadcrumbs';

/* ─── Confirmation Dialog ────────────────────────────────────────── */
const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={D.dialogTitle}>Save Changes?</div>
      <div style={D.dialogSub}>You are about to update this student's data. This action is permanent.</div>
      <div style={D.dialogSub2}>Are you sure you want to proceed?</div>
      <div style={D.dialogBtns}>
        <button style={D.cancelBtn}  onClick={onCancel}  type="button">No, cancel</button>
        <button style={D.confirmBtn} onClick={onConfirm} type="button">Yes, save changes</button>
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
      {confirm && <ConfirmDialog onConfirm={handleConfirm} onCancel={() => setConfirm(false)} />}
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

/* ─── StudentDetail ──────────────────────────────────────────────── */
const StudentDetail = () => {
  const { id }                          = useParams();
  const [student, setStudent]           = useState(null);
  const [enrollments, setEnrollments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/admin/students/${id}`);
        setStudent(res.data.student);
        setEnrollments(res.data.enrollments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

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
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div style={{ padding: 32, color: '#7FA8C4', fontFamily: "'Poppins',sans-serif" }}>Loading...</div>;
  if (!student) return <div style={{ padding: 32, color: '#ef4444', fontFamily: "'Poppins',sans-serif" }}>Student not found.</div>;

  const initials = student.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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

      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Students',  path: '/admin/students' },
        { label: student.name },
      ]} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Student Details</h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>Viewing and editing profile for {student.name}.</p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Profile Card */}
          <div style={card}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#2EABFE',
                display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700,
                color: '#091925', margin: '0 auto 12px',
              }}>
                {initials}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#091925' }}>{student.name}</div>
              <div style={{ fontSize: 12, color: '#7FA8C4', marginTop: 2 }}>{student.email}</div>
              <div style={{ marginTop: 10 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 99,
                  background: student.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: student.is_active ? '#10b981' : '#ef4444',
                }}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div style={divider} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#7FA8C4' }}>
                Joined: <strong style={{ color: '#091925' }}>{new Date(student.createdAt).toLocaleDateString()}</strong>
              </div>
              <div style={{ fontSize: 12, color: '#7FA8C4' }}>
                Last Login: <strong style={{ color: '#091925' }}>
                  {student.last_login_at ? new Date(student.last_login_at).toLocaleString() : '—'}
                </strong>
              </div>
            </div>

            <div style={divider} />

            <button
              onClick={handleToggleStatus}
              style={{
                width: '100%', height: 42, borderRadius: 10, border: 'none',
                background: student.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                color: student.is_active ? '#ef4444' : '#10b981',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {student.is_active
                ? <><ToggleRight size={16} /> Deactivate Student</>
                : <><ToggleLeft  size={16} /> Activate Student</>
              }
            </button>
          </div>

          {/* Course Progress Card */}
          <div style={card}>
            <div style={sectionTitle}>
              <BookOpen size={15} color="#2EABFE" />
              Course Progress
            </div>
            {enrollments.length === 0 ? (
              <p style={empty}>No enrolled courses yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {enrollments.map((e) => (
                  <div key={e._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#091925', flex: 1, marginRight: 8, lineHeight: 1.3 }}>
                        {e.course_id?.title || 'Unknown Course'}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                        background: e.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(46,171,254,0.1)',
                        color: e.status === 'completed' ? '#10b981' : '#2EABFE',
                      }}>
                        {e.status || 'in-progress'}
                      </span>
                    </div>
                    <div style={{ height: 5, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        width: `${e.progress || 0}%`,
                        background: e.status === 'completed' ? '#10b981' : '#2EABFE',
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#7FA8C4', marginTop: 3 }}>{e.progress || 0}% completed</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates Card */}
          <div style={card}>
            <div style={sectionTitle}>
              <Award size={15} color="#f59e0b" />
              Certificates Earned
            </div>
            {!student.completions?.length ? (
              <p style={empty}>No certificates earned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {student.completions.map((c) => (
                  <div key={c._id} style={{
                    background: '#f8fafc', borderRadius: 10, padding: '10px 12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#091925' }}>
                        {c.course_id?.title || 'Unknown Course'}
                      </div>
                      <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 2 }}>
                        {new Date(c.completed_at).toLocaleDateString()}
                      </div>
                    </div>
                    {c.certificate_url && (
                      <a href={c.certificate_url} target="_blank" rel="noreferrer" style={{
                        fontSize: 11, fontWeight: 600, color: '#2EABFE',
                        textDecoration: 'none', padding: '3px 10px',
                        background: 'rgba(46,171,254,0.1)', borderRadius: 6,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Personal Info */}
          <div style={card}>
            <div style={sectionTitle}><span>Personal Information</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <EditableField label="Full Name" fieldKey="name"    value={student.name}    onSave={handleSave} />
              <EditableField label="Email"     fieldKey="email"   value={student.email}   onSave={handleSave} />
              <EditableField label="Phone"     fieldKey="phone"   value={student.phone}   onSave={handleSave} />
              <EditableField label="Address"   fieldKey="address" value={student.address} onSave={handleSave} />
            </div>
          </div>

          {/* NMLS Info */}
          <div style={card}>
            <div style={sectionTitle}><span>NMLS Information</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <EditableField label="NMLS ID" fieldKey="nmls_id" value={student.nmls_id} onSave={handleSave} />
              <EditableField label="State"   fieldKey="state"   value={student.state}   onSave={handleSave} />
            </div>
          </div>

          {/* License & Goals */}
          <div style={card}>
            <div style={sectionTitle}><span>License & Goals</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <EditableField label="License Type" fieldKey="license_type" value={student.license_type} onSave={handleSave} />
              <EditableField label="Target State" fieldKey="target_state" value={student.target_state} onSave={handleSave} />
              <EditableField label="Target Date"  fieldKey="target_date"  value={student.target_date}  onSave={handleSave} />
              <EditableField label="Experience"   fieldKey="experience"   value={student.experience}   onSave={handleSave} />
            </div>
          </div>

          {/* CE Renewal */}
          <div style={card}>
            <div style={sectionTitle}><span>CE Renewal</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <EditableField label="Renewal Status"   fieldKey="renewal_status"         value={student.renewal_status} onSave={handleSave} />
              <EditableField label="Hours Required"   fieldKey="ce_hours_required"      value={student.ce_hours_required?.toString()} onSave={handleSave} />
              <EditableField label="Renewal Deadline" fieldKey="ce_renewal_deadline"    value={student.ce_renewal_deadline ? new Date(student.ce_renewal_deadline).toLocaleDateString() : ''} onSave={handleSave} />
              <EditableField label="Cycle Start"      fieldKey="ce_renewal_cycle_start" value={student.ce_renewal_cycle_start ? new Date(student.ce_renewal_cycle_start).toLocaleDateString() : ''} onSave={handleSave} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ─── Dialog Styles ──────────────────────────────────────────────── */
const D = {
  backdrop:   { position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)' },
  dialog:     { position: 'fixed', zIndex: 301, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 400, background: '#fff', borderRadius: 22, padding: '32px 28px 26px', boxShadow: '0 28px 70px rgba(9,25,37,0.20)', textAlign: 'center', fontFamily: "'Poppins', sans-serif" },
  dialogTitle:{ fontSize: 18, fontWeight: 700, color: '#091925', marginBottom: 8 },
  dialogSub:  { fontSize: 13, color: '#5B7384', marginBottom: 6 },
  dialogSub2: { fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 24 },
  dialogBtns: { display: 'flex', gap: 10 },
  cancelBtn:  { flex: 1, height: 44, background: 'rgba(2,8,23,0.04)', border: '1px solid rgba(2,8,23,0.10)', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'rgba(11,18,32,0.72)', fontFamily: 'inherit' },
  confirmBtn: { flex: 1, height: 44, background: '#2EABFE', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'inherit' },
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const card       = { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const sectionTitle = { fontSize: 14, fontWeight: 700, color: '#091925', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 };
const divider    = { height: '0.5px', background: '#e2e8f0', margin: '14px 0' };
const empty      = { fontSize: 13, color: '#7FA8C4' };
const iconBtn    = (color) => ({
  width: 28, height: 28, borderRadius: 7, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
});

export default StudentDetail;