import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ToggleLeft, ToggleRight, Pencil, X, Check, Users, BookOpen,
  FileText, Video, Upload, ChevronDown, ChevronUp, Plus, Trash2,
  HelpCircle, Save, AlertCircle, CheckCircle,
} from 'lucide-react';
import API from '../../../api/axios';
import Breadcrumbs from '../components/Breadcrumbs';
import MediaUploadModal  from '../components/MediaUploadModal';
import MediaPreviewModal from '../components/MediaPreviewModal';

/* ─── Helpers ────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 9);

const emptyQuestion = () => ({
  _key: uid(), question: '', options: ['', '', '', ''], correct_index: 0, explanation: '',
});

const hydrateQuestion = (q) => ({
  _key:          uid(),
  question:      q.question      || '',
  options:       q.options?.length === 4 ? [...q.options] : ['', '', '', ''],
  correct_index: q.correct_index ?? 0,
  explanation:   q.explanation   || '',
});

/* ─── PDF Thumbnail ──────────────────────────────────────────────── */
const PDFThumbnail = ({ url }) => {
  if (!url) return (
    <div style={{ width:'100%', height:'100%', display:'grid', placeItems:'center', background:'#f8fafc' }}>
      <FileText size={22} color="#cbd5e1" />
    </div>
  );
  return (
    <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#fff8ed,#fef3c7)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
      <FileText size={20} color="#f59e0b" />
      <span style={{ fontSize:7, fontWeight:800, color:'#f59e0b', letterSpacing:'0.05em' }}>PDF</span>
    </div>
  );
};

/* ─── Video Thumbnail ────────────────────────────────────────────── */
const VideoThumbnail = ({ url }) => {
  const [thumb, setThumb] = useState(null);
  useEffect(() => {
    if (!url || url.includes('drive.google.com') || url.includes('dropbox.com')) return;
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; video.src = url; video.currentTime = 15; video.muted = true;
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 160; canvas.height = video.videoHeight || 90;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumb(canvas.toDataURL('image/jpeg'));
    });
    video.addEventListener('error', () => setThumb(null));
    video.load();
  }, [url]);
  if (!thumb) return (
    <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1a1a2e,#2d1b69)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
      <Video size={20} color="#8b5cf6" />
      <span style={{ fontSize:7, fontWeight:800, color:'#8b5cf6', letterSpacing:'0.05em' }}>VIDEO</span>
    </div>
  );
  return <img src={thumb} alt="Video thumbnail" style={{ width:'100%', height:'100%', objectFit:'cover' }} />;
};

/* ─── Confirm Dialog ─────────────────────────────────────────────── */
const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={D.backdrop} />
    <div style={D.dialog}>
      <div style={D.dialogTitle}>Save Changes?</div>
      <div style={D.dialogSub}>You are about to update this course's data. This action is permanent.</div>
      <div style={D.dialogBtns}>
        <button style={D.cancelBtn}  onClick={onCancel}  type="button">No, cancel</button>
        <button style={D.confirmBtn} onClick={onConfirm} type="button">Yes, save</button>
      </div>
    </div>
  </>
);

