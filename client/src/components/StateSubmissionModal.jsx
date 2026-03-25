import { useState } from "react";
import { X, ExternalLink, CheckCircle } from "lucide-react";

/* ─── State Submission Instructions Modal ─────────────────────── */
const StateSubmissionModal = ({ isOpen, onClose, state, hoursRequired }) => {
  const [activeStep, setActiveStep] = useState(0);

  const stateInstructions = {
    'CA': {
      agency: 'Department of Financial Protection and Innovation (DFPI)',
      renewalUrl: 'https://www.dfpi.ca.gov/',
      contact: '1-888-735-2929',
      steps: [
        { title: 'Download Certificates', description: 'Download all CE certificates from your Relstone dashboard.' },
        { title: 'Verify Completion', description: 'Ensure you have completed 36 hours of approved CE courses.' },
        { title: 'Contact DFPI', description: 'Submit your certificates through the DFPI licensing portal or by mail.' },
        { title: 'Complete Renewal', description: 'File your license renewal application with the DFPI within the renewal period.' },
      ],
    },
    'NY': {
      agency: 'New York Department of Financial Services (NYDFS)',
      renewalUrl: 'https://www.dfs.ny.gov/',
      contact: '1-800-342-3736',
      steps: [
        { title: 'Download Certificates', description: 'Download all CE certificates from your Relstone dashboard.' },
        { title: 'Prepare Documentation', description: 'Ensure you have 24 hours of approved CE credits.' },
        { title: 'Submit to NYDFS', description: 'File your renewal application with proof of CE completion.' },
        { title: 'Pay Renewal Fee', description: 'Complete the renewal process and pay the required fee.' },
      ],
    },
    'TX': {
      agency: 'Texas Department of Licensing and Regulation (TDLR)',
      renewalUrl: 'https://www.tdlr.texas.gov/',
      contact: '1-800-803-9202',
      steps: [
        { title: 'Download Certificates', description: 'Download all CE certificates from your Relstone dashboard.' },
        { title: 'Verify Hours', description: 'Confirm you have 30 hours of approved CE credits.' },
        { title: 'Submit Application', description: 'File renewal application through My License Texas portal.' },
        { title: 'Complete Renewal', description: 'Pay renewal fee and await confirmation from TDLR.' },
      ],
    },
    'FL': {
      agency: 'Florida Department of Business and Professional Regulation (DBPR)',
      renewalUrl: 'https://www.myfloridalicense.com/',
      contact: '1-850-488-1111',
      steps: [
        { title: 'Download Certificates', description: 'Download all CE certificates from your Relstone dashboard.' },
        { title: 'Prepare Documents', description: 'Ensure you have 24 hours of approved CE courses.' },
        { title: 'Renew Online', description: 'Go to myFloridaLicense.com and submit renewal application.' },
        { title: 'Confirm Completion', description: 'Upload certificates and complete payment.' },
      ],
    },
  };

  const instructions = stateInstructions[state] || {
    agency: `${state} Real Estate Commission`,
    renewalUrl: '#',
    contact: 'Contact your state licensing board',
    steps: [
      { title: 'Download Certificates', description: 'Download all CE certificates from your Relstone dashboard.' },
      { title: 'Review Requirements', description: `Ensure you have completed your required ${hoursRequired} hours of CE credits.` },
      { title: 'Submit to State', description: 'File renewal application with your state licensing board.' },
      { title: 'Complete Renewal', description: 'Follow your state\'s specific renewal procedures and pay fees.' },
    ],
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>License Renewal Process</h2>
            <p style={styles.subtitle}>{state} Real Estate License</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Agency Info */}
        <div style={styles.agencyBox}>
          <div style={styles.agencyContent}>
            <div>
              <div style={styles.agencyLabel}>Responsible Agency</div>
              <div style={styles.agencyName}>{instructions.agency}</div>
            </div>
            <a 
              href={instructions.renewalUrl} 
              target="_blank" 
              rel="noreferrer"
              style={styles.agencyLink}
            >
              <ExternalLink size={16} />
              <span>Visit Agency Portal</span>
            </a>
          </div>
        </div>

        {/* Steps */}
        <div style={styles.stepsContainer}>
          <div style={styles.stepsLabel}>Renewal Steps</div>
          <div style={styles.stepsList}>
            {instructions.steps.map((step, index) => (
              <div 
                key={index}
                style={styles.stepItem}
                onClick={() => setActiveStep(index)}
              >
                <div style={{
                  ...styles.stepNumber,
                  backgroundColor: activeStep === index ? '#2EABFE' : '#e5e7eb',
                  color: activeStep === index ? '#fff' : '#64748b',
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.stepTitle}>{step.title}</div>
                  <div style={styles.stepDesc}>{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div style={styles.contactBox}>
          <CheckCircle size={16} style={{ color: '#22c55e' }} />
          <div>
            <div style={styles.contactLabel}>Questions?</div>
            <div style={styles.contactValue}>{instructions.contact}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button 
            type="button"
            style={styles.secondaryBtn}
            onClick={onClose}
          >
            Close
          </button>
          <a 
            href={instructions.renewalUrl}
            target="_blank"
            rel="noreferrer"
            style={styles.primaryBtn}
          >
            Go to Renewal Portal
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─── Styles ──────────────────────────────────────────────────── */
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'slideIn 0.3s ease-out',
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid rgba(11,18,32,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#091925',
    margin: 0,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#091925',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
    marginTop: '-4px',
    marginRight: '-4px',
    padding: '4px',
  },
  agencyBox: {
    padding: '24px 32px',
    backgroundColor: '#f0f6fa',
    borderRadius: '12px',
    margin: '24px 32px 0',
  },
  agencyContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  agencyLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  agencyName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#091925',
  },
  agencyLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#2EABFE',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s',
    border: 'none',
    cursor: 'pointer',
  },
  stepsContainer: {
    padding: '24px 32px',
  },
  stepsLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#091925',
    marginBottom: '16px',
  },
  stepsList: {
    display: 'grid',
    gap: '12px',
  },
  stepItem: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid rgba(11,18,32,0.08)',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  stepTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#091925',
    marginBottom: '4px',
  },
  stepDesc: {
    fontSize: '12px',
    color: '#64748b',
  },
  contactBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    margin: '0 32px 24px',
    border: '1px solid rgba(34, 197, 94, 0.2)',
  },
  contactLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  contactValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#16a34a',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    padding: '20px 32px',
    borderTop: '1px solid rgba(11,18,32,0.08)',
    backgroundColor: '#f8f9fa',
  },
  primaryBtn: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: '#2EABFE',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  secondaryBtn: {
    flex: 1,
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#2EABFE',
    border: '1px solid #2EABFE',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default StateSubmissionModal;
