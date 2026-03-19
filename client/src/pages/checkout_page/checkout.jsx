import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart, BookOpen, MapPin, Phone,
  Mail, Building2, CreditCard, CheckCircle2,
} from "lucide-react";
import API from "../../api/axios";
import InnerBreadcrumbs from "../../components/InnerBreadcrumbs";
import GlobalSearchBar from "../../components/GlobalSearchBar";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart]           = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [orderId, setOrderId]     = useState(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", companyName: "",
    country: "United States", streetAddress: "",
    townCity: "", state: "", zipCode: "",
    phone: "", email: "", additionalInfo: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const subtotal = useMemo(() =>
    cart.reduce((sum, item) => sum + Number(item.price || 0), 0), [cart]);

  const textbookTotal = useMemo(() =>
    cart.reduce((sum, item) =>
      sum + (item.include_textbook ? Number(item.textbook_price || 0) : 0), 0), [cart]);

  const total = subtotal + textbookTotal;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProceedCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { setError("Your cart is empty."); return; }

    setLoading(true);
    setError("");

    try {
      const payload = {
        items: cart.map((item) => ({
          course_id:        item._id,
          include_textbook: item.include_textbook || false,
          price:            Number(item.price || 0),
          textbook_price:   item.include_textbook ? Number(item.textbook_price || 0) : 0,
        })),
        total_amount: total,
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

  /* ── Success screen ── */
  if (submitted) return (
    <div style={S.page}>
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
    </div>
  );

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* Top bar */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.left}>
            <button type="button" style={S.backBtn} onClick={() => navigate("/courses")}>
              <ArrowLeft size={16} /><span>Back to Courses</span>
            </button>
            <div style={S.titleWrap}>
              <div style={S.title}>Checkout</div>
              <div style={S.subtitle}>Billing details and order summary</div>
            </div>
          </div>
          <div style={S.right}>
            <GlobalSearchBar minWidth={300} />
            <div style={S.cartBadge}>
              <ShoppingCart size={16} />
              <span>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
        <div style={S.breadcrumbWrap}>
          <InnerBreadcrumbs />
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div style={S.errorBanner}>
          ⚠️ {error}
        </div>
      )}

      <main style={S.shell}>
        <div style={S.grid}>

          {/* Billing form */}
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
                  {loading ? (
                    <><span className="co-spin" /> Placing Order…</>
                  ) : (
                    <><CreditCard size={16} /><span>Place Order</span></>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Order summary */}
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

                <div style={S.totals}>
                  <div style={S.totalRow}><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
                  <div style={S.totalRow}><span>Textbooks</span><strong>${textbookTotal.toFixed(2)}</strong></div>
                  <div style={{ ...S.totalRow, ...S.grandTotal }}><span>Total</span><strong>${total.toFixed(2)}</strong></div>
                </div>

                <div style={S.pendingNote}>
                  <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Your order will be marked <strong>pending</strong> until payment is confirmed by an admin.</span>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

/* ── Field component ── */
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

/* ── CSS ── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root {
  --rs-dark:#091925; --rs-blue:#2EABFE;
  --rs-bg:#f6f7fb; --rs-text:rgba(11,18,32,0.92);
  --rs-muted:rgba(11,18,32,0.60); --rs-border:rgba(2,8,23,0.10);
  --rs-shadow:0 18px 48px rgba(2,8,23,0.10);
}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--rs-bg);color:var(--rs-text);}
input:focus,textarea:focus{border-color:rgba(46,171,254,0.50)!important;box-shadow:0 0 0 3px rgba(46,171,254,0.12);}
.co-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.35);border-top-color:#fff;animation:cospin 0.8s linear infinite;display:inline-block;}
@keyframes cospin{to{transform:rotate(360deg);}}
`;

/* ── Styles ── */
const S = {
  page:       { minHeight:"100vh", background:"var(--rs-bg)" },
  topbar:     { position:"sticky", top:0, zIndex:20, background:"rgba(246,247,251,0.82)", backdropFilter:"blur(10px)", borderBottom:"1px solid rgba(2,8,23,0.08)" },
  topbarInner:{ maxWidth:1180, margin:"0 auto", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 },
  breadcrumbWrap:{ maxWidth:1180, margin:"0 auto", padding:"0 18px 10px" },
  left:       { display:"flex", alignItems:"center", gap:12, minWidth:0 },
  right:      { display:"flex", alignItems:"center", gap:10 },
  backBtn:    { display:"inline-flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.82)" },
  titleWrap:  { display:"grid", gap:2 },
  title:      { fontWeight:950, letterSpacing:"-0.2px" },
  subtitle:   { fontSize:12, fontWeight:700, color:"var(--rs-muted)" },
  cartBadge:  { display:"inline-flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.82)" },
  shell:      { maxWidth:1180, margin:"0 auto", padding:"18px 18px 40px" },
  grid:       { display:"grid", gridTemplateColumns:"1.2fr 0.8fr", gap:16, alignItems:"start" },
  card:       { borderRadius:22, background:"rgba(255,255,255,0.88)", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"var(--rs-shadow)", backdropFilter:"blur(10px)", padding:18 },
  summaryCard:{ borderRadius:22, background:"rgba(255,255,255,0.88)", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"var(--rs-shadow)", backdropFilter:"blur(10px)", padding:18, position:"sticky", top:86 },
  sectionHead:{ marginBottom:16 },
  sectionTitle:{ fontWeight:950, fontSize:18, color:"rgba(11,18,32,0.88)" },
  sectionSub: { marginTop:4, fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.55)" },
  form:       { display:"grid", gap:14 },
  twoCol:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  field:      { display:"grid", gap:7 },
  label:      { fontSize:12, fontWeight:700, color:"#5f6770", paddingLeft:2 },
  inputWrap:  { position:"relative" },
  inputIcon:  { position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#98a0aa", display:"flex", alignItems:"center", pointerEvents:"none" },
  input:      { width:"100%", height:48, padding:"0 14px", border:"1.5px solid #e3e5e8", borderRadius:14, fontSize:14, background:"#fafafa", color:"#1a1a1a", outline:"none", fontFamily:"inherit" },
  textarea:   { width:"100%", padding:"14px", border:"1.5px solid #e3e5e8", borderRadius:14, fontSize:14, background:"#fafafa", color:"#1a1a1a", outline:"none", resize:"vertical", fontFamily:"inherit" },
  actionRow:  { display:"flex", gap:12, justifyContent:"flex-end", marginTop:6, flexWrap:"wrap" },
  primaryBtn: { display:"inline-flex", alignItems:"center", gap:8, padding:"12px 20px", borderRadius:14, border:"none", background:"var(--rs-blue)", color:"#fff", cursor:"pointer", fontWeight:950, fontSize:14, boxShadow:"0 8px 24px rgba(46,171,254,0.28)" },
  primaryBtnLoading: { opacity:0.75, cursor:"not-allowed" },
  secondaryBtn:{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 16px", borderRadius:14, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:900, fontSize:14, color:"rgba(11,18,32,0.82)" },
  summaryList:{ display:"grid", gap:12 },
  summaryItem:{ borderRadius:16, border:"1px solid rgba(2,8,23,0.08)", background:"#fff", padding:12, display:"grid", gap:8 },
  summaryTop: { display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-start" },
  summaryCourseWrap:{ display:"flex", gap:10, flex:1, minWidth:0 },
  courseIcon: { width:36, height:36, borderRadius:14, background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.18)", display:"grid", placeItems:"center", color:"var(--rs-dark)", flexShrink:0 },
  summaryCourseTitle:{ fontWeight:900, color:"rgba(11,18,32,0.86)", lineHeight:1.3 },
  summaryMeta:{ marginTop:4, fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.55)" },
  summaryPrice:{ fontWeight:950, color:"rgba(11,18,32,0.82)", whiteSpace:"nowrap" },
  textbookRow:{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:700, color:"rgba(11,18,32,0.68)", paddingTop:4 },
  totals:     { marginTop:16, paddingTop:14, borderTop:"1px solid rgba(2,8,23,0.08)", display:"grid", gap:10 },
  totalRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:14, color:"rgba(11,18,32,0.72)", fontWeight:800 },
  grandTotal: { paddingTop:8, marginTop:2, borderTop:"1px solid rgba(2,8,23,0.08)", fontSize:16, color:"rgba(11,18,32,0.88)" },
  pendingNote:{ marginTop:14, display:"flex", alignItems:"flex-start", gap:8, padding:"12px 14px", borderRadius:14, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.22)", color:"rgba(140,90,0,1)", fontSize:12, fontWeight:700, lineHeight:1.5 },
  emptyBox:   { borderRadius:18, border:"1px dashed rgba(2,8,23,0.16)", background:"rgba(2,8,23,0.02)", padding:18, display:"grid", gap:10 },
  emptyTitle: { fontWeight:950, color:"rgba(11,18,32,0.86)" },
  emptySub:   { fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.55)", lineHeight:1.6 },
  errorBanner:{ maxWidth:1180, margin:"12px auto 0", padding:"12px 18px", borderRadius:14, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.22)", color:"rgba(185,28,28,1)", fontWeight:800, fontSize:13 },

  // success screen
  successWrap:{ minHeight:"100vh", display:"grid", placeItems:"center", padding:24, background:"linear-gradient(135deg,#0a1628,#0d2a4a)" },
  successCard:{ background:"#fff", borderRadius:28, padding:"48px 40px", maxWidth:480, width:"100%", textAlign:"center", boxShadow:"0 40px 100px rgba(0,0,0,0.30)" },
  successIcon:{ width:80, height:80, borderRadius:"50%", background:"rgba(34,197,94,0.12)", border:"2px solid rgba(34,197,94,0.30)", display:"grid", placeItems:"center", color:"rgba(34,197,94,1)", margin:"0 auto 22px" },
  successTitle:{ fontSize:28, fontWeight:950, color:"#0a1628", letterSpacing:"-0.4px", marginBottom:10 },
  successSub: { fontSize:15, color:"rgba(10,22,40,0.65)", fontWeight:600, marginBottom:14 },
  successNote:{ fontSize:13, fontWeight:700, color:"rgba(10,22,40,0.50)", lineHeight:1.6, padding:"12px 16px", borderRadius:14, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.20)", marginBottom:24 },
  successActions:{ display:"grid", gap:10 },
};

export default Checkout;