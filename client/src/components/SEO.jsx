import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://eventpulse-tawny.vercel.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * SEO Component — Manages <head> meta tags per page.
 *
 * Props:
 *   title       — Page title (suffix " | EventPulse" is auto-appended)
 *   description — Meta description (max 160 chars for Google)
 *   keywords    — Comma-separated keywords
 *   ogImage     — Override OG image URL (defaults to /og-image.png)
 *   ogType      — OG type (default: "website")
 *   canonical   — Override canonical URL (default: current page URL)
 *   noindex     — Set true to prevent search engine indexing
 *   jsonLd      — JSON-LD structured data object
 */
const SEO = ({
  title,
  description = 'EventPulse is your go-to platform to discover amazing events, connect with communities, and create unforgettable experiences.',
  keywords = 'events, event management, discover events, join events, EventPulse',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  canonical,
  noindex = false,
  jsonLd,
}) => {
  const location = useLocation();
  const fullTitle = title ? `${title} | EventPulse` : 'EventPulse — Discover, Create & Join Events Near You';
  const canonicalUrl = canonical || `${SITE_URL}${location.pathname}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="EventPulse" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;