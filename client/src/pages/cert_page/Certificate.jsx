import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, User, Hash, BookOpen, Clock, Calendar, ArrowLeft, Download } from 'lucide-react';
import API from '../../api/axios';
import Layout from '../../components/Layout';

const Certificate = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const [cert, setCert]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const printRef = useRef();

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await API.get(`/certificates/${courseId}`);
        setCert(res.data.certificate);
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [courseId]);

  const handlePrint = () => window.print();

  if (loading) return (
    <Layout>
      <div style={styles.center}>
        <div className="cert-spinner" />
        <style>{`.cert-spinner{width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:cert-spin 1s linear infinite;}@keyframes cert-spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div style={styles.center}>
        <div style={styles.errorBox}>
          <p style={{ color:'#b91c1c', fontWeight:700, margin:0 }}>{error}</p>
          <button style={styles.backBtn} onClick={() => navigate('/certificates')}>
            Back to Certificates
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          header { display: none !important; }
          body { margin: 0; background: #fff; }
        }
      `}</style>

      <div style={styles.container}>

        {/* ── Action Bar ── */}
        <div style={styles.actionBar} className="no-print">
          <button style={styles.backBtn} onClick={() => navigate('/certificates')} type="button">
            <ArrowLeft size={15} style={{ marginRight:6 }} />
            Back to Certificates
          </button>
          <button style={styles.printBtn} onClick={handlePrint} type="button">
            <Download size={15} style={{ marginRight:6 }} />
            Download / Print
          </button>
        </div>

        {/* ── Certificate Document ── */}
        <div style={styles.certWrapper} ref={printRef}>
          <div style={styles.cert}>

            <div style={styles.topAccent} />

            <div style={styles.certHeader}>
              <div style={styles.certSealWrap}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" stroke="#2EABFE" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5" stroke="#60C3FF" strokeWidth="1.8" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.certOrg}>Relstone NMLS</div>
              <h1 style={styles.certTitle}>Certificate of Completion</h1>
              <p style={styles.certSubtitle}>Nationwide Mortgage Licensing System (NMLS)</p>
            </div>

            <div style={styles.divider} />

            <p style={styles.certifyText}>This certifies that</p>
            <h2 style={styles.studentName}>{cert.student_name}</h2>
            <p style={styles.certifyText}>has successfully completed</p>
            <h3 style={styles.courseName}>{cert.course_title}</h3>

            <div style={styles.divider} />

            <div style={styles.detailsGrid}>
              <DetailItem icon={<Hash size={17} color="#2EABFE" />}     label="NMLS Course ID"    value={cert.nmls_course_id} />
              <DetailItem icon={<User size={17} color="#2EABFE" />}     label="Student NMLS ID"   value={cert.student_nmls_id || 'N/A'} />
              <DetailItem icon={<BookOpen size={17} color="#2EABFE" />} label="Course Type"       value={cert.course_type === 'PE' ? 'Pre-Licensing (PE)' : 'Continuing Education (CE)'} />
              <DetailItem icon={<Clock size={17} color="#2EABFE" />}    label="Credit Hours"      value={`${cert.credit_hours} Hours`} />
              <DetailItem icon={<Calendar size={17} color="#2EABFE" />} label="Date Completed"    value={new Date(cert.completed_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })} />
              <DetailItem icon={<Calendar size={17} color="#2EABFE" />} label="Date Issued"       value={new Date(cert.issued_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })} />
            </div>

            <div style={styles.divider} />

            <div style={styles.certFooter}>
              <div style={styles.signatureRow}>
                <div style={styles.sigBlock}>
                  <div style={styles.signatureLine} />
                  <p style={styles.signatureLabel}>Authorized Signature</p>
                  <p style={styles.signatureName}>Relstone NMLS</p>
                </div>
                <div style={styles.sealCircle}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="1.6" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5" stroke="#2EABFE" strokeWidth="1.6" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5" stroke="#60C3FF" strokeWidth="1.6" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ fontSize:8, fontWeight:900, color:"#2EABFE", letterSpacing:".10em", marginTop:3 }}>OFFICIAL</div>
                </div>
                <div style={styles.sigBlock}>
                  <div style={styles.signatureLine} />
                  <p style={styles.signatureLabel}>Date Issued</p>
                  <p style={styles.signatureName}>{new Date(cert.issued_at).toLocaleDateString('en-US', { month:'long', year:'numeric' })}</p>
                </div>
              </div>
              <p style={styles.footerNote}>
                This certificate is issued in accordance with the SAFE Mortgage Licensing Act
                and confirms completion of NMLS-approved education requirements.
              </p>
            </div>

            <div style={styles.bottomBar}>
              <span>Certificate ID: {String(cert._id || "").slice(-10).toUpperCase()}</span>
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

/* ── Detail Item atom ── */
const DetailItem = ({ icon, label, value }) => (
  <div style={styles.detailItem}>
    {icon}
    <div>
      <p style={styles.detailLabel}>{label}</p>
      <p style={styles.detailValue}>{value}</p>
    </div>
  </div>
);

