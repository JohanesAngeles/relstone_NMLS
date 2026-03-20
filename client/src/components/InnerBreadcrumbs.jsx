import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ROUTE_LABELS } from '../data/navigationData';

const SEGMENT_LABELS = {
  home: 'Home',
  dashboard: 'Dashboard',
  instructor: 'Instructor',
  students: 'Students',
  courses: 'Courses',
  checkout: 'Checkout',
  pricing: 'Pricing',
  resources: 'Resources',
  'state-requirements': 'State Requirements',
  certificate: 'Certificate',
  learn: 'Learning Portal',
};

const toTitle = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (s) => s.toUpperCase());
};

const getSegmentLabel = (segment) => {
  if (!segment) return '';
  if (/^[0-9a-f]{24}$/i.test(segment)) return 'Details';
  if (/^[A-Z0-9]{2,8}$/.test(segment)) return segment;
  return SEGMENT_LABELS[segment] || toTitle(segment);
};

const buildCrumbs = (pathname) => {
  if (!pathname || pathname === '/') return [];

  if (ROUTE_LABELS[pathname]) {
    const homeCrumb = pathname === '/home' ? [] : [{ path: '/home', label: 'Home' }];
    return [...homeCrumb, { path: pathname, label: ROUTE_LABELS[pathname] }];
  }

  const parts = pathname.split('/').filter(Boolean);
  let current = '';
  const items = [];

  parts.forEach((part) => {
    current += `/${part}`;
    items.push({ path: current, label: ROUTE_LABELS[current] || getSegmentLabel(part) });
  });

  if (items.length > 0 && items[0].path !== '/home' && pathname !== '/home') {
    items.unshift({ path: '/home', label: 'Home' });
  }

  return items;
};

const InnerBreadcrumbs = ({ style, compact = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const crumbs = useMemo(() => buildCrumbs(location.pathname), [location.pathname]);

  if (crumbs.length <= 1) return null;

  return (
    <nav style={{ ...S.row, ...(compact ? S.rowCompact : {}), ...style }} aria-label="Breadcrumb">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <div key={crumb.path} style={S.itemWrap}>
            <button
              type="button"
              style={{ ...S.itemBtn, ...(isLast ? S.itemBtnActive : {}) }}
              onClick={() => !isLast && navigate(crumb.path)}
              disabled={isLast}
            >
              {crumb.label}
            </button>
            {!isLast && <ChevronRight size={14} style={S.chevron} />}
          </div>
        );
      })}
    </nav>
  );
};

const S = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  rowCompact: {
    gap: 2,
  },
  itemWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  itemBtn: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(9,25,37,0.54)',
  },
  itemBtnActive: {
    color: 'rgba(9,25,37,0.84)',
    cursor: 'default',
    fontWeight: 900,
  },
  chevron: {
    color: 'rgba(9,25,37,0.35)',
  },
};

export default InnerBreadcrumbs;
