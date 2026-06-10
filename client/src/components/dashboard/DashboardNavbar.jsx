import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, LogOut, Sun, Moon, Plus, List, User, Settings, Menu,
} from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { getImageUrl } from "../../utils/imageHelper";

/**
 * DashboardNavbar — Glassmorphism navbar with desktop + mobile layouts
 *
 * PROPS:
 * - i18n: i18next instance (for language switching)
 * - t: translation function
 * - unreadCount: number of unread notifications
 * - onMarkRead: click handler for notification bell
 * - onLogout: click handler for logout
 * - mobileMenuOpen: boolean
 * - setMobileMenuOpen: setter
 */
const DashboardNavbar = ({
  i18n,
  t,
  unreadCount,
  onMarkRead,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const LANG_FLAGS = {
    en: "\ud83c\uddec\ud83c\udde7",
    es: "\ud83c\uddea\ud83c\uddf8",
    fr: "\ud83c\uddeb\ud83c\uddf7",
    ur: "\ud83c\uddf5\ud83c\uddf0",
    tr: "\ud83c\uddf9\ud83c\uddf7",
    ar: "\ud83c\uddf8\ud83c\udde6",
  };

  return (
    <>
      {/* GLASSMORPHISM NAVBAR */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-4 left-4 right-4 z-[1000] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-xl p-3 px-6 flex justify-between items-center"
      >
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">
            E
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 hidden md:block tracking-tighter">
            EventPulse
          </h1>
        </div>

        {/* DESKTOP NAV ITEMS */}
        <div className="hidden md:flex items-center gap-4">
          {/* LANGUAGE SWITCHER */}
          <div className="hidden md:flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl items-center border border-slate-200 dark:border-slate-700">
            {["en", "es", "fr", "ur", "tr", "ar"].map((lang) => (
              <button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-lg transition-all ${
                  i18n.language === lang
                    ? "bg-white dark:bg-slate-700 shadow-sm scale-110 opacity-100"
                    : "opacity-50 hover:opacity-100"
                }`}
                title={lang.toUpperCase()}
              >
                {LANG_FLAGS[lang]}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <Link
            to="/settings"
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <Link
            to="/scan"
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <List className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>

          {/* NOTIFICATION BELL */}
          <div
            className="relative cursor-pointer p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            onClick={onMarkRead}
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-[10px] text-white rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

          {/* USER PROFILE */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <Link to={`/profile/${user._id}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-violet-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-violet-500 transition-all">
                {user.picturePath ? (
                  <img
                    src={getImageUrl(user.picturePath)}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <User className="w-5 h-5 text-violet-600" />
                )}
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-bold dark:text-white">
                  {user?.firstName}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
                  {user.role === "admin" ? "Admin" : "Member"}
                </span>
              </div>
            </Link>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="bg-red-100 text-red-600 text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ml-1 transition hover:bg-red-200"
              >
                Panel
              </Link>
            )}
            <Button variant="ghost" onClick={onLogout} className="p-2">
              <LogOut className="w-5 h-5 text-slate-500 hover:text-red-500 transition" />
            </Button>
          </div>
        </div>

        {/* MOBILE HAMBURGER */}
        <div className="flex md:hidden items-center gap-3">
          <div className="relative cursor-pointer p-2" onClick={onMarkRead}>
            <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 h-3 w-3 rounded-full animate-pulse"></span>
            )}
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-white"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU DROPDOWN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-24 left-4 right-4 z-[999] bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex flex-col gap-4 overflow-hidden md:hidden"
          >
            {/* User Profile Mobile */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
              <img
                src={getImageUrl(user.picturePath)}
                className="w-12 h-12 rounded-full object-cover"
                alt=""
              />
              <div>
                <p className="font-bold dark:text-white text-lg">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-xs font-bold text-red-500 mt-1 block"
                  >
                    ACCESS ADMIN PANEL
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Actions Grid */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={toggleTheme}
                className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
                <span className="text-[10px] dark:text-white">Theme</span>
              </button>
              <Link
                to="/settings"
                className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1"
              >
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-[10px] dark:text-white">Setting</span>
              </Link>
              <Link
                to="/scan"
                className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1"
              >
                <List className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-[10px] dark:text-white">Orders</span>
              </Link>
              <Link
                to={`/profile/${user._id}`}
                className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-1"
              >
                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <span className="text-[10px] dark:text-white">Profile</span>
              </Link>
            </div>

            {/* Mobile Language Selector */}
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">
                Language
              </label>
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                value={i18n.language}
                className="w-full bg-transparent dark:text-white font-bold outline-none"
              >
                <option value="en">{`\ud83c\uddec\ud83c\udde7`} English</option>
                <option value="es">{`\ud83c\uddea\ud83c\uddf8`} Spanish</option>
                <option value="fr">{`\ud83c\uddeb\ud83c\uddf7`} French</option>
                <option value="ur">{`\ud83c\uddf5\ud83c\uddf0`} Urdu</option>
                <option value="tr">{`\ud83c\uddf9\ud83c\uddf7`} Turkish</option>
                <option value="ar">{`\ud83c\uddf8\ud83c\udde6`} Arabic</option>
              </select>
            </div>

            <Button
              variant="danger"
              onClick={onLogout}
              className="w-full justify-center py-3"
            >
              Logout
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardNavbar;