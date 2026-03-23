import { useState, useEffect } from 'react';

const HOW_IT_WORKS_STEPS = [
  { number: '01', title: 'Create account', desc: 'Register your RELSTONE profile to access approved education, saved progress, and certificate delivery in one place.' },
  { number: '02', title: 'Enroll in pre-licensing', desc: 'Choose the required SAFE Act pre-licensing path and start the course package that matches your licensing goals.' },
  { number: '03', title: 'Complete required hours', desc: 'Work through the required instructional time with tracked engagement and module-by-module progression.' },
  { number: '04', title: 'Chapter quizzes and exams', desc: 'Reinforce each module with quizzes, then complete the final assessment to confirm course readiness.' },
  { number: '05', title: 'Receive certification', desc: 'Finish the course and receive your completion certificate, with credit reporting handled according to NMLS requirements.' },
  { number: '06', title: 'Pass the licensing exam', desc: 'Book your state licensing exam through Pearson VUE or PSI, then pass the exam to move forward with licensure.' },
  { number: '07', title: 'Apply with your state', desc: 'Submit your application and required materials to the appropriate state licensing authority or commission.' },
  { number: '08', title: 'Complete annual CE', desc: 'Maintain your license each year by completing the annual continuing education requirement before renewal deadlines.' },
];

const HowItWorksModal = ({ onClose, onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleGetStarted = () => {
    setIsVisible(false);
    if (onGetStarted) onGetStarted();
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{css}</style>
      
      {/* Backdrop */}
      <div className="how-modal-overlay" onClick={handleClose} aria-hidden="true" />
      
      {/* Modal */}
      <div className="how-modal" role="dialog" aria-label="How it works">
        {/* Header Section */}
        <div className="how-modal-header">
          <div className="how-modal-top">
            <div>
              <div className="how-modal-badge">HOW IT WORKS</div>
              <h2 className="how-modal-title">THE FULL <span>LICENSING</span> JOURNEY</h2>
              <p className="how-modal-subtitle">
                A clear 8-step path from account creation to annual renewal, presented in the same guided flow students follow in real life.
              </p>
            </div>
            <button
              type="button"
              className="how-modal-close"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Info Card */}
          <div className="how-modal-info-card">
            <div className="how-modal-info-label">FROM FIRST ENROLLMENT TO RENEWAL</div>
            <p className="how-modal-info-text">
              RELSTONE handles the education side cleanly, then guides students through what comes next so the entire licensing process feels ordered instead of fragmented.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="how-modal-grid">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article key={step.number} className="how-modal-step-card">
              <div className="how-modal-step-label">Step {step.number}</div>
              <div className="how-modal-step-number">{step.number}</div>
              <h3 className="how-modal-step-title">{step.title}</h3>
              <p className="how-modal-step-desc">{step.desc}</p>
            </article>
          ))}
        </div>

        {/* Actions */}
        <div className="how-modal-actions">
          {/* Success Checkmark */}
          <div className="how-modal-success-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Your account is ready — you can setting up your account information and start enrolling right away.</span>
          </div>

          {/* Buttons */}
          <div className="how-modal-btns">
            <button type="button" className="how-modal-btn-skip" onClick={handleClose}>
              Skip For Now
            </button>
            <button type="button" className="how-modal-btn-primary" onClick={handleGetStarted}>
              GO TO ACCOUNT SETUP →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

.how-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  background: rgba(9, 25, 37, 0.72);
  backdrop-filter: blur(6px);
}

