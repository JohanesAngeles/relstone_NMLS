import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarClock,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  GraduationCap,
  Landmark,
  MapPin,
} from 'lucide-react';
import API from '../../api/axios';
import Layout from '../../components/Layout';
import InnerBreadcrumbs from '../../components/InnerBreadcrumbs';
import { STATE_CODES, STATE_NAMES } from '../../data/navigationData';
import { getStateRequirement } from '../../data/stateRequirementsData';

const QUICK_STATES = ['CA', 'FL', 'TX', 'NY', 'NJ', 'NC', 'PA', 'OR', 'RI', 'NM'];

const StateRequirements = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryState = (searchParams.get('state') || 'TX').toUpperCase();
  const defaultState = STATE_CODES.includes(queryState) ? queryState : 'TX';

  const [stateCode, setStateCode] = useState(defaultState);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (STATE_CODES.includes(queryState) && queryState !== stateCode) {
      setStateCode(queryState);
    }
  }, [queryState, stateCode]);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get('/courses', { params: { state: stateCode } });
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch {
        setError('Unable to load matching Relstone courses right now.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [stateCode]);

  const selectedName = STATE_NAMES[stateCode] || stateCode;
  const requirement = useMemo(() => getStateRequirement(stateCode), [stateCode]);

  const matchingCourses = useMemo(() => {
    const list = [...courses];
    list.sort((a, b) => {
      const ta = String(a?.type || '').toUpperCase();
      const tb = String(b?.type || '').toUpperCase();
      if (ta === tb) return 0;
      if (ta === 'PE') return -1;
      if (tb === 'PE') return 1;
      return 0;
    });
    return list;
  }, [courses]);

  const handleStateChange = (next) => {
    setStateCode(next);
    setSearchParams({ state: next });
  };

  return (
    <Layout>
      <style>{css}</style>
      <div style={S.shell}>
        <div style={S.pageHead}>
          <div style={S.breadcrumbWrap}><InnerBreadcrumbs /></div>
          <h1 style={S.pageTitle}>State Requirements</h1>
          <p style={S.pageSub}>
            View {selectedName} pre-licensing, exam, post-exam steps, renewal rules, and matching courses.
          </p>
        </div>

        <section style={S.heroPanel}>
          <div style={S.heroTop}>
            <div>
              <div style={S.heroKicker}>Licensing Planner</div>
              <div style={S.heroTitle}>Requirements For {selectedName}</div>
            </div>
            <div style={S.selectorCol}>
              <label style={S.label}>Select State</label>
              <select style={S.select} value={stateCode} onChange={(e) => handleStateChange(e.target.value)}>
                {STATE_CODES.map((code) => (
                  <option key={code} value={code}>{STATE_NAMES[code]} ({code})</option>
                ))}
              </select>
            </div>
          </div>
          <div style={S.quickRow}>
            {QUICK_STATES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleStateChange(code)}
                style={stateCode === code ? S.quickBtnActive : S.quickBtn}
              >
                {code}
              </button>
            ))}
          </div>
          <div style={S.kpiRow}>
            <Kpi icon={<GraduationCap size={16} />} label="Pre-License" value={`${requirement.preLicensingHours} hrs`} />
            <Kpi icon={<ClipboardCheck size={16} />} label="Exam Pass" value={requirement.exam.passScore} />
            <Kpi icon={<Clock3 size={16} />} label="CE Renewal" value={`${requirement.ceRenewal.hours} hrs`} />
            <Kpi icon={<CalendarClock size={16} />} label="Frequency" value={requirement.ceRenewal.frequency} />
          </div>
        </section>

        <section style={S.grid}>
          <article style={S.card}>
            <div style={S.cardHead}><Landmark size={16} /><h2 style={S.cardTitle}>Pre-Licensing Breakdown</h2></div>
            <div style={S.breakdownList}>
              {requirement.subjectBreakdown.map((item) => (
                <div key={`${item.label}-${item.hours}`} style={S.breakdownRow}>
                  <span style={S.breakdownLabel}>{item.label}</span>
                  <span style={S.breakdownHours}>{item.hours} hr{item.hours === 1 ? '' : 's'}</span>
                </div>
              ))}
            </div>
          </article>

          <article style={S.card}>
            <div style={S.cardHead}><FileCheck2 size={16} /><h2 style={S.cardTitle}>State Exam Details</h2></div>
            <ul style={S.list}>
              <li><strong>Format:</strong> {requirement.exam.format}</li>
              <li><strong>Pass score:</strong> {requirement.exam.passScore}</li>
              <li><strong>Scheduling:</strong> {requirement.exam.scheduling}</li>
            </ul>
          </article>

          <article style={S.card}>
            <div style={S.cardHead}><MapPin size={16} /><h2 style={S.cardTitle}>Post-Exam Application Steps</h2></div>
            <ol style={S.orderedList}>
              {requirement.postExamSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article style={S.card}>
            <div style={S.cardHead}><Clock3 size={16} /><h2 style={S.cardTitle}>CE Renewal Requirements</h2></div>
            <p style={S.muted}>
              <strong>{requirement.ceRenewal.hours} total hours</strong> required, {requirement.ceRenewal.frequency}.
            </p>
            <div style={S.breakdownList}>
              {requirement.ceRenewal.breakdown.map((item) => (
                <div key={`${item.label}-${item.hours}`} style={S.breakdownRow}>
                  <span style={S.breakdownLabel}>{item.label}</span>
                  <span style={S.breakdownHours}>{item.hours} hr{item.hours === 1 ? '' : 's'}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={S.coursePanel}>
          <div style={S.coursePanelTop}>
            <div>
              <h2 style={S.courseTitle}>Relstone Courses For {selectedName}</h2>
              <p style={S.muted}>Filtered by state approval where available.</p>
            </div>
            <button style={S.secondaryBtn} type="button" onClick={() => navigate(`/courses?state=${stateCode}`)}>
              View Full Catalog
            </button>
          </div>

          {loading ? (
            <p style={S.muted}>Loading courses...</p>
          ) : error ? (
            <p style={S.error}>{error}</p>
          ) : matchingCourses.length === 0 ? (
            <div style={S.emptyBox}>
              <p style={S.muted}>No state-filtered courses are available for {selectedName} yet.</p>
              <button style={S.primaryBtn} type="button" onClick={() => navigate('/courses')}>
                Browse All Courses
              </button>
            </div>
          ) : (
            <div style={S.courseGrid}>
              {matchingCourses.map((course) => (
                <article key={course._id} style={S.courseCard}>
                  <div style={S.courseTop}>
                    <span style={String(course?.type || '').toUpperCase() === 'PE' ? S.typePillPe : S.typePillCe}>
                      {String(course?.type || '').toUpperCase()}
                    </span>
                    <span style={S.price}>${Number(course?.price || 0).toFixed(2)}</span>
                  </div>
                  <h3 style={S.courseCardTitle}>{course.title}</h3>
                  <p style={S.courseDesc}>{course.description || 'NMLS-approved education path.'}</p>
                  <div style={S.courseMetaRow}>
                    <span style={S.courseMeta}><Clock3 size={13} /> {course.credit_hours} hrs</span>
                    <span style={S.courseMeta}><MapPin size={13} /> {stateCode}</span>
                  </div>
                  <button style={S.primaryBtn} type="button" onClick={() => navigate(`/courses/${course._id}`)}>
                    Enroll Now
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
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
* { box-sizing: border-box; }
`;

const S = {
  shell: { display: 'grid', gap: 14, paddingTop: 8, fontFamily: "'Poppins',sans-serif" },
  pageHead: { display: 'grid', gap: 5 },
  breadcrumbWrap: { marginBottom: 2 },
  pageTitle: { margin: 0, fontSize: 30, fontWeight: 800, color: '#091925', lineHeight: 1.1, fontFamily: "'Poppins',sans-serif" },
  pageSub: { margin: 0, fontSize: 13, color: '#5B7384', fontWeight: 500, fontFamily: "'Poppins',sans-serif" },

  heroPanel: {
    borderRadius: 10,
    border: '0.5px solid rgba(2,8,23,0.07)',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(2,8,23,0.06)',
    padding: 15,
    display: 'grid',
    gap: 12,
  },
  heroTop: { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'end' },
  heroKicker: { fontSize: 10, color: '#7FA8C4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' },
  heroTitle: { color: '#091925', fontWeight: 800, fontSize: 22, marginTop: 4, fontFamily: "'Poppins',sans-serif" },
  selectorCol: { display: 'grid', gap: 6, minWidth: 240 },
  label: { color: '#5B7384', fontSize: 11, fontWeight: 700, fontFamily: "'Poppins',sans-serif" },
  select: {
    height: 40,
    borderRadius: 7,
    border: '0.5px solid rgba(2,8,23,0.15)',
    background: '#fff',
    color: '#091925',
    padding: '0 10px',
    fontSize: 12,
    fontWeight: 600,
    outline: 'none',
    fontFamily: "'Poppins',sans-serif",
  },
  quickRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  quickBtn: {
    height: 28,
    borderRadius: 999,
    border: '1px solid rgba(46,171,254,0.22)',
    background: 'rgba(46,171,254,0.10)',
    color: '#2EABFE',
    padding: '0 10px',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Poppins',sans-serif",
  },
  quickBtnActive: {
    height: 28,
    borderRadius: 999,
    border: '1px solid #2EABFE',
    background: '#2EABFE',
    color: '#091925',
    padding: '0 10px',
    fontSize: 11,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: "'Poppins',sans-serif",
  },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 8 },
  kpi: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    borderRadius: 8,
    border: '0.5px solid rgba(2,8,23,0.07)',
    background: 'rgba(2,8,23,0.01)',
    padding: '9px 10px',
  },
  kpiIcon: { color: '#2EABFE', display: 'flex' },
  kpiLabel: { color: '#7FA8C4', fontSize: 10, fontWeight: 700 },
  kpiValue: { color: '#091925', fontSize: 12, fontWeight: 800 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 11 },
  card: {
    borderRadius: 10,
    border: '0.5px solid rgba(2,8,23,0.07)',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(2,8,23,0.06)',
    padding: 15,
    display: 'grid',
    gap: 10,
  },
  cardHead: { display: 'flex', alignItems: 'center', gap: 8, color: '#2EABFE' },
  cardTitle: { margin: 0, fontSize: 13, fontWeight: 700, color: '#091925', fontFamily: "'Poppins',sans-serif" },
  list: { margin: 0, paddingLeft: 18, display: 'grid', gap: 7, fontSize: 13, color: 'rgba(11,18,32,0.84)', lineHeight: 1.6 },
  orderedList: { margin: 0, paddingLeft: 18, display: 'grid', gap: 7, fontSize: 13, color: 'rgba(11,18,32,0.84)', lineHeight: 1.6 },
  breakdownList: { display: 'grid', gap: 7 },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 8,
    border: '0.5px solid rgba(2,8,23,0.08)',
    background: 'rgba(9,25,37,0.02)',
    padding: '8px 10px',
  },
  breakdownLabel: { fontSize: 12, color: '#0e2537', fontWeight: 600 },
  breakdownHours: {
    fontSize: 11,
    color: '#2EABFE',
    fontWeight: 800,
    borderRadius: 999,
    border: '1px solid rgba(46,171,254,0.22)',
    background: 'rgba(46,171,254,0.10)',
    padding: '2px 7px',
  },

  coursePanel: {
    borderRadius: 10,
    border: '0.5px solid rgba(2,8,23,0.07)',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(2,8,23,0.06)',
    padding: 15,
    display: 'grid',
    gap: 12,
  },
  coursePanelTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  courseTitle: { margin: 0, fontSize: 13, color: '#091925', fontWeight: 700, fontFamily: "'Poppins',sans-serif" },
  muted: { margin: 0, fontSize: 12, color: '#5B7384', lineHeight: 1.6 },
  error: { margin: 0, fontSize: 12, color: '#b91c1c', fontWeight: 700 },
  emptyBox: {
    borderRadius: 10,
    border: '0.5px dashed rgba(2,8,23,0.22)',
    padding: 14,
    display: 'grid',
    gap: 9,
    justifyItems: 'start',
  },

  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10 },
  courseCard: {
    borderRadius: 8,
    border: '0.5px solid rgba(2,8,23,0.08)',
    background: '#fff',
    padding: 12,
    display: 'grid',
    gap: 9,
  },
  courseTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  typePillPe: {
    borderRadius: 999,
    border: '0.5px solid rgba(46,171,254,0.3)',
    background: 'rgba(46,171,254,0.12)',
    color: '#0f5f8e',
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 8px',
  },
  typePillCe: {
    borderRadius: 999,
    border: '0.5px solid rgba(0,128,128,0.3)',
    background: 'rgba(0,160,160,0.1)',
    color: '#0c6868',
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 8px',
  },
  price: { color: '#091925', fontWeight: 900, fontSize: 14 },
  courseCardTitle: { margin: 0, color: '#091925', fontSize: 12, fontWeight: 700, lineHeight: 1.35 },
  courseDesc: { margin: 0, color: 'rgba(11,18,32,0.62)', fontSize: 11, lineHeight: 1.55, minHeight: 50 },
  courseMetaRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  courseMeta: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5B7384', fontWeight: 700 },

  primaryBtn: {
    height: 36,
    borderRadius: 8,
    border: 'none',
    background: '#2EABFE',
    color: '#091925',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Poppins',sans-serif",
    padding: '0 10px',
  },
  secondaryBtn: {
    height: 36,
    borderRadius: 6,
    border: '1px solid rgba(46,171,254,0.22)',
    background: 'rgba(46,171,254,0.10)',
    color: '#2EABFE',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Poppins',sans-serif",
    padding: '0 10px',
  },
};

export default StateRequirements;
