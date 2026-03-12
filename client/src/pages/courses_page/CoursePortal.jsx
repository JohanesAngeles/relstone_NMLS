import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, PlayCircle,
  BookOpen, ClipboardList, Trophy, Lock, ChevronRight,
  AlertCircle, Star, X,
} from "lucide-react";
import API from "../../api/axios";

/* ─── Mock course content (replace with API data later) ─────────── */
const MOCK_CONTENT = [
  {
    id: "lesson-1",
    type: "lesson",
    title: "Introduction to NMLS Licensing",
    videoUrl: null, // placeholder
    text: `The Nationwide Multistate Licensing System & Registry (NMLS) is the system of record for non-depository financial services licensing or registration in participating states.

The NMLS was created in 2008 by the Conference of State Bank Supervisors (CSBS) and the American Association of Residential Mortgage Regulators (AARMR) to provide a common platform for mortgage companies and regulators.

**Why NMLS Matters**

Before the NMLS, each state had its own licensing system, making it difficult and expensive for mortgage professionals to operate across state lines. The NMLS standardized the process, creating one application, one set of data, and one portal for all states.

**Key Benefits**
- Streamlined multi-state licensing
- Enhanced consumer protection
- Improved regulatory oversight
- Reduced duplication of effort for applicants

**Federal Registration**
Under the SAFE Act, certain mortgage loan originators employed by federally regulated institutions are required to register with the NMLS, creating a comprehensive national database of mortgage professionals.`,
  },
  {
    id: "checkpoint-1",
    type: "checkpoint",
    title: "Checkpoint: Module 1 Knowledge Check",
    questions: [
      {
        id: "q1",
        text: "What year was the NMLS created?",
        options: ["2005", "2006", "2008", "2010"],
        correct: 2,
      },
      {
        id: "q2",
        text: "What does NMLS stand for?",
        options: [
          "National Mortgage Licensing Standard",
          "Nationwide Multistate Licensing System & Registry",
          "National Monetary Loan Service",
          "Nationwide Mortgage Lender System",
        ],
        correct: 1,
      },
      {
        id: "q3",
        text: "Which act requires certain mortgage loan originators to register with NMLS?",
        options: ["Dodd-Frank Act", "SAFE Act", "Glass-Steagall Act", "Truth in Lending Act"],
        correct: 1,
      },
    ],
  },
  {
    id: "lesson-2",
    type: "lesson",
    title: "Pre-Licensure Education Requirements",
    videoUrl: null,
    text: `Before obtaining an MLO license, candidates must complete a minimum of 20 hours of NMLS-approved pre-licensure education (PE).

**Required PE Hours Breakdown**

The 20-hour federal requirement includes:
- 3 hours of federal law
- 3 hours of ethics (including fraud, consumer protection, and fair lending)
- 2 hours of non-traditional mortgage lending
- 12 hours of elective courses covering mortgage origination

**State-Specific Requirements**

Many states require additional hours beyond the federal 20-hour minimum. For example:
- California: 20 hours federal + additional state-specific content
- New York: 20 hours federal + 3 hours NY-specific
- Florida: 20 hours federal + required FL law content

**Approved Education Providers**

All PE must be completed through NMLS-approved education providers. Providers must meet strict quality standards and submit course content to NMLS for review and approval.

**The 3-Year Rule**

If an applicant has not held a valid license for the preceding 3 years, they must retake the pre-licensure education — even if they completed it previously. This ensures licensees stay current with regulations.`,
  },
  {
    id: "checkpoint-2",
    type: "checkpoint",
    title: "Checkpoint: PE Requirements Check",
    questions: [
      {
        id: "q4",
        text: "How many minimum hours of PE are required federally?",
        options: ["10 hours", "15 hours", "20 hours", "25 hours"],
        correct: 2,
      },
      {
        id: "q5",
        text: "How many hours of ethics are required in the federal PE curriculum?",
        options: ["1 hour", "2 hours", "3 hours", "5 hours"],
        correct: 2,
      },
      {
        id: "q6",
        text: "After how many years without a valid license must an applicant retake PE?",
        options: ["1 year", "2 years", "3 years", "5 years"],
        correct: 2,
      },
    ],
  },
  {
    id: "lesson-3",
    type: "lesson",
    title: "Continuing Education & License Renewal",
    videoUrl: null,
    text: `Licensed mortgage loan originators must complete annual continuing education (CE) to renew their licenses each year.

**Annual CE Requirements**

The federal minimum for CE is 8 hours annually, which includes:
- 3 hours of federal law updates
- 2 hours of ethics
- 2 hours of non-traditional mortgage lending
- 1 hour of elective content

**Successive Years Rule**

MLOs cannot take the same approved CE course in consecutive years. This encourages ongoing education with fresh content rather than repeating the same material.

**State CE Requirements**

Just like PE, many states require additional CE hours beyond the federal minimum. Always verify your specific state requirements before the renewal deadline.

**Renewal Deadlines**

NMLS license renewal is typically required between November 1 and December 31 each year. Missing the deadline may result in license expiration and require reinstatement.

**CE Completion Timing**

CE must be completed before submitting your license renewal application. Plan ahead — popular CE courses fill up quickly as the November deadline approaches.`,
  },
  {
    id: "final-quiz",
    type: "quiz",
    title: "Final Assessment",
    passingScore: 70,
    questions: [
      {
        id: "fq1",
        text: "What is the primary purpose of the NMLS?",
        options: [
          "To provide loans to consumers",
          "To serve as a common licensing platform for non-depository financial services",
          "To regulate bank interest rates",
          "To insure mortgage loans",
        ],
        correct: 1,
      },
      {
        id: "fq2",
        text: "Which organizations created the NMLS?",
        options: [
          "FDIC and Federal Reserve",
          "HUD and FHA",
          "CSBS and AARMR",
          "SEC and CFTC",
        ],
        correct: 2,
      },
      {
        id: "fq3",
        text: "How many hours of federal law are required in PE?",
        options: ["1 hour", "2 hours", "3 hours", "5 hours"],
        correct: 2,
      },
      {
        id: "fq4",
        text: "What is the total federal minimum for annual CE?",
        options: ["4 hours", "6 hours", "8 hours", "10 hours"],
        correct: 2,
      },
      {
        id: "fq5",
        text: "When is the NMLS license renewal window typically open?",
        options: [
          "January 1 – February 28",
          "July 1 – August 31",
          "November 1 – December 31",
          "October 1 – November 30",
        ],
        correct: 2,
      },
      {
        id: "fq6",
        text: "The 'Successive Years Rule' means an MLO cannot:",
        options: [
          "Take more than 8 CE hours per year",
          "Take the same CE course in consecutive years",
          "Change their license state",
          "Renew their license early",
        ],
        correct: 1,
      },
      {
        id: "fq7",
        text: "What is required if an MLO has not held a valid license for 3 years?",
        options: [
          "Pay a reinstatement fee only",
          "Retake the licensing exam only",
          "Retake pre-licensure education",
          "Nothing — license remains valid",
        ],
        correct: 2,
      },
    ],
  },
];