.how-modal {
  position: fixed;
  z-index: 221;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(900px, calc(100vw - 26px));
  max-height: calc(100vh - 28px);
  overflow-y: auto;
  background: linear-gradient(180deg, #0a2131 0%, #0d2436 100%);
  border: 1px solid rgba(46, 171, 254, 0.2);
  border-radius: 12px;
  box-shadow: 0 30px 78px rgba(2, 8, 23, 0.45);
  padding: 24px 28px;
}

.how-modal::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(46, 171, 254, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(46, 171, 254, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
  border-radius: 12px;
}

.how-modal-header,
.how-modal-grid,
.how-modal-actions {
  position: relative;
  z-index: 1;
}

.how-modal-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.how-modal-badge {
  display: inline-block;
  margin-bottom: 12px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #60c3ff;
  border: 1px solid rgba(96, 195, 255, 0.3);
  background: rgba(96, 195, 255, 0.08);
  font-family: 'Poppins', sans-serif;
}

.how-modal-title {
  font-family: 'Poppins', sans-serif;
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 900;
  color: #fff;
  margin: 0 0 12px;
  line-height: 1.1;
  letter-spacing: -0.5px;
  text-transform: uppercase;
}

.how-modal-title span {
  color: #2eabfe;
}

.how-modal-subtitle {
  max-width: 580px;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.65;
  color: rgba(240, 246, 250, 0.72);
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

.how-modal-close {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(46, 171, 254, 0.2);
  border-radius: 10px;
  background: rgba(46, 171, 254, 0.08);
  color: rgba(240, 246, 250, 0.8);
  font-size: 28px;
  font-weight: 300;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.how-modal-close:hover {
  background: rgba(46, 171, 254, 0.16);
  border-color: rgba(46, 171, 254, 0.4);
}

/* Info Card */
.how-modal-info-card {
  margin-top: 18px;
  padding: 16px 18px;
  background: rgba(13, 36, 54, 0.8);
  border: 1px solid rgba(46, 171, 254, 0.15);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.how-modal-info-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #60c3ff;
  margin-bottom: 6px;
  font-family: 'Poppins', sans-serif;
}

.how-modal-info-text {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(240, 246, 250, 0.68);
  margin: 0;
  font-family: 'Poppins', sans-serif;
}

/* Steps Grid */
.how-modal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border: 1px solid rgba(46, 171, 254, 0.15);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 24px;
}

.how-modal-step-card {
  padding: 16px 14px;
  background: rgba(13, 36, 54, 0.6);
  border-right: 1px solid rgba(46, 171, 254, 0.15);
  border-bottom: 1px solid rgba(46, 171, 254, 0.15);
  backdrop-filter: blur(8px);
}

.how-modal-step-card:nth-child(4n) {
  border-right: none;
}

.how-modal-step-card:nth-child(n + 5) {
  border-bottom: none;
}

.how-modal-step-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #60c3ff;
  margin-bottom: 8px;
  font-family: 'Poppins', sans-serif;
}

.how-modal-step-number {
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
  color: #2eabfe;
  margin-bottom: 8px;
}

.how-modal-step-title {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  color: #fff;
  margin: 0 0 6px;
  text-transform: capitalize;
}

.how-modal-step-desc {
  font-family: 'Poppins', sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.55;
  color: rgba(240, 246, 250, 0.65);
  margin: 0;
}

/* Actions Section */
.how-modal-actions {
  margin-top: 18px;
}

.how-modal-success-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 14px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(240, 246, 250, 0.85);
  font-family: 'Poppins', sans-serif;
}

.how-modal-success-row svg {
  color: #22c55e;
  flex-shrink: 0;
}

.how-modal-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.how-modal-btn-skip {
  padding: 12px 20px;
  background: transparent;
  border: 1.5px solid rgba(46, 171, 254, 0.3);
  border-radius: 9px;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: rgba(240, 246, 250, 0.75);
  cursor: pointer;
  transition: all 0.2s;
  text-transform: capitalize;
}

.how-modal-btn-skip:hover {
  background: rgba(46, 171, 254, 0.1);
  border-color: rgba(46, 171, 254, 0.5);
  color: #fff;
}

.how-modal-btn-primary {
  padding: 12px 24px;
  background: #2eabfe;
  border: 1px solid #2eabfe;
  border-radius: 9px;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #091925;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.how-modal-btn-primary:hover {
  background: #60c3ff;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(46, 171, 254, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .how-modal-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .how-modal-step-card:nth-child(4n) {
    border-right: 1px solid rgba(46, 171, 254, 0.15);
  }
  
  .how-modal-step-card:nth-child(2n) {
    border-right: none;
  }
}

@media (max-width: 768px) {
  .how-modal {
    width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
    padding: 18px 16px;
  }

  .how-modal-top {
    flex-direction: column;
    gap: 12px;
  }

  .how-modal-title {
    font-size: clamp(22px, 2.5vw, 28px);
  }

  .how-modal-grid {
    grid-template-columns: repeat(2, 1fr);
    margin-top: 18px;
  }

  .how-modal-btns {
    flex-direction: column;
    justify-content: stretch;
  }

  .how-modal-btn-skip,
  .how-modal-btn-primary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 560px) {
  .how-modal {
    padding: 14px 12px;
  }

  .how-modal-grid {
    grid-template-columns: 1fr;
  }

  .how-modal-step-card {
    border-right: none !important;
    border-bottom: 1px solid rgba(46, 171, 254, 0.15);
  }

  .how-modal-step-card:last-child {
    border-bottom: none;
  }

  .how-modal-step-number {
    font-size: 24px;
  }

  .how-modal-step-title {
    font-size: 13px;
  }

  .how-modal-step-desc {
    font-size: 10px;
  }
}
`;

export default HowItWorksModal;
