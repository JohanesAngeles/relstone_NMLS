import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Award, User, Hash, BookOpen, Clock, Calendar, ArrowLeft, Download, AlertCircle } from 'lucide-react';
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
  
  // ── Testimonial Gate State ──
  const [showGate, setShowGate] = useState(false); //
  const [gateChecked, setGateChecked] = useState(false); //
  
  const printRef = useRef();

  useEffect(() => {
    const fetchCert = async () => {
      try {
        // ── Strategy 1: try the dedicated endpoint first ──────────────
        try {
          const res = await API.get(`/certificates/${courseId}`);
          if (res.data?.certificate) {
            const builtCert = buildCertFromEndpoint(res.data.certificate, user);
            setCert(builtCert);
            checkTestimonial(builtCert.course_title); //
            return;
          }
        } catch {
          // endpoint doesn't exist or returned 404 — fall through to transcript
        }

        // ── Strategy 2: pull from transcript (always works) ───────────
        const transcriptRes = await API.get('/dashboard/transcript');
        const transcript    = transcriptRes.data?.transcript || [];

        const entry = transcript.find((t) => {
          const id = t.course_id?._id || t.course_id;
          return String(id) === String(courseId);
        });

        if (!entry) {
          setError('Certificate not found. Make sure you have completed this course.');
          return;
        }

        const builtCert = buildCertFromTranscript(entry, user);
        setCert(builtCert);
        checkTestimonial(builtCert.course_title); //

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load certificate.');
      } finally {
        setLoading(false);
      }
    };

    const checkTestimonial = async (title) => {
      if (gateChecked) return; //
      try {
        const res = await API.get("/testimonials/mine"); //
        const reviews = res.data?.testimonials || []; //
        const already = reviews.some(r => String(r.course_id) === String(courseId)); //
        if (!already) setShowGate(true); //
      } catch (err) {
        console.error("Testimonial check failed", err);
      } finally {
        setGateChecked(true); //
      }
    };

    fetchCert();
  }, [courseId, user, gateChecked]);

  const handlePrint = () => window.print();

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

      {/* ── Testimonial Gate ── */}
      {showGate && cert && (
        <TestimonialGateModal
          courseId={courseId}
          courseName={cert.course_title}
          onDone={() => setShowGate(false)}
        />
      )}

      <div style={S.container}>

        {/* ── Action bar ── */}
        <div style={S.actionBar} className="no-print">
          <button style={S.backBtn} onClick={() => navigate('/my-certificates')} type="button">
            <ArrowLeft size={15} /> Back to Certificates
          </button>
          <button style={S.printBtn} onClick={handlePrint} type="button">
            <Download size={15} /> Download / Print
          </button>
        </div>

        {/* ── Certificate document ── */}
        <div style={S.certWrapper} ref={printRef}>
          <div style={S.cert} className="cert-doc">

            <div style={S.topAccent} />

            <div style={S.certHeader}>
              <div style={S.certSealWrap}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5"             stroke="#2EABFE" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5"             stroke="#60C3FF" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={S.certOrg}>Relstone NMLS</div>
              <h1 style={S.certTitle}>Certificate of Completion</h1>
              <p style={S.certSubtitle}>Nationwide Mortgage Licensing System (NMLS)</p>
            </div>

            <div style={S.divider} />

            <p style={S.certifyText}>This certifies that</p>
            <h2 style={S.studentName}>{cert.student_name}</h2>
            <p style={S.certifyText}>has successfully completed</p>
            <h3 style={S.courseName}>{cert.course_title}</h3>

            <div style={S.divider} />

            <div style={S.detailsGrid}>
              <DetailItem icon={<Hash size={17} color="#2EABFE" />}     label="NMLS Course ID"  value={cert.nmls_course_id || '—'} />
              <DetailItem icon={<User size={17} color="#2EABFE" />}     label="Student NMLS ID" value={cert.student_nmls_id || '—'} />
              <DetailItem icon={<BookOpen size={17} color="#2EABFE" />} label="Course Type"     value={cert.course_type_label} />
              <DetailItem icon={<Clock size={17} color="#2EABFE" />}    label="Credit Hours"    value={cert.credit_hours ? `${cert.credit_hours} Hours` : '—'} />
              <DetailItem icon={<Calendar size={17} color="#2EABFE" />} label="Date Completed"  value={cert.completed_at_label} />
              <DetailItem icon={<Calendar size={17} color="#2EABFE" />} label="Date Issued"     value={cert.issued_at_label} />
              {cert.state && (
                <DetailItem icon={<Award size={17} color="#2EABFE" />} label="State" value={cert.state} />
              )}
              {cert.state_approval_number && (
                <DetailItem icon={<Hash size={17} color="#2EABFE" />} label="State Approval #" value={cert.state_approval_number} />
              )}
            </div>

            <div style={S.divider} />

            <div style={S.certFooter}>
              <div style={S.signatureRow}>
                <div style={S.sigBlock}>
                  <div style={S.signatureLine} />
                  <p style={S.signatureLabel}>Authorized Signature</p>
                  <p style={S.signatureName}>Relstone NMLS</p>
                </div>
                <div style={S.sealCircle}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="1.6" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5"             stroke="#2EABFE" strokeWidth="1.6" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5"             stroke="#60C3FF" strokeWidth="1.6" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ fontSize: 8, fontWeight: 900, color: '#2EABFE', letterSpacing: '.10em', marginTop: 3 }}>
                    OFFICIAL
                  </div>
                </div>
                <div style={S.sigBlock}>
                  <div style={S.signatureLine} />
                  <p style={S.signatureLabel}>Date Issued</p>
                  <p style={S.signatureName}>{cert.issued_month_year}</p>
                </div>
              </div>

              <p style={S.footerNote}>
                This certificate is issued in accordance with the SAFE Mortgage Licensing Act
                and confirms completion of NMLS-approved education requirements.
              </p>
            </div>

            <div style={S.attestationWrap}>
              <div style={S.attestationLabel}>Attestation</div>
              <div style={S.attestationText}>{ATTESTATION_TEXT}</div>
            </div>

            <div style={S.bottomBar}>
              <span>Certificate ID: {cert.cert_id}</span>
              <span>·</span>
              <span>Relstone NMLS · relstone.com</span>
              <span>·</span>
              <span>NMLS Approved Provider</span>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

