import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Ticket,
  Sparkles,
  ArrowRight,
  LogIn,
  MapPin,
  Bell,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Landing Page — public marketing page at "/"
 *
 * SEO purpose:
 *   - Provides Google with real, crawlable HTML content for the root URL
 *   - Targets branded queries ("EventPulse", "event platform", "discover events")
 *   - Replaces the old `<Navigate to="/login" />` which gave Google zero content
 *
 * Behavior:
 *   - If user is already authenticated, silently redirect to /dashboard
 *   - Otherwise render the marketing page with CTAs to /register and /login
 */
const features = [
  {
    icon: Calendar,
    title: "Discover Events Near You",
    description:
      "Browse thousands of events tailored to your interests — music festivals, tech meetups, sports tournaments, art exhibitions, food fairs, and more. Filter by category, date, and location to find exactly what excites you.",
  },
  {
    icon: Users,
    title: "Build Real Communities",
    description:
      "Connect with like-minded people, follow your favorite organizers, leave reviews, and join conversations around the events you love. EventPulse is built for genuine community engagement, not just ticket sales.",
  },
  {
    icon: Ticket,
    title: "Smart Digital Ticketing",
    description:
      "Purchase tickets securely with Stripe, get instant QR-coded digital tickets, and check in at events with a single scan. No paper, no hassle — everything lives in your personal dashboard.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Recommendations",
    description:
      "Our built-in AI assistant learns your preferences and suggests events you'll actually care about. Spend less time searching and more time experiencing the moments that matter.",
  },
  {
    icon: MapPin,
    title: "Interactive Event Maps",
    description:
      "See events plotted on a live map around you. Plan your weekend visually — find what's happening nearby, explore new neighborhoods, and never miss a local gem again.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Get instant alerts for event updates, ticket reminders, new comments, and community activity. Stay in the loop without drowning in noise — you control what you hear about.",
  },
];

const stats = [
  { value: "10K+", label: "Active Members" },
  { value: "500+", label: "Events Hosted" },
  { value: "50+", label: "Cities Covered" },
  { value: "4.9★", label: "Average Rating" },
];

const categories = [
  "Music", "Tech", "Sports", "Art", "Food", "Business",
  "Health", "Education", "Gaming", "Charity", "Networking", "Travel",
];

const Landing = () => {
  const { isAuthenticated } = useAuth();

  // Authenticated users don't need to see marketing — send them to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-fuchsia-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 transition-colors">
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-24 px-6">
        {/* Background Decor */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Event Discovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight"
          >
            Discover, Create &{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Join Events
            </span>{" "}
            Near You
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            EventPulse connects you with the events and communities you love —
            from music festivals and tech meetups to sports tournaments and art
            exhibitions. Find your next unforgettable experience today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-violet-500/30 transition transform hover:-translate-y-1"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700"
            >
              <LogIn className="w-5 h-5" /> Sign In
            </a>
          </motion.div>

          {/* Trust signal */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-6 flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Free to join • No credit card required • Cancel anytime
          </motion.p>
        </div>
      </section>

      {/* ─────────────────────────── STATS ─────────────────────────── */}
      <section className="py-12 px-6 border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── FEATURES ─────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need for unforgettable events
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              From discovery to ticketing to community building — EventPulse
              brings every part of the event experience into one beautiful,
              integrated platform designed for both attendees and organizers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:shadow-violet-500/10 transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CATEGORIES ─────────────────────────── */}
      <section className="py-16 px-6 bg-white/40 dark:bg-slate-900/40">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Explore events across every category
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-10">
            Whatever you're into, there's something happening on EventPulse.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat, i) => (
              <motion.span
                key={cat}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full text-sm font-medium shadow-sm border border-slate-200 dark:border-slate-700"
              >
                {cat}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CTA ─────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl p-10 md:p-14 text-center shadow-2xl shadow-violet-500/30"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to find your next event?
            </h2>
            <p className="text-violet-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Join EventPulse for free today and start exploring events,
              connecting with communities, and creating memories that last a
              lifetime.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-violet-700 px-8 py-4 rounded-2xl font-bold shadow-xl transition transform hover:-translate-y-1"
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────── FOOTER ─────────────────────────── */}
      <footer className="py-8 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} EventPulse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;