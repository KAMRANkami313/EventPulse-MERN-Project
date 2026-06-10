import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

/**
 * ConfirmModal — Replaces window.confirm() and alert() across the app
 *
 * PROPS:
 * - isOpen: boolean — whether the modal is visible
 * - onClose: function — called when cancel is clicked or backdrop is clicked
 * - onConfirm: function — called when confirm is clicked
 * - title: string — modal heading (default: "Are you sure?")
 * - message: string — description text
 * - confirmText: string — button label (default: "Confirm")
 * - variant: "danger" | "warning" | "primary" — button style (default: "danger")
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  variant = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800 p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
              variant === "danger"
                ? "bg-red-100 dark:bg-red-900/30"
                : variant === "warning"
                ? "bg-amber-100 dark:bg-amber-900/30"
                : "bg-violet-100 dark:bg-violet-900/30"
            }`}>
              <AlertTriangle className={`w-7 h-7 ${
                variant === "danger"
                  ? "text-red-600 dark:text-red-400"
                  : variant === "warning"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-violet-600 dark:text-violet-400"
              }`} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {message}
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={variant}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;