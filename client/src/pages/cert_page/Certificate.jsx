import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, User, Hash, BookOpen, Clock, Calendar, ArrowLeft, Download } from 'lucide-react';
import API from '../../api/axios';

const Certificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return (
    <div style={styles.center}>
      <p style={{ color: 'red' }}>{error}</p>
      <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Action Bar - hidden on print */}
      <div style={styles.actionBar} className="no-print">
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} style={{ marginRight: 6 }} />
          Back to Dashboard
        </button>
        <button style={styles.printBtn} onClick={handlePrint}>
          <Download size={16} style={{ marginRight: 6 }} />
          Download / Print
        </button>
      </div>

      {/* Certificate */}
      <div style={styles.certWrapper} ref={printRef}>
        <div style={styles.cert}>
          {/* Top Border Accent */}
          <div style={styles.topAccent} />

          {/* Header */}
          <div style={styles.certHeader}>
            <Award size={52} color="#1a73e8" />
            <h1 style={styles.certTitle}>Certificate of Completion</h1>
            <p style={styles.certSubtitle}>Nationwide Mortgage Licensing System (NMLS)</p>
          </div>

          <div style={styles.divider} />

          {/* This certifies that */}
          <p style={styles.certifyText}>This certifies that</p>
          <h2 style={styles.studentName}>{cert.student_name}</h2>

          <p style={styles.certifyText}>has successfully completed</p>
          <h3 style={styles.courseName}>{cert.course_title}</h3>

          <div style={styles.divider} />

          {/* Details Grid */}
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <Hash size={18} color="#1a73e8" />
              <div>
                <p style={styles.detailLabel}>NMLS Course ID</p>
                <p style={styles.detailValue}>{cert.nmls_course_id}</p>
              </div>
            </div>
            <div style={styles.detailItem}>
              <User size={18} color="#1a73e8" />
              <div>
                <p style={styles.detailLabel}>Student NMLS ID</p>
                <p style={styles.detailValue}>{cert.student_nmls_id || 'N/A'}</p>
              </div>
            </div>
            <div style={styles.detailItem}>
              <BookOpen size={18} color="#1a73e8" />
              <div>
                <p style={styles.detailLabel}>Course Type</p>
                <p style={styles.detailValue}>{cert.course_type === 'PE' ? 'Pre-Licensing (PE)' : 'Continuing Education (CE)'}</p>
              </div>
            </div>
            <div style={styles.detailItem}>
              <Clock size={18} color="#1a73e8" />
              <div>
                <p style={styles.detailLabel}>Credit Hours</p>
                <p style={styles.detailValue}>{cert.credit_hours} Hours</p>
              </div>
            </div>
            <div style={styles.detailItem}>
              <Calendar size={18} color="#1a73e8" />
              <div>
                <p style={styles.detailLabel}>Date Completed</p>
                <p style={styles.detailValue}>{new Date(cert.completed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div style={styles.detailItem}>
              <Calendar size={18} color="#1a73e8" />
              <div>
                <p style={styles.detailLabel}>Date Issued</p>
                <p style={styles.detailValue}>{new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div style={styles.divider} />

          {/* Footer */}
          <div style={styles.certFooter}>
            <div style={styles.signatureLine} />
            <p style={styles.signatureLabel}>Authorized Signature</p>
            <p style={styles.footerNote}>
              This certificate is issued in accordance with the SAFE Mortgage Licensing Act
              and confirms completion of NMLS-approved education requirements.
            </p>
          </div>

          {/* Bottom Border Accent */}
          <div style={styles.bottomAccent} />
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Georgia, serif', padding: '2rem' },
  center: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' },
  actionBar: { display: 'flex', justifyContent: 'space-between', maxWidth: '800px', margin: '0 auto 1.5rem', fontFamily: 'sans-serif' },
  backBtn: { display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  printBtn: { display: 'flex', alignItems: 'center', background: '#1a73e8', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  certWrapper: { maxWidth: '800px', margin: '0 auto' },
  cert: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', overflow: 'hidden', position: 'relative' },
  topAccent: { height: '8px', background: 'linear-gradient(90deg, #1a73e8, #34a853)' },
  bottomAccent: { height: '8px', background: 'linear-gradient(90deg, #34a853, #1a73e8)' },
  certHeader: { textAlign: 'center', padding: '2.5rem 2rem 1.5rem' },
  certTitle: { fontSize: '2rem', color: '#1a1a1a', margin: '0.75rem 0 0.25rem', letterSpacing: '0.05em' },
  certSubtitle: { color: '#666', fontSize: '0.95rem', margin: 0, fontFamily: 'sans-serif' },
  divider: { height: '1px', background: 'linear-gradient(90deg, transparent, #e0e0e0, transparent)', margin: '0 2rem' },
  certifyText: { textAlign: 'center', color: '#888', fontSize: '0.95rem', margin: '1.5rem 0 0.25rem', fontStyle: 'italic' },
  studentName: { textAlign: 'center', fontSize: '2rem', color: '#1a73e8', margin: '0 0 0.5rem', fontWeight: 700 },
  courseName: { textAlign: 'center', fontSize: '1.2rem', color: '#333', margin: '0 2rem 1.5rem', fontWeight: 600 },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', padding: '1.5rem 2.5rem' },
  detailItem: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  detailLabel: { margin: 0, fontSize: '0.75rem', color: '#888', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' },
  detailValue: { margin: '0.2rem 0 0', fontSize: '0.95rem', color: '#333', fontWeight: 600, fontFamily: 'sans-serif' },
  certFooter: { textAlign: 'center', padding: '1.5rem 2rem 2rem' },
  signatureLine: { width: '200px', height: '1px', background: '#333', margin: '0 auto 0.5rem' },
  signatureLabel: { fontSize: '0.85rem', color: '#666', margin: '0 0 1rem', fontFamily: 'sans-serif' },
  footerNote: { fontSize: '0.75rem', color: '#aaa', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6, fontFamily: 'sans-serif' }
};

export default Certificate;