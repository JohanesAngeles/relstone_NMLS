import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api/axios";
import {
  User, Mail, Phone, MapPin, Building2, Lock,
  Eye, EyeOff, ChevronDown, CheckCircle2,
  AlertCircle, Shield, ArrowRight, Loader2,
  Briefcase, Home, Smartphone,
} from "lucide-react";

/* ─── US States ─────────────────────────────────────────────────── */
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

/* ─── Field ──────────────────────────────────────────────────────── */
const Field = ({ label, required, children, error }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{
      fontSize: 11, fontWeight: 800, letterSpacing: "0.07em",
      textTransform: "uppercase", color: "#7FA8C4",
    }}>
      {label}{required && <span style={{ color: "#2EABFE", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && (
      <div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
        <AlertCircle size={11} /> {error}
      </div>
    )}
  </div>
);

/* ─── Input ──────────────────────────────────────────────────────── */
const Input = ({ icon: Icon, placeholder, type = "text", value, onChange, disabled, right, error }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(127,168,196,0.08)",
    border: `0.5px solid ${error ? "#ef4444" : "rgba(127,168,196,0.45)"}`,
    borderRadius: 5, padding: "0 14px", height: 50, position: "relative",
    transition: "border-color 0.2s, box-shadow 0.2s",
  }}
    className="rel-input-wrap"
  >
    {Icon && <Icon size={16} style={{ color: "#7FA8C4", flexShrink: 0 }} />}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        flex: 1, background: "transparent", border: "none", outline: "none",
        fontSize: 15, fontWeight: 500, color: "#091925",
        fontFamily: "'Poppins', sans-serif",
      }}
    />
    {right}
  </div>
);

