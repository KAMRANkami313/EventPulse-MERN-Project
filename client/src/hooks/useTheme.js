import { useState, useEffect } from "react";

/**
 * useTheme — Custom hook for dark mode management
 *
 * PROBLEMS SOLVED:
 * - Dark mode state was in App.jsx and passed via props through routes
 * - Every protected route component received `toggleTheme` and `theme` as props
 * - Now any component can use `useTheme()` without prop drilling
 *
 * USAGE:
 *   import { useTheme } from "../hooks/useTheme";
 *   const { theme, toggleTheme } = useTheme();
 */

const STORAGE_KEY = "theme";

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
};