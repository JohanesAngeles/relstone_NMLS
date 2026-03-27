import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Clock, MapPin, ShoppingCart, Filter,
  ArrowLeft, X, Search, CheckCircle2,
} from "lucide-react";
import API from "../../api/axios";
import Layout from "../../components/Layout";

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [cart, setCart]                 = useState([]);
  const [filters, setFilters]           = useState({ type: "", state: "", hours: "" });
  const [q, setQ]                       = useState("");
  const [showCart, setShowCart]         = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => { fetchCourses(); }, [filters]);

  const fetchCourses = async () => {
    setLoading(true); setError("");
    try {
      const params = {};
      if (filters.type)  params.type  = filters.type;
      if (filters.state) params.state = filters.state;
      const res = await API.get("/courses", { params });
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart    = (course) => {
    if (cart.find((c) => c._id === course._id)) return;
    setCart((prev) => [...prev, { ...course, include_textbook: false }]);
    setShowCart(true);
  };
  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c._id !== id));
  const toggleTextbook = (id) => setCart((prev) => prev.map((c) => c._id === id ? { ...c, include_textbook: !c.include_textbook } : c));

  const total = useMemo(() =>
    cart.reduce((acc, c) => acc + Number(c.price || 0) + (c.include_textbook ? Number(c.textbook_price || 0) : 0), 0),
  [cart]);

  const availableHours = useMemo(() => {
    const uniq = new Set(
      courses
        .map((c) => Number(c?.credit_hours))
        .filter((h) => Number.isFinite(h) && h > 0)
    );
    return [...uniq].sort((a, b) => a - b);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let list = courses;

    if (filters.hours) {
      const selectedHours = Number(filters.hours);
      list = list.filter((c) => Number(c?.credit_hours) === selectedHours);
    }

    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((c) =>
      String(c.title || "").toLowerCase().includes(needle) ||
      String(c.description || "").toLowerCase().includes(needle)
    );
  }, [courses, q, filters.hours]);

  return (
    <Layout>
      <style>{css}</style>

<div style={S.shell} className="shell">

        {/* ── Page header ── */}
<div style={S.pageHeader} className="pageHeader">
          <div style={S.pageHeaderLeft}>
            <button style={S.backBtn} onClick={() => navigate("/dashboard")} type="button">
              <ArrowLeft size={15} /><span>Dashboard</span>
            </button>
            <div>
              <div style={S.pageTitle}>Course Catalog</div>
              <div style={S.pageSub}>
                {filters.state
                  ? `Showing courses approved in ${filters.state}`
                  : "Browse NMLS-approved PE and CE courses"}
              </div>
            </div>
          </div>
          <button style={S.cartBtn} onClick={() => setShowCart(true)} type="button">
            <ShoppingCart size={17} />
            <span>Cart</span>
            <span style={S.cartCount}>{cart.length}</span>
            {cart.length > 0 && <span style={S.cartTotalPill}>${total.toFixed(2)}</span>}
          </button>
        </div>

        {/* ── Order success toast ── */}
        {orderSuccess && (
<div style={S.toastWrap} className="toastWrap">
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

        {/* ── Filters ── */}
<section style={S.filtersCard} className="filtersCard">
          <div style={S.filtersLeft}>
            <div style={S.searchWrap}>
              <Search size={15} style={{ opacity:0.6, flexShrink:0 }} />
              <input style={S.searchInput} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search courses or description…" />
            </div>
            <div style={S.filterWrap}>
              <Filter size={15} style={{ opacity:0.6 }} />
              <select style={S.select} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                <option value="PE">Pre-Licensing (PE)</option>
                <option value="CE">Continuing Education (CE)</option>
              </select>
              <select style={S.select} value={filters.hours} onChange={(e) => setFilters({ ...filters, hours: e.target.value })}>
                <option value="">All Hours</option>
                {availableHours.map((h) => (
                  <option key={h} value={String(h)}>{h} Hours</option>
                ))}
              </select>
              {user?.state && (
                <button
                  type="button"
                  style={filters.state === user.state ? S.stateActiveBtn : S.stateBtn}
                  onClick={() => setFilters({ ...filters, state: filters.state === user.state ? "" : user.state })}
                >
                  <MapPin size={13} /><span>{filters.state === user.state ? `${user.state} only` : `My state: ${user.state}`}</span>
                </button>
              )}
              {(filters.type || filters.hours || filters.state) && (
                <button type="button" style={S.clearBtn} onClick={() => setFilters({ ...filters, type: "", hours: "", state: "" })}>
                  Clear
                </button>
              )}
            </div>
          </div>
          <div style={S.countPill}>
            {loading ? "Loading…" : `${filteredCourses.length} course${filteredCourses.length === 1 ? "" : "s"}`}
          </div>
        </section>

        {/* ── Course grid ── */}
<section style={S.grid} className="grid">
          {loading ? (
            <div style={S.centerMsg}>Loading courses…</div>
          ) : error ? (
            <div style={S.centerMsgError}>{error}</div>
          ) : filteredCourses.length === 0 ? (
            <div style={S.emptyCard}>
              <div style={S.emptyTitle}>No courses found</div>
              <div style={S.emptySub}>
                {user?.state
                  ? `No courses are available for your state (${filters.state}) yet.`
                  : "No courses match your filters."}
              </div>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const inCart = cart.some((c) => c._id === course._id);
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
                  <div style={S.detailsBox}>
                    <div style={S.moduleHeader}>
                      <span>Modules</span>
                      <span style={S.moduleCount}>{Array.isArray(course.modules) ? course.modules.length : 0}</span>
                    </div>
                    {Array.isArray(course.modules) && course.modules.length > 0 ? (
                      <div style={S.modulesScroll}>
                        <div style={S.modules}>
                          {course.modules.map((m, i) => (
                            <div key={i} style={S.moduleRow}>
                              <span style={S.moduleBadge}>Module {m.order ?? i + 1}</span>
                              <span style={S.moduleTitle}>{m.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={S.moduleEmpty}>No modules listed yet.</div>
                    )}
                  </div>

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
                    <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                      <button style={S.detailsBtn} onClick={() => navigate(`/courses/${course._id}`)} type="button">
                        Details
                      </button>
                      <button
                        style={inCart ? S.addedBtn : S.addBtn}
                        onClick={() => addToCart(course)}
                        disabled={inCart}
                        type="button"
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
      </div>

      {/* ── Cart drawer ── */}
      {showCart && (
        <>
<div style={S.overlay} className="overlay" onClick={() => setShowCart(false)} />
<aside style={S.drawer} className="drawer">
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
                    type="button"
                  >
                    Checkout
                  </button>
                  <button style={S.drawerSecondaryBtn} onClick={() => setShowCart(false)} type="button">
                    Continue browsing
                  </button>
                </div>
              </>
            )}
          </aside>
        </>
      )}
    </Layout>
  );
};

/* ── Badge helper ── */
const badgeStyle = (type) => {
  const t = String(type || "").toUpperCase();
  const base = { display:"inline-flex", alignItems:"center", padding:"6px 10px", borderRadius:999, fontSize:12, fontWeight:900, flexShrink:0 };
  if (t === "PE") return { ...base, color:"#2EABFE",          background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.22)" };
  if (t === "CE") return { ...base, color:"rgba(0,140,140,1)", background:"rgba(0,180,180,0.12)", border:"1px solid rgba(0,180,180,0.20)" };
  return { ...base, color:"rgba(9,25,37,0.82)", background:"rgba(2,8,23,0.06)", border:"1px solid rgba(2,8,23,0.10)" };
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box}

@media (max-width: 768px) {
  .shell {
    max-width: none !important;
    padding: 16px 12px 40px !important;
  }
  
  .pageHeader {
    flex-direction: column !important;
    gap: 16px !important;
  }
  
  .filtersCard {
    flex-direction: column !important;
    gap: 16px !important;
    padding: 16px !important;
  }
  
  .filtersLeft {
    width: 100% !important;
  }
  
  .searchWrap {
    min-width: auto !important;
    width: 100% !important;
  }
  
  .filterWrap {
    flex-wrap: wrap !important;
  }
  
  .grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }
  
  .courseCard {
    padding: 14px !important;
    gap: 10px !important;
  }
  
  .courseTitleRow {
    flex-direction: column !important;
    align-items: flex-start !important;
  }
  
  .courseIcon {
    width: 36px !important;
    height: 36px !important;
  }
  
  .detailsBox {
    min-height: 120px !important;
    padding: 8px !important;
  }
  
  .modulesScroll {
    max-height: 80px !important;
  }
  
  .courseFooter {
    flex-direction: column !important;
    gap: 12px !important;
    align-items: stretch !important;
  }
  
  .priceBlock {
    order: 2 !important;
  }
  
  .detailsBtn, .addBtn, .addedBtn {
    width: 100% !important;
    min-width: auto !important;
  }
  
  .drawer {
    width: 100vw !important;
    max-width: none !important;
  }
  
  .toastWrap {
    left: 0 !important;
    transform: none !important;
    width: 100vw !important;
    padding: 0 12px !important;
  }
}

@media (max-width: 480px) {
  .shell {
    padding: 12px 8px 32px !important;
  }
  
  .backBtn span, .cartBtn span:not(.cartCount):not(.cartTotalPill) {
    display: none !important;
  }
  
  .pageTitle {
    font-size: 16px !important;
  }
  
  .filterWrap {
    flex-direction: column !important;
  }
  
  .select {
    width: 100% !important;
    text-align: center !important;
  }
  
  .courseTitle {
    font-size: 15px !important;
  }
}
`;


const S = {
  shell:            { maxWidth:1180, margin:"0 auto", padding:"20px 18px 48px" },

  // Page header
  pageHeader:       { display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:18 },
  pageHeaderLeft:   { display:"flex", alignItems:"center", gap:12 },
  backBtn:          { display:"inline-flex", alignItems:"center", gap:7, padding:"9px 14px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:900, fontSize:13, color:"rgba(11,18,32,0.82)", flexShrink:0 },
  pageTitle:        { fontWeight:950, fontSize:18, color:"#091925", letterSpacing:"-0.2px" },
  pageSub:          { fontSize:12, fontWeight:700, color:"rgba(9,25,37,0.50)", marginTop:2 },
  cartBtn:          { display:"inline-flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:950, fontSize:13, color:"rgba(11,18,32,0.82)", boxShadow:"0 4px 14px rgba(2,8,23,0.06)" },
  cartCount:        { minWidth:22, height:22, borderRadius:999, display:"inline-grid", placeItems:"center", background:"rgba(46,171,254,0.14)", border:"1px solid rgba(46,171,254,0.22)", color:"#091925", fontWeight:950, fontSize:12, padding:"0 6px" },
  cartTotalPill:    { padding:"4px 10px", borderRadius:999, background:"#091925", color:"#fff", fontWeight:950, fontSize:12 },

  // Filters
  filtersCard:      { borderRadius:18, background:"rgba(255,255,255,0.82)", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"0 4px 16px rgba(2,8,23,0.06)", padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:14 },
  filtersLeft:      { display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" },
  searchWrap:       { display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", minWidth:260 },
  searchInput:      { border:"none", outline:"none", width:"100%", fontSize:13, fontWeight:700, color:"rgba(11,18,32,0.80)", background:"transparent" },
  filterWrap:       { display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff" },
  select:           { border:"none", outline:"none", background:"transparent", fontSize:13, fontWeight:800, color:"rgba(11,18,32,0.78)", cursor:"pointer" },
  stateBtn:         { display:"inline-flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:999, background:"#fff", border:"1px solid rgba(2,8,23,0.10)", color:"rgba(11,18,32,0.72)", fontWeight:900, fontSize:12, cursor:"pointer" },
  stateActiveBtn:   { display:"inline-flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:999, background:"rgba(46,171,254,0.10)", border:"1px solid rgba(46,171,254,0.22)", color:"#091925", fontWeight:900, fontSize:12, cursor:"pointer" },
  clearBtn:         { border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", borderRadius:999, padding:"6px 10px", cursor:"pointer", fontWeight:900, fontSize:12, color:"rgba(11,18,32,0.72)" },
  countPill:        { padding:"9px 12px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", fontWeight:950, fontSize:13, color:"rgba(11,18,32,0.78)", flexShrink:0 },

  // Grid
  grid:             { display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:12, alignItems:"stretch" },
  centerMsg:        { padding:18, color:"rgba(11,18,32,0.55)", fontWeight:800 },
  centerMsgError:   { padding:18, color:"crimson", fontWeight:900 },
  emptyCard:        { gridColumn:"1 / -1", borderRadius:22, background:"#fff", border:"1px dashed rgba(2,8,23,0.18)", padding:22 },
  emptyTitle:       { fontWeight:950, color:"rgba(11,18,32,0.86)" },
  emptySub:         { marginTop:6, color:"rgba(11,18,32,0.55)", fontWeight:700, fontSize:12, lineHeight:1.6 },

  // Course card
  courseCard:       { borderRadius:22, background:"rgba(255,255,255,0.92)", border:"1px solid rgba(2,8,23,0.08)", boxShadow:"0 8px 24px rgba(2,8,23,0.07)", padding:16, display:"flex", flexDirection:"column", gap:12, minWidth:0, height:"100%", minHeight:420 },
  courseHead:       { display:"flex", justifyContent:"space-between", gap:10, alignItems:"flex-start" },
  courseTitleRow:   { display:"flex", gap:10, minWidth:0, flex:1 },
  courseTextWrap:   { minWidth:0, flex:1 },
  courseIcon:       { width:40, height:40, borderRadius:16, background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.18)", display:"grid", placeItems:"center", color:"#091925", flexShrink:0 },
  courseTitle:      { fontWeight:950, color:"rgba(11,18,32,0.88)", lineHeight:1.2, overflowWrap:"anywhere" },
  courseDesc:       { marginTop:4, color:"rgba(11,18,32,0.55)", fontWeight:600, fontSize:12, lineHeight:1.5, overflowWrap:"anywhere", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" },
  metaRow:          { display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-start" },
  metaItem:         { display:"inline-flex", alignItems:"center", gap:7, padding:"7px 10px", borderRadius:999, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", color:"rgba(11,18,32,0.72)", fontWeight:800, fontSize:12, flexShrink:0 },
  metaItemStates:   { display:"flex", alignItems:"center", gap:7, padding:"7px 10px", borderRadius:16, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", color:"rgba(11,18,32,0.72)", fontWeight:800, fontSize:12, flex:"1 1 200px" },
  statesText:       { display:"block", whiteSpace:"normal", wordBreak:"break-word", lineHeight:1.5 },
  detailsBox:       { borderRadius:16, border:"1px solid rgba(2,8,23,0.08)", background:"rgba(2,8,23,0.02)", padding:10, minHeight:146, display:"flex", flexDirection:"column" },
  moduleHeader:     { width:"100%", fontWeight:900, color:"rgba(11,18,32,0.78)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, fontSize:14 },
  moduleCount:      { display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:24, height:24, padding:"0 8px", borderRadius:999, border:"1px solid rgba(46,171,254,0.22)", background:"rgba(46,171,254,0.12)", color:"#091925", fontSize:12, fontWeight:900 },
  modulesScroll:    { marginTop:10, maxHeight:92, overflowY:"auto", paddingRight:4 },
  modules:          { marginTop:10, display:"grid", gap:8 },
  moduleRow:        { display:"flex", gap:10, alignItems:"flex-start" },
  moduleBadge:      { fontSize:12, fontWeight:950, padding:"4px 10px", borderRadius:999, background:"rgba(46,171,254,0.12)", border:"1px solid rgba(46,171,254,0.18)", color:"#091925", flexShrink:0 },
  moduleTitle:      { fontWeight:700, color:"rgba(11,18,32,0.78)", fontSize:13, lineHeight:1.5, overflowWrap:"anywhere" },
  moduleEmpty:      { marginTop:12, color:"rgba(11,18,32,0.48)", fontWeight:700, fontSize:12 },
  courseFooter:     { display:"flex", justifyContent:"space-between", gap:12, alignItems:"flex-end", borderTop:"1px solid rgba(2,8,23,0.06)", paddingTop:12, marginTop:"auto" },
  priceBlock:       { display:"grid", gap:4, flex:1 },
  price:            { fontWeight:950, fontSize:18, color:"rgba(11,18,32,0.88)" },
  textbookNote:     { fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.55)", lineHeight:1.4 },
  detailsBtn:       { display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"10px 14px", borderRadius:14, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", color:"rgba(11,18,32,0.80)", cursor:"pointer", fontWeight:950, fontSize:13, flexShrink:0 },
  addBtn:           { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 14px", borderRadius:14, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:950, fontSize:13, minWidth:90, flexShrink:0 },
  addedBtn:         { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 14px", borderRadius:14, border:"1px solid rgba(0,180,180,0.20)", background:"rgba(0,180,180,0.12)", color:"rgba(0,140,140,1)", cursor:"default", fontWeight:950, fontSize:13, minWidth:90, flexShrink:0 },

  // Cart drawer
  overlay:          { position:"fixed", inset:0, background:"rgba(2,8,23,0.42)", zIndex:50 },
  drawer:           { position:"fixed", top:0, right:0, height:"100vh", width:380, maxWidth:"92vw", background:"rgba(255,255,255,0.96)", borderLeft:"1px solid rgba(2,8,23,0.10)", boxShadow:"-20px 0 50px rgba(2,8,23,0.18)", zIndex:60, display:"flex", flexDirection:"column" },
  drawerHead:       { padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(2,8,23,0.08)" },
  drawerTitle:      { display:"inline-flex", alignItems:"center", gap:10, fontWeight:950, color:"rgba(11,18,32,0.86)", fontSize:15 },
  iconBtn:          { width:36, height:36, borderRadius:10, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", display:"grid", placeItems:"center" },
  drawerBody:       { padding:14, overflow:"auto", display:"grid", gap:12, flex:1, alignContent:"start" },
  drawerFoot:       { padding:14, borderTop:"1px solid rgba(2,8,23,0.08)", display:"grid", gap:10 },
  drawerEmpty:      { padding:18 },
  cartItem:         { borderRadius:16, border:"1px solid rgba(2,8,23,0.08)", background:"#fff", padding:12, display:"grid", gap:8 },
  cartTop:          { display:"flex", justifyContent:"space-between", gap:10, alignItems:"flex-start" },
  cartName:         { fontWeight:900, color:"rgba(11,18,32,0.84)", fontSize:14, lineHeight:1.35, flex:1 },
  removeBtn:        { width:32, height:32, borderRadius:10, border:"1px solid rgba(2,8,23,0.10)", background:"rgba(2,8,23,0.02)", cursor:"pointer", display:"grid", placeItems:"center", color:"rgba(11,18,32,0.70)", flexShrink:0 },
  cartPrice:        { fontWeight:950, color:"rgba(11,18,32,0.80)", fontSize:14 },
  textbookCheck:    { display:"flex", gap:10, alignItems:"center", fontSize:13, fontWeight:750, color:"rgba(11,18,32,0.70)" },
  totalRow:         { display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:14, fontWeight:850, color:"rgba(11,18,32,0.78)" },
  checkoutBtn:      { width:"100%", padding:"12px 14px", borderRadius:14, border:"none", background:"#091925", color:"#fff", cursor:"pointer", fontWeight:950, fontSize:14 },
  drawerSecondaryBtn:{ width:"100%", padding:"12px 14px", borderRadius:14, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", fontWeight:950, fontSize:14, color:"rgba(11,18,32,0.80)" },

  // Toast
  toastWrap:        { position:"fixed", top:72, left:"50%", transform:"translateX(-50%)", zIndex:70, padding:"0 14px", width:"min(700px,100%)" },
  toast:            { borderRadius:18, border:"1px solid rgba(2,8,23,0.08)", background:"rgba(255,255,255,0.96)", boxShadow:"0 18px 48px rgba(2,8,23,0.14)", padding:12, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 },
  toastLeft:        { display:"flex", alignItems:"center", gap:12 },
  toastIcon:        { width:42, height:42, borderRadius:16, display:"grid", placeItems:"center", background:"rgba(0,180,180,0.12)", border:"1px solid rgba(0,180,180,0.20)", color:"rgba(0,140,140,1)", flexShrink:0 },
  toastTitle:       { fontWeight:950, color:"rgba(11,18,32,0.86)", fontSize:14 },
  toastSub:         { fontSize:12, fontWeight:700, color:"rgba(11,18,32,0.55)", marginTop:2 },
  toastClose:       { width:36, height:36, borderRadius:10, border:"1px solid rgba(2,8,23,0.10)", background:"#fff", cursor:"pointer", display:"grid", placeItems:"center", flexShrink:0 },
};

export default Courses;