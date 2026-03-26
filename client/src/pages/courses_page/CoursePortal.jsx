import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, PlayCircle,
  BookOpen, ClipboardList, Trophy, Lock, ChevronRight,
  AlertCircle, Star, X, FileText, ExternalLink, Award, Clock,
  Eye,
} from "lucide-react";
import API from "../../api/axios";
import RocsModal from "../../components/RocsModal";
import useSeatTimer from "../../hooks/useSeatTimer";
import BioSigModal from "../../components/BioSigModal";
import TestimonialGateModal from "../../components/TempModal";
/* ─── Build content array from DB course ────────────────────────── */
const buildPdfUrl = (baseUrl, startPage) => {
  if (!baseUrl) return null;
  const page = Number.isFinite(startPage) && startPage > 0 ? startPage : null;
  if (!page) return baseUrl;
  const noFrag = String(baseUrl).split("#")[0];
  return `${noFrag}#page=${page}`;
};

const buildContent = (course) => {
  const content = [];
  if (!course?.modules?.length) return content;
  const coursePdf = course.pdf_url || null;

  course.modules
    .sort((a, b) => a.order - b.order)
    .forEach((mod) => {
      const modPdf = buildPdfUrl(mod.pdf_url || coursePdf, mod.pdf_start_page);
      content.push({
        id: `lesson-mod-${mod.order}`, type: "lesson",
        title: mod.title, credit_hours: mod.credit_hours,
        moduleOrder: mod.order,
        pdf_url: modPdf, video_url: mod.video_url || null, sections: mod.sections || [],
      });
      if (mod.show_pdf_before_quiz && modPdf) {
        content.push({
          id: `pdf-gate-mod-${mod.order}`, type: "pdf_gate",
          title: `Study Material: ${mod.title}`,
          pdf_url: modPdf, moduleOrder: mod.order,
        });
      }
      if (mod.quiz?.length) {
        const isFundamentals = mod.show_pdf_before_quiz && mod.quiz.length > 10;
        content.push({
          id: `checkpoint-mod-${mod.order}`,
          type: isFundamentals ? "quiz_fundamentals" : "checkpoint",
          title: isFundamentals ? `${mod.title} — Fundamentals Exam` : `Checkpoint: ${mod.title}`,
          moduleOrder: mod.order,
          questions: mod.quiz.map((q, i) => ({
            id: `mod${mod.order}-q${i}`,
            text: q.question,
            options: q.options,
            correct: q.correct_index,
          })),
          passingScore: 70, timeLimitMin: 120,
        });
      }
    });

  if (course.final_exam?.questions?.length) {
    content.push({
      id: "final-exam", type: "quiz",
      title: course.final_exam.title || "Final Exam",
      passingScore: course.final_exam.passing_score || 70,
      timeLimitMin: course.final_exam.time_limit_minutes || 90,
      moduleOrder: 999,
      questions: course.final_exam.questions.map((q, i) => ({
        id: `fq${i}`,
        text: q.question,
        options: q.options,
        correct: q.correct_index,
      })),
    });
  }
  return content;
};

const toGDriveEmbed = (url) => {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
};

const buildReviewContent = (course) => {
  const base = buildContent(course);
  base.push({ id: "review-summary", type: "review_summary", title: "Course Summary", moduleOrder: 9999 });
  return base;
};

