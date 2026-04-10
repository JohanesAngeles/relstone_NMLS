import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Lock, Phone, MapPin, Hash,
  BookOpen, Bell, Save, CheckCircle, AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import API from '../../../api/axios';

/* ─── Field ──────────────────────────────────────────────────────── */
const Field = ({ label, required, children, hint }) => (
  <div>
    <label style={{ display:'block', fontSize:11, fontWeight:800, color:'#5B7384', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>
      {label} {required && <span style={{ color:'#ef4444' }}>*</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize:11, color:'#7FA8C4', marginTop:4, fontWeight:500 }}>{hint}</div>}
  </div>
);

const inputStyle = {
  width:'100%', padding:'10px 13px', borderRadius:9,
  border:'1.5px solid #e2e8f0', background:'#fafbfc',
  fontSize:13, fontWeight:500, color:'#091925',
  outline:'none', fontFamily:"'Poppins',sans-serif",
  boxSizing:'border-box', transition:'border-color .15s',
};

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden', marginBottom:16 }}>
    <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:34, height:34, borderRadius:10, background:'rgba(46,171,254,0.10)', border:'1px solid rgba(46,171,254,0.20)', display:'grid', placeItems:'center', color:'#2EABFE', flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:14, fontWeight:800, color:'#091925' }}>{title}</div>
        {subtitle && <div style={{ fontSize:12, color:'#7FA8C4', marginTop:1 }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ padding:'20px' }}>
      {children}
    </div>
  </div>
);