/* ─── Editable Field ─────────────────────────────────────────────── */
const EditableField = ({ label, value, fieldKey, onSave, type = 'text' }) => {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value || '');
  const [confirm, setConfirm] = useState(false);
  const [dirty,   setDirty]   = useState(false);

  const handleChange  = (e) => { setCurrent(e.target.value); setDirty(e.target.value !== (value || '')); };
  const handleConfirm = () => { setConfirm(false); setEditing(false); setDirty(false); onSave(fieldKey, current); };
  const handleCancel  = () => { setEditing(false); setCurrent(value || ''); setDirty(false); };

  return (
    <>
      {confirm && <ConfirmDialog onConfirm={handleConfirm} onCancel={() => setConfirm(false)} />}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background: editing ? 'rgba(46,171,254,0.04)' : '#f8fafc', borderRadius:10, border: editing ? '1px solid rgba(46,171,254,0.3)' : '1px solid transparent', transition:'all .2s' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:'#7FA8C4', fontWeight:600, marginBottom:4 }}>{label}</div>
          {editing ? (
            type === 'textarea'
              ? <textarea value={current} onChange={handleChange} autoFocus rows={3} style={{ width:'100%', border:'none', outline:'none', resize:'vertical', fontSize:13, fontWeight:500, color:'#091925', background:'transparent', fontFamily:"'Poppins',sans-serif" }} />
              : <input type={type} value={current} onChange={handleChange} autoFocus style={{ width:'100%', border:'none', outline:'none', fontSize:13, fontWeight:600, color:'#091925', background:'transparent', fontFamily:"'Poppins',sans-serif" }} />
          ) : (
            <div style={{ fontSize:13, fontWeight:600, color: current ? '#091925' : '#7FA8C4', wordBreak:'break-all' }}>{current || '—'}</div>
          )}
        </div>
        <div style={{ display:'flex', gap:6, marginLeft:10 }}>
          {editing ? (
            <>
              {dirty && <button onClick={() => setConfirm(true)} style={iconBtn('#10b981')}><Check size={13} /></button>}
              <button onClick={handleCancel} style={iconBtn('#ef4444')}><X size={13} /></button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={iconBtn('#2EABFE')}><Pencil size={13} /></button>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── Question Editor ────────────────────────────────────────────── */
const QuestionEditor = ({ q, qi, onChange, onRemove }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background:'#fff', borderRadius:12, border:'1px solid rgba(2,8,23,0.09)', overflow:'hidden' }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', background:'rgba(46,171,254,0.02)' }}>
        <div style={{ width:26, height:26, borderRadius:7, background:'rgba(46,171,254,0.12)', border:'1px solid rgba(46,171,254,0.25)', display:'grid', placeItems:'center', fontSize:11, fontWeight:900, color:'#2EABFE', flexShrink:0 }}>
          {qi + 1}
        </div>
        <div style={{ flex:1, fontSize:13, fontWeight:700, color: q.question ? 'rgba(11,18,32,0.82)' : 'rgba(11,18,32,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {q.question || 'Click to add question…'}
        </div>
        {q.options[q.correct_index] && (
          <span style={{ fontSize:10, fontWeight:900, color:'rgba(22,163,74,1)', background:'rgba(34,197,94,0.10)', border:'1px solid rgba(34,197,94,0.25)', padding:'2px 8px', borderRadius:999, flexShrink:0 }}>
            ✓ {String.fromCharCode(65 + Number(q.correct_index))}
          </span>
        )}
        <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }} style={{ ...iconBtn('#ef4444'), flexShrink:0 }}><Trash2 size={12} /></button>
        {open ? <ChevronUp size={13} style={{ color:'rgba(11,18,32,0.35)', flexShrink:0 }} /> : <ChevronDown size={13} style={{ color:'rgba(11,18,32,0.35)', flexShrink:0 }} />}
      </div>

      {open && (
        <div style={{ padding:'14px', display:'flex', flexDirection:'column', gap:10 }}>
          {/* Question text */}
          <textarea
            value={q.question}
            onChange={e => onChange('question', e.target.value)}
            placeholder="Enter question text…"
            rows={2}
            style={{ width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid rgba(2,8,23,0.12)', background:'#fff', fontSize:13, fontWeight:600, color:'rgba(11,18,32,0.85)', outline:'none', resize:'vertical', lineHeight:1.5, fontFamily:"'Poppins',sans-serif", boxSizing:'border-box' }}
          />

          {/* Options */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {q.options.map((opt, oi) => (
              <div key={oi} style={{ display:'flex', alignItems:'center', gap:7 }}>
                <input
                  type="radio"
                  name={`correct_${q._key}`}
                  checked={Number(q.correct_index) === oi}
                  onChange={() => onChange('correct_index', oi)}
                  style={{ accentColor:'#2EABFE', flexShrink:0 }}
                />
                <span style={{ fontSize:11, fontWeight:900, color: Number(q.correct_index) === oi ? '#2EABFE' : 'rgba(11,18,32,0.40)', minWidth:14 }}>
                  {String.fromCharCode(65 + oi)}
                </span>
                <input
                  value={opt}
                  onChange={e => { const opts = [...q.options]; opts[oi] = e.target.value; onChange('options', opts); }}
                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  style={{ flex:1, padding:'7px 10px', borderRadius:8, border:'1.5px solid rgba(2,8,23,0.10)', background: Number(q.correct_index) === oi ? 'rgba(46,171,254,0.05)' : '#fff', fontSize:12, fontWeight:600, color:'rgba(11,18,32,0.80)', outline:'none', fontFamily:"'Poppins',sans-serif" }}
                />
              </div>
            ))}
          </div>

          {/* Explanation */}
          <input
            value={q.explanation}
            onChange={e => onChange('explanation', e.target.value)}
            placeholder="Explanation (optional) — why is this correct?"
            style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid rgba(2,8,23,0.09)', background:'rgba(2,8,23,0.015)', fontSize:12, fontWeight:500, color:'rgba(11,18,32,0.65)', outline:'none', fontFamily:"'Poppins',sans-serif", boxSizing:'border-box' }}
          />
        </div>
      )}
    </div>
  );
};

/* ─── Module Quiz Panel ──────────────────────────────────────────── */
const ModuleQuizPanel = ({ mod, modIdx, courseId, onSaved, showToast }) => {
  const [open,     setOpen]     = useState(false);
  const [questions, setQuestions] = useState((mod.quiz || []).map(hydrateQuestion));
  const [saving,   setSaving]   = useState(false);
  const [dirty,    setDirty]    = useState(false);

  const addQuestion = () => { setQuestions(q => [...q, emptyQuestion()]); setDirty(true); };

  const updateQ = (key, field, val) => {
    setQuestions(qs => qs.map(q => q._key === key ? { ...q, [field]: val } : q));
    setDirty(true);
  };

  const removeQ = (key) => { setQuestions(qs => qs.filter(q => q._key !== key)); setDirty(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build clean quiz array
      const cleanQuiz = questions.map(({ _key, ...q }) => ({
        question:      q.question,
        options:       q.options,
        correct_index: Number(q.correct_index),
        explanation:   q.explanation || undefined,
      })).filter(q => q.question.trim());

      // Build updated modules array
      const updatedModules = /* we need all modules */ null; // fetched below
      const res = await API.get(`/admin/courses/${courseId}`);
      const allModules = res.data.course.modules || [];
      allModules[modIdx] = { ...allModules[modIdx], quiz: cleanQuiz };

      const saveRes = await API.put(`/admin/courses/${courseId}`, { modules: allModules });
      onSaved(saveRes.data.course);
      setDirty(false);
      showToast('Quiz saved!', 'success');
    } catch (err) {
      showToast('Failed to save quiz.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop:8 }}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px', borderRadius:9, border:`1px solid ${open ? 'rgba(46,171,254,0.30)' : 'rgba(2,8,23,0.10)'}`, background: open ? 'rgba(46,171,254,0.05)' : '#f8fafc', cursor:'pointer', fontFamily:"'Poppins',sans-serif" }}
      >
        <HelpCircle size={13} color="#2EABFE" />
        <span style={{ fontSize:12, fontWeight:700, color:'#091925', flex:1, textAlign:'left' }}>
          Checkpoint Quiz — {questions.length} question{questions.length !== 1 ? 's' : ''}
        </span>
        {dirty && <span style={{ fontSize:10, fontWeight:800, color:'#f59e0b', background:'rgba(245,158,11,0.10)', padding:'2px 7px', borderRadius:999 }}>Unsaved</span>}
        {open ? <ChevronUp size={13} color="#7FA8C4" /> : <ChevronDown size={13} color="#7FA8C4" />}
      </button>

      {open && (
        <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:8 }}>
          {questions.length === 0 && (
            <div style={{ textAlign:'center', padding:'20px', fontSize:13, color:'#7FA8C4', fontWeight:600, background:'#f8fafc', borderRadius:10, border:'1px dashed rgba(2,8,23,0.12)' }}>
              No questions yet. Add your first question below.
            </div>
          )}

          {questions.map((q, qi) => (
            <QuestionEditor
              key={q._key}
              q={q} qi={qi}
              onChange={(field, val) => updateQ(q._key, field, val)}
              onRemove={() => removeQ(q._key)}
            />
          ))}

          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button
              type="button"
              onClick={addQuestion}
              style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:9, border:'1.5px dashed rgba(46,171,254,0.35)', background:'rgba(46,171,254,0.04)', color:'#2EABFE', cursor:'pointer', fontWeight:800, fontSize:12, fontFamily:"'Poppins',sans-serif" }}
            >
              <Plus size={13} /> Add Question
            </button>
            {dirty && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:9, border:'none', background: saving ? '#7FA8C4' : '#091925', color:'#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight:800, fontSize:12, fontFamily:"'Poppins',sans-serif" }}
              >
                <Save size={13} /> {saving ? 'Saving…' : 'Save Quiz'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Final Exam Panel ───────────────────────────────────────────── */
const FinalExamPanel = ({ courseId, finalExam, onSaved, showToast }) => {
  const [tab,       setTab]       = useState('official'); // 'official' | 'bank'
  const [official,  setOfficial]  = useState((finalExam?.questions     || []).map(hydrateQuestion));
  const [bank,      setBank]      = useState((finalExam?.question_bank || []).map(hydrateQuestion));
  const [settings,  setSettings]  = useState({
    title:              finalExam?.title              || '',
    passing_score:      finalExam?.passing_score      ?? 70,
    time_limit_minutes: finalExam?.time_limit_minutes ?? 90,
  });
  const [dirty,  setDirty]  = useState(false);
  const [saving, setSaving] = useState(false);

  const current    = tab === 'official' ? official : bank;
  const setCurrent = tab === 'official' ? setOfficial : setBank;

  const addQ = () => { setCurrent(q => [...q, emptyQuestion()]); setDirty(true); };

  const updateQ = (key, field, val) => {
    setCurrent(qs => qs.map(q => q._key === key ? { ...q, [field]: val } : q));
    setDirty(true);
  };

  const removeQ = (key) => { setCurrent(qs => qs.filter(q => q._key !== key)); setDirty(true); };

  const cleanQ = ({ _key, ...q }) => ({
    question:      q.question,
    options:       q.options,
    correct_index: Number(q.correct_index),
    explanation:   q.explanation || undefined,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/admin/courses/${courseId}`, {
        final_exam: {
          title:              settings.title,
          passing_score:      Number(settings.passing_score),
          time_limit_minutes: Number(settings.time_limit_minutes),
          questions:          official.filter(q => q.question.trim()).map(cleanQ),
          question_bank:      bank.filter(q => q.question.trim()).map(cleanQ),
        },
      });
      onSaved(res.data.course);
      setDirty(false);
      showToast('Final exam saved!', 'success');
    } catch {
      showToast('Failed to save final exam.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={C.card}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, paddingBottom:10, borderBottom:'1px solid #f1f5f9' }}>
        <BookOpen size={15} color="#10b981" />
        <span style={{ fontSize:14, fontWeight:700, color:'#091925', flex:1 }}>Final Exam</span>
        {dirty && (
          <span style={{ fontSize:10, fontWeight:800, color:'#f59e0b', background:'rgba(245,158,11,0.10)', padding:'2px 8px', borderRadius:999 }}>Unsaved changes</span>
        )}
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, border:'none', background: saving ? '#7FA8C4' : '#10b981', color:'#fff', fontWeight:800, fontSize:12, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:"'Poppins',sans-serif" }}
          >
            <Save size={13} /> {saving ? 'Saving…' : 'Save Exam'}
          </button>
        )}
      </div>

      {/* Settings */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
        {[
          { label:'Exam Title',       key:'title',              type:'text',   placeholder:'e.g. Final Exam' },
          { label:'Passing Score (%)', key:'passing_score',      type:'number', placeholder:'70' },
          { label:'Time Limit (min)', key:'time_limit_minutes', type:'number', placeholder:'90' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <div style={{ fontSize:10, fontWeight:700, color:'#7FA8C4', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:5 }}>{label}</div>
            <input
              type={type}
              value={settings[key]}
              placeholder={placeholder}
              onChange={e => { setSettings(s => ({ ...s, [key]: e.target.value })); setDirty(true); }}
              style={{ width:'100%', padding:'8px 11px', borderRadius:8, border:'1.5px solid rgba(2,8,23,0.12)', fontSize:13, fontWeight:600, color:'#091925', outline:'none', fontFamily:"'Poppins',sans-serif", boxSizing:'border-box' }}
            />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:14, background:'#f8fafc', borderRadius:10, padding:4, width:'fit-content' }}>
        {[
          { key:'official', label:'Official Set',    count: official.length, color:'#10b981' },
          { key:'bank',     label:'Question Bank',   count: bank.length,     color:'#8b5cf6' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, border:'none', background: tab === t.key ? '#fff' : 'transparent', color: tab === t.key ? '#091925' : '#7FA8C4', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:"'Poppins',sans-serif", boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition:'all .15s' }}
          >
            {t.label}
            <span style={{ fontSize:10, fontWeight:900, padding:'1px 6px', borderRadius:999, background: tab === t.key ? `${t.color}18` : 'rgba(2,8,23,0.06)', color: tab === t.key ? t.color : '#7FA8C4' }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Hint */}
      <div style={{ fontSize:11, fontWeight:600, color:'#7FA8C4', marginBottom:12, padding:'8px 12px', background:'rgba(2,8,23,0.02)', borderRadius:8, border:'1px solid rgba(2,8,23,0.06)' }}>
        {tab === 'official'
          ? '📋 Official Set — shown on Attempt 1 of the final exam.'
          : '🔀 Question Bank — shuffled and sampled for Attempt 2+. Add at least 35 questions for best coverage.'}
      </div>

      {/* Questions */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {current.length === 0 && (
          <div style={{ textAlign:'center', padding:'28px', fontSize:13, color:'#7FA8C4', fontWeight:600, background:'#f8fafc', borderRadius:10, border:'1px dashed rgba(2,8,23,0.12)' }}>
            No questions yet. Add your first question below.
          </div>
        )}
        {current.map((q, qi) => (
          <QuestionEditor
            key={q._key}
            q={q} qi={qi}
            onChange={(field, val) => updateQ(q._key, field, val)}
            onRemove={() => removeQ(q._key)}
          />
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={addQ}
        style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:9, border:'1.5px dashed rgba(16,185,129,0.40)', background:'rgba(16,185,129,0.04)', color:'#10b981', cursor:'pointer', fontWeight:800, fontSize:12, fontFamily:"'Poppins',sans-serif", marginTop:10 }}
      >
        <Plus size={13} /> Add Question to {tab === 'official' ? 'Official Set' : 'Question Bank'}
      </button>

      {/* Bottom save */}
      {dirty && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 20px', borderRadius:10, border:'none', background: saving ? '#7FA8C4' : '#10b981', color:'#fff', fontWeight:800, fontSize:13, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:"'Poppins',sans-serif", boxShadow:'0 4px 14px rgba(16,185,129,0.25)' }}
          >
            <Save size={14} /> {saving ? 'Saving…' : 'Save Final Exam'}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── CourseDetail ───────────────────────────────────────────────── */
const CourseDetail = () => {
  const { id }                          = useParams();
  const [course, setCourse]             = useState(null);
  const [enrollments, setEnrollments]   = useState([]);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState(null);
  const [mediaModal, setMediaModal]     = useState(null);
  const [previewModal, setPreviewModal] = useState(null);

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
      showToast('Media updated!', 'success');
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

  if (loading) return <div style={{ padding:32, color:'#7FA8C4', fontFamily:"'Poppins',sans-serif" }}>Loading...</div>;
  if (!course)  return <div style={{ padding:32, color:'#ef4444', fontFamily:"'Poppins',sans-serif" }}>Course not found.</div>;

  return (
    <div style={{ padding:'28px 0', fontFamily:"'Poppins',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:28, right:28, zIndex:999, display:'flex', alignItems:'center', gap:8, background: toast.type === 'success' ? '#10b981' : '#ef4444', color:'#fff', padding:'12px 20px', borderRadius:12, fontSize:13, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,0.15)', fontFamily:"'Poppins',sans-serif" }}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.message}
        </div>
      )}

      <Breadcrumbs items={[
        { label:'Dashboard', path:'/admin/dashboard' },
        { label:'Courses',   path:'/admin/courses' },
        { label: course.title },
      ]} />

      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#091925', marginBottom:4 }}>Course Details</h1>
        <p style={{ fontSize:13, color:'#5B7384' }}>Viewing and editing details for {course.title}.</p>
        <div style={{ height:2, background:'linear-gradient(90deg,#2EABFE,transparent)', borderRadius:99, marginTop:12 }} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:16, alignItems:'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Course Info */}
          <div style={C.card}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ width:64, height:64, borderRadius:16, margin:'0 auto 12px', background: course.type === 'PE' ? 'rgba(139,92,246,0.1)' : 'rgba(46,171,254,0.1)', display:'grid', placeItems:'center' }}>
                <BookOpen size={28} color={course.type === 'PE' ? '#8b5cf6' : '#2EABFE'} />
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:'#091925', lineHeight:1.3, marginBottom:8 }}>{course.title}</div>
              <span style={{ fontSize:12, fontWeight:600, padding:'3px 12px', borderRadius:99, background: course.type === 'PE' ? 'rgba(139,92,246,0.1)' : 'rgba(46,171,254,0.1)', color: course.type === 'PE' ? '#8b5cf6' : '#2EABFE' }}>{course.type}</span>
            </div>
            <div style={C.divider} />
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              {[
                ['NMLS ID',      course.nmls_course_id],
                ['Credit Hours', `${course.credit_hours}h`],
                ['Price',        `$${course.price}`],
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'#7FA8C4' }}>{label}</span>
                  <span style={{ fontWeight:600, color:'#091925' }}>{val}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'#7FA8C4' }}>Status</span>
                <span style={{ fontSize:11, fontWeight:600, padding:'2px 10px', borderRadius:99, background: course.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: course.is_active ? '#10b981' : '#ef4444' }}>
                  {course.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'#7FA8C4' }}>Created</span>
                <span style={{ fontWeight:600, color:'#091925' }}>{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={C.divider} />
            <button onClick={handleToggleStatus} style={{ width:'100%', height:42, borderRadius:10, border:'none', background: course.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', color: course.is_active ? '#ef4444' : '#10b981', fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:"'Poppins',sans-serif" }}>
              {course.is_active ? <><ToggleRight size={16} /> Deactivate</> : <><ToggleLeft size={16} /> Activate</>}
            </button>
          </div>

          {/* Enrolled Students */}
          <div style={C.card}>
            <div style={C.sectionTitle}><Users size={15} color="#2EABFE" /> Enrolled Students</div>
            <div style={{ fontSize:32, fontWeight:800, color:'#091925', marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
              {enrolledCount}
              <span style={{ fontSize:13, fontWeight:500, color:'#7FA8C4' }}>students</span>
            </div>
            <div style={C.divider} />
            {enrollments.length === 0 ? (
              <p style={C.empty}>No enrolled students yet.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {enrollments.map(e => (
                  <div key={e._id} style={{ display:'flex', alignItems:'center', gap:10, background:'#f8fafc', borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'#2EABFE', display:'grid', placeItems:'center', fontSize:11, fontWeight:700, color:'#091925', flexShrink:0 }}>
                      {e.user_id?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#091925', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.user_id?.name || 'Unknown'}</div>
                      <div style={{ fontSize:11, color:'#7FA8C4' }}>{e.progress || 0}% complete</div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:99, flexShrink:0, background: e.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(46,171,254,0.1)', color: e.status === 'completed' ? '#10b981' : '#2EABFE' }}>
                      {e.status || 'in-progress'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Basic Info */}
          <div style={C.card}>
            <div style={C.sectionTitle}>Basic Information</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <EditableField label="Title"       fieldKey="title"       value={course.title}       onSave={handleSave} />
              <EditableField label="Description" fieldKey="description" value={course.description} onSave={handleSave} type="textarea" />
              <EditableField label="Provider"    fieldKey="provider"    value={course.provider}    onSave={handleSave} />
              <EditableField label="Level"       fieldKey="level"       value={course.level}       onSave={handleSave} />
            </div>
          </div>

          {/* Pricing */}
          <div style={C.card}>
            <div style={C.sectionTitle}>Pricing</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              <EditableField label="Price ($)"          fieldKey="price"          value={course.price?.toString()}          onSave={handleSave} type="number" />
              <EditableField label="Credit Hours"       fieldKey="credit_hours"   value={course.credit_hours?.toString()}   onSave={handleSave} type="number" />
              <EditableField label="Textbook Price ($)" fieldKey="textbook_price" value={course.textbook_price?.toString()} onSave={handleSave} type="number" />
              <div style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:11, color:'#7FA8C4', fontWeight:600, marginBottom:4 }}>Has Textbook</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#091925' }}>{course.has_textbook ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          {/* Media */}
          <div style={C.card}>
            <div style={C.sectionTitle}><FileText size={15} color="#f59e0b" /> Media & Resources</div>

            {/* PDF */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f8fafc', borderRadius:10, padding:'12px 14px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
                <div style={{ width:56, height:72, borderRadius:8, flexShrink:0, overflow:'hidden', border:'1px solid rgba(245,158,11,0.3)', background:'#fff' }}>
                  <PDFThumbnail url={course.pdf_url} />
                </div>
                <div>
                  <div style={{ fontSize:11, color:'#7FA8C4', fontWeight:600, marginBottom:4 }}>PDF File</div>
                  <div style={{ fontSize:12, color:'#5B7384', fontWeight:500, wordBreak:'break-all' }}>
                    {course.pdf_url ? course.pdf_url.split('/').pop().split('?')[0] || 'Course PDF' : 'No PDF uploaded'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginLeft:12 }}>
                {course.pdf_url && (
                  <button onClick={() => setPreviewModal({ type:'pdf', url:course.pdf_url })} style={{ padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(245,158,11,0.1)', color:'#f59e0b', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                    <FileText size={13} /> View
                  </button>
                )}
                <button onClick={() => setMediaModal({ type:'pdf' })} style={{ padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(46,171,254,0.1)', color:'#2EABFE', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                  <Upload size={13} /> {course.pdf_url ? 'Replace' : 'Upload'}
                </button>
              </div>
            </div>

            {/* Video */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f8fafc', borderRadius:10, padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
                <div style={{ width:56, height:72, borderRadius:8, flexShrink:0, overflow:'hidden', border:'1px solid rgba(139,92,246,0.3)', background:'#000', position:'relative' }}>
                  {course.video_url ? (
                    <><VideoThumbnail url={course.video_url} /><div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,0.3)' }}><Video size={16} color="#fff" /></div></>
                  ) : (
                    <div style={{ width:'100%', height:'100%', display:'grid', placeItems:'center' }}><Video size={22} color="#cbd5e1" /></div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize:11, color:'#7FA8C4', fontWeight:600, marginBottom:4 }}>Video File</div>
                  <div style={{ fontSize:12, color:'#5B7384', fontWeight:500, wordBreak:'break-all' }}>
                    {course.video_url ? course.video_url.split('/').pop().split('?')[0] || 'Course Video' : 'No video uploaded'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginLeft:12 }}>
                {course.video_url && (
                  <button onClick={() => setPreviewModal({ type:'video', url:course.video_url })} style={{ padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(139,92,246,0.1)', color:'#8b5cf6', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                    <Video size={13} /> View
                  </button>
                )}
                <button onClick={() => setMediaModal({ type:'video' })} style={{ padding:'6px 12px', borderRadius:8, border:'none', background:'rgba(46,171,254,0.1)', color:'#2EABFE', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Poppins',sans-serif", display:'flex', alignItems:'center', gap:6 }}>
                  <Upload size={13} /> {course.video_url ? 'Replace' : 'Upload'}
                </button>
              </div>
            </div>
          </div>

          {/* States */}
          <div style={C.card}>
            <div style={C.sectionTitle}>States Approved</div>
            {!course.states_approved?.length ? (
              <p style={C.empty}>No states listed.</p>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {course.states_approved.map(s => (
                  <span key={s} style={{ fontSize:12, fontWeight:600, padding:'4px 12px', borderRadius:99, background:'rgba(46,171,254,0.08)', color:'#2EABFE', border:'1px solid rgba(46,171,254,0.2)' }}>{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── Modules with Quiz Editor ── */}
          <div style={C.card}>
            <div style={C.sectionTitle}><HelpCircle size={15} color="#f59e0b" /> Modules & Checkpoint Quizzes ({course.modules?.length || 0})</div>

            {!course.modules?.length ? (
              <p style={C.empty}>No modules yet.</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {course.modules.map((m, i) => (
                  <div key={i} style={{ background:'#f8fafc', borderRadius:12, border:'1px solid rgba(2,8,23,0.07)', overflow:'hidden' }}>
                    {/* Module header */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(46,171,254,0.12)', border:'1px solid rgba(46,171,254,0.22)', display:'grid', placeItems:'center', fontSize:11, fontWeight:900, color:'#2EABFE', flexShrink:0 }}>
                          M{m.order}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:'#091925' }}>
                            {m.title}
                          </div>
                          <div style={{ fontSize:11, color:'#7FA8C4', marginTop:2 }}>
                            {m.credit_hours}h · {m.quiz?.length || 0} quiz question{(m.quiz?.length || 0) !== 1 ? 's' : ''}
                            {m.sections?.length > 0 && ` · ${m.sections.length} sections`}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        {m.pdf_url   && <FileText size={14} color="#f59e0b" />}
                        {m.video_url && <Video    size={14} color="#8b5cf6" />}
                      </div>
                    </div>

                    {/* Sections preview */}
                    {m.sections?.filter(Boolean).length > 0 && (
                      <div style={{ padding:'0 16px 10px' }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#7FA8C4', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' }}>Topics</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {m.sections.filter(Boolean).slice(0, 5).map((s, si) => (
                            <span key={si} style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:99, background:'rgba(2,8,23,0.05)', color:'rgba(11,18,32,0.60)' }}>{s}</span>
                          ))}
                          {m.sections.filter(Boolean).length > 5 && (
                            <span style={{ fontSize:11, fontWeight:600, color:'#7FA8C4' }}>+{m.sections.filter(Boolean).length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quiz editor */}
                    <div style={{ padding:'0 16px 14px' }}>
                      <ModuleQuizPanel
                        mod={m}
                        modIdx={i}
                        courseId={id}
                        onSaved={setCourse}
                        showToast={showToast}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Final Exam full editor */}
          <FinalExamPanel
            courseId={id}
            finalExam={course.final_exam}
            onSaved={setCourse}
            showToast={showToast}
          />

        </div>
      </div>

      {mediaModal && (
        <MediaUploadModal
          type={mediaModal.type}
          currentUrl={mediaModal.type === 'pdf' ? course.pdf_url : course.video_url}
          onClose={() => setMediaModal(null)}
          onSave={url => handleMediaSave(mediaModal.type === 'pdf' ? 'pdf_url' : 'video_url', url)}
        />
      )}
      {previewModal && (
        <MediaPreviewModal type={previewModal.type} url={previewModal.url} onClose={() => setPreviewModal(null)} />
      )}
    </div>
  );
};

/* ─── Dialog Styles ──────────────────────────────────────────────── */
const D = {
  backdrop:    { position:'fixed', inset:0, zIndex:300, background:'rgba(9,25,37,0.55)', backdropFilter:'blur(5px)' },
  dialog:      { position:'fixed', zIndex:301, top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'90%', maxWidth:400, background:'#fff', borderRadius:22, padding:'32px 28px 26px', boxShadow:'0 28px 70px rgba(9,25,37,0.20)', textAlign:'center', fontFamily:"'Poppins',sans-serif" },
  dialogTitle: { fontSize:18, fontWeight:700, color:'#091925', marginBottom:8 },
  dialogSub:   { fontSize:13, color:'#5B7384', marginBottom:24 },
  dialogBtns:  { display:'flex', gap:10 },
  cancelBtn:   { flex:1, height:44, background:'rgba(2,8,23,0.04)', border:'1px solid rgba(2,8,23,0.10)', borderRadius:12, cursor:'pointer', fontSize:14, fontWeight:700, color:'rgba(11,18,32,0.72)', fontFamily:'inherit' },
  confirmBtn:  { flex:1, height:44, background:'#2EABFE', border:'none', borderRadius:12, cursor:'pointer', fontSize:14, fontWeight:700, color:'#fff', fontFamily:'inherit' },
};

const C = {
  card:         { background:'#fff', borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize:14, fontWeight:700, color:'#091925', marginBottom:14, paddingBottom:10, borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:8 },
  divider:      { height:'0.5px', background:'#e2e8f0', margin:'14px 0' },
  empty:        { fontSize:13, color:'#7FA8C4' },
};

const iconBtn = (color) => ({ width:28, height:28, borderRadius:7, border:'none', background:`${color}18`, color, cursor:'pointer', display:'grid', placeItems:'center' });

export default CourseDetail;