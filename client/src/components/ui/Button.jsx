import { motion } from "framer-motion";
import { cn } from "../../utils/cn"; 

const Button = ({ children, onClick, variant = "primary", className, type = "button", disabled }) => {
  // 🟢 UPDATE 1: Responsive Padding & Text Size (Smaller on Mobile, Normal on Desktop)
  const baseStyle = "px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg";
  
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-indigo-500/30",
    // 🟢 UPDATE 2: Changed gray -> slate for consistency
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
    // 🟢 UPDATE 3: Added 'success' variant (Used in Dashboard for Chat button)
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-red-500/30",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      // If variant doesn't exist, fallback to primary to prevent crash
      className={cn(baseStyle, variants[variant] || variants.primary, className, disabled && "opacity-50 cursor-not-allowed")}
    >
      {children}
    </motion.button>
  );
};

export default Button;