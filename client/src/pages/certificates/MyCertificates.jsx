import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import Layout from "../../components/Layout";
import {
  Award, Download, Linkedin, FileText, BookOpen,
  Clock, MapPin, Calendar, ChevronRight, X,
  CheckCircle, ExternalLink, Copy, Info,
} from "lucide-react";

const ATTESTATION_TEXT =
  "By accepting this certificate, I hereby acknowledge receipt of my course completion and authorize the education provider to report my education hours to NMLS. I am the named person on this certificate and have completed this course. I further attest I completed the course in accordance with the Rules of Conduct.";

/* ─── helper: safely extract course data from a transcript entry ─── */
// The transcript entry can have course_id as either:
//   - A populated object: { _id, title, type, credit_hours, nmls_course_id, ... }
//   - A raw ObjectId string
const parseCert = (t) => {
  const courseObj = typeof t.course_id === "object" && t.course_id !== null
    ? t.course_id
    : {};
  const courseId  = courseObj._id || t.course_id || t._id;

  return {
    _id:             t._id,
    course_id:       courseId,              // clean ID for navigation
    course_title:    t.course_title  || courseObj.title          || "—",
    course_type:     t.type          || courseObj.type           || "—",
    credit_hours:    t.credit_hours  || courseObj.credit_hours,
    nmls_course_id:  t.nmls_course_id|| courseObj.nmls_course_id || "—",
    state_approval:  courseObj.state_approval_number             || "—",
    completed_at:    t.completed_at,
    state:           t.state,
  };
};

