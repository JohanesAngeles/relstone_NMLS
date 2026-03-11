import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Building2,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    country: "United States",
    streetAddress: "",
    townCity: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    additionalInfo: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + Number(item.price || 0);
    }, 0);
  }, [cart]);

  const textbookTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + (item.include_textbook ? Number(item.textbook_price || 0) : 0);
    }, 0);
  }, [cart]);

  const total = subtotal + textbookTotal;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProceedCheckout = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setSubmitted(true);

    alert("Order review captured. Payment API is not yet available, so checkout stops here.");
  };

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* Top bar */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.left}>
            <button type="button" style={S.backBtn} onClick={() => navigate("/courses")}>
              <ArrowLeft size={16} />
              <span>Back to Courses</span>
            </button>

            <div style={S.titleWrap}>
              <div style={S.title}>Checkout</div>
              <div style={S.subtitle}>Billing details and order summary</div>
            </div>
          </div>

          <div style={S.right}>
            <div style={S.cartBadge}>
              <ShoppingCart size={16} />
              <span>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </header>

      {submitted && (
        <div style={S.toastWrap}>
          <div style={S.toast}>
            <div style={S.toastLeft}>
              <div style={S.toastIcon}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={S.toastTitle}>Checkout details saved</div>
                <div style={S.toastSub}>
                  Payment integration is not available yet, so the flow stops here for now.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={S.shell}>
        <div style={S.grid}>
          {/* Billing form */}
          <section style={S.card}>
            <div style={S.sectionHead}>
              <div>
                <div style={S.sectionTitle}>Billing &amp; Shipping</div>
                <div style={S.sectionSub}>Enter the required information before proceeding</div>
              </div>
            </div>

            <form onSubmit={handleProceedCheckout} style={S.form}>
              <div style={S.twoCol}>
                <Field
                  label="First Name*"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />
                <Field
                  label="Last Name*"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                />
              </div>

              <Field
                label="Company Name (optional)"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Company name"
                icon={<Building2 size={16} />}
              />

              <Field
                label="Country / Region*"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Country / Region"
                required
              />

              <Field
                label="Street Address*"
                name="streetAddress"
                value={form.streetAddress}
                onChange={handleChange}
                placeholder="Street address"
                required
              />

              <div style={S.twoCol}>
                <Field
                  label="Town / City*"
                  name="townCity"
                  value={form.townCity}
                  onChange={handleChange}
                  placeholder="Town / City"
                  required
                />
                <Field
                  label="State*"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  icon={<MapPin size={16} />}
                  required
                />
              </div>

              <div style={S.twoCol}>
                <Field
                  label="Zip Code*"
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  placeholder="Zip code"
                  required
                />
                <Field
                  label="Phone*"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  icon={<Phone size={16} />}
                  required
                />
              </div>

              <Field
                label="Email Address*"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                icon={<Mail size={16} />}
                required
              />

              <div style={S.field}>
                <label style={S.label}>Additional Information</label>
                <textarea
                  name="additionalInfo"
                  value={form.additionalInfo}
                  onChange={handleChange}
                  placeholder="Order notes, special instructions, or anything else"
                  style={S.textarea}
                  rows={5}
                />
              </div>

              <div style={S.actionRow}>
                <button type="button" style={S.secondaryBtn} onClick={() => navigate("/courses")}>
                  Continue Browsing
                </button>

                <button type="submit" style={S.primaryBtn}>
                  <CreditCard size={16} />
                  <span>Proceed Checkout</span>
                </button>
              </div>
            </form>
          </section>

          {/* Order summary */}
          <aside style={S.summaryCard}>
            <div style={S.sectionHead}>
              <div>
                <div style={S.sectionTitle}>Your Order</div>
                <div style={S.sectionSub}>Summary of selected courses</div>
              </div>
            </div>

            {cart.length === 0 ? (
              <div style={S.emptyBox}>
                <div style={S.emptyTitle}>No courses selected</div>
                <div style={S.emptySub}>Go back to the course catalog and add courses first.</div>
                <button type="button" style={S.secondaryBtn} onClick={() => navigate("/courses")}>
                  Back to Courses
                </button>
              </div>
            ) : (
              <>
                <div style={S.summaryList}>
                  {cart.map((item) => (
                    <div key={item._id} style={S.summaryItem}>
                      <div style={S.summaryTop}>
                        <div style={S.summaryCourseWrap}>
                          <div style={S.courseIcon}>
                            <BookOpen size={16} />
                          </div>

                          <div>
                            <div style={S.summaryCourseTitle}>{item.title}</div>
                            <div style={S.summaryMeta}>
                              {item.type} • {item.credit_hours} credit hours
                            </div>
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
                  <div style={S.totalRow}>
                    <span>Subtotal</span>
                    <strong>${subtotal.toFixed(2)}</strong>
                  </div>

                  <div style={S.totalRow}>
                    <span>Textbooks</span>
                    <strong>${textbookTotal.toFixed(2)}</strong>
                  </div>

                  <div style={{ ...S.totalRow, ...S.grandTotal }}>
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  icon,
}) => (
  <div style={S.field}>
    <label style={S.label}>{label}</label>
    <div style={S.inputWrap}>
      {icon && <span style={S.inputIcon}>{icon}</span>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          ...S.input,
          ...(icon ? { paddingLeft: 42 } : {}),
        }}
      />
    </div>
  </div>
);

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root{
  --rs-dark:#091925;
  --rs-blue:#2EABFE;
  --rs-bg:#f6f7fb;
  --rs-text: rgba(11,18,32,0.92);
  --rs-muted: rgba(11,18,32,0.60);
  --rs-border: rgba(2,8,23,0.10);
  --rs-shadow: 0 18px 48px rgba(2, 8, 23, 0.10);
  --rs-ring: rgba(46,171,254,0.28);
}

*{box-sizing:border-box}
body{
  margin:0;
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background:var(--rs-bg);
  color:var(--rs-text);
}
`;

const S = {
  page: {
    minHeight: "100vh",
    background: "var(--rs-bg)",
  },

  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(246,247,251,0.82)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(2,8,23,0.08)",
  },

  topbarInner: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
    color: "rgba(11,18,32,0.82)",
  },

  titleWrap: {
    display: "grid",
    gap: 2,
  },

  title: {
    fontWeight: 950,
    letterSpacing: "-0.2px",
  },

  subtitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--rs-muted)",
  },

  cartBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    fontWeight: 900,
    fontSize: 13,
    color: "rgba(11,18,32,0.82)",
  },

  shell: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "18px 18px 40px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 16,
    alignItems: "start",
  },

  card: {
    borderRadius: 22,
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(2,8,23,0.08)",
    boxShadow: "var(--rs-shadow)",
    backdropFilter: "blur(10px)",
    padding: 18,
  },

  summaryCard: {
    borderRadius: 22,
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(2,8,23,0.08)",
    boxShadow: "var(--rs-shadow)",
    backdropFilter: "blur(10px)",
    padding: 18,
    position: "sticky",
    top: 86,
  },

  sectionHead: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontWeight: 950,
    fontSize: 18,
    color: "rgba(11,18,32,0.88)",
  },

  sectionSub: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(11,18,32,0.55)",
  },

  form: {
    display: "grid",
    gap: 14,
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  field: {
    display: "grid",
    gap: 7,
  },

  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#5f6770",
    paddingLeft: 2,
  },

  inputWrap: {
    position: "relative",
  },

  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#98a0aa",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: 48,
    padding: "0 14px",
    border: "1.5px solid #e3e5e8",
    borderRadius: 14,
    fontSize: 14,
    background: "#fafafa",
    color: "#1a1a1a",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "14px",
    border: "1.5px solid #e3e5e8",
    borderRadius: 14,
    fontSize: 14,
    background: "#fafafa",
    color: "#1a1a1a",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },

  actionRow: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 6,
    flexWrap: "wrap",
  },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(46,171,254,0.22)",
    background: "var(--rs-blue)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 14,
  },

  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(2,8,23,0.10)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 14,
    color: "rgba(11,18,32,0.82)",
  },

  summaryList: {
    display: "grid",
    gap: 12,
  },

  summaryItem: {
    borderRadius: 16,
    border: "1px solid rgba(2,8,23,0.08)",
    background: "#fff",
    padding: 12,
    display: "grid",
    gap: 8,
  },

  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  summaryCourseWrap: {
    display: "flex",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },

  courseIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    background: "rgba(46,171,254,0.12)",
    border: "1px solid rgba(46,171,254,0.18)",
    display: "grid",
    placeItems: "center",
    color: "var(--rs-dark)",
    flexShrink: 0,
  },

  summaryCourseTitle: {
    fontWeight: 900,
    color: "rgba(11,18,32,0.86)",
    lineHeight: 1.3,
  },

  summaryMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(11,18,32,0.55)",
  },

  summaryPrice: {
    fontWeight: 950,
    color: "rgba(11,18,32,0.82)",
    whiteSpace: "nowrap",
  },

  textbookRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(11,18,32,0.68)",
    paddingTop: 4,
  },

  totals: {
    marginTop: 16,
    paddingTop: 14,
    borderTop: "1px solid rgba(2,8,23,0.08)",
    display: "grid",
    gap: 10,
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
    color: "rgba(11,18,32,0.72)",
    fontWeight: 800,
  },

  grandTotal: {
    paddingTop: 8,
    marginTop: 2,
    borderTop: "1px solid rgba(2,8,23,0.08)",
    fontSize: 16,
    color: "rgba(11,18,32,0.88)",
  },

  emptyBox: {
    borderRadius: 18,
    border: "1px dashed rgba(2,8,23,0.16)",
    background: "rgba(2,8,23,0.02)",
    padding: 18,
    display: "grid",
    gap: 10,
  },

  emptyTitle: {
    fontWeight: 950,
    color: "rgba(11,18,32,0.86)",
  },

  emptySub: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(11,18,32,0.55)",
    lineHeight: 1.6,
  },

  toastWrap: {
    position: "fixed",
    top: 74,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 70,
    padding: "0 14px",
    width: "min(700px, 100%)",
  },

  toast: {
    borderRadius: 18,
    border: "1px solid rgba(2,8,23,0.08)",
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 18px 48px rgba(2,8,23,0.14)",
    padding: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backdropFilter: "blur(10px)",
  },

  toastLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  toastIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,180,180,0.12)",
    border: "1px solid rgba(0,180,180,0.20)",
    color: "rgba(0,140,140,1)",
    flexShrink: 0,
  },

  toastTitle: {
    fontWeight: 950,
    color: "rgba(11,18,32,0.86)",
  },

  toastSub: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(11,18,32,0.55)",
    marginTop: 2,
  },
};

export default Checkout;