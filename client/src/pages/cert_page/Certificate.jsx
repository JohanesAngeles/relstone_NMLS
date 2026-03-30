import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import API from '../../api/axios';
import Layout from '../../components/Layout';
import TestimonialGateModal from "../../components/TempModal";

const ATTESTATION_TEXT =
  "By accepting this certificate, I hereby acknowledge receipt of my course completion and authorize the education provider to report my education hours to NMLS. I am the named person on this certificate and have completed this course. I further attest I completed the course in accordance with the Rules of Conduct.";

const Certificate = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [cert, setCert]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [showGate, setShowGate]       = useState(false);
  const [gateChecked, setGateChecked] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchCert = async () => {
      try {
        try {
          const res = await API.get(`/certificates/${courseId}`);
          if (res.data?.certificate) {
            const builtCert = buildCertFromEndpoint(res.data.certificate, user);
            setCert(builtCert);
            checkTestimonial(builtCert.course_title);
            return;
          }
        } catch { /* fall through */ }

        const transcriptRes = await API.get('/dashboard/transcript');
        const transcript    = transcriptRes.data?.transcript || [];
        const entry = transcript.find((t) => {
          const id = t.course_id?._id || t.course_id;
          return String(id) === String(courseId);
        });

        if (!entry) { setError('Certificate not found. Make sure you have completed this course.'); return; }

        const builtCert = buildCertFromTranscript(entry, user);
        setCert(builtCert);
        checkTestimonial(builtCert.course_title);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load certificate.');
      } finally {
        setLoading(false);
      }
    };

    const checkTestimonial = async (title) => {
      if (gateChecked) return;
      try {
        const res = await API.get("/testimonials/mine");
        const already = (res.data?.testimonials || []).some(r => String(r.course_id) === String(courseId));
        if (!already) setShowGate(true);
      } catch {}
      finally { setGateChecked(true); }
    };

    fetchCert();
  }, [courseId, user, gateChecked]);

  const handlePrint = () => window.print();

  if (loading) return (
    <Layout>
      <style>{spinnerCss}</style>
      <div style={S.center}><div className="cert-spinner" /><p style={S.loadText}>Loading certificate…</p></div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div style={S.center}>
        <div style={S.errorCard}>
          <AlertCircle size={32} color="#ef4444" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontWeight: 800, fontSize: 15, color: '#091925', marginBottom: 8, textAlign: 'center' }}>Certificate Not Found</div>
          <div style={{ fontSize: 13, color: 'rgba(9,25,37,0.55)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>{error}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={S.backBtn} onClick={() => navigate('/my-certificates')} type="button"><ArrowLeft size={15} /> My Certificates</button>
            <button style={S.backBtn} onClick={() => navigate('/my-courses')} type="button">My Courses</button>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        ${spinnerCss}
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @media print {
          .no-print { display: none !important; }
          header, nav, aside, .layout-nav { display: none !important; }
          body { margin: 0; background: #fff; }
          #cert-doc { box-shadow: none !important; page-break-inside: avoid; }
        }
      `}</style>

      {showGate && cert && (
        <TestimonialGateModal courseId={courseId} courseName={cert.course_title} onDone={() => setShowGate(false)} />
      )}

      <div style={S.page}>
        {/* Action bar */}
        <div style={S.actionBar} className="no-print">
          <button style={S.backBtn} onClick={() => navigate('/my-certificates')} type="button">
            <ArrowLeft size={15} /> Back to Certificates
          </button>
          <button style={S.printBtn} onClick={handlePrint} type="button">
            <Download size={15} /> Download / Print
          </button>
        </div>

        {/* ── Certificate Document ── */}
        <div style={S.certOuter} ref={printRef}>
          <div id="cert-doc" style={S.certDoc}>

            {/* Watermark diagonals */}
            <div style={S.watermarkLeft} />
            <div style={S.watermarkRight} />

            {/* Header */}
            <div style={S.header}>
              {/* Logo lockup */}
              <div style={S.logoWrap}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <rect width="52" height="52" rx="10" fill="#0B2E4E"/>
                  <path d="M10 38 L26 14 L42 38 Z" fill="none" stroke="#2EABFE" strokeWidth="3" strokeLinejoin="round"/>
                  <path d="M18 38 L26 24 L34 38 Z" fill="#2EABFE"/>
                  <rect x="22" y="28" width="8" height="10" rx="1" fill="#fff" opacity="0.9"/>
                </svg>
                <div>
                  <div style={S.logoName}>RELSTONE</div>
                  <div style={S.logoSub}>Real Estate License Services</div>
                </div>
              </div>
              <div style={S.providerBadge}>NMLS PROVIDER #1405039</div>
            </div>

            {/* Big title */}
            <div style={S.titleSection}>
              <h1 style={S.bigTitle}>CERTIFICATE OF COURSE COMPLETION</h1>
              <p style={S.certifiesText}>This certifies that</p>
            </div>

            {/* Student block */}
            <div style={S.studentBlock}>
              <div style={S.studentName}>{cert.student_name}</div>
              <div style={S.mloId}>MLO ID #{cert.student_nmls_id || '—'}</div>
              <div style={S.nameLine} />
            </div>

            <p style={S.hasCompleted}>has successfully completed the</p>

            {/* Course name */}
            <div style={S.courseBlock}>
              <h2 style={S.courseName}>{cert.course_title}</h2>
            </div>

            {/* Course meta */}
            <div style={S.metaRow}>
              <span style={S.metaItem}>Course Number: <strong>{cert.nmls_course_id || '—'}</strong></span>
              <span style={S.metaDot}>·</span>
              <span style={S.metaItem}>Course Completion Date: <strong>{cert.completed_at_label}</strong></span>
              {cert.credit_hours && <>
                <span style={S.metaDot}>·</span>
                <span style={S.metaItem}>Credit Hours: <strong>{cert.credit_hours}</strong></span>
              </>}
            </div>

            {/* Attestation box */}
            <div style={S.attestBox}>
              <p style={S.attestText}>{ATTESTATION_TEXT}</p>
            </div>

            {/* Signature row */}
            <div style={S.sigRow}>
              <div style={S.sigBlock}>
                <div style={S.sigLine} />
                <div style={S.sigName}>Andy M. Zubia</div>
                <div style={S.sigTitle}>President &amp; CEO</div>
                <div style={S.sigOrg}>RELSTONE - Real Estate License Services</div>
              </div>
            </div>

            {/* Bottom geometric shapes — matching the PDF */}
            <div style={S.geoBottom}>
              <div style={S.geoLeft}>
                <div style={S.geoTri1} />
                <div style={S.geoTri2} />
              </div>
              <div style={S.geoCenterFill} />
              <div style={S.geoRight}>
                <div style={S.geoTri3} />
                <div style={S.geoTri4} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

/* ─── Data builders (unchanged from original) ────────────────────── */
const buildCertFromEndpoint = (raw, user) => ({
  student_name:         raw.student_name    || user?.name    || '—',
  student_nmls_id:      raw.student_nmls_id || user?.nmls_id || '—',
  course_title:         raw.course_title    || '—',
  nmls_course_id:       raw.nmls_course_id  || '—',
  credit_hours:         raw.credit_hours,
  course_type_label:    raw.course_type === 'PE' ? 'Pre-Licensing Education (PE)' : 'Continuing Education (CE)',
  state:                raw.state           || user?.state,
  state_approval_number: raw.state_approval_number,
  completed_at_label:   raw.completed_at
    ? new Date(raw.completed_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : '—',
  issued_at_label: raw.issued_at
    ? new Date(raw.issued_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : '—',
  issued_month_year: raw.issued_at
    ? new Date(raw.issued_at).toLocaleDateString('en-US', { month:'long', year:'numeric' })
    : '—',
  cert_id: String(raw._id || '').slice(-10).toUpperCase() || 'N/A',
});

const buildCertFromTranscript = (entry, user) => {
  const course      = entry.course_id || {};
  const courseType  = String(entry.type || course.type || '').toUpperCase();
  const completedAt = entry.completed_at ? new Date(entry.completed_at) : null;
  return {
    student_name:         user?.name      || entry.student_name    || '—',
    student_nmls_id:      user?.nmls_id   || entry.student_nmls_id || '—',
    course_title:         entry.course_title || course.title        || '—',
    nmls_course_id:       entry.nmls_course_id || course.nmls_course_id || '—',
    credit_hours:         entry.credit_hours   || course.credit_hours,
    course_type_label:    courseType === 'PE' ? 'Pre-Licensing Education (PE)' : 'Continuing Education (CE)',
    state:                entry.state    || user?.state,
    state_approval_number: course.state_approval_number,
    completed_at_label:   completedAt
      ? completedAt.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : '—',
    issued_at_label: completedAt
      ? completedAt.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : '—',
    issued_month_year: completedAt
      ? completedAt.toLocaleDateString('en-US', { month:'long', year:'numeric' })
      : '—',
    cert_id: String(entry._id || '').slice(-10).toUpperCase() || 'N/A',
  };
};

const spinnerCss = `
  .cert-spinner{width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:cert-spin 1s linear infinite;}
  @keyframes cert-spin{to{transform:rotate(360deg);}}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:       { padding: '24px 18px 56px', maxWidth: 1000, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
  center:     { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '1rem' },
  loadText:   { fontSize: 13, color: 'rgba(9,25,37,0.50)', fontWeight: 600, margin: 0 },
  errorCard:  { background: '#fff', border: '1px solid rgba(2,8,23,0.09)', borderRadius: 16, padding: '32px 28px', maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(2,8,23,0.09)' },

  actionBar:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 820, margin: '0 auto 20px' },
  backBtn:    { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(2,8,23,0.12)', padding: '9px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'rgba(9,25,37,0.80)' },
  printBtn:   { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0B2E4E', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 },

  certOuter:  { maxWidth: 820, margin: '0 auto' },

  /* The white certificate card */
  certDoc: {
    position: 'relative',
    background: '#ffffff',
    borderRadius: 6,
    boxShadow: '0 12px 60px rgba(2,8,23,0.18)',
    overflow: 'hidden',
    paddingBottom: 0,
    /* subtle diagonal texture like the PDF */
    backgroundImage: 'repeating-linear-gradient(135deg, rgba(14,60,100,0.025) 0px, rgba(14,60,100,0.025) 1px, transparent 1px, transparent 60px)',
  },

  /* Faint diagonal watermark slashes in corners */
  watermarkLeft: {
    position: 'absolute', top: -60, left: -60,
    width: 220, height: 220,
    background: 'linear-gradient(135deg, rgba(46,171,254,0.06) 0%, transparent 60%)',
    transform: 'rotate(-15deg)',
    pointerEvents: 'none',
  },
  watermarkRight: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220,
    background: 'linear-gradient(225deg, rgba(46,171,254,0.06) 0%, transparent 60%)',
    transform: 'rotate(15deg)',
    pointerEvents: 'none',
  },

  /* Header: logo + provider badge */
  header: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '32px 40px 16px', gap: 8,
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  logoName: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: '#0B2E4E', letterSpacing: '.04em' },
  logoSub:  { fontSize: 10, fontWeight: 700, color: '#2EABFE', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 2 },
  providerBadge: {
    fontSize: 12, fontWeight: 800, color: '#0B2E4E',
    letterSpacing: '.10em', textTransform: 'uppercase',
    border: '1.5px solid #2EABFE', borderRadius: 4,
    padding: '4px 12px', marginTop: 4,
  },

  /* Big title block */
  titleSection: { textAlign: 'center', padding: '8px 40px 0' },
  bigTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(22px, 4vw, 36px)',
    fontWeight: 900, color: '#0B2E4E',
    letterSpacing: '.03em', margin: '0 0 16px',
    lineHeight: 1.15,
  },
  certifiesText: { fontSize: 15, color: 'rgba(9,25,37,0.55)', margin: 0, fontStyle: 'italic' },

  /* Student name */
  studentBlock: { textAlign: 'center', padding: '14px 40px 6px' },
  studentName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(28px, 5vw, 44px)',
    fontWeight: 900, color: '#0B2E4E',
    letterSpacing: '.01em', marginBottom: 6,
    lineHeight: 1.2,
  },
  mloId: { fontSize: 15, fontWeight: 700, color: 'rgba(9,25,37,0.65)', marginBottom: 10 },
  nameLine: { width: '50%', height: 1.5, background: '#0B2E4E', margin: '0 auto' },

  hasCompleted: { textAlign: 'center', fontSize: 15, color: 'rgba(9,25,37,0.55)', margin: '12px 0 8px', fontStyle: 'italic' },

  /* Course name */
  courseBlock: { textAlign: 'center', padding: '0 40px 6px' },
  courseName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(18px, 3vw, 26px)',
    fontWeight: 900, color: '#0B2E4E',
    margin: 0, lineHeight: 1.3,
  },

  /* Meta row */
  metaRow: {
    display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
    gap: '4px 12px', padding: '10px 40px 8px',
    fontSize: 13, color: '#2EABFE',
  },
  metaItem: { fontWeight: 600, color: 'rgba(9,25,37,0.65)' },
  metaDot:  { color: 'rgba(9,25,37,0.30)', fontWeight: 400 },

  /* Attestation */
  attestBox: {
    margin: '12px 40px 16px',
    background: 'rgba(240,246,250,0.80)',
    border: '1px solid rgba(46,171,254,0.20)',
    borderRadius: 8,
    padding: '14px 20px',
  },
  attestText: { fontSize: 12, lineHeight: 1.7, color: 'rgba(9,25,37,0.72)', fontWeight: 500, margin: 0, textAlign: 'center' },

  /* Signature */
  sigRow:   { display: 'flex', justifyContent: 'center', padding: '8px 40px 20px' },
  sigBlock: { textAlign: 'center' },
  sigLine:  { width: 200, height: 1, background: '#0B2E4E', margin: '0 auto 8px' },
  sigName:  { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#0B2E4E' },
  sigTitle: { fontSize: 12, fontWeight: 700, color: 'rgba(9,25,37,0.60)', marginTop: 3 },
  sigOrg:   { fontSize: 12, fontWeight: 600, color: 'rgba(9,25,37,0.50)', marginTop: 2 },

  /* ── Geometric bottom shapes — replicating the PDF blue triangles ── */
  geoBottom: {
    position: 'relative', height: 100,
    display: 'flex', alignItems: 'flex-end',
    background: 'transparent', overflow: 'hidden',
    marginTop: 0,
  },
  geoLeft: { position: 'absolute', bottom: 0, left: 0, display: 'flex', alignItems: 'flex-end', gap: 0 },
  geoRight:{ position: 'absolute', bottom: 0, right: 0, display: 'flex', alignItems: 'flex-end', gap: 0 },
  geoCenterFill: {
    position: 'absolute', bottom: 0, left: '18%', right: '18%',
    height: 44,
    background: 'linear-gradient(180deg, #1A6FAB 0%, #0B2E4E 100%)',
    clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)',
  },
  /* Left side: dark tall triangle + lighter smaller one */
  geoTri1: {
    width: 0, height: 0,
    borderLeft: '90px solid transparent',
    borderRight: '90px solid transparent',
    borderBottom: '100px solid #0B2E4E',
    marginRight: -30,
  },
  geoTri2: {
    width: 0, height: 0,
    borderLeft: '70px solid transparent',
    borderRight: '70px solid transparent',
    borderBottom: '80px solid #2EABFE',
    opacity: 0.85,
  },
  /* Right side: mirrored */
  geoTri3: {
    width: 0, height: 0,
    borderLeft: '70px solid transparent',
    borderRight: '70px solid transparent',
    borderBottom: '80px solid #2EABFE',
    opacity: 0.85, marginRight: -30,
  },
  geoTri4: {
    width: 0, height: 0,
    borderLeft: '90px solid transparent',
    borderRight: '90px solid transparent',
    borderBottom: '100px solid #0B2E4E',
  },
};

export default Certificate;