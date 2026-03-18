import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeDollarSign, BookOpen, CheckCircle2 } from 'lucide-react';

const BUNDLES = [
  {
    id: 'starter',
    name: 'Starter License Path',
    subtitle: 'Best for first-time MLO candidates',
    price: 249,
    savings: 'Save $39',
    cta: { path: '/courses?type=PE', label: 'Select Starter Bundle' },
    items: [
      '20-hour SAFE Pre-License Course',
      'Exam prep checkpoints',
      'Progress tracker and certificate workflow',
    ],
    featured: true,
  },
  {
    id: 'renewal',
    name: 'Annual Renewal Bundle',
    subtitle: 'For active MLOs renewing this year',
    price: 129,
    savings: 'Save $19',
    cta: { path: '/courses?type=CE', label: 'Select Renewal Bundle' },
    items: [
      '8-hour NMLS CE course',
      'State-specific elective support where required',
      'Quick-completion learning path',
    ],
    featured: false,
  },
];

const PricingPage = () => {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState('TX');

  const totalIfSeparate = useMemo(() => 199 + 99, []);

  return (
    <div style={S.page}>
      <style>{css}</style>

      <header style={S.topbar}>
        <div style={S.topbarInner}>
          <button style={S.backBtn} type="button" onClick={() => navigate('/home')}>
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
          <div style={S.titleWrap}>
            <div style={S.title}>Pricing & Bundles</div>
            <div style={S.sub}>Compare options and select your course path.</div>
          </div>
        </div>
      </header>

      <main style={S.shell}>
        <section style={S.hero}>
          <div>
            <div style={S.heroKicker}>Phase 1: Discover</div>
            <h1 style={S.heroTitle}>Choose a course or bundle</h1>
            <p style={S.heroText}>Review transparent pricing, then move to catalog with your preferred path pre-selected.</p>
          </div>
          <div style={S.stateWrap}>
            <label style={S.label}>State for browsing</label>
            <input
              style={S.input}
              value={selectedState}
              maxLength={2}
              onChange={(e) => setSelectedState(e.target.value.toUpperCase())}
              placeholder="TX"
            />
          </div>
        </section>

        <section style={S.cards}>
          {BUNDLES.map((bundle) => (
            <article key={bundle.id} style={{ ...S.card, ...(bundle.featured ? S.featuredCard : {}) }}>
              {bundle.featured && <div style={S.ribbon}>Most Selected</div>}
              <div style={S.cardTop}>
                <h2 style={S.cardTitle}>{bundle.name}</h2>
                <p style={S.cardSub}>{bundle.subtitle}</p>
              </div>
              <div style={S.priceRow}>
                <span style={S.price}>${bundle.price}</span>
                <span style={S.savings}>{bundle.savings}</span>
              </div>
              <ul style={S.list}>
                {bundle.items.map((item) => (
                  <li key={item} style={S.listItem}>
                    <CheckCircle2 size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                style={bundle.featured ? S.primaryBtn : S.secondaryBtn}
                type="button"
                onClick={() => navigate(`${bundle.cta.path}&state=${selectedState || 'TX'}`)}
              >
                {bundle.cta.label}
              </button>
            </article>
          ))}
        </section>

        <section style={S.bottomGrid}>
          <article style={S.slimCard}>
            <div style={S.slimHead}><BookOpen size={16} /> Individual Course</div>
            <p style={S.slimText}>Prefer to decide one course at a time? Browse full catalog with state and type filters.</p>
            <button
              style={S.secondaryBtn}
              type="button"
              onClick={() => navigate(`/courses?state=${selectedState || 'TX'}`)}
            >
              Select Individual Course
            </button>
          </article>

          <article style={S.slimCard}>
            <div style={S.slimHead}><BadgeDollarSign size={16} /> Price Snapshot</div>
            <p style={S.slimText}>PE + CE as separate purchases: ${totalIfSeparate}. Bundles reduce cost and simplify enrollment.</p>
            <button style={S.secondaryBtn} type="button" onClick={() => navigate('/state-requirements')}>
              Check State Requirements
            </button>
          </article>
        </section>
      </main>
    </div>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f6f7fb; }
`;

const S = {
  page: { minHeight: '100vh', background: '#f6f7fb' },
  topbar: { position: 'sticky', top: 0, zIndex: 20, borderBottom: '1px solid rgba(2,8,23,0.08)', background: 'rgba(246,247,251,0.9)', backdropFilter: 'blur(10px)' },
  topbarInner: { maxWidth: 1160, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(2,8,23,0.1)', borderRadius: 999, background: '#fff', padding: '9px 12px', fontWeight: 800, cursor: 'pointer' },
  titleWrap: { display: 'grid', gap: 3 },
  title: { fontWeight: 900, color: '#091925' },
  sub: { fontSize: 12, fontWeight: 700, color: 'rgba(9,25,37,0.6)' },
  shell: { maxWidth: 1160, margin: '0 auto', padding: '20px 16px 36px' },
  hero: { borderRadius: 22, background: 'linear-gradient(145deg, #082136 0%, #0e3b5a 55%, #0cbf9c 100%)', boxShadow: '0 20px 55px rgba(2,8,23,0.2)', padding: 24, marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  heroKicker: { fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' },
  heroTitle: { margin: '6px 0 8px', color: '#fff', fontSize: 'clamp(26px, 3vw, 34px)', lineHeight: 1.1, fontWeight: 900 },
  heroText: { margin: 0, color: 'rgba(255,255,255,0.8)', maxWidth: 620, lineHeight: 1.65, fontWeight: 600 },
  stateWrap: { minWidth: 180, display: 'grid', gap: 8, alignSelf: 'flex-end' },
  label: { color: '#fff', fontWeight: 800, fontSize: 12 },
  input: { height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '0 12px', fontWeight: 800, textTransform: 'uppercase', outline: 'none' },
  cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  card: { position: 'relative', borderRadius: 20, background: '#fff', border: '1px solid rgba(2,8,23,0.08)', padding: 18, boxShadow: '0 12px 32px rgba(2,8,23,0.08)', display: 'grid', gap: 12 },
  featuredCard: { border: '1px solid rgba(46,171,254,0.32)', boxShadow: '0 15px 38px rgba(46,171,254,0.18)' },
  ribbon: { position: 'absolute', top: 12, right: 12, padding: '4px 9px', borderRadius: 999, fontSize: 11, fontWeight: 800, color: '#00557e', background: 'rgba(46,171,254,0.15)', border: '1px solid rgba(46,171,254,0.32)' },
  cardTop: { paddingRight: 80 },
  cardTitle: { margin: 0, fontWeight: 900, color: '#091925' },
  cardSub: { margin: '4px 0 0', color: 'rgba(11,18,32,0.62)', fontWeight: 600, lineHeight: 1.6 },
  priceRow: { display: 'flex', alignItems: 'end', gap: 8 },
  price: { fontSize: 40, lineHeight: 1, fontWeight: 900, color: '#091925' },
  savings: { padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(12,191,156,0.3)', background: 'rgba(12,191,156,0.12)', color: '#016b58', fontWeight: 800, fontSize: 12 },
  list: { margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 },
  listItem: { display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(11,18,32,0.84)', fontWeight: 600 },
  primaryBtn: { height: 44, border: 'none', borderRadius: 12, background: '#091925', color: '#fff', fontWeight: 900, cursor: 'pointer' },
  secondaryBtn: { height: 44, border: '1px solid rgba(2,8,23,0.12)', borderRadius: 12, background: '#fff', color: '#091925', fontWeight: 800, cursor: 'pointer' },
  bottomGrid: { marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  slimCard: { borderRadius: 18, background: '#fff', border: '1px solid rgba(2,8,23,0.08)', boxShadow: '0 10px 30px rgba(2,8,23,0.08)', padding: 18, display: 'grid', gap: 10, alignContent: 'start' },
  slimHead: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, color: '#091925' },
  slimText: { margin: 0, color: 'rgba(11,18,32,0.62)', fontWeight: 600, lineHeight: 1.6 },
};

export default PricingPage;
