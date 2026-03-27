import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import Layout from "../../components/Layout.jsx";
import {
  User, Mail, Phone, MapPin, Lock, Bell, CreditCard,
  FileText, ChevronRight, CheckCircle, Eye, EyeOff,
  Save, AlertCircle, X,
} from "lucide-react";

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const SECTIONS = [
  { key: "personal",       label: "Personal Info",      icon: <User size={15} /> },
  { key: "password",       label: "Change Password",    icon: <Lock size={15} /> },
  { key: "notifications",  label: "Notifications",      icon: <Bell size={15} /> },
  { key: "license",        label: "License Goals",      icon: <CheckCircle size={15} /> },
  { key: "payment",        label: "Payment Methods",    icon: <CreditCard size={15} /> },
  { key: "orders",         label: "Order History",      icon: <FileText size={15} /> },
];

/* ── Toast ───────────────────────────────────────────────────────── */
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:999,
      display:"flex", alignItems:"center", gap:10,
      padding:"14px 18px", borderRadius:14,
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
      color: type === "error" ? "#b91c1c" : "#15803d",
      fontWeight:700, fontSize:13,
      boxShadow:"0 8px 28px rgba(2,8,23,0.12)",
      animation:"toast-in .25s ease",
    }}>
      {type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {msg}
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", color:"inherit", marginLeft:4 }}><X size={14} /></button>
    </div>
  );
};

/* ── Main Profile Page ───────────────────────────────────────────── */
const Profile = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState({ msg:"", type:"success" });

  const showToast = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          API.get("/dashboard"),
          API.get("/dashboard"),
        ]);
        setProfileData(dashRes.data?.profile || {});
        setOrders(dashRes.data?.orders || []);
      } catch { showToast("Failed to load profile", "error"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <Layout>
      <style>{css}</style>
      <div style={S.center}><div className="pf-spinner" /></div>
    </Layout>
  );

  return (
    <Layout>
      <style>{css}</style>
      {toast.msg && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg:"" })} />}

      <div style={S.shell}>
        {/* ── Page Header ── */}
        <div style={S.pageHeader}>
          <div style={S.pageKicker}>Account</div>
          <div style={S.pageTitle}>Profile & Settings</div>
        </div>

        <div style={S.layout}>
          {/* ── Sidebar ── */}
          <aside style={S.sidebar}>
            {/* Avatar */}
            <div style={S.avatarCard}>
              <div style={S.avatar}>
                <span style={S.avatarInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div style={S.avatarName}>{user?.name || "Student"}</div>
              <div style={S.avatarEmail}>{user?.email}</div>
              {profileData?.nmls_id && (
                <div style={S.avatarNmls}>NMLS #{profileData.nmls_id}</div>
              )}
            </div>

            {/* Nav */}
            <nav style={S.sideNav}>
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  style={{ ...S.sideNavBtn, ...(activeSection === s.key ? S.sideNavBtnActive : {}) }}
                  onClick={() => setActiveSection(s.key)}
                >
                  {s.icon}
                  <span>{s.label}</span>
                  <ChevronRight size={14} style={{ marginLeft:"auto", opacity:.45 }} />
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <main style={S.main}>
            {activeSection === "personal"      && <PersonalInfo      profileData={profileData} user={user} login={login} showToast={showToast} />}
            {activeSection === "password"      && <ChangePassword    showToast={showToast} />}
            {activeSection === "notifications" && <Notifications     showToast={showToast} />}
            {activeSection === "license"       && <LicenseGoals      profileData={profileData} showToast={showToast} />}
            {activeSection === "payment"       && <PaymentMethods    showToast={showToast} />}
            {activeSection === "orders"        && <OrderHistory      orders={orders} navigate={navigate} />}
          </main>
        </div>
      </div>
    </Layout>
  );
};