/* ─── MyCertificates ─────────────────────────────────────────────── */
const MyCertificates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [preview, setPreview]           = useState(null); // parsed cert object
  const [copied, setCopied]             = useState(false);

  useEffect(() => { fetchCertificates(); }, []);

  const fetchCertificates = async () => {
    setLoading(true); setError("");
    try {
      // Use /certificates endpoint — returns completions fully populated with course data
      const res = await API.get("/certificates");
      const raw = res.data?.certificates || [];
      // Map to the shape parseCert expects
      const mapped = raw.map((c) => ({
        _id:            c._id,
        course_id:      String(c.course_id || ""),
        course_title:   c.course_title  || "—",
        course_type:    c.course_type   || "—",
        credit_hours:   c.credit_hours,
        nmls_course_id: c.nmls_course_id || "—",
        state_approval: c.state_approval_number || "—",
        completed_at:   c.completed_at,
        state:          c.state,
      }));
      setCertificates(mapped);
    } catch {
      setError("Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedIn = (cert) => {
    const name      = encodeURIComponent(cert.course_title || "NMLS Course");
    const org       = encodeURIComponent("Relstone NMLS");
    const issueDate = cert.completed_at ? new Date(cert.completed_at) : new Date();
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${name}&organizationName=${org}&issueMonth=${issueDate.getMonth() + 1}&issueYear=${issueDate.getFullYear()}`;
    window.open(url, "_blank");
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToCert = (cert) => {
    if (cert.course_id) navigate(`/certificate/${cert.course_id}`);
  };

  return (
    <Layout>
      <style>{css}</style>

      {preview && (
        <CertificatePreviewModal
          cert={preview}
          user={user}
          onClose={() => setPreview(null)}
          onLinkedIn={() => handleLinkedIn(preview)}
          onViewFull={() => { goToCert(preview); setPreview(null); }}
          onCopyId={handleCopyId}
          copied={copied}
        />
      )}

      <div style={S.shell}>

        {/* ── Page Header ── */}
        <div style={S.pageHeader}>
          <div>
            <div style={S.pageKicker}><Award size={13} /> Achievements</div>
            <div style={S.pageTitle}>My Certificates</div>
            <div style={S.pageSub}>Your earned NMLS continuing education certificates</div>
          </div>
          {certificates.length > 0 && (
            <div style={S.headerBadge}>
              <Award size={16} color="#2EABFE" />
              <span>{certificates.length} Certificate{certificates.length !== 1 ? "s" : ""} Earned</span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={S.center}><div className="mc-spinner" /></div>
        ) : error ? (
          <div style={S.errorBox}><Info size={16} /> {error}</div>
        ) : certificates.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <>
            <SubmissionBanner />
            <div style={S.grid}>
              {certificates.map((cert, i) => (
                <CertificateCard
                  key={cert._id || i}
                  cert={cert}
                  user={user}
                  onPreview={() => setPreview(cert)}
                  onViewFull={() => goToCert(cert)}
                  onLinkedIn={() => handleLinkedIn(cert)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

/* ── Certificate Card ─────────────────────────────────────────────── */
const CertificateCard = ({ cert, user, onPreview, onViewFull, onLinkedIn }) => {
  const completedAt = cert.completed_at ? new Date(cert.completed_at) : null;
  const courseType  = String(cert.course_type || "").toUpperCase();

  return (
    <div style={S.card}>
      <div style={{ ...S.cardAccent, background: courseType === "PE" ? "#2EABFE" : "#00B4B4" }} />
      <div style={S.cardBody}>
        <div style={S.cardTop}>
          <div style={{
            ...S.cardIconWrap,
            background: courseType === "PE" ? "rgba(46,171,254,0.08)" : "rgba(0,180,180,0.08)",
            border:     courseType === "PE" ? "1px solid rgba(46,171,254,0.18)" : "1px solid rgba(0,180,180,0.18)",
          }}>
            <Award size={22} color={courseType === "PE" ? "#2EABFE" : "#00B4B4"} />
          </div>
          <span style={typeBadge(courseType)}>{courseType || "CE"}</span>
        </div>

        {/* Course title — parsed cleanly */}
        <div style={S.cardTitle}>{cert.course_title}</div>

        <div style={S.metaGrid}>
          <MetaItem icon={<Clock size={13} />}    label="Credit Hours" value={cert.credit_hours ? `${cert.credit_hours} hrs` : "—"} />
          <MetaItem icon={<Calendar size={13} />} label="Completed"    value={completedAt ? completedAt.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—"} />
          <MetaItem icon={<MapPin size={13} />}   label="State"        value={cert.state || user?.state || "—"} />
          <MetaItem icon={<FileText size={13} />} label="Approval No." value={cert.state_approval || "—"} />
        </div>

        <div style={S.completionBadge}>
          <CheckCircle size={13} color="#22C55E" />
          <span>Completed & Verified</span>
        </div>

        <div style={S.cardActions}>
          <button style={S.previewBtn} onClick={onPreview} type="button">
            <FileText size={14} /> Quick Preview
          </button>
          <button style={S.viewFullBtn} onClick={onViewFull} type="button">
            <Download size={14} /> Download
          </button>
          <button style={S.linkedinBtn} onClick={onLinkedIn} type="button">
            <Linkedin size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Quick Preview Modal ──────────────────────────────────────────── */
const CertificatePreviewModal = ({ cert, user, onClose, onLinkedIn, onViewFull, onCopyId, copied }) => {
  const completedAt = cert.completed_at ? new Date(cert.completed_at) : null;
  const courseType  = String(cert.course_type || "").toUpperCase();
  const certId      = cert._id ? String(cert._id).slice(-10).toUpperCase() : "N/A";

  return (
    <>
      <div style={M.backdrop} onClick={onClose} className="cert-modal-backdrop" /> 
      <div style={M.modal} role="dialog" aria-modal="true" className="cert-modal"> 

        <div style={M.modalHead}>
          <div style={M.modalHeadLeft}>
            <Award size={17} color="#2EABFE" />
            <span style={M.modalHeadTitle}>Certificate Preview</span>
          </div>
          <div style={M.modalHeadActions}>
            <button style={M.downloadBtn} onClick={onViewFull} type="button">
              <Download size={14} /> Download / Print
            </button>
            <button style={M.linkedinBtnSm} onClick={onLinkedIn} type="button">
              <Linkedin size={14} /> LinkedIn
            </button>
            <button style={M.closeBtn} onClick={onClose} type="button">
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={M.modalBody} className="cert-modal-body"> 

          {/* ── Certificate preview ── */}
          <div style={M.certWrap}>
            <div style={M.cert}>
              <div style={M.certTopBar} />

              <div style={M.certHeader}>
                <div style={M.certSeal}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5"             stroke="#2EABFE" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5"             stroke="#60C3FF" strokeWidth="1.8" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={M.certOrg}>Relstone NMLS</div>
                <div style={M.certDocTitle}>Certificate of Completion</div>
                <div style={M.certCourseType}>
                  {courseType === "PE" ? "Pre-Licensing Education (PE)" : "Continuing Education (CE)"}
                </div>
              </div>

              <div style={M.certDivider}>
                <div style={M.certDividerLine} />
                <Award size={16} color="#2EABFE" />
                <div style={M.certDividerLine} />
              </div>

              <div style={M.certBody}>
                <div style={M.certPresentsTo}>This is to certify that</div>
                <div style={M.certStudentName}>{user?.name || "Student Name"}</div>
                <div style={M.certHasCompleted}>has successfully completed</div>
                <div style={M.certCourseName}>{cert.course_title}</div>

  <div style={M.certDetails} className="cert-details"> 
                  <CertDetail label="Credit Hours"     value={cert.credit_hours ? `${cert.credit_hours} Hours` : "—"} />
                  <CertDetail label="Completion Date"  value={completedAt ? completedAt.toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" }) : "—"} />
                  <CertDetail label="State"            value={cert.state || user?.state || "—"} />
                  <CertDetail label="State Approval #" value={cert.state_approval || "—"} />
                  <CertDetail label="NMLS ID"          value={user?.nmls_id || "—"} />
                  <CertDetail label="Certificate ID"   value={certId} />
                </div>
              </div>

  <div style={M.certSignRow} className="cert-sign-row"> 
                <div style={M.certSigBlock}>
                  <div style={M.certSigLine} />
                  <div style={M.certSigLabel}>Authorized Signature</div>
                  <div style={M.certSigName}>Relstone NMLS</div>
                </div>
                <div style={M.certSealCircle}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2EABFE" strokeWidth="1.6" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5"             stroke="#2EABFE" strokeWidth="1.6" strokeLinejoin="round"/>
                    <path d="M2 12l10 5 10-5"             stroke="#60C3FF" strokeWidth="1.6" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ fontSize: 7, fontWeight: 900, color: "#2EABFE", letterSpacing: ".10em", marginTop: 3 }}>OFFICIAL</div>
                </div>
                <div style={M.certSigBlock}>
                  <div style={M.certSigLine} />
                  <div style={M.certSigLabel}>Date Issued</div>
                  <div style={M.certSigName}>
                    {completedAt ? completedAt.toLocaleDateString("en-US", { month:"long", year:"numeric" }) : "—"}
                  </div>
                </div>
              </div>

              {/* Attestation (required) */}
              <div style={M.attestationWrap}>
                <div style={M.attestationLabel}>Attestation</div>
                <div style={M.attestationText}>{ATTESTATION_TEXT}</div>
              </div>

              <div style={M.certBottomBar}>
                <span>Certificate ID: {certId}</span>
                <span>·</span>
                <span>Relstone NMLS · relstone.com</span>
                <span>·</span>
                <span>NMLS Approved Provider</span>
              </div>
            </div>
          </div>

          {/* ── Side panel ── */}
          <div style={M.sidePanel} className="cert-modal-side"> 

            <div style={M.sideSect}>
              <div style={M.sideSectTitle}>Certificate ID</div>
              <div style={M.certIdRow}>
                <span style={M.certIdVal}>{certId}</span>
                <button style={M.copyBtn} onClick={() => onCopyId(certId)} type="button">
                  {copied ? <CheckCircle size={13} color="#22C55E" /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div style={M.sideSect}>
              <div style={M.sideSectTitle}>Full Certificate</div>
              <button style={M.viewFullBtn} onClick={onViewFull} type="button">
                <Download size={15} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>Download / Print PDF</div>
                  <div style={{ fontSize: 11, opacity: .70, marginTop: 2 }}>Opens full certificate page</div>
                </div>
                <ExternalLink size={13} style={{ marginLeft: "auto", opacity: .55 }} />
              </button>
            </div>

            <div style={M.sideSect}>
              <div style={M.sideSectTitle}>Share Achievement</div>
              <button style={M.linkedinFull} onClick={onLinkedIn} type="button">
                <Linkedin size={16} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>Add to LinkedIn Profile</div>
                  <div style={{ fontSize: 11, opacity: .75, marginTop: 2 }}>Showcase your certification</div>
                </div>
                <ExternalLink size={13} style={{ marginLeft: "auto", opacity: .6 }} />
              </button>
            </div>

            <div style={M.sideSect}>
              <div style={M.sideSectTitle}><Info size={13} /> Submitting to State</div>
              <div style={M.instructionsList}>
                {SUBMISSION_STEPS.map((step, i) => (
                  <div key={i} style={M.instrStep}>
                    <div style={M.instrNum}>{i + 1}</div>
                    <div style={M.instrText}>{step}</div>
                  </div>
                ))}
              </div>
              <a href="https://mortgage.nationwidelicensingsystem.org" target="_blank" rel="noreferrer" style={M.nmlsLink}>
                <ExternalLink size={12} /> Visit NMLS Resource Center
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

/* ── Submission Banner ───────────────────────────────────────────── */
const SubmissionBanner = () => {
  const [open, setOpen] = useState(false);
  return (
    <div style={S.instrBanner}>
      <div style={S.instrBannerLeft}>
        <div style={S.instrBannerIcon}><Info size={15} color="#2EABFE" /></div>
        <div>
          <div style={S.instrBannerTitle}>How to submit your CE to your state commission</div>
          <div style={S.instrBannerSub}>Relstone NMLS reports completions directly to NMLS within 7 business days.</div>
        </div>
      </div>
      <button style={S.instrToggle} onClick={() => setOpen(v => !v)} type="button">
        {open ? "Hide" : "Show steps"}
        <ChevronRight size={14} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && (
        <div style={S.instrSteps}>
          {SUBMISSION_STEPS.map((step, i) => (
            <div key={i} style={S.instrStep}>
              <div style={S.instrStepNum}>{i + 1}</div>
              <div style={S.instrStepText}>{step}</div>
            </div>
          ))}
          <a href="https://mortgage.nationwidelicensingsystem.org" target="_blank" rel="noreferrer" style={S.nmlsLink}>
            <ExternalLink size={13} /> Visit NMLS Resource Center
          </a>
        </div>
      )}
    </div>
  );
};

/* ── Empty State ─────────────────────────────────────────────────── */
const EmptyState = ({ navigate }) => (
  <div style={S.emptyWrap}>
    <div style={S.emptyIconWrap}><Award size={36} color="rgba(9,25,37,0.25)" /></div>
    <div style={S.emptyTitle}>No certificates yet</div>
    <div style={S.emptySub}>Complete a course to earn your first NMLS certificate.</div>
    <button style={S.emptyBtn} onClick={() => navigate("/courses")} type="button">
      <BookOpen size={15} /> Browse Courses <ChevronRight size={14} />
    </button>
  </div>
);

/* ── Atoms ───────────────────────────────────────────────────────── */
const MetaItem = ({ icon, label, value }) => (
  <div style={S.metaItem}>
    <div style={S.metaIcon}>{icon}</div>
    <div>
      <div style={S.metaLabel}>{label}</div>
      <div style={S.metaValue}>{value}</div>
    </div>
  </div>
);

const CertDetail = ({ label, value }) => (
  <div style={M.certDetailItem}>
    <div style={M.certDetailLabel}>{label}</div>
    <div style={M.certDetailValue}>{value}</div>
  </div>
);

const typeBadge = (type) => {
  const base = { display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:900 };
  if (type === "PE") return { ...base, color:"#2EABFE",           background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.22)" };
  if (type === "CE") return { ...base, color:"rgba(0,140,140,1)", background:"rgba(0,180,180,0.12)", border:"1px solid rgba(0,180,180,0.22)" };
  return { ...base, color:"rgba(9,25,37,0.70)", background:"rgba(2,8,23,0.06)", border:"1px solid rgba(2,8,23,0.10)" };
};

const SUBMISSION_STEPS = [
  "Relstone NMLS reports your completion to NMLS within 7 business days of finishing your course.",
  "Log in to your NMLS account and verify your CE appears under 'Education' in your record.",
  "If your state requires direct submission, download your certificate PDF and upload it through your state regulator's portal.",
  "Keep your certificate PDF for personal records — regulators may request proof during audits.",
  "Contact Relstone support if your CE does not appear in NMLS within 10 business days.",
];

/* ── CSS ─────────────────────────────────────────────────────────── */
  const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box}
.mc-spinner{width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:mc-spin 1s linear infinite;}
@keyframes mc-spin{to{transform:rotate(360deg);}}

.cert-modal-backdrop { position: fixed !important; inset: 0 !important; z-index: 200 !important; background: rgba(9,25,37,0.75) !important; backdrop-filter: blur(8px) !important; }
.cert-modal { position: fixed !important; z-index: 201 !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; width: min(1020px, 96vw) !important; max-height: 92vh !important; max-width: 95vw !important; background: #fff !important; border-radius: 24px !important; box-shadow: 0 40px 100px rgba(9,25,37,0.3) !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; }
@media (max-width: 768px) {
  .cert-modal { width: 95vw !important; height: 90vh !important; border-radius: 20px !important; }
  .cert-modal-body { display: block !important; overflow: auto !important; }
  .cert-modal-side { display: none !important; }
  .cert-wrap { padding: 12px !important; }
  .cert { width: 100% !important; min-width: unset !important; }
  .cert-details { grid-template-columns: 1fr !important; }
  .cert-sign-row { flex-direction: column !important; gap: 20px !important; padding: 20px 20px 16px !important; }
  .modal-head-actions { flex-wrap: wrap !important; gap: 8px !important; }
}
@media (max-width: 480px) {
  .modal-head { padding: 12px 16px !important; flex-direction: column !important; gap: 12px !important; align-items: stretch !important; }
  .modal-head-left { justify-content: center !important; }
  .download-btn, .linkedin-btn-sm { justify-content: center !important; width: 100% !important; }
}
`;

/* ── Page Styles ─────────────────────────────────────────────────── */
const S = {
  shell:            { maxWidth:1180, margin:"0 auto", padding:"24px 18px 48px" },
  center:           { minHeight:"50vh", display:"grid", placeItems:"center" },
  pageHeader:       { display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 },
  pageKicker:       { display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:800, color:"#2EABFE", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 },
  pageTitle:        { fontSize:26, fontWeight:950, color:"#091925", letterSpacing:"-0.4px", marginBottom:4 },
  pageSub:          { fontSize:13, fontWeight:600, color:"rgba(9,25,37,0.50)" },
  headerBadge:      { display:"inline-flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:12, border:"1px solid rgba(46,171,254,0.22)", background:"rgba(46,171,254,0.06)", fontSize:13, fontWeight:800, color:"rgba(9,25,37,0.80)" },
  errorBox:         { display:"flex", alignItems:"center", gap:8, padding:"14px 18px", borderRadius:14, background:"#fef2f2", border:"1px solid #fecaca", color:"#b91c1c", fontWeight:700, fontSize:13 },

  instrBanner:      { borderRadius:18, border:"1px solid rgba(46,171,254,0.20)", background:"rgba(46,171,254,0.04)", padding:"14px 18px", marginBottom:20, display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" },
  instrBannerLeft:  { display:"flex", gap:12, alignItems:"flex-start", flex:1, minWidth:220 },
  instrBannerIcon:  { width:34, height:34, borderRadius:10, background:"rgba(46,171,254,0.10)", border:"1px solid rgba(46,171,254,0.20)", display:"grid", placeItems:"center", flexShrink:0 },
  instrBannerTitle: { fontWeight:800, fontSize:13, color:"rgba(9,25,37,0.85)", marginBottom:3 },
  instrBannerSub:   { fontSize:12, fontWeight:600, color:"rgba(9,25,37,0.52)", lineHeight:1.5 },
  instrToggle:      { display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(46,171,254,0.25)", background:"#fff", cursor:"pointer", fontWeight:800, fontSize:13, color:"#2EABFE" },
  instrSteps:       { width:"100%", display:"grid", gap:10, paddingTop:12, borderTop:"1px solid rgba(46,171,254,0.12)", marginTop:4 },
  instrStep:        { display:"flex", gap:10, alignItems:"flex-start" },
  instrStepNum:     { width:22, height:22, borderRadius:999, background:"#2EABFE", color:"#fff", fontSize:11, fontWeight:900, display:"grid", placeItems:"center", flexShrink:0, marginTop:1 },
  instrStepText:    { fontSize:13, fontWeight:700, color:"rgba(9,25,37,0.75)", lineHeight:1.55 },
  nmlsLink:         { display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:800, color:"#2EABFE", textDecoration:"none", marginTop:4 },

  grid:             { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 },
  card:             { borderRadius:20, background:"#fff", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"0 8px 24px rgba(2,8,23,0.07)", overflow:"hidden", display:"flex", flexDirection:"column" },
  cardAccent:       { height:4, width:"100%" },
  cardBody:         { padding:"18px 18px 16px", display:"flex", flexDirection:"column", gap:12, flex:1 },
  cardTop:          { display:"flex", alignItems:"center", justifyContent:"space-between" },
  cardIconWrap:     { width:42, height:42, borderRadius:14, display:"grid", placeItems:"center" },
  cardTitle:        { fontWeight:900, fontSize:15, color:"rgba(9,25,37,0.88)", lineHeight:1.35 },
  metaGrid:         { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
  metaItem:         { display:"flex", gap:8, alignItems:"flex-start" },
  metaIcon:         { marginTop:2, color:"rgba(9,25,37,0.40)", flexShrink:0 },
  metaLabel:        { fontSize:10, fontWeight:800, color:"rgba(9,25,37,0.45)", textTransform:"uppercase", letterSpacing:".04em", marginBottom:2 },
  metaValue:        { fontSize:13, fontWeight:800, color:"rgba(9,25,37,0.80)" },
  completionBadge:  { display:"inline-flex", alignItems:"center", gap:7, padding:"6px 12px", borderRadius:999, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.22)", fontSize:12, fontWeight:800, color:"rgba(21,128,61,0.90)", alignSelf:"flex-start" },
  cardActions:      { display:"flex", gap:8, marginTop:"auto", paddingTop:4 },
  previewBtn:       { flex:1, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 14px", borderRadius:12, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:13 },
  viewFullBtn:      { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 14px", borderRadius:12, border:"1px solid rgba(2,8,23,0.12)", background:"#fff", color:"rgba(9,25,37,0.80)", cursor:"pointer", fontWeight:800, fontSize:13 },
  linkedinBtn:      { width:40, height:40, display:"inline-flex", alignItems:"center", justifyContent:"center", borderRadius:12, border:"1px solid rgba(10,102,194,0.25)", background:"rgba(10,102,194,0.06)", color:"rgba(10,102,194,1)", cursor:"pointer", flexShrink:0 },

  emptyWrap:        { textAlign:"center", padding:"60px 20px" },
  emptyIconWrap:    { width:80, height:80, borderRadius:999, background:"rgba(2,8,23,0.04)", border:"1px solid rgba(2,8,23,0.08)", display:"grid", placeItems:"center", margin:"0 auto 18px" },
  emptyTitle:       { fontWeight:900, fontSize:18, color:"rgba(9,25,37,0.80)", marginBottom:8 },
  emptySub:         { fontSize:13, fontWeight:600, color:"rgba(9,25,37,0.50)", lineHeight:1.7, maxWidth:400, margin:"0 auto 22px" },
  emptyBtn:         { display:"inline-flex", alignItems:"center", gap:8, padding:"12px 20px", borderRadius:14, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:14 },
};

/* ── Modal Styles ────────────────────────────────────────────────── */
const M = {
  backdrop:         { position:"fixed", inset:0, zIndex:200, background:"rgba(9,25,37,0.65)", backdropFilter:"blur(6px)" },
  modal:            { position:"fixed", zIndex:201, top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(1020px,96vw)", maxHeight:"92vh", background:"#fff", borderRadius:24, boxShadow:"0 40px 100px rgba(9,25,37,0.25)", display:"flex", flexDirection:"column", overflow:"hidden" },
  modalHead:        { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(2,8,23,0.08)", flexShrink:0 },
  modalHeadLeft:    { display:"flex", alignItems:"center", gap:10 },
  modalHeadTitle:   { fontWeight:900, fontSize:15, color:"#091925" },
  modalHeadActions: { display:"flex", alignItems:"center", gap:8 },
  downloadBtn:      { display:"inline-flex", alignItems:"center", gap:7, padding:"9px 14px", borderRadius:10, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:13 },
  linkedinBtnSm:    { display:"inline-flex", alignItems:"center", gap:7, padding:"9px 14px", borderRadius:10, border:"1px solid rgba(10,102,194,0.25)", background:"rgba(10,102,194,0.06)", color:"rgba(10,102,194,1)", cursor:"pointer", fontWeight:800, fontSize:13 },
  closeBtn:         { width:34, height:34, borderRadius:9, border:"1px solid rgba(2,8,23,0.10)", background:"#f8fafc", cursor:"pointer", display:"grid", placeItems:"center", color:"rgba(9,25,37,0.60)" },
  modalBody:        { display:"grid", gridTemplateColumns:"1fr 280px", flex:1, overflow:"hidden", minHeight:0 },

  certWrap:         { overflow:"auto", padding:20, background:"#f6f7fb", display:"flex", justifyContent:"center", alignItems:"flex-start" },
  cert:             { width:620, minWidth:500, background:"#fff", borderRadius:16, boxShadow:"0 16px 50px rgba(9,25,37,0.14)", overflow:"hidden" },
  certTopBar:       { height:6, background:"linear-gradient(90deg,#2EABFE,#00B4B4)" },
  certHeader:       { textAlign:"center", padding:"24px 32px 16px" },
  certSeal:         { width:60, height:60, borderRadius:999, background:"rgba(46,171,254,0.08)", border:"2px solid rgba(46,171,254,0.22)", display:"grid", placeItems:"center", margin:"0 auto 12px" },
  certOrg:          { fontSize:11, fontWeight:900, color:"#2EABFE", textTransform:"uppercase", letterSpacing:".12em", marginBottom:6 },
  certDocTitle:     { fontSize:22, fontWeight:900, color:"#091925", letterSpacing:"-0.3px", marginBottom:5 },
  certCourseType:   { fontSize:11, fontWeight:800, color:"rgba(9,25,37,0.50)", textTransform:"uppercase", letterSpacing:".08em" },
  certDivider:      { display:"flex", alignItems:"center", gap:10, padding:"0 32px", margin:"4px 0" },
  certDividerLine:  { flex:1, height:1, background:"rgba(46,171,254,0.20)" },
  certBody:         { padding:"14px 36px 20px", textAlign:"center" },
  certPresentsTo:   { fontSize:12, fontWeight:700, color:"rgba(9,25,37,0.55)", marginBottom:8 },
  certStudentName:  { fontSize:26, fontWeight:900, color:"#091925", letterSpacing:"-0.4px", marginBottom:8, borderBottom:"2px solid rgba(46,171,254,0.25)", paddingBottom:8, display:"inline-block" },
  certHasCompleted: { fontSize:12, fontWeight:700, color:"rgba(9,25,37,0.55)", marginBottom:10, marginTop:8 },
  certCourseName:   { fontSize:15, fontWeight:900, color:"#091925", lineHeight:1.4, marginBottom:16 },
  certDetails:      { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, background:"rgba(46,171,254,0.04)", border:"1px solid rgba(46,171,254,0.14)", borderRadius:12, padding:"12px 14px", textAlign:"left" },
  certDetailItem:   { display:"grid", gap:3 },
  certDetailLabel:  { fontSize:8, fontWeight:900, color:"rgba(9,25,37,0.45)", textTransform:"uppercase", letterSpacing:".08em" },
  certDetailValue:  { fontSize:11, fontWeight:800, color:"rgba(9,25,37,0.82)" },
  certSignRow:      { display:"flex", alignItems:"center", justifyContent:"space-around", padding:"16px 36px 12px", gap:16 },
  certSigBlock:     { textAlign:"center", flex:1 },
  certSigLine:      { height:1, background:"rgba(9,25,37,0.20)", marginBottom:6, width:"80%", margin:"0 auto 6px" },
  certSigLabel:     { fontSize:9, fontWeight:800, color:"rgba(9,25,37,0.45)", textTransform:"uppercase", letterSpacing:".06em" },
  certSigName:      { fontSize:11, fontWeight:900, color:"rgba(9,25,37,0.80)", marginTop:2 },
  certSealCircle:   { width:60, height:60, borderRadius:999, border:"2px dashed rgba(46,171,254,0.40)", display:"grid", placeItems:"center", flexShrink:0, textAlign:"center" },
  certBottomBar:    { background:"linear-gradient(90deg,#091925,#0d2a4a)", color:"rgba(255,255,255,0.55)", fontSize:9, fontWeight:700, display:"flex", justifyContent:"center", gap:10, padding:"8px 16px", letterSpacing:".04em" },

  // Attestation (10–12pt minimum required by policy)
  attestationWrap:  { padding:"12px 36px 6px", borderTop:"1px solid rgba(2,8,23,0.06)" },
  attestationLabel: { fontSize:10, fontWeight:900, color:"rgba(9,25,37,0.50)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 },
  attestationText:  { fontSize:12, lineHeight:1.55, fontWeight:700, color:"rgba(9,25,37,0.78)" },

  sidePanel:        { borderLeft:"1px solid rgba(2,8,23,0.08)", overflow:"auto", padding:16, display:"grid", gap:18, alignContent:"start" },
  sideSect:         { display:"grid", gap:8 },
  sideSectTitle:    { display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:900, color:"rgba(9,25,37,0.50)", textTransform:"uppercase", letterSpacing:".06em" },
  certIdRow:        { display:"flex", alignItems:"center", gap:8 },
  certIdVal:        { fontFamily:"monospace", fontWeight:900, fontSize:13, color:"#091925", flex:1 },
  copyBtn:          { display:"inline-flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:8, border:"1px solid rgba(2,8,23,0.12)", background:"#f8fafc", cursor:"pointer", fontWeight:800, fontSize:12, color:"rgba(9,25,37,0.70)" },
  viewFullBtn:      { display:"flex", alignItems:"center", gap:10, padding:"11px 13px", borderRadius:12, border:"1px solid rgba(2,8,23,0.10)", background:"#f8fafc", cursor:"pointer", color:"rgba(9,25,37,0.80)" },
  linkedinFull:     { display:"flex", alignItems:"center", gap:10, padding:"11px 13px", borderRadius:12, border:"1px solid rgba(10,102,194,0.22)", background:"rgba(10,102,194,0.05)", cursor:"pointer", color:"rgba(10,102,194,1)" },
  instructionsList: { display:"grid", gap:8 },
  instrStep:        { display:"flex", gap:8, alignItems:"flex-start" },
  instrNum:         { width:18, height:18, borderRadius:999, background:"rgba(46,171,254,0.15)", color:"#2EABFE", fontSize:10, fontWeight:900, display:"grid", placeItems:"center", flexShrink:0, marginTop:1 },
  instrText:        { fontSize:11, fontWeight:700, color:"rgba(9,25,37,0.72)", lineHeight:1.55 },
  nmlsLink:         { display:"inline-flex", alignItems:"center", gap:6, fontSize:11, fontWeight:800, color:"#2EABFE", textDecoration:"none" },
};

export default MyCertificates;