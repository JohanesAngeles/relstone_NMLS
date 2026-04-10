import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import {
  ArrowLeft, User, Mail, Phone, MapPin, BookOpen,
  CheckCircle, Clock, Award, BarChart2, Calendar,
  FileText, Shield, UserCheck, UserX, RefreshCw,
  GraduationCap, TrendingUp, Hash, Target, Layers, Trash2, X,
} from "lucide-react";

/* ─── StudentDetail ──────────────────────────────────────────────── */
const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student,  setStudent]  = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [quizzes,  setQuizzes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [toggling,  setToggling] = useState(false);
  const [removingCourseId, setRemovingCourseId] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // { courseId, title }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [studentRes, courseRes] = await Promise.all([
          API.get(`/instructor/students/${studentId}`),
          API.get(`/instructor/students/${studentId}/courses`).catch(() => ({ data: { courses: [] } })),
        ]);

        const s = studentRes.data;
        setStudent(s);

        const completedIds = new Set(
          (s.completions || []).map(c => String(c.course_id?._id || c.course_id))
        );

        const raw = courseRes.data?.courses || [];
        const enriched = raw.map(c => ({
          ...c,
          status:       completedIds.has(String(c._id || c.course_id)) ? "completed" : "in_progress",
          completed_at: (s.completions || []).find(
            comp => String(comp.course_id?._id || comp.course_id) === String(c._id || c.course_id)
          )?.completed_at || null,
        }));
        setCourses(enriched);

        const quizRes = await API.get(`/quiz-attempts/instructor/student/${studentId}`).catch(() => ({ data: { attempts: [] } }));
        setQuizzes(quizRes.data?.attempts || []);

      } catch (err) {
        console.error(err);
        setError("Failed to load student data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  const handleToggleActive = async () => {
    setToggling(true);
    try {
      const res = await API.put(`/instructor/students/${studentId}/toggle-active`);
      setStudent(prev => ({
        ...prev,
        is_active:      res.data.is_active,
        deactivated_at: res.data.is_active ? null : new Date().toISOString(),
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  // ── Remove course handler ──────────────────────────────────────
  const handleRemoveCourse = async (courseId) => {
    setRemovingCourseId(courseId);
    try {
      await API.delete(`/instructor/students/${studentId}/courses/${courseId}`);
      // Remove from local courses list
      setCourses(prev => prev.filter(c => String(c._id || c.course_id) !== String(courseId)));
      // Also remove from student completions so stats update
      setStudent(prev => ({
        ...prev,
        completions: (prev.completions || []).filter(
          c => String(c.course_id?._id || c.course_id) !== String(courseId)
        ),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to remove course. Please try again.");
    } finally {
      setRemovingCourseId(null);
      setConfirmRemove(null);
    }
  };

  const openConfirm = (courseId, title) => setConfirmRemove({ courseId, title });
  const closeConfirm = () => setConfirmRemove(null);

  // ── Loading ────────────────────────────────────────────────────
  if (loading) return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.center}>
        <div className="sd-spinner" />
        <div style={{ marginTop: 14, color: "rgba(11,18,32,0.55)", fontSize: 13, fontWeight: 600 }}>
          Loading student profile…
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.center}>
        <div style={S.errorBox}>{error}</div>
        <button style={S.backBtn} onClick={() => navigate(-1)} type="button">
          <ArrowLeft size={15} /> Go Back
        </button>
      </div>
    </div>
  );

  if (!student) return null;

  const isActive       = student.is_active !== false;
  const completedCount = (student.completions || []).length;
  const totalCourses   = Math.max(courses.length, completedCount);
  const progressPct    = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;
  const memberSince    = student.createdAt
    ? new Date(student.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";
  const lastLogin      = student.last_login_at
    ? new Date(student.last_login_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Never";
  const deactivatedAt  = student.deactivated_at
    ? new Date(student.deactivated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "courses",  label: `Courses (${courses.length || completedCount})` },
    { key: "quizzes",  label: `Quiz History (${quizzes.length})` },
    { key: "profile",  label: "Profile" },
  ];

  // Build fallback course list from completions
  const fallbackCourses = (student.completions || []).map(c => ({
    _id:            c.course_id?._id || c.course_id,
    title:          c.course_id?.title || "Course",
    type:           c.course_id?.type,
    credit_hours:   c.course_id?.credit_hours,
    nmls_course_id: c.course_id?.nmls_course_id,
    status:         "completed",
    completed_at:   c.completed_at,
    certificate_url: c.certificate_url,
  }));

  const displayCourses = courses.length > 0 ? courses : fallbackCourses;

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Confirm Remove Modal ─────────────────────────────────── */}
      {confirmRemove && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <div style={S.modalIcon}>
              <Trash2 size={24} color="rgba(185,28,28,1)" />
            </div>
            <div style={S.modalTitle}>Remove Course?</div>
            <div style={S.modalBody}>
              Are you sure you want to remove{" "}
              <strong>"{confirmRemove.title}"</strong> from this student?
              This will also remove their completion record for this course.
            </div>
            <div style={S.modalActions}>
              <button
                type="button"
                style={S.modalCancelBtn}
                onClick={closeConfirm}
                disabled={removingCourseId === confirmRemove.courseId}
              >
                Cancel
              </button>
              <button
                type="button"
                style={S.modalConfirmBtn}
                onClick={() => handleRemoveCourse(confirmRemove.courseId)}
                disabled={removingCourseId === confirmRemove.courseId}
              >
                {removingCourseId === confirmRemove.courseId ? (
                  <><RefreshCw size={13} className="sd-spin-icon" /> Removing…</>
                ) : (
                  <><Trash2 size={13} /> Remove Course</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Back bar ─────────────────────────────────────────────── */}
      <div style={S.backBar}>
        <div style={S.backBarInner}>
          <button style={S.backBtn} onClick={() => navigate(-1)} type="button">
            <ArrowLeft size={15} /> Back to Students
          </button>
          <div style={S.breadcrumb}>
            <span style={{ color: "rgba(11,18,32,0.45)" }}>Instructor</span>
            <span style={{ color: "rgba(11,18,32,0.30)" }}>›</span>
            <span style={{ color: "rgba(11,18,32,0.45)" }}>Students</span>
            <span style={{ color: "rgba(11,18,32,0.30)" }}>›</span>
            <span style={{ color: "rgba(11,18,32,0.80)", fontWeight: 800 }}>{student.name}</span>
          </div>
        </div>
      </div>

      <div style={S.shell}>

        {/* ── Hero profile card ─────────────────────────────────── */}
        <div style={S.heroCard}>
          <div style={S.heroGradient} />
          <div style={S.heroContent}>

            <div style={S.heroLeft}>
              <div style={{ ...S.avatar, ...(isActive ? {} : S.avatarInactive) }}>
                {(student.name || "S")[0].toUpperCase()}
              </div>
              <div style={S.heroInfo}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={S.heroName}>{student.name}</div>
                  <span style={{ ...S.statusBadge, ...(isActive ? S.statusActive : S.statusInactive) }}>
                    {isActive ? <UserCheck size={12} /> : <UserX size={12} />}
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div style={S.heroEmail}>
                  <Mail size={13} style={{ opacity: 0.7 }} /> {student.email}
                </div>
                <div style={S.heroMeta}>
                  {student.nmls_id && (
                    <span style={S.heroPill}><Hash size={11} /> NMLS: {student.nmls_id}</span>
                  )}
                  {student.state && (
                    <span style={S.heroPill}><MapPin size={11} /> {student.state}</span>
                  )}
                  <span style={S.heroPill}><Calendar size={11} /> Joined {memberSince}</span>
                  <span style={S.heroPill}><Clock size={11} /> Last login: {lastLogin}</span>
                </div>
                {!isActive && deactivatedAt && (
                  <div style={S.deactivatedNote}>
                    ⚠ Account deactivated on {deactivatedAt}
                  </div>
                )}
              </div>
            </div>

            <div style={S.heroActions}>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={toggling}
                style={{ ...S.toggleBtn, ...(isActive ? S.toggleBtnDeactivate : S.toggleBtnActivate) }}
              >
                {toggling ? <RefreshCw size={14} className="sd-spin-icon" /> : isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                {toggling ? "Saving…" : isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>

          <div style={S.statsRow}>
            <StatBox icon={<BookOpen size={16} />}     label="Courses Enrolled" value={totalCourses}   />
            <StatBox icon={<CheckCircle size={16} />}  label="Completed"        value={completedCount} color="rgba(0,180,180,1)" />
            <StatBox icon={<TrendingUp size={16} />}   label="Completion Rate"  value={`${progressPct}%`} color="rgba(34,197,94,1)" />
            <StatBox icon={<BarChart2 size={16} />}    label="Quiz Attempts"    value={quizzes.length} color="rgba(46,171,254,1)" />
          </div>
        </div>

        {/* ── Tab card ─────────────────────────────────────────── */}
        <div style={S.tabCard}>
          <div style={S.tabRow}>
            {tabs.map(t => (
              <button key={t.key} type="button"
                style={{ ...S.tabBtn, ...(activeTab === t.key ? S.tabBtnActive : {}) }}
                onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={S.tabBody}>

            {/* ── OVERVIEW ──────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div style={S.gridTwo}>
                <div style={S.panel}>
                  <div style={S.panelHead}>
                    <div style={S.panelTitle}><BookOpen size={15} /> Course Progress</div>
                  </div>
                  {displayCourses.length === 0 ? (
                    <EmptyInPanel text="No courses enrolled yet." />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {displayCourses.map((c, i) => (
                        <CourseProgressRow
                          key={i}
                          course={c}
                          onRemove={() => openConfirm(String(c._id || c.course_id), c.title || "Course")}
                          removing={removingCourseId === String(c._id || c.course_id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div style={S.panel}>
                  <div style={S.panelHead}>
                    <div style={S.panelTitle}><BarChart2 size={15} /> Recent Quiz Results</div>
                  </div>
                  {quizzes.length === 0 ? (
                    <EmptyInPanel text="No quiz attempts recorded." />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {quizzes.slice(0, 6).map((q, i) => (
                        <QuizRow key={i} quiz={q} />
                      ))}
                      {quizzes.length > 6 && (
                        <button style={S.viewMoreBtn} onClick={() => setActiveTab("quizzes")} type="button">
                          View all {quizzes.length} attempts →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── COURSES ───────────────────────────────────────── */}
            {activeTab === "courses" && (
              <div>
                <div style={S.sectionHead}>
                  <div style={S.sectionTitle}>Enrolled Courses</div>
                  <div style={S.sectionSub}>{totalCourses} course{totalCourses !== 1 ? "s" : ""} · {completedCount} completed</div>
                </div>

                {displayCourses.length === 0 ? (
                  <EmptyInPanel text="This student hasn't enrolled in any courses yet." />
                ) : (
                  <div style={S.courseGrid}>
                    {displayCourses.map((c, i) => (
                      <CourseCard
                        key={i}
                        course={c}
                        onRemove={() => openConfirm(String(c._id || c.course_id), c.title || "Course")}
                        removing={removingCourseId === String(c._id || c.course_id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── QUIZ HISTORY ──────────────────────────────────── */}
            {activeTab === "quizzes" && (
              <div>
                <div style={S.sectionHead}>
                  <div style={S.sectionTitle}>Quiz & Exam History</div>
                  <div style={S.sectionSub}>{quizzes.length} attempt{quizzes.length !== 1 ? "s" : ""} recorded</div>
                </div>

                {quizzes.length === 0 ? (
                  <EmptyInPanel text="No quiz attempts found for this student." />
                ) : (
                  <div style={S.tableWrap}>
                    <table style={S.table}>
                      <thead>
                        <tr>
                          <th style={S.th}>Quiz / Exam</th>
                          <th style={S.th}>Type</th>
                          <th style={S.th}>Score</th>
                          <th style={S.th}>Result</th>
                          <th style={S.th}>Correct</th>
                          <th style={S.th}>Time Spent</th>
                          <th style={S.th}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizzes.map((q, i) => (
                          <tr key={i} className="sd-tr">
                            <td style={S.td}>
                              <div style={{ fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.85)" }}>{q.quiz_title || q.quiz_id}</div>
                            </td>
                            <td style={S.td}>
                              <span style={quizTypeBadge(q.quiz_type)}>{quizTypeLabel(q.quiz_type)}</span>
                            </td>
                            <td style={S.td}>
                              <span style={{ fontWeight: 950, fontSize: 16, color: q.passed ? "rgba(0,150,150,1)" : "rgba(185,28,28,1)", fontFamily: "monospace" }}>
                                {q.score_pct}%
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={q.passed ? S.passedBadge : S.failedBadge}>
                                {q.passed ? "✓ Passed" : "✗ Failed"}
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.65)" }}>
                                {q.correct ?? "—"} / {q.total ?? "—"}
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(11,18,32,0.55)" }}>
                                {q.time_spent_seconds ? formatTime(q.time_spent_seconds) : "—"}
                              </span>
                            </td>
                            <td style={S.td}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.50)" }}>
                                {q.submitted_at ? new Date(q.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── PROFILE ───────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div style={S.gridTwo}>
                <div style={S.panel}>
                  <div style={S.panelHead}>
                    <div style={S.panelTitle}><User size={15} /> Personal Information</div>
                  </div>
                  <div style={S.profileGrid}>
                    <ProfileField label="Full Name"   value={student.name} />
                    <ProfileField label="Email"       value={student.email} />
                    <ProfileField label="Phone"       value={student.phone} />
                    <ProfileField label="Address"     value={student.address} />
                    <ProfileField label="State"       value={student.state} />
                    <ProfileField label="NMLS ID"     value={student.nmls_id} mono />
                    <ProfileField label="Role"        value={student.role} capitalize />
                    <ProfileField label="Verified"    value={student.isVerified ? "Yes ✓" : "No"} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={S.panel}>
                    <div style={S.panelHead}>
                      <div style={S.panelTitle}><Target size={15} /> License Goals</div>
                    </div>
                    <div style={S.profileGrid}>
                      <ProfileField label="License Type"   value={student.license_type} capitalize />
                      <ProfileField label="Target State"   value={student.target_state} />
                      <ProfileField label="Target Date"    value={student.target_date} />
                      <ProfileField label="Experience"     value={student.experience} capitalize />
                    </div>
                  </div>

                  <div style={S.panel}>
                    <div style={S.panelHead}>
                      <div style={S.panelTitle}><Shield size={15} /> Account Status</div>
                    </div>
                    <div style={S.profileGrid}>
                      <ProfileField label="Account Status" value={isActive ? "Active" : "Inactive"} />
                      <ProfileField label="Member Since"   value={memberSince} />
                      <ProfileField label="Last Login"     value={lastLogin} />
                      {!isActive && deactivatedAt && (
                        <ProfileField label="Deactivated"  value={deactivatedAt} warn />
                      )}
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(2,8,23,0.07)" }}>
                      <button
                        type="button"
                        onClick={handleToggleActive}
                        disabled={toggling}
                        style={{ ...S.toggleBtn, ...(isActive ? S.toggleBtnDeactivate : S.toggleBtnActivate), width: "100%", justifyContent: "center" }}
                      >
                        {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        {toggling ? "Saving…" : isActive ? "Deactivate Account" : "Activate Account"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────── */

const StatBox = ({ icon, label, value, color = "rgba(11,18,32,0.82)" }) => (
  <div style={S.statBox}>
    <div style={{ ...S.statIcon, color }}>{icon}</div>
    <div style={{ ...S.statValue, color }}>{value}</div>
    <div style={S.statLabel}>{label}</div>
  </div>
);

const CourseProgressRow = ({ course, onRemove, removing }) => {
  const isCompleted = course.status === "completed";
  const type        = String(course.type || "").toUpperCase();
  const completedAt = course.completed_at
    ? new Date(course.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  return (
    <div style={S.courseProgressRow} className="sd-row-hover">
      <div style={{ ...S.cpDot, background: isCompleted ? "rgba(0,180,180,1)" : "rgba(245,158,11,0.90)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.86)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {course.title || "Course"}
        </div>
        <div style={{ fontSize: 11, color: "rgba(11,18,32,0.50)", fontWeight: 600, marginTop: 2 }}>
          {type && <span style={{ marginRight: 8 }}>{type}</span>}
          {completedAt && <span>Completed {completedAt}</span>}
          {!completedAt && !isCompleted && <span style={{ color: "rgba(180,120,0,1)" }}>In Progress</span>}
        </div>
      </div>
      <span style={isCompleted ? S.passedBadge : S.inProgressBadge}>
        {isCompleted ? "✓ Done" : "In Progress"}
      </span>
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        title="Remove course"
        style={S.removeIconBtn}
        className="sd-remove-btn"
      >
        {removing ? <RefreshCw size={13} className="sd-spin-icon" /> : <Trash2 size={13} />}
      </button>
    </div>
  );
};

const CourseCard = ({ course, onRemove, removing }) => {
  const isCompleted = course.status === "completed";
  const type        = String(course.type || "").toUpperCase();
  const completedAt = course.completed_at
    ? new Date(course.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;
  return (
    <div style={S.courseCard}>
      <div style={{ ...S.courseCardBar, background: type === "PE" ? "rgba(46,171,254,1)" : "rgba(0,180,180,1)" }} />
      <div style={S.courseCardBody}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
          <span style={typePill(type)}>{type || "—"}</span>
          <span style={isCompleted ? S.passedBadge : S.inProgressBadge}>
            {isCompleted ? "✓ Completed" : "In Progress"}
          </span>
        </div>
        <div style={{ fontWeight: 900, fontSize: 14, color: "rgba(11,18,32,0.88)", lineHeight: 1.4, marginBottom: 10 }}>
          {course.title || "Course"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {course.credit_hours != null && (
            <div style={S.courseMetaRow}>
              <Clock size={12} style={{ color: "rgba(11,18,32,0.40)" }} />
              <span>{course.credit_hours} credit hours</span>
            </div>
          )}
          {course.nmls_course_id && (
            <div style={S.courseMetaRow}>
              <Hash size={12} style={{ color: "rgba(11,18,32,0.40)" }} />
              <span>NMLS #{course.nmls_course_id}</span>
            </div>
          )}
          {completedAt && (
            <div style={S.courseMetaRow}>
              <CheckCircle size={12} style={{ color: "rgba(0,180,180,1)" }} />
              <span style={{ color: "rgba(0,140,140,1)", fontWeight: 700 }}>Completed {completedAt}</span>
            </div>
          )}
          {course.certificate_url && (
            <a href={course.certificate_url} target="_blank" rel="noreferrer" style={S.certLink}>
              <Award size={12} /> View Certificate
            </a>
          )}
        </div>

        {/* ── Remove Course Button ── */}
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          style={S.removeCardBtn}
        >
          {removing
            ? <><RefreshCw size={13} className="sd-spin-icon" /> Removing…</>
            : <><Trash2 size={13} /> Remove Course</>
          }
        </button>
      </div>
    </div>
  );
};

const QuizRow = ({ quiz }) => (
  <div style={S.quizRow}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 800, fontSize: 12, color: "rgba(11,18,32,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {quiz.quiz_title || quiz.quiz_id}
      </div>
      <div style={{ fontSize: 11, color: "rgba(11,18,32,0.45)", marginTop: 2, fontWeight: 600 }}>
        {quizTypeLabel(quiz.quiz_type)}
        {quiz.submitted_at && ` · ${new Date(quiz.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <span style={{ fontWeight: 950, fontSize: 15, color: quiz.passed ? "rgba(0,150,150,1)" : "rgba(185,28,28,1)", fontFamily: "monospace" }}>
        {quiz.score_pct}%
      </span>
      <span style={quiz.passed ? S.passedBadge : S.failedBadge}>
        {quiz.passed ? "✓" : "✗"}
      </span>
    </div>
  </div>
);

const ProfileField = ({ label, value, mono, capitalize, warn }) => (
  <div style={S.profileField}>
    <div style={S.profileLabel}>{label}</div>
    <div style={{
      ...S.profileValue,
      ...(mono ? { fontFamily: "monospace" } : {}),
      ...(capitalize ? { textTransform: "capitalize" } : {}),
      ...(warn ? { color: "rgba(185,28,28,0.85)" } : {}),
    }}>
      {value || "—"}
    </div>
  </div>
);

const EmptyInPanel = ({ text }) => (
  <div style={{ padding: "24px 0", textAlign: "center", color: "rgba(11,18,32,0.40)", fontSize: 13, fontWeight: 600 }}>
    {text}
  </div>
);

/* ─── Helpers ────────────────────────────────────────────────────── */
const formatTime = (seconds) => {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const quizTypeLabel = (type) => {
  if (type === "final_exam")        return "Final Exam";
  if (type === "quiz_fundamentals") return "Fundamentals";
  if (type === "checkpoint")        return "Checkpoint";
  return type || "Quiz";
};

const quizTypeBadge = (type) => {
  const base = { display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 900 };
  if (type === "final_exam")        return { ...base, color: "rgba(21,128,61,1)",  background: "rgba(34,197,94,0.10)",  border: "1px solid rgba(34,197,94,0.25)"  };
  if (type === "quiz_fundamentals") return { ...base, color: "rgba(146,84,0,1)",   background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)" };
  return { ...base, color: "rgba(46,101,254,1)", background: "rgba(46,171,254,0.10)", border: "1px solid rgba(46,171,254,0.22)" };
};

const typePill = (type) => {
  const base = { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900 };
  if (type === "PE") return { ...base, color: "rgba(46,101,254,1)",  background: "rgba(46,171,254,0.12)", border: "1px solid rgba(46,171,254,0.22)" };
  if (type === "CE") return { ...base, color: "rgba(0,140,140,1)",   background: "rgba(0,180,180,0.12)",  border: "1px solid rgba(0,180,180,0.22)"  };
  return { ...base, color: "rgba(11,18,32,0.60)", background: "rgba(2,8,23,0.06)", border: "1px solid rgba(2,8,23,0.10)" };
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;}
body{margin:0;font-family:Inter,system-ui,sans-serif;}
.sd-spinner{width:38px;height:38px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#00B4B4;animation:sdspin 1s linear infinite;}
@keyframes sdspin{to{transform:rotate(360deg);}}
.sd-spin-icon{animation:sdspin 1s linear infinite;}
.sd-tr:hover{background:rgba(0,180,180,0.03);}
.sd-row-hover:hover .sd-remove-btn{opacity:1!important;}
.sd-remove-btn{opacity:0;transition:opacity 0.15s;}
.sd-row-hover:hover{background:rgba(239,68,68,0.02);}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:    { minHeight: "100vh", background: "#f6f7fb", fontFamily: "Inter, system-ui, sans-serif" },
  center:  { minHeight: "60vh", display: "grid", placeItems: "center", gap: 16 },
  errorBox:{ padding: "14px 20px", borderRadius: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", color: "rgba(180,30,30,1)", fontWeight: 700, fontSize: 13 },

  // ── Modal ──
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(2,8,23,0.45)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal:        { background: "#fff", borderRadius: 20, padding: "28px 28px 24px", maxWidth: 420, width: "100%", boxShadow: "0 24px 64px rgba(2,8,23,0.22)", border: "1px solid rgba(2,8,23,0.08)" },
  modalIcon:    { width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  modalTitle:   { fontWeight: 950, fontSize: 18, color: "rgba(11,18,32,0.92)", marginBottom: 10 },
  modalBody:    { fontSize: 14, fontWeight: 600, color: "rgba(11,18,32,0.60)", lineHeight: 1.6, marginBottom: 22 },
  modalActions: { display: "flex", gap: 10 },
  modalCancelBtn:  { flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(2,8,23,0.14)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.65)" },
  modalConfirmBtn: { flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", cursor: "pointer", fontWeight: 900, fontSize: 13, color: "rgba(185,28,28,1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },

  // ── Back bar ──
  backBar:      { background: "rgba(246,247,251,0.92)", borderBottom: "1px solid rgba(2,8,23,0.08)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 20 },
  backBarInner: { maxWidth: 1160, margin: "0 auto", padding: "12px 18px", display: "flex", alignItems: "center", gap: 16 },
  backBtn:      { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(2,8,23,0.12)", background: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.72)" },
  breadcrumb:   { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 },

  shell: { maxWidth: 1160, margin: "0 auto", padding: "18px 18px 48px", display: "flex", flexDirection: "column", gap: 16 },

  // ── Hero card ──
  heroCard:     { borderRadius: 22, overflow: "hidden", background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 12px 40px rgba(2,8,23,0.09)", position: "relative" },
  heroGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg,#091925,#00B4B4)" },
  heroContent:  { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, padding: "28px 24px 20px", flexWrap: "wrap" },
  heroLeft:     { display: "flex", alignItems: "flex-start", gap: 18, flex: 1, minWidth: 0 },
  avatar:       { width: 72, height: 72, borderRadius: 22, background: "linear-gradient(135deg,#091925,#054040)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00B4B4", fontWeight: 950, fontSize: 28, flexShrink: 0, boxShadow: "0 8px 24px rgba(0,180,180,0.22)" },
  avatarInactive:{ background: "rgba(2,8,23,0.08)", color: "rgba(11,18,32,0.35)", boxShadow: "none" },
  heroInfo:     { flex: 1, minWidth: 0 },
  heroName:     { fontWeight: 950, fontSize: 22, color: "rgba(11,18,32,0.92)", letterSpacing: "-0.3px" },
  heroEmail:    { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(11,18,32,0.55)", fontWeight: 600, marginTop: 5 },
  heroMeta:     { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 },
  heroPill:     { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999, background: "rgba(2,8,23,0.04)", border: "1px solid rgba(2,8,23,0.08)", fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.60)" },
  heroActions:  { display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 },
  deactivatedNote: { marginTop: 10, fontSize: 12, fontWeight: 700, color: "rgba(185,28,28,0.85)", padding: "6px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", display: "inline-flex" },

  statusBadge:   { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900 },
  statusActive:  { color: "rgba(22,163,74,1)",  background: "rgba(34,197,94,0.10)",  border: "1px solid rgba(34,197,94,0.22)"  },
  statusInactive:{ color: "rgba(185,28,28,1)",  background: "rgba(239,68,68,0.08)",  border: "1px solid rgba(239,68,68,0.22)"  },

  toggleBtn:           { display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 12, cursor: "pointer", fontWeight: 900, fontSize: 13, border: "1px solid transparent" },
  toggleBtnDeactivate: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.30)", color: "rgba(185,28,28,1)" },
  toggleBtnActivate:   { background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.30)", color: "rgba(0,140,140,1)" },

  // ── Stats row ──
  statsRow:  { display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid rgba(2,8,23,0.07)" },
  statBox:   { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "18px 14px", borderRight: "1px solid rgba(2,8,23,0.06)" },
  statIcon:  { color: "rgba(11,18,32,0.50)" },
  statValue: { fontWeight: 950, fontSize: 26, letterSpacing: "-0.5px", color: "rgba(11,18,32,0.88)", fontFamily: "monospace" },
  statLabel: { fontSize: 11, fontWeight: 800, color: "rgba(11,18,32,0.45)", textTransform: "uppercase", letterSpacing: "0.04em" },

  // ── Tab card ──
  tabCard:    { borderRadius: 22, background: "#fff", border: "1px solid rgba(2,8,23,0.08)", boxShadow: "0 8px 28px rgba(2,8,23,0.07)", overflow: "hidden" },
  tabRow:     { display: "flex", gap: 6, padding: "14px 16px 0", borderBottom: "1px solid rgba(2,8,23,0.07)", overflowX: "auto" },
  tabBtn:     { padding: "9px 16px", borderRadius: "999px 999px 0 0", border: "1px solid transparent", borderBottom: "none", background: "transparent", cursor: "pointer", fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.55)", whiteSpace: "nowrap", marginBottom: -1 },
  tabBtnActive:{ background: "#fff", border: "1px solid rgba(2,8,23,0.08)", borderBottom: "1px solid #fff", color: "rgba(11,18,32,0.90)", boxShadow: "0 -2px 8px rgba(2,8,23,0.05)" },
  tabBody:    { padding: 20 },

  // ── Layout ──
  gridTwo:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  panel:      { borderRadius: 16, border: "1px solid rgba(2,8,23,0.08)", background: "#fff", padding: 16, boxShadow: "0 2px 10px rgba(2,8,23,0.04)" },
  panelHead:  { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  panelTitle: { display: "flex", alignItems: "center", gap: 7, fontWeight: 900, fontSize: 13, color: "rgba(11,18,32,0.80)" },
  sectionHead:{ marginBottom: 16 },
  sectionTitle:{ fontWeight: 950, fontSize: 16, color: "rgba(11,18,32,0.88)" },
  sectionSub: { fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.50)", marginTop: 4 },

  // ── Course Progress Row ──
  courseProgressRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.015)", transition: "background 0.15s" },
  cpDot:             { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },

  // ── Remove buttons ──
  removeIconBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(239,68,68,0.28)", background: "rgba(239,68,68,0.06)", cursor: "pointer", color: "rgba(185,28,28,1)", flexShrink: 0, padding: 0 },
  removeCardBtn: { marginTop: 14, width: "100%", padding: "9px 0", borderRadius: 10, border: "1px solid rgba(239,68,68,0.28)", background: "rgba(239,68,68,0.06)", cursor: "pointer", fontWeight: 900, fontSize: 12, color: "rgba(185,28,28,1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },

  // ── Course Card ──
  courseGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 },
  courseCard:    { borderRadius: 16, border: "1px solid rgba(2,8,23,0.08)", background: "#fff", overflow: "hidden", boxShadow: "0 4px 16px rgba(2,8,23,0.06)" },
  courseCardBar: { height: 4, width: "100%" },
  courseCardBody:{ padding: 16 },
  courseMetaRow: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "rgba(11,18,32,0.55)" },
  certLink:      { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 800, color: "rgba(0,140,140,1)", textDecoration: "none", marginTop: 6 },

  // ── Quiz Row ──
  quizRow:  { display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(2,8,23,0.07)", background: "rgba(2,8,23,0.015)" },

  // ── Table ──
  tableWrap: { overflowX: "auto", borderRadius: 14, border: "1px solid rgba(2,8,23,0.08)" },
  table:     { width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 800 },
  th:        { textAlign: "left", fontSize: 11, fontWeight: 950, color: "rgba(11,18,32,0.50)", padding: "11px 14px", borderBottom: "1px solid rgba(2,8,23,0.08)", background: "rgba(2,8,23,0.02)", textTransform: "uppercase", letterSpacing: "0.04em" },
  td:        { padding: "12px 14px", borderBottom: "1px solid rgba(2,8,23,0.05)", fontSize: 13 },

  // ── Profile ──
  profileGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  profileField: { display: "flex", flexDirection: "column", gap: 3 },
  profileLabel: { fontSize: 10, fontWeight: 900, color: "rgba(11,18,32,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" },
  profileValue: { fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.82)" },

  // ── Status badges ──
  passedBadge:    { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(0,140,140,1)", background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.25)" },
  failedBadge:    { display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(185,28,28,1)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" },
  inProgressBadge:{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: "rgba(146,84,0,1)", background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.28)" },

  viewMoreBtn: { width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(2,8,23,0.10)", background: "rgba(2,8,23,0.02)", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "rgba(11,18,32,0.60)", textAlign: "center" },
};

export default StudentDetail;