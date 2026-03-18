import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, PlayCircle,
  BookOpen, ClipboardList, Trophy, Lock, ChevronRight,
  AlertCircle, Star, X, FileText, ExternalLink, Award,
} from "lucide-react";
import API from "../../api/axios";

/* ─── localStorage helpers ───────────────────────────────────────── */
const storageKey    = (courseId) => `course-progress-${courseId}`;
const storageIdxKey = (courseId) => `course-currentIdx-${courseId}`;

const loadCompleted = (courseId) => {
  try {
    const saved = localStorage.getItem(storageKey(courseId));
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
};

const saveCompleted = (courseId, set) => {
  try { localStorage.setItem(storageKey(courseId), JSON.stringify([...set])); } catch {}
};

const loadCurrentIdx = (courseId) => {
  try {
    const saved = localStorage.getItem(storageIdxKey(courseId));
    return saved !== null ? parseInt(saved, 10) : 0;
  } catch { return 0; }
};

const saveCurrentIdx = (courseId, idx) => {
  try { localStorage.setItem(storageIdxKey(courseId), String(idx)); } catch {}
};

const clearProgress = (courseId) => {
  try {
    localStorage.removeItem(storageKey(courseId));
    localStorage.removeItem(storageIdxKey(courseId));
  } catch {}
};

/* ─── Build content array from DB course ────────────────────────── */
const buildContent = (course) => {
  const content = [];
  if (!course?.modules?.length) return content;
  const coursePdf = course.pdf_url || null;

  course.modules
    .sort((a, b) => a.order - b.order)
    .forEach((mod) => {
      const modPdf = mod.pdf_url || coursePdf;
      content.push({
        id: `lesson-mod-${mod.order}`, type: "lesson",
        title: mod.title, credit_hours: mod.credit_hours,
        pdf_url: modPdf, video_url: mod.video_url || null, sections: mod.sections || [],
      });
      if (mod.show_pdf_before_quiz && modPdf) {
        content.push({ id: `pdf-gate-mod-${mod.order}`, type: "pdf_gate", title: `Study Material: ${mod.title}`, pdf_url: modPdf });
      }
      if (mod.quiz?.length) {
        const isFundamentals = mod.show_pdf_before_quiz && mod.quiz.length > 10;
        content.push({
          id: `checkpoint-mod-${mod.order}`,
          type: isFundamentals ? "quiz_fundamentals" : "checkpoint",
          title: isFundamentals ? `${mod.title} — Fundamentals Exam` : `Checkpoint: ${mod.title}`,
          questions: mod.quiz.map((q, i) => ({ id: `mod${mod.order}-q${i}`, text: q.question, options: q.options, correct: q.correct_index })),
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
      questions: course.final_exam.questions.map((q, i) => ({ id: `fq${i}`, text: q.question, options: q.options, correct: q.correct_index })),
    });
  }
  return content;
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
  const [error, setError]             = useState(null);
  // ── transcript data for this course (if already completed) ──
  const [transcriptEntry, setTranscriptEntry] = useState(null);

  const [completed, setCompleted]   = useState(() => loadCompleted(id));
  const [currentIdx, setCurrentIdx] = useState(() => loadCurrentIdx(id));

  useEffect(() => {
    const load = async () => {
      try {
        // Load course + transcript in parallel
        const [courseRes, transcriptRes] = await Promise.all([
          API.get(`/courses/${id}`),
          API.get("/dashboard/transcript").catch(() => ({ data: { transcript: [] } })),
        ]);

        const data = courseRes.data?.data || courseRes.data;
        setCourse(data);
        const built = buildContent(data);
        setContent(built);

        // ── Check if student already completed this course ──
        const transcript = transcriptRes.data?.transcript || [];
        const entry = transcript.find(
          (t) => String(t.course_id?._id || t.course_id) === String(id)
        );
        if (entry) {
          setTranscriptEntry(entry);
          setFinished(true); // show completion screen immediately
          clearProgress(id);
          return;
        }

        setCurrentIdx((prev) => {
          const safe = Math.min(prev, built.length - 1);
          if (safe !== prev) saveCurrentIdx(id, safe);
          return safe < 0 ? 0 : safe;
        });
      } catch (err) {
        console.error("Failed to load course:", err);
        setError("Could not load course content.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const current  = content[currentIdx] || null;
  const progress = content.length ? Math.round((completed.size / content.length) * 100) : 0;

  const markComplete = (idx) => {
    setCompleted((prev) => {
      const next = new Set([...prev, idx]);
      saveCompleted(id, next);
      return next;
    });
  };

  const navigateTo = (idx) => {
    setCurrentIdx(idx);
    saveCurrentIdx(id, idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    markComplete(currentIdx);
    if (currentIdx < content.length - 1) navigateTo(currentIdx + 1);
  };

  const goPrev = () => { if (currentIdx > 0) navigateTo(currentIdx - 1); };
  const canNavigateTo = (idx) => idx === 0 || completed.has(idx - 1);

  const handleFinish = async () => {
    markComplete(currentIdx);
    clearProgress(id);
    // ── Save completion to backend so certificate appears in My Certificates ──
    try {
      await API.post("/dashboard/complete", { courseId: id });
    } catch (err) {
      console.warn("Could not save completion to server:", err.message);
    }
    setFinished(true);
  };

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

  if (finished) return (
    <CompletionScreen
      course={course}
      transcriptEntry={transcriptEntry}
      navigate={navigate}
      courseId={id}
    />
  );

  return (
    <div style={S.page}>
      <style>{css}</style>
      {error && <div style={S.errorBanner}><AlertCircle size={14} /> {error}</div>}

      <header style={S.topbar}>
        <div style={S.topbarLeft}>
          <button style={S.exitBtn} onClick={() => navigate(`/courses/${id}`)} type="button">
            <ArrowLeft size={15} /> Exit
          </button>
          <div style={S.courseNameWrap}>
            <div style={S.courseName}>{course?.title || "Course"}</div>
            <div style={S.courseType}>{course?.type} · {course?.credit_hours} credit hrs</div>
          </div>
        </div>
        <div style={S.topbarCenter}>
          <div style={S.progressBarWrap}>
            <div style={{ ...S.progressBarFill, width: `${progress}%` }} />
          </div>
          <span style={S.progressText}>{progress}% complete</span>
        </div>
        <button style={S.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)} type="button">
          <BookOpen size={16} /><span>{sidebarOpen ? "Hide" : "Contents"}</span>
        </button>
      </header>

      <div style={S.body}>
        {sidebarOpen && (
          <aside style={S.sidebar}>
            <div style={S.sidebarHead}>
              Course Contents
              <span style={{ marginLeft: 8, fontSize: 11, color: "rgba(10,22,40,0.40)", fontWeight: 600 }}>
                {completed.size}/{content.length}
              </span>
            </div>
            <div style={S.sidebarList}>
              {content.map((item, idx) => {
                const isDone    = completed.has(idx);
                const isCurrent = idx === currentIdx;
                const isLocked  = !canNavigateTo(idx);
                const icon =
                  item.type === "lesson"              ? <PlayCircle size={14} />
                  : item.type === "pdf_gate"          ? <FileText size={14} />
                  : item.type === "checkpoint"        ? <ClipboardList size={14} />
                  : item.type === "quiz_fundamentals" ? <ClipboardList size={14} />
                  : <Trophy size={14} />;
                const iconColor =
                  item.type === "checkpoint"          ? "rgba(245,158,11,1)"
                  : item.type === "quiz_fundamentals" ? "rgba(245,158,11,1)"
                  : item.type === "pdf_gate"          ? "rgba(239,68,68,0.80)"
                  : item.type === "quiz"              ? "rgba(34,197,94,1)"
                  : "var(--cp-blue)";
                const typeLabel =
                  item.type === "lesson"              ? "Lesson"
                  : item.type === "pdf_gate"          ? "Study Material"
                  : item.type === "checkpoint"        ? "Checkpoint"
                  : item.type === "quiz_fundamentals" ? "Fundamentals Exam"
                  : "Final Exam";
                return (
                  <button key={item.id}
                    style={{ ...S.sidebarItem, ...(isCurrent ? S.sidebarItemActive : {}), ...(isLocked ? S.sidebarItemLocked : {}) }}
                    onClick={() => !isLocked && navigateTo(idx)} type="button" disabled={isLocked}
                  >
                    <div style={S.sidebarItemLeft}>
                      <div style={{ ...S.sidebarIcon, color: iconColor }}>{icon}</div>
                      <div>
                        <div style={S.sidebarLabel}>{typeLabel}</div>
                        <div style={S.sidebarTitle}>{item.title}</div>
                      </div>
                    </div>
                    {isDone   && <CheckCircle2 size={16} style={{ color: "rgba(34,197,94,1)", flexShrink: 0 }} />}
                    {isLocked && <Lock size={13} style={{ color: "rgba(11,18,32,0.30)", flexShrink: 0 }} />}
                    {!isDone && !isLocked && isCurrent && <ChevronRight size={14} style={{ color: "var(--cp-blue)", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
            {completed.size > 0 && completed.size < content.length && (
              <div style={S.resumeBanner}>
                <div style={S.resumeBannerText}>
                  <CheckCircle2 size={13} style={{ color: "rgba(34,197,94,1)", flexShrink: 0 }} /> Progress saved
                </div>
                <div style={S.resumeBannerSub}>{completed.size} of {content.length} steps done</div>
              </div>
            )}
          </aside>
        )}

        <main style={S.main}>
          <div style={S.contentWrap}>
            {current?.type === "lesson"           && <LessonView item={current} onComplete={goNext} onPrev={goPrev} showPrev={currentIdx > 0} />}
            {current?.type === "pdf_gate"         && <PDFGateView item={current} onComplete={goNext} onPrev={goPrev} />}
            {current?.type === "checkpoint"       && <CheckpointView item={current} onComplete={goNext} onPrev={goPrev} />}
            {current?.type === "quiz_fundamentals"&& <QuizView item={current} onFinish={goNext} onPrev={goPrev} />}
            {current?.type === "quiz"             && <QuizView item={current} onFinish={handleFinish} onPrev={goPrev} />}
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
        <a href={url} target="_blank" rel="noopener noreferrer" style={S.pdfOpenBtn}>
          <ExternalLink size={13} /> Open Full PDF
        </a>
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
const PDFGateView = ({ item, onComplete, onPrev }) => {
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => { setConfirmed(false); }, [item.id]);
  return (
    <div style={S.lessonWrap}>
      <div style={S.typePillRed}><FileText size={14} /> Study Material</div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      <div style={S.pdfGateBanner}>
        <AlertCircle size={16} style={{ flexShrink: 0 }} />
        <span>Review this study material carefully before proceeding to the Fundamentals Exam. You must confirm you have read it below.</span>
      </div>
      <PDFViewer url={item.pdf_url} />
      <div style={S.pdfGateConfirmRow}>
        <input type="checkbox" id="pdf-confirm" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
          style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--cp-blue)", flexShrink: 0 }} />
        <label htmlFor="pdf-confirm" style={{ fontSize: 14, fontWeight: 700, color: "rgba(10,22,40,0.80)", cursor: "pointer", lineHeight: 1.4 }}>
          I have reviewed the study material and I am ready to take the Fundamentals Exam.
        </label>
      </div>
      <div style={S.navRow}>
        <button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>
        <button style={{ ...S.nextBtn, ...(!confirmed ? S.nextBtnDim : {}) }} onClick={confirmed ? onComplete : undefined} disabled={!confirmed} type="button">
          Proceed to Exam <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

/* ─── Lesson View ────────────────────────────────────────────────── */
const LessonView = ({ item, onComplete, onPrev, showPrev }) => {
  const [read, setRead]       = useState(false);
  const [pdfView, setPdfView] = useState(!!item.pdf_url);
  useEffect(() => {
    setRead(false); setPdfView(!!item.pdf_url);
    const timer = setTimeout(() => setRead(true), 3000);
    return () => clearTimeout(timer);
  }, [item.id, item.pdf_url]);
  return (
    <div style={S.lessonWrap}>
      <div style={S.typePill}>
        <PlayCircle size={14} /> Lesson
        {item.credit_hours > 0 && <span style={{ opacity: 0.7 }}>· {item.credit_hours} hr{item.credit_hours !== 1 ? "s" : ""}</span>}
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
          <div style={S.videoBox}>
            <div style={S.videoInner}>
              <div style={S.videoIconWrap}><PlayCircle size={48} style={{ color: "#fff", opacity: 0.9 }} /></div>
              <div style={S.videoLabel}>Video Lesson</div>
              <div style={S.videoSub}>Video content will be embedded here</div>
            </div>
          </div>
          {item.sections?.length > 0 && (
            <div style={S.lessonText}>
              <h3 style={{ ...S.lessonH3, marginTop: 0 }}>Topics Covered in This Module</h3>
              <ul style={S.lessonUl}>{item.sections.map((s, i) => <li key={i} style={S.lessonLi}>{s}</li>)}</ul>
              <p style={{ ...S.lessonP, marginBottom: 0, marginTop: 16, padding: "12px 16px", background: "rgba(46,171,254,0.06)", borderRadius: 10, border: "1px solid rgba(46,171,254,0.15)" }}>
                📖 Study the material above, then proceed to the checkpoint quiz to test your knowledge.
              </p>
            </div>
          )}
        </>
      )}
      <div style={S.navRow}>
        {showPrev && <button style={S.prevBtn} onClick={onPrev} type="button"><ArrowLeft size={16} /> Previous</button>}
        <button style={{ ...S.nextBtn, ...(read ? {} : S.nextBtnDim) }} onClick={onComplete} type="button">
          {read ? <>Continue <ArrowRight size={16} /></> : "Reading…"}
        </button>
      </div>
    </div>
  );
};

/* ─── Checkpoint View ────────────────────────────────────────────── */
const CheckpointView = ({ item, onComplete, onPrev }) => {
  const [answers, setAnswers]       = useState({});
  const [submitted, setSubmitted]   = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const handleSelect = (qid, idx) => { if (!submitted) setAnswers((p) => ({ ...p, [qid]: idx })); };
  const handleSubmit = () => { const ok = item.questions.every((q) => answers[q.id] === q.correct); setAllCorrect(ok); setSubmitted(true); };
  const handleRetry  = () => { setAnswers({}); setSubmitted(false); setAllCorrect(false); };
  const allAnswered  = item.questions.every((q) => answers[q.id] !== undefined);
  const correctCount = item.questions.filter((q) => answers[q.id] === q.correct).length;
  return (
    <div style={S.checkWrap}>
      <div style={S.typePillAmber}><ClipboardList size={14} /> Checkpoint</div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      <p style={S.checkSubtitle}>Answer all questions correctly to continue · {item.questions.length} questions</p>
      {submitted && (
        <div style={allCorrect ? S.scorePassed : S.scoreFailed}>
          <div style={S.scoreNumber}>{correctCount}/{item.questions.length}</div>
          <div style={S.scoreLabel}>{allCorrect ? "✅ All correct! You may continue." : `${item.questions.length - correctCount} incorrect — review and try again.`}</div>
        </div>
      )}
      <div style={S.questionList}>
        {item.questions.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} style={S.questionCard}>
              <div style={S.questionNum}>Q{qi + 1} of {item.questions.length}</div>
              <div style={S.questionText}>{q.text}</div>
              <div style={S.optionList}>
                {q.options.map((opt, oi) => {
                  const isSelected  = selected === oi;
                  const showCorrect = submitted && oi === q.correct;
                  const showWrong   = submitted && isSelected && oi !== q.correct;
                  return (
                    <button key={oi} type="button"
                      style={{ ...S.option, ...(isSelected && !submitted ? S.optionSelected : {}), ...(showCorrect ? S.optionCorrect : {}), ...(showWrong ? S.optionWrong : {}) }}
                      onClick={() => handleSelect(q.id, oi)}
                    >
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
const QuizView = ({ item, onFinish, onPrev }) => {
  const [answers, setAnswers]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]         = useState(0);
  const [passed, setPassed]       = useState(false);
  const [timeLeft, setTimeLeft]   = useState((item.timeLimitMin || 90) * 60);
  const timerRef = useRef(null);

  useEffect(() => { setAnswers({}); setSubmitted(false); setScore(0); setPassed(false); setTimeLeft((item.timeLimitMin || 90) * 60); }, [item.id]);
  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current); doSubmit(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitted]);

  const doSubmit = () => {
    clearInterval(timerRef.current);
    const correct = item.questions.filter((q) => answers[q.id] === q.correct).length;
    const pct     = Math.round((correct / item.questions.length) * 100);
    setScore(pct); setPassed(pct >= (item.passingScore || 70)); setSubmitted(true);
  };

  const fmt          = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const handleSelect = (qid, idx) => { if (!submitted) setAnswers((p) => ({ ...p, [qid]: idx })); };
  const handleRetry  = () => { setAnswers({}); setSubmitted(false); setScore(0); setPassed(false); setTimeLeft((item.timeLimitMin || 90) * 60); };
  const allAnswered   = item.questions.every((q) => answers[q.id] !== undefined);
  const answered      = Object.keys(answers).length;
  const correctCount  = item.questions.filter((q) => answers[q.id] === q.correct).length;
  const urgentTime    = timeLeft < 300;
  const isFundamentals = item.id?.includes("checkpoint-mod-") && !item.id?.includes("final-exam");

  return (
    <div style={S.checkWrap}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={isFundamentals ? S.typePillAmber : S.typePillGreen}>
          {isFundamentals ? <ClipboardList size={14} /> : <Trophy size={14} />}
          {isFundamentals ? " Fundamentals Exam" : " Final Exam"}
        </div>
        {!submitted && (
          <div style={{ ...S.timerBadge, background: urgentTime ? "rgba(239,68,68,0.10)" : "rgba(46,171,254,0.10)", border: `1px solid ${urgentTime ? "rgba(239,68,68,0.30)" : "rgba(46,171,254,0.25)"}`, color: urgentTime ? "rgba(185,28,28,1)" : "var(--cp-blue)" }}>
            ⏱ {fmt(timeLeft)}
          </div>
        )}
      </div>
      <h1 style={S.lessonTitle}>{item.title}</h1>
      <p style={S.checkSubtitle}>Score {item.passingScore || 70}% or higher to pass · {item.questions.length} questions{!submitted && ` · ${answered}/${item.questions.length} answered`}</p>
      {submitted && (
        <div style={passed ? S.scorePassed : S.scoreFailed}>
          <div style={S.scoreNumber}>{score}%</div>
          <div style={S.scoreLabel}>{passed ? `🎉 Passed! ${correctCount}/${item.questions.length} correct.` : `Need ${item.passingScore || 70}% — got ${correctCount}/${item.questions.length} correct.`}</div>
        </div>
      )}
      {!submitted && (
        <div style={{ background: "rgba(2,8,23,0.07)", borderRadius: 999, height: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,var(--cp-teal),var(--cp-blue))", width: `${(answered / item.questions.length) * 100}%`, transition: "width 0.3s ease" }} />
        </div>
      )}
      <div style={S.questionList}>
        {item.questions.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} style={S.questionCard}>
              <div style={S.questionNum}>Question {qi + 1} of {item.questions.length}</div>
              <div style={S.questionText}>{q.text}</div>
              <div style={S.optionList}>
                {q.options.map((opt, oi) => {
                  const isSelected  = selected === oi;
                  const markCorrect = submitted && oi === q.correct;
                  const markWrong   = submitted && isSelected && oi !== q.correct;
                  return (
                    <button key={oi} type="button"
                      style={{ ...S.option, ...(isSelected && !submitted ? S.optionSelected : {}), ...(markCorrect ? S.optionCorrect : {}), ...(markWrong ? S.optionWrong : {}) }}
                      onClick={() => handleSelect(q.id, oi)}
                    >
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
          ? <button style={{ ...S.nextBtn, ...(!allAnswered ? S.nextBtnDim : {}) }} onClick={doSubmit} disabled={!allAnswered} type="button">Submit Exam</button>
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

/* ─── Completion Screen ──────────────────────────────────────────── */
// Shows for both freshly completed and already-completed courses.
// transcriptEntry is set when course was already completed on load.
const CompletionScreen = ({ course, transcriptEntry, navigate, courseId }) => {
  const completedAt = transcriptEntry?.completed_at
    ? new Date(transcriptEntry.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const certCourseId = transcriptEntry?.course_id?._id || transcriptEntry?.course_id || courseId;

  return (
    <div style={S.page}><style>{css}</style>
      <div style={S.completionWrap}>
        <div style={S.completionCard}>
          <div style={S.completionStars}>
            {[...Array(5)].map((_, i) => <Star key={i} size={28} style={{ color: "#F59E0B", fill: "#F59E0B" }} />)}
          </div>
          <div style={S.completionBadge}><Trophy size={40} style={{ color: "#F59E0B" }} /></div>
          <h1 style={S.completionTitle}>
            {transcriptEntry ? "Already Completed!" : "Course Complete!"}
          </h1>
          <p style={S.completionSub}>
            {transcriptEntry
              ? "You have already successfully completed"
              : "Congratulations! You've successfully completed"}
          </p>
          <div style={S.completionCourseName}>{course?.title}</div>

          <div style={S.completionMeta}>
            <span style={S.completionMetaItem}>✓ {course?.credit_hours} Credit Hours Earned</span>
            {completedAt && <span style={S.completionMetaItem}>✓ Completed on {completedAt}</span>}
            <span style={S.completionMetaItem}>✓ Certificate Unlocked</span>
            <span style={S.completionMetaItem}>✓ NMLS Requirements Met</span>
          </div>

          <div style={S.completionActions}>
            {/* ── View Certificate button ── */}
            {certCourseId && (
              <button
                style={S.completionCertBtn}
                onClick={() => navigate(`/certificate/${certCourseId}`)}
                type="button"
              >
                <Award size={18} /> View Certificate
              </button>
            )}
            <button style={S.completionPrimary} onClick={() => navigate("/dashboard")} type="button">
              Go to Dashboard
            </button>
            <button style={S.completionSecondary} onClick={() => navigate("/my-courses")} type="button">
              My Courses
            </button>
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
body{font-family:'DM Sans',system-ui,sans-serif;background:var(--cp-bg);color:#0a1628;}
.cp-spin{width:38px;height:38px;border-radius:50%;border:3px solid rgba(2,8,23,0.10);border-top-color:var(--cp-blue);animation:cpspin 0.9s linear infinite;}
@keyframes cpspin{to{transform:rotate(360deg);}}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:        { minHeight:"100vh",background:"var(--cp-bg)",display:"flex",flexDirection:"column" },
  loadCenter:  { minHeight:"100vh",display:"grid",placeItems:"center" },
  errorBanner: { background:"rgba(239,68,68,0.10)",border:"1px solid rgba(239,68,68,0.25)",color:"rgba(185,28,28,1)",padding:"10px 20px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8 },

  topbar:          { height:58,background:"var(--cp-dark)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",gap:16,flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.08)" },
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

  body:    { display:"flex",flex:1,overflow:"hidden",height:"calc(100vh - 58px)" },
  sidebar: { width:290,flexShrink:0,background:"#fff",borderRight:"1px solid rgba(2,8,23,0.08)",display:"flex",flexDirection:"column",overflowY:"auto" },
  sidebarHead:       { padding:"16px 18px 12px",fontWeight:900,fontSize:13,color:"rgba(10,22,40,0.55)",letterSpacing:"0.4px",borderBottom:"1px solid rgba(2,8,23,0.07)",display:"flex",alignItems:"center" },
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

  main:        { flex:1,overflowY:"auto",padding:"20px 0 32px" },
  contentWrap: { maxWidth:860,margin:"0 auto",padding:"0 24px" },

  typePill:      { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(46,171,254,0.10)",border:"1px solid rgba(46,171,254,0.22)",color:"var(--cp-blue)",fontWeight:800,fontSize:12,marginBottom:16 },
  typePillAmber: { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(245,158,11,0.10)",border:"1px solid rgba(245,158,11,0.28)",color:"rgba(180,110,0,1)",fontWeight:800,fontSize:12,marginBottom:16 },
  typePillGreen: { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(34,197,94,0.10)",border:"1px solid rgba(34,197,94,0.28)",color:"rgba(21,128,61,1)",fontWeight:800,fontSize:12,marginBottom:16 },
  typePillRed:   { display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:999,background:"rgba(239,68,68,0.10)",border:"1px solid rgba(239,68,68,0.28)",color:"rgba(185,28,28,1)",fontWeight:800,fontSize:12,marginBottom:16 },
  timerBadge:    { display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:999,fontWeight:900,fontSize:14,letterSpacing:"0.5px" },

  lessonWrap:  { display:"flex",flexDirection:"column",gap:24 },
  lessonTitle: { fontSize:26,fontWeight:900,color:"var(--cp-dark)",letterSpacing:"-0.4px",lineHeight:1.2,fontFamily:"'DM Serif Display',serif" },
  pdfGateBanner:     { display:"flex",alignItems:"flex-start",gap:10,padding:"14px 18px",borderRadius:14,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.28)",color:"rgba(146,84,0,1)",fontSize:14,fontWeight:700,lineHeight:1.5 },
  pdfGateConfirmRow: { display:"flex",alignItems:"center",gap:12,padding:"16px 18px",borderRadius:14,background:"#fff",border:"1px solid rgba(2,8,23,0.09)",boxShadow:"0 2px 8px rgba(2,8,23,0.05)" },
  pdfWrap:      { borderRadius:18,overflow:"hidden",border:"1px solid rgba(2,8,23,0.10)",boxShadow:"0 8px 32px rgba(2,8,23,0.08)",width:"100%" },
  pdfToolbar:   { display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#fff",borderBottom:"1px solid rgba(2,8,23,0.08)" },
  pdfOpenBtn:   { display:"inline-flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,background:"rgba(46,171,254,0.10)",border:"1px solid rgba(46,171,254,0.22)",color:"var(--cp-blue)",fontWeight:700,fontSize:12,textDecoration:"none" },
  pdfIframe:    { width:"100%",height:"calc(100vh - 160px)",minHeight:800,border:"none",display:"block",background:"#f8f8f8" },
  pdfPlaceholder:{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,background:"#fff",borderRadius:18,border:"2px dashed rgba(2,8,23,0.12)" },
  pdfErrorBox:  { display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:200,background:"#fff" },
  pdfFallbackBtn:{ display:"inline-flex",alignItems:"center",gap:6,padding:"10px 20px",borderRadius:10,background:"var(--cp-blue)",color:"#fff",fontWeight:700,fontSize:14,textDecoration:"none" },
  viewToggle:     { display:"flex",gap:8,padding:"4px",background:"rgba(2,8,23,0.05)",borderRadius:12,width:"fit-content" },
  toggleBtn:      { display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",fontWeight:700,fontSize:13,color:"rgba(10,22,40,0.55)" },
  toggleBtnActive:{ background:"#fff",color:"var(--cp-dark)",boxShadow:"0 2px 8px rgba(2,8,23,0.10)" },
  videoBox:     { borderRadius:18,overflow:"hidden",background:"linear-gradient(135deg,#0a1628 0%,#0d2a4a 50%,#091f3a 100%)",border:"1px solid rgba(46,171,254,0.15)",aspectRatio:"16/9",display:"flex",alignItems:"center",justifyContent:"center" },
  videoInner:   { textAlign:"center" },
  videoIconWrap:{ width:72,height:72,borderRadius:"50%",background:"rgba(46,171,254,0.20)",border:"2px solid rgba(46,171,254,0.35)",display:"grid",placeItems:"center",margin:"0 auto 14px",cursor:"pointer" },
  videoLabel:   { color:"#fff",fontWeight:800,fontSize:16,marginBottom:6 },
  videoSub:     { color:"rgba(255,255,255,0.45)",fontWeight:600,fontSize:13 },
  lessonText:   { background:"#fff",borderRadius:18,border:"1px solid rgba(2,8,23,0.08)",padding:"28px 32px",lineHeight:1.8 },
  lessonH3:     { fontWeight:800,fontSize:16,color:"var(--cp-dark)",margin:"20px 0 10px",fontFamily:"'DM Serif Display',serif" },
  lessonP:      { color:"rgba(10,22,40,0.80)",fontSize:15,marginBottom:14,fontWeight:450 },
  lessonUl:     { paddingLeft:22,marginBottom:14 },
  lessonLi:     { color:"rgba(10,22,40,0.78)",fontSize:15,marginBottom:8,fontWeight:450 },

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
  scorePassed: { borderRadius:18,background:"linear-gradient(135deg,rgba(34,197,94,0.10),rgba(0,180,180,0.10))",border:"1px solid rgba(34,197,94,0.25)",padding:"24px",textAlign:"center" },
  scoreFailed: { borderRadius:18,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.20)",padding:"24px",textAlign:"center" },
  scoreNumber: { fontSize:48,fontWeight:950,color:"var(--cp-dark)",letterSpacing:"-2px",fontFamily:"'DM Serif Display',serif" },
  scoreLabel:  { fontSize:15,fontWeight:700,color:"rgba(10,22,40,0.65)",marginTop:6 },

  navRow:    { display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8 },
  prevBtn:   { display:"inline-flex",alignItems:"center",gap:8,padding:"12px 20px",borderRadius:12,border:"1px solid rgba(2,8,23,0.12)",background:"#fff",cursor:"pointer",fontWeight:800,fontSize:14,color:"rgba(10,22,40,0.72)" },
  nextBtn:   { marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,border:"none",background:"var(--cp-blue)",color:"#fff",cursor:"pointer",fontWeight:900,fontSize:14,boxShadow:"0 6px 20px rgba(46,171,254,0.28)" },
  nextBtnDim:{ opacity:0.5,cursor:"not-allowed",boxShadow:"none" },
  retryBtn:  { marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,border:"none",background:"rgba(239,68,68,0.90)",color:"#fff",cursor:"pointer",fontWeight:900,fontSize:14 },
  finishBtn: { marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#22C55E,#00B4B4)",color:"#fff",cursor:"pointer",fontWeight:900,fontSize:14,boxShadow:"0 6px 20px rgba(34,197,94,0.30)" },

  // Completion screen
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
  // ── View Certificate — gold/amber styled ──
  completionCertBtn:    { width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(245,158,11,0.35)",background:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.06))",color:"rgba(146,84,0,1)",cursor:"pointer",fontWeight:950,fontSize:15,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 16px rgba(245,158,11,0.18)" },
  completionPrimary:    { width:"100%",padding:"14px",borderRadius:14,border:"none",background:"var(--cp-blue)",color:"#fff",cursor:"pointer",fontWeight:950,fontSize:15,boxShadow:"0 8px 24px rgba(46,171,254,0.28)" },
  completionSecondary:  { width:"100%",padding:"14px",borderRadius:14,border:"1px solid rgba(2,8,23,0.12)",background:"#fff",cursor:"pointer",fontWeight:900,fontSize:15,color:"rgba(10,22,40,0.72)" },
};

export default CoursePortal;