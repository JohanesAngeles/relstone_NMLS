import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart, BookOpen, MapPin, Phone,
  Mail, Building2, CreditCard, CheckCircle2, Tag, X,
  ChevronDown, ChevronUp,
} from "lucide-react";
import API from "../../api/axios";
import Layout from "../../components/Layout";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart]           = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [orderId, setOrderId]     = useState(null);
  const [userId, setUserId]       = useState(null); // ← real user ID for voucher check

  // ── Voucher state ──────────────────────────────────────────────
  const [voucherCode,    setVoucherCode]    = useState('');
  const [voucherApplied, setVoucherApplied] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError,   setVoucherError]   = useState('');
  const [showVoucher,    setShowVoucher]    = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", companyName: "",
    country: "United States", streetAddress: "",
    townCity: "", state: "", zipCode: "",
    phone: "", email: "", additionalInfo: "",
  });

  // ── Load cart + autofill profile ──────────────────────────────
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    const fetchUserProfile = async () => {
      try {
        const res  = await API.get("/auth/me");
        const user = res.data.user;
        if (!user) return;

        setUserId(user._id); // ← store user ID for voucher validation

        const nameParts = (user.name || "").trim().split(/\s+/);
        const fName = nameParts[0] || "";
        const lName = nameParts.slice(1).join(" ") || "";

        let streetAddress = user.address || "";
        let townCity      = user.town_city || "";
        let addrState     = user.state || "";
        let zipCode       = user.zip_code || "";

        if (user.address && (!townCity || !zipCode)) {
          const parts = user.address.split(",").map((s) => s.trim());
          if (parts[0]) streetAddress = parts[0];
          if (parts[1] && !townCity)   townCity  = parts[1];
          if (parts[2]) {
            const stateZip    = parts[2].trim().split(" ");
            const parsedZip   = stateZip.pop() || "";
            const parsedState = stateZip.join(" ") || "";
            if (parsedZip   && !zipCode)   zipCode   = parsedZip;
            if (parsedState && !addrState) addrState = parsedState;
          }
        }

        setForm((prev) => ({
          ...prev,
          firstName:   fName,
          lastName:    lName,
          email:       user.email    || "",
          phone:       user.phone    || user.work_phone || "",
          companyName: user.company  || "",
          streetAddress,
          townCity,
          state: addrState,
          zipCode,
        }));
      } catch (err) {
        console.error("Autofill error:", err);
      }
    };
    fetchUserProfile();
  }, []);

  // ── Totals ────────────────────────────────────────────────────
  const subtotal = useMemo(() =>
    cart.reduce((sum, item) => sum + Number(item.price || 0), 0), [cart]);

  const textbookTotal = useMemo(() =>
    cart.reduce((sum, item) =>
      sum + (item.include_textbook ? Number(item.textbook_price || 0) : 0), 0), [cart]);

  const beforeDiscount = subtotal + textbookTotal;
  const discount       = voucherApplied ? Number(voucherApplied.discount || 0) : 0;
  const total          = Math.max(0, beforeDiscount - discount);

  // ── Voucher apply ─────────────────────────────────────────────
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherError('');
    try {
      const res = await API.post('/admin/vouchers/validate', {
        code:         voucherCode.trim(),
        order_amount: beforeDiscount,
        user_id:      userId, // ← pass real user ID so per-user limit is enforced
          course_ids:   cart.map(item => item._id), // ← add this

      });
      setVoucherApplied({
        ...res.data.voucher,
        discount: res.data.discount,
      });
      setVoucherError('');
    } catch (err) {
      setVoucherError(err.response?.data?.message || 'Invalid voucher code.');
      setVoucherApplied(null);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherApplied(null);
    setVoucherCode('');
    setVoucherError('');
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Place order ───────────────────────────────────────────────
  const handleProceedCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { setError("Your cart is empty."); return; }
    setLoading(true); setError("");
    try {
      const payload = {
        items: cart.map((item) => ({
          course_id:        item._id,
          include_textbook: item.include_textbook || false,
          price:            Number(item.price || 0),
          textbook_price:   item.include_textbook ? Number(item.textbook_price || 0) : 0,
        })),
        total_amount:     total,
        voucher_code:     voucherApplied?.code || null,
        voucher_discount: discount             || 0,
        billing: {
          first_name:      form.firstName,
          last_name:       form.lastName,
          company_name:    form.companyName,
          country:         form.country,
          street_address:  form.streetAddress,
          town_city:       form.townCity,
          state:           form.state,
          zip_code:        form.zipCode,
          phone:           form.phone,
          email:           form.email,
          additional_info: form.additionalInfo,
        },
      };

      const res = await API.post("/orders", payload);
      setOrderId(res.data?._id || res.data?.order?._id || "");
      localStorage.removeItem("cart");
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────
  if (submitted) return (
    <Layout>
      <style>{css}</style>
      <div style={S.successWrap}>
        <div style={S.successCard}>
          <div style={S.successIcon}><CheckCircle2 size={40} /></div>
          <h1 style={S.successTitle}>Order Placed!</h1>
          <p style={S.successSub}>
            Your order has been saved successfully.{" "}
            {orderId && <span>Order ID: <strong>#{String(orderId).slice(-6).toUpperCase()}</strong></span>}
          </p>
          <p style={S.successNote}>
            Once payment is confirmed by an admin, your courses will be unlocked and available to start.
          </p>
          <div style={S.successActions}>
            <button style={S.primaryBtn} onClick={() => navigate("/dashboard")} type="button">
              Go to Dashboard
            </button>
            <button style={S.secondaryBtn} onClick={() => navigate("/courses")} type="button">
              Browse More Courses
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{css}</style>
      <div style={S.shell}>

        {/* Page header */}
        <div style={S.pageHeader}>
          <div style={S.pageHeaderLeft}>
            <button type="button" style={S.backBtn} onClick={() => navigate("/courses")}>
              <ArrowLeft size={15} /><span>Back to Courses</span>
            </button>
            <div>
              <div style={S.pageTitle}>Checkout</div>
              <div style={S.pageSub}>Billing details and order summary</div>
            </div>
          </div>
          <div style={S.cartBadge}>
            <ShoppingCart size={15} />
            <span>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {error && <div style={S.errorBanner}>⚠️ {error}</div>}

        <div style={S.grid}>

          {/* ── LEFT: Billing form ── */}
          <section style={S.card}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>Billing &amp; Shipping</div>
              <div style={S.sectionSub}>Enter the required information before proceeding</div>
            </div>
            <form onSubmit={handleProceedCheckout} style={S.form}>
              <div style={S.twoCol}>
                <Field label="First Name*"  name="firstName"  value={form.firstName}  onChange={handleChange} placeholder="First name"  required />
                <Field label="Last Name*"   name="lastName"   value={form.lastName}   onChange={handleChange} placeholder="Last name"   required />
              </div>
              <Field label="Company Name (optional)" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company name" icon={<Building2 size={16} />} />
              <Field label="Country / Region*" name="country" value={form.country} onChange={handleChange} placeholder="Country / Region" required />
              <Field label="Street Address*" name="streetAddress" value={form.streetAddress} onChange={handleChange} placeholder="Street address" required />
              <div style={S.twoCol}>
                <Field label="Town / City*" name="townCity" value={form.townCity} onChange={handleChange} placeholder="Town / City" required />
                <Field label="State*" name="state" value={form.state} onChange={handleChange} placeholder="State" icon={<MapPin size={16} />} required />
              </div>
              <div style={S.twoCol}>
                <Field label="Zip Code*" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="Zip code" required />
                <Field label="Phone*" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" icon={<Phone size={16} />} required />
              </div>
              <Field label="Email Address*" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" icon={<Mail size={16} />} required />
              <div style={S.field}>
                <label style={S.label}>Additional Information</label>
                <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange}
                  placeholder="Order notes, special instructions, or anything else"
                  style={S.textarea} rows={4} />
              </div>
              <div style={S.actionRow}>
                <button type="button" style={S.secondaryBtn} onClick={() => navigate("/courses")}>
                  Continue Browsing
                </button>
                <button type="submit" style={{ ...S.primaryBtn, ...(loading ? S.primaryBtnLoading : {}) }} disabled={loading}>
                  {loading
                    ? <><span className="co-spin" /> Placing Order…</>
                    : <><CreditCard size={16} /><span>Place Order</span></>
                  }
                </button>
              </div>
            </form>
          </section>

          {/* ── RIGHT: Order summary ── */}
          <aside style={S.summaryCard}>
            <div style={S.sectionHead}>
              <div style={S.sectionTitle}>Your Order</div>
              <div style={S.sectionSub}>Summary of selected courses</div>
            </div>

            {cart.length === 0 ? (
              <div style={S.emptyBox}>
                <div style={S.emptyTitle}>No courses selected</div>
                <div style={S.emptySub}>Go back to the course catalog and add courses first.</div>
                <button type="button" style={S.secondaryBtn} onClick={() => navigate("/courses")}>Back to Courses</button>
              </div>
            ) : (
              <>
                {/* Course list */}
                <div style={S.summaryList}>
                  {cart.map((item) => (
                    <div key={item._id} style={S.summaryItem}>
                      <div style={S.summaryTop}>
                        <div style={S.summaryCourseWrap}>
                          <div style={S.courseIcon}><BookOpen size={16} /></div>
                          <div>
                            <div style={S.summaryCourseTitle}>{item.title}</div>
                            <div style={S.summaryMeta}>{item.type} · {item.credit_hours} credit hours</div>
                          </div>
                        </div>
                        <div style={S.summaryPrice}>${Number(item.price || 0).toFixed(2)}</div>
                      </div>
                      {item.include_textbook && (
                        <div style={S.textbookRow}>
                          <span>Textbook</span>
                          <span>+${Number(item.textbook_price || 0).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Voucher section ── */}
                <div style={{ marginTop:16 }}>
                  <button
                    type="button"
                    onClick={() => setShowVoucher(v => !v)}
                    style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px', borderRadius:12, border:'1px solid rgba(46,171,254,0.25)', background:'rgba(46,171,254,0.05)', cursor:'pointer', fontWeight:700, fontSize:13, color:'#2EABFE', fontFamily:'inherit' }}
                  >
                    <Tag size={14} />
                    <span style={{ flex:1, textAlign:'left' }}>
                      {voucherApplied ? `Voucher applied: ${voucherApplied.code}` : 'Have a promo code?'}
                    </span>
                    {voucherApplied
                      ? <span style={{ fontSize:12, fontWeight:800, color:'#10b981' }}>-${discount.toFixed(2)}</span>
                      : (showVoucher ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
                    }
                  </button>

                  {/* Voucher input */}
                  {showVoucher && !voucherApplied && (
                    <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:8 }}>
                      <div style={{ display:'flex', gap:8 }}>
                        <input
                          value={voucherCode}
                          onChange={e => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
                          placeholder="Enter voucher code"
                          style={{ ...S.input, height:44, fontFamily:'monospace', fontWeight:700, letterSpacing:'0.05em', flex:1 }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyVoucher}
                          disabled={voucherLoading || !voucherCode.trim()}
                          style={{ padding:'0 16px', height:44, borderRadius:12, border:'none', background: voucherLoading || !voucherCode.trim() ? '#c8d8e4' : '#2EABFE', color:'#fff', fontWeight:800, fontSize:13, cursor: voucherLoading ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}
                        >
                          {voucherLoading ? '…' : 'Apply'}
                        </button>
                      </div>
                      {voucherError && (
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#ef4444', padding:'8px 12px', borderRadius:9, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.20)' }}>
                          <X size={12} /> {voucherError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Voucher applied badge */}
                  {voucherApplied && (
                    <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.22)' }}>
                      <CheckCircle2 size={15} style={{ color:'#10b981', flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:'rgba(11,18,32,0.80)' }}>
                          Code <span style={{ fontFamily:'monospace', color:'#10b981' }}>{voucherApplied.code}</span> applied
                        </div>
                        <div style={{ fontSize:11, fontWeight:600, color:'rgba(11,18,32,0.50)', marginTop:2 }}>
                          {voucherApplied.discount_type === 'percentage'
                            ? `${voucherApplied.discount_value}% off`
                            : `$${voucherApplied.discount_value} off`}
                          {voucherApplied.description ? ` · ${voucherApplied.description}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        style={{ width:24, height:24, borderRadius:6, border:'1px solid rgba(2,8,23,0.12)', background:'transparent', cursor:'pointer', display:'grid', placeItems:'center', color:'rgba(11,18,32,0.45)' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div style={S.totals}>
                  <div style={S.totalRow}>
                    <span>Subtotal</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>
                  {textbookTotal > 0 && (
                    <div style={S.totalRow}>
                      <span>Textbooks</span>
                      <strong>${textbookTotal.toFixed(2)}</strong>
                    </div>
                  )}
                  {voucherApplied && (
                    <div style={{ ...S.totalRow, color:'#10b981' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <Tag size={12} /> Voucher ({voucherApplied.code})
                      </span>
                      <strong>-${discount.toFixed(2)}</strong>
                    </div>
                  )}
                  <div style={{ ...S.totalRow, ...S.grandTotal }}>
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                </div>

                <div style={S.pendingNote}>
                  <CheckCircle2 size={14} style={{ flexShrink:0, marginTop:1 }} />
                  <span>Your order will be marked <strong>pending</strong> until payment is confirmed by an admin.</span>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  );
};

/* ─── Field component ────────────────────────────────────────────── */
const Field = ({ label, name, value, onChange, placeholder, required, type = "text", icon }) => (
  <div style={S.field}>
    <label style={S.label}>{label}</label>
    <div style={S.inputWrap}>
      {icon && <span style={S.inputIcon}>{icon}</span>}
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        required={required} style={{ ...S.input, ...(icon ? { paddingLeft: 42 } : {}) }} />
    </div>
  </div>
);

/* ─── CSS ─────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box}
input:focus,textarea:focus{border-color:rgba(46,171,254,0.50)!important;box-shadow:0 0 0 3px rgba(46,171,254,0.12);}
.co-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.35);border-top-color:#fff;animation:cospin 0.8s linear infinite;display:inline-block;}
@keyframes cospin{to{transform:rotate(360deg);}}
@media(max-width:768px){
  .checkout-grid{grid-template-columns:1fr !important;}
  .two-col{grid-template-columns:1fr !important;}
}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  shell:             { maxWidth:1180, margin:"0 auto", padding:"20px 18px 48px" },
  pageHeader:        { display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 },
  pageHeaderLeft:    { display:"flex", alignItems:"center", gap:12 },
  backBtn:           { display:"inline-flex", alignItems:"center", gap:7, padding:"9px 14px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.82)", flexShrink:0 },
  pageTitle:         { fontWeight:950, fontSize:18, color:"#091925", letterSpacing:"-0.2px" },
  pageSub:           { fontSize:12, fontWeight:700, color:"rgba(9,25,37,0.50)", marginTop:2 },
  cartBadge:         { display:"inline-flex", alignItems:"center", gap:8, padding:"10px 14px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.82)" },
  grid:              { display:"grid", gridTemplateColumns:"1.2fr 0.8fr", gap:16, alignItems:"start" },
  card:              { borderRadius:22, background:"rgba(255,255,255,0.88)", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"0 18px 48px rgba(2,8,23,0.10)", padding:22 },
  summaryCard:       { borderRadius:22, background:"rgba(255,255,255,0.88)", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"0 18px 48px rgba(2,8,23,0.10)", padding:22, position:"sticky", top:78 },
  sectionHead:       { marginBottom:18 },
  sectionTitle:      { fontWeight:950, fontSize:17, color:"rgba(11,18,32,0.88)" },
  sectionSub:        { marginTop:4, fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.50)" },
  form:              { display:"grid", gap:14 },
  twoCol:            { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  field:             { display:"grid", gap:7 },
  label:             { fontSize:12, fontWeight:700, color:"rgba(9,25,37,0.65)", paddingLeft:2 },
  inputWrap:         { position:"relative" },
  inputIcon:         { position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#98a0aa", display:"flex", alignItems:"center", pointerEvents:"none" },
  input:             { width:"100%", height:48, padding:"0 14px", border:"1.5px solid #e3e5e8", borderRadius:14, fontSize:14, background:"#fafafa", color:"#1a1a1a", outline:"none", fontFamily:"inherit", boxSizing:"border-box" },
  textarea:          { width:"100%", padding:"14px", border:"1.5px solid #e3e5e8", borderRadius:14, fontSize:14, background:"#fafafa", color:"#1a1a1a", outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" },
  actionRow:         { display:"flex", gap:12, justifyContent:"flex-end", marginTop:6, flexWrap:"wrap" },
  primaryBtn:        { display:"inline-flex", alignItems:"center", gap:8, padding:"12px 20px", borderRadius:14, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:950, fontSize:14 },
  primaryBtnLoading: { opacity:0.75, cursor:"not-allowed" },
  secondaryBtn:      { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 16px", borderRadius:14, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:900, fontSize:14, color:"rgba(11,18,32,0.82)" },
  summaryList:       { display:"grid", gap:12 },
  summaryItem:       { borderRadius:16, border:"1px solid rgba(2,8,23,0.08)", background:"#fff", padding:12, display:"grid", gap:8 },
  summaryTop:        { display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start" },
  summaryCourseWrap: { display:"flex", gap:10, flex:1, minWidth:0 },
  courseIcon:        { width:36, height:36, borderRadius:14, background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.18)", display:"grid", placeItems:"center", color:"#091925", flexShrink:0 },
  summaryCourseTitle:{ fontWeight:900, color:"rgba(11,18,32,0.86)", lineHeight:1.3 },
  summaryMeta:       { marginTop:4, fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.50)" },
  summaryPrice:      { fontWeight:950, color:"rgba(11,18,32,0.82)", whiteSpace:"nowrap" },
  textbookRow:       { display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:700, color:"rgba(11,18,32,0.68)", paddingTop:4 },
  totals:            { marginTop:16, paddingTop:14, borderTop:"1px solid rgba(2,8,23,0.08)", display:"grid", gap:10 },
  totalRow:          { display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:14, color:"rgba(11,18,32,0.72)", fontWeight:800 },
  grandTotal:        { paddingTop:8, marginTop:2, borderTop:"1px solid rgba(2,8,23,0.08)", fontSize:16, color:"rgba(11,18,32,0.88)" },
  pendingNote:       { marginTop:14, display:"flex", alignItems:"flex-start", gap:8, padding:"12px 14px", borderRadius:14, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.22)", color:"rgba(140,90,0,1)", fontSize:12, fontWeight:700, lineHeight:1.5 },
  emptyBox:          { borderRadius:18, border:"1px dashed rgba(2,8,23,0.16)", background:"rgba(2,8,23,0.02)", padding:18, display:"grid", gap:10 },
  emptyTitle:        { fontWeight:950, color:"rgba(11,18,32,0.86)" },
  emptySub:          { fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.55)", lineHeight:1.6 },
  errorBanner:       { marginBottom:16, padding:"12px 18px", borderRadius:14, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)", color:"rgba(185,28,28,1)", fontWeight:800, fontSize:13 },
  successWrap:       { minHeight:"80vh", display:"grid", placeItems:"center", padding:24 },
  successCard:       { background:"#fff", borderRadius:28, padding:"48px 40px", maxWidth:480, width:"100%", textAlign:"center", boxShadow:"0 40px 100px rgba(0,0,0,0.12)", border:"1px solid rgba(2,8,23,0.08)" },
  successIcon:       { width:80, height:80, borderRadius:"50%", background:"rgba(34,197,94,0.12)", border:"2px solid rgba(34,197,94,0.30)", display:"grid", placeItems:"center", color:"rgba(34,197,94,1)", margin:"0 auto 22px" },
  successTitle:      { fontSize:28, fontWeight:950, color:"#091925", letterSpacing:"-0.4px", marginBottom:10 },
  successSub:        { fontSize:15, color:"rgba(10,22,40,0.65)", fontWeight:600, marginBottom:14 },
  successNote:       { fontSize:13, fontWeight:700, color:"rgba(10,22,40,0.50)", lineHeight:1.6, padding:"12px 16px", borderRadius:14, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.20)", marginBottom:24 },
  successActions:    { display:"grid", gap:10 },
};

export default Checkout;