const styles = {
  container:      { padding:'24px 18px 56px', maxWidth:1180, margin:'0 auto' },
  center:         { display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', minHeight:'60vh', gap:'1rem' },
  errorBox:       { display:'grid', gap:14, textAlign:'center' },

  actionBar:      { display:'flex', justifyContent:'space-between', alignItems:'center', maxWidth:820, margin:'0 auto 20px', fontFamily:'Inter,sans-serif' },
  backBtn:        { display:'inline-flex', alignItems:'center', background:'#fff', border:'1px solid rgba(2,8,23,0.12)', padding:'9px 14px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:800, color:'rgba(9,25,37,0.80)', fontFamily:'Inter,sans-serif' },
  printBtn:       { display:'inline-flex', alignItems:'center', background:'#091925', color:'#fff', border:'none', padding:'9px 16px', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:800, fontFamily:'Inter,sans-serif' },

  certWrapper:    { maxWidth:820, margin:'0 auto' },
  cert:           { background:'#fff', borderRadius:18, boxShadow:'0 8px 40px rgba(2,8,23,0.14)', overflow:'hidden', fontFamily:'Georgia, serif' },
  topAccent:      { height:8, background:'linear-gradient(90deg,#2EABFE,#00B4B4)' },

  certHeader:     { textAlign:'center', padding:'36px 32px 20px' },
  certSealWrap:   { width:72, height:72, borderRadius:999, background:'rgba(46,171,254,0.08)', border:'2px solid rgba(46,171,254,0.22)', display:'grid', placeItems:'center', margin:'0 auto 14px' },
  certOrg:        { fontSize:12, fontWeight:900, color:'#2EABFE', textTransform:'uppercase', letterSpacing:'.12em', fontFamily:'Inter,sans-serif', marginBottom:8 },
  certTitle:      { fontSize:'2rem', color:'#091925', margin:'0 0 6px', letterSpacing:'0.04em', fontWeight:700 },
  certSubtitle:   { color:'rgba(9,25,37,0.55)', fontSize:'0.9rem', margin:0, fontFamily:'Inter,sans-serif' },

  divider:        { height:1, background:'linear-gradient(90deg,transparent,rgba(46,171,254,0.25),transparent)', margin:'0 2rem' },
  certifyText:    { textAlign:'center', color:'rgba(9,25,37,0.55)', fontSize:'0.95rem', margin:'1.5rem 0 0.25rem', fontStyle:'italic' },
  studentName:    { textAlign:'center', fontSize:'2rem', color:'#2EABFE', margin:'0 0 0.5rem', fontWeight:700 },
  courseName:     { textAlign:'center', fontSize:'1.15rem', color:'rgba(9,25,37,0.85)', margin:'0 2rem 1.5rem', fontWeight:600 },

  detailsGrid:    { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.25rem', padding:'1.5rem 2.5rem' },
  detailItem:     { display:'flex', alignItems:'flex-start', gap:'0.75rem' },
  detailLabel:    { margin:0, fontSize:'0.72rem', color:'rgba(9,25,37,0.50)', fontFamily:'Inter,sans-serif', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:800 },
  detailValue:    { margin:'0.2rem 0 0', fontSize:'0.95rem', color:'rgba(9,25,37,0.85)', fontWeight:700, fontFamily:'Inter,sans-serif' },

  certFooter:     { textAlign:'center', padding:'1.5rem 2rem 1.5rem' },
  signatureRow:   { display:'flex', alignItems:'center', justifyContent:'space-around', gap:20, marginBottom:20 },
  sigBlock:       { textAlign:'center', flex:1 },
  signatureLine:  { width:'160px', height:1, background:'rgba(9,25,37,0.25)', margin:'0 auto 8px' },
  signatureLabel: { fontSize:'0.78rem', color:'rgba(9,25,37,0.50)', margin:'0 0 4px', fontFamily:'Inter,sans-serif', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:800 },
  signatureName:  { fontSize:'0.90rem', color:'rgba(9,25,37,0.80)', margin:0, fontFamily:'Inter,sans-serif', fontWeight:800 },
  sealCircle:     { width:72, height:72, borderRadius:999, border:'2px dashed rgba(46,171,254,0.40)', display:'grid', placeItems:'center', flexShrink:0, textAlign:'center' },
  footerNote:     { fontSize:'0.72rem', color:'rgba(9,25,37,0.40)', maxWidth:500, margin:'0 auto', lineHeight:1.7, fontFamily:'Inter,sans-serif' },

  bottomBar:      { background:'linear-gradient(90deg,#091925,#0d2a4a)', color:'rgba(255,255,255,0.55)', fontSize:10, fontWeight:700, display:'flex', justifyContent:'center', gap:12, padding:'10px 20px', letterSpacing:'.04em', fontFamily:'Inter,sans-serif' },
};

export default Certificate;