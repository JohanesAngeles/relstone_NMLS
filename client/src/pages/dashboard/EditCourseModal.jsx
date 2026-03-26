import { useState, useEffect } from "react";
import { X, Lock, BookOpen, Save, AlertCircle } from "lucide-react";
import API from "../../api/axios";

/* ─────────────────────────────────────────────────────────────────
   EditCourseModal
   Props:
     course   — the course object to edit (null = closed)
     onClose  — called when modal is dismissed
     onSaved  — called with the updated course after a successful save
   ───────────────────────────────────────────────────────────────── */
const EditCourseModal = ({ course, onClose, onSaved }) => {
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  // Populate form whenever the target course changes
  useEffect(() => {
    if (!course) return;
    setForm({
      title:                 course.title                 || "",
      type:                  course.type                  || "CE",
      credit_hours:          course.credit_hours          ?? "",
      state_approval_number: course.state_approval_number || "",
      states_approved:       (course.states_approved || []).join(", "),
      is_active:             course.is_active !== false,
      description:           course.description           || "",
    });
    setError("");
  }, [course]);

  if (!course) return null;

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        credit_hours: Number(form.credit_hours) || 0,
        states_approved: form.states_approved
          .split(",")
          .map(s => s.trim())
          .filter(Boolean),
      };
      const res = await API.put(`/courses/${course._id}`, payload);
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(9,25,37,0.55)", backdropFilter: "blur(5px)",
        }}
      />

      {/* Modal */}
      <div
        onKeyDown={handleKeyDown}
        style={{
          position: "fixed", zIndex: 401,
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "calc(100% - 32px)", maxWidth: 520,
          background: "#fff", borderRadius: 22,
          boxShadow: "0 28px 70px rgba(9,25,37,0.22), 0 0 0 1px rgba(9,25,37,0.07)",
          fontFamily: "Inter, system-ui, sans-serif",
          maxHeight: "92vh", display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 22px 16px",
          borderBottom: "1px solid rgba(2,8,23,0.08)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: "rgba(0,180,180,0.10)", border: "1px solid rgba(0,180,180,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#00B4B4", flexShrink: 0,
            }}>
              <BookOpen size={19} />
            </div>
            <div>
              <div style={{ fontWeight: 950, fontSize: 15, color: "rgba(11,18,32,0.88)" }}>
                Edit Course
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(11,18,32,0.45)", marginTop: 2 }}>
                NMLS Course ID is locked and cannot be changed
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: "1px solid rgba(2,8,23,0.10)",
              background: "rgba(2,8,23,0.03)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(11,18,32,0.55)", flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 4px" }}>

          {/* NMLS Course ID — read-only locked display */}
          <Field label="NMLS Course ID" locked>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 12px", borderRadius: 10,
              background: "rgba(2,8,23,0.03)", border: "1px solid rgba(2,8,23,0.08)",
            }}>
              <Lock size={13} style={{ color: "rgba(11,18,32,0.32)", flexShrink: 0 }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.55)",
              }}>
                {course.nmls_course_id || "—"}
              </span>
              <span style={{
                marginLeft: "auto", fontSize: 10, fontWeight: 900,
                color: "rgba(11,18,32,0.35)", letterSpacing: "0.05em",
                background: "rgba(2,8,23,0.05)", padding: "2px 8px",
                borderRadius: 999, flexShrink: 0,
              }}>
                READ-ONLY
              </span>
            </div>
          </Field>

          {/* Title */}
          <Field label="Course Title" required>
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. 8-Hour NMLS PE — Federal Law"
              style={IS}
              autoFocus
            />
          </Field>

          {/* Type + Credit Hours — 2-column row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Course Type">
              <select
                value={form.type}
                onChange={e => set("type", e.target.value)}
                style={IS}
              >
                <option value="CE">CE — Continuing Education</option>
                <option value="PE">PE — Pre-Licensure</option>
              </select>
            </Field>

            <Field label="Credit Hours">
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.credit_hours}
                onChange={e => set("credit_hours", e.target.value)}
                placeholder="0"
                style={IS}
              />
            </Field>
          </div>

          {/* State Approval Number */}
          <Field label="State Approval Number">
            <input
              value={form.state_approval_number}
              onChange={e => set("state_approval_number", e.target.value)}
              placeholder="e.g. CA-DFPI-2024-001"
              style={IS}
            />
          </Field>

          {/* States Approved */}
          <Field label="States Approved" hint="Comma-separated, e.g. CA, TX, FL">
            <input
              value={form.states_approved}
              onChange={e => set("states_approved", e.target.value)}
              placeholder="CA, TX, FL, NY"
              style={IS}
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={3}
              placeholder="Brief course description…"
              style={{ ...IS, resize: "vertical", lineHeight: 1.65 }}
            />
          </Field>

          {/* Active toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px", borderRadius: 12, marginBottom: 18,
            background: form.is_active ? "rgba(0,180,180,0.04)" : "rgba(2,8,23,0.025)",
            border: `1px solid ${form.is_active ? "rgba(0,180,180,0.18)" : "rgba(2,8,23,0.08)"}`,
            transition: "all .2s",
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "rgba(11,18,32,0.82)" }}>
                Active course
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(11,18,32,0.48)", marginTop: 2 }}>
                {form.is_active
                  ? "Visible and available to students"
                  : "Hidden — students cannot see or access this course"}
              </div>
            </div>
            <label style={{ cursor: "pointer", flexShrink: 0, marginLeft: 16 }}>
              <div style={{ position: "relative", width: 40, height: 22 }}>
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={e => set("is_active", e.target.checked)}
                  style={{
                    position: "absolute", opacity: 0, inset: 0,
                    cursor: "pointer", margin: 0, zIndex: 1,
                  }}
                />
                {/* Track */}
                <div style={{
                  width: 40, height: 22, borderRadius: 999,
                  background: form.is_active ? "rgba(0,180,180,0.90)" : "rgba(2,8,23,0.14)",
                  transition: "background .2s",
                }} />
                {/* Thumb */}
                <div style={{
                  position: "absolute", top: 3,
                  left: form.is_active ? 21 : 3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.20)",
                  transition: "left .2s",
                  pointerEvents: "none",
                }} />
              </div>
            </label>
          </div>

        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div style={{
          padding: "12px 22px 20px",
          borderTop: "1px solid rgba(2,8,23,0.07)",
          flexShrink: 0,
        }}>
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
              padding: "10px 12px", borderRadius: 10,
              background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.20)",
              fontSize: 13, fontWeight: 700, color: "rgba(185,28,28,1)",
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1, height: 44,
                background: "rgba(2,8,23,0.04)", border: "1px solid rgba(2,8,23,0.10)",
                borderRadius: 12, cursor: saving ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: 900, color: "rgba(11,18,32,0.72)",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 2, height: 44,
                background: saving ? "rgba(0,180,180,0.50)" : "rgba(0,180,180,0.92)",
                border: "none", borderRadius: 12,
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 14, fontWeight: 900, color: "#fff",
                fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: saving ? "none" : "0 4px 14px rgba(0,180,180,0.28)",
                transition: "background .15s, box-shadow .15s",
              }}
            >
              <Save size={15} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

/* ─── Field wrapper ──────────────────────────────────────────────── */
const Field = ({ label, children, hint, required, locked }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 900, color: "rgba(11,18,32,0.65)", letterSpacing: "0.01em" }}>
        {label}
        {required && <span style={{ color: "rgba(0,180,180,1)", marginLeft: 3 }}>*</span>}
      </label>
      {locked && <Lock size={11} style={{ color: "rgba(11,18,32,0.30)" }} />}
      {hint && (
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(11,18,32,0.38)", marginLeft: "auto" }}>
          {hint}
        </span>
      )}
    </div>
    {children}
  </div>
);

/* ─── Shared input style ─────────────────────────────────────────── */
const IS = {
  width: "100%", padding: "10px 12px", borderRadius: 10, outline: "none",
  border: "1px solid rgba(2,8,23,0.12)", background: "#fff",
  fontSize: 13, fontWeight: 700, color: "rgba(11,18,32,0.85)",
  fontFamily: "inherit", boxSizing: "border-box",
  transition: "border-color .15s, box-shadow .15s",
};

export default EditCourseModal;