/* ── Section: Personal Info ──────────────────────────────────────── */
const PersonalInfo = ({ profileData, user, login, showToast }) => {
  const [form, setForm] = useState({
    name:    user?.name    || "",
    email:   user?.email   || "",
    phone:   profileData?.phone   || "",
    address: profileData?.address || "",
    nmls_id: profileData?.nmls_id || "",
    state:   user?.state   || profileData?.state || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put("/auth/profile", form);
      // Update auth context with new name if changed
      if (res.data?.user) {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        login(res.data.user, token, !!localStorage.getItem("token"));
      }
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally { setSaving(false); }
  };

  return (
    <SectionCard title="Personal Information" subtitle="Update your name, contact details, and address">
      <form onSubmit={handleSave} style={S.form}>
        <div style={S.twoCol}>
          <Field label="Full Name" required>
            <InputWrap icon={<User size={15} />}>
              <input style={S.input} value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Your full name" required />
            </InputWrap>
          </Field>
          <Field label="Email Address" required>
            <InputWrap icon={<Mail size={15} />}>
              <input style={{...S.input, color:"rgba(9,25,37,0.50)"}} value={form.email} readOnly placeholder="name@email.com" title="Email cannot be changed" />
            </InputWrap>
            <div style={S.fieldHint}>Email address cannot be changed</div>
          </Field>
        </div>
        <div style={S.twoCol}>
          <Field label="Phone Number">
            <InputWrap icon={<Phone size={15} />}>
              <input style={S.input} value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} placeholder="+1 (555) 000-0000" type="tel" />
            </InputWrap>
          </Field>
          <Field label="NMLS ID">
            <InputWrap icon={<FileText size={15} />}>
              <input style={S.input} value={form.nmls_id} onChange={e => setForm({...form, nmls_id:e.target.value})} placeholder="Your NMLS ID" />
            </InputWrap>
          </Field>
        </div>
        <Field label="Street Address">
          <InputWrap icon={<MapPin size={15} />}>
            <input style={S.input} value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="123 Main St, City, State" />
          </InputWrap>
        </Field>
        <Field label="State">
          <InputWrap icon={<MapPin size={15} />}>
            <select style={{...S.input, paddingLeft:38}} value={form.state} onChange={e => setForm({...form, state:e.target.value})}>
              <option value="">Select state</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </InputWrap>
        </Field>
        <div style={S.formFooter}>
          <button style={S.saveBtn} type="submit" disabled={saving}>
            <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

/* ── Section: Change Password ────────────────────────────────────── */
const ChangePassword = ({ showToast }) => {
  const [form, setForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [show, setShow] = useState({ current:false, new:false, confirm:false });
  const [saving, setSaving] = useState(false);

  const strength = form.newPassword.length < 6 ? "weak" : form.newPassword.length < 10 ? "good" : "strong";
  const strengthColor = { weak:"#ef4444", good:"#f59e0b", strong:"#22c55e" };
  const strengthWidth = { weak:"28%", good:"62%", strong:"100%" };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { showToast("Passwords do not match", "error"); return; }
    if (form.newPassword.length < 8) { showToast("Password must be at least 8 characters", "error"); return; }
    setSaving(true);
    try {
      await API.put("/auth/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      showToast("Password changed successfully!");
      setForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally { setSaving(false); }
  };

  return (
    <SectionCard title="Change Password" subtitle="Keep your account secure with a strong password">
      <form onSubmit={handleSave} style={S.form}>
        <Field label="Current Password" required>
          <InputWrap icon={<Lock size={15} />}>
            <input style={S.input} type={show.current ? "text" : "password"} value={form.currentPassword} onChange={e => setForm({...form, currentPassword:e.target.value})} placeholder="Your current password" required />
            <EyeBtn show={show.current} toggle={() => setShow({...show, current:!show.current})} />
          </InputWrap>
        </Field>
        <Field label="New Password" required>
          <InputWrap icon={<Lock size={15} />}>
            <input style={S.input} type={show.new ? "text" : "password"} value={form.newPassword} onChange={e => setForm({...form, newPassword:e.target.value})} placeholder="At least 8 characters" required />
            <EyeBtn show={show.new} toggle={() => setShow({...show, new:!show.new})} />
          </InputWrap>
          {form.newPassword.length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ height:4, borderRadius:999, background:"#e2e8f0", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:999, transition:"all .3s", width:strengthWidth[strength], background:strengthColor[strength] }} />
              </div>
              <div style={{ fontSize:11, marginTop:4, fontWeight:700, color:strengthColor[strength] }}>
                {strength.charAt(0).toUpperCase() + strength.slice(1)} password
              </div>
            </div>
          )}
        </Field>
        <Field label="Confirm New Password" required>
          <InputWrap icon={<Lock size={15} />}>
            <input style={S.input} type={show.confirm ? "text" : "password"} value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword:e.target.value})} placeholder="Repeat new password" required />
            <EyeBtn show={show.confirm} toggle={() => setShow({...show, confirm:!show.confirm})} />
          </InputWrap>
          {form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword && (
            <div style={{ fontSize:11, color:"#ef4444", fontWeight:700, marginTop:4 }}>Passwords don't match</div>
          )}
        </Field>
        <div style={S.formFooter}>
          <button style={S.saveBtn} type="submit" disabled={saving || form.newPassword !== form.confirmPassword || form.newPassword.length < 8}>
            <Save size={15} /> {saving ? "Saving…" : "Update Password"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

/* ── Section: Notifications ──────────────────────────────────────── */
const Notifications = ({ showToast }) => {
  const [prefs, setPrefs] = useState({
    email_course_updates:    true,
    email_promotions:        false,
    email_reminders:         true,
    email_completions:       true,
    sms_course_updates:      false,
    sms_reminders:           true,
    sms_promotions:          false,
    sms_completions:         false,
  });
  const [saving, setSaving] = useState(false);

  const NOTIF_ROWS = [
    { key:"course_updates", label:"Course Updates",       sub:"New content, module releases" },
    { key:"reminders",      label:"Learning Reminders",   sub:"Nudges to keep you on track" },
    { key:"completions",    label:"Completion Alerts",    sub:"Certificate and progress updates" },
    { key:"promotions",     label:"Promotions & Offers",  sub:"Discounts and new course announcements" },
  ];

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put("/auth/notifications", prefs);
      showToast("Notification preferences saved!");
    } catch {
      showToast("Failed to save preferences", "error");
    } finally { setSaving(false); }
  };

  return (
    <SectionCard title="Notification Preferences" subtitle="Choose how and when we contact you">
      <div style={S.notifTable}>
        {/* Header */}
        <div style={S.notifHeader}>
          <div style={{ flex:1 }} />
          <div style={S.notifColLabel}><Mail size={13} /> Email</div>
          <div style={S.notifColLabel}><Phone size={13} /> SMS</div>
        </div>
        {/* Rows */}
        {NOTIF_ROWS.map((row) => (
          <div key={row.key} style={S.notifRow}>
            <div style={{ flex:1 }}>
              <div style={S.notifLabel}>{row.label}</div>
              <div style={S.notifSub}>{row.sub}</div>
            </div>
            <div style={S.notifToggleCell}>
              <Toggle
                on={prefs[`email_${row.key}`]}
                onChange={() => toggle(`email_${row.key}`)}
              />
            </div>
            <div style={S.notifToggleCell}>
              <Toggle
                on={prefs[`sms_${row.key}`]}
                onChange={() => toggle(`sms_${row.key}`)}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={S.formFooter}>
        <button style={S.saveBtn} onClick={handleSave} disabled={saving} type="button">
          <Save size={15} /> {saving ? "Saving…" : "Save Preferences"}
        </button>
      </div>
    </SectionCard>
  );
};

/* ── Section: License Goals ──────────────────────────────────────── */
const LicenseGoals = ({ profileData, showToast }) => {
  const [form, setForm] = useState({
    license_type:  profileData?.license_type  || "",
    target_state:  profileData?.target_state  || profileData?.state || "",
    target_date:   profileData?.target_date   || "",
    experience:    profileData?.experience    || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/auth/profile", form);
      showToast("License goals updated!");
    } catch {
      showToast("Failed to save", "error");
    } finally { setSaving(false); }
  };

  return (
    <SectionCard title="License Goals" subtitle="Tell us your licensing goals so we can recommend the right courses">
      <form onSubmit={handleSave} style={S.form}>
        <Field label="License Type">
          <select style={{...S.input, paddingLeft:14}} value={form.license_type} onChange={e => setForm({...form, license_type:e.target.value})}>
            <option value="">Select license type</option>
            <option value="new">New License (Pre-License / 20hr PE)</option>
            <option value="renewal">Annual Renewal (CE)</option>
            <option value="both">Both PE and CE</option>
          </select>
        </Field>
        <div style={S.twoCol}>
          <Field label="Target State">
            <select style={{...S.input, paddingLeft:14}} value={form.target_state} onChange={e => setForm({...form, target_state:e.target.value})}>
              <option value="">Select state</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Target Completion Date">
            <input style={{...S.input, paddingLeft:14}} type="date" value={form.target_date} onChange={e => setForm({...form, target_date:e.target.value})} />
          </Field>
        </div>
        <Field label="Experience Level">
          <select style={{...S.input, paddingLeft:14}} value={form.experience} onChange={e => setForm({...form, experience:e.target.value})}>
            <option value="">Select experience level</option>
            <option value="none">No experience — brand new to mortgage</option>
            <option value="some">Some experience — less than 2 years</option>
            <option value="experienced">Experienced — 2+ years in mortgage</option>
            <option value="renewing">Currently licensed — renewing CE</option>
          </select>
        </Field>

        {/* Goal summary card */}
        {(form.license_type || form.target_state) && (
          <div style={S.goalCard}>
            <div style={S.goalCardTitle}>📋 Your Learning Path</div>
            <div style={S.goalCardBody}>
              {form.license_type === "new" && <div style={S.goalItem}><CheckCircle size={13} color="#22C55E" /> 20-Hour SAFE Act Pre-License Course</div>}
              {form.license_type === "renewal" && <div style={S.goalItem}><CheckCircle size={13} color="#22C55E" /> 8-Hour Annual CE Course</div>}
              {form.license_type === "both" && <>
                <div style={S.goalItem}><CheckCircle size={13} color="#22C55E" /> 20-Hour SAFE Act Pre-License Course</div>
                <div style={S.goalItem}><CheckCircle size={13} color="#22C55E" /> 8-Hour Annual CE Course</div>
              </>}
              {form.target_state && <div style={S.goalItem}><MapPin size={13} color="#2EABFE" /> State: {form.target_state}</div>}
              {form.target_date && <div style={S.goalItem}><CheckCircle size={13} color="#F59E0B" /> Target: {new Date(form.target_date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>}
            </div>
          </div>
        )}

        <div style={S.formFooter}>
          <button style={S.saveBtn} type="submit" disabled={saving}>
            <Save size={15} /> {saving ? "Saving…" : "Save Goals"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

/* ── Section: Payment Methods ────────────────────────────────────── */
const PaymentMethods = ({ showToast }) => (
  <SectionCard title="Payment Methods" subtitle="Manage your saved payment methods">
    <div style={S.emptyPayment}>
      <CreditCard size={32} color="rgba(9,25,37,0.25)" />
      <div style={S.emptyPaymentTitle}>No saved payment methods</div>
      <div style={S.emptyPaymentSub}>
        Payment methods are saved securely via Authorize.net when you complete a purchase.
      </div>
      <div style={S.securityNote}>
        <CheckCircle size={13} color="#22C55E" />
        <span>All payments are processed securely through Authorize.net. Card details are never stored on our servers.</span>
      </div>
    </div>
  </SectionCard>
);

/* ── Section: Order History ──────────────────────────────────────── */
const OrderHistory = ({ orders, navigate }) => {
  const orderStatusStyle = (status) => {
    const s = String(status || "").toLowerCase();
    const base = { display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:800, textTransform:"capitalize" };
    if (s==="paid"||s==="completed") return { ...base, color:"rgba(0,140,140,1)", background:"rgba(0,180,180,0.12)", border:"1px solid rgba(0,180,180,0.20)" };
    if (s==="pending")               return { ...base, color:"rgba(180,120,0,1)", background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.22)" };
    return { ...base, color:"rgba(200,50,50,1)", background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.20)" };
  };

  return (
    <SectionCard title="Order History" subtitle="Your purchases and payment receipts">
      {orders.length === 0 ? (
        <div style={S.emptyPayment}>
          <FileText size={32} color="rgba(9,25,37,0.25)" />
          <div style={S.emptyPaymentTitle}>No orders yet</div>
          <div style={S.emptyPaymentSub}>When you purchase courses, your orders will appear here.</div>
          <button style={S.browseBtn} onClick={() => navigate("/courses")} type="button">Browse Courses <ChevronRight size={14} /></button>
        </div>
      ) : (
        <div style={{ display:"grid", gap:12 }}>
          {orders.map((order, i) => (
            <div key={i} style={S.orderCard}>
              <div style={S.orderTop}>
                <div>
                  <div style={S.orderNum}>Order #{String(order?._id||"").slice(-8).toUpperCase()}</div>
                  <div style={S.orderDate}>{order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "-"}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={orderStatusStyle(order?.status)}>{order?.status}</span>
                  <div style={S.orderTotal}>${Number(order?.total_amount||0).toFixed(2)}</div>
                </div>
              </div>
              <div style={S.orderItems}>
                {(order?.items||[]).map((item, j) => (
                  <div key={j} style={S.orderItem}>
                    <div style={S.orderItemDot} />
                    <div style={{ flex:1 }}>
                      <div style={S.orderItemTitle}>{item?.course_id?.title || "Course"}</div>
                      <div style={S.orderItemMeta}>
                        {item?.course_id?.type && <span style={S.orderItemBadge}>{String(item.course_id.type).toUpperCase()}</span>}
                        {item?.course_id?.credit_hours && <span>{item.course_id.credit_hours} credit hrs</span>}
                        {item?.include_textbook && <span>+ Textbook</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

/* ── Reusable atoms ──────────────────────────────────────────────── */
const SectionCard = ({ title, subtitle, children }) => (
  <div style={S.sectionCard}>
    <div style={S.sectionCardHead}>
      <div style={S.sectionCardTitle}>{title}</div>
      {subtitle && <div style={S.sectionCardSub}>{subtitle}</div>}
    </div>
    <div style={S.sectionCardBody}>{children}</div>
  </div>
);

const Field = ({ label, required, children }) => (
  <div style={S.field}>
    <label style={S.label}>{label}{required && <span style={{ color:"#ef4444", marginLeft:2 }}>*</span>}</label>
    {children}
  </div>
);

const InputWrap = ({ icon, children }) => (
  <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
    {icon && <span style={{ position:"absolute", left:12, display:"flex", alignItems:"center", color:"rgba(9,25,37,0.40)", pointerEvents:"none" }}>{icon}</span>}
    {children}
  </div>
);

const EyeBtn = ({ show, toggle }) => (
  <button type="button" onClick={toggle} style={{ position:"absolute", right:10, width:30, height:30, background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(9,25,37,0.40)" }}>
    {show ? <EyeOff size={15} /> : <Eye size={15} />}
  </button>
);

const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{
    width:40, height:22, borderRadius:999, cursor:"pointer",
    background: on ? "#2EABFE" : "#e2e8f0",
    position:"relative", transition:"background .2s", flexShrink:0,
  }}>
    <div style={{
      position:"absolute", top:3, left: on ? 21 : 3,
      width:16, height:16, borderRadius:999, background:"#fff",
      boxShadow:"0 1px 4px rgba(0,0,0,0.18)",
      transition:"left .2s",
    }} />
  </div>
);

/* ── CSS ─────────────────────────────────────────────────────────── */
const css = `
@keyframes toast-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.pf-spinner { width:34px;height:34px;border-radius:999px;border:3px solid rgba(2,8,23,0.10);border-top-color:#2EABFE;animation:pf-spin 1s linear infinite; }
@keyframes pf-spin { to{transform:rotate(360deg);} }
select.pf-select { appearance:none; }

/* Enhanced Mobile Responsive */
@media (max-width: 1024px) {
  .pf-shell { padding: 20px 16px 40px !important; }
  .pf-layout { grid-template-columns: 240px 1fr !important; gap: 16px !important; }
  .pf-avatar { width: 56px !important; height: 56px !important; }
  .pf-avatar-initial { font-size: 22px !important; }
}

@media (max-width: 768px) {
  .pf-shell { padding: 12px 12px 32px !important; }
  .pf-layout { 
    grid-template-columns: 1fr !important; 
    gap: 24px !important; 
    align-items: stretch !important;
  }
  .pf-sidebar { 
    order: 2; 
    position: static !important; 
    top: auto !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
  }
  .pf-avatar-card { 
    margin-bottom: 16px !important; 
    text-align: center !important;
    width: 100% !important;
  }
  .pf-main { order: 1; }
  .pf-page-title { font-size: 24px !important; line-height: 1.2 !important; }
  .pf-avatar { width: 64px !important; height: 64px !important; margin: 0 auto 12px !important; }
  .pf-avatar-initial { font-size: 24px !important; }
  .pf-avatar-name { font-size: 16px !important; }
  .pf-side-nav { 
    width: 100% !important;
    padding: 12px !important; 
    gap: 8px !important; 
    display: grid !important;
  }
  .pf-side-nav-btn { 
    padding: 14px 16px !important; 
    justify-content: space-between !important; 
    min-height: 52px !important; 
    font-size: 15px !important;
    gap: 8px !important;
    border-radius: 12px !important;
  }
  .pf-side-nav-btn svg { width: 18px !important; height: 18px !important; }
  .pf-two-col { grid-template-columns: 1fr !important; gap: 16px !important; }
  .pf-input, select, input[type="date"] { 
    height: 52px !important; 
    padding-left: 46px !important; 
    padding-right: 46px !important; 
    font-size: 16px !important; /* iOS zoom prevent */
  }
  .pf-save-btn, .pf-browse-btn { 
    min-height: 52px !important; 
    padding: 14px 28px !important; 
    font-size: 15px !important;
  }
  .pf-section-card-head { padding: 20px 16px 14px !important; }
  .pf-section-card-body { padding: 16px 16px 24px !important; }
  .pf-notif-table { display: block !important; }
  .pf-notif-header { display: none !important; }
  .pf-notif-row { 
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 16px !important;
    padding: 20px 16px !important;
  }
  .pf-notif-row > div:first-child { margin-bottom: 12px !important; }
  .pf-notif-toggle-cell { width: 100% !important; justify-content: center !important; }
  .pf-notif-label { font-size: 16px !important; }
  .pf-order-top { 
    flex-direction: column !important; 
    align-items: stretch !important; 
    gap: 12px !important;
  }
  .pf-order-total { font-size: 20px !important; text-align: center !important; }
  .pf-goal-card { padding: 20px !important; }
}

@media (max-width: 480px) {
  .pf-shell { padding: 12px 8px 28px !important; }
  .pf-page-title { font-size: 22px !important; }
  .pf-page-kicker { font-size: 11px !important; }
  .pf-section-card-head { padding: 20px 16px 14px !important; }
  .pf-section-card-body { padding: 20px 16px 24px !important; }
  .pf-side-nav-btn { padding: 18px 20px !important; font-size: 15px !important; }
  .pf-side-nav { gap: 6px !important; padding: 12px !important; }
  .pf-notif-row { padding: 16px 12px !important; gap: 20px !important; }
  .pf-label { font-size: 12px !important; }
  .pf-avatar-email, .pf-avatar-nmls { font-size: 12px !important; }
  .pf-order-item-title { font-size: 14px !important; }
  /* Full-width toast */
  div[style*="position:fixed"][style*="bottom:24"] { 
    bottom: 12px !important; 
    right: 12px !important; 
    left: 12px !important; 
    max-width: none !important; 
    padding: 16px 20px !important;
  }
  /* Larger toggle for tiny screens */
  div[style*="width:40"][style*="height:22"] { 
    width: 52px !important; 
    height: 28px !important; 
  }
  div[style*="position:absolute"][style*="top:3"] { 
    width: 20px !important; 
    height: 20px !important; 
    top: 4px !important;
  }
}

/* Additional utility for inputs/buttons */
.pf-input, .pf-select, input[type="date"], .pf-input { min-height: 52px !important; }
.pf-save-btn, .pf-browse-btn { min-height: 52px !important; touch-action: manipulation; }
.pf-shell * { box-sizing: border-box !important; }
@media (hover: none) { .pf-side-nav-btn { min-height: 52px !important; } }
`

/* ── Styles ──────────────────────────────────────────────────────── */
const S = {
  shell:            { maxWidth:1180, margin:"0 auto", padding:"24px 18px 48px", className:"pf-shell" },
  center:           { minHeight:"60vh", display:"grid", placeItems:"center" },
  pageKicker:       { fontSize:12, fontWeight:800, color:"#2EABFE", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 },
  pageTitle:        { fontSize:26, fontWeight:950, color:"#091925", letterSpacing:"-0.4px", marginBottom:22, className:"pf-page-title" },
  pageHeader:       { marginBottom:4 },

  layout:           { display:"grid", gridTemplateColumns:"260px 1fr", gap:20, alignItems:"start", className:"pf-layout" },

  // Sidebar
  sidebar:          { display:"grid", gap:20, position:"sticky", top:78, '@media (max-width: 768px)': { flexDirection: 'column', alignItems: 'center' } },
  avatarCard:       { borderRadius:18, background:"#fff", border:"1px solid rgba(2,8,23,0.08)", padding:"22px 18px", textAlign:"center", className: "pf-avatar-card" },
  avatar:           { width:64, height:64, borderRadius:999, background:"linear-gradient(135deg,#2EABFE,#00B4B4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" },
  avatarInitial:    { fontSize:26, fontWeight:900, color:"#fff" },
  avatarName:       { fontWeight:900, fontSize:15, color:"#091925", marginBottom:4 },
  avatarEmail:      { fontSize:12, color:"rgba(9,25,37,0.50)", fontWeight:600, marginBottom:6 },
  avatarNmls:       { display:"inline-block", padding:"3px 10px", borderRadius:999, background:"rgba(46,171,254,0.10)", border:"1px solid rgba(46,171,254,0.22)", fontSize:11, fontWeight:800, color:"#2EABFE" },
  sideNav:          { borderRadius:18, background:"#fff", border:"1px solid rgba(2,8,23,0.08)", padding:8, display:"grid", gap:2 },
  sideNavBtn:       { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:12, border:"none", background:"transparent", cursor:"pointer", fontWeight:700, fontSize:13, color:"rgba(9,25,37,0.65)", textAlign:"left", transition:"all .15s", fontFamily:"inherit", className:"pf-side-nav-btn" },
  sideNavBtnActive: { background:"rgba(46,171,254,0.08)", color:"#091925", border:"1px solid rgba(46,171,254,0.18)" },

  // Main
  main:             { display:"grid", gap:0 },
  sectionCard:      { borderRadius:20, background:"#fff", border:"1px solid rgba(2,8,23,0.08)", overflow:"hidden" },
  sectionCardHead:  { padding:"22px 24px 16px", borderBottom:"1px solid rgba(2,8,23,0.06)" },
  sectionCardTitle: { fontWeight:950, fontSize:17, color:"#091925", marginBottom:4 },
  sectionCardSub:   { fontSize:13, color:"rgba(9,25,37,0.50)", fontWeight:600 },
  sectionCardBody:  { padding:"22px 24px" },

  // Form
  form:             { display:"grid", gap:16 },
  twoCol:           { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, className:"pf-two-col" },
  field:            { display:"grid", gap:7 },
  label:            { fontSize:12, fontWeight:700, color:"rgba(9,25,37,0.65)" },
  fieldHint:        { fontSize:11, color:"rgba(9,25,37,0.42)", fontWeight:600, marginTop:3 },
  input:            { width:"100%", height:44, padding:"0 12px 0 38px", fontSize:13, fontWeight:600, color:"#091925", background:"#f8fafc", border:"1.5px solid transparent", borderRadius:12, outline:"none", fontFamily:"inherit", transition:"all .18s", boxSizing:"border-box" },
  formFooter:       { display:"flex", justifyContent:"flex-end", paddingTop:4 },
  saveBtn:          { display:"inline-flex", alignItems:"center", gap:7, padding:"11px 20px", borderRadius:12, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:13, transition:"all .18s" },

  // Notifications
  notifTable:       { display:"grid", gap:0, border:"1px solid rgba(2,8,23,0.07)", borderRadius:14, overflow:"hidden", className:"pf-notif-table" },
  notifHeader:      { display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:"rgba(2,8,23,0.03)", borderBottom:"1px solid rgba(2,8,23,0.07)", className:"pf-notif-header" },
  notifColLabel:    { width:80, textAlign:"center", fontSize:11, fontWeight:800, color:"rgba(9,25,37,0.55)", display:"flex", alignItems:"center", justifyContent:"center", gap:5 },
  notifRow:         { display:"flex", alignItems:"center", gap:8, padding:"14px 16px", borderBottom:"1px solid rgba(2,8,23,0.05)", className:"pf-notif-row" },
  notifLabel:       { fontWeight:800, fontSize:13, color:"rgba(9,25,37,0.85)", marginBottom:2 },
  notifSub:         { fontSize:11, fontWeight:600, color:"rgba(9,25,37,0.45)" },
  notifToggleCell:  { width:80, display:"flex", justifyContent:"center", className:"pf-notif-toggle-cell" },

  // License goals
  goalCard:         { borderRadius:14, border:"1px solid rgba(46,171,254,0.20)", background:"rgba(46,171,254,0.04)", padding:"14px 16px" },
  goalCardTitle:    { fontWeight:800, fontSize:13, color:"rgba(9,25,37,0.80)", marginBottom:10 },
  goalCardBody:     { display:"grid", gap:8 },
  goalItem:         { display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:700, color:"rgba(9,25,37,0.75)" },

  // Payment / empty
  emptyPayment:     { textAlign:"center", padding:"36px 20px" },
  emptyPaymentTitle:{ fontWeight:900, fontSize:16, color:"rgba(9,25,37,0.80)", marginTop:14, marginBottom:6 },
  emptyPaymentSub:  { fontSize:13, color:"rgba(9,25,37,0.50)", fontWeight:600, lineHeight:1.6, maxWidth:360, margin:"0 auto 16px" },
  securityNote:     { display:"inline-flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:10, background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.20)", fontSize:12, fontWeight:600, color:"rgba(21,128,61,0.85)", maxWidth:400, textAlign:"left" },
  browseBtn:        { display:"inline-flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:12, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:13 },

  // Orders
  orderCard:        { borderRadius:14, border:"1px solid rgba(2,8,23,0.08)", background:"#fff", padding:"14px 16px" },
  orderTop:         { display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10, marginBottom:12, className:"pf-order-top" },
  orderNum:         { fontWeight:900, fontSize:14, color:"rgba(9,25,37,0.85)" },
  orderDate:        { fontSize:12, fontWeight:600, color:"rgba(9,25,37,0.45)", marginTop:3 },
  orderTotal:       { fontWeight:900, fontSize:16, color:"#091925" },
  orderItems:       { display:"grid", gap:8, paddingTop:10, borderTop:"1px solid rgba(2,8,23,0.06)" },
  orderItem:        { display:"flex", alignItems:"flex-start", gap:10 },
  orderItemDot:     { width:6, height:6, borderRadius:999, background:"#2EABFE", flexShrink:0, marginTop:5 },
  orderItemTitle:   { fontWeight:800, fontSize:13, color:"rgba(9,25,37,0.85)", marginBottom:4 },
  orderItemMeta:    { display:"flex", gap:8, flexWrap:"wrap", fontSize:11, fontWeight:700, color:"rgba(9,25,37,0.50)" },
  orderItemBadge:   { padding:"2px 7px", borderRadius:999, background:"rgba(46,171,254,0.10)", color:"#2EABFE", border:"1px solid rgba(46,171,254,0.20)" },
};

export default Profile; 