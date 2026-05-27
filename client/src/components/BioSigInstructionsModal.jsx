import { ExternalLink, PlayCircle, CheckCircle2 } from 'lucide-react';

const BioSigInstructionsModal = ({ onContinue, onCancel, reviewMode }) => {
  return (
    <div style={S.overlay}>
      <div style={S.modal}>

        <div style={S.header}>
          <img
            src="https://help.biosig-id.com/galleryDocuments/edbsn2d8b4346d502ddfd127f0d83edede8b4ad75aa77a72ddf37e6e2adba942ddf8da340def6e31be6120a3ca0b95c388c76?inline=true"
            alt="NMLS Logo"
            style={{ height: 36, objectFit: 'contain' }}
          />
          <div>
            <div style={S.headerTitle}>NMLS First Time Enrollment</div>
            <div style={S.headerSub}>BioSig-ID Identity Verification Setup</div>
          </div>
        </div>

        <div style={S.body}>

          <div style={S.infoBox}>
            NMLS is committed to maintaining the integrity of the Mortgage Education Program
            as required by the SAFE Act. All BioSig-ID enrollments and validations occur within your course.
          </div>

          <div style={S.infoBox}>
            The first BioSig-ID authentication will occur after the Rules of Conduct and just prior
            to the start of the course. Please follow the natural progression of the course until
            you are prompted to enroll and validate your BioSig-ID.
          </div>

          <div style={S.videoBox}>
            <PlayCircle size={20} style={{ color: '#2EABFE', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={S.videoTitle}>Step 1 - Watch the Enrollment Video</div>
              <div style={S.videoSub}>Strongly recommended before proceeding</div>
            </div>
            <a
              href="https://player.vimeo.com/video/830570648"
              target="_blank"
              rel="noopener noreferrer"
              style={S.videoBtn}
            >
              <ExternalLink size={14} /> Watch Video
            </a>
          </div>

          <div style={S.stepsTitle}>BioSig-ID Enrollment Process:</div>

          <div style={S.stepsList}>
            <div style={S.step}>
              <div style={S.stepNum}>1</div>
              <span>View the How to Enroll video above in a new window.</span>
            </div>
            <div style={S.step}>
              <div style={S.stepNum}>2</div>
              <span>Continue within your course until prompted to enroll your BioSig-ID password.</span>
            </div>
            <div style={S.step}>
              <div style={S.stepNum}>3</div>
              <span>You will be provided with self-guided instructions:</span>
            </div>
          </div>

          <div style={S.subStepsList}>
            <div style={S.subStep}>
              <CheckCircle2 size={14} style={{ color: '#2EABFE', flexShrink: 0, marginTop: 2 }} />
              <span>Create your 4 character password using: mouse, stylus, touch-pad or touchscreen.</span>
            </div>
            <div style={S.subStep}>
              <CheckCircle2 size={14} style={{ color: '#2EABFE', flexShrink: 0, marginTop: 2 }} />
              <span>Write your password twice more while being mindful of how you wrote it the first time.</span>
            </div>
            <div style={S.subStep}>
              <CheckCircle2 size={14} style={{ color: '#2EABFE', flexShrink: 0, marginTop: 2 }} />
              <span>Finally lock in your password by validating one last time.</span>
            </div>
          </div>

          <div style={S.helpBox}>
            <div style={S.helpTitle}>Questions or Problems?</div>
            <div style={S.helpText}>
              Use the NMLS Help Site for all BioSig-ID support inquiries.
              All inquiries <strong>must</strong> go through the NMLS online help desk.
              <strong> Do not</strong> contact BSI directly as they are not authorized to assist.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href="https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/stateresourcecenter/SitePages/BioSig-ID-Help.aspx"
                target="_blank"
                rel="noopener noreferrer"
                style={S.policyLink}
              >
                <ExternalLink size={12} />
                {' '}NMLS Help Site
              </a>
              <a
                href="https://nmlsportal.csbs.org/csm?id=kb_article_view&sysparm_article=KB0015802"
                target="_blank"
                rel="noopener noreferrer"
                style={S.policyLink}
              >
                <ExternalLink size={12} />
                {' '}Policy for BioSig-ID Student ID Validations
              </a>
            </div>
          </div>

        </div>

        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onCancel} type="button">{reviewMode ? 'Back' : 'Cancel'}</button>
          <button style={S.continueBtn} onClick={onContinue} type="button">
            {reviewMode ? 'Next' : 'I Understand - Continue'}
          </button>
        </div>

      </div>
    </div>
  );
};

const S = {
  overlay: {
    width: '100%', maxWidth: 860, margin: '0 auto',
  },
  modal: {
    background: '#fff', borderRadius: 20,
    width: '100%', maxWidth: 560,
    margin: '0 auto',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(2,8,23,0.08)',
    boxShadow: '0 4px 14px rgba(2,8,23,0.04)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '18px 20px', borderBottom: '1px solid rgba(2,8,23,0.08)', flexShrink: 0,
    background: 'rgba(46,171,254,0.04)',
  },
  headerTitle: { fontSize: 15, fontWeight: 800, color: '#0a1628' },
  headerSub:   { fontSize: 12, fontWeight: 600, color: 'rgba(10,22,40,0.45)', marginTop: 2 },
  body: {
    padding: '24px',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  infoBox: {
    padding: '12px 14px', borderRadius: 12,
    background: 'rgba(46,171,254,0.05)', border: '1px solid rgba(46,171,254,0.15)',
    fontSize: 13, fontWeight: 600, color: 'rgba(10,22,40,0.75)', lineHeight: 1.7,
  },
  videoBox: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderRadius: 12,
    background: 'rgba(46,171,254,0.08)', border: '1px solid rgba(46,171,254,0.22)',
  },
  videoTitle: { fontSize: 13, fontWeight: 800, color: '#0a1628' },
  videoSub:   { fontSize: 11, fontWeight: 600, color: 'rgba(10,22,40,0.50)', marginTop: 2 },
  videoBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 9,
    background: '#2EABFE', color: '#fff',
    fontWeight: 800, fontSize: 12, textDecoration: 'none', flexShrink: 0,
  },
  stepsTitle: { fontSize: 13, fontWeight: 900, color: '#0a1628', letterSpacing: '0.2px' },
  stepsList:  { display: 'flex', flexDirection: 'column', gap: 10 },
  step: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    fontSize: 13, fontWeight: 600, color: 'rgba(10,22,40,0.80)', lineHeight: 1.6,
  },
  stepNum: {
    width: 24, height: 24, borderRadius: '50%',
    background: '#2EABFE', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 900, flexShrink: 0,
  },
  subStepsList: {
    display: 'flex', flexDirection: 'column', gap: 8,
    padding: '12px 14px', borderRadius: 12,
    background: 'rgba(2,8,23,0.02)', border: '1px solid rgba(2,8,23,0.08)',
  },
  subStep: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    fontSize: 13, fontWeight: 600, color: 'rgba(10,22,40,0.72)', lineHeight: 1.6,
  },
  helpBox: {
    padding: '14px 16px', borderRadius: 12,
    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  helpTitle: {
    fontSize: 12, fontWeight: 900, color: 'rgba(146,84,0,1)',
    textTransform: 'uppercase', letterSpacing: '0.4px',
  },
  helpText: { fontSize: 12, fontWeight: 600, color: 'rgba(10,22,40,0.70)', lineHeight: 1.7 },
  policyLink: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 700, color: '#2EABFE', textDecoration: 'none',
  },
  footer: {
    display: 'flex', gap: 10, padding: '14px 20px',
    borderTop: '1px solid rgba(2,8,23,0.08)', flexShrink: 0,
  },
  cancelBtn: {
    padding: '11px 20px', borderRadius: 10,
    border: '1px solid rgba(2,8,23,0.12)', background: '#fff',
    cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'rgba(10,22,40,0.60)',
  },
  continueBtn: {
    flex: 1, padding: '11px 20px', borderRadius: 10,
    border: 'none', background: '#2EABFE', color: '#fff',
    cursor: 'pointer', fontWeight: 800, fontSize: 14,
    boxShadow: '0 4px 16px rgba(46,171,254,0.28)',
  },
};

export default BioSigInstructionsModal;