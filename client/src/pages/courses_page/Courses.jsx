import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, MapPin, ShoppingCart, Filter, ArrowLeft } from 'lucide-react';
import API from '../../api/axios';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({ type: '', state: '' });
  const [showCart, setShowCart] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.state) params.state = filters.state;
      const res = await API.get('/courses', { params });
      setCourses(res.data);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (course) => {
    if (cart.find(c => c._id === course._id)) return;
    setCart([...cart, { ...course, include_textbook: false }]);
  };

  const removeFromCart = (courseId) => {
    setCart(cart.filter(c => c._id !== courseId));
  };

  const toggleTextbook = (courseId) => {
    setCart(cart.map(c =>
      c._id === courseId ? { ...c, include_textbook: !c.include_textbook } : c
    ));
  };

  const getTotal = () => {
    return cart.reduce((sum, c) => {
      return sum + c.price + (c.include_textbook ? c.textbook_price : 0);
    }, 0);
  };

  const handleCheckout = async () => {
    setOrdering(true);
    try {
      const items = cart.map(c => ({
        course_id: c._id,
        include_textbook: c.include_textbook
      }));
      await API.post('/orders', { items });
      setOrderSuccess(true);
      setCart([]);
      setShowCart(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} style={{ marginRight: 6 }} />
            Dashboard
          </button>
          <h1 style={styles.headerTitle}>Course Catalog</h1>
        </div>
        <button style={styles.cartBtn} onClick={() => setShowCart(!showCart)}>
          <ShoppingCart size={18} style={{ marginRight: 6 }} />
          Cart ({cart.length})
          {cart.length > 0 && <span style={styles.cartBadge}>${getTotal()}</span>}
        </button>
      </div>

      {/* Order Success Banner */}
      {orderSuccess && (
        <div style={styles.successBanner}>
          Order placed successfully! Check your dashboard for your courses.
          <button style={styles.dismissBtn} onClick={() => setOrderSuccess(false)}>✕</button>
        </div>
      )}

      <div style={styles.body}>
        {/* Filters */}
        <div style={styles.filterBar}>
          <Filter size={16} style={{ color: '#666' }} />
          <select
            style={styles.select}
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="PE">Pre-Licensing (PE)</option>
            <option value="CE">Continuing Education (CE)</option>
          </select>
          <select
            style={styles.select}
            value={filters.state}
            onChange={e => setFilters({ ...filters, state: e.target.value })}
          >
            <option value="">All States</option>
            {US_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {(filters.type || filters.state) && (
            <button style={styles.clearBtn} onClick={() => setFilters({ type: '', state: '' })}>
              Clear Filters
            </button>
          )}
        </div>

        <div style={styles.mainContent}>
          {/* Course List */}
          <div style={styles.courseList}>
            {loading ? (
              <p style={styles.empty}>Loading courses...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : courses.length === 0 ? (
              <p style={styles.empty}>No courses found for the selected filters.</p>
            ) : (
              courses.map(course => {
                const inCart = cart.find(c => c._id === course._id);
                return (
                  <div key={course._id} style={styles.courseCard}>
                    <div style={styles.courseTop}>
                      <div style={styles.courseTitleRow}>
                        <BookOpen size={18} color="#1a73e8" style={{ flexShrink: 0 }} />
                        <div>
                          <h3 style={styles.courseTitle}>{course.title}</h3>
                          <p style={styles.courseDesc}>{course.description}</p>
                        </div>
                      </div>
                      <span style={styles.badge(course.type)}>{course.type}</span>
                    </div>

                    <div style={styles.courseMeta}>
                      <span style={styles.metaItem}>
                        <Clock size={13} style={{ marginRight: 4 }} />
                        {course.credit_hours} credit hours
                      </span>
                      <span style={styles.metaItem}>
                        <MapPin size={13} style={{ marginRight: 4 }} />
                        {course.states_approved?.join(', ') || 'All states'}
                      </span>
                    </div>

                    {course.modules?.length > 0 && (
                      <div style={styles.modules}>
                        {course.modules.map((m, i) => (
                          <span key={i} style={styles.moduleTag}>Module {m.order}: {m.title}</span>
                        ))}
                      </div>
                    )}

                    <div style={styles.courseFooter}>
                      <div style={styles.priceBlock}>
                        <span style={styles.price}>${course.price}</span>
                        {course.has_textbook && (
                          <span style={styles.textbookNote}>+ Textbook available (${course.textbook_price})</span>
                        )}
                      </div>
                      <button
                        style={inCart ? styles.addedBtn : styles.addBtn}
                        onClick={() => addToCart(course)}
                        disabled={!!inCart}
                      >
                        <ShoppingCart size={14} style={{ marginRight: 6 }} />
                        {inCart ? 'Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div style={styles.cartSidebar}>
              <h3 style={styles.cartTitle}>
                <ShoppingCart size={18} style={{ marginRight: 8 }} />
                Your Cart
              </h3>

              {cart.length === 0 ? (
                <p style={styles.empty}>Your cart is empty.</p>
              ) : (
                <>
                  {cart.map(c => (
                    <div key={c._id} style={styles.cartItem}>
                      <div style={styles.cartItemTop}>
                        <span style={styles.cartItemTitle}>{c.title}</span>
                        <button style={styles.removeBtn} onClick={() => removeFromCart(c._id)}>✕</button>
                      </div>
                      <div style={styles.cartItemPrice}>${c.price}</div>
                      {c.has_textbook && (
                        <label style={styles.textbookCheck}>
                          <input
                            type="checkbox"
                            checked={c.include_textbook}
                            onChange={() => toggleTextbook(c._id)}
                            style={{ marginRight: 6 }}
                          />
                          Add Textbook (+${c.textbook_price})
                        </label>
                      )}
                    </div>
                  ))}

                  <div style={styles.cartTotal}>
                    Total: <strong>${getTotal()}</strong>
                  </div>

                  <button
                    style={styles.checkoutBtn}
                    onClick={handleCheckout}
                    disabled={ordering}
                  >
                    {ordering ? 'Placing Order...' : 'Checkout'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' },
  header: { background: '#1a73e8', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  headerTitle: { margin: 0, fontSize: '1.2rem' },
  backBtn: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  cartBtn: { display: 'flex', alignItems: 'center', background: '#fff', color: '#1a73e8', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  cartBadge: { marginLeft: '0.5rem', background: '#1a73e8', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' },
  successBanner: { background: '#e6f4ea', color: '#34a853', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 500 },
  dismissBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#34a853', fontSize: '1rem' },
  body: { padding: '1.5rem 2rem' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  select: { padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer' },
  clearBtn: { background: 'none', border: '1px solid #ddd', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', color: '#666' },
  mainContent: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  courseList: { flex: 1 },
  empty: { color: '#888', fontStyle: 'italic' },
  courseCard: { background: '#fff', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  courseTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  courseTitleRow: { display: 'flex', gap: '0.75rem', flex: 1 },
  courseTitle: { margin: '0 0 0.25rem', fontSize: '1rem', color: '#1a1a1a' },
  courseDesc: { margin: 0, fontSize: '0.85rem', color: '#888' },
  badge: (type) => ({ flexShrink: 0, background: type === 'PE' ? '#e8f0fe' : '#e6f4ea', color: type === 'PE' ? '#1a73e8' : '#34a853', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }),
  courseMeta: { display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' },
  metaItem: { display: 'flex', alignItems: 'center' },
  modules: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' },
  moduleTag: { background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#555' },
  courseFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' },
  priceBlock: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  price: { fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a' },
  textbookNote: { fontSize: '0.8rem', color: '#888' },
  addBtn: { display: 'flex', alignItems: 'center', background: '#1a73e8', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  addedBtn: { display: 'flex', alignItems: 'center', background: '#e6f4ea', color: '#34a853', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'default', fontSize: '0.9rem' },
  cartSidebar: { width: '300px', background: '#fff', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: '1rem' },
  cartTitle: { display: 'flex', alignItems: 'center', margin: '0 0 1rem', fontSize: '1rem', color: '#333' },
  cartItem: { borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' },
  cartItemTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' },
  cartItemTitle: { fontSize: '0.9rem', fontWeight: 500, color: '#333', flex: 1, marginRight: '0.5rem' },
  cartItemPrice: { fontSize: '0.9rem', color: '#1a73e8', fontWeight: 600, marginBottom: '0.25rem' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.85rem' },
  textbookCheck: { display: 'flex', alignItems: 'center', fontSize: '0.82rem', color: '#666', cursor: 'pointer' },
  cartTotal: { fontSize: '1rem', fontWeight: 600, textAlign: 'right', margin: '1rem 0', color: '#333' },
  checkoutBtn: { width: '100%', padding: '0.75rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }
};

export default Courses;