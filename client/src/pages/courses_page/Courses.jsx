import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Clock, MapPin, ShoppingCart, Filter,
  ArrowLeft, X, Search, CheckCircle2, ChevronDown,
  Layers,
} from "lucide-react";
import API from "../../api/axios";
import Layout from "../../components/Layout";
import AnnouncementModal from '../../components/AnnouncementModal';
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
  const [purchasedIds, setPurchasedIds] = useState(new Set());

  useEffect(() => { fetchCourses(); }, [filters]);

  useEffect(() => {
    const fetchPurchased = async () => {
      try {
        const [ordersRes, enrollRes] = await Promise.all([
          API.get('/orders/my'),
          API.get('/enrollment/my'),
        ]);

        const ids = new Set();

        // From paid/completed orders
        (ordersRes.data || []).forEach(order => {
          if (['paid', 'completed'].includes(order.status)) {
            (order.items || []).forEach(item => {
              const id = item.course_id?._id || item.course_id;
              if (id) ids.add(String(id));
            });
          }
        });

        // From enrollments
        (enrollRes.data || []).forEach(e => {
          const id = e.course_id?._id || e.course_id;
          if (id) ids.add(String(id));
        });

        setPurchasedIds(ids);
      } catch {
        // silent fail
      }
    };
    fetchPurchased();
  }, []);

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
      courses.map((c) => Number(c?.credit_hours)).filter((h) => Number.isFinite(h) && h > 0)
    );
    return [...uniq].sort((a, b) => a - b);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let list = courses;
    if (filters.hours) list = list.filter((c) => Number(c?.credit_hours) === Number(filters.hours));
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((c) =>
      String(c.title || "").toLowerCase().includes(needle) ||
      String(c.description || "").toLowerCase().includes(needle)
    );
  }, [courses, q, filters.hours]);

  const peCount = filteredCourses.filter(c => c.type === 'PE').length;
  const ceCount = filteredCourses.filter(c => c.type === 'CE').length;

  return (
    <Layout>
      <AnnouncementModal />
      <style>{css}</style>

      <div style={S.shell} className="courses-shell">

        {/* ── Top bar ── */}
        <div style={S.topBar}>
          <button style={S.backBtn} onClick={() => navigate("/dashboard")} type="button">
            <ArrowLeft size={14} /> Dashboard
          </button>

          <div style={S.topBarCenter}>
            <div style={S.searchBox}>
              <Search size={14} style={{ color:"rgba(11,18,32,0.40)", flexShrink:0 }} />
              <input
                style={S.searchInput}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search courses…"
              />
              {q && (
                <button style={S.clearSearch} onClick={() => setQ('')} type="button">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <button style={S.cartBtn} onClick={() => setShowCart(true)} type="button">
            <ShoppingCart size={16} />
            {cart.length > 0 && <span style={S.cartBadge}>{cart.length}</span>}
            {cart.length > 0 && <span style={S.cartTotal}>${total.toFixed(2)}</span>}
          </button>
        </div>

        {/* ── Hero ── */}
        <div style={S.hero}>
          <div style={S.heroLeft}>
            <div style={S.heroEyebrow}>NMLS Approved Courses</div>
            <h1 style={S.heroTitle}>Course Catalog</h1>
            <p style={S.heroSub}>
              {filters.state
                ? `Showing courses approved in ${filters.state}`
                : "Find the right PE or CE course for your mortgage license"}
            </p>
            <div style={S.heroStats}>
              <div style={S.heroStat}>
                <span style={S.heroStatNum}>{peCount}</span>
                <span style={S.heroStatLabel}>PE Courses</span>
              </div>
              <div style={S.heroStatDivider} />
              <div style={S.heroStat}>
                <span style={S.heroStatNum}>{ceCount}</span>
                <span style={S.heroStatLabel}>CE Courses</span>
              </div>
              <div style={S.heroStatDivider} />
              <div style={S.heroStat}>
                <span style={S.heroStatNum}>{filteredCourses.length}</span>
                <span style={S.heroStatLabel}>Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div style={S.filterBar}>
          <div style={S.filterGroup}>
            <Filter size={13} style={{ color:'rgba(11,18,32,0.45)', flexShrink:0 }} />
            <span style={S.filterLabel}>Filter:</span>
          </div>

          <div style={S.filterPills}>
            {/* Type */}
            {['', 'PE', 'CE'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setFilters(f => ({ ...f, type: t }))}
                style={{ ...S.pill, ...(filters.type === t ? S.pillActive : {}) }}
              >
                {t === '' ? 'All Types' : t === 'PE' ? 'Pre-Licensing (PE)' : 'Continuing Ed (CE)'}
              </button>
            ))}

            <div style={S.filterDivider} />

            {/* Hours */}
            <div style={S.selectWrap}>
              <select
                style={S.filterSelect}
                value={filters.hours}
                onChange={e => setFilters(f => ({ ...f, hours: e.target.value }))}
              >
                <option value="">All Hours</option>
                {availableHours.map(h => <option key={h} value={String(h)}>{h} Hours</option>)}
              </select>
              <ChevronDown size={12} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'rgba(11,18,32,0.45)' }} />
            </div>

            {/* State */}
            {user?.state && (
              <button
                type="button"
                style={{ ...S.pill, ...(filters.state === user.state ? S.pillStateActive : {}) }}
                onClick={() => setFilters(f => ({ ...f, state: f.state === user.state ? "" : user.state }))}
              >
                <MapPin size={12} /> {user.state}
              </button>
            )}

            {(filters.type || filters.hours || filters.state) && (
              <button
                type="button"
                style={S.clearBtn}
                onClick={() => setFilters({ type:"", hours:"", state:"" })}
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          <div style={S.resultCount}>
            {loading ? "Loading…" : `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        {/* ── Toast ── */}
        {orderSuccess && (
          <div style={S.toast}>
            <CheckCircle2 size={16} style={{ color:'#10b981', flexShrink:0 }} />
            <span>Order placed! Check your dashboard for your courses.</span>
            <button style={S.toastClose} onClick={() => setOrderSuccess(false)} type="button">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div style={S.loadingGrid}>
            {[1,2,3,4].map(i => <div key={i} style={S.skeleton} />)}
          </div>
        ) : error ? (
          <div style={S.errorState}>{error}</div>
        ) : filteredCourses.length === 0 ? (
          <div style={S.emptyState}>
            <BookOpen size={36} style={{ color:'rgba(11,18,32,0.20)', marginBottom:12 }} />
            <div style={{ fontWeight:700, fontSize:15, color:'rgba(11,18,32,0.55)', marginBottom:6 }}>No courses found</div>
            <div style={{ fontSize:13, color:'rgba(11,18,32,0.40)' }}>Try adjusting your filters</div>
          </div>
        ) : (
          <div style={S.grid} className="courses-grid">
            {filteredCourses.map((course) => {
              const inCart      = cart.some((c) => c._id === course._id);
              const isPE        = course.type === 'PE';
              const isPurchased = purchasedIds.has(String(course._id));

              return (
                <div key={course._id} style={S.card} className="course-card">

                  {/* Left color bar */}
                  <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background: isPE ? '#2EABFE' : '#00B4B4', borderRadius:'18px 0 0 18px' }} />

                  {/* Card content */}
                  <div style={{ padding:'20px 20px 20px 24px', display:'flex', flexDirection:'column', gap:14, height:'100%' }}>

                    {/* Header row: icon + badge + credit hours */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background: isPE ? 'rgba(46,171,254,0.12)' : 'rgba(0,180,180,0.12)', color: isPE ? '#2EABFE' : '#00B4B4', display:'grid', placeItems:'center', flexShrink:0 }}>
                          <BookOpen size={16} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:999, letterSpacing:'0.04em', color: isPE ? '#2EABFE' : '#00B4B4', background: isPE ? 'rgba(46,171,254,0.10)' : 'rgba(0,180,180,0.10)', border: `1px solid ${isPE ? 'rgba(46,171,254,0.22)' : 'rgba(0,180,180,0.22)'}` }}>
                          {isPE ? 'Pre-Licensing' : 'Continuing Ed'} · {course.type}
                        </span>
                      </div>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'rgba(11,18,32,0.55)', background:'rgba(2,8,23,0.04)', border:'1px solid rgba(2,8,23,0.08)', padding:'4px 10px', borderRadius:999 }}>
                        <Clock size={11} /> {course.credit_hours} credit hrs
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{ fontSize:15, fontWeight:800, color:'rgba(11,18,32,0.90)', lineHeight:1.35 }}>
                      {course.title}
                    </div>

                    {/* Description */}
                    {course.description && (
                      <div style={{ fontSize:12, fontWeight:500, color:'rgba(11,18,32,0.48)', lineHeight:1.65, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {course.description}
                      </div>
                    )}

                    {/* States + modules pills */}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {Array.isArray(course.states_approved) && course.states_approved.length > 0 && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, border:'1px solid rgba(2,8,23,0.08)', background:'rgba(2,8,23,0.02)', fontSize:11, fontWeight:600, color:'rgba(11,18,32,0.55)' }}>
                          <MapPin size={10} />
                          {course.states_approved.slice(0,4).join(', ')}{course.states_approved.length > 4 ? ` +${course.states_approved.length - 4}` : ''}
                        </span>
                      )}
                      {Array.isArray(course.modules) && course.modules.length > 0 && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, border:'1px solid rgba(2,8,23,0.08)', background:'rgba(2,8,23,0.02)', fontSize:11, fontWeight:600, color:'rgba(11,18,32,0.55)' }}>
                          <Layers size={10} /> {course.modules.length} modules
                        </span>
                      )}
                      {/* Enrolled badge */}
                      {isPurchased && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, border:'1px solid rgba(16,185,129,0.30)', background:'rgba(16,185,129,0.08)', fontSize:11, fontWeight:700, color:'#10b981' }}>
                          <CheckCircle2 size={10} /> Enrolled
                        </span>
                      )}
                    </div>

                    {/* Modules list */}
                    {Array.isArray(course.modules) && course.modules.length > 0 && (
                      <div style={{ borderRadius:12, border:'1px solid rgba(2,8,23,0.07)', background:'rgba(2,8,23,0.015)', padding:'12px 14px', flex:1 }}>
                        <div style={{ fontSize:10, fontWeight:800, color:'rgba(11,18,32,0.35)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>
                          Course Modules
                        </div>
                        {course.modules.slice(0, 4).map((m, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom: i < Math.min(course.modules.length, 4) - 1 ? 7 : 0 }}>
                            <div style={{ width:5, height:5, borderRadius:'50%', background: isPE ? 'rgba(46,171,254,0.55)' : 'rgba(0,180,180,0.55)', flexShrink:0, marginTop:5 }} />
                            <span style={{ fontSize:12, fontWeight:600, color:'rgba(11,18,32,0.68)', lineHeight:1.5 }}>{m.title}</span>
                          </div>
                        ))}
                        {course.modules.length > 4 && (
                          <div style={{ fontSize:11, fontWeight:600, color:'rgba(11,18,32,0.35)', marginTop:7 }}>
                            +{course.modules.length - 4} more modules
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer: price + actions */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid rgba(2,8,23,0.06)', marginTop:'auto' }}>
                      <div>
                        <div style={{ fontSize:22, fontWeight:900, color:'rgba(11,18,32,0.90)', lineHeight:1 }}>
                          ${Number(course.price || 0).toFixed(2)}
                        </div>
                        {course.has_textbook && (
                          <div style={{ fontSize:11, fontWeight:600, color:'rgba(11,18,32,0.38)', marginTop:3 }}>
                            + Textbook ${Number(course.textbook_price || 0).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button
                          style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'9px 16px', borderRadius:10, border:'1px solid rgba(2,8,23,0.14)', background:'transparent', color:'rgba(11,18,32,0.72)', cursor:'pointer', fontWeight:700, fontSize:13 }}
                          onClick={() => navigate(`/courses/${course._id}`)}
                          type="button"
                        >
                          Details
                        </button>
                        <button
                          style={{
                            display:'inline-flex', alignItems:'center', justifyContent:'center',
                            gap:6, padding:'9px 18px', borderRadius:10, border:'none',
                            background: isPurchased
                              ? 'rgba(2,8,23,0.06)'
                              : inCart
                                ? (isPE ? 'rgba(46,171,254,0.12)' : 'rgba(0,180,180,0.12)')
                                : '#091925',
                            color: isPurchased
                              ? 'rgba(11,18,32,0.35)'
                              : inCart
                                ? (isPE ? '#2EABFE' : '#00B4B4')
                                : '#fff',
                            cursor: (inCart || isPurchased) ? 'default' : 'pointer',
                            fontWeight:800, fontSize:13
                          }}
                          onClick={() => !isPurchased && addToCart(course)}
                          disabled={inCart || isPurchased}
                          type="button"
                        >
                          {isPurchased
                            ? <><CheckCircle2 size={14} /> Enrolled</>
                            : inCart
                              ? <><CheckCircle2 size={14} /> Added</>
                              : <><ShoppingCart size={14} /> Add</>}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cart drawer ── */}
      {showCart && (
        <>
          <div style={S.overlay} onClick={() => setShowCart(false)} />
          <aside style={S.drawer}>
            <div style={S.drawerHead}>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:15, color:'rgba(11,18,32,0.88)' }}>
                <ShoppingCart size={17} /> Cart
                {cart.length > 0 && <span style={S.cartBadge}>{cart.length}</span>}
              </div>
              <button style={S.iconBtn} onClick={() => setShowCart(false)} type="button">
                <X size={17} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding:'48px 20px', textAlign:'center' }}>
                <ShoppingCart size={28} style={{ color:'rgba(11,18,32,0.20)', marginBottom:12 }} />
                <div style={{ fontWeight:700, fontSize:14, color:'rgba(11,18,32,0.50)', marginBottom:6 }}>Your cart is empty</div>
                <div style={{ fontSize:12, color:'rgba(11,18,32,0.35)' }}>Add a course to get started</div>
              </div>
            ) : (
              <>
                <div style={S.drawerBody}>
                  {cart.map((c) => (
                    <div key={c._id} style={S.cartItem}>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:10, alignItems:'flex-start', marginBottom:6 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:'rgba(11,18,32,0.86)', lineHeight:1.4, flex:1 }}>{c.title}</div>
                        <button style={S.removeBtn} onClick={() => removeFromCart(c._id)} type="button">
                          <X size={13} />
                        </button>
                      </div>
                      <div style={{ fontWeight:800, fontSize:15, color:'rgba(11,18,32,0.80)', marginBottom: c.has_textbook ? 8 : 0 }}>
                        ${Number(c.price || 0).toFixed(2)}
                      </div>
                      {c.has_textbook && (
                        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, fontWeight:600, color:'rgba(11,18,32,0.60)', cursor:'pointer' }}>
                          <input type="checkbox" checked={!!c.include_textbook} onChange={() => toggleTextbook(c._id)} style={{ accentColor:'#2EABFE' }} />
                          Add textbook (+${Number(c.textbook_price || 0).toFixed(2)})
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <div style={S.drawerFoot}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'rgba(11,18,32,0.60)' }}>Total</span>
                    <span style={{ fontSize:20, fontWeight:900, color:'rgba(11,18,32,0.88)' }}>${total.toFixed(2)}</span>
                  </div>
                  <button
                    style={S.checkoutBtn}
                    onClick={() => { localStorage.setItem("cart", JSON.stringify(cart)); navigate("/checkout"); }}
                    type="button"
                  >
                    Checkout →
                  </button>
                  <button style={S.drawerSecBtn} onClick={() => setShowCart(false)} type="button">
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

/* ── CSS ── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; }

.course-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(2,8,23,0.10) !important;
}

@media (max-width: 900px) {
  .courses-grid { grid-template-columns: 1fr !important; }
}
@media (max-width: 640px) {
  .courses-shell { padding: 14px 12px 48px !important; }
}
`;

/* ── Styles ── */
const S = {
  shell:       { maxWidth:1180, margin:'0 auto', padding:'20px 20px 60px' },

  /* Top bar */
  topBar:      { display:'flex', alignItems:'center', gap:12, marginBottom:24 },
  backBtn:     { display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:'1px solid rgba(2,8,23,0.10)', background:'#fff', cursor:'pointer', fontWeight:700, fontSize:13, color:'rgba(11,18,32,0.70)', flexShrink:0, whiteSpace:'nowrap' },
  topBarCenter:{ flex:1 },
  searchBox:   { display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:10, border:'1px solid rgba(2,8,23,0.12)', background:'#fff', boxShadow:'0 1px 4px rgba(2,8,23,0.04)' },
  searchInput: { flex:1, border:'none', outline:'none', fontSize:13, fontWeight:500, color:'rgba(11,18,32,0.82)', background:'transparent', fontFamily:'inherit' },
  clearSearch: { width:20, height:20, borderRadius:999, border:'none', background:'rgba(2,8,23,0.07)', cursor:'pointer', display:'grid', placeItems:'center', color:'rgba(11,18,32,0.55)', flexShrink:0 },
  cartBtn:     { display:'inline-flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:10, border:'1px solid rgba(2,8,23,0.10)', background:'#fff', cursor:'pointer', fontWeight:700, fontSize:13, color:'rgba(11,18,32,0.80)', flexShrink:0, position:'relative', boxShadow:'0 1px 4px rgba(2,8,23,0.04)' },
  cartBadge:   { display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:20, height:20, borderRadius:999, background:'#2EABFE', color:'#fff', fontSize:11, fontWeight:900, padding:'0 5px' },
  cartTotal:   { fontWeight:800, color:'rgba(11,18,32,0.80)' },

  /* Hero */
  hero:        { marginBottom:24, padding:'28px 28px 24px', borderRadius:18, background:'linear-gradient(135deg, #091925 0%, #0d2a45 100%)', color:'#fff', position:'relative', overflow:'hidden' },
  heroLeft:    { position:'relative', zIndex:1 },
  heroEyebrow: { fontSize:11, fontWeight:800, color:'rgba(46,171,254,0.80)', letterSpacing:'0.10em', textTransform:'uppercase', marginBottom:10 },
  heroTitle:   { fontSize:28, fontWeight:900, color:'#fff', letterSpacing:'-0.5px', marginBottom:8, lineHeight:1.1 },
  heroSub:     { fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.60)', marginBottom:20, lineHeight:1.6 },
  heroStats:   { display:'flex', alignItems:'center', gap:20 },
  heroStat:    { display:'flex', flexDirection:'column', gap:2 },
  heroStatNum: { fontSize:22, fontWeight:900, color:'#fff', lineHeight:1 },
  heroStatLabel:{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.50)', textTransform:'uppercase', letterSpacing:'0.05em' },
  heroStatDivider:{ width:1, height:32, background:'rgba(255,255,255,0.15)' },

  /* Filter bar */
  filterBar:   { display:'flex', alignItems:'center', gap:10, marginBottom:20, flexWrap:'wrap', padding:'10px 14px', borderRadius:12, background:'#fff', border:'1px solid rgba(2,8,23,0.08)', boxShadow:'0 1px 4px rgba(2,8,23,0.04)' },
  filterGroup: { display:'flex', alignItems:'center', gap:6 },
  filterLabel: { fontSize:12, fontWeight:700, color:'rgba(11,18,32,0.45)', textTransform:'uppercase', letterSpacing:'0.05em' },
  filterPills: { display:'flex', alignItems:'center', gap:6, flex:1, flexWrap:'wrap' },
  filterDivider:{ width:1, height:20, background:'rgba(2,8,23,0.10)', margin:'0 4px' },
  pill:        { display:'inline-flex', alignItems:'center', gap:5, padding:'6px 13px', borderRadius:999, border:'1px solid rgba(2,8,23,0.10)', background:'transparent', fontSize:12, fontWeight:600, color:'rgba(11,18,32,0.65)', cursor:'pointer', whiteSpace:'nowrap', transition:'all .12s' },
  pillActive:  { background:'#091925', color:'#fff', border:'1px solid #091925' },
  pillStateActive:{ background:'rgba(46,171,254,0.12)', color:'#2EABFE', border:'1px solid rgba(46,171,254,0.30)' },
  selectWrap:  { position:'relative', display:'inline-flex', alignItems:'center' },
  filterSelect:{ appearance:'none', padding:'6px 28px 6px 12px', borderRadius:999, border:'1px solid rgba(2,8,23,0.10)', background:'transparent', fontSize:12, fontWeight:600, color:'rgba(11,18,32,0.65)', cursor:'pointer', outline:'none' },
  clearBtn:    { display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:999, border:'1px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.06)', fontSize:12, fontWeight:600, color:'#ef4444', cursor:'pointer' },
  resultCount: { marginLeft:'auto', fontSize:12, fontWeight:700, color:'rgba(11,18,32,0.45)', whiteSpace:'nowrap' },

  /* Toast */
  toast:       { display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderRadius:12, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.22)', color:'rgba(11,18,32,0.80)', fontSize:13, fontWeight:600, marginBottom:16 },
  toastClose:  { marginLeft:'auto', width:26, height:26, borderRadius:7, border:'1px solid rgba(2,8,23,0.10)', background:'transparent', cursor:'pointer', display:'grid', placeItems:'center', color:'rgba(11,18,32,0.50)' },

  /* Loading */
  loadingGrid: { display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14 },
  skeleton:    { height:380, borderRadius:18, background:'linear-gradient(90deg, rgba(2,8,23,0.04) 25%, rgba(2,8,23,0.07) 50%, rgba(2,8,23,0.04) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' },

  /* Error/Empty */
  errorState:  { padding:'48px 20px', textAlign:'center', color:'#ef4444', fontWeight:700 },
  emptyState:  { padding:'60px 20px', textAlign:'center', gridColumn:'1/-1', display:'flex', flexDirection:'column', alignItems:'center' },

  /* Grid */
  grid:        { display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:14 },

  /* Card */
  card:        { borderRadius:18, background:'#fff', border:'1px solid rgba(2,8,23,0.08)', boxShadow:'0 4px 16px rgba(2,8,23,0.06)', position:'relative', overflow:'hidden' },

  /* Cart drawer */
  overlay:     { position:'fixed', inset:0, background:'rgba(2,8,23,0.45)', zIndex:50 },
  drawer:      { position:'fixed', top:0, right:0, height:'100vh', width:360, maxWidth:'92vw', background:'#fff', borderLeft:'1px solid rgba(2,8,23,0.10)', zIndex:60, display:'flex', flexDirection:'column', boxShadow:'-20px 0 60px rgba(2,8,23,0.15)' },
  drawerHead:  { padding:'18px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(2,8,23,0.07)' },
  iconBtn:     { width:34, height:34, borderRadius:9, border:'1px solid rgba(2,8,23,0.10)', background:'transparent', cursor:'pointer', display:'grid', placeItems:'center', color:'rgba(11,18,32,0.55)' },
  drawerBody:  { flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:10 },
  drawerFoot:  { padding:'16px 18px', borderTop:'1px solid rgba(2,8,23,0.07)' },
  cartItem:    { padding:'14px', borderRadius:14, border:'1px solid rgba(2,8,23,0.08)', background:'rgba(2,8,23,0.01)' },
  removeBtn:   { width:28, height:28, borderRadius:7, border:'1px solid rgba(2,8,23,0.09)', background:'transparent', cursor:'pointer', display:'grid', placeItems:'center', color:'rgba(11,18,32,0.50)', flexShrink:0 },
  checkoutBtn: { width:'100%', padding:'13px', borderRadius:12, border:'none', background:'#091925', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', marginBottom:8 },
  drawerSecBtn:{ width:'100%', padding:'11px', borderRadius:12, border:'1px solid rgba(2,8,23,0.10)', background:'transparent', color:'rgba(11,18,32,0.65)', fontWeight:700, fontSize:13, cursor:'pointer' },
};

export default Courses;