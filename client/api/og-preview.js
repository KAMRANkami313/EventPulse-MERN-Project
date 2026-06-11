/**
 * Vercel Edge Function — Social Crawler OG Preview
 *
 * Social crawlers (Facebook, Twitter, LinkedIn, Slack) do NOT execute
 * JavaScript. They only read raw HTML. This Edge Function detects those
 * crawlers and returns HTML with correct OG meta tags.
 *
 * How to use:
 *   - Share URL: https://eventpulse-tawny.vercel.app/api/og-preview?eventId=xxx
 *   - The function fetches event data from the Render backend API
 *   - Returns HTML with OG tags that social crawlers can read
 *
 * For regular pages (login, register), the static OG tags in index.html
 * are sufficient — this function is only needed for dynamic event sharing.
 */

const API_URL = 'https://eventpulse-server-mw68.onrender.com';
const SITE_URL = 'https://eventpulse-tawny.vercel.app';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const config = {
  runtime: 'edge',
};

// Known social media crawler user agents
const CRAWLER_PATTERNS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'WhatsApp',
  'TelegramBot',
  'skypeuripreview',
];

const isCrawler = (userAgent) => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_PATTERNS.some((p) => ua.includes(p.toLowerCase()));
};

export default async function handler(request) {
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId');
  const userAgent = request.headers.get('user-agent') || '';

  // If not a crawler, redirect to the actual page
  if (!isCrawler(userAgent)) {
    const redirectUrl = eventId
      ? `${SITE_URL}/dashboard?eventId=${eventId}`
      : `${SITE_URL}/login`;
    return Response.redirect(redirectUrl, 302);
  }

  let title = 'EventPulse — Discover, Create & Join Events Near You';
  let description = 'EventPulse is your go-to platform to discover amazing events, connect with communities, and create unforgettable experiences.';
  let image = DEFAULT_OG_IMAGE;
  let pageUrl = SITE_URL;

  // Fetch event-specific data if eventId is provided
  if (eventId) {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      if (res.ok) {
        const data = await res.json();
        const event = data.event || data;
        title = `${event.title} | EventPulse`;
        description = event.description
          ? event.description.substring(0, 200)
          : `Join "${event.title}" on EventPulse — discover amazing events near you.`;
        image = event.imagePath || DEFAULT_OG_IMAGE;
        pageUrl = `${SITE_URL}/dashboard?eventId=${eventId}`;
      }
    } catch (err) {
      // API failed — use default tags (event might not exist or server down)
      console.error('OG preview: Failed to fetch event:', err);
    }
  }

  // Return HTML with OG meta tags for the crawler
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="${eventId ? 'article' : 'website'}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="EventPulse" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${pageUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <link rel="canonical" href="${pageUrl}" />
</head>
<body>
  <p>${description}</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}