/* ─── Main Component ─────────────────────────────────────────────── */
const CoursePortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [completed, setCompleted]     = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [finished, setFinished]       = useState(false);

  const content = MOCK_CONTENT;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/courses/${id}`);
        setCourse(res.data);
      } catch {
        setCourse({ title: "NMLS Pre-Licensing Course", credit_hours: 20, type: "PE" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const current   = content[currentIdx];
  const progress  = Math.round((completed.size / content.length) * 100);

  const markComplete = (idx) => {
    setCompleted((prev) => new Set([...prev, idx]));
  };

  const goNext = () => {
    markComplete(currentIdx);
    if (currentIdx < content.length - 1) {
      setCurrentIdx(currentIdx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const canNavigateTo = (idx) => {
    if (idx === 0) return true;
    return completed.has(idx - 1);
  };

  const handleFinish = () => {
    markComplete(currentIdx);
    setFinished(true);
  };

  if (loading) return (
    <div style={S.page}><style>{css}</style>
      <div style={S.loadCenter}><div className="cp-spin" /></div>
    </div>
  );

  if (finished) return <CompletionScreen course={course} navigate={navigate} />;

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Top bar ── */}
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
          <BookOpen size={16} />
          <span>Contents</span>
        </button>
      </header>

      <div style={S.body}>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside style={S.sidebar}>
            <div style={S.sidebarHead}>Course Contents</div>
            <div style={S.sidebarList}>
              {content.map((item, idx) => {
                const isDone      = completed.has(idx);
                const isCurrent   = idx === currentIdx;
                const isLocked    = !canNavigateTo(idx);
                const icon = item.type === "lesson"      ? <PlayCircle size={14} />
                           : item.type === "checkpoint"  ? <ClipboardList size={14} />
                           : <Trophy size={14} />;

                return (
                  <button
                    key={item.id}
                    style={{
                      ...S.sidebarItem,
                      ...(isCurrent ? S.sidebarItemActive : {}),
                      ...(isLocked  ? S.sidebarItemLocked : {}),
                    }}
                    onClick={() => !isLocked && setCurrentIdx(idx)}
                    type="button"
                    disabled={isLocked}
                  >
                    <div style={S.sidebarItemLeft}>
                      <div style={{
                        ...S.sidebarIcon,
                        color: item.type === "checkpoint" ? "rgba(245,158,11,1)"
                             : item.type === "quiz"       ? "rgba(34,197,94,1)"
                             : "var(--cp-blue)",
                      }}>
                        {icon}
                      </div>
                      <div>
                        <div style={S.sidebarLabel}>
                          {item.type === "lesson"     ? "Lesson"
                         : item.type === "checkpoint" ? "Checkpoint"
                         : "Final Quiz"}
                        </div>
                        <div style={S.sidebarTitle}>{item.title}</div>
                      </div>
                    </div>
                    {isDone  && <CheckCircle2 size={16} style={{ color: "rgba(34,197,94,1)", flexShrink: 0 }} />}
                    {isLocked && <Lock size={13} style={{ color: "rgba(11,18,32,0.30)", flexShrink: 0 }} />}
                    {!isDone && !isLocked && isCurrent && (
                      <ChevronRight size={14} style={{ color: "var(--cp-blue)", flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* ── Main content ── */}
        <main style={S.main}>
          <div style={S.contentWrap}>
            {current.type === "lesson" && (
              <LessonView item={current} onComplete={goNext} onPrev={goPrev} showPrev={currentIdx > 0} />
            )}
            {current.type === "checkpoint" && (
              <CheckpointView item={current} onComplete={goNext} onPrev={goPrev} />
            )}
            {current.type === "quiz" && (
              <QuizView item={current} onFinish={handleFinish} onPrev={goPrev} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

/* ─── Lesson View ────────────────────────────────────────────────── */
const LessonView = ({ item, onComplete, onPrev, showPrev }) => {
  const [read, setRead] = useState(false);
  const textRef = useRef(null);

  // Mark as read after scrolling through
  useEffect(() => {
    setRead(false);
    const timer = setTimeout(() => setRead(true), 4000);
    return () => clearTimeout(timer);
  }, [item.id]);

  const paragraphs = item.text.split("\n\n");

  return (
    <div style={S.lessonWrap}>
      {/* Type pill */}
      <div style={S.typePill}>
        <PlayCircle size={14} /> Lesson
      </div>

      <h1 style={S.lessonTitle}>{item.title}</h1>

      {/* Video placeholder */}
      <div style={S.videoBox}>
        <div style={S.videoInner}>
          <div style={S.videoIconWrap}>
            <PlayCircle size={48} style={{ color: "#fff", opacity: 0.9 }} />
          </div>
          <div style={S.videoLabel}>Video Lesson</div>
          <div style={S.videoSub}>Video content will be embedded here</div>
        </div>
      </div>

      {/* Text content */}
      <div style={S.lessonText} ref={textRef}>
        {paragraphs.map((p, i) => {
          if (p.startsWith("**") && p.endsWith("**")) {
            return <h3 key={i} style={S.lessonH3}>{p.replace(/\*\*/g, "")}</h3>;
          }
          if (p.startsWith("- ")) {
            const items = p.split("\n").filter(l => l.startsWith("- "));
            return (
              <ul key={i} style={S.lessonUl}>
                {items.map((li, j) => (
                  <li key={j} style={S.lessonLi}>{li.replace("- ", "")}</li>
                ))}
              </ul>
            );
          }
          // Handle inline bold
          const parts = p.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} style={S.lessonP}>
              {parts.map((part, j) =>
                part.startsWith("**") && part.endsWith("**")
                  ? <strong key={j}>{part.replace(/\*\*/g, "")}</strong>
                  : part
              )}
            </p>
          );
        })}
      </div>

      {/* Nav */}
      <div style={S.navRow}>
        {showPrev && (
          <button style={S.prevBtn} onClick={onPrev} type="button">
            <ArrowLeft size={16} /> Previous
          </button>
        )}
        <button
          style={{ ...S.nextBtn, ...(read ? {} : S.nextBtnDim) }}
          onClick={onComplete}
          type="button"
        >
          {read ? "Continue" : "Reading…"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

/* ─── Checkpoint View ────────────────────────────────────────────── */
const CheckpointView = ({ item, onComplete, onPrev }) => {
  const [answers, setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  const handleSelect = (qid, idx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = () => {
    const correct = item.questions.every(
      (q) => answers[q.id] === q.correct
    );
    setAllCorrect(correct);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setAllCorrect(false);
  };

  const allAnswered = item.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div style={S.checkWrap}>
      <div style={S.typePillAmber}>
        <ClipboardList size={14} /> Checkpoint
      </div>

      <h1 style={S.lessonTitle}>{item.title}</h1>
      <p style={S.checkSubtitle}>Answer all questions correctly to continue.</p>

      <div style={S.questionList}>
        {item.questions.map((q, qi) => {
          const selected  = answers[q.id];
          const isCorrect = submitted && selected === q.correct;
          const isWrong   = submitted && selected !== q.correct;

          return (
            <div key={q.id} style={S.questionCard}>
              <div style={S.questionNum}>Q{qi + 1}</div>
              <div style={S.questionText}>{q.text}</div>
              <div style={S.optionList}>
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi;
                  const showCorrect = submitted && oi === q.correct;
                  const showWrong   = submitted && isSelected && oi !== q.correct;

                  return (
                    <button
                      key={oi}
                      style={{
                        ...S.option,
                        ...(isSelected && !submitted ? S.optionSelected : {}),
                        ...(showCorrect ? S.optionCorrect : {}),
                        ...(showWrong   ? S.optionWrong   : {}),
                      }}
                      onClick={() => handleSelect(q.id, oi)}
                      type="button"
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

      {/* Result banner */}
      {submitted && (
        <div style={allCorrect ? S.resultSuccess : S.resultFail}>
          {allCorrect
            ? <><CheckCircle2 size={18} /> All correct! You may continue.</>
            : <><AlertCircle size={18} /> Some answers were incorrect. Review and try again.</>
          }
        </div>
      )}

      {/* Nav */}
      <div style={S.navRow}>
        <button style={S.prevBtn} onClick={onPrev} type="button">
          <ArrowLeft size={16} /> Previous
        </button>
        {!submitted ? (
          <button
            style={{ ...S.nextBtn, ...(!allAnswered ? S.nextBtnDim : {}) }}
            onClick={handleSubmit}
            disabled={!allAnswered}
            type="button"
          >
            Submit Answers
          </button>
        ) : allCorrect ? (
          <button style={S.nextBtn} onClick={onComplete} type="button">
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button style={S.retryBtn} onClick={handleRetry} type="button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Quiz View ──────────────────────────────────────────────────── */
const QuizView = ({ item, onFinish, onPrev }) => {
  const [answers, setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]       = useState(0);
  const [passed, setPassed]     = useState(false);

  const handleSelect = (qid, idx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const handleSubmit = () => {
    const correct = item.questions.filter((q) => answers[q.id] === q.correct).length;
    const pct     = Math.round((correct / item.questions.length) * 100);
    setScore(pct);
    setPassed(pct >= item.passingScore);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setPassed(false);
  };

  const allAnswered = item.questions.every((q) => answers[q.id] !== undefined);
  const correctCount = item.questions.filter((q) => answers[q.id] === q.correct).length;

  return (
    <div style={S.checkWrap}>
      <div style={S.typePillGreen}>
        <Trophy size={14} /> Final Quiz
      </div>

      <h1 style={S.lessonTitle}>{item.title}</h1>
      <p style={S.checkSubtitle}>
        Score {item.passingScore}% or higher to complete the course. · {item.questions.length} questions
      </p>

      {/* Score display after submit */}
      {submitted && (
        <div style={passed ? S.scorePassed : S.scoreFailed}>
          <div style={S.scoreNumber}>{score}%</div>
          <div style={S.scoreLabel}>
            {passed ? "🎉 Passed! Excellent work." : `Need ${item.passingScore}% to pass — you got ${correctCount}/${item.questions.length} correct.`}
          </div>
        </div>
      )}

      <div style={S.questionList}>
        {item.questions.map((q, qi) => {
          const selected    = answers[q.id];
          const showCorrect = submitted && q.correct;
          const showWrong   = submitted && selected !== q.correct;

          return (
            <div key={q.id} style={S.questionCard}>
              <div style={S.questionNum}>Q{qi + 1}</div>
              <div style={S.questionText}>{q.text}</div>
              <div style={S.optionList}>
                {q.options.map((opt, oi) => {
                  const isSelected   = selected === oi;
                  const markCorrect  = submitted && oi === q.correct;
                  const markWrong    = submitted && isSelected && oi !== q.correct;

                  return (
                    <button
                      key={oi}
                      style={{
                        ...S.option,
                        ...(isSelected && !submitted ? S.optionSelected : {}),
                        ...(markCorrect ? S.optionCorrect : {}),
                        ...(markWrong   ? S.optionWrong   : {}),
                      }}
                      onClick={() => handleSelect(q.id, oi)}
                      type="button"
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
        {!submitted && (
          <button style={S.prevBtn} onClick={onPrev} type="button">
            <ArrowLeft size={16} /> Previous
          </button>
        )}
        {!submitted ? (
          <button
            style={{ ...S.nextBtn, ...(!allAnswered ? S.nextBtnDim : {}) }}
            onClick={handleSubmit}
            disabled={!allAnswered}
            type="button"
          >
            Submit Quiz
          </button>
        ) : passed ? (
          <button style={S.finishBtn} onClick={onFinish} type="button">
            <Trophy size={16} /> Complete Course
          </button>
        ) : (
          <button style={S.retryBtn} onClick={handleRetry} type="button">
            Retry Quiz
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Completion Screen ──────────────────────────────────────────── */
const CompletionScreen = ({ course, navigate }) => (
  <div style={S.page}>
    <style>{css}</style>
    <div style={S.completionWrap}>
      <div style={S.completionCard}>
        <div style={S.completionStars}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={28} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
          ))}
        </div>
        <div style={S.completionBadge}>
          <Trophy size={40} style={{ color: "#F59E0B" }} />
        </div>
        <h1 style={S.completionTitle}>Course Complete!</h1>
        <p style={S.completionSub}>
          Congratulations! You've successfully completed
        </p>
        <div style={S.completionCourseName}>{course?.title}</div>
        <div style={S.completionMeta}>
          <span style={S.completionMetaItem}>✓ {course?.credit_hours} Credit Hours Earned</span>
          <span style={S.completionMetaItem}>✓ Certificate Unlocked</span>
          <span style={S.completionMetaItem}>✓ NMLS Requirements Met</span>
        </div>
        <div style={S.completionActions}>
          <button style={S.completionPrimary} onClick={() => navigate("/dashboard")} type="button">
            Go to Dashboard
          </button>
          <button style={S.completionSecondary} onClick={() => navigate("/courses")} type="button">
            Browse More Courses
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display&display=swap');
:root {
  --cp-dark: #0a1628;
  --cp-blue: #2EABFE;
  --cp-teal: #00B4B4;
  --cp-bg:   #f4f6fa;
  --cp-card: #ffffff;
  --cp-border: rgba(2,8,23,0.09);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', system-ui, sans-serif; background: var(--cp-bg); color: #0a1628; }
.cp-spin {
  width: 38px; height: 38px; border-radius: 50%;
  border: 3px solid rgba(2,8,23,0.10);
  border-top-color: var(--cp-blue);
  animation: cpspin 0.9s linear infinite;
}
@keyframes cpspin { to { transform: rotate(360deg); } }
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:      { minHeight: "100vh", background: "var(--cp-bg)", display: "flex", flexDirection: "column" },
  loadCenter:{ minHeight: "100vh", display: "grid", placeItems: "center" },

  // topbar
  topbar: {
    height: 58, background: "var(--cp-dark)", display: "flex",
    alignItems: "center", justifyContent: "space-between",
    padding: "0 20px", gap: 16, flexShrink: 0,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  topbarLeft:   { display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 },
  exitBtn:      { display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  courseNameWrap:{ minWidth: 0 },
  courseName:   { color: "#fff", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  courseType:   { color: "rgba(255,255,255,0.50)", fontSize: 11, fontWeight: 600, marginTop: 1 },
  topbarCenter: { display: "flex", alignItems: "center", gap: 10, flex: 1, justifyContent: "center" },
  progressBarWrap: { width: 200, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.15)", overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 999, background: "linear-gradient(90deg,var(--cp-teal),var(--cp-blue))", transition: "width 0.5s ease" },
  progressText: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" },
  menuBtn:      { display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, flexShrink: 0 },

  // layout
  body:   { display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 58px)" },

  // sidebar
  sidebar: {
    width: 290, flexShrink: 0, background: "#fff",
    borderRight: "1px solid rgba(2,8,23,0.08)",
    display: "flex", flexDirection: "column",
    overflowY: "auto",
  },
  sidebarHead: { padding: "16px 18px 12px", fontWeight: 900, fontSize: 13, color: "rgba(10,22,40,0.55)", letterSpacing: "0.4px", borderBottom: "1px solid rgba(2,8,23,0.07)" },
  sidebarList: { display: "flex", flexDirection: "column", padding: "8px 0" },
  sidebarItem: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 10, padding: "11px 16px", border: "none", background: "transparent",
    cursor: "pointer", textAlign: "left", transition: "background 0.15s",
  },
  sidebarItemActive: { background: "rgba(46,171,254,0.08)", borderRight: "3px solid var(--cp-blue)" },
  sidebarItemLocked: { opacity: 0.45, cursor: "not-allowed" },
  sidebarItemLeft:   { display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0, flex: 1 },
  sidebarIcon:  { marginTop: 2, flexShrink: 0 },
  sidebarLabel: { fontSize: 10, fontWeight: 800, color: "rgba(10,22,40,0.45)", letterSpacing: "0.5px", marginBottom: 2 },
  sidebarTitle: { fontSize: 13, fontWeight: 700, color: "rgba(10,22,40,0.85)", lineHeight: 1.35 },

  // main
  main:        { flex: 1, overflowY: "auto", padding: "32px 0 64px" },
  contentWrap: { maxWidth: 780, margin: "0 auto", padding: "0 24px" },

  // type pills
  typePill:      { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.22)", color: "var(--cp-blue)", fontWeight: 800, fontSize: 12, marginBottom: 16 },
  typePillAmber: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)", color: "rgba(180,110,0,1)", fontWeight: 800, fontSize: 12, marginBottom: 16 },
  typePillGreen: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.28)", color: "rgba(21,128,61,1)", fontWeight: 800, fontSize: 12, marginBottom: 16 },

  // lesson
  lessonWrap:  { display: "flex", flexDirection: "column", gap: 24 },
  lessonTitle: { fontSize: 26, fontWeight: 900, color: "var(--cp-dark)", letterSpacing: "-0.4px", lineHeight: 1.2, fontFamily: "'DM Serif Display', serif" },

  videoBox: {
    borderRadius: 18, overflow: "hidden",
    background: "linear-gradient(135deg, #0a1628 0%, #0d2a4a 50%, #091f3a 100%)",
    border: "1px solid rgba(46,171,254,0.15)",
    boxShadow: "0 16px 48px rgba(10,22,40,0.18)",
    aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center",
  },
  videoInner:  { textAlign: "center" },
  videoIconWrap:{ width: 72, height: 72, borderRadius: "50%", background: "rgba(46,171,254,0.20)", border: "2px solid rgba(46,171,254,0.35)", display: "grid", placeItems: "center", margin: "0 auto 14px", cursor: "pointer" },
  videoLabel:  { color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 6 },
  videoSub:    { color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 13 },

  lessonText:  { background: "#fff", borderRadius: 18, border: "1px solid rgba(2,8,23,0.08)", padding: "28px 32px", lineHeight: 1.8 },
  lessonH3:    { fontWeight: 800, fontSize: 16, color: "var(--cp-dark)", margin: "20px 0 10px", fontFamily: "'DM Serif Display', serif" },
  lessonP:     { color: "rgba(10,22,40,0.80)", fontSize: 15, marginBottom: 14, fontWeight: 450 },
  lessonUl:    { paddingLeft: 22, marginBottom: 14 },
  lessonLi:    { color: "rgba(10,22,40,0.78)", fontSize: 15, marginBottom: 6, fontWeight: 450 },

  // checkpoint & quiz
  checkWrap:    { display: "flex", flexDirection: "column", gap: 22 },
  checkSubtitle:{ color: "rgba(10,22,40,0.55)", fontSize: 14, fontWeight: 600, marginTop: -14 },
  questionList: { display: "flex", flexDirection: "column", gap: 16 },
  questionCard: { background: "#fff", borderRadius: 18, border: "1px solid rgba(2,8,23,0.08)", padding: "20px 22px", boxShadow: "0 4px 14px rgba(2,8,23,0.05)" },
  questionNum:  { fontSize: 11, fontWeight: 900, color: "rgba(10,22,40,0.40)", letterSpacing: "0.6px", marginBottom: 8 },
  questionText: { fontWeight: 750, fontSize: 15, color: "var(--cp-dark)", marginBottom: 14, lineHeight: 1.5 },
  optionList:   { display: "flex", flexDirection: "column", gap: 8 },
  option: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "11px 14px", borderRadius: 12,
    border: "1.5px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.01)",
    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
  },
  optionSelected: { border: "1.5px solid rgba(46,171,254,0.50)", background: "rgba(46,171,254,0.06)", boxShadow: "0 0 0 3px rgba(46,171,254,0.12)" },
  optionCorrect:  { border: "1.5px solid rgba(34,197,94,0.50)", background: "rgba(34,197,94,0.06)" },
  optionWrong:    { border: "1.5px solid rgba(239,68,68,0.50)", background: "rgba(239,68,68,0.06)" },
  optionLetter:   { width: 26, height: 26, borderRadius: 8, background: "rgba(2,8,23,0.06)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 900, color: "rgba(10,22,40,0.70)", flexShrink: 0 },
  optionText:     { flex: 1, fontSize: 14, fontWeight: 600, color: "rgba(10,22,40,0.85)" },

  resultSuccess:{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 14, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "rgba(21,128,61,1)", fontWeight: 800, fontSize: 14 },
  resultFail:   { display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 14, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", color: "rgba(185,28,28,1)", fontWeight: 800, fontSize: 14 },

  // quiz score
  scorePassed: { borderRadius: 18, background: "linear-gradient(135deg,rgba(34,197,94,0.10),rgba(0,180,180,0.10))", border: "1px solid rgba(34,197,94,0.25)", padding: "24px", textAlign: "center" },
  scoreFailed: { borderRadius: 18, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)", padding: "24px", textAlign: "center" },
  scoreNumber: { fontSize: 48, fontWeight: 950, color: "var(--cp-dark)", letterSpacing: "-2px", fontFamily: "'DM Serif Display', serif" },
  scoreLabel:  { fontSize: 15, fontWeight: 700, color: "rgba(10,22,40,0.65)", marginTop: 6 },

  // nav
  navRow:   { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 },
  prevBtn:  { display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.12)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 14, color: "rgba(10,22,40,0.72)" },
  nextBtn:  { marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "none", background: "var(--cp-blue)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 14, boxShadow: "0 6px 20px rgba(46,171,254,0.28)" },
  nextBtnDim:{ opacity: 0.5, cursor: "not-allowed", boxShadow: "none" },
  retryBtn: { marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "none", background: "rgba(239,68,68,0.90)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 14 },
  finishBtn:{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#22C55E,#00B4B4)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 14, boxShadow: "0 6px 20px rgba(34,197,94,0.30)" },

  // completion screen
  completionWrap: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "linear-gradient(135deg,#0a1628 0%,#0d2a4a 100%)" },
  completionCard: { background: "#fff", borderRadius: 28, padding: "48px 40px", maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 40px 100px rgba(0,0,0,0.35)" },
  completionStars:{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 },
  completionBadge:{ width: 80, height: 80, borderRadius: "50%", background: "rgba(245,158,11,0.12)", border: "2px solid rgba(245,158,11,0.30)", display: "grid", placeItems: "center", margin: "0 auto 22px" },
  completionTitle:{ fontSize: 30, fontWeight: 950, color: "var(--cp-dark)", letterSpacing: "-0.5px", marginBottom: 10, fontFamily: "'DM Serif Display', serif" },
  completionSub:  { fontSize: 15, color: "rgba(10,22,40,0.55)", fontWeight: 600, marginBottom: 8 },
  completionCourseName: { fontSize: 17, fontWeight: 800, color: "var(--cp-dark)", padding: "12px 20px", borderRadius: 14, background: "rgba(46,171,254,0.07)", border: "1px solid rgba(46,171,254,0.18)", marginBottom: 22 },
  completionMeta: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 },
  completionMetaItem: { fontSize: 14, fontWeight: 700, color: "rgba(21,128,61,1)" },
  completionActions:  { display: "grid", gap: 10 },
  completionPrimary:  { width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "var(--cp-blue)", color: "#fff", cursor: "pointer", fontWeight: 950, fontSize: 15, boxShadow: "0 8px 24px rgba(46,171,254,0.28)" },
  completionSecondary:{ width: "100%", padding: "14px", borderRadius: 14, border: "1px solid rgba(2,8,23,0.12)", background: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 15, color: "rgba(10,22,40,0.72)" },
};

export default CoursePortal;