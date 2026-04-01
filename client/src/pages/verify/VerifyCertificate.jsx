import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../../api/axios';
import Layout from '../../components/Layout';
import CertificateTemplate from '../../components/CertificateTemplate';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await API.get(`/certificates/verify/${certificateId}`);
        if (res.data?.certificate) {
          setCert(buildCertFromVerification(res.data.certificate));
        } else {
          setError('Certificate not found or invalid.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate not found or invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [certificateId]);

  return (
    <Layout>
      <style>{`
        .verify-spinner{width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:verify-spin 1s linear infinite;}
        @keyframes verify-spin{to{transform:rotate(360deg);}}
      `}</style>

      <div style={S.container}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => navigate('/')} type="button">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div>
            <div style={S.title}>Certificate Verification</div>
            <div style={S.subtitle}>Confirm the authenticity of your Relstone NMLS certificate.</div>
          </div>
        </div>

        {loading ? (
          <div style={S.center}>
            <div className="verify-spinner" />
            <div style={S.statusText}>Verifying certificate…</div>
          </div>
        ) : error ? (
          <div style={S.errorCard}>
            <AlertCircle size={28} color="#ef4444" />
            <div style={S.errorTitle}>Certificate Not Verified</div>
            <div style={S.errorMessage}>{error}</div>
          </div>
        ) : (
          <>
            <div style={S.verifiedBanner}>
              <CheckCircle size={18} color="#16a34a" />
              <span>Certificate verified successfully</span>
            </div>
            <div style={S.certWrapper}>
              <CertificateTemplate cert={cert} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

const buildCertFromVerification = (raw) => {
  const certificateId = raw.certificate_id || raw._id || '';
  const completedAt = raw.completed_at ? new Date(raw.completed_at) : new Date();

  return {
    student_name:       raw.student_name || '—',
    student_nmls_id:    raw.student_nmls_id || '—',
    course_title:       raw.course_title || '—',
    nmls_course_id:     raw.nmls_course_id || '—',
    credit_hours:       raw.credit_hours || 0,
    course_type_label:  raw.course_type === 'PE' ? 'Pre-Licensing Education (PE)' : 'Continuing Education (CE)',
    state:              raw.state || '—',
    state_approval_number: raw.state_approval_number || raw.nmls_course_id || '—',
    completed_at_label: completedAt.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }),
    issued_at_label: completedAt.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }),
    issued_month_year: completedAt.toLocaleDateString('en-US', { month:'long', year:'numeric' }),
    cert_id: String(certificateId).toUpperCase() || 'N/A',
    verification_url: raw.verification_url || `relstone.com/verify-certificate/${String(certificateId).toUpperCase()}`,
  };
};

const S = {
  container: { maxWidth: 980, margin: '0 auto', padding: '24px 18px 56px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(2,8,23,0.12)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#091925', fontFamily: 'Inter, sans-serif' },
  title: { fontSize: '1.85rem', fontWeight: 800, color: '#091925' },
  subtitle: { fontSize: 14, color: 'rgba(9,25,37,0.65)', marginTop: 4 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '45vh', gap: 12 },
  statusText: { color: 'rgba(9,25,37,0.65)', fontSize: 14, fontWeight: 700 },
  errorCard: { background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 18, padding: 28, textAlign: 'center', color: '#991B1B', boxShadow: '0 12px 32px rgba(254, 202, 202, 0.25)' },
  errorTitle: { fontSize: 18, fontWeight: 800, margin: '16px 0 8px' },
  errorMessage: { color: '#991B1B', fontSize: 14, lineHeight: 1.7 },
  verifiedBanner: { display: 'inline-flex', alignItems: 'center', gap: 10, background: '#ECFDF5', color: '#166534', borderRadius: 999, padding: '10px 16px', fontWeight: 700, marginBottom: 20, border: '1px solid #D1FAE5' },
  certWrapper: { maxWidth: 860, margin: '0 auto' },
};

export default VerifyCertificate;
