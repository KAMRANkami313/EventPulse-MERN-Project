import { motion } from "framer-motion";
import { cn } from "../../utils/cn"; // We will create this helper next

const Button = ({ children, onClick, variant = "primary", className, type = "button", disabled }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg";
  
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-indigo-500/30",
    secondary: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-red-500/30",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={cn(baseStyle, variants[variant], className, disabled && "opacity-50 cursor-not-allowed")}
    >
      {children}
    </motion.button>
  );
};

export default Button;