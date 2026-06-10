/**
 * Application Constants
 *
 * Centralized location for all hardcoded values that were previously
 * scattered across component files. This makes it easy to update
 * cities, categories, Stripe keys, etc. in ONE place.
 */

// --- STRIPE ---
export const STRIPE_PUBLIC_KEY =
  "pk_test_51SH0CJ7HwdZq8BC7oyKPQxaAQ47C8IBRy0hzIgeUo4jdCSL6q6fTnI4Ut3JkRjgfvd0ys0cfWaiyVPqFSX3gKFd00ZEBHxmlC";

// --- PRESET CITIES (used in CreateEventModal) ---
export const CITIES = [
  { name: "New York, USA", lat: 40.7128, lng: -74.006 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
  { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Mumbai, India", lat: 19.076, lng: 72.8777 },
  { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Berlin, Germany", lat: 52.52, lng: 13.405 },
  { name: "Toronto, Canada", lat: 43.651, lng: -79.347 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
];

// --- PIE CHART COLORS (used in AdminDashboard) ---
export const CHART_COLORS = [
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
];

// --- SUPPORTED LANGUAGES ---
export const LANGUAGES = [
  { code: "en", flag: "\ud83c\uddec\ud83c\udde7", label: "English" },
  { code: "es", flag: "\ud83c\uddea\ud83c\uddf8", label: "Spanish" },
  { code: "fr", flag: "\ud83c\uddeb\ud83c\uddf7", label: "French" },
  { code: "ur", flag: "\ud83c\uddf5\ud83c\uddf0", label: "Urdu" },
  { code: "tr", flag: "\ud83c\uddf9\ud83c\uddf7", label: "Turkish" },
  { code: "ar", flag: "\ud83c\uddf8\ud83c\udde6", label: "Arabic" },
];

// --- EVENT CATEGORIES (must match server validate.js isIn whitelist exactly) ---
export const EVENT_CATEGORIES = [
  "Music",
  "Tech",
  "Sports",
  "Art",
  "Food",
  "Business",
  "Education",
  "Health",
  "Social",
  "Travel",
  "Gaming",
  "Party",
  "Other",
];

// --- FILTER CATEGORIES (used in Dashboard dropdown — includes "All" for filtering) ---
export const CATEGORIES = [
  "All",
  ...EVENT_CATEGORIES,
];

// --- CATEGORY ICON MAP ---
export const getCategoryIcon = (category) => {
  const lowerCat = category.toLowerCase();
  if (lowerCat.includes("music")) return "\ud83c\udfb5";
  if (lowerCat.includes("tech")) return "\ud83d\udcbb";
  if (lowerCat.includes("sport")) return "\u26bd";
  if (lowerCat.includes("education")) return "\ud83d\udcda";
  if (lowerCat.includes("party")) return "\ud83c\udf89";
  if (lowerCat.includes("art")) return "\ud83c\udfa8";
  if (lowerCat.includes("food")) return "\ud83c\udf54";
  return "\ud83c\udff7\ufe0f";
};
