import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import API from '../../api/axios';
import Layout from '../../components/Layout';
import CertificateTemplate from '../../components/CertificateTemplate';
import CertificateDownloadButton from '../../components/CertificateDownloadButton';
import { downloadCertificatePdf } from '../../services/certificateService';

const Certificate = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [cert, setCert]            = useState(null);
  const [loading, setLoading]      = useState(true);
  const [error, setError]          = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError]     = useState('');

  useEffect(() => {
    const fetchCert = async () => {
      try {
        // ── Strategy 1: try the dedicated endpoint first ──────────────
        // Works if your backend has GET /certificates/:courseId
        try {
          const res = await API.get(`/certificates/${courseId}`);
          if (res.data?.certificate) {
            setCert(buildCertFromEndpoint(res.data.certificate, user));
            return;
          }
        } catch {
          // endpoint doesn't exist or returned 404 — fall through to transcript
        }

        // ── Strategy 2: pull from transcript (always works) ───────────
        const transcriptRes = await API.get('/dashboard/transcript');
        const transcript    = transcriptRes.data?.transcript || [];

        // Match by course _id — transcript entry has course_id as object or string
        const entry = transcript.find((t) => {
          const id = t.course_id?._id || t.course_id;
          return String(id) === String(courseId);
        });

        if (!entry) {
          setError('Certificate not found. Make sure you have completed this course.');
          return;
        }

        setCert(buildCertFromTranscript(entry, user));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load certificate.');
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [courseId, user]);

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    setDownloadError('');
    setDownloadLoading(true);
    try {
      await downloadCertificatePdf(courseId);
    } catch (err) {
      setDownloadError(err?.message || 'Unable to download certificate.');
    } finally {
      setDownloadLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <Layout>
      <style>{spinnerCss}</style>
      <div style={S.center}>
        <div className="cert-spinner" />
        <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(9,25,37,0.50)', fontWeight: 600 }}>
          Loading certificate…
        </div>
      </div>
    </Layout>
  );

  /* ── Error ── */
  if (error) return (
    <Layout>
      <div style={S.center}>
        <div style={S.errorCard}>
          <AlertCircle size={32} color="#ef4444" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontWeight: 800, fontSize: 15, color: '#091925', marginBottom: 8, textAlign: 'center' }}>
            Certificate Not Found
          </div>
          <div style={{ fontSize: 13, color: 'rgba(9,25,37,0.55)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
            {error}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={S.backBtn} onClick={() => navigate('/my-certificates')} type="button">
              <ArrowLeft size={15} /> My Certificates
            </button>
            <button style={S.backBtn} onClick={() => navigate('/my-courses')} type="button">
              My Courses
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );

  /* ── Certificate ── */
  return (
    <Layout>
      <style>{`
        ${spinnerCss}
        @media print {
          .no-print { display: none !important; }
          header, nav, aside { display: none !important; }
          body { margin: 0; background: #fff; }
          .cert-doc { box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>

      <div style={S.container}>

        {/* ── Action bar ── */}
        <div style={S.actionBar} className="no-print">
          <button style={S.backBtn} onClick={() => navigate('/my-certificates')} type="button">
            <ArrowLeft size={15} /> Back to Certificates
          </button>
          <div style={S.rightActions}>
            <CertificateDownloadButton onDownload={handleDownload} loading={downloadLoading} />
            <button style={S.printBtn} onClick={handlePrint} type="button">
              <Download size={15} /> Print
            </button>
          </div>
        </div>

        {/* ── Certificate document ── */}
        <div style={S.certWrapper}>
          <CertificateTemplate cert={cert} />
        </div>
        {downloadError && (
          <div style={S.downloadError}>{downloadError}</div>
        )}
      </div>
    </Layout>
  );
};

/* ─── Data builders ──────────────────────────────────────────────── */
// Builds a normalized cert object from the /certificates/:id endpoint response
const buildCertFromEndpoint = (raw, user) => {
  const certificateId = raw.certificate_id || raw._id || '';
  return {
    student_name:       raw.student_name    || user?.name || '—',
    student_nmls_id:    raw.student_nmls_id || user?.nmls_id || '—',
    course_title:       raw.course_title    || '—',
    nmls_course_id:     raw.nmls_course_id  || '—',
    credit_hours:       raw.credit_hours,
    course_type_label:  raw.course_type === 'PE' ? 'Pre-Licensing Education (PE)' : 'Continuing Education (CE)',
    state:              raw.state           || user?.state,
    state_approval_number: raw.state_approval_number || raw.nmls_course_id || '—',
    completed_at_label: raw.completed_at
      ? new Date(raw.completed_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : '—',
    issued_at_label: raw.issued_at
      ? new Date(raw.issued_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : '—',
    issued_month_year: raw.issued_at
      ? new Date(raw.issued_at).toLocaleDateString('en-US', { month:'long', year:'numeric' })
      : '—',
    cert_id: String(certificateId).toUpperCase() || 'N/A',
    verification_url: raw.verification_url || `relstone.com/verify-certificate/${String(certificateId).toUpperCase()}`,
  };
};

// Builds a normalized cert object from a transcript entry
// transcript entry shape: { _id, course_id: {_id, title, type, credit_hours, nmls_course_id, state_approval_number}, completed_at, ... }
const buildCertFromTranscript = (entry, user) => {
  const course       = entry.course_id || {};
  const courseType   = String(entry.type || course.type || '').toUpperCase();
  const completedAt  = entry.completed_at ? new Date(entry.completed_at) : null;

  const certificateId = entry.certificate_id || entry._id || '';

  return {
    student_name:       user?.name         || entry.student_name    || '—',
    student_nmls_id:    user?.nmls_id      || entry.student_nmls_id || '—',
    course_title:       entry.course_title || course.title          || '—',
    nmls_course_id:     entry.nmls_course_id || course.nmls_course_id || '—',
    credit_hours:       entry.credit_hours || course.credit_hours,
    course_type_label:  courseType === 'PE' ? 'Pre-Licensing Education (PE)' : 'Continuing Education (CE)',
    state:              entry.state        || user?.state,
    state_approval_number: course.state_approval_number || course.nmls_course_id || '—',
    completed_at_label: completedAt
      ? completedAt.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : '—',
    issued_at_label: completedAt
      ? completedAt.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : '—',
    issued_month_year: completedAt
      ? completedAt.toLocaleDateString('en-US', { month:'long', year:'numeric' })
      : '—',
    cert_id: String(certificateId).toUpperCase() || 'N/A',
    verification_url: entry.certificate_url || `relstone.com/verify-certificate/${String(certificateId).toUpperCase()}`,
  };
};

/* ─── Spinner CSS ────────────────────────────────────────────────── */
const spinnerCss = `
  .cert-spinner{width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:cert-spin 1s linear infinite;}
  @keyframes cert-spin{to{transform:rotate(360deg);}}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  container:   { padding: '24px 18px 56px', maxWidth: 1180, margin: '0 auto' },
  center:      { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '1rem' },

  errorCard:   { background: '#fff', border: '1px solid rgba(2,8,23,0.09)', borderRadius: 16, padding: '32px 28px', maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(2,8,23,0.09)' },

  actionBar:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 820, margin: '0 auto 20px', fontFamily: 'Inter, sans-serif' },
  rightActions: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn:     { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(2,8,23,0.12)', padding: '9px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 800, color: 'rgba(9,25,37,0.80)', fontFamily: 'Inter, sans-serif' },
  printBtn:    { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#091925', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 800, fontFamily: 'Inter, sans-serif' },

  certWrapper: { maxWidth: 820, margin: '0 auto' },
  cert:        { background: '#fff', borderRadius: 18, boxShadow: '0 8px 40px rgba(2,8,23,0.14)', overflow: 'hidden', fontFamily: 'Georgia, serif' },
  topAccent:   { height: 8, background: 'linear-gradient(90deg,#2EABFE,#00B4B4)' },

  certHeader:  { textAlign: 'center', padding: '36px 32px 20px' },
  certSealWrap:{ width: 72, height: 72, borderRadius: 999, background: 'rgba(46,171,254,0.08)', border: '2px solid rgba(46,171,254,0.22)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' },
  certOrg:     { fontSize: 12, fontWeight: 900, color: '#2EABFE', textTransform: 'uppercase', letterSpacing: '.12em', fontFamily: 'Inter, sans-serif', marginBottom: 8 },
  certTitle:   { fontSize: '2rem', color: '#091925', margin: '0 0 6px', letterSpacing: '0.04em', fontWeight: 700 },
  certSubtitle:{ color: 'rgba(9,25,37,0.55)', fontSize: '0.9rem', margin: 0, fontFamily: 'Inter, sans-serif' },

  divider:     { height: 1, background: 'linear-gradient(90deg,transparent,rgba(46,171,254,0.25),transparent)', margin: '0 2rem' },
  certifyText: { textAlign: 'center', color: 'rgba(9,25,37,0.55)', fontSize: '0.95rem', margin: '1.5rem 0 0.25rem', fontStyle: 'italic' },
  studentName: { textAlign: 'center', fontSize: '2rem', color: '#2EABFE', margin: '0 0 0.5rem', fontWeight: 700 },
  courseName:  { textAlign: 'center', fontSize: '1.15rem', color: 'rgba(9,25,37,0.85)', margin: '0 2rem 1.5rem', fontWeight: 600 },

  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.25rem', padding: '1.5rem 2.5rem' },
  detailItem:  { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  detailLabel: { margin: 0, fontSize: '0.72rem', color: 'rgba(9,25,37,0.50)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 },
  detailValue: { margin: '0.2rem 0 0', fontSize: '0.95rem', color: 'rgba(9,25,37,0.85)', fontWeight: 700, fontFamily: 'Inter, sans-serif' },

  certFooter:    { textAlign: 'center', padding: '1.5rem 2rem' },
  signatureRow:  { display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 20, marginBottom: 20 },
  sigBlock:      { textAlign: 'center', flex: 1 },
  signatureLine: { width: '160px', height: 1, background: 'rgba(9,25,37,0.25)', margin: '0 auto 8px' },
  signatureLabel:{ fontSize: '0.78rem', color: 'rgba(9,25,37,0.50)', margin: '0 0 4px', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 800 },
  signatureName: { fontSize: '0.90rem', color: 'rgba(9,25,37,0.80)', margin: 0, fontFamily: 'Inter, sans-serif', fontWeight: 800 },
  sealCircle:    { width: 72, height: 72, borderRadius: 999, border: '2px dashed rgba(46,171,254,0.40)', display: 'grid', placeItems: 'center', flexShrink: 0, textAlign: 'center' },
  footerNote:    { fontSize: '0.72rem', color: 'rgba(9,25,37,0.40)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' },

  bottomBar:   { background: 'linear-gradient(90deg,#091925,#0d2a4a)', color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 700, display: 'flex', justifyContent: 'center', gap: 12, padding: '10px 20px', letterSpacing: '.04em', fontFamily: 'Inter, sans-serif' },
  downloadError: { maxWidth: 820, margin: '14px auto 0', padding: '12px 16px', borderRadius: 12, background: 'rgba(254,226,226,0.9)', color: '#991B1B', fontSize: 13, fontWeight: 600, border: '1px solid #FECACA' },
};

export default Certificate;