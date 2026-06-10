import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const Button = ({ children, onClick, variant = "primary", className, type = "button", disabled }) => {
  const baseStyle = "px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg";

  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-violet-500/30",
    secondary: "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-red-500/30",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-500/30",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={cn(baseStyle, variants[variant] || variants.primary, className, disabled && "opacity-50 cursor-not-allowed pointer-events-none")}
    >
      {children}
    </motion.button>
  );
};

export default Button;