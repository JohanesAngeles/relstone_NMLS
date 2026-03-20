import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RESOURCE_ARTICLES,
  RESOURCE_CATEGORIES,
} from '../../data/resourcesData';
import './Resources.css';

const DATE_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: '30', label: 'Last 30 Days' },
  { value: '365', label: 'Last 12 Months' },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const ResourcesHub = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  const featured = useMemo(
    () => RESOURCE_ARTICLES.find((article) => article.featured) || RESOURCE_ARTICLES[0],
    []
  );

  const filtered = useMemo(() => {
    const now = Date.now();

    return RESOURCE_ARTICLES.filter((article) => {
      const text = `${article.title} ${article.excerpt} ${article.author.name}`.toLowerCase();
      const searchMatch = text.includes(search.trim().toLowerCase());

      const categoryMatch = category === 'All' || article.category === category;

      let dateMatch = true;
      if (dateFilter !== 'all') {
        const days = Number(dateFilter);
        const age = now - new Date(article.publishedAt).getTime();
        dateMatch = age <= days * 24 * 60 * 60 * 1000;
      }

      return searchMatch && categoryMatch && dateMatch;
    }).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }, [search, category, dateFilter]);

  const categoryCounts = useMemo(
    () =>
      RESOURCE_CATEGORIES.reduce(
        (acc, item) => ({
          ...acc,
          [item]: RESOURCE_ARTICLES.filter((article) => article.category === item).length,
        }),
        { All: RESOURCE_ARTICLES.length }
      ),
    []
  );

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();

    if (!email || !email.includes('@')) {
      setNewsletterStatus('Enter a valid email to subscribe.');
      return;
    }

    setNewsletterStatus('Thanks. You are subscribed to weekly insights.');
    setEmail('');
  };

  return (
    <div className="resources-page">
      <div className="resources-container">
        <Link to="/" className="resources-back">
          Back to Main Site
        </Link>

        <h1 className="resources-title">Blog and Resources</h1>
        <p className="resources-subtitle">
          Explore practical guidance for NMLS preparation, state-by-state licensing workflows,
          and career strategy for mortgage professionals.
        </p>

        <section className="category-pills" aria-label="Quick categories">
          <button
            type="button"
            className={`pill-btn ${category === 'All' ? 'pill-btn--active' : ''}`}
            onClick={() => setCategory('All')}
          >
            All ({categoryCounts.All})
          </button>
          {RESOURCE_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={`pill-btn ${category === item ? 'pill-btn--active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item} ({categoryCounts[item] || 0})
            </button>
          ))}
        </section>

        {featured && (
          <section className="featured-hero">
            <img src={featured.coverImage} alt={featured.title} className="featured-image" />
            <div className="featured-content">
              <span className="featured-label">Featured Article</span>
              <h2>{featured.title}</h2>
              <div className="featured-meta">
                <span>{featured.category}</span>
                <span>{formatDate(featured.publishedAt)}</span>
                <span>{featured.readMinutes} min read</span>
              </div>
              <p className="featured-excerpt">{featured.excerpt}</p>
              <Link to={`/resources/${featured.slug}`} className="featured-link">
                Read Featured Story
              </Link>
            </div>
          </section>
        )}

        <section className="filters-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search articles, author names, or topics"
            aria-label="Search resources"
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>
            {RESOURCE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Filter by date"
          >
            {DATE_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="clear-filter-btn"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setDateFilter('all');
            }}
          >
            Clear Filters
          </button>
        </section>

        <p className="results-row">Showing {filtered.length} article(s)</p>

        {filtered.length ? (
          <section className="resources-grid">
            {filtered.map((article) => (
              <article key={article.slug} className="article-card">
                <img src={article.coverImage} alt={article.title} loading="lazy" />
                <div className="article-body">
                  <span className="article-category">{article.category}</span>
                  <h3 className="article-title">
                    <Link to={`/resources/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="article-excerpt">{article.excerpt}</p>
                  <div className="article-meta-row">
                    <div className="article-meta">
                      {article.author.name} - {formatDate(article.publishedAt)}
                    </div>
                    <span className="article-read">{article.readMinutes} min</span>
                  </div>
                  <Link to={`/resources/${article.slug}`} className="article-read-link">
                    Read article
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="empty-results">
            <h3>No matching articles</h3>
            <p>Try a broader search or reset your filters to explore all resources.</p>
          </div>
        )}

        <section className="newsletter">
          <h3>Get Weekly NMLS Study and Career Briefings</h3>
          <p>
            Join the newsletter for exam prep checklists, state update alerts, and market snapshots.
          </p>

          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              aria-label="Email address"
            />
            <button type="submit">Subscribe</button>
          </form>

          {newsletterStatus ? <div className="newsletter-status">{newsletterStatus}</div> : null}
        </section>
      </div>
    </div>
  );
};

export default ResourcesHub;
