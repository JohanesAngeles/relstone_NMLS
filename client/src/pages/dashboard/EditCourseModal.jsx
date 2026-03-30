import { useState, useEffect, useRef } from "react";
import API from "../../api/axios";
import {
  X, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp,
  BookOpen, FileText, HelpCircle, Award,
  CheckCircle, AlertCircle, Loader,
  Eye, Save, Info, Lock,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════════ */
const uid = () => Math.random().toString(36).slice(2, 9);

const emptyQuestion = () => ({
  _key: uid(), number: "", question: "",
  options: ["", "", "", ""], correct_index: 0, explanation: "", _open: true,
});

const emptyModule = (order) => ({
  _key: uid(), order, title: "", credit_hours: 0,
  pdf_url: "", video_url: "", show_pdf_before_quiz: false,
  sections: [""], quiz: [], _open: true,
});

const hydrateQuestion = (q) => ({
  _key:          uid(),
  number:        q.number        ?? "",
  question:      q.question      ?? "",
  options:       q.options?.length === 4 ? [...q.options] : ["", "", "", ""],
  correct_index: q.correct_index ?? 0,
  explanation:   q.explanation   ?? "",
  _open:         !!(q.question),
});

const hydrateModule = (m, idx) => ({
  _key:                 uid(),
  order:                m.order                ?? idx + 1,
  title:                m.title                ?? "",
  credit_hours:         m.credit_hours         ?? 0,
  pdf_url:              m.pdf_url              ?? "",
  video_url:            m.video_url            ?? "",
  show_pdf_before_quiz: m.show_pdf_before_quiz ?? false,
  sections:             m.sections?.length ? [...m.sections] : [""],
  quiz:                 (m.quiz || []).map(hydrateQuestion),
  _open:                !!(m.title),
});

const hydrateFinalExam = (fe) => ({
  title:              fe?.title              ?? "",
  passing_score:      fe?.passing_score      ?? 70,
  time_limit_minutes: fe?.time_limit_minutes ?? 90,
  questions:          (fe?.questions     || []).map(hydrateQuestion),
  question_bank:      (fe?.question_bank || []).map(hydrateQuestion),
});

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════ */
export default function EditCourseModal({ course, onClose, onSaved }) {
  const [step, setStep]           = useState(1);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [examTab, setExamTab]     = useState("official");
  const [meta, setMeta]           = useState({});
  const [modules, setModules]     = useState([]);
  const [finalExam, setFinalExam] = useState(hydrateFinalExam(null));

  // Track which steps the user actually navigated to.
  // Only those steps will be included in the save payload,
  // so untouched sections are NEVER overwritten.
  const visitedSteps = useRef(new Set([1]));

  useEffect(() => {
    if (!course) return;
    setStep(1);
    setExamTab("official");
    visitedSteps.current = new Set([1]); // reset on every open

    setMeta({
      title:           course.title           ?? "",
      nmls_course_id:  course.nmls_course_id  ?? "",
      type:            course.type            ?? "CE",
      credit_hours:    course.credit_hours    ?? "",
      description:     course.description     ?? "",
      price:           course.price           ?? "",
      states_approved: (course.states_approved || []).join(", "),
      has_textbook:    course.has_textbook     ?? false,
      textbook_price:  course.textbook_price   ?? "",
      is_active:       course.is_active        !== false,
      pdf_url:         course.pdf_url          ?? "",
      video_url:       course.video_url        ?? "",
    });
    setModules(
      course.modules?.length
        ? course.modules.map(hydrateModule)
        : [emptyModule(1)]
    );
    setFinalExam(hydrateFinalExam(course.final_exam));
  }, [course]);

  if (!course) return null;

  // Use this instead of setStep everywhere so we track visits
  const goToStep = (n) => {
    visitedSteps.current.add(n);
    setStep(n);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Meta ── */
  const setMetaField = (k, v) => setMeta((m) => ({ ...m, [k]: v }));

  /* ── Modules ── */
  const addModule            = ()                  => setModules((ms) => [...ms, emptyModule(ms.length + 1)]);
  const removeModule         = (key)               => setModules((ms) => ms.filter((m) => m._key !== key).map((m, i) => ({ ...m, order: i + 1 })));
  const updateModule         = (key, field, val)   => setModules((ms) => ms.map((m) => m._key === key ? { ...m, [field]: val } : m));
  const toggleModule         = (key)               => setModules((ms) => ms.map((m) => m._key === key ? { ...m, _open: !m._open } : m));
  const addSection           = (mkey)              => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, sections: [...m.sections, ""] } : m));
  const updateSection        = (mkey, idx, val)    => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, sections: m.sections.map((s, i) => i === idx ? val : s) } : m));
  const removeSection        = (mkey, idx)         => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, sections: m.sections.filter((_, i) => i !== idx) } : m));
  const addQuizQuestion      = (mkey)              => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, quiz: [...m.quiz, { ...emptyQuestion(), number: m.quiz.length + 1 }] } : m));
  const toggleQuizQuestion   = (mkey, qkey)        => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, quiz: m.quiz.map((q) => q._key === qkey ? { ...q, _open: !q._open } : q) } : m));
  const updateQuizQuestion   = (mkey, qkey, f, v)  => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, quiz: m.quiz.map((q) => q._key === qkey ? { ...q, [f]: v } : q) } : m));
  const updateQuizOption     = (mkey, qkey, oi, v) => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, quiz: m.quiz.map((q) => q._key === qkey ? { ...q, options: q.options.map((o, i) => i === oi ? v : o) } : q) } : m));
  const removeQuizQuestion   = (mkey, qkey)        => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, quiz: m.quiz.filter((q) => q._key !== qkey).map((q, i) => ({ ...q, number: i + 1 })) } : m));
  const collapseAllQuestions = (mkey)              => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, quiz: m.quiz.map((q) => ({ ...q, _open: false })) } : m));
  const expandAllQuestions   = (mkey)              => setModules((ms) => ms.map((m) => m._key === mkey ? { ...m, quiz: m.quiz.map((q) => ({ ...q, _open: true })) } : m));

  /* ── Final Exam ── */
  const toggleExamQuestion       = (bank, qkey)        => { const l = bank ? "question_bank" : "questions"; setFinalExam((e) => ({ ...e, [l]: e[l].map((q) => q._key === qkey ? { ...q, _open: !q._open } : q) })); };
  const collapseAllExamQuestions = (bank)              => { const l = bank ? "question_bank" : "questions"; setFinalExam((e) => ({ ...e, [l]: e[l].map((q) => ({ ...q, _open: false })) })); };
  const expandAllExamQuestions   = (bank)              => { const l = bank ? "question_bank" : "questions"; setFinalExam((e) => ({ ...e, [l]: e[l].map((q) => ({ ...q, _open: true })) })); };
  const updateExam               = (field, val)        => setFinalExam((e) => ({ ...e, [field]: val }));
  const addExamQuestion          = (bank = false)      => { const l = bank ? "question_bank" : "questions"; setFinalExam((e) => ({ ...e, [l]: [...e[l], { ...emptyQuestion(), number: e[l].length + 1 }] })); };
  const updateExamQuestion       = (bank, qkey, f, v)  => { const l = bank ? "question_bank" : "questions"; setFinalExam((e) => ({ ...e, [l]: e[l].map((q) => q._key === qkey ? { ...q, [f]: v } : q) })); };
  const updateExamOption         = (bank, qkey, oi, v) => { const l = bank ? "question_bank" : "questions"; setFinalExam((e) => ({ ...e, [l]: e[l].map((q) => q._key === qkey ? { ...q, options: q.options.map((o, i) => i === oi ? v : o) } : q) })); };
  const removeExamQuestion       = (bank, qkey)        => { const l = bank ? "question_bank" : "questions"; setFinalExam((e) => ({ ...e, [l]: e[l].filter((q) => q._key !== qkey).map((q, i) => ({ ...q, number: i + 1 })) })); };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setSaving(true);
    try {
      const cleanQ = ({ _key, _open, ...q }) => ({
        number:        Number(q.number) || 0,
        question:      q.question,
        options:       q.options,
        correct_index: Number(q.correct_index),
        explanation:   q.explanation || undefined,
      });

      // ✅ Step 1 (Course Info) is ALWAYS sent
      const payload = {
        title:           meta.title,
        type:            meta.type,
        credit_hours:    Number(meta.credit_hours),
        description:     meta.description,
        price:           Number(meta.price),
        textbook_price:  Number(meta.textbook_price) || 0,
        has_textbook:    meta.has_textbook,
        is_active:       meta.is_active,
        pdf_url:         meta.pdf_url,
        video_url:       meta.video_url,
        states_approved: meta.states_approved
          ? meta.states_approved.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
          : [],
      };

      // ✅ Step 2 (Modules) only sent if user navigated to it
      if (visitedSteps.current.has(2)) {
        payload.modules = modules.map(({ _key, _open, ...m }) => ({
          ...m,
          sections: m.sections.filter(Boolean),
          quiz:     m.quiz.map(cleanQ),
        }));
      }

      // ✅ Step 3 (Final Exam) only sent if user navigated to it
      if (visitedSteps.current.has(3)) {
        payload.final_exam = {
          title:              finalExam.title || `${meta.title} — Final Exam`,
          passing_score:      Number(finalExam.passing_score),
          time_limit_minutes: Number(finalExam.time_limit_minutes),
          questions:          finalExam.questions.map(cleanQ),
          question_bank:      finalExam.question_bank.map(cleanQ),
        };
      }

      const res = await API.put(`/courses/${course._id}`, payload);
      showToast("Course updated successfully!", "success");
      setTimeout(() => { onSaved(res.data); onClose(); }, 1200);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update course.", "error");
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return meta.title && meta.nmls_course_id && meta.type && meta.credit_hours && meta.price;
    if (step === 2) return modules.every((m) => m.title);
    return true;
  };

  const visited = visitedSteps.current; // shorthand for render

  return (
    <>
      <style>{css}</style>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(9,25,37,0.60)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 401, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 900, maxHeight: "calc(100vh - 32px)", display: "flex", flexDirection: "column", background: "#f6f7fb", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(9,25,37,0.28), 0 0 0 1px rgba(9,25,37,0.08)", pointerEvents: "all", position: "relative" }}>

          {toast && (
            <div style={{ position: "absolute", top: 16, right: 16, zIndex: 999, display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 12, background: toast.type === "error" ? "#ef4444" : "#00B4B4", color: "#fff", fontWeight: 800, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,0.18)" }}>
              {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
              {toast.msg}
            </div>
          )}

          {/* Top bar */}
          <header style={S.topbar}>
            <div style={S.topbarInner}>
              <button style={S.backBtn} onClick={onClose} type="button"><X size={14} /> Close</button>
              <div style={S.topbarTitle}>
                Edit Course
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.42)", marginLeft: 10, fontFamily: "monospace" }}>{course.nmls_course_id}</span>
              </div>
              <div style={S.stepIndicator}>
                {["Course Info", "Modules", "Final Exam", "Review"].map((label, i) => (
                  <div key={i} style={S.stepItem} onClick={() => goToStep(i + 1)}>
                    <div style={{ ...S.stepDot, ...(step === i + 1 ? S.stepDotActive : step > i + 1 ? S.stepDotDone : {}) }}>
                      {step > i + 1 ? <CheckCircle size={12} /> : i + 1}
                    </div>
                    <span style={{ ...S.stepLabel, color: step === i + 1 ? "#00B4B4" : step > i + 1 ? "rgba(11,18,32,0.70)" : "rgba(11,18,32,0.35)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Visited-step bar — shows user what will be saved */}
          <div style={S.visitedBar}>
            <span style={S.visitedLabel}>Will update:</span>
            {[{ n: 1, label: "Course Info" }, { n: 2, label: "Modules" }, { n: 3, label: "Final Exam" }].map(({ n, label }) => (
              <span key={n} style={{ ...S.visitedBadge, ...(visited.has(n) ? S.visitedOn : S.visitedOff) }}>
                {visited.has(n) ? "✓" : "—"} {label}
              </span>
            ))}
            <span style={S.visitedHint}>Sections you never open stay untouched in the database</span>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 20px" }}>

            {step === 1 && (
              <Section icon={<BookOpen size={16} />} title="Course Information" subtitle="Basic details about the course">
                <div style={S.grid2}>
                  <Field label="Course Title *" span={2}>
                    <input style={S.input} placeholder="e.g. 11-HOUR NY SAFE…" value={meta.title} onChange={(e) => setMetaField("title", e.target.value)} />
                  </Field>
                  <Field label="NMLS Course ID (locked)">
                    <div style={S.lockedField}>
                      <Lock size={12} style={{ color: "rgba(11,18,32,0.32)", flexShrink: 0 }} />
                      <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.55)" }}>{meta.nmls_course_id || "—"}</span>
                      <span style={S.readOnlyBadge}>READ-ONLY</span>
                    </div>
                  </Field>
                  <Field label="Course Type *">
                    <select style={S.input} value={meta.type} onChange={(e) => setMetaField("type", e.target.value)}>
                      <option value="CE">CE — Continuing Education</option>
                      <option value="PE">PE — Pre-Licensing Education</option>
                    </select>
                  </Field>
                  <Field label="Total Credit Hours *">
                    <input style={S.input} type="number" min="0" value={meta.credit_hours} onChange={(e) => setMetaField("credit_hours", e.target.value)} />
                  </Field>
                  <Field label="Price ($) *">
                    <input style={S.input} type="number" min="0" value={meta.price} onChange={(e) => setMetaField("price", e.target.value)} />
                  </Field>
                  <Field label="States Approved (comma-separated)">
                    <input style={S.input} placeholder="e.g. NY, CA, FL" value={meta.states_approved} onChange={(e) => setMetaField("states_approved", e.target.value)} />
                  </Field>
                  <Field label="Description" span={2}>
                    <textarea style={{ ...S.input, minHeight: 90, resize: "vertical" }} value={meta.description} onChange={(e) => setMetaField("description", e.target.value)} />
                  </Field>
                  <Field label="Course-Level PDF URL">
                    <input style={S.input} placeholder="https://dropbox.com/…?raw=1" value={meta.pdf_url} onChange={(e) => setMetaField("pdf_url", e.target.value)} />
                  </Field>
                  <Field label="Course-Level Video URL">
                    <input style={S.input} placeholder="https://drive.google.com/…" value={meta.video_url} onChange={(e) => setMetaField("video_url", e.target.value)} />
                  </Field>
                </div>
                <div style={S.grid3} className="ecm-mt16">
                  <label style={S.toggle}>
                    <input type="checkbox" checked={meta.has_textbook} onChange={(e) => setMetaField("has_textbook", e.target.checked)} style={{ accentColor: "#00B4B4" }} />
                    <span style={S.toggleLabel}>Has Textbook</span>
                  </label>
                  {meta.has_textbook && (
                    <Field label="Textbook Price ($)">
                      <input style={S.input} type="number" min="0" value={meta.textbook_price} onChange={(e) => setMetaField("textbook_price", e.target.value)} />
                    </Field>
                  )}
                  <label style={S.toggle}>
                    <input type="checkbox" checked={meta.is_active} onChange={(e) => setMetaField("is_active", e.target.checked)} style={{ accentColor: "#00B4B4" }} />
                    <span style={S.toggleLabel}>Active (visible to students)</span>
                  </label>
                </div>
                <InfoBox>The <strong>NMLS Course ID</strong> is locked and cannot be changed after course creation.</InfoBox>
              </Section>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <SectionHeader icon={<BookOpen size={16} />} title="Modules" subtitle={`${modules.length} module${modules.length !== 1 ? "s" : ""} · Each module is a Lesson step + optional Checkpoint quiz`} />
                {modules.map((mod, mIdx) => (
                  <ModuleCard
                    key={mod._key} mod={mod} mIdx={mIdx} total={modules.length}
                    onToggle={() => toggleModule(mod._key)}
                    onRemove={() => removeModule(mod._key)}
                    onUpdate={(f, v) => updateModule(mod._key, f, v)}
                    onAddSection={() => addSection(mod._key)}
                    onUpdateSection={(i, v) => updateSection(mod._key, i, v)}
                    onRemoveSection={(i) => removeSection(mod._key, i)}
                    onAddQuestion={() => addQuizQuestion(mod._key)}
                    onToggleQuestion={(qk) => toggleQuizQuestion(mod._key, qk)}
                    onUpdateQuestion={(qk, f, v) => updateQuizQuestion(mod._key, qk, f, v)}
                    onUpdateOption={(qk, oi, v) => updateQuizOption(mod._key, qk, oi, v)}
                    onRemoveQuestion={(qk) => removeQuizQuestion(mod._key, qk)}
                    onCollapseAll={() => collapseAllQuestions(mod._key)}
                    onExpandAll={() => expandAllQuestions(mod._key)}
                  />
                ))}
                <button style={S.addModuleBtn} type="button" onClick={addModule}><Plus size={15} /> Add Module</button>
                <InfoBox>Leave the quiz empty on the last module to skip the checkpoint and go straight to the Final Exam.</InfoBox>
              </div>
            )}

            {step === 3 && (
              <Section icon={<Award size={16} />} title="Final Exam" subtitle="Official question set (Attempt 1) + retry bank (Attempt 2+)">
                <div style={S.grid3}>
                  <Field label="Exam Title">
                    <input style={S.input} placeholder="Leave blank to auto-generate" value={finalExam.title} onChange={(e) => updateExam("title", e.target.value)} />
                  </Field>
                  <Field label="Passing Score (%)">
                    <input style={S.input} type="number" min="0" max="100" value={finalExam.passing_score} onChange={(e) => updateExam("passing_score", e.target.value)} />
                  </Field>
                  <Field label="Time Limit (minutes)">
                    <input style={S.input} type="number" min="0" value={finalExam.time_limit_minutes} onChange={(e) => updateExam("time_limit_minutes", e.target.value)} />
                  </Field>
                </div>
                <div style={S.tabs}>
                  <button type="button" style={{ ...S.tab, ...(examTab === "official" ? S.tabActive : {}) }} onClick={() => setExamTab("official")}>
                    <FileText size={13} /> Official Set ({finalExam.questions.length} Qs)
                    <span style={{ ...S.tabBadge, background: examTab === "official" ? "rgba(0,180,180,0.15)" : "rgba(2,8,23,0.07)" }}>Attempt 1</span>
                  </button>
                  <button type="button" style={{ ...S.tab, ...(examTab === "bank" ? S.tabActive : {}) }} onClick={() => setExamTab("bank")}>
                    <HelpCircle size={13} /> Question Bank ({finalExam.question_bank.length} Qs)
                    <span style={{ ...S.tabBadge, background: examTab === "bank" ? "rgba(0,180,180,0.15)" : "rgba(2,8,23,0.07)" }}>Retry Pool</span>
                  </button>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                    <button type="button" style={S.bulkBtn} onClick={() => expandAllExamQuestions(examTab === "bank")}>Expand All</button>
                    <button type="button" style={S.bulkBtn} onClick={() => collapseAllExamQuestions(examTab === "bank")}>Collapse All</button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(examTab === "official" ? finalExam.questions : finalExam.question_bank).map((q, qi) => (
                    <QuestionCard
                      key={q._key} q={q} qi={qi}
                      onToggle={() => toggleExamQuestion(examTab === "bank", q._key)}
                      onUpdate={(f, v) => updateExamQuestion(examTab === "bank", q._key, f, v)}
                      onUpdateOption={(oi, v) => updateExamOption(examTab === "bank", q._key, oi, v)}
                      onRemove={() => removeExamQuestion(examTab === "bank", q._key)}
                    />
                  ))}
                  <button style={S.addQBtn} type="button" onClick={() => addExamQuestion(examTab === "bank")}>
                    <Plus size={14} /> Add Question to {examTab === "official" ? "Official Set" : "Question Bank"}
                  </button>
                </div>
                <InfoBox><strong>Retry Logic:</strong> Attempt 1 serves the <em>Official Set</em>. Attempts 2+ shuffle the <em>Question Bank</em> and slice 35 random questions.</InfoBox>
              </Section>
            )}

            {step === 4 && (
              <Section icon={<Eye size={16} />} title="Review & Save" subtitle="Only visited sections will be saved — unvisited sections stay exactly as-is in the database">
                <ReviewPanel
                  meta={meta} modules={modules} finalExam={finalExam}
                  visited={visited}
                  onJumpToModule={() => goToStep(2)}
                  onJumpToExam={() => goToStep(3)}
                />
              </Section>
            )}
          </div>

          {/* Footer */}
          <div style={{ background: "#fff", borderTop: "1px solid rgba(2,8,23,0.08)", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {step > 1 && (
              <button style={S.prevBtn} type="button" onClick={() => goToStep(step - 1)}>
                <ArrowLeft size={14} /> Previous
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 4 ? (
              <button style={{ ...S.nextBtn, opacity: canProceed() ? 1 : 0.45 }} disabled={!canProceed()} type="button" onClick={() => goToStep(step + 1)}>
                Next Step →
              </button>
            ) : (
              <button style={S.submitBtn} type="button" onClick={handleSubmit} disabled={saving}>
                {saving ? <><Loader size={14} className="ecm-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MODULE CARD
════════════════════════════════════════════════════════════════════ */
function ModuleCard({ mod, mIdx, total, onToggle, onRemove, onUpdate, onAddSection, onUpdateSection, onRemoveSection, onAddQuestion, onToggleQuestion, onUpdateQuestion, onUpdateOption, onRemoveQuestion, onCollapseAll, onExpandAll }) {
  const isFinalReview = mod.quiz.length === 0 && mod.order === total;
  return (
    <div style={S.moduleCard}>
      <div style={S.moduleCardHeader} onClick={onToggle}>
        <div style={S.moduleCardLeft}>
          <div style={S.moduleOrderBadge}><span style={{ fontSize: 10, fontWeight: 900, color: "#00B4B4" }}>M{mod.order}</span></div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: "rgba(11,18,32,0.88)" }}>{mod.title || <span style={{ opacity: 0.4 }}>Untitled Module</span>}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.40)", marginTop: 2 }}>
              {mod.credit_hours}h · {mod.quiz.length} quiz Qs · {mod.sections.filter(Boolean).length} sections
              {isFinalReview && <span style={{ marginLeft: 8, color: "#F59E0B" }}>⏭ No checkpoint (→ Final Exam)</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" style={S.iconBtn} onClick={(e) => { e.stopPropagation(); onRemove(); }}><Trash2 size={13} style={{ color: "#ef4444" }} /></button>
          {mod._open ? <ChevronUp size={15} style={{ color: "rgba(11,18,32,0.40)" }} /> : <ChevronDown size={15} style={{ color: "rgba(11,18,32,0.40)" }} />}
        </div>
      </div>
      {mod._open && (
        <div style={S.moduleCardBody}>
          <div style={S.grid2}>
            <Field label="Module Title *"><input style={S.input} placeholder="e.g. Federal Mortgage Law" value={mod.title} onChange={(e) => onUpdate("title", e.target.value)} /></Field>
            <Field label="Credit Hours"><input style={S.input} type="number" min="0" value={mod.credit_hours} onChange={(e) => onUpdate("credit_hours", Number(e.target.value))} /></Field>
            <Field label="PDF URL (overrides course-level)"><input style={S.input} placeholder="Leave blank to inherit" value={mod.pdf_url} onChange={(e) => onUpdate("pdf_url", e.target.value)} /></Field>
            <Field label="Video URL (overrides course-level)"><input style={S.input} placeholder="Leave blank to inherit" value={mod.video_url} onChange={(e) => onUpdate("video_url", e.target.value)} /></Field>
          </div>
          <label style={{ ...S.toggle, marginTop: 8 }}>
            <input type="checkbox" checked={mod.show_pdf_before_quiz} onChange={(e) => onUpdate("show_pdf_before_quiz", e.target.checked)} style={{ accentColor: "#00B4B4" }} />
            <span style={S.toggleLabel}>Gate quiz behind PDF review</span>
          </label>
          <div style={{ marginTop: 16 }}>
            <div style={S.subLabel}><FileText size={13} /> Sections / Table of Contents</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {mod.sections.map((s, si) => (
                <div key={si} style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...S.input, flex: 1 }} placeholder={`e.g. ${mIdx + 1}.${si + 1} Section Title`} value={s} onChange={(e) => onUpdateSection(si, e.target.value)} />
                  <button type="button" style={S.iconBtn} onClick={() => onRemoveSection(si)}><X size={13} style={{ color: "#ef4444" }} /></button>
                </div>
              ))}
              <button type="button" style={S.addSmallBtn} onClick={onAddSection}><Plus size={12} /> Add Section</button>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ ...S.subLabel, marginBottom: 0, flex: 1 }}><HelpCircle size={13} /> Checkpoint Quiz ({mod.quiz.length} questions)</div>
              {mod.quiz.length > 1 && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" style={S.bulkBtn} onClick={(e) => { e.stopPropagation(); onExpandAll(); }}>Expand All</button>
                  <button type="button" style={S.bulkBtn} onClick={(e) => { e.stopPropagation(); onCollapseAll(); }}>Collapse All</button>
                </div>
              )}
            </div>
            {mod.quiz.length === 0 && <div style={S.emptyHint}>No quiz — this module will skip the checkpoint step.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mod.quiz.map((q, qi) => (
                <QuestionCard key={q._key} q={q} qi={qi}
                  onToggle={() => onToggleQuestion(q._key)}
                  onUpdate={(f, v) => onUpdateQuestion(q._key, f, v)}
                  onUpdateOption={(oi, v) => onUpdateOption(q._key, oi, v)}
                  onRemove={() => onRemoveQuestion(q._key)}
                />
              ))}
              <button type="button" style={S.addSmallBtn} onClick={onAddQuestion}><Plus size={12} /> Add Quiz Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   QUESTION CARD
════════════════════════════════════════════════════════════════════ */
function QuestionCard({ q, qi, onToggle, onUpdate, onUpdateOption, onRemove }) {
  return (
    <div style={S.questionCard}>
      <div style={S.questionHeader} onClick={onToggle}>
        <div style={S.questionNum}>Q{qi + 1}</div>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: q.question ? "rgba(11,18,32,0.82)" : "rgba(11,18,32,0.35)" }}>{q.question || "Click to add question text…"}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {q.correct_index != null && q.options[q.correct_index] && <span style={S.correctBadge}>✓ {String.fromCharCode(65 + Number(q.correct_index))}</span>}
          <button type="button" style={S.iconBtn} onClick={(e) => { e.stopPropagation(); onRemove(); }}><Trash2 size={12} style={{ color: "#ef4444" }} /></button>
          {q._open ? <ChevronUp size={13} style={{ color: "rgba(11,18,32,0.35)" }} /> : <ChevronDown size={13} style={{ color: "rgba(11,18,32,0.35)" }} />}
        </div>
      </div>
      {q._open && (
        <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea style={{ ...S.input, minHeight: 60, resize: "vertical" }} placeholder="Enter question text…" value={q.question} onChange={(e) => onUpdate("question", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {q.options.map((opt, oi) => (
              <div key={oi} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="radio" name={`correct_${q._key}`} checked={Number(q.correct_index) === oi} onChange={() => onUpdate("correct_index", oi)} style={{ accentColor: "#00B4B4", flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 900, color: Number(q.correct_index) === oi ? "#00B4B4" : "rgba(11,18,32,0.40)", minWidth: 16 }}>{String.fromCharCode(65 + oi)}</span>
                <input style={{ ...S.input, flex: 1, padding: "7px 10px", fontSize: 12 }} placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={(e) => onUpdateOption(oi, e.target.value)} />
              </div>
            ))}
          </div>
          <Field label="Explanation (optional)">
            <input style={{ ...S.input, fontSize: 12 }} placeholder="Why is this the correct answer?" value={q.explanation} onChange={(e) => onUpdate("explanation", e.target.value)} />
          </Field>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   REVIEW PANEL
════════════════════════════════════════════════════════════════════ */
function ReviewPanel({ meta, modules, finalExam, visited, onJumpToModule, onJumpToExam }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={S.saveNotice}>
        <Info size={14} style={{ color: "#2EABFE", flexShrink: 0 }} />
        <span>
          <strong>Only sections you opened will be saved.</strong>{" "}
          {!visited.has(2) && !visited.has(3) && "Only Course Info will be updated — Modules and Final Exam stay untouched."}
          {visited.has(2)  && !visited.has(3) && "Course Info + Modules will be updated — Final Exam stays untouched."}
          {!visited.has(2) && visited.has(3)  && "Course Info + Final Exam will be updated — Modules stay untouched."}
          {visited.has(2)  && visited.has(3)  && "All sections will be updated."}
        </span>
      </div>

      <div style={S.reviewBlock}>
        <div style={S.reviewBlockTitle}>✓ Course Info — will be saved</div>
        <div style={S.reviewGrid}>
          <Pill label="Title"        value={meta.title || "—"} />
          <Pill label="NMLS ID"      value={meta.nmls_course_id || "—"} />
          <Pill label="Type"         value={meta.type} />
          <Pill label="Credit Hours" value={meta.credit_hours || "—"} />
          <Pill label="Price"        value={meta.price ? `$${meta.price}` : "—"} />
          <Pill label="States"       value={meta.states_approved || "—"} />
          <Pill label="Active"       value={meta.is_active ? "Yes" : "No"} />
        </div>
      </div>

      <div style={{ ...S.reviewBlock, opacity: visited.has(2) ? 1 : 0.5 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <div style={{ ...S.reviewBlockTitle, marginBottom: 0, flex: 1 }}>
            {visited.has(2) ? "✓ Modules — will be saved" : "— Modules — NOT opened, will keep existing data"}
          </div>
          <button type="button" style={S.jumpBtn} onClick={onJumpToModule}>Edit Modules →</button>
        </div>
        {visited.has(2) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {modules.map((m, i) => {
              const ls = i * 2 + 1;
              return (
                <div key={m._key}>
                  <div style={S.reviewStep}><span style={S.reviewStepNum}>Step {ls}</span><span style={S.reviewStepIcon}>📄</span><span style={{ fontWeight: 700, fontSize: 13 }}>Lesson — {m.title || "Untitled"}</span><span style={S.reviewStepMeta}>{m.credit_hours}h</span></div>
                  <div style={S.reviewStep}><span style={S.reviewStepNum}>Step {ls + 1}</span><span style={S.reviewStepIcon}>{m.quiz.length > 0 ? "📋" : "⏭"}</span><span style={{ fontWeight: 700, fontSize: 13, color: m.quiz.length > 0 ? "inherit" : "rgba(11,18,32,0.45)" }}>{m.quiz.length > 0 ? `Checkpoint — ${m.quiz.length} questions` : "No Checkpoint"}</span></div>
                </div>
              );
            })}
            <div style={S.reviewStep}><span style={S.reviewStepNum}>Step {modules.length * 2 + 1}</span><span style={S.reviewStepIcon}>🏆</span><span style={{ fontWeight: 700, fontSize: 13 }}>Final Exam</span></div>
          </div>
        )}
      </div>

      <div style={{ ...S.reviewBlock, opacity: visited.has(3) ? 1 : 0.5 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <div style={{ ...S.reviewBlockTitle, marginBottom: 0, flex: 1 }}>
            {visited.has(3) ? "✓ Final Exam — will be saved" : "— Final Exam — NOT opened, will keep existing data"}
          </div>
          <button type="button" style={S.jumpBtn} onClick={onJumpToExam}>Edit Final Exam →</button>
        </div>
        {visited.has(3) && (
          <div style={S.reviewGrid}>
            <Pill label="Passing Score" value={`${finalExam.passing_score}%`} />
            <Pill label="Time Limit"    value={`${finalExam.time_limit_minutes} min`} />
            <Pill label="Official Set"  value={`${finalExam.questions.length} questions`} />
            <Pill label="Question Bank" value={`${finalExam.question_bank.length} questions`} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SMALL COMPONENTS
════════════════════════════════════════════════════════════════════ */
const Section       = ({ icon, title, subtitle, children }) => (<div style={S.section}><SectionHeader icon={icon} title={title} subtitle={subtitle} />{children}</div>);
const SectionHeader = ({ icon, title, subtitle }) => (<div style={S.sectionHeader}><div style={S.sectionIcon}>{icon}</div><div><div style={S.sectionTitle}>{title}</div>{subtitle && <div style={S.sectionSubtitle}>{subtitle}</div>}</div></div>);
const Field         = ({ label, children, span }) => (<div style={{ gridColumn: span === 2 ? "1 / -1" : undefined }}><label style={S.label}>{label}</label>{children}</div>);
const InfoBox       = ({ children }) => (<div style={S.infoBox}><Info size={14} style={{ color: "#2EABFE", flexShrink: 0, marginTop: 1 }} /><span style={{ fontSize: 12, fontWeight: 600, color: "rgba(11,18,32,0.65)" }}>{children}</span></div>);
const Pill          = ({ label, value }) => (<div style={S.pill}><div style={S.pillLabel}>{label}</div><div style={S.pillValue}>{value}</div></div>);

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; }
.ecm-mt16 { margin-top: 16px; }
.ecm-spin { animation: ecm-spin 1s linear infinite; }
@keyframes ecm-spin { to { transform: rotate(360deg); } }
`;

const S = {
  topbar:          { background: "#fff", borderBottom: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 2px 12px rgba(2,8,23,0.05)", flexShrink: 0 },
  topbarInner:     { padding: "12px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
  backBtn:         { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 999, border: "1px solid rgba(0,180,180,0.28)", background: "rgba(0,180,180,0.07)", color: "#00B4B4", cursor: "pointer", fontWeight: 900, fontSize: 12, flexShrink: 0, fontFamily: "inherit" },
  topbarTitle:     { fontWeight: 950, fontSize: 15, color: "rgba(11,18,32,0.85)", flex: 1, display: "flex", alignItems: "center" },
  stepIndicator:   { display: "flex", alignItems: "center", gap: 20 },
  stepItem:        { display: "flex", alignItems: "center", gap: 7, cursor: "pointer" },
  stepDot:         { width: 24, height: 24, borderRadius: "50%", background: "rgba(2,8,23,0.07)", border: "1.5px solid rgba(2,8,23,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "rgba(11,18,32,0.38)" },
  stepDotActive:   { background: "#00B4B4", borderColor: "#00B4B4", color: "#fff" },
  stepDotDone:     { background: "rgba(0,180,180,0.12)", borderColor: "rgba(0,180,180,0.35)", color: "#00B4B4" },
  stepLabel:       { fontSize: 12, fontWeight: 800 },
  visitedBar:      { display: "flex", alignItems: "center", gap: 8, padding: "6px 20px", background: "rgba(0,180,180,0.035)", borderBottom: "1px solid rgba(0,180,180,0.10)", flexWrap: "wrap" },
  visitedLabel:    { fontSize: 10, fontWeight: 900, color: "rgba(11,18,32,0.40)", textTransform: "uppercase", letterSpacing: "0.5px" },
  visitedBadge:    { fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 999 },
  visitedOn:       { background: "rgba(0,180,180,0.12)", color: "#00B4B4", border: "1px solid rgba(0,180,180,0.28)" },
  visitedOff:      { background: "rgba(2,8,23,0.04)", color: "rgba(11,18,32,0.32)", border: "1px solid rgba(2,8,23,0.09)" },
  visitedHint:     { fontSize: 11, fontWeight: 600, color: "rgba(11,18,32,0.35)", marginLeft: "auto" },
  section:         { background: "#fff", borderRadius: 18, border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 4px 18px rgba(2,8,23,0.05)", padding: "24px 24px 28px", display: "flex", flexDirection: "column", gap: 16 },
  sectionHeader:   { display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 14, borderBottom: "1px solid rgba(2,8,23,0.07)", marginBottom: 4 },
  sectionIcon:     { width: 34, height: 34, borderRadius: 10, background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00B4B4", flexShrink: 0 },
  sectionTitle:    { fontWeight: 950, fontSize: 16, color: "rgba(11,18,32,0.88)" },
  sectionSubtitle: { fontSize: 12, fontWeight: 600, color: "rgba(11,18,32,0.48)", marginTop: 3 },
  grid2:           { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 18px" },
  grid3:           { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px 18px" },
  label:           { display: "block", fontSize: 11, fontWeight: 900, color: "rgba(11,18,32,0.55)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" },
  input:           { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(2,8,23,0.12)", background: "#fff", fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.85)", outline: "none", transition: "border-color .15s", fontFamily: "inherit" },
  toggle:          { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" },
  toggleLabel:     { fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.72)" },
  lockedField:     { display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 9, background: "rgba(2,8,23,0.03)", border: "1.5px solid rgba(2,8,23,0.08)" },
  readOnlyBadge:   { marginLeft: "auto", fontSize: 10, fontWeight: 900, color: "rgba(11,18,32,0.35)", background: "rgba(2,8,23,0.05)", padding: "2px 8px", borderRadius: 999, flexShrink: 0 },
  infoBox:         { display: "flex", gap: 10, padding: "11px 14px", borderRadius: 10, background: "rgba(46,171,254,0.07)", border: "1px solid rgba(46,171,254,0.18)", alignItems: "flex-start" },
  saveNotice:      { display: "flex", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(0,180,180,0.06)", border: "1.5px solid rgba(0,180,180,0.22)", alignItems: "flex-start", fontSize: 13, fontWeight: 600, color: "rgba(11,18,32,0.70)" },
  moduleCard:      { background: "#fff", borderRadius: 16, border: "1.5px solid rgba(2,8,23,0.09)", boxShadow: "0 2px 10px rgba(2,8,23,0.05)", overflow: "hidden" },
  moduleCardHeader:{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", background: "rgba(0,180,180,0.025)" },
  moduleCardLeft:  { display: "flex", alignItems: "center", gap: 12 },
  moduleOrderBadge:{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  moduleCardBody:  { padding: "16px 18px 18px", borderTop: "1px solid rgba(2,8,23,0.07)", display: "flex", flexDirection: "column", gap: 12 },
  subLabel:        { display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 900, color: "rgba(11,18,32,0.55)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.4px" },
  emptyHint:       { fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.38)", fontStyle: "italic", padding: "8px 0" },
  questionCard:    { background: "rgba(2,8,23,0.018)", borderRadius: 12, border: "1px solid rgba(2,8,23,0.08)", overflow: "hidden" },
  questionHeader:  { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer" },
  questionNum:     { width: 26, height: 26, borderRadius: 7, background: "rgba(0,180,180,0.12)", border: "1px solid rgba(0,180,180,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#00B4B4", flexShrink: 0 },
  correctBadge:    { fontSize: 10, fontWeight: 900, color: "rgba(22,163,74,1)", background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", padding: "2px 7px", borderRadius: 999 },
  tabs:            { display: "flex", gap: 6, borderBottom: "2px solid rgba(2,8,23,0.08)", paddingBottom: 0, marginBottom: 14, alignItems: "center" },
  tab:             { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: "10px 10px 0 0", border: "none", background: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.50)", borderBottom: "2px solid transparent", marginBottom: "-2px", fontFamily: "inherit" },
  tabActive:       { color: "#00B4B4", borderBottomColor: "#00B4B4", background: "rgba(0,180,180,0.05)" },
  tabBadge:        { fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 999, color: "rgba(11,18,32,0.55)" },
  bulkBtn:         { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 7, border: "1px solid rgba(2,8,23,0.12)", background: "#fff", color: "rgba(11,18,32,0.55)", cursor: "pointer", fontWeight: 800, fontSize: 11, fontFamily: "inherit" },
  addModuleBtn:    { display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "2px dashed rgba(0,180,180,0.35)", background: "rgba(0,180,180,0.04)", color: "#00B4B4", cursor: "pointer", fontWeight: 900, fontSize: 13, fontFamily: "inherit" },
  addQBtn:         { display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: "1.5px dashed rgba(0,180,180,0.30)", background: "rgba(0,180,180,0.03)", color: "#00B4B4", cursor: "pointer", fontWeight: 800, fontSize: 12, fontFamily: "inherit" },
  addSmallBtn:     { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, border: "1px dashed rgba(2,8,23,0.18)", background: "transparent", color: "rgba(11,18,32,0.55)", cursor: "pointer", fontWeight: 800, fontSize: 12, fontFamily: "inherit" },
  iconBtn:         { width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(2,8,23,0.10)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
  prevBtn:         { display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 20px", borderRadius: 999, border: "1.5px solid rgba(2,8,23,0.15)", background: "#fff", color: "rgba(11,18,32,0.65)", cursor: "pointer", fontWeight: 900, fontSize: 13, fontFamily: "inherit" },
  nextBtn:         { display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 28px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#00B4B4,#2EABFE)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 13, boxShadow: "0 4px 18px rgba(0,180,180,0.30)", transition: "opacity .2s", fontFamily: "inherit" },
  submitBtn:       { display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#00B4B4,#2EABFE)", color: "#fff", cursor: "pointer", fontWeight: 900, fontSize: 14, boxShadow: "0 4px 18px rgba(0,180,180,0.30)", fontFamily: "inherit" },
  reviewBlock:     { background: "rgba(2,8,23,0.018)", borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)", padding: "16px 18px" },
  reviewBlockTitle:{ fontSize: 12, fontWeight: 900, color: "rgba(11,18,32,0.55)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 },
  reviewGrid:      { display: "flex", flexWrap: "wrap", gap: 8 },
  reviewStep:      { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, background: "#fff", border: "1px solid rgba(2,8,23,0.07)", marginBottom: 4 },
  reviewStepNum:   { fontSize: 10, fontWeight: 900, color: "rgba(11,18,32,0.38)", minWidth: 44 },
  reviewStepIcon:  { fontSize: 15 },
  reviewStepMeta:  { fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.40)", marginLeft: "auto" },
  pill:            { padding: "8px 12px", borderRadius: 10, background: "#fff", border: "1px solid rgba(2,8,23,0.09)" },
  pillLabel:       { fontSize: 10, fontWeight: 900, color: "rgba(11,18,32,0.42)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 },
  pillValue:       { fontSize: 13, fontWeight: 800, color: "rgba(11,18,32,0.80)" },
  jumpBtn:         { fontSize: 11, fontWeight: 900, color: "#00B4B4", background: "rgba(0,180,180,0.08)", border: "1px solid rgba(0,180,180,0.25)", borderRadius: 7, padding: "5px 11px", cursor: "pointer", fontFamily: "inherit" },
};