/* ─── Data builders ──────────────────────────────────────────────── */
const buildCertFromEndpoint = (raw, user) => ({
  student_name:       raw.student_name    || user?.name || '—',
  student_nmls_id:    raw.student_nmls_id || user?.nmls_id || '—',
  course_title:       raw.course_title    || '—',
  nmls_course_id:     raw.nmls_course_id  || '—',
  credit_hours:       raw.credit_hours,
  course_type_label:  raw.course_type === 'PE' ? 'Pre-Licensing Education (PE)' : 'Continuing Education (CE)',
  state:              raw.state           || user?.state,
  state_approval_number: raw.state_approval_number,
  completed_at_label: raw.completed_at
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
  const course       = entry.course_id || {};
  const courseType   = String(entry.type || course.type || '').toUpperCase();
  const completedAt  = entry.completed_at ? new Date(entry.completed_at) : null;

  return {
    student_name:       user?.name         || entry.student_name    || '—',
    student_nmls_id:    user?.nmls_id      || entry.student_nmls_id || '—',
    course_title:       entry.course_title || course.title          || '—',
    nmls_course_id:     entry.nmls_course_id || course.nmls_course_id || '—',
    credit_hours:       entry.credit_hours || course.credit_hours,
    course_type_label:  courseType === 'PE' ? 'Pre-Licensing Education (PE)' : 'Continuing Education (CE)',
    state:              entry.state        || user?.state,
    state_approval_number: course.state_approval_number,
    completed_at_label: completedAt
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

const DetailItem = ({ icon, label, value }) => (
  <div style={S.detailItem}>
    {icon}
    <div>
      <p style={S.detailLabel}>{label}</p>
      <p style={S.detailValue}>{value}</p>
    </div>
  </div>
);

const spinnerCss = `
  .cert-spinner{width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:cert-spin 1s linear infinite;}
  @keyframes cert-spin{to{transform:rotate(360deg);}}
`;

const S = {
  container:   { padding: '24px 18px 56px', maxWidth: 1180, margin: '0 auto' },
  center:      { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: '1rem' },
  errorCard:   { background: '#fff', border: '1px solid rgba(2,8,23,0.09)', borderRadius: 16, padding: '32px 28px', maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(2,8,23,0.09)' },
  actionBar:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 820, margin: '0 auto 20px', fontFamily: 'Inter, sans-serif' },
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
  attestationWrap: { padding: '18px 32px 10px', fontFamily: 'Inter, sans-serif' },
  attestationLabel:{ fontSize: 11, fontWeight: 900, color: 'rgba(9,25,37,0.55)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 },
  attestationText: { fontSize: 12, lineHeight: 1.55, fontWeight: 600, color: 'rgba(9,25,37,0.80)' },
};

export default Certificate;