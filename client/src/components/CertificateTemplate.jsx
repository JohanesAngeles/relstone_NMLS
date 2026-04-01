import { Award, User, Hash, BookOpen, Clock, Calendar } from 'lucide-react';

const CertificateTemplate = ({ cert }) => {
  const issuedAt = cert.issued_at_label || '—';
  const completedAt = cert.completed_at_label || '—';
  const certId = cert.cert_id || 'N/A';
  const verificationUrl = cert.verification_url || 'relstone.com/verify';

  return (
    <div style={S.cert} className="cert-doc">
      <div style={S.topAccent} />
      <div style={S.certHeader}>
        <div style={S.certSealWrap}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M2 17l10 5 10-5" stroke="#2EABFE" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M2 12l10 5 10-5" stroke="#60C3FF" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={S.certOrg}>Relstone</div>
        <h1 style={S.certTitle}>Certificate of Completion</h1>
        <p style={S.certSubtitle}>Awarded for successful completion of NMLS-approved course work</p>
      </div>

      <div style={S.divider} />

      <p style={S.certifyText}>This certifies that</p>
      <h2 style={S.studentName}>{cert.student_name}</h2>
      <p style={S.certifyText}>has successfully completed</p>
      <h3 style={S.courseName}>{cert.course_title}</h3>

      <div style={S.divider} />

      <div style={S.detailsGrid}>
        <DetailItem icon={<User size={18} color="#2EABFE" />} label="Student Name" value={cert.student_name} />
        <DetailItem icon={<BookOpen size={18} color="#2EABFE" />} label="Course Title" value={cert.course_title} />
        <DetailItem icon={<Calendar size={18} color="#2EABFE" />} label="Completion Date" value={completedAt} />
        <DetailItem icon={<Award size={18} color="#2EABFE" />} label="State Approval #" value={cert.state_approval_number || '—'} />
        <DetailItem icon={<Hash size={18} color="#2EABFE" />} label="Certificate ID" value={certId} />
        <DetailItem icon={<Clock size={18} color="#2EABFE" />} label="Verification URL" value={verificationUrl} />
      </div>

      <div style={S.divider} />

      <div style={S.certFooter}>
        <div style={S.signatureRow}>
          <div style={S.sigBlock}>
            <div style={S.signatureLine} />
            <p style={S.signatureLabel}>Authorized Signature</p>
            <p style={S.signatureName}>Relstone NMLS</p>
          </div>
          <div style={S.sigBlock}>
            <div style={S.signatureLine} />
            <p style={S.signatureLabel}>Date Issued</p>
            <p style={S.signatureName}>{issuedAt}</p>
          </div>
        </div>

        <p style={S.footerNote}>
          This certificate verifies successful completion of course requirements and confirms approval under state and federal mortgage education standards.
        </p>
      </div>

      <div style={S.bottomBar}>
        <span>Relstone NMLS</span>
        <span>Certificate ID: {certId}</span>
        <span>{verificationUrl}</span>
      </div>
    </div>
  );
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

const S = {
  cert: { background: '#fff', borderRadius: 18, boxShadow: '0 10px 40px rgba(2,8,23,0.14)', overflow: 'hidden', fontFamily: 'Georgia, serif' },
  topAccent: { height: 8, background: 'linear-gradient(90deg,#2EABFE,#00B4B4)' },
  certHeader: { textAlign: 'center', padding: '36px 32px 24px' },
  certSealWrap: { width: 72, height: 72, borderRadius: 999, background: 'rgba(46,171,254,0.08)', border: '2px solid rgba(46,171,254,0.22)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' },
  certOrg: { fontSize: 12, fontWeight: 900, color: '#2EABFE', textTransform: 'uppercase', letterSpacing: '.12em', fontFamily: 'Inter, sans-serif', marginBottom: 8 },
  certTitle: { fontSize: '2rem', color: '#091925', margin: '0 0 6px', letterSpacing: '0.04em', fontWeight: 700 },
  certSubtitle: { color: 'rgba(9,25,37,0.55)', fontSize: '0.95rem', margin: 0, fontFamily: 'Inter, sans-serif' },
  divider: { height: 1, background: 'linear-gradient(90deg,transparent,rgba(46,171,254,0.25),transparent)', margin: '0 2rem' },
  certifyText: { textAlign: 'center', color: 'rgba(9,25,37,0.55)', fontSize: '0.95rem', margin: '1.5rem 0 0.25rem', fontStyle: 'italic' },
  studentName: { textAlign: 'center', fontSize: '2rem', color: '#2EABFE', margin: '0 0 0.5rem', fontWeight: 700 },
  courseName: { textAlign: 'center', fontSize: '1.15rem', color: 'rgba(9,25,37,0.85)', margin: '0 2rem 1.5rem', fontWeight: 600 },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', padding: '1.5rem 2.5rem' },
  detailItem: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  detailLabel: { margin: 0, fontSize: '0.72rem', color: 'rgba(9,25,37,0.50)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 },
  detailValue: { margin: '0.2rem 0 0', fontSize: '0.95rem', color: 'rgba(9,25,37,0.85)', fontWeight: 700, fontFamily: 'Inter, sans-serif' },
  certFooter: { textAlign: 'center', padding: '1.5rem 2rem' },
  signatureRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 20, marginBottom: 20, flexWrap: 'wrap' },
  sigBlock: { textAlign: 'center', flex: 1, minWidth: 160 },
  signatureLine: { width: '160px', height: 1, background: 'rgba(9,25,37,0.25)', margin: '0 auto 8px' },
  signatureLabel: { fontSize: '0.78rem', color: 'rgba(9,25,37,0.50)', margin: '0 0 4px', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 800 },
  signatureName: { fontSize: '0.90rem', color: 'rgba(9,25,37,0.80)', margin: 0, fontFamily: 'Inter, sans-serif', fontWeight: 800 },
  footerNote: { fontSize: '0.75rem', color: 'rgba(9,25,37,0.45)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' },
  bottomBar: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, background: '#091925', color: '#fff', fontSize: 10, fontWeight: 700, padding: '10px 20px', letterSpacing: '.04em', fontFamily: 'Inter, sans-serif' },
};

export default CertificateTemplate;
