import { motion, AnimatePresence } from "framer-motion";

/**
 * NotificationDropdown — Floating notification panel
 *
 * PROPS:
 * - show: boolean — whether the dropdown is visible
 * - notifications: array — notification objects
 * - t: translation function
 */
const NotificationDropdown = ({ show, notifications, t }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed top-20 right-4 w-80 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 z-[1002]"
        >
          <div className="p-3 font-bold border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200">
            {t("notifications")}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-400 text-center">
                {t("no_notifications_yet")}
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm transition ${
                    !n.isRead
                      ? "bg-violet-50 dark:bg-slate-700/50 border-l-4 border-violet-500"
                      : ""
                  }`}
                >
                  <span className="font-bold text-violet-600 dark:text-violet-400">
                    {n.fromUserName}
                  </span>{" "}
                  <span className="dark:text-slate-300">{n.message}</span>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(n.createdAt).toDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;