/* ─── Main Component ─────────────────────────────────────────────── */
const CoursePortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse]           = useState(null);
  const [content, setContent]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [finished, setFinished]       = useState(false);
  const [reviewMode, setReviewMode]   = useState(false);
  const [error, setError]             = useState(null);
  const [transcriptEntry, setTranscriptEntry] = useState(null);

  const [completed, setCompleted]   = useState(() => new Set());
  const [currentIdx, setCurrentIdx] = useState(0);

  const [rocsChecked, setRocsChecked] = useState(false);
  const [rocsAgreed, setRocsAgreed]   = useState(false);
  const [showRocs, setShowRocs]       = useState(false);

  const [bioSigVerified, setBioSigVerified] = useState(false);
  const [showBioSig,     setShowBioSig]     = useState(false);

  const [inactivityWarning, setInactivityWarning] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [isExpired,      setIsExpired]      = useState(false);
  const [expiresWarning, setExpiresWarning] = useState(null);

  const saveProgressRef = useRef({ t: null });

  const saveProgress = useCallback(({ nextCompletedSet, nextIdx, totalSteps }) => {
    const completed_idxs = [...nextCompletedSet].sort((a, b) => a - b);
    if (saveProgressRef.current.t) clearTimeout(saveProgressRef.current.t);
    saveProgressRef.current.t = setTimeout(() => {
      API.put(`/dashboard/progress/${id}`, { completed_idxs, current_idx: nextIdx, total_steps: totalSteps }).catch(() => {});
      API.put(`/enrollment/${id}/progress`, { completed_idxs, current_idx: nextIdx, total_steps: totalSteps }).catch(() => {});
    }, 250);
  }, [id]);

  const handleInactivityLogout = useCallback(() => {
    setInactivityWarning(true);
    setCompleted((prev) => { const next = new Set(prev); next.delete(currentIdx); return next; });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setInactivityWarning(false), 8000);
  }, [currentIdx]);

  const currentModuleOrder = content[currentIdx]?.moduleOrder ?? 0;
  const { flush: flushSeatTime, getSeatSeconds } = useSeatTimer({
    courseId: id, moduleOrder: currentModuleOrder,
    enabled: rocsAgreed && !finished && !reviewMode,
    onInactivityLogout: handleInactivityLogout,
  });

  const refreshAttempts = useCallback(async () => {
    try {
      const res = await API.get(`/quiz-attempts/${id}`);
      setQuizAttempts(res.data?.attempts || {});
    } catch (err) {
      console.error('[CoursePortal] refreshAttempts failed:', err.message);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, transcriptRes, rocsRes] = await Promise.all([
          API.get(`/courses/${id}`),
          API.get("/dashboard/transcript").catch(() => ({ data: { transcript: [] } })),
          API.get(`/rocs/check/${id}`).catch(() => ({ data: { agreed: false } })),
        ]);

        const data = courseRes.data?.data || courseRes.data;
        setCourse(data);

        const isAlreadyCompleted = transcriptRes.data?.transcript?.some(
          (t) => String(t.course_id?._id || t.course_id) === String(id)
        );
        const built = isAlreadyCompleted ? buildReviewContent(data) : buildContent(data);
        setContent(built);

        if (data.type === 'CE' && data.expires_at) {
          const now = new Date(), expiry = new Date(data.expires_at);
          const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
          if (now > expiry) setIsExpired(true);
          else if (daysLeft <= 30) setExpiresWarning(daysLeft);
        }

        const agreed = rocsRes.data?.agreed || false;
        setRocsAgreed(agreed); setRocsChecked(true);
        if (!agreed) setShowRocs(true);
        setBioSigVerified(false); setShowBioSig(true);

        const transcript = transcriptRes.data?.transcript || [];
        const entry = transcript.find(
          (t) => String(t.course_id?._id || t.course_id) === String(id)
        );

        if (entry) {
          setTranscriptEntry(entry);
          setFinished(true);
          const allIdxs = new Set(built.map((_, i) => i));
          setCompleted(allIdxs);
          setReviewMode(true);
          await refreshAttempts();
          setLoading(false);
          return;
        }

        const progRes = await API.get(`/dashboard/progress/${id}`).catch(() => ({ data: null }));
        const prog = progRes.data || {};
        const completed_idxs = Array.isArray(prog.completed_idxs) ? prog.completed_idxs : [];
        const idx = Number.isFinite(prog.current_idx) ? prog.current_idx : 0;
        const safeIdx = Math.max(0, Math.min(idx, built.length > 0 ? built.length - 1 : 0));
        const nextCompleted = new Set(
          completed_idxs.filter((n) => Number.isFinite(n) && n >= 0 && n < built.length)
        );
        setCompleted(nextCompleted); setCurrentIdx(safeIdx);
        if ((prog.total_steps || 0) !== built.length)
          saveProgress({ nextCompletedSet: nextCompleted, nextIdx: safeIdx, totalSteps: built.length });
        await refreshAttempts();
      } catch (err) {
        console.error("Failed to load course:", err);
        setError("Could not load course content.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, saveProgress, refreshAttempts]);

  const current  = content[currentIdx] || null;
  const progress = reviewMode ? 100 : (content.length ? Math.round((completed.size / content.length) * 100) : 0);

  const markComplete = (idx) => {
    if (reviewMode) return;
    setCompleted((prev) => {
      const next = new Set([...prev, idx]);
      saveProgress({ nextCompletedSet: next, nextIdx: currentIdx, totalSteps: content.length });
      return next;
    });
  };

  const navigateTo = (idx) => {
    if (!reviewMode) flushSeatTime();
    setCurrentIdx(idx);
    if (!reviewMode) saveProgress({ nextCompletedSet: completed, nextIdx: idx, totalSteps: content.length });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canNavigateTo = (idx) => reviewMode ? true : (idx === 0 || completed.has(idx - 1));

  const goNext = () => {
    markComplete(currentIdx);
    if (currentIdx < content.length - 1) navigateTo(currentIdx + 1);
  };
  const goPrev = () => { if (currentIdx > 0) navigateTo(currentIdx - 1); };

  const handleFinish = async () => {
    markComplete(currentIdx); flushSeatTime();
    try {
      await Promise.all([
        API.post("/dashboard/complete", { courseId: id }),
        API.post(`/enrollment/${id}/complete`),
      ]);
    } catch (err) { console.warn("Could not save completion:", err.message); }
    setFinished(true);
    const allIdxs = new Set(content.map((_, i) => i));
    setCompleted(allIdxs);
  };

  const handleRocsAgreed    = () => { setRocsAgreed(true); setShowRocs(false); };
  const handleRocsCancel    = () => { navigate(`/courses/${id}`); };
  const handleBioSigVerified = () => { setBioSigVerified(true); setShowBioSig(false); if (!rocsAgreed) setShowRocs(true); };
  const handleBioSigCancel   = () => { navigate(`/courses/${id}`); };

  if (loading) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.loadCenter}>
        <div style={{ textAlign: "center" }}>
          <div className="cp-spin" style={{ margin: "0 auto 16px" }} />
          <div style={{ color: "rgba(10,22,40,0.5)", fontWeight: 600, fontSize: 14 }}>Loading course...</div>
        </div>
      </div>
    </div>
  );

  if (finished && !reviewMode) return (
    <CompletionScreen
      course={course} transcriptEntry={transcriptEntry}
      navigate={navigate} courseId={id}
      onReview={() => {
        const rc = buildReviewContent(course);
        setContent(rc);
        const allIdxs = new Set(rc.map((_, i) => i));
        setCompleted(allIdxs); setCurrentIdx(0); setReviewMode(true);
        refreshAttempts();
      }}
    />
  );

  if (isExpired) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.loadCenter}>
        <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#0a1628", marginBottom: 10 }}>Course Access Expired</div>
          <div style={{ fontSize: 15, color: "rgba(10,22,40,0.60)", fontWeight: 600, lineHeight: 1.7, marginBottom: 24 }}>
            This CE course expired on {new Date(course?.expires_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
            Per NMLS requirements, CE courses must be completed by December 31 of the calendar year.
          </div>
          <button style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "#2EABFE", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
            onClick={() => navigate("/my-courses")} type="button">Back to My Courses</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{css}</style>

      {!reviewMode && showBioSig && !bioSigVerified && (
        <BioSigModal courseId={id} courseName={course?.title || ""} onVerified={handleBioSigVerified} onCancel={handleBioSigCancel} />
      )}
      {!reviewMode && showRocs && rocsChecked && !rocsAgreed && bioSigVerified && (
        <RocsModal courseId={id} courseName={course?.title || ""} onAgreed={handleRocsAgreed} onCancel={handleRocsCancel} />
      )}

      {inactivityWarning && !reviewMode && (
        <div style={S.inactivityBanner}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          You were logged out due to inactivity. Your progress was saved, but time for this unit was not counted.
        </div>
      )}
      {expiresWarning !== null && !reviewMode && (
        <div style={S.inactivityBanner}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          This CE course expires on December 31. You have {expiresWarning} day{expiresWarning !== 1 ? "s" : ""} left to complete it.
        </div>
      )}

      {reviewMode && (
        <div style={S.reviewBanner}>
          <Eye size={15} style={{ flexShrink: 0 }} />
          <span>You are in <strong>Review Mode</strong> — this course is already completed. All content is unlocked for your review.</span>
          <button style={S.reviewExitBtn} onClick={() => navigate("/my-courses")} type="button">
            Back to My Courses
          </button>
        </div>
      )}

      {error && <div style={S.errorBanner}><AlertCircle size={14} /> {error}</div>}

      <header style={S.topbar}>
        <div style={S.topbarLeft}>
          <button style={S.exitBtn} onClick={() => navigate(`/courses/${id}`)} type="button">
            <ArrowLeft size={15} /> Exit
          </button>
          <div style={S.courseNameWrap}>
            <div style={S.courseName}>{course?.title || "Course"}</div>
            <div style={S.courseType}>
              {course?.type} · {course?.credit_hours} credit hrs
              {reviewMode && <span style={{ marginLeft: 8, color: "#F59E0B", fontWeight: 800 }}>· Review Mode</span>}
            </div>
          </div>
        </div>
        <div style={S.topbarCenter}>
          <div style={S.progressBarWrap}>
            <div style={{ ...S.progressBarFill, width: `${progress}%`, ...(reviewMode ? { background: "linear-gradient(90deg,#F59E0B,#22C55E)" } : {}) }} />
          </div>
          <span style={S.progressText}>{reviewMode ? "Completed ✓" : `${progress}% complete`}</span>
        </div>
        <button style={S.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)} type="button">
          <BookOpen size={16} /><span>{sidebarOpen ? "Hide" : "Contents"}</span>
        </button>
      </header>

      <div style={S.body}>
        {sidebarOpen && (
          <aside style={S.sidebar} className="cp-sidebar">
            <div style={S.sidebarHead}>
              {reviewMode ? "📋 Course Review" : "Course Contents"}
              <span style={{ marginLeft: 8, fontSize: 11, color: "rgba(10,22,40,0.40)", fontWeight: 600 }}>
                {reviewMode ? `${content.length} steps` : `${completed.size}/${content.length}`}
              </span>
            </div>
            <div style={S.sidebarList}>
              {content.map((item, idx) => {
                const isDone    = reviewMode ? true : completed.has(idx);
                const isCurrent = idx === currentIdx;
                const isLocked  = !canNavigateTo(idx);
                const icon =
                  item.type === "lesson"            ? <PlayCircle size={14} /> :
                  item.type === "pdf_gate"          ? <FileText size={14} /> :
                  item.type === "checkpoint"        ? <ClipboardList size={14} /> :
                  item.type === "quiz_fundamentals" ? <ClipboardList size={14} /> :
                  <Trophy size={14} />;
                const iconColor =
                  item.type === "checkpoint"        ? "rgba(245,158,11,1)" :
                  item.type === "quiz_fundamentals" ? "rgba(245,158,11,1)" :
                  item.type === "pdf_gate"          ? "rgba(239,68,68,0.80)" :
                  item.type === "quiz"              ? "rgba(34,197,94,1)" :
                  "var(--cp-blue)";
                const typeLabel =
                  item.type === "lesson"            ? "Lesson" :
                  item.type === "pdf_gate"          ? "Study Material" :
                  item.type === "checkpoint"        ? "Checkpoint" :
                  item.type === "quiz_fundamentals" ? "Fundamentals Exam" :
                  item.type === "review_summary"    ? "Summary" :
                  "Final Exam";
                return (
                  <button key={item.id}
                    style={{ ...S.sidebarItem, ...(isCurrent ? S.sidebarItemActive : {}), ...(isLocked ? S.sidebarItemLocked : {}) }}
                    onClick={() => !isLocked && navigateTo(idx)} type="button" disabled={isLocked}>
                    <div style={S.sidebarItemLeft}>
                      <div style={{ ...S.sidebarIcon, color: iconColor }}>{icon}</div>
                      <div>
                        <div style={S.sidebarLabel}>{typeLabel}</div>
                        <div style={S.sidebarTitle}>{item.title}</div>
                      </div>
                    </div>
                    {isDone   && <CheckCircle2 size={16} style={{ color: "rgba(34,197,94,1)", flexShrink: 0 }} />}
                    {isLocked && !reviewMode && <Lock size={13} style={{ color: "rgba(11,18,32,0.30)", flexShrink: 0 }} />}
                    {!isDone && !isLocked && isCurrent && <ChevronRight size={14} style={{ color: "var(--cp-blue)", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
            {reviewMode && transcriptEntry?.completed_at && (
              <div style={{ ...S.resumeBanner, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)" }}>
                <div style={{ ...S.resumeBannerText, color: "rgba(146,84,0,1)" }}>
                  <Award size={13} style={{ color: "#F59E0B", flexShrink: 0 }} /> Course Completed
                </div>
                <div style={S.resumeBannerSub}>
                  {new Date(transcriptEntry.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            )}
          </aside>
        )}

        <main style={S.main} className="cp-main">
          <div style={S.contentWrap}>
            {current?.type === "lesson" && (
              <LessonView item={current} onComplete={goNext} onPrev={goPrev} showPrev={currentIdx > 0}
                getSeatSeconds={getSeatSeconds} reviewMode={reviewMode} />
            )}
            {current?.type === "pdf_gate" && (
              <PDFGateView item={current} onComplete={goNext} onPrev={goPrev} reviewMode={reviewMode} />
            )}
            {current?.type === "checkpoint" && (
              <CheckpointView item={current} onComplete={goNext} onPrev={goPrev}
                courseId={id} attemptInfo={quizAttempts[current.id]} onAttemptLogged={refreshAttempts}
                reviewMode={reviewMode} />
            )}
            {current?.type === "quiz_fundamentals" && (
              <QuizView item={current} onFinish={goNext} onPrev={goPrev}
                courseId={id} attemptInfo={quizAttempts[current.id]} onAttemptLogged={refreshAttempts}
                reviewMode={reviewMode} />
            )}
            {current?.type === "review_summary" && (
              <ReviewSummaryView
                course={course} courseId={id} content={content}
                quizAttempts={quizAttempts}
                onPrev={goPrev} navigate={navigate}
              />
            )}
            {current?.type === "quiz" && (
              <QuizView item={current} onFinish={reviewMode ? goNext : handleFinish} onPrev={goPrev}
                courseId={id} attemptInfo={quizAttempts[current.id]} onAttemptLogged={refreshAttempts}
                reviewMode={reviewMode} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

/* ─── PDF Viewer ─────────────────────────────────────────────────── */
const PDFViewer = ({ url }) => {
  const [pdfError, setPdfError] = useState(false);
  if (!url) return (
    <div style={S.pdfPlaceholder}>
      <FileText size={40} style={{ color: "rgba(46,171,254,0.5)", marginBottom: 12 }} />
      <div style={{ fontWeight: 700, fontSize: 15, color: "rgba(10,22,40,0.6)", marginBottom: 6 }}>Course Material PDF</div>
      <div style={{ fontSize: 13, color: "rgba(10,22,40,0.40)", fontWeight: 500 }}>PDF will appear here once uploaded</div>
    </div>
  );
  return (
    <div style={S.pdfWrap}>
      <div style={S.pdfToolbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={15} style={{ color: "var(--cp-blue)" }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: "rgba(10,22,40,0.75)" }}>Course Material</span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" style={S.pdfOpenBtn}><ExternalLink size={13} /> Open Full PDF</a>
      </div>
      {pdfError ? (
        <div style={S.pdfErrorBox}>
          <AlertCircle size={24} style={{ color: "rgba(239,68,68,0.7)", marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "rgba(10,22,40,0.7)" }}>PDF cannot be displayed inline</div>
          <a href={url} target="_blank" rel="noopener noreferrer" style={S.pdfFallbackBtn}><ExternalLink size={14} /> Open PDF in New Tab</a>
        </div>
      ) : (
        <iframe src={url} style={S.pdfIframe} title="Course Material" onError={() => setPdfError(true)} />
      )}
    </div>
  );
};

/* ─── PDF Gate View ──────────────────────────────────────────────── */
const PDFGateView = ({ item, onComplete, onPrev, reviewMode }) => {
  const [confirmed, setConfirmed] = useState(reviewMode);
  useEffect(() => { setConfirmed(reviewMode); }, [item.id, reviewMode]);
  return (
    <div style={S.lessonWrap}>
      <div style={S.typePillRed}><FileText size={14} /> Study Material {reviewMode && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>(Review)</span>}</div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      {!reviewMode && (
        <div style={S.pdfGateBanner}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>Review this study material carefully before proceeding to the Fundamentals Exam.</span>
        </div>
      )}
      <PDFViewer url={item.pdf_url} />
      {!reviewMode && (
        <div style={S.pdfGateConfirmRow}>
          <input type="checkbox" id="pdf-confirm" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
            style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--cp-blue)", flexShrink: 0 }} />
          <label htmlFor="pdf-confirm" style={{ fontSize: 14, fontWeight: 700, color: "rgba(10,22,40,0.80)", cursor: "pointer", lineHeight: 1.4 }}>
            I have reviewed the study material and I am ready to take the Fundamentals Exam.
          </label>
        </div>
      )}
      <div style={S.navRow}>
        <button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>
        <button style={{ ...S.nextBtn, ...(!confirmed ? S.nextBtnDim : {}) }} onClick={confirmed ? onComplete : undefined} disabled={!confirmed} type="button">
          {reviewMode ? <>Next <ArrowRight size={16} /></> : <>Proceed to Exam <ArrowRight size={16} /></>}
        </button>
      </div>
    </div>
  );
};

/* ─── Lesson View ────────────────────────────────────────────────── */
const calcMinSeatSeconds = (creditHours) => 10; // TESTING — restore: Math.round((creditHours||0)*50*60)

const LessonView = ({ item, onComplete, onPrev, showPrev, getSeatSeconds, reviewMode }) => {
  const minSeatSeconds = reviewMode ? 0 : calcMinSeatSeconds(item.credit_hours);
  const [pdfView,   setPdfView]   = useState(!!item.pdf_url);
  const [seatsLeft, setSeatsLeft] = useState(minSeatSeconds);
  const [seatMet,   setSeatMet]   = useState(minSeatSeconds === 0);
  const tickRef = useRef(null);

  useEffect(() => {
    setPdfView(!!item.pdf_url);
    const min = reviewMode ? 0 : calcMinSeatSeconds(item.credit_hours);
    setSeatsLeft(min); setSeatMet(min === 0);
    if (min === 0) return;
    tickRef.current = setInterval(() => {
      const accumulated = getSeatSeconds ? getSeatSeconds() : 0;
      const remaining   = Math.max(0, min - Math.round(accumulated));
      setSeatsLeft(remaining);
      if (remaining === 0) { setSeatMet(true); clearInterval(tickRef.current); }
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [item.id, item.credit_hours, item.pdf_url, reviewMode]);

  const fmt = (s) => { const m = Math.floor(s / 60), sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; };

  return (
    <div style={S.lessonWrap}>
      <div style={S.typePill}>
        <PlayCircle size={14} /> Lesson
        {item.credit_hours > 0 && <span style={{ opacity: 0.7 }}>· {item.credit_hours} hr{item.credit_hours !== 1 ? "s" : ""}</span>}
        {reviewMode && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.6 }}>(Review)</span>}
      </div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      {item.pdf_url && item.sections?.length > 0 && (
        <div style={S.viewToggle}>
          <button style={{ ...S.toggleBtn, ...(pdfView ? S.toggleBtnActive : {}) }} onClick={() => setPdfView(true)} type="button"><FileText size={13} /> PDF View</button>
          <button style={{ ...S.toggleBtn, ...(!pdfView ? S.toggleBtnActive : {}) }} onClick={() => setPdfView(false)} type="button"><BookOpen size={13} /> Outline View</button>
        </div>
      )}
      {pdfView && <PDFViewer url={item.pdf_url} />}
      {!pdfView && (
        <>
          {item.video_url ? (
            <div style={S.videoBox}>
              <iframe 
                src={toGDriveEmbed(item.video_url)} 
                title={`${item.title} - Video Lesson`}
                style={S.videoIframe}
                allow="autoplay; fullscreen" 
                allowFullScreen
              />
            </div>
          ) : (
            <div style={S.videoBox}>
              <div style={S.videoInner}>
                <div style={S.videoIconWrap}><PlayCircle size={48} style={{ color: "#fff", opacity: 0.9 }} /></div>
                <div style={S.videoLabel}>Video Lesson</div>
                <div style={S.videoSub}>Video content will be embedded here</div>
              </div>
            </div>
          )}
          {item.sections?.length > 0 && (
            <div style={S.lessonText}>
              <h3 style={{ ...S.lessonH3, marginTop: 0 }}>Topics Covered in This Module</h3>
              <ul style={S.lessonUl}>{item.sections.map((s, i) => <li key={i} style={S.lessonLi}>{s}</li>)}</ul>
            </div>
          )}
        </>
      )}

      <div style={S.navRow}>
        {showPrev && <button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>}
        <button style={{ ...S.nextBtn, ...(!seatMet ? S.nextBtnDim : {}) }} onClick={seatMet ? onComplete : undefined} disabled={!seatMet} type="button">
          {seatMet ? <>Continue <ArrowRight size={16} /></> : <><Clock size={14} /> {fmt(seatsLeft)} remaining</>}
        </button>
      </div>
    </div>
  );
};

/* ─── Attempt Warning Banners ────────────────────────────────────── */
const AttemptWarning1st = () => (
  <div style={S.attemptWarning}>
    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
    <div>
      <div style={{ fontWeight: 800, marginBottom: 3 }}>Exam Attempt 1 of 3</div>
      <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.6 }}>You have 3 attempts total. Read each question carefully before submitting.</div>
    </div>
  </div>
);
const AttemptWarning2nd = () => (
  <div style={{ ...S.attemptWarning, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.30)", color: "rgba(146,84,0,1)" }}>
    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
    <div>
      <div style={{ fontWeight: 800, marginBottom: 3 }}>⚠️ Attempt 2 of 3 — One Retake Left</div>
      <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.6 }}>
        You have <strong>1 retake remaining</strong>. If you fail again, your exam will be <strong>locked</strong> and you must contact your instructor.
      </div>
    </div>
  </div>
);
const AttemptWarning3rd = () => (
  <div style={{ ...S.attemptWarning, background: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.35)", color: "rgba(185,28,28,1)" }}>
    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
    <div>
      <div style={{ fontWeight: 800, marginBottom: 3 }}>🔴 Final Attempt — Attempt 3 of 3</div>
      <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.6 }}>
        This is your <strong>last attempt</strong>. Fail = permanently locked, must contact instructor.
      </div>
    </div>
  </div>
);

/* ─── Instructor Lock Screen ─────────────────────────────────────── */
const InstructorLockScreen = ({ item, onPrev }) => (
  <div style={S.checkWrap}>
    <div style={S.typePillRed}><Lock size={14} /> Exam Locked</div>
    <h1 style={S.lessonTitle}>{item.title}</h1>
    <div style={S.lockBox}>
      <div style={S.lockIconWrap}><Lock size={36} style={{ color: "rgba(185,28,28,0.7)" }} /></div>
      <div style={S.lockTitle}>Instructor Approval Required</div>
      <div style={S.lockSub}>You have failed this exam 3 times. Please contact your instructor to unlock.</div>
      <div style={S.lockMeta}>Your instructor has been notified and can see your attempts in their dashboard.</div>
    </div>
    <div style={S.navRow}><button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button></div>
  </div>
);

/* ─── Review Answers Panel ───────────────────────────────────────── */
const ReviewAnswersPanel = ({ item, attemptInfo }) => {
  const [selected, setSelected] = useState(0);

  const attempts = useMemo(() => {
    const raw = attemptInfo?.attempts || [];
    return [...raw].sort((a, b) => b.score_pct - a.score_pct);
  }, [attemptInfo]);

  if (attempts.length === 0) return (
    <div style={{ padding: "16px 18px", borderRadius: 14, background: "rgba(2,8,23,0.03)", border: "1px solid rgba(2,8,23,0.08)", fontSize: 13, color: "rgba(10,22,40,0.55)", fontWeight: 700 }}>
      No recorded attempts found for this quiz.
    </div>
  );

  const attempt = attempts[selected] || attempts[0];

  const getStudentAnswer = (answers, questionId) => {
    if (!answers) return undefined;
    const val = answers[questionId];
    return val !== undefined ? Number(val) : undefined;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {attempts.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {attempts.map((a, i) => (
            <button key={i} type="button"
              style={{ padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, cursor: "pointer",
                border: selected === i ? "1px solid rgba(46,171,254,0.50)" : "1px solid rgba(2,8,23,0.10)",
                background: selected === i ? "rgba(46,171,254,0.10)" : "#fff",
                color: selected === i ? "#2EABFE" : "rgba(10,22,40,0.60)" }}
              onClick={() => setSelected(i)}>
              Attempt {attempts.length - i} · {a.score_pct}%{a.passed ? " ✓" : ""}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "14px 18px", borderRadius: 14, textAlign: "center",
        background: attempt.passed ? "linear-gradient(135deg,rgba(34,197,94,0.10),rgba(0,180,180,0.10))" : "rgba(239,68,68,0.06)",
        border: `1px solid ${attempt.passed ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.20)"}` }}>
        <div style={{ fontSize: 36, fontWeight: 950, color: "var(--cp-dark)", letterSpacing: "-1px" }}>{attempt.score_pct}%</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(10,22,40,0.60)", marginTop: 4 }}>
          {attempt.passed ? "✓ Passed" : "✗ Failed"} · {new Date(attempt.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        {attempt.correct !== undefined && (
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(10,22,40,0.45)", marginTop: 4 }}>
            {attempt.correct} / {attempt.total} correct
          </div>
        )}
      </div>

      {!attempt.answers && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", fontSize: 13, fontWeight: 700, color: "rgba(146,84,0,1)" }}>
          ℹ️ Detailed answer review is only available for attempts taken after the review feature was enabled.
        </div>
      )}

      {item.questions.map((q, qi) => {
        const studentAnswer = getStudentAnswer(attempt.answers, q.id);
        const hasAnswer = studentAnswer !== undefined;
        return (
          <div key={q.id} style={S.questionCard}>
            <div style={S.questionNum}>Question {qi + 1} of {item.questions.length}</div>
            <div style={S.questionText}>{q.text}</div>
            <div style={S.optionList}>
              {q.options.map((opt, oi) => {
                const isCorrect     = oi === q.correct;
                const isStudentPick = hasAnswer && studentAnswer === oi;
                const isWrong       = isStudentPick && !isCorrect;
                return (
                  <div key={oi} style={{ ...S.option,
                    ...(isCorrect ? S.optionCorrect : {}),
                    ...(isWrong   ? S.optionWrong   : {}),
                    ...(isStudentPick && !isWrong && isCorrect ? S.optionSelected : {}),
                    cursor: "default" }}>
                    <span style={S.optionLetter}>{String.fromCharCode(65 + oi)}</span>
                    <span style={S.optionText}>{opt}</span>
                    {isCorrect && <CheckCircle2 size={15} style={{ flexShrink: 0, color: "rgba(34,197,94,1)" }} />}
                    {isWrong   && <X size={15} style={{ flexShrink: 0, color: "rgba(239,68,68,1)" }} />}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(21,128,61,1)", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={12} /> Correct: {String.fromCharCode(65 + q.correct)}
              </span>
              {hasAnswer && studentAnswer !== q.correct && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(185,28,28,1)", display: "flex", alignItems: "center", gap: 4 }}>
                  <X size={12} /> Your answer: {String.fromCharCode(65 + studentAnswer)} (incorrect)
                </span>
              )}
              {!hasAnswer && attempt.answers && (
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(10,22,40,0.40)", fontStyle: "italic" }}>
                  Answer not recorded for this question
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Checkpoint View ────────────────────────────────────────────── */
const CheckpointView = ({ item, onComplete, onPrev, courseId, attemptInfo, onAttemptLogged, reviewMode }) => {
  const [answers, setAnswers]       = useState({});
  const [submitted, setSubmitted]   = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!reviewMode) { setAnswers({}); setSubmitted(false); setAllCorrect(false); startedAt.current = Date.now(); }
  }, [item.id, reviewMode]);

  const attemptCount = attemptInfo?.count || 0;
  const isLocked     = !reviewMode && attemptInfo?.locked && !attemptInfo?.unlocked_by_instructor;
  if (isLocked) return <InstructorLockScreen item={item} onPrev={onPrev} />;

  if (reviewMode) return (
    <div style={S.checkWrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={S.typePillAmber}><ClipboardList size={14} /> Checkpoint</div>
        <div style={{ ...S.typePill, background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)", color: "rgba(146,84,0,1)" }}>
          <Eye size={12} /> Review
        </div>
      </div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      <ReviewAnswersPanel item={item} attemptInfo={attemptInfo} />
      <div style={S.navRow}>
        <button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>
        <button style={S.nextBtn} onClick={onComplete} type="button">Next <ArrowRight size={16} /></button>
      </div>
    </div>
  );

  const handleSelect = (qid, idx) => { if (!submitted) setAnswers((p) => ({ ...p, [qid]: idx })); };
  const allAnswered  = item.questions.every((q) => answers[q.id] !== undefined);
  const correctCount = item.questions.filter((q) => answers[q.id] === q.correct).length;

  const handleSubmit = async () => {
    const ok  = item.questions.every((q) => answers[q.id] === q.correct);
    const pct = Math.round((correctCount / item.questions.length) * 100);
    setAllCorrect(ok); setSubmitted(true);
    try {
      await API.post("/quiz-attempts", {
        courseId, quizId: item.id, quizTitle: item.title, quizType: "checkpoint",
        moduleOrder: item.moduleOrder, scorePct: pct, correct: correctCount,
        total: item.questions.length, passed: ok, passingScore: 100,
        timeSpentSeconds: Math.round((Date.now() - startedAt.current) / 1000),
        answers,
      });
      await onAttemptLogged();
    } catch (err) { console.error("[CheckpointView]", err); }
  };

  const handleRetry = () => { setAnswers({}); setSubmitted(false); setAllCorrect(false); startedAt.current = Date.now(); };

  return (
    <div style={S.checkWrap}>
      <div style={S.typePillAmber}><ClipboardList size={14} /> Checkpoint</div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      <p style={S.checkSubtitle}>Answer all questions correctly to continue · {item.questions.length} questions</p>
      {attemptCount === 0 && !submitted && <AttemptWarning1st />}
      {attemptCount === 1 && !submitted && <AttemptWarning2nd />}
      {attemptCount === 2 && !submitted && <AttemptWarning3rd />}
      {submitted && (
        <div style={allCorrect ? S.scorePassed : S.scoreFailed}>
          <div style={S.scoreNumber}>{correctCount}/{item.questions.length}</div>
          <div style={S.scoreLabel}>{allCorrect ? "All correct! You may continue." : `${item.questions.length - correctCount} incorrect — review and try again.`}</div>
        </div>
      )}
      <div style={S.questionList}>
        {item.questions.map((q, qi) => {
          const sel = answers[q.id];
          return (
            <div key={q.id} style={S.questionCard}>
              <div style={S.questionNum}>Q{qi + 1} of {item.questions.length}</div>
              <div style={S.questionText}>{q.text}</div>
              <div style={S.optionList}>
                {q.options.map((opt, oi) => {
                  const isSelected  = sel === oi;
                  const showCorrect = submitted && oi === q.correct;
                  const showWrong   = submitted && isSelected && oi !== q.correct;
                  return (
                    <button key={oi} type="button"
                      style={{ ...S.option, ...(isSelected && !submitted ? S.optionSelected : {}), ...(showCorrect ? S.optionCorrect : {}), ...(showWrong ? S.optionWrong : {}) }}
                      onClick={() => handleSelect(q.id, oi)}>
                      <span style={S.optionLetter}>{String.fromCharCode(65 + oi)}</span>
                      <span style={S.optionText}>{opt}</span>
                      {showCorrect && <CheckCircle2 size={15} style={{ flexShrink: 0, color: "rgba(34,197,94,1)" }} />}
                      {showWrong   && <X size={15} style={{ flexShrink: 0, color: "rgba(239,68,68,1)" }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {submitted && (
        <div style={allCorrect ? S.resultSuccess : S.resultFail}>
          {allCorrect ? <><CheckCircle2 size={18} /> All correct! You may continue.</> : <><AlertCircle size={18} /> Some answers were incorrect. Review and try again.</>}
        </div>
      )}
      <div style={S.navRow}>
        <button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>
        {!submitted
          ? <button style={{ ...S.nextBtn, ...(!allAnswered ? S.nextBtnDim : {}) }} onClick={handleSubmit} disabled={!allAnswered} type="button">Submit Answers</button>
          : allCorrect
            ? <button style={S.nextBtn} onClick={onComplete} type="button">Continue <ArrowRight size={16} /></button>
            : <button style={S.retryBtn} onClick={handleRetry} type="button">Try Again</button>
        }
      </div>
    </div>
  );
};

/* ─── Quiz View ──────────────────────────────────────────────────── */
const QuizView = ({ item, onFinish, onPrev, courseId, attemptInfo, onAttemptLogged, reviewMode }) => {
  const [answers, setAnswers]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]         = useState(0);
  const [passed, setPassed]       = useState(false);
  const startedAt = useRef(Date.now());

  const attemptCount = attemptInfo?.count || 0;
  const isLocked     = !reviewMode && attemptInfo?.locked && !attemptInfo?.unlocked_by_instructor;

  useEffect(() => {
    if (!reviewMode) { setAnswers({}); setSubmitted(false); setScore(0); setPassed(false); startedAt.current = Date.now(); }
  }, [item.id, reviewMode]);

  if (isLocked) return <InstructorLockScreen item={item} onPrev={onPrev} />;

  if (reviewMode) return (
    <div style={S.checkWrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={S.typePillGreen}><Trophy size={14} /> {item.type === "quiz_fundamentals" ? "Fundamentals Exam" : "Final Exam"}</div>
        <div style={{ ...S.typePill, background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)", color: "rgba(146,84,0,1)" }}>
          <Eye size={12} /> Review
        </div>
      </div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      <ReviewAnswersPanel item={item} attemptInfo={attemptInfo} />
      <div style={S.navRow}>
        <button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>
        <button style={S.nextBtn} onClick={onFinish} type="button">Next <ArrowRight size={16} /></button>
      </div>
    </div>
  );

  const doSubmit = async () => {
    const correct = item.questions.filter((q) => answers[q.id] === q.correct).length;
    const pct     = Math.round((correct / item.questions.length) * 100);
    const ok      = pct >= (item.passingScore || 70);
    setScore(pct); setPassed(ok); setSubmitted(true);
    const quizType = item.id === "final-exam" ? "final_exam" : "quiz_fundamentals";
    try {
      await API.post("/quiz-attempts", {
        courseId, quizId: item.id, quizTitle: item.title, quizType,
        moduleOrder: item.moduleOrder, scorePct: pct, correct, total: item.questions.length,
        passed: ok, passingScore: item.passingScore || 70,
        timeSpentSeconds: Math.round((Date.now() - startedAt.current) / 1000),
        answers,
      });
      await onAttemptLogged();
    } catch (err) { console.error("[QuizView]", err); }
  };

  const handleSelect = (qid, idx) => { if (!submitted) setAnswers((p) => ({ ...p, [qid]: idx })); };
  const handleRetry  = () => { setAnswers({}); setSubmitted(false); setScore(0); setPassed(false); startedAt.current = Date.now(); };

  const allAnswered    = item.questions.every((q) => answers[q.id] !== undefined);
  const answered       = Object.keys(answers).length;
  const correctCount   = item.questions.filter((q) => answers[q.id] === q.correct).length;
  const isFundamentals = item.type === "quiz_fundamentals";

  return (
    <div style={S.checkWrap}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={isFundamentals ? S.typePillAmber : S.typePillGreen}>
          {isFundamentals ? <ClipboardList size={14} /> : <Trophy size={14} />}
          {isFundamentals ? " Fundamentals Exam" : " Final Exam"}
        </div>
      </div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      <p style={S.checkSubtitle}>
        Score {item.passingScore || 70}% or higher to pass · {item.questions.length} questions
        {!submitted && ` · ${answered}/${item.questions.length} answered`}
      </p>
      {attemptCount === 0 && !submitted && <AttemptWarning1st />}
      {attemptCount === 1 && !submitted && <AttemptWarning2nd />}
      {attemptCount === 2 && !submitted && <AttemptWarning3rd />}
      {submitted && (
        <div style={passed ? S.scorePassed : S.scoreFailed}>
          <div style={S.scoreNumber}>{score}%</div>
          <div style={S.scoreLabel}>
            {passed ? `Passed! ${correctCount}/${item.questions.length} correct.` : `Need ${item.passingScore || 70}% — got ${correctCount}/${item.questions.length} correct.`}
          </div>
          {!passed && attemptCount >= 2 && (
            <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.25)", color: "rgba(185,28,28,1)", fontSize: 13, fontWeight: 700 }}>
              All 3 attempts used. Please contact your instructor to unlock this exam.
            </div>
          )}
          {!passed && attemptCount === 1 && (
            <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "rgba(146,84,0,1)", fontSize: 13, fontWeight: 700 }}>
              1 retake remaining. Fail again = must contact instructor.
            </div>
          )}
        </div>
      )}
      {!submitted && (
        <div style={{ background: "rgba(2,8,23,0.07)", borderRadius: 999, height: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, background: "var(--cp-blue)", width: `${(answered / item.questions.length) * 100}%`, transition: "width 0.3s" }} />
        </div>
      )}
      {!submitted && allAnswered && (
        <div style={S.earlySubmitHint}>
          <CheckCircle2 size={15} style={{ flexShrink: 0, color: "rgba(21,128,61,1)" }} />
          All questions answered — you can submit now or continue reviewing your answers.
        </div>
      )}
      <div style={S.questionList}>
        {item.questions.map((q, qi) => {
          const sel = answers[q.id];
          return (
            <div key={q.id} style={S.questionCard}>
              <div style={S.questionNum}>Question {qi + 1} of {item.questions.length}</div>
              <div style={S.questionText}>{q.text}</div>
              <div style={S.optionList}>
                {q.options.map((opt, oi) => {
                  const isSelected  = sel === oi;
                  const markCorrect = submitted && oi === q.correct;
                  const markWrong   = submitted && isSelected && oi !== q.correct;
                  return (
                    <button key={oi} type="button"
                      style={{ ...S.option, ...(isSelected && !submitted ? S.optionSelected : {}), ...(markCorrect ? S.optionCorrect : {}), ...(markWrong ? S.optionWrong : {}) }}
                      onClick={() => handleSelect(q.id, oi)}>
                      <span style={S.optionLetter}>{String.fromCharCode(65 + oi)}</span>
                      <span style={S.optionText}>{opt}</span>
                      {markCorrect && <CheckCircle2 size={15} style={{ flexShrink: 0, color: "rgba(34,197,94,1)" }} />}
                      {markWrong   && <X size={15} style={{ flexShrink: 0, color: "rgba(239,68,68,1)" }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={S.navRow}>
        {!submitted && <button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>}
        {!submitted
          ? <button style={{ ...S.nextBtn, ...(!allAnswered ? S.nextBtnDim : {}) }} onClick={allAnswered ? doSubmit : undefined} disabled={!allAnswered} type="button">Submit Exam</button>
          : passed
            ? <button style={isFundamentals ? S.nextBtn : S.finishBtn} onClick={onFinish} type="button">
                {isFundamentals ? <>Continue to Final Exam <ArrowRight size={16} /></> : <><Trophy size={16} /> Complete Course</>}
              </button>
            : <button style={S.retryBtn} onClick={handleRetry} type="button">Retry Exam</button>
        }
      </div>
    </div>
  );
};

/* ─── Review Summary View ────────────────────────────────────────── */
const ReviewSummaryView = ({ course, courseId, content, quizAttempts: parentAttempts, onPrev, navigate }) => {
  const modules          = (course?.modules || []).sort((a, b) => a.order - b.order);
  const totalCreditHours = course?.credit_hours || 0;

  const quizItems = useMemo(
    () => content.filter((c) => c.type === "checkpoint" || c.type === "quiz_fundamentals" || c.type === "quiz"),
    [content]
  );

  const [attempts, setAttempts] = useState(parentAttempts || {});
  const [loadingScores, setLoadingScores] = useState(true);
  const [scoreError,    setScoreError]    = useState(null);

  useEffect(() => {
    if (parentAttempts && Object.keys(parentAttempts).length > 0) {
      setAttempts(parentAttempts);
    }
    let cancelled = false;
    setLoadingScores(true);
    setScoreError(null);

    API.get(`/quiz-attempts/${courseId}`)
      .then((res) => {
        if (!cancelled) {
          setAttempts(res.data?.attempts || {});
          setLoadingScores(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[ReviewSummaryView] fetch failed:', err.message);
          setAttempts(parentAttempts || {});
          setScoreError(Object.keys(parentAttempts || {}).length === 0 ? "Could not load scores." : null);
          setLoadingScores(false);
        }
      });

    return () => { cancelled = true; };
  }, [courseId]);

  const getBest = (quizId) => {
    const list = attempts[quizId]?.attempts || [];
    if (!list.length) return null;
    return list.reduce((best, a) => (!best || a.score_pct > best.score_pct ? a : best), null);
  };

  const gradeSummary = quizItems.map((q) => {
    const best = getBest(q.id);
    return { title: q.title, type: q.type, score: best?.score_pct ?? null, passed: best?.passed ?? null };
  });

  const scoredItems  = gradeSummary.filter((g) => g.score !== null);
  const overallGrade = scoredItems.length
    ? Math.round(scoredItems.reduce((sum, g) => sum + g.score, 0) / scoredItems.length)
    : null;

  const gradeColor = overallGrade === null ? "rgba(10,22,40,0.45)"
    : overallGrade >= 70 ? "rgba(21,128,61,1)"
    : "rgba(185,28,28,1)";

  const certCourseId = course?._id || courseId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)", color: "rgba(180,110,0,1)", fontWeight: 800, fontSize: 12 }}>
          <Trophy size={14} /> Course Summary
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(46,171,254,0.08)", border: "1px solid rgba(46,171,254,0.22)", color: "#2EABFE", fontWeight: 800, fontSize: 12 }}>
          <Eye size={12} /> Review
        </div>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--cp-dark)", letterSpacing: "-0.4px", lineHeight: 1.2, fontFamily: "'DM Serif Display',serif" }}>
        {course?.title}
      </h1>

      <div style={{ borderRadius: 18, padding: "24px", textAlign: "center",
        background: overallGrade !== null && overallGrade >= 70
          ? "linear-gradient(135deg,rgba(34,197,94,0.10),rgba(0,180,180,0.10))" : "rgba(2,8,23,0.03)",
        border: `1px solid ${overallGrade !== null && overallGrade >= 70 ? "rgba(34,197,94,0.25)" : "rgba(2,8,23,0.10)"}` }}>
        {loadingScores ? (
          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(10,22,40,0.45)" }}>Calculating grades…</div>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(10,22,40,0.45)", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 8 }}>Overall Grade</div>
            <div style={{ fontSize: 64, fontWeight: 950, color: gradeColor, letterSpacing: "-3px", fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>
              {overallGrade !== null ? `${overallGrade}%` : "—"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(10,22,40,0.55)", marginTop: 8 }}>
              {overallGrade !== null
                ? overallGrade >= 70 ? "✓ Passing — All requirements met" : "Below passing threshold"
                : "No quiz data found"}
            </div>
          </>
        )}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(2,8,23,0.08)", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(2,8,23,0.07)", fontWeight: 900, fontSize: 13, color: "rgba(10,22,40,0.55)", letterSpacing: "0.4px", display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={14} /> Credit Hours by Module
        </div>
        <div style={{ padding: "8px 0" }}>
          {modules.map((mod, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: i < modules.length - 1 ? "1px solid rgba(2,8,23,0.05)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.20)", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 11, fontWeight: 900, color: "#2EABFE" }}>{i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(10,22,40,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.title}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                <Clock size={12} style={{ color: "rgba(10,22,40,0.40)" }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(10,22,40,0.70)" }}>{mod.credit_hours || 0} hr{(mod.credit_hours || 0) !== 1 ? "s" : ""}</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "rgba(2,8,23,0.03)", borderTop: "2px solid rgba(2,8,23,0.08)" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "rgba(10,22,40,0.85)" }}>Total Credit Hours</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={12} style={{ color: "#2EABFE" }} />
              <span style={{ fontSize: 14, fontWeight: 900, color: "#2EABFE" }}>{totalCreditHours} hrs</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.12)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 14, color: "rgba(10,22,40,0.72)" }}
          onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(245,158,11,0.35)", background: "linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.06))", color: "rgba(146,84,0,1)", cursor: "pointer", fontWeight: 900, fontSize: 14, boxShadow: "0 4px 16px rgba(245,158,11,0.18)" }}
          onClick={() => navigate(`/certificate/${certCourseId}`)} type="button">
          <Award size={16} /> View Certificate
        </button>
      </div>
    </div>
  );
};

/* ─── Completion Screen ──────────────────────────────────────────── */
const CompletionScreen = ({ course, transcriptEntry, navigate, courseId, onReview }) => {
  const completedAt  = transcriptEntry?.completed_at ? new Date(transcriptEntry.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
  const certCourseId = transcriptEntry?.course_id?._id || transcriptEntry?.course_id || courseId;

  // ── Testimonial gate state ──
  const [showTestimonialGate, setShowTestimonialGate] = useState(false); //

  const handleViewCertificate = () => {
    setShowTestimonialGate(true); //
  };

  const handleGateDone = () => {
    setShowTestimonialGate(false); //
    navigate(`/certificate/${certCourseId}`); //
  };

  return (
    <div style={S.page}><style>{css}</style>

      {/* ── Testimonial Gate Modal ── */}
      {showTestimonialGate && (
        <TestimonialGateModal
          courseId={certCourseId}
          courseName={course?.title || "this course"}
          onDone={handleGateDone}
        />
      )}

      <div style={S.completionWrap}>
        <div style={S.completionCard}>
          <div style={S.completionStars}>{[...Array(5)].map((_, i) => <Star key={i} size={28} style={{ color: "#F59E0B", fill: "#F59E0B" }} />)}</div>
          <div style={S.completionBadge}><Trophy size={40} style={{ color: "#F59E0B" }} /></div>
          <h1 style={S.completionTitle}>Course Complete!</h1>
          <p style={S.completionSub}>Congratulations! You've successfully completed</p>
          <div style={S.completionCourseName}>{course?.title}</div>
          <div style={S.completionMeta}>
            <span style={S.completionMetaItem}>✓ {course?.credit_hours} Credit Hours Earned</span>
            {completedAt && <span style={S.completionMetaItem}>✓ Completed on {completedAt}</span>}
            <span style={S.completionMetaItem}>✓ Certificate Unlocked</span>
            <span style={S.completionMetaItem}>✓ NMLS Requirements Met</span>
          </div>
          <div style={S.completionActions}>
            {certCourseId && (
              <button style={S.completionCertBtn} onClick={handleViewCertificate} type="button">
                <Award size={18} /> View Certificate
              </button>
            )}
            {onReview && (
              <button style={{ ...S.completionPrimary, background: "rgba(46,171,254,1)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onClick={onReview} type="button"><Eye size={18} /> Review Course</button>
            )}
            <button style={S.completionPrimary} onClick={() => navigate("/dashboard")} type="button">Go to Dashboard</button>
            <button style={S.completionSecondary} onClick={() => navigate("/my-courses")} type="button">My Courses</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── CSS ─────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');
:root { --cp-dark:#0a1628;--cp-blue:#2EABFE;--cp-teal:#00B4B4;--cp-bg:#f4f6fa; }
*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;overflow:hidden;}
body{font-family:'DM Sans',system-ui,sans-serif;background:var(--cp-bg);color:#0a1628;}
.cp-spin{width:38px;height:38px;border-radius:50%;border:3px solid rgba(2,8,23,0.10);border-top-color:var(--cp-blue);animation:cpspin 0.9s linear infinite;}
@keyframes cpspin{to{transform:rotate(360deg);}}
.cp-sidebar::-webkit-scrollbar{width:4px;}
.cp-sidebar::-webkit-scrollbar-track{background:transparent;}
.cp-sidebar::-webkit-scrollbar-thumb{background:rgba(2,8,23,0.12);border-radius:999px;}
.cp-main::-webkit-scrollbar{width:6px;}
.cp-main::-webkit-scrollbar-track{background:transparent;}
.cp-main::-webkit-scrollbar-thumb{background:rgba(2,8,23,0.10);border-radius:999px;}
`;

const S = {
  page:             { height:"100vh",background:"var(--cp-bg)",display:"flex",flexDirection:"column",overflow:"hidden" },
  loadCenter:       { minHeight:"100vh",display:"grid",placeItems:"center" },
  errorBanner:      { background:"rgba(239,68,68,0.10)",border:"1px solid rgba(239,68,68,0.25)",color:"rgba(185,28,28,1)",padding:"10px 20px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8 },
  inactivityBanner: { background:"rgba(245,158,11,0.10)",border:"1px solid rgba(245,158,11,0.30)",color:"rgba(146,84,0,1)",padding:"10px 20px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8,lineHeight:1.5 },
  reviewBanner:     { background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.28)",color:"rgba(146,84,0,1)",padding:"10px 20px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:10,lineHeight:1.5,flexWrap:"wrap" },
  reviewExitBtn:    { marginLeft:"auto",padding:"6px 14px",borderRadius:999,border:"1px solid rgba(245,158,11,0.35)",background:"rgba(245,158,11,0.12)",color:"rgba(146,84,0,1)",cursor:"pointer",fontWeight:800,fontSize:12,flexShrink:0 },
  attemptWarning:   { display:"flex",alignItems:"flex-start",gap:12,padding:"14px 18px",borderRadius:14,background:"rgba(46,171,254,0.07)",border:"1px solid rgba(46,171,254,0.22)",color:"rgba(11,60,100,1)",fontSize:14 },
  earlySubmitHint:  { display:"flex",alignItems:"center",gap:8,padding:"12px 16px",borderRadius:12,background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.22)",color:"rgba(21,128,61,1)",fontSize:13,fontWeight:700 },
  lockBox:          { display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"36px 24px",borderRadius:20,background:"rgba(239,68,68,0.05)",border:"2px dashed rgba(239,68,68,0.25)" },
  lockIconWrap:     { width:72,height:72,borderRadius:"50%",background:"rgba(239,68,68,0.10)",border:"1px solid rgba(239,68,68,0.22)",display:"grid",placeItems:"center",marginBottom:16 },
  lockTitle:        { fontSize:20,fontWeight:900,color:"rgba(185,28,28,1)",marginBottom:10 },
  lockSub:          { fontSize:14,fontWeight:600,color:"rgba(10,22,40,0.70)",lineHeight:1.7,maxWidth:460,marginBottom:12 },
  lockMeta:         { fontSize:12,fontWeight:700,color:"rgba(10,22,40,0.45)",fontStyle:"italic" },
  topbar:          { height:58,background:"var(--cp-dark)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",gap:16,flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.08)",position:"sticky",top:0,zIndex:100 },
  topbarLeft:      { display:"flex",alignItems:"center",gap:14,minWidth:0,flex:1 },
  exitBtn:         { display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:999,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,flexShrink:0 },
  courseNameWrap:  { minWidth:0 },
  courseName:      { color:"#fff",fontWeight:800,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" },
  courseType:      { color:"rgba(255,255,255,0.50)",fontSize:11,fontWeight:600,marginTop:1 },
  topbarCenter:    { display:"flex",alignItems:"center",gap:10,flex:1,justifyContent:"center" },
  progressBarWrap: { width:200,height:6,borderRadius:999,background:"rgba(255,255,255,0.15)",overflow:"hidden" },
  progressBarFill: { height:"100%",borderRadius:999,background:"linear-gradient(90deg,var(--cp-teal),var(--cp-blue))",transition:"width 0.5s ease" },
  progressText:    { color:"rgba(255,255,255,0.65)",fontSize:12,fontWeight:700,whiteSpace:"nowrap" },
  menuBtn:         { display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:999,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13,flexShrink:0 },
  body:              { display:"flex",flex:1,minHeight:0,overflow:"hidden" },
  sidebar:           { width:290,flexShrink:0,background:"#fff",borderRight:"1px solid rgba(2,8,23,0.08)",display:"flex",flexDirection:"column",overflowY:"auto",position:"sticky",top:0,height:"100%",alignSelf:"flex-start" },
  sidebarHead:       { padding:"16px 18px 12px",fontWeight:900,fontSize:13,color:"rgba(10,22,40,0.55)",letterSpacing:"0.4px",borderBottom:"1px solid rgba(2,8,23,0.07)",display:"flex",alignItems:"center",position:"sticky",top:0,background:"#fff",zIndex:10 },
  sidebarList:       { display:"flex",flexDirection:"column",padding:"8px 0",flex:1 },
  sidebarItem:       { display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"11px 16px",border:"none",background:"transparent",cursor:"pointer",textAlign:"left",transition:"background 0.15s" },
  sidebarItemActive: { background:"rgba(46,171,254,0.08)",borderRight:"3px solid var(--cp-blue)" },
  sidebarItemLocked: { opacity:0.45,cursor:"not-allowed" },
  sidebarItemLeft:   { display:"flex",alignItems:"flex-start",gap:10,minWidth:0,flex:1 },
  sidebarIcon:       { marginTop:2,flexShrink:0 },
  sidebarLabel:      { fontSize:10,fontWeight:800,color:"rgba(10,22,40,0.45)",letterSpacing:"0.5px",marginBottom:2 },
  sidebarTitle:      { fontSize:13,fontWeight:700,color:"rgba(10,22,40,0.85)",lineHeight:1.35 },
  resumeBanner:      { margin:"8px 12px 12px",padding:"10px 14px",borderRadius:12,background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.22)",flexShrink:0 },
  resumeBannerText:  { display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:800,color:"rgba(21,128,61,1)",marginBottom:3 },
  resumeBannerSub:   { fontSize:11,fontWeight:600,color:"rgba(10,22,40,0.45)",paddingLeft:19 },
  main:        { flex:1,overflowY:"auto",padding:"20px 0 32px",minHeight:0 },
  contentWrap: { maxWidth:860,margin:"0 auto",padding:"0 24px" },
  typePill:      { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(46,171,254,0.10)",border:"1px solid rgba(46,171,254,0.22)",color:"var(--cp-blue)",fontWeight:800,fontSize:12,marginBottom:16 },
  typePillAmber: { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(245,158,11,0.10)",border:"1px solid rgba(245,158,11,0.28)",color:"rgba(180,110,0,1)",fontWeight:800,fontSize:12,marginBottom:16 },
  typePillGreen: { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(34,197,94,0.10)",border:"1px solid rgba(34,197,94,0.28)",color:"rgba(21,128,61,1)",fontWeight:800,fontSize:12,marginBottom:16 },
  typePillRed:   { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(239,68,68,0.10)",border:"1px solid rgba(239,68,68,0.28)",color:"rgba(185,28,28,1)",fontWeight:800,fontSize:12,marginBottom:16 },
  lessonWrap:        { display:"flex",flexDirection:"column",gap:24 },
  lessonTitle:       { fontSize:26,fontWeight:900,color:"var(--cp-dark)",letterSpacing:"-0.4px",lineHeight:1.2,fontFamily:"'DM Serif Display',serif" },
  pdfGateBanner:     { display:"flex",alignItems:"flex-start",gap:10,padding:"14px 18px",borderRadius:14,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.28)",color:"rgba(146,84,0,1)",fontSize:14,fontWeight:700,lineHeight:1.5 },
  pdfGateConfirmRow: { display:"flex",alignItems:"center",gap:12,padding:"16px 18px",borderRadius:14,background:"#fff",border:"1px solid rgba(2,8,23,0.09)",boxShadow:"0 2px 8px rgba(2,8,23,0.05)" },
  pdfWrap:           { borderRadius:18,overflow:"hidden",border:"1px solid rgba(2,8,23,0.10)",boxShadow:"0 8px 32px rgba(2,8,23,0.08)",width:"100%" },
  pdfToolbar:        { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#fff",borderBottom:"1px solid rgba(2,8,23,0.08)" },
  pdfOpenBtn:        { display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,background:"rgba(46,171,254,0.10)",border:"1px solid rgba(46,171,254,0.22)",color:"var(--cp-blue)",fontWeight:700,fontSize:12,textDecoration:"none" },
  pdfIframe:         { width:"100%",height:"calc(100vh - 160px)",minHeight:800,border:"none",display:"block",background:"#f8f8f8" },
  pdfPlaceholder:    { display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,background:"#fff",borderRadius:18,border:"2px dashed rgba(2,8,23,0.12)" },
  pdfErrorBox:       { display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:200,background:"#fff" },
  pdfFallbackBtn:    { display:"inline-flex",alignItems:"center",gap:6,padding:"10px 20px",borderRadius:10,background:"var(--cp-blue)",color:"#fff",fontWeight:700,fontSize:14,textDecoration:"none" },
  viewToggle:        { display:"flex",gap:8,padding:"4px",background:"rgba(2,8,23,0.05)",borderRadius:12,width:"fit-content" },
  toggleBtn:         { display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",fontWeight:700,fontSize:13,color:"rgba(10,22,40,0.55)" },
  toggleBtnActive:   { background:"#fff",color:"var(--cp-dark)",boxShadow:"0 2px 8px rgba(2,8,23,0.10)" },
  videoBox:          { borderRadius:18,overflow:"hidden",background:"linear-gradient(135deg,#0a1628 0%,#0d2a4a 50%,#091f3a 100%)",border:"1px solid rgba(46,171,254,0.15)",aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center" },
  videoInner:        { textAlign:"center" },
  videoIconWrap:     { width:72,height:72,borderRadius:"50%",background:"rgba(46,171,254,0.20)",border:"2px solid rgba(46,171,254,0.35)",display:"grid",placeItems:"center",margin:"0 auto 14px",cursor:"pointer" },
  videoLabel:        { color:"#fff",fontWeight:800,fontSize:16,marginBottom:6 },
  videoSub:          { color:"rgba(255,255,255,0.45)",fontWeight:600,fontSize:13 },
  videoIframe:       { width: "100%", height: "100%", border: "none", borderRadius: 18 },
  lessonText:        { background:"#fff",borderRadius:18,border:"1px solid rgba(2,8,23,0.08)",padding:"28px 32px",lineHeight:1.8 },
  lessonH3:          { fontWeight:800,fontSize:16,color:"var(--cp-dark)",margin:"20px 0 10px",fontFamily:"'DM Serif Display',serif" },
  lessonUl:          { paddingLeft:22,marginBottom:14 },
  lessonLi:          { color:"rgba(10,22,40,0.78)",fontSize:15,marginBottom:8,fontWeight:450 },
  checkWrap:    { display:"flex",flexDirection:"column",gap:22 },
  checkSubtitle:{ color:"rgba(10,22,40,0.55)",fontSize:14,fontWeight:600,marginTop:-14 },
  questionList: { display:"flex",flexDirection:"column",gap:16 },
  questionCard: { background:"#fff",borderRadius:18,border:"1px solid rgba(2,8,23,0.08)",padding:"20px 22px",boxShadow:"0 4px 14px rgba(2,8,23,0.05)" },
  questionNum:  { fontSize:11,fontWeight:900,color:"rgba(10,22,40,0.40)",letterSpacing:"0.6px",marginBottom:8 },
  questionText: { fontWeight:750,fontSize:15,color:"var(--cp-dark)",marginBottom:14,lineHeight:1.5 },
  optionList:   { display:"flex",flexDirection:"column",gap:8 },
  option:        { display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:"1.5px solid rgba(2,8,23,0.10)",background:"rgba(2,8,23,0.01)",cursor:"pointer",textAlign:"left",transition:"all 0.15s" },
  optionSelected:{ border:"1.5px solid rgba(46,171,254,0.50)",background:"rgba(46,171,254,0.06)",boxShadow:"0 0 0 3px rgba(46,171,254,0.12)" },
  optionCorrect: { border:"1.5px solid rgba(34,197,94,0.50)",background:"rgba(34,197,94,0.06)" },
  optionWrong:   { border:"1.5px solid rgba(239,68,68,0.50)",background:"rgba(239,68,68,0.06)" },
  optionLetter:  { width:26,height:26,borderRadius:8,background:"rgba(2,8,23,0.06)",display:"grid",placeItems:"center",fontSize:12,fontWeight:900,color:"rgba(10,22,40,0.70)",flexShrink:0 },
  optionText:    { flex:1,fontSize:14,fontWeight:600,color:"rgba(10,22,40,0.85)" },
  resultSuccess: { display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderRadius:14,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",color:"rgba(21,128,61,1)",fontWeight:800,fontSize:14 },
  resultFail:    { display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderRadius:14,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.22)",color:"rgba(185,28,28,1)",fontWeight:800,fontSize:14 },
  scorePassed:   { borderRadius:18,background:"linear-gradient(135deg,rgba(34,197,94,0.10),rgba(0,180,180,0.10))",border:"1px solid rgba(34,197,94,0.25)",padding:"24px",textAlign:"center" },
  scoreFailed:   { borderRadius:18,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.20)",padding:"24px",textAlign:"center" },
  scoreNumber:   { fontSize:48,fontWeight:950,color:"var(--cp-dark)",letterSpacing:"-2px",fontFamily:"'DM Serif Display',serif" },
  scoreLabel:    { fontSize:15,fontWeight:700,color:"rgba(10,22,40,0.65)",marginTop:6 },
  navRow:    { display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8 },
  prevBtn:   { display:"inline-flex",alignItems:"center",gap:8,padding:"12px 20px",borderRadius:12,border:"1px solid rgba(2,8,23,0.12)",background:"#fff",cursor:"pointer",fontWeight:800,fontSize:14,color:"rgba(10,22,40,0.72)" },
  nextBtn:   { marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,border:"none",background:"var(--cp-blue)",color:"#fff",cursor:"pointer",fontWeight:900,fontSize:14,boxShadow:"0 6px 20px rgba(46,171,254,0.28)" },
  nextBtnDim:{ opacity:0.5,cursor:"not-allowed",boxShadow:"none" },
  retryBtn:  { marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,border:"none",background:"rgba(239,68,68,0.90)",color:"#fff",cursor:"pointer",fontWeight:900,fontSize:14 },
  finishBtn: { marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#22C55E,#00B4B4)",color:"#fff",cursor:"pointer",fontWeight:900,fontSize:14,boxShadow:"0 6px 20px rgba(34,197,94,0.30)" },
  completionWrap:       { minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"linear-gradient(135deg,#0a1628 0%,#0d2a4a 100%)" },
  completionCard:       { background:"#fff",borderRadius:28,padding:"48px 40px",maxWidth:520,width:"100%",textAlign:"center",boxShadow:"0 40px 100px rgba(0,0,0,0.35)" },
  completionStars:      { display:"flex",justifyContent:"center",gap:6,marginBottom:20 },
  completionBadge:      { width:80,height:80,borderRadius:"50%",background:"rgba(245,158,11,0.12)",border:"2px solid rgba(245,158,11,0.30)",display:"grid",placeItems:"center",margin:"0 auto 22px" },
  completionTitle:      { fontSize:30,fontWeight:950,color:"var(--cp-dark)",letterSpacing:"-0.5px",marginBottom:10,fontFamily:"'DM Serif Display',serif" },
  completionSub:        { fontSize:15,color:"rgba(10,22,40,0.55)",fontWeight:600,marginBottom:8 },
  completionCourseName: { fontSize:17,fontWeight:800,color:"var(--cp-dark)",padding:"12px 20px",borderRadius:14,background:"rgba(46,171,254,0.07)",border:"1px solid rgba(46,171,254,0.18)",marginBottom:22 },
  completionMeta:       { display:"flex",flexDirection:"column",gap:8,marginBottom:28 },
  completionMetaItem:   { fontSize:14,fontWeight:700,color:"rgba(21,128,61,1)" },
  completionActions:    { display:"grid",gap:10 },
  completionCertBtn:    { width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(245,158,11,0.35)",background:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.06))",color:"rgba(146,84,0,1)",cursor:"pointer",fontWeight:950,fontSize:15,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 16px rgba(245,158,11,0.18)" },
  completionPrimary:    { width:"100%",padding:"14px",borderRadius:14,border:"none",background:"var(--cp-blue)",color:"#fff",cursor:"pointer",fontWeight:950,fontSize:15,boxShadow:"0 8px 24px rgba(46,171,254,0.28)" },
  completionSecondary:  { width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(2,8,23,0.12)",background:"#fff",cursor:"pointer",fontWeight:900,fontSize:15,color:"rgba(10,22,40,0.72)" },
};

export default CoursePortal;