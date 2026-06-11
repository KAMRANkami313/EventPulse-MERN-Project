/**
 * JSON-LD Structured Data Schemas for EventPulse.
 */

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://eventpulse-tawny.vercel.app';
const SITE_NAME = 'EventPulse';
const SITE_LOGO = `${SITE_URL}/pwa-512x512.png`;

/** Organization schema — used on every page (global brand identity) */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: SITE_LOGO,
  description:
    'EventPulse is your go-to platform to discover amazing events, connect with communities, and create unforgettable experiences.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: `${SITE_URL}/settings`,
  },
};

/** WebSite schema — enables sitelinks search box in Google results */
export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/dashboard?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/**
 * Event schema — for individual event pages.
 * Shows rich event cards in Google search results.
 */
export const eventSchema = (event) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.title,
  description: event.description,
  image: event.imagePath,
  startDate: event.eventDate
    ? new Date(`${event.eventDate}T${event.eventTime || '00:00'}`).toISOString()
    : undefined,
  endDate: event.eventDate
    ? new Date(`${event.eventDate}T23:59:59`).toISOString()
    : undefined,
  location: {
    '@type': 'Place',
    name: event.location || 'Online',
    ...(event.locationCoordinates?.lat && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: event.locationCoordinates.lat,
        longitude: event.locationCoordinates.lng,
      },
    }),
    address: event.location || 'Online',
  },
  organizer: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
  offers: {
    '@type': 'Offer',
    price: event.price || 0,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}/dashboard`,
  },
  eventAttendanceMode: event.location
    ? 'https://schema.org/OfflineEventAttendanceMode'
    : 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
});

/**
 * BreadcrumbList schema — helps Google show breadcrumb trails in results.
 */
export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});