import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, MapPin, ShieldCheck } from 'lucide-react';
import API from '../../api/axios';

const STATE_CODES = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM',
  'NY','NC','ND','OH','OK','OR','PA','RI','SC','SD',
  'TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DC: 'District of Columbia', DE: 'Delaware', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts',
  MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska',
  NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
  PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming',
};

const StateRequirements = () => {
  const navigate = useNavigate();

  const [stateCode, setStateCode] = useState('TX');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get('/courses', { params: { state: stateCode } });
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Unable to load state requirements at the moment.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [stateCode]);

  const peCourse = useMemo(() => courses.find((c) => String(c.type).toUpperCase() === 'PE'), [courses]);
  const ceCourse = useMemo(() => courses.find((c) => String(c.type).toUpperCase() === 'CE'), [courses]);

  const requirements = useMemo(() => {
    const hasStateSpecificCe = !!ceCourse && Array.isArray(ceCourse.states_approved) && ceCourse.states_approved.length === 1;

    return {
      preLicenseHours: peCourse?.credit_hours ?? 20,
      annualCeHours: ceCourse?.credit_hours ?? 8,
      hasStateSpecificCe,
      stateElectiveHours: hasStateSpecificCe ? 1 : 0,
      exam: 'SAFE MLO Test required for initial licensure.',
      renewal: 'Annual CE due by December 31 each year.',
    };
  }, [peCourse, ceCourse]);

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
            <div style={S.title}>State Requirements</div>
            <div style={S.sub}>Review your licensing path before selecting a course.</div>
          </div>
        </div>
      </header>

      <main style={S.shell}>
        <section style={S.hero}>
          <div style={S.heroHead}>
            <div>
              <div style={S.heroKicker}>Phase 1: Discover</div>
              <h1 style={S.heroTitle}>Find your state licensing requirements</h1>
              <p style={S.heroText}>Select a state to view pre-license and annual renewal requirements, then jump directly to matching courses.</p>
            </div>
            <div style={S.statePickerWrap}>
              <label style={S.label}>Select State</label>
              <select style={S.select} value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                {STATE_CODES.map((code) => (
                  <option key={code} value={code}>{STATE_NAMES[code]} ({code})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={S.kpiRow}>
            <Kpi icon={<BookOpen size={16} />} label="Pre-License" value={`${requirements.preLicenseHours} hours`} />
            <Kpi icon={<Clock size={16} />} label="Annual CE" value={`${requirements.annualCeHours} hours`} />
            <Kpi icon={<MapPin size={16} />} label="State Elective" value={requirements.hasStateSpecificCe ? `${requirements.stateElectiveHours} hour required` : 'Not required'} />
            <Kpi icon={<ShieldCheck size={16} />} label="Renewal Deadline" value="Dec 31" />
          </div>
        </section>

        <section style={S.grid}>
          <article style={S.card}>
            <h2 style={S.cardTitle}>Requirement Summary for {STATE_NAMES[stateCode]}</h2>
            {loading ? (
              <p style={S.muted}>Loading requirements...</p>
            ) : error ? (
              <p style={S.error}>{error}</p>
            ) : (
              <ul style={S.list}>
                <li>Initial licensing path includes {requirements.preLicenseHours}-hour SAFE pre-license education.</li>
                <li>{requirements.exam}</li>
                <li>Annual renewal requires {requirements.annualCeHours} hours of NMLS CE.</li>
                <li>{requirements.hasStateSpecificCe ? 'This state includes a dedicated state-specific CE elective.' : 'This state is covered under the general 8-hour CE track.'}</li>
                <li>{requirements.renewal}</li>
              </ul>
            )}
          </article>

          <article style={S.card}>
            <h2 style={S.cardTitle}>Recommended Next Step</h2>
            <p style={S.muted}>Move directly to the catalog with this state filter applied.</p>
            <button
              style={S.primaryBtn}
              type="button"
              onClick={() => navigate(`/courses?state=${stateCode}`)}
            >
              Browse {stateCode} Courses
            </button>
            <button style={S.secondaryBtn} type="button" onClick={() => navigate('/pricing')}>
              Review Pricing & Bundles
            </button>
          </article>
        </section>
      </main>
    </div>
  );
};

const Kpi = ({ icon, label, value }) => (
  <div style={S.kpi}>
    <div style={S.kpiIcon}>{icon}</div>
    <div>
      <div style={S.kpiLabel}>{label}</div>
      <div style={S.kpiValue}>{value}</div>
    </div>
  </div>
);

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
  hero: { borderRadius: 22, padding: 24, background: 'linear-gradient(140deg, #091925 0%, #123047 45%, #2EABFE 100%)', boxShadow: '0 20px 55px rgba(2,8,23,0.2)', marginBottom: 16 },
  heroHead: { display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  heroKicker: { fontSize: 11, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' },
  heroTitle: { margin: '6px 0 8px', color: '#fff', fontSize: 'clamp(26px, 3vw, 34px)', lineHeight: 1.12, fontWeight: 900 },
  heroText: { margin: 0, color: 'rgba(255,255,255,0.78)', maxWidth: 620, lineHeight: 1.65, fontWeight: 600 },
  statePickerWrap: { minWidth: 280, display: 'grid', gap: 8, alignSelf: 'flex-end' },
  label: { color: '#fff', fontWeight: 800, fontSize: 12 },
  select: { height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.14)', color: '#fff', padding: '0 12px', fontWeight: 700, outline: 'none' },
  kpiRow: { marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 },
  kpi: { display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 12px' },
  kpiIcon: { color: 'rgba(255,255,255,0.8)', display: 'flex' },
  kpiLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 11, fontWeight: 700 },
  kpiValue: { color: '#fff', fontSize: 14, fontWeight: 900 },
  grid: { display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 14 },
  card: { borderRadius: 18, background: '#fff', border: '1px solid rgba(2,8,23,0.08)', padding: 18, boxShadow: '0 10px 30px rgba(2,8,23,0.08)', display: 'grid', alignContent: 'start', gap: 12 },
  cardTitle: { margin: 0, fontWeight: 900, color: '#091925' },
  list: { margin: 0, paddingLeft: 18, display: 'grid', gap: 8, color: 'rgba(11,18,32,0.82)', fontWeight: 600, lineHeight: 1.6 },
  muted: { margin: 0, color: 'rgba(11,18,32,0.62)', fontWeight: 600, lineHeight: 1.6 },
  error: { margin: 0, color: '#b91c1c', fontWeight: 700 },
  primaryBtn: { height: 44, border: 'none', borderRadius: 12, background: '#2EABFE', color: '#fff', fontWeight: 900, cursor: 'pointer' },
  secondaryBtn: { height: 44, border: '1px solid rgba(2,8,23,0.12)', borderRadius: 12, background: '#fff', color: '#091925', fontWeight: 800, cursor: 'pointer' },
};

export default StateRequirements;
