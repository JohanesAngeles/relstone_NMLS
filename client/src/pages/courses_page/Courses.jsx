import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Clock, MapPin, ShoppingCart, Filter,
  ArrowLeft, X, Search, CheckCircle2, ChevronDown, ChevronUp,
} from "lucide-react";
import API from "../../api/axios";

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [cart, setCart]                 = useState([]);
  const [filters, setFilters]           = useState({ type: "", state: user?.state || "" });
  const [q, setQ]                       = useState("");
  const [showCart, setShowCart]         = useState(false);
  const [ordering, setOrdering]         = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [openModules, setOpenModules]   = useState({});

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCourses = async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (filters.type)  params.type  = filters.type;
      if (filters.state) params.state = filters.state;
      const res = await API.get("/courses", { params });
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (course) => {
    if (cart.find((c) => c._id === course._id)) return;
    setCart((prev) => [...prev, { ...course, include_textbook: false }]);
    setShowCart(true);
  };

  const removeFromCart = (courseId) => setCart((prev) => prev.filter((c) => c._id !== courseId));
  const toggleTextbook = (courseId) => setCart((prev) => prev.map((c) => c._id === courseId ? { ...c, include_textbook: !c.include_textbook } : c));
  const toggleModules  = (courseId) => setOpenModules((prev) => ({ ...prev, [courseId]: !prev[courseId] }));

  const total = useMemo(() =>
    cart.reduce((acc, c) => acc + Number(c.price || 0) + (c.include_textbook ? Number(c.textbook_price || 0) : 0), 0),
  [cart]);

  const filteredCourses = useMemo(() => {
    if (!q.trim()) return courses;
    const needle = q.toLowerCase();
    return courses.filter((c) => {
      const title  = String(c.title       || "").toLowerCase();
      const desc   = String(c.description || "").toLowerCase();
      return title.includes(needle) || desc.includes(needle);
    });
  }, [courses, q]);

  return (
    <div style={S.page}>
      <style>{css}</style>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <div style={S.left}>
            <button style={S.backBtn} onClick={() => navigate("/dashboard")} type="button">
              <ArrowLeft size={16} /><span>Dashboard</span>
            </button>
            <div style={S.titleWrap}>
              <div style={S.title}>Course Catalog</div>
              <div style={S.subtitle}>
                {user?.state
                  ? `Showing courses approved in ${user.state}`
                  : "Browse NMLS-approved PE and CE courses"}
              </div>
            </div>
          </div>
          <div style={S.right}>
            <button style={S.cartBtn} onClick={() => setShowCart(true)} type="button">
              <ShoppingCart size={18} />
              <span>Cart</span>
              <span style={S.cartCount}>{cart.length}</span>
              {cart.length > 0 && <span style={S.cartTotalPill}>${total.toFixed(2)}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Order success toast ──────────────────────────────────── */}
      {orderSuccess && (
        <div style={S.toastWrap}>
          <div style={S.toast}>
            <div style={S.toastLeft}>
              <div style={S.toastIcon}><CheckCircle2 size={18} /></div>
              <div>
                <div style={S.toastTitle}>Order placed successfully</div>
                <div style={S.toastSub}>Check your dashboard for your courses.</div>
              </div>
            </div>
            <button style={S.toastClose} onClick={() => setOrderSuccess(false)} type="button">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <main style={S.shell}>

        {/* ── Filters ─────────────────────────────────────────────── */}
        <section style={S.filtersCard}>
          <div style={S.filtersLeft}>
            <div style={S.searchWrap}>
              <Search size={16} style={{ opacity: 0.7 }} />
              <input style={S.searchInput} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search courses or description…" />
            </div>
            <div style={S.filterWrap}>
              <Filter size={16} style={{ opacity: 0.7 }} />

              {/* Course type filter */}
              <select style={S.select} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                <option value="PE">Pre-Licensing (PE)</option>
                <option value="CE">Continuing Education (CE)</option>
              </select>

              {/* Locked state badge — user cannot change */}
              {user?.state && (
                <div style={S.stateLock}>
                  <MapPin size={13} />
                  <span>{user.state}</span>
                </div>
              )}

              {/* Only allow clearing the type filter */}
              {filters.type && (
                <button type="button" style={S.clearBtn} onClick={() => setFilters({ ...filters, type: "" })}>
                  Clear
                </button>
              )}
            </div>
          </div>
          <div style={S.filtersRight}>
            <div style={S.countPill}>
              {loading ? "Loading…" : `${filteredCourses.length} course${filteredCourses.length === 1 ? "" : "s"}`}
            </div>
          </div>
        </section>

        {/* ── Course grid ─────────────────────────────────────────── */}
        <section style={S.grid}>
          {loading ? (
            <div style={S.centerMsg}>Loading courses…</div>
          ) : error ? (
            <div style={S.centerMsgError}>{error}</div>
          ) : filteredCourses.length === 0 ? (
            <div style={S.emptyCard}>
              <div style={S.emptyTitle}>No courses found</div>
              <div style={S.emptySub}>No courses are available for your state ({user?.state}) yet.</div>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const inCart = cart.some((c) => c._id === course._id);
              const isOpen = !!openModules[course._id];

              return (
                <div key={course._id} style={S.courseCard}>

                  {/* Head */}
                  <div style={S.courseHead}>
                    <div style={S.courseTitleRow}>
                      <div style={S.courseIcon}><BookOpen size={18} /></div>
                      <div style={S.courseTextWrap}>
                        <div style={S.courseTitle}>{course.title}</div>
                        <div style={S.courseDesc}>{course.description}</div>
                      </div>
                    </div>
                    <span style={badgeStyle(course.type)}>{String(course.type || "").toUpperCase()}</span>
                  </div>

                  {/* Meta */}
                  <div style={S.metaRow}>
                    <span style={S.metaItem}>
                      <Clock size={14} /><span>{course.credit_hours} credit hours</span>
                    </span>
                    <span style={S.metaItemStates}>
                      <MapPin size={14} />
                      <span style={S.statesText}>
                        {Array.isArray(course.states_approved) && course.states_approved.length > 0
                          ? course.states_approved.join(", ")
                          : "All states"}
                      </span>
                    </span>
                  </div>

                  {/* Modules */}
                  {Array.isArray(course.modules) && course.modules.length > 0 && (
                    <div style={S.detailsBox}>
                      <button type="button" style={S.summaryBtn} onClick={() => toggleModules(course._id)}>
                        <span>View modules ({course.modules.length})</span>
                        <span style={S.summaryRight}>
                          <span style={S.summaryHint}>{isOpen ? "hide" : "view"}</span>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </button>
                      {isOpen && (
                        <div style={S.modules}>
                          {course.modules.map((m, i) => (
                            <div key={i} style={S.moduleRow}>
                              <span style={S.moduleBadge}>Module {m.order ?? i + 1}</span>
                              <span style={S.moduleTitle}>{m.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={S.courseFooter}>
                    <div style={S.priceBlock}>
                      <div style={S.price}>${Number(course.price || 0).toFixed(2)}</div>
                      {course.has_textbook && (
                        <div style={S.textbookNote}>
                          + Textbook available (${Number(course.textbook_price || 0).toFixed(2)})
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button style={S.detailsBtn} onClick={() => navigate(`/courses/${course._id}`)} type="button">
                        Details
                      </button>
                      <button
                        style={inCart ? S.addedBtn : S.addBtn}
                        onClick={() => addToCart(course)}
                        disabled={inCart}
                        type="button"
                        title={inCart ? "Already in cart" : "Add to cart"}
                      >
                        <ShoppingCart size={16} />
                        <span>{inCart ? "Added" : "Add"}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </section>
      </main>

      {/* ── Cart drawer ──────────────────────────────────────────── */}
      {showCart && (
        <>
          <div style={S.overlay} onClick={() => setShowCart(false)} />
          <aside style={S.drawer}>
            <div style={S.drawerHead}>
              <div style={S.drawerTitle}><ShoppingCart size={18} /><span>Your Cart</span></div>
              <button style={S.iconBtn} onClick={() => setShowCart(false)} type="button"><X size={18} /></button>
            </div>
            {cart.length === 0 ? (
              <div style={S.drawerEmpty}>
                <div style={S.emptyTitle}>Your cart is empty</div>
                <div style={S.emptySub}>Add a course to checkout.</div>
              </div>
            ) : (
              <>
                <div style={S.drawerBody}>
                  {cart.map((c) => (
                    <div key={c._id} style={S.cartItem}>
                      <div style={S.cartTop}>
                        <div style={S.cartName}>{c.title}</div>
                        <button style={S.removeBtn} onClick={() => removeFromCart(c._id)} type="button">
                          <X size={16} />
                        </button>
                      </div>
                      <div style={S.cartPrice}>${Number(c.price || 0).toFixed(2)}</div>
                      {c.has_textbook && (
                        <label style={S.textbookCheck}>
                          <input type="checkbox" checked={!!c.include_textbook} onChange={() => toggleTextbook(c._id)} />
                          <span>Add textbook (+${Number(c.textbook_price || 0).toFixed(2)})</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <div style={S.drawerFoot}>
                  <div style={S.totalRow}>
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                  <button
                    style={S.checkoutBtn}
                    onClick={() => { localStorage.setItem("cart", JSON.stringify(cart)); navigate("/checkout"); }}
                    disabled={ordering}
                    type="button"
                  >
                    Checkout
                  </button>
                  <button style={S.secondaryBtn} onClick={() => setShowCart(false)} type="button">
                    Continue browsing
                  </button>
                </div>
              </>
            )}
          </aside>
        </>
      )}
    </div>
  );
};

/* ─── Badge helper ───────────────────────────────────────────────── */
const badgeStyle = (type) => {
  const t = String(type || "").toUpperCase();
  const base = { display:"inline-flex", alignItems:"center", padding:"6px 10px", borderRadius:999, fontSize:12, fontWeight:900, flexShrink:0 };
  if (t === "PE") return { ...base, color:"var(--rs-blue)",    background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.22)" };
  if (t === "CE") return { ...base, color:"rgba(0,140,140,1)", background:"rgba(0,180,180,0.12)",  border:"1px solid rgba(0,180,180,0.20)"  };
  return { ...base, color:"rgba(9,25,37,0.82)", background:"rgba(2,8,23,0.06)", border:"1px solid rgba(2,8,23,0.10)" };
};

/* ─── CSS ────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
:root{
  --rs-dark:#091925; --rs-blue:#2EABFE; --rs-bg:#f6f7fb;
  --rs-text:rgba(11,18,32,0.92); --rs-muted:rgba(11,18,32,0.60);
  --rs-border:rgba(2,8,23,0.10); --rs-shadow:0 18px 48px rgba(2,8,23,0.10);
}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--rs-bg);color:var(--rs-text);}
`;

/* ─── Styles ─────────────────────────────────────────────────────── */
const S = {
  page:         { minHeight:"100vh", background:"var(--rs-bg)" },
  topbar:       { position:"sticky", top:0, zIndex:20, background:"rgba(246,247,251,0.82)", backdropFilter:"blur(10px)", borderBottom:"1px solid rgba(2,8,23,0.08)" },
  topbarInner:  { maxWidth:1180, margin:"0 auto", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 },
  left:         { display:"flex", alignItems:"center", gap:12, minWidth:0 },
  right:        { display:"flex", alignItems:"center", gap:10 },
  backBtn:      { display:"inline-flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.82)" },
  titleWrap:    { display:"grid", gap:2, minWidth:0 },
  title:        { fontWeight:950, letterSpacing:"-0.2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  subtitle:     { fontSize:12, fontWeight:700, color:"var(--rs-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  cartBtn:      { display:"inline-flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:950, fontSize:13, color:"rgba(11,18,32,0.82)", boxShadow:"0 10px 22px rgba(2,8,23,0.06)" },
  cartCount:    { minWidth:22, height:22, borderRadius:999, display:"inline-grid", placeItems:"center", background:"rgba(46,171,254,0.14)", border:"1px solid rgba(46,171,254,0.22)", color:"var(--rs-dark)", fontWeight:950, fontSize:12, padding:"0 6px" },
  cartTotalPill:{ padding:"4px 10px", borderRadius:999, background:"var(--rs-dark)", color:"#fff", fontWeight:950, fontSize:12 },
  shell:        { maxWidth:1180, margin:"0 auto", padding:"18px 18px 40px" },
  filtersCard:  { borderRadius:22, background:"rgba(255,255,255,0.82)", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"var(--rs-shadow)", backdropFilter:"blur(10px)", padding:14, display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" },
  filtersLeft:  { display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" },
  filtersRight: { display:"flex", alignItems:"center" },
  searchWrap:   { display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", minWidth:280 },
  searchInput:  { border:"none", outline:"none", width:"100%", fontSize:13, fontWeight:700, color:"rgba(11,18,32,0.80)", background:"transparent" },
  filterWrap:   { display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", flexWrap:"wrap" },
  select:       { border:"none", outline:"none", background:"transparent", fontSize:13, fontWeight:800, color:"rgba(11,18,32,0.78)", cursor:"pointer", paddingRight:4 },
  stateLock:    { display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:999, background:"rgba(46,171,254,0.10)", border:"1px solid rgba(46,171,254,0.22)", color:"var(--rs-dark)", fontWeight:900, fontSize:13 },
  clearBtn:     { border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", borderRadius:999, padding:"8px 10px", cursor:"pointer", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.72)" },
  countPill:    { padding:"10px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", fontWeight:950, fontSize:13, color:"rgba(11,18,32,0.78)" },
  grid:         { marginTop:14, display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:12, alignItems:"start" },
  centerMsg:      { padding:18, color:"rgba(11,18,32,0.55)", fontWeight:800 },
  centerMsgError: { padding:18, color:"crimson", fontWeight:900 },
  emptyCard:    { gridColumn:"1 / -1", borderRadius:22, background:"#fff", border:"1px dashed rgba(2,8,23,0.18)", padding:18 },
  emptyTitle:   { fontWeight:950, color:"rgba(11,18,32,0.86)" },
  emptySub:     { marginTop:6, color:"rgba(11,18,32,0.55)", fontWeight:700, fontSize:12, lineHeight:1.6 },
  courseCard:   { borderRadius:22, background:"rgba(255,255,255,0.92)", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"0 12px 30px rgba(2,8,23,0.08)", padding:14, display:"flex", flexDirection:"column", gap:12, minWidth:0, alignSelf:"start" },
  courseHead:   { display:"flex", justifyContent:"space-between", gap:10, alignItems:"flex-start" },
  courseTitleRow:{ display:"flex", gap:10, minWidth:0, flex:1 },
  courseTextWrap:{ minWidth:0, flex:1 },
  courseIcon:   { width:40, height:40, borderRadius:16, background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.18)", display:"grid", placeItems:"center", color:"var(--rs-dark)", flexShrink:0 },
  courseTitle:  { fontWeight:950, color:"rgba(11,18,32,0.88)", lineHeight:1.2, overflowWrap:"anywhere" },
  courseDesc:   { marginTop:4, color:"rgba(11,18,32,0.55)", fontWeight:650, fontSize:12, lineHeight:1.5, overflowWrap:"anywhere" },
  metaRow:      { display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-start" },
  metaItem:     { display:"inline-flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", color:"rgba(11,18,32,0.72)", fontWeight:800, fontSize:12, minWidth:0, flexShrink:0 },
  metaItemStates:{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:16, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", color:"rgba(11,18,32,0.72)", fontWeight:800, fontSize:12, minWidth:0, flex:"1 1 220px", overflow:"hidden" },
  statesText:   { display:"block", minWidth:0, whiteSpace:"normal", wordBreak:"break-word", overflowWrap:"anywhere", lineHeight:1.5 },
  detailsBox:   { borderRadius:18, border:"1px solid rgba(2,8,23,0.08)", background:"rgba(2,8,23,0.02)", padding:10, minWidth:0 },
  summaryBtn:   { width:"100%", cursor:"pointer", fontWeight:900, color:"rgba(11,18,32,0.78)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, border:"none", background:"transparent", padding:0, textAlign:"left", fontSize:15 },
  summaryRight: { display:"inline-flex", alignItems:"center", gap:6, flexShrink:0 },
  summaryHint:  { fontSize:12, fontWeight:800, color:"rgba(11,18,32,0.45)" },
  modules:      { marginTop:10, display:"grid", gap:8, minWidth:0 },
  moduleRow:    { display:"flex", gap:10, alignItems:"flex-start", minWidth:0 },
  moduleBadge:  { fontSize:12, fontWeight:950, padding:"4px 10px", borderRadius:999, background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.18)", color:"var(--rs-dark)", flexShrink:0 },
  moduleTitle:  { fontWeight:750, color:"rgba(11,18,32,0.78)", fontSize:13, lineHeight:1.5, minWidth:0, overflowWrap:"anywhere", wordBreak:"break-word" },
  courseFooter: { display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-end", borderTop:"1px solid rgba(2,8,23,0.06)", paddingTop:12, marginTop:"auto", minWidth:0 },
  priceBlock:   { display:"grid", gap:4, minWidth:0, flex:1 },
  price:        { fontWeight:950, fontSize:18, color:"rgba(11,18,32,0.88)" },
  textbookNote: { fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.55)", lineHeight:1.4 },
  detailsBtn:   { display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"10px 14px", borderRadius:14, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", color:"rgba(11,18,32,0.80)", cursor:"pointer", fontWeight:950, fontSize:13, flexShrink:0 },
  addBtn:       { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 14px", borderRadius:14, border:"1px solid rgba(46,171,254,0.22)", background:"var(--rs-blue)", color:"#fff", cursor:"pointer", fontWeight:950, minWidth:96, flexShrink:0 },
  addedBtn:     { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 14px", borderRadius:14, border:"1px solid rgba(0,180,180,0.20)", background:"rgba(0,180,180,0.12)", color:"rgba(0,140,140,1)", cursor:"default", fontWeight:950, minWidth:96, flexShrink:0 },
  overlay:      { position:"fixed", inset:0, background:"rgba(2,8,23,0.42)", zIndex:50 },
  drawer:       { position:"fixed", top:0, right:0, height:"100vh", width:380, maxWidth:"92vw", background:"rgba(255,255,255,0.92)", borderLeft:"1px solid rgba(2,8,23,0.10)", boxShadow:"-20px 0 50px rgba(2,8,23,0.18)", zIndex:60, display:"flex", flexDirection:"column", backdropFilter:"blur(10px)" },
  drawerHead:   { padding:14, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(2,8,23,0.08)" },
  drawerTitle:  { display:"inline-flex", alignItems:"center", gap:10, fontWeight:950, color:"rgba(11,18,32,0.86)" },
  iconBtn:      { width:38, height:38, borderRadius:12, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", display:"grid", placeItems:"center" },
  drawerBody:   { padding:14, overflow:"auto", display:"grid", gap:12, flex:1, alignContent:"start" },
  drawerFoot:   { padding:14, borderTop:"1px solid rgba(2,8,23,0.08)", display:"grid", gap:10 },
  drawerEmpty:  { padding:18 },
  cartItem:     { borderRadius:16, border:"1px solid rgba(2,8,23,0.08)", background:"#fff", padding:12, display:"grid", gap:8, alignContent:"start" },
  cartTop:      { display:"flex", justifyContent:"space-between", gap:10, alignItems:"flex-start" },
  cartName:     { fontWeight:900, color:"rgba(11,18,32,0.84)", fontSize:14, lineHeight:1.35, flex:1 },
  removeBtn:    { width:34, height:34, borderRadius:12, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", cursor:"pointer", display:"grid", placeItems:"center", color:"rgba(11,18,32,0.70)" },
  cartPrice:    { fontWeight:950, color:"rgba(11,18,32,0.80)", fontSize:14, marginTop:2 },
  textbookCheck:{ display:"flex", gap:10, alignItems:"center", fontSize:13, fontWeight:750, color:"rgba(11,18,32,0.70)" },
  totalRow:     { display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:14, fontWeight:850, color:"rgba(11,18,32,0.78)" },
  checkoutBtn:  { width:"100%", padding:"12px 14px", borderRadius:14, border:"1px solid rgba(46,171,254,0.22)", background:"var(--rs-blue)", color:"#fff", cursor:"pointer", fontWeight:950, fontSize:14 },
  secondaryBtn: { width:"100%", padding:"12px 14px", borderRadius:14, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:950, fontSize:14, color:"rgba(11,18,32,0.80)" },
  toastWrap:    { position:"fixed", top:74, left:"50%", transform:"translateX(-50%)", zIndex:70, padding:"0 14px", width:"min(700px,100%)" },
  toast:        { borderRadius:18, border:"1px solid rgba(2,8,23,0.08)", background:"rgba(255,255,255,0.92)", boxShadow:"0 18px 48px rgba(2,8,23,0.14)", padding:12, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, backdropFilter:"blur(10px)" },
  toastLeft:    { display:"flex", alignItems:"center", gap:12 },
  toastIcon:    { width:42, height:42, borderRadius:16, display:"grid", placeItems:"center", background:"rgba(0,180,180,0.12)", border:"1px solid rgba(0,180,180,0.20)", color:"rgba(0,140,140,1)", flexShrink:0 },
  toastTitle:   { fontWeight:950, color:"rgba(11,18,32,0.86)" },
  toastSub:     { fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.55)", marginTop:2 },
  toastClose:   { width:38, height:38, borderRadius:12, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", display:"grid", placeItems:"center" },
};

export default Courses;