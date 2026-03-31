import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../api/axios";
import Layout from "../../components/Layout";
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
  }} className="rel-input-wrap">
    {Icon && <Icon size={16} style={{ color: "#7FA8C4", flexShrink: 0 }} />}
    <input
      type={type} placeholder={placeholder} value={value}
      onChange={onChange} disabled={disabled}
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
    <select value={value} onChange={onChange} style={{
      flex: 1, background: "transparent", border: "none", outline: "none",
      fontSize: 15, fontWeight: 500,
      color: value ? "#091925" : "rgba(91,115,132,0.75)",
      fontFamily: "'Poppins', sans-serif", cursor: "pointer", appearance: "none",
    }}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={14} style={{ color: "#7FA8C4", flexShrink: 0 }} />
  </div>
);

/* ─── Section Card ───────────────────────────────────────────────── */
const Section = ({ icon: Icon, title, subtitle, color = "#2EABFE", children }) => (
  <div style={{
    background: "#fff", borderRadius: 8,
    boxShadow: "0 1px 4px rgba(9,25,37,0.06)",
    overflow: "hidden",
  }}>
    <div style={{ padding: "20px 24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, display: "grid", placeItems: "center",
          background: `${color}1A`, border: `0.5px solid ${color}`,
        }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#091925", fontFamily: "'Poppins',sans-serif" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#7FA8C4", fontWeight: 400 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ height: "0.5px", background: "#5B7384", opacity: 0.25, marginBottom: 22 }} />
    </div>
    <div style={{ padding: "0 24px 24px" }}>{children}</div>
  </div>
);

/* ─── Course Type Card ───────────────────────────────────────────── */
const CourseTypeCard = ({ icon: Icon, color, label, desc, selected, onSelect }) => (
  <div onClick={onSelect} style={{
    flex: 1, minWidth: 200, borderRadius: 8, padding: "16px", cursor: "pointer",
    border: `0.5px solid ${selected ? color : "rgba(127,168,196,0.45)"}`,
    background: selected ? `${color}1A` : "transparent",
    transition: "all 0.2s", position: "relative",
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 8, display: "grid", placeItems: "center",
      background: `${color}1A`, border: `0.5px solid ${color}`, marginBottom: 10,
    }}>
      <Icon size={17} style={{ color }} />
    </div>
    <div style={{ fontSize: 14, fontWeight: 700, color: "#091925", marginBottom: 5, fontFamily: "'Poppins',sans-serif" }}>{label}</div>
    <div style={{ fontSize: 12, color: "#5B7384", lineHeight: 1.5 }}>{desc}</div>
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

/* ─── AccountSetup ───────────────────────────────────────────────── */
const AccountSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill  = location.state?.prefill || {};

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [company,     setCompany]     = useState("");
  const [street,      setStreet]      = useState("");
  const [city,        setCity]        = useState("");
  const [addrState,   setAddrState]   = useState("");
  const [zip,         setZip]         = useState("");
  const [mobile,      setMobile]      = useState("");
  const [work,        setWork]        = useState("");
  const [home,        setHome]        = useState("");
  const [courseType,  setCourseType]  = useState("mortgage");
  const [nmlsId,      setNmlsId]      = useState("");
  const [licenseState,setLicenseState]= useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [errors,          setErrors]          = useState({});

  useEffect(() => {
    const applyData = (data) => {
      if (data.name) {
        const parts = data.name.trim().split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (data.email)   setEmail(data.email);
      if (data.nmls_id) setNmlsId(data.nmls_id);
      if (data.state)   setLicenseState(data.state);
      if (data.phone)   setMobile(data.phone);
      if (data.address) {
        const parts = data.address.split(",").map((s) => s.trim());
        if (parts[0]) setStreet(parts[0]);
        if (parts[1]) setCity(parts[1]);
        if (parts[2]) {
          const sv = parts[2].trim().split(" ");
          const z  = sv.pop(); const st = sv.join(" ");
          if (z)  setZip(z);
          if (st) setAddrState(st);
        }
      }
    };

    if (prefill.name || prefill.email) { applyData(prefill); return; }
    try { applyData(JSON.parse(localStorage.getItem("user") || "{}")); } catch {}
  }, []); // eslint-disable-line

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

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setError("");
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const address  = [street, city, `${addrState} ${zip}`].filter(Boolean).join(", ");
      await API.put("/auth/profile", {
  name: fullName,
  phone: mobile || null,
  address: address || null,
  nmls_id: nmlsId || null,
  state: licenseState || null,
  company: company || null,        // ← add
  work_phone: work || null,        // ← add
  home_phone: home || null,        // ← add
  course_type: courseType || null, // ← add
});
      if (password) {
        await API.put("/auth/change-password", { currentPassword: "__setup__", newPassword: password });  
      }
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...stored, name: fullName,
          nmls_id: nmlsId || stored.nmls_id, state: licenseState || stored.state,
          phone: mobile || stored.phone, address: address || stored.address,
        }));
      } catch {}
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save profile. Please try again.");
    } finally { setSaving(false); }
  };

  const courseTypes = [
    { key: "mortgage",     icon: Shield,   color: "#2EABFE", label: "Mortgage / NMLS",   desc: "SAFE Act Pre-Licensing and Annual CE for mortgage loan originators" },
    { key: "real_estate",  icon: Home,     color: "#22C55E", label: "Real Estate",        desc: "Pre-license and continuing education for real estate professionals" },
    { key: "insurance",    icon: Briefcase,color: "#F59E0B", label: "Insurance CE",       desc: "Continuing education for licensed insurance professionals" },
    { key: "financial",    icon: User,     color: "#9569F7", label: "CFP / Financial",    desc: "Certified Financial Planner continuing education and requirements" },
  ];

  const passwordStrength = (() => {
    if (!password) return null;
    let s = 0;
    if (password.length >= 8)          s++;
    if (/[A-Z]/.test(password))        s++;
    if (/[0-9]/.test(password))        s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["Too short","Weak","Fair","Good","Strong"][passwordStrength ?? 0];
  const strengthColor = ["#ef4444","#f97316","#F59E0B","#22C55E","#22C55E"][passwordStrength ?? 0];

  return (
    <Layout>
      <style>{`
        .rel-input-wrap:focus-within{border-color:#2EABFE !important;box-shadow:0 0 0 3px rgba(46,171,254,0.12);}
        select option{color:#091925;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <div style={{ padding: "20px 24px 120px" }}>

        {/* ── Page header ──────────────────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2EABFE", marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>
            Settings › Account Setup
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#091925", fontFamily: "'Poppins',sans-serif", marginBottom: 5, lineHeight: 1.1 }}>
            Complete Your Profile
          </h1>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#5B7384", fontFamily: "'Poppins',sans-serif", lineHeight: 1.6, maxWidth: 560 }}>
            This information is used for your NMLS records, course enrollment, and certificate delivery.
          </p>
          <div style={{ height: "1.5px", background: "linear-gradient(90deg,#2EABFE,transparent)", borderRadius: 99, marginTop: 14 }} />
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8,
            background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.30)",
            color: "#ef4444", fontSize: 13, fontWeight: 600, fontFamily: "'Poppins',sans-serif", marginBottom: 18,
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>

          {/* 1. Contact Information */}
          <Section icon={User} title="Contact Information" subtitle="Your personal and contact details">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <Field label="First Name" required error={errors.firstName}>
                <Input icon={User} placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} error={errors.firstName} />
              </Field>
              <Field label="Last Name" required error={errors.lastName}>
                <Input icon={User} placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} error={errors.lastName} />
              </Field>
            </div>
            <div style={{ marginBottom: 18 }}>
              <Field label="Email Address" required error={errors.email}>
                <Input icon={Mail} placeholder="you@gmail.com" type="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
              </Field>
            </div>
            <Field label="Company / Brokerage Name">
              <Input icon={Building2} placeholder="e.g. ABC Mortgage Group" value={company} onChange={e => setCompany(e.target.value)} />
            </Field>
          </Section>

          {/* 2. Mailing Address */}
          <Section icon={MapPin} title="Mailing Address" subtitle="Used for certificate and document delivery">
            <div style={{ marginBottom: 18 }}>
              <Field label="Street Address" required error={errors.street}>
                <Input icon={MapPin} placeholder="e.g. 1234 Main Street" value={street} onChange={e => setStreet(e.target.value)} error={errors.street} />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Field label="City" required error={errors.city}>
                <Input placeholder="City" value={city} onChange={e => setCity(e.target.value)} error={errors.city} />
              </Field>
              <Field label="State" required error={errors.addrState}>
                <Select placeholder="Select State" value={addrState} onChange={e => setAddrState(e.target.value)} options={US_STATES} />
              </Field>
              <Field label="ZIP Code" required error={errors.zip}>
                <Input placeholder="e.g. 90210" value={zip} onChange={e => setZip(e.target.value)} error={errors.zip} />
              </Field>
            </div>
          </Section>

          {/* 3. Phone Numbers */}
          <Section icon={Phone} title="Phone Numbers" subtitle="At least one phone number is required">
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px",
              background: "rgba(245,158,11,0.08)", border: "0.5px solid #F59E0B",
              borderRadius: 7, marginBottom: 18,
            }}>
              <AlertCircle size={13} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: "#091925", lineHeight: 1.5, fontFamily: "'Poppins',sans-serif" }}>
                Please provide at least one phone number for account verification and support contact.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Field label="Mobile Phone" required error={errors.mobile}>
                <Input icon={Smartphone} placeholder="(XXX) XXX-XXXX" value={mobile} onChange={e => setMobile(e.target.value)} error={errors.mobile} />
              </Field>
              <Field label="Work Phone">
                <Input icon={Phone} placeholder="(XXX) XXX-XXXX" value={work} onChange={e => setWork(e.target.value)} />
              </Field>
              <Field label="Home Phone">
                <Input icon={Home} placeholder="(XXX) XXX-XXXX" value={home} onChange={e => setHome(e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* 4. Area of Study */}
          <Section icon={Briefcase} title="Area of Study" subtitle="Select your primary course area">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {courseTypes.map(ct => (
                <CourseTypeCard key={ct.key} icon={ct.icon} color={ct.color} label={ct.label}
                  desc={ct.desc} selected={courseType === ct.key} onSelect={() => setCourseType(ct.key)} />
              ))}
            </div>
            {courseType === "mortgage" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
                <Field label="NMLS ID (if you have one)">
                  <Input icon={Shield} placeholder="e.g. 1234567" value={nmlsId} onChange={e => setNmlsId(e.target.value)} />
                </Field>
                <Field label="License State">
                  <Select placeholder="Select State" value={licenseState} onChange={e => setLicenseState(e.target.value)} options={US_STATES} />
                </Field>
              </div>
            )}
          </Section>

          {/* 5. Password */}
          <Section icon={Lock} title="Set Your Password" subtitle="Secure your student portal account">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 14 }}>
              <Field label="Password" error={errors.password}>
                <Input icon={Lock} placeholder="Min. 8 characters"
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} error={errors.password}
                  right={
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#7FA8C4", padding: 0, display: "flex" }}>
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
              </Field>
              <Field label="Confirm Password" error={errors.confirmPassword}>
                <Input icon={Lock} placeholder="Repeat Password"
                  type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} error={errors.confirmPassword}
                  right={
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#7FA8C4", padding: 0, display: "flex" }}>
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
              </Field>
            </div>

            {password && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#7FA8C4", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password Strength</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: "rgba(127,168,196,0.20)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(passwordStrength ?? 0) * 25}%`, background: strengthColor, borderRadius: 999, transition: "width 0.3s" }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <CheckCircle2 size={12} style={{ color: "#7FA8C4", marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: "#7FA8C4", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>
                Use at least 8 characters with a mix of letters, numbers, and symbols.
              </p>
            </div>
          </Section>

        </div>
      </div>

      {/* ── STICKY FOOTER ────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 300, right: 0, zIndex: 50,
        background: "#fff", borderTop: "0.5px solid rgba(2,8,23,0.10)",
        padding: "16px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 -4px 20px rgba(9,25,37,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#7FA8C4", fontFamily: "'Poppins',sans-serif" }}>
          <AlertCircle size={13} />
          Fields marked <span style={{ color: "#2EABFE", fontWeight: 700, margin: "0 4px" }}>*</span> are required
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => navigate("/dashboard")} style={{
            padding: "0 20px", height: 40, borderRadius: 8,
            border: "0.5px solid #5B7384", background: "#fff",
            fontSize: 13, fontWeight: 700, color: "#5B7384",
            cursor: "pointer", fontFamily: "'Poppins',sans-serif",
          }}>
            Complete Later
          </button>
          <button type="button" onClick={handleSave} disabled={saving || success} style={{
            padding: "0 24px", height: 40, borderRadius: 8,
            border: `0.5px solid ${success ? "#22C55E" : "#2EABFE"}`,
            background: success ? "#22C55E" : "#2EABFE",
            fontSize: 13, fontWeight: 700,
            color: success ? "#fff" : "#091925",
            cursor: saving || success ? "default" : "pointer",
            fontFamily: "'Poppins',sans-serif",
            display: "flex", alignItems: "center", gap: 7,
            opacity: saving ? 0.8 : 1, transition: "background 0.25s",
          }}>
            {saving  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
           : success ? <><CheckCircle2 size={14} /> Saved! Redirecting…</>
           :           <>Save & Go to Portal <ArrowRight size={14} /></>}
          </button>
        </div>
      </div>

    </Layout>
  );
};

export default AccountSetup;