/* ─── Select ─────────────────────────────────────────────────────── */
const Select = ({ icon: Icon, placeholder, value, onChange, options }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(127,168,196,0.08)",
    border: "0.5px solid rgba(127,168,196,0.45)",
    borderRadius: 5, padding: "0 14px", height: 50,
  }}>
    {Icon && <Icon size={16} style={{ color: "#7FA8C4", flexShrink: 0 }} />}
    <select
      value={value}
      onChange={onChange}
      style={{
        flex: 1, background: "transparent", border: "none", outline: "none",
        fontSize: 15, fontWeight: 500,
        color: value ? "#091925" : "rgba(91,115,132,0.75)",
        fontFamily: "'Poppins', sans-serif", cursor: "pointer", appearance: "none",
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={14} style={{ color: "#7FA8C4", flexShrink: 0 }} />
  </div>
);

/* ─── Section Card ───────────────────────────────────────────────── */
const Section = ({ icon: Icon, title, subtitle, color = "#2EABFE", children }) => (
  <div style={{
    background: "#fff", borderRadius: 5,
    boxShadow: "0 1px 4px rgba(9,25,37,0.06)",
    overflow: "hidden",
  }}>
    <div style={{ padding: "20px 24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 5, display: "grid", placeItems: "center",
          background: `${color}1A`, border: `0.5px solid ${color}`,
        }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#091925", fontFamily: "'Poppins',sans-serif" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#7FA8C4", fontWeight: 400 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ height: 0.5, background: "#5B7384", opacity: 0.35, marginBottom: 24 }} />
    </div>
    <div style={{ padding: "0 24px 24px" }}>
      {children}
    </div>
  </div>
);

/* ─── Course Type Card ───────────────────────────────────────────── */
const CourseTypeCard = ({ icon: Icon, color, label, desc, selected, onSelect }) => (
  <div
    onClick={onSelect}
    style={{
      flex: 1, minWidth: 200, borderRadius: 5, padding: "16px", cursor: "pointer",
      border: `0.5px solid ${selected ? color : "rgba(127,168,196,0.45)"}`,
      background: selected ? `${color}1A` : "transparent",
      transition: "all 0.2s", position: "relative",
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 5, display: "grid", placeItems: "center",
      background: `${color}1A`, border: `0.5px solid ${color}`, marginBottom: 12,
    }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div style={{ fontSize: 16, fontWeight: 600, color: "#091925", marginBottom: 6, fontFamily: "'Poppins',sans-serif" }}>{label}</div>
    <div style={{ fontSize: 13, color: "#5B7384", lineHeight: 1.5 }}>{desc}</div>
    <div style={{
      position: "absolute", top: 14, right: 14,
      width: 20, height: 20, borderRadius: "50%",
      border: `0.5px solid ${selected ? color : "rgba(127,168,196,0.45)"}`,
      background: selected ? color : "transparent",
      display: "grid", placeItems: "center",
    }}>
      {selected && <CheckCircle2 size={12} color="#fff" />}
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */
const AccountSetup = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Prefill comes from HowItWorksModal via navigate state ────────
  const prefill = location.state?.prefill || {};

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  // Contact info
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]     = useState("");
  const [email,       setEmail]        = useState("");
  const [company,     setCompany]      = useState("");

  // Mailing address
  const [street,     setStreet]     = useState("");
  const [city,       setCity]       = useState("");
  const [addrState,  setAddrState]  = useState("");
  const [zip,        setZip]        = useState("");

  // Phone
  const [mobile, setMobile] = useState("");
  const [work,   setWork]   = useState("");
  const [home,   setHome]   = useState("");

  // Course type
  const [courseType, setCourseType] = useState("mortgage");

  // NMLS
  const [nmlsId,       setNmlsId]       = useState("");
  const [licenseState, setLicenseState] = useState("");

  // Password
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  /* ─── Auto-prefill on mount ────────────────────────────────────── */
  useEffect(() => {
    // Priority 1: data passed via navigate state from HowItWorksModal
    if (prefill.name || prefill.email) {
      if (prefill.name) {
        const parts = prefill.name.trim().split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (prefill.email)   setEmail(prefill.email);
      if (prefill.nmls_id) setNmlsId(prefill.nmls_id);
      if (prefill.state)   setLicenseState(prefill.state);
      if (prefill.phone)   setMobile(prefill.phone);

      // Parse stored address "street, city, STATE ZIP" back into fields
      if (prefill.address) {
        const parts = prefill.address.split(",").map((s) => s.trim());
        if (parts[0]) setStreet(parts[0]);
        if (parts[1]) setCity(parts[1]);
        if (parts[2]) {
          const stateZip  = parts[2].trim().split(" ");
          const zipCode   = stateZip.pop();
          const stateName = stateZip.join(" ");
          if (zipCode)   setZip(zipCode);
          if (stateName) setAddrState(stateName);
        }
      }
      return; // don't fallback if prefill data is present
    }

    // Priority 2: fallback to localStorage if navigate state is missing
    // (e.g. user lands on /account-setup directly)
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      if (stored.name) {
        const parts = stored.name.trim().split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (stored.email)   setEmail(stored.email);
      if (stored.nmls_id) setNmlsId(stored.nmls_id);
      if (stored.state)   setLicenseState(stored.state);
      if (stored.phone)   setMobile(stored.phone);
      if (stored.address) {
        const parts = stored.address.split(",").map((s) => s.trim());
        if (parts[0]) setStreet(parts[0]);
        if (parts[1]) setCity(parts[1]);
        if (parts[2]) {
          const stateZip  = parts[2].trim().split(" ");
          const zipCode   = stateZip.pop();
          const stateName = stateZip.join(" ");
          if (zipCode)   setZip(zipCode);
          if (stateName) setAddrState(stateName);
        }
      }
    } catch { }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Validation ───────────────────────────────────────────────── */
  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim())  e.lastName  = "Required";
    if (!email.trim())     e.email     = "Required";
    if (!street.trim())    e.street    = "Required";
    if (!city.trim())      e.city      = "Required";
    if (!addrState)        e.addrState = "Required";
    if (!zip.trim())       e.zip       = "Required";
    if (!mobile.trim())    e.mobile    = "At least mobile phone required";
    if (password && password.length < 8)         e.password        = "Min 8 characters";
    if (password && password !== confirmPassword) e.confirmPassword = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ─── Save ─────────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const address  = [street, city, `${addrState} ${zip}`].filter(Boolean).join(", ");

      await API.put("/auth/profile", {
        name:    fullName,
        phone:   mobile || null,
        address: address || null,
        nmls_id: nmlsId || null,
        state:   licenseState || null,
      });

      if (password) {
        await API.put("/auth/change-password", {
          currentPassword: "__setup__",
          newPassword:     password,
        });
      }

      // Update localStorage with fresh name + nmls_id
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...stored,
          name:    fullName,
          nmls_id: nmlsId   || stored.nmls_id,
          state:   licenseState || stored.state,
          phone:   mobile   || stored.phone,
          address: address  || stored.address,
        }));
      } catch { }

      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => navigate("/dashboard");

  /* ─── Course types ─────────────────────────────────────────────── */
  const courseTypes = [
    {
      key: "mortgage",
      icon: Shield,
      color: "#2EABFE",
      label: "Mortgage / NMLS",
      desc: "SAFE Act Pre-Licensing and Annual CE for mortgage loan originators",
    },
    {
      key: "real_estate",
      icon: Home,
      color: "#22C55E",
      label: "Real Estate",
      desc: "Pre-license and continuing education for real estate salesperson or broker",
    },
    {
      key: "insurance",
      icon: Briefcase,
      color: "#F59E0B",
      label: "Insurance CE",
      desc: "Continuing education for licensed insurance professionals",
    },
    {
      key: "financial",
      icon: User,
      color: "#9569F7",
      label: "CFP / Financial",
      desc: "Certified Financial Planner continuing education and requirements",
    },
  ];

  /* ─── Password strength ────────────────────────────────────────── */
  const passwordStrength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8)          score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();
  const strengthLabel = ["Too short","Weak","Fair","Good","Strong"][passwordStrength ?? 0];
  const strengthColor = ["#ef4444","#f97316","#F59E0B","#22C55E","#22C55E"][passwordStrength ?? 0];
  const strengthWidth = `${(passwordStrength ?? 0) * 25}%`;

  /* ─── Derived initials for header avatar ───────────────────────── */
  const initials = (firstName || lastName)
    ? `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()
    : "AC";

  const displayName = (firstName || lastName)
    ? `${firstName} ${lastName}`.trim()
    : (prefill.name || "Student");

  /* ─── Render ───────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Poppins',sans-serif;background:#F0F4F8;}
        .rel-input-wrap:focus-within{
          border-color:#2EABFE !important;
          box-shadow:0 0 0 3px rgba(46,171,254,0.12);
        }
        select option{color:#091925;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(9,25,37,0.15);border-radius:99px;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F0F4F8" }}>

        {/* ── TOP NAV ──────────────────────────────────────────────── */}
        <header style={{
          height: 85, background: "#091925",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", flexShrink: 0, position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 2px 20px rgba(0,0,0,0.25)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2, fontFamily: "'Poppins',sans-serif" }}>NMLS</span>
              <span style={{ fontSize: 11, fontWeight: 400, color: "#fff", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.04em" }}>Mortgage Licensing Education</span>
            </div>
            <div style={{ width: 0.5, height: 35, background: "#2EABFE", opacity: 0.6 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", fontFamily: "'Poppins',sans-serif" }}>Account Setup</span>
          </div>

          {/* User chip — shows prefilled name automatically */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#091925", border: "0.5px solid #60C3FF",
            borderRadius: 999, padding: "6px 14px 6px 8px",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%", background: "#2EABFE",
              display: "grid", placeItems: "center",
              fontSize: 12, fontWeight: 700, color: "#091925", fontFamily: "'Poppins',sans-serif",
            }}>
              {initials}
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Poppins',sans-serif" }}>
              {displayName}
            </span>
          </div>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(180deg,rgba(9,25,37,0.04) 0%,rgba(46,171,254,0.18) 100%)",
          padding: "40px 0 32px", textAlign: "center",
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#2EABFE", marginBottom: 8, letterSpacing: "0.04em", fontFamily: "'Poppins',sans-serif" }}>
            Account Setup · Complete Your Profile
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 700, color: "#091925", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.02em", fontFamily: "'Poppins',sans-serif" }}>
            Tell Us About Yourself
          </h1>
          <p style={{ fontSize: 15, fontWeight: 500, color: "#5B7384", maxWidth: 560, margin: "0 auto", lineHeight: 1.6, fontFamily: "'Poppins',sans-serif" }}>
            Help us set up your student profile. This information is used for your NMLS records, course enrollment, and certificate delivery.
          </p>
        </div>

        {/* ── FORM ─────────────────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 0 0" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Error banner */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 18px", borderRadius: 8,
                background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.30)",
                color: "#ef4444", fontSize: 13, fontWeight: 600, fontFamily: "'Poppins',sans-serif",
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* ── 1. Contact Information ── */}
            <Section icon={User} title="Contact Information" subtitle="Your personal and mailing details">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                <Field label="First Name" required error={errors.firstName}>
                  <Input icon={User} placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} />
                </Field>
                <Field label="Last Name" required error={errors.lastName}>
                  <Input icon={User} placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} />
                </Field>
              </div>
              <div style={{ marginBottom: 20 }}>
                <Field label="Email Address" required error={errors.email}>
                  <Input icon={Mail} placeholder="Email Address (e.g. you@gmail.com)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
                </Field>
              </div>
              <div>
                <Field label="Company / Brokerage Name">
                  <Input icon={Building2} placeholder="e.g. ABC Mortgage Group" value={company} onChange={(e) => setCompany(e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* ── 2. Mailing Address ── */}
            <Section icon={MapPin} title="Mailing Address" subtitle="Used for certificate and document delivery">
              <div style={{ marginBottom: 20 }}>
                <Field label="Street Address" required error={errors.street}>
                  <Input icon={MapPin} placeholder="e.g. 1234 Main Street" value={street} onChange={(e) => setStreet(e.target.value)} error={errors.street} />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Field label="City" required error={errors.city}>
                  <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} error={errors.city} />
                </Field>
                <Field label="State" required error={errors.addrState}>
                  <Select placeholder="Select Your State" value={addrState} onChange={(e) => setAddrState(e.target.value)} options={US_STATES} />
                </Field>
                <Field label="ZIP Code" required error={errors.zip}>
                  <Input placeholder="e.g. 90210" value={zip} onChange={(e) => setZip(e.target.value)} error={errors.zip} />
                </Field>
              </div>
            </Section>

            {/* ── 3. Phone Numbers ── */}
            <Section icon={Phone} title="Phone Numbers" subtitle="At least one phone number is required">
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px",
                background: "rgba(245,158,11,0.08)", border: "0.5px solid #F59E0B",
                borderRadius: 5, marginBottom: 20,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 2, flexShrink: 0, marginTop: 1,
                  background: "rgba(245,158,11,0.12)", border: "0.5px solid #F59E0B",
                  display: "grid", placeItems: "center",
                }}>
                  <AlertCircle size={13} style={{ color: "#F59E0B" }} />
                </div>
                <p style={{ fontSize: 14, color: "#091925", lineHeight: 1.5, fontFamily: "'Poppins',sans-serif" }}>
                  Please provide at least one phone number for account verification and support contact.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Field label="Mobile Phone" required error={errors.mobile}>
                  <Input icon={Smartphone} placeholder="(XXX) XXX-XXXX" value={mobile} onChange={(e) => setMobile(e.target.value)} error={errors.mobile} />
                </Field>
                <Field label="Work Phone">
                  <Input icon={Phone} placeholder="(XXX) XXX-XXXX" value={work} onChange={(e) => setWork(e.target.value)} />
                </Field>
                <Field label="Home Phone">
                  <Input icon={Home} placeholder="(XXX) XXX-XXXX" value={home} onChange={(e) => setHome(e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* ── 4. Course Type ── */}
            <Section icon={Briefcase} title="Area of Study" subtitle="Select your primary course area">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {courseTypes.map((ct) => (
                  <CourseTypeCard
                    key={ct.key}
                    icon={ct.icon}
                    color={ct.color}
                    label={ct.label}
                    desc={ct.desc}
                    selected={courseType === ct.key}
                    onSelect={() => setCourseType(ct.key)}
                  />
                ))}
              </div>
              {courseType === "mortgage" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                  <Field label="NMLS ID (if you have one)">
                    <Input icon={Shield} placeholder="e.g. 1234567" value={nmlsId} onChange={(e) => setNmlsId(e.target.value)} />
                  </Field>
                  <Field label="License State">
                    <Select placeholder="Select State" value={licenseState} onChange={(e) => setLicenseState(e.target.value)} options={US_STATES} />
                  </Field>
                </div>
              )}
            </Section>

            {/* ── 5. Password ── */}
            <Section icon={Lock} title="Set Your Password" subtitle="Secure your student portal account">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
                <Field label="Password" error={errors.password}>
                  <Input
                    icon={Lock}
                    placeholder="Min. 8 characters"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    right={
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#7FA8C4", padding: 0, display: "flex" }}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                </Field>
                <Field label="Confirm Password" error={errors.confirmPassword}>
                  <Input
                    icon={Lock}
                    placeholder="Repeat Password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    right={
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#7FA8C4", padding: 0, display: "flex" }}>
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                </Field>
              </div>

              {/* Strength bar */}
              {password && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#7FA8C4", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'Poppins',sans-serif" }}>Password Strength</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: strengthColor, fontFamily: "'Poppins',sans-serif" }}>{strengthLabel}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: "rgba(127,168,196,0.20)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: strengthWidth, background: strengthColor, borderRadius: 999, transition: "width 0.3s, background 0.3s" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <CheckCircle2 size={13} style={{ color: "#7FA8C4", marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: "#7FA8C4", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>
                  Use at least 8 characters with a mix of letters, numbers, and symbols for a strong password.
                </p>
              </div>
            </Section>

            <div style={{ height: 100 }} />
          </div>
        </main>

        {/* ── STICKY FOOTER ────────────────────────────────────────── */}
        <div style={{
          position: "sticky", bottom: 0, zIndex: 100,
          background: "#fff", borderTop: "0.5px solid #5B7384",
          padding: "20px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 -4px 20px rgba(9,25,37,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#7FA8C4", fontFamily: "'Poppins',sans-serif" }}>
            <AlertCircle size={14} />
            Fields marked <span style={{ color: "#2EABFE", fontWeight: 700, margin: "0 4px" }}>*</span> are required.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={handleSkip} style={{
              padding: "0 24px", height: 42, borderRadius: 5,
              border: "0.5px solid #5B7384", background: "#fff",
              fontSize: 14, fontWeight: 700, color: "#5B7384",
              cursor: "pointer", fontFamily: "'Poppins',sans-serif",
            }}>
              Complete Later
            </button>
            <button type="button" onClick={handleSave} disabled={saving || success} style={{
              padding: "0 28px", height: 42, borderRadius: 5,
              border: `0.5px solid ${success ? "#22C55E" : "#2EABFE"}`,
              background: success ? "#22C55E" : "#2EABFE",
              fontSize: 14, fontWeight: 700,
              color: success ? "#fff" : "#091925",
              cursor: saving || success ? "default" : "pointer",
              fontFamily: "'Poppins',sans-serif",
              display: "flex", alignItems: "center", gap: 8,
              transition: "background 0.25s, border-color 0.25s",
              opacity: saving ? 0.8 : 1,
            }}>
              {saving ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
              ) : success ? (
                <><CheckCircle2 size={16} /> Saved! Redirecting…</>
              ) : (
                <>Save and go to my Portal <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default AccountSetup;