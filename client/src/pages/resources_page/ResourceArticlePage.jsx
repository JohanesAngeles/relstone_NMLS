import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getArticleBySlug,
  getRelatedArticles,
  RESOURCE_ARTICLES,
} from '../../data/resourcesData';
import './Resources.css';

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const ResourceArticlePage = () => {
  const { slug } = useParams();
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  const article = useMemo(() => getArticleBySlug(slug), [slug]);
  const related = useMemo(() => getRelatedArticles(article), [article]);

  const shareUrl = `${window.location.origin}/resources/${slug}`;

  const shareArticle = (channel) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(article?.title || 'Relstone Resources');

    const links = {
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    if (channel === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      setShareStatus('Link copied to clipboard.');
      return;
    }

    setShareStatus('Opened share window.');

    window.open(links[channel], '_blank', 'noopener,noreferrer,width=700,height=650');
  };

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();

    if (!email || !email.includes('@')) {
      setNewsletterStatus('Enter a valid email to subscribe.');
      return;
    }

    setNewsletterStatus('Thanks. You are subscribed to weekly insights.');
    setEmail('');
  };

  if (!article) {
    return (
      <div className="article-page not-found">
        <div>
          <h1>Article not found</h1>
          <p>Try browsing the full library instead.</p>
          <Link to="/resources" className="resources-back">
            Return to Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="article-shell">
        <div className="article-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/resources">Resources</Link>
          <span>/</span>
          <span>{article.category}</span>
        </div>

        <Link to="/resources" className="resources-back">
          Back to Resources
        </Link>

        <article className="article-hero">
          <img src={article.coverImage} alt={article.title} />
          <div className="article-hero-body">
            <span className="article-category">{article.category}</span>
            <h1>{article.title}</h1>
            <div className="article-author">
              <span>{article.author.name}</span>
              <span>{article.author.role}</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span>{article.readMinutes} min read</span>
            </div>
          </div>
        </article>

        <section className="article-content">
          {article.content.map((section) => (
            <div key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ))}
        </section>

        <section className="article-share">
          <button type="button" onClick={() => shareArticle('copy')}>
            Copy Link
          </button>
          <button type="button" onClick={() => shareArticle('linkedin')}>
            Share on LinkedIn
          </button>
          <button type="button" onClick={() => shareArticle('x')}>
            Share on X
          </button>
          <button type="button" onClick={() => shareArticle('facebook')}>
            Share on Facebook
          </button>
        </section>
        {shareStatus ? <div className="share-status">{shareStatus}</div> : null}

        <section className="related-wrap">
          <h3>Related Articles</h3>
          <div className="related-list">
            {(related.length ? related : RESOURCE_ARTICLES.slice(0, 3)).map((item) => (
              <article key={item.slug} className="related-card">
                <div className="article-meta">{item.category} - {formatDate(item.publishedAt)}</div>
                <Link to={`/resources/${item.slug}`}>{item.title}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="newsletter">
          <h3>Subscribe for New Articles</h3>
          <p>
            Stay updated with new state guides, study strategies, and mortgage industry analysis.
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

export default ResourceArticlePage;
