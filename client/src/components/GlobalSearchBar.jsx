import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { RESOURCE_ARTICLES } from '../data/resourcesData';
import { HELP_TOPICS, STATE_NAMES } from '../data/navigationData';

const GlobalSearchBar = ({ minWidth = 280 }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef(null);

  const searchIndex = useMemo(() => {
    const courseTargets = [
      { label: 'Browse All Courses', path: '/courses', type: 'Course' },
      { label: 'Pre-Licensing Courses', path: '/courses?type=PE', type: 'Course' },
      { label: 'Continuing Education Courses', path: '/courses?type=CE', type: 'Course' },
      { label: 'Pricing and Bundles', path: '/pricing', type: 'Course' },
    ];

    const articleTargets = RESOURCE_ARTICLES.map((article) => ({
      label: article.title,
      path: `/resources/${article.slug}`,
      type: 'Article',
    }));

    const helpTargets = HELP_TOPICS.map((topic) => ({
      label: topic.title,
      path: topic.path,
      type: 'Help',
    }));

    const stateTargets = Object.entries(STATE_NAMES).map(([code, name]) => ({
      label: `${name} (${code})`,
      path: `/state-requirements?state=${code}`,
      type: 'State',
    }));

    return [...courseTargets, ...articleTargets, ...helpTargets, ...stateTargets];
  }, []);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term.length < 2) return [];

    const scoreResult = (item) => {
      const label = item.label.toLowerCase();
      const type = item.type.toLowerCase();
      if (label.startsWith(term)) return 4;
      if (label.includes(` ${term}`)) return 3;
      if (label.includes(term)) return 2;
      if (type.includes(term)) return 1;
      return 0;
    };

    return searchIndex
      .map((item) => ({ ...item, score: scoreResult(item) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
      .slice(0, 6);
  }, [searchIndex, searchTerm]);

  const handleSearchSelect = (targetPath) => {
    setSearchOpen(false);
    setSearchTerm('');
    navigate(targetPath);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length === 0) return;
    handleSearchSelect(searchResults[0].path);
  };

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!searchWrapRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <div style={{ ...S.searchWrap, minWidth }} ref={searchWrapRef}>
      <form style={S.searchForm} onSubmit={handleSearchSubmit}>
        <Search size={14} color="rgba(9,25,37,0.55)" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSearchOpen(false);
          }}
          style={S.searchInput}
          placeholder="Search courses, articles, help, states"
          aria-label="Global search"
        />
      </form>

      {searchOpen && (
        <div style={S.searchResults}>
          {searchTerm.trim().length < 2 ? (
            <div style={S.searchEmpty}>Type at least 2 characters</div>
          ) : searchResults.length === 0 ? (
            <div style={S.searchEmpty}>No matches found</div>
          ) : (
            searchResults.map((result) => (
              <button
                key={`${result.type}-${result.path}`}
                type="button"
                style={S.searchResultBtn}
                onClick={() => handleSearchSelect(result.path)}
              >
                <span style={S.searchResultLabel}>{result.label}</span>
                <span style={S.searchResultType}>{result.type}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const S = {
  searchWrap: { position: 'relative' },
  searchForm: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 36,
    borderRadius: 11,
    border: '1px solid rgba(2,8,23,0.10)',
    background: '#fff',
    padding: '0 10px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(9,25,37,0.8)',
  },
  searchResults: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid rgba(2,8,23,0.10)',
    borderRadius: 12,
    boxShadow: '0 18px 40px rgba(2,8,23,0.14)',
    overflow: 'hidden',
    zIndex: 120,
    maxHeight: 280,
    overflowY: 'auto',
  },
  searchResultBtn: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    padding: '10px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottom: '1px solid rgba(2,8,23,0.06)',
    textAlign: 'left',
  },
  searchResultLabel: { fontSize: 12, fontWeight: 800, color: 'rgba(9,25,37,0.82)' },
  searchResultType: {
    fontSize: 10,
    fontWeight: 900,
    color: 'rgba(9,25,37,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
  },
  searchEmpty: { padding: '10px 12px', fontSize: 12, fontWeight: 700, color: 'rgba(9,25,37,0.5)' },
};

export default GlobalSearchBar;
