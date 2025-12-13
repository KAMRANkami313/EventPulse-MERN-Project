import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-center p-6 transition-colors relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10"
      >
        <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
        </div>

        <h1 className="text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 tracking-tighter drop-shadow-sm">
          404
        </h1>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mt-4">
          Page Not Found
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mt-4 mb-8 max-w-md mx-auto text-lg leading-relaxed">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-violet-500/30 transition transform hover:-translate-y-1 active:scale-95"
        >
          <Home className="w-5 h-5" /> Go Back Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;