/* ─── AdminAddStudent ────────────────────────────────────────────── */
const AdminAddStudent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Account
    name:     '',
    email:    '',
    password: '',
    // Profile
    nmls_id:   '',
    state:     '',
    phone:     '',
    address:   '',
    town_city: '',
    zip_code:  '',
    company:   '',
    work_phone:'',
    home_phone:'',
    // License goals
    license_type: '',
    target_state: '',
    target_date:  '',
    experience:   '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (fieldErrors[key]) setFieldErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password.trim())    errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setError('');
    try {
      await API.post('/admin/students', {
        ...form,
        role: 'student',
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/students'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const US_STATES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  ];

  if (success) return (
    <div style={{ padding:'28px 0', fontFamily:"'Poppins',sans-serif" }}>
      <div style={{ maxWidth:480, margin:'60px auto', textAlign:'center', background:'#fff', borderRadius:20, padding:'48px 32px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(16,185,129,0.12)', border:'2px solid rgba(16,185,129,0.30)', display:'grid', placeItems:'center', margin:'0 auto 20px' }}>
          <CheckCircle size={36} color="#10b981" />
        </div>
        <div style={{ fontSize:22, fontWeight:800, color:'#091925', marginBottom:8 }}>Student Created!</div>
        <div style={{ fontSize:14, color:'#7FA8C4', fontWeight:500 }}>Redirecting to students list…</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding:'28px 0', fontFamily:"'Poppins',sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <button
          onClick={() => navigate('/admin/students')}
          style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 14px', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer', fontWeight:700, fontSize:13, color:'#5B7384', fontFamily:"'Poppins',sans-serif", marginBottom:16 }}
        >
          <ArrowLeft size={14} /> Back to Students
        </button>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#091925', marginBottom:4 }}>Add New Student</h1>
        <p style={{ fontSize:13, color:'#5B7384' }}>Create a new student account. Required fields are marked with <span style={{ color:'#ef4444' }}>*</span></p>
        <div style={{ height:2, background:'linear-gradient(90deg,#2EABFE,transparent)', borderRadius:99, marginTop:12 }} />
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', borderRadius:12, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.22)', color:'rgba(185,28,28,1)', fontSize:13, fontWeight:700, marginBottom:16 }}>
          <AlertCircle size={16} style={{ flexShrink:0 }} /> {error}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16, alignItems:'start' }}>

        {/* ── LEFT: Main Form ── */}
        <div>

          {/* Account Info */}
          <SectionCard icon={<User size={16} />} title="Account Information" subtitle="Login credentials for the student">
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Field label="Full Name" required>
                <input
                  style={{ ...inputStyle, borderColor: fieldErrors.name ? '#ef4444' : '#e2e8f0' }}
                  placeholder="e.g. Juan dela Cruz"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  autoComplete="off"
                />
                {fieldErrors.name && <div style={{ fontSize:11, color:'#ef4444', marginTop:4 }}>{fieldErrors.name}</div>}
              </Field>

              <Field label="Email Address" required>
                <input
                  style={{ ...inputStyle, borderColor: fieldErrors.email ? '#ef4444' : '#e2e8f0' }}
                  type="email"
                  placeholder="e.g. juan@gmail.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  autoComplete="new-email"
                />
                {fieldErrors.email && <div style={{ fontSize:11, color:'#ef4444', marginTop:4 }}>{fieldErrors.email}</div>}
              </Field>

              <Field label="Password" required hint="Minimum 8 characters. Student can change this after login.">
                <div style={{ position:'relative' }}>
                  <input
                    style={{ ...inputStyle, borderColor: fieldErrors.password ? '#ef4444' : '#e2e8f0', paddingRight:44 }}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Set a temporary password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#7FA8C4', display:'grid', placeItems:'center' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && <div style={{ fontSize:11, color:'#ef4444', marginTop:4 }}>{fieldErrors.password}</div>}
              </Field>
            </div>
          </SectionCard>

          {/* Profile */}
          <SectionCard icon={<Hash size={16} />} title="Profile Information" subtitle="NMLS and personal details">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="NMLS ID">
                <input style={inputStyle} placeholder="e.g. 1234567" value={form.nmls_id} onChange={e => set('nmls_id', e.target.value)} />
              </Field>

              <Field label="State">
                <select
                  style={{ ...inputStyle, cursor:'pointer' }}
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                >
                  <option value="">— Select State —</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Phone">
                <input style={inputStyle} placeholder="e.g. (555) 123-4567" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </Field>

              <Field label="Work Phone">
                <input style={inputStyle} placeholder="e.g. (555) 123-4567" value={form.work_phone} onChange={e => set('work_phone', e.target.value)} />
              </Field>

              <Field label="Home Phone">
                <input style={inputStyle} placeholder="e.g. (555) 123-4567" value={form.home_phone} onChange={e => set('home_phone', e.target.value)} />
              </Field>

              <Field label="Company">
                <input style={inputStyle} placeholder="e.g. ABC Mortgage" value={form.company} onChange={e => set('company', e.target.value)} />
              </Field>

              <Field label="Address" >
                <input style={inputStyle} placeholder="Street address" value={form.address} onChange={e => set('address', e.target.value)} />
              </Field>

              <Field label="Town / City">
                <input style={inputStyle} placeholder="e.g. New York" value={form.town_city} onChange={e => set('town_city', e.target.value)} />
              </Field>

              <Field label="ZIP Code">
                <input style={inputStyle} placeholder="e.g. 10001" value={form.zip_code} onChange={e => set('zip_code', e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          {/* License Goals */}
          <SectionCard icon={<BookOpen size={16} />} title="License Goals" subtitle="Optional — can be filled by student later">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="License Type">
                <select style={{ ...inputStyle, cursor:'pointer' }} value={form.license_type} onChange={e => set('license_type', e.target.value)}>
                  <option value="">— Select —</option>
                  <option value="MLO">Mortgage Loan Originator (MLO)</option>
                  <option value="Broker">Mortgage Broker</option>
                  <option value="Lender">Mortgage Lender</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Target State">
                <select style={{ ...inputStyle, cursor:'pointer' }} value={form.target_state} onChange={e => set('target_state', e.target.value)}>
                  <option value="">— Select State —</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Target Date">
                <input style={inputStyle} type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)} />
              </Field>

              <Field label="Experience Level">
                <select style={{ ...inputStyle, cursor:'pointer' }} value={form.experience} onChange={e => set('experience', e.target.value)}>
                  <option value="">— Select —</option>
                  <option value="beginner">Beginner (0–1 year)</option>
                  <option value="intermediate">Intermediate (1–5 years)</option>
                  <option value="experienced">Experienced (5+ years)</option>
                </select>
              </Field>
            </div>
          </SectionCard>

        </div>

        {/* ── RIGHT: Summary + Submit ── */}
        <div style={{ position:'sticky', top:20 }}>
          <div style={{ background:'#fff', borderRadius:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', fontSize:13, fontWeight:800, color:'#091925' }}>
              Summary
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Name',    value: form.name    || '—' },
                { label:'Email',   value: form.email   || '—' },
                { label:'NMLS ID', value: form.nmls_id || '—' },
                { label:'State',   value: form.state   || '—' },
                { label:'Company', value: form.company || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:12, gap:8 }}>
                  <span style={{ color:'#7FA8C4', fontWeight:600, flexShrink:0 }}>{label}</span>
                  <span style={{ color:'#091925', fontWeight:700, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div style={{ background:'rgba(46,171,254,0.05)', border:'1px solid rgba(46,171,254,0.18)', borderRadius:12, padding:'14px 16px', marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#2EABFE', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>What happens next</div>
            {[
              'Student account is created immediately',
              'Account is marked as verified (no OTP needed)',
              'Student can log in with the password you set',
              'Student can update their own profile later',
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6, fontSize:12, fontWeight:500, color:'rgba(11,18,32,0.65)' }}>
                <CheckCircle size={13} style={{ color:'#2EABFE', flexShrink:0, marginTop:1 }} />
                {item}
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ width:'100%', padding:'13px', borderRadius:11, border:'none', background: saving ? '#7FA8C4' : '#091925', color:'#fff', fontWeight:800, fontSize:14, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:"'Poppins',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(9,25,37,0.18)' }}
          >
            <Save size={16} />
            {saving ? 'Creating Account…' : 'Create Student Account'}
          </button>

          <button
            onClick={() => navigate('/admin/students')}
            style={{ width:'100%', padding:'11px', borderRadius:11, border:'1px solid #e2e8f0', background:'#fff', color:'#5B7384', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:"'Poppins',sans-serif", marginTop:8 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddStudent;