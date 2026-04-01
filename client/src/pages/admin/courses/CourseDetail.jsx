import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ToggleLeft, ToggleRight, Pencil, X, Check, Users, BookOpen, FileText, Video, Upload } from 'lucide-react';
import API from '../../../api/axios';
import Breadcrumbs from '../components/Breadcrumbs';
import MediaUploadModal  from '../components/MediaUploadModal';
import MediaPreviewModal from '../components/MediaPreviewModal';

/* ─── PDF Thumbnail ──────────────────────────────────────────────── */
const PDFThumbnail = ({ url }) => {
  if (!url) return (
    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: '#f8fafc' }}>
      <FileText size={22} color="#cbd5e1" />
    </div>
  );
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #fff8ed, #fef3c7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <FileText size={20} color="#f59e0b" />
      <span style={{ fontSize: 7, fontWeight: 800, color: '#f59e0b', letterSpacing: '0.05em' }}>PDF</span>
    </div>
  );
};

/* ─── Video Thumbnail at 15s ─────────────────────────────────────── */
const VideoThumbnail = ({ url }) => {
  const [thumb, setThumb] = useState(null);

  useEffect(() => {
    if (!url || url.includes('drive.google.com') || url.includes('dropbox.com')) return;

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = url;
    video.currentTime = 15;
    video.muted = true;

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width  = video.videoWidth  || 160;
      canvas.height = video.videoHeight || 90;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumb(canvas.toDataURL('image/jpeg'));
    });

    video.addEventListener('error', () => setThumb(null));
    video.load();
  }, [url]);

  if (!thumb) return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e, #2d1b69)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <Video size={20} color="#8b5cf6" />
      <span style={{ fontSize: 7, fontWeight: 800, color: '#8b5cf6', letterSpacing: '0.05em' }}>VIDEO</span>
    </div>
  );

  return (
    <img src={thumb} alt="Video thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  );
};

/* ─── Confirmation Dialog ────────────────────────────────────────── */
const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={D.dialogTitle}>Save Changes?</div>
      <div style={D.dialogSub}>You are about to update this course's data. This action is permanent.</div>
      <div style={D.dialogSub2}>Are you sure you want to proceed?</div>
      <div style={D.dialogBtns}>
        <button style={D.cancelBtn} onClick={onCancel} type="button">No, cancel</button>
        <button style={D.confirmBtn} onClick={onConfirm} type="button">Yes, save changes</button>
      </div>
    </div>
  </>
);

/* ─── Inline Editable Field ──────────────────────────────────────── */
const EditableField = ({ label, value, fieldKey, onSave, type = 'text' }) => {
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
            type === 'textarea' ? (
              <textarea
                value={current}
                onChange={handleChange}
                autoFocus
                rows={3}
                style={{
                  width: '100%', border: 'none', outline: 'none', resize: 'vertical',
                  fontSize: 13, fontWeight: 500, color: '#091925',
                  background: 'transparent', fontFamily: "'Poppins', sans-serif",
                }}
              />
            ) : (
              <input
                type={type}
                value={current}
                onChange={handleChange}
                autoFocus
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontSize: 13, fontWeight: 600, color: '#091925',
                  background: 'transparent', fontFamily: "'Poppins', sans-serif",
                }}
              />
            )
          ) : (
            <div style={{ fontSize: 13, fontWeight: 600, color: current ? '#091925' : '#7FA8C4', wordBreak: 'break-all' }}>
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

/* ─── CourseDetail ───────────────────────────────────────────────── */
const CourseDetail = () => {
  const { id }                              = useParams();
  const [course, setCourse]                 = useState(null);
  const [enrollments, setEnrollments]       = useState([]);
  const [enrolledCount, setEnrolledCount]   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [toast, setToast]                   = useState(null);
  const [mediaModal, setMediaModal]         = useState(null);
  const [previewModal, setPreviewModal]     = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/admin/courses/${id}`);
        setCourse(res.data.course);
        setEnrollments(res.data.enrollments || []);
        setEnrolledCount(res.data.enrolledCount || 0);
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
      const res = await API.put(`/admin/courses/${id}`, { [field]: value });
      setCourse(res.data.course);
      showToast('Saved successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save.', 'error');
    }
  };

  const handleMediaSave = async (field, url) => {
    try {
      const res = await API.put(`/admin/courses/${id}`, { [field]: url });
      setCourse(res.data.course);
      showToast('Media updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update media.', 'error');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const res = await API.patch(`/admin/courses/${id}/toggle-status`);
      setCourse(prev => ({ ...prev, is_active: res.data.is_active }));
      showToast(`Course ${res.data.is_active ? 'activated' : 'deactivated'}!`, 'success');
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div style={{ padding: 32, color: '#7FA8C4', fontFamily: "'Poppins',sans-serif" }}>Loading...</div>;
  if (!course)  return <div style={{ padding: 32, color: '#ef4444', fontFamily: "'Poppins',sans-serif" }}>Course not found.</div>;

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
        { label: 'Courses',   path: '/admin/courses' },
        { label: course.title },
      ]} />

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#091925', marginBottom: 4 }}>Course Details</h1>
        <p style={{ fontSize: 13, color: '#5B7384' }}>Viewing and editing details for {course.title}.</p>
        <div style={{ height: 2, background: 'linear-gradient(90deg,#2EABFE,transparent)', borderRadius: 99, marginTop: 12 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Course Info Card */}
          <div style={card}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, margin: '0 auto 12px',
                background: course.type === 'PE' ? 'rgba(139,92,246,0.1)' : 'rgba(46,171,254,0.1)',
                display: 'grid', placeItems: 'center',
              }}>
                <BookOpen size={28} color={course.type === 'PE' ? '#8b5cf6' : '#2EABFE'} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#091925', lineHeight: 1.3, marginBottom: 8 }}>
                {course.title}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 99,
                background: course.type === 'PE' ? 'rgba(139,92,246,0.1)' : 'rgba(46,171,254,0.1)',
                color: course.type === 'PE' ? '#8b5cf6' : '#2EABFE',
              }}>
                {course.type}
              </span>
            </div>

            <div style={divider} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>NMLS ID</span>
                <span style={{ fontWeight: 600, color: '#091925' }}>{course.nmls_course_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>Credit Hours</span>
                <span style={{ fontWeight: 600, color: '#091925' }}>{course.credit_hours}h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>Price</span>
                <span style={{ fontWeight: 600, color: '#091925' }}>${course.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>Status</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99,
                  background: course.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: course.is_active ? '#10b981' : '#ef4444',
                }}>
                  {course.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#7FA8C4' }}>Created</span>
                <span style={{ fontWeight: 600, color: '#091925' }}>{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={divider} />

            <button
              onClick={handleToggleStatus}
              style={{
                width: '100%', height: 42, borderRadius: 10, border: 'none',
                background: course.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                color: course.is_active ? '#ef4444' : '#10b981',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {course.is_active
                ? <><ToggleRight size={16} /> Deactivate Course</>
                : <><ToggleLeft  size={16} /> Activate Course</>
              }
            </button>
          </div>

          {/* Enrolled Students Card */}
          <div style={card}>
            <div style={sectionTitle}>
              <Users size={15} color="#2EABFE" />
              Enrolled Students
            </div>
            <div style={{
              fontSize: 32, fontWeight: 800, color: '#091925', marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {enrolledCount}
              <span style={{ fontSize: 13, fontWeight: 500, color: '#7FA8C4' }}>students</span>
            </div>

            <div style={divider} />

            {enrollments.length === 0 ? (
              <p style={empty}>No enrolled students yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {enrollments.map((e) => (
                  <div key={e._id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#f8fafc', borderRadius: 10, padding: '10px 12px',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: '#2EABFE',
                      display: 'grid', placeItems: 'center', fontSize: 11,
                      fontWeight: 700, color: '#091925', flexShrink: 0,
                    }}>
                      {e.user_id?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#091925', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.user_id?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: 11, color: '#7FA8C4' }}>{e.progress || 0}% complete</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                      background: e.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(46,171,254,0.1)',
                      color: e.status === 'completed' ? '#10b981' : '#2EABFE',
                    }}>
                      {e.status || 'in-progress'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT CONTENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Basic Info */}
          <div style={card}>
            <div style={sectionTitle}><span>Basic Information</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <EditableField label="Title"       fieldKey="title"       value={course.title}       onSave={handleSave} />
              <EditableField label="Description" fieldKey="description" value={course.description} onSave={handleSave} type="textarea" />
              <EditableField label="Provider"    fieldKey="provider"    value={course.provider}    onSave={handleSave} />
              <EditableField label="Level"       fieldKey="level"       value={course.level}       onSave={handleSave} />
            </div>
          </div>

          {/* Pricing */}
          <div style={card}>
            <div style={sectionTitle}><span>Pricing</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <EditableField label="Price ($)"          fieldKey="price"          value={course.price?.toString()}          onSave={handleSave} type="number" />
              <EditableField label="Credit Hours"       fieldKey="credit_hours"   value={course.credit_hours?.toString()}   onSave={handleSave} type="number" />
              <EditableField label="Textbook Price ($)" fieldKey="textbook_price" value={course.textbook_price?.toString()} onSave={handleSave} type="number" />
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600, marginBottom: 4 }}>Has Textbook</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#091925' }}>
                  {course.has_textbook ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>

          {/* ── Media & Resources ── */}
          <div style={card}>
            <div style={sectionTitle}>
              <FileText size={15} color="#f59e0b" />
              <span>Media & Resources</span>
            </div>

            {/* PDF Row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{
                  width: 56, height: 72, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                  border: '1px solid rgba(245,158,11,0.3)', background: '#fff',
                }}>
                  <PDFThumbnail url={course.pdf_url} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600, marginBottom: 4 }}>PDF File</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: course.pdf_url ? '#091925' : '#7FA8C4' }}>
                    {course.pdf_url
                      ? <span style={{ fontSize: 12, color: '#5B7384', fontWeight: 500, wordBreak: 'break-all' }}>
                          {course.pdf_url.split('/').pop().split('?')[0] || 'Course PDF'}
                        </span>
                      : 'No PDF uploaded'
                    }
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                {course.pdf_url && (
                  <button
                    onClick={() => setPreviewModal({ type: 'pdf', url: course.pdf_url })}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: 'none',
                      background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <FileText size={13} /> View
                  </button>
                )}
                <button
                  onClick={() => setMediaModal({ type: 'pdf' })}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: 'rgba(46,171,254,0.1)', color: '#2EABFE',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Upload size={13} /> {course.pdf_url ? 'Replace' : 'Upload'}
                </button>
              </div>
            </div>

            {/* Video Row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{
                  width: 56, height: 72, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                  border: '1px solid rgba(139,92,246,0.3)', background: '#000',
                  position: 'relative',
                }}>
                  {course.video_url ? (
                    <>
                      <VideoThumbnail url={course.video_url} />
                      <div style={{
                        position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                        background: 'rgba(0,0,0,0.3)',
                      }}>
                        <Video size={16} color="#fff" />
                      </div>
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
                      <Video size={22} color="#cbd5e1" />
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#7FA8C4', fontWeight: 600, marginBottom: 4 }}>Video File</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: course.video_url ? '#091925' : '#7FA8C4' }}>
                    {course.video_url
                      ? <span style={{ fontSize: 12, color: '#5B7384', fontWeight: 500, wordBreak: 'break-all' }}>
                          {course.video_url.split('/').pop().split('?')[0] || 'Course Video'}
                        </span>
                      : 'No video uploaded'
                    }
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                {course.video_url && (
                  <button
                    onClick={() => setPreviewModal({ type: 'video', url: course.video_url })}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: 'none',
                      background: 'rgba(139,92,246,0.1)', color: '#8b5cf6',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif",
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Video size={13} /> View
                  </button>
                )}
                <button
                  onClick={() => setMediaModal({ type: 'video' })}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none',
                    background: 'rgba(46,171,254,0.1)', color: '#2EABFE',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Poppins', sans-serif",
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Upload size={13} /> {course.video_url ? 'Replace' : 'Upload'}
                </button>
              </div>
            </div>
          </div>

          {/* States Approved */}
          <div style={card}>
            <div style={sectionTitle}><span>States Approved</span></div>
            {course.states_approved?.length === 0 || !course.states_approved ? (
              <p style={empty}>No states listed.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {course.states_approved.map((state) => (
                  <span key={state} style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99,
                    background: 'rgba(46,171,254,0.08)', color: '#2EABFE',
                    border: '1px solid rgba(46,171,254,0.2)',
                  }}>
                    {state}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modules */}
          <div style={card}>
            <div style={sectionTitle}><span>Modules ({course.modules?.length || 0})</span></div>
            {!course.modules?.length ? (
              <p style={empty}>No modules yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {course.modules.map((m, i) => (
                  <div key={i} style={{
                    background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#091925' }}>
                        Module {m.order}: {m.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 2 }}>
                        {m.credit_hours}h • {m.quiz?.length || 0} quiz questions
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {m.pdf_url   && <FileText size={14} color="#f59e0b" />}
                      {m.video_url && <Video    size={14} color="#8b5cf6" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Media Upload Modal */}
      {mediaModal && (
        <MediaUploadModal
          type={mediaModal.type}
          currentUrl={mediaModal.type === 'pdf' ? course.pdf_url : course.video_url}
          onClose={() => setMediaModal(null)}
          onSave={(url) => handleMediaSave(
            mediaModal.type === 'pdf' ? 'pdf_url' : 'video_url',
            url
          )}
        />
      )}

      {/* Media Preview Modal */}
      {previewModal && (
        <MediaPreviewModal
          type={previewModal.type}
          url={previewModal.url}
          onClose={() => setPreviewModal(null)}
        />
      )}

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
  confirmBtn:  { flex: 1, height: 44, background: '#2EABFE', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'inherit' },
};

/* ─── Styles ─────────────────────────────────────────────────────── */
const card         = { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };
const sectionTitle = { fontSize: 14, fontWeight: 700, color: '#091925', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 };
const divider      = { height: '0.5px', background: '#e2e8f0', margin: '14px 0' };
const empty        = { fontSize: 13, color: '#7FA8C4' };
const iconBtn      = (color) => ({
  width: 28, height: 28, borderRadius: 7, border: 'none',
  background: `${color}18`, color, cursor: 'pointer',
  display: 'grid', placeItems: 'center',
});

export default CourseDetail;