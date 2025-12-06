import { motion } from "framer-motion";

const Card = ({ children, className, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-3xl shadow-xl p-6 relative overflow-hidden ${className}`}
    >
      {/* Glossy Reflection Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30"></div>
      {children}
    </motion.div>
  );
};

export default Card;