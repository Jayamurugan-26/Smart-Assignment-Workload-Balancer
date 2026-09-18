import React, { createContext, useContext, useState, useLayoutEffect } from "react";

export const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

export { useTheme } from "./useTheme.js";

export function ThemeProvider({ children }) {
  // Read saved preference from 'app-theme' (fallback to 'app_theme'), defaulting strictly to 'light'
  // Strictly manual: NEVER use window.matchMedia('(prefers-color-scheme: dark)')
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("app-theme") || localStorage.getItem("app_theme");
      if (saved === "dark" || saved === "light") {
        return saved;
      }
    } catch (e) {
      console.warn("Could not read theme from localStorage:", e);
    }
    return "light"; // Default Light as mandated
  });

  // Apply theme to DOM synchronously before paint
  const applyThemeToDOM = (t) => {
    try {
      const root = document.documentElement;
      const isDarkMode = t === "dark";

      // 1. Set data-theme attribute on <html> element
      root.setAttribute("data-theme", t);

      // 2. Synchronize Tailwind dark class on <html> element
      if (isDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      // 3. Synchronize <body> element attributes and direct styles
      if (document.body) {
        document.body.setAttribute("data-theme", t);
        if (isDarkMode) {
          document.body.classList.add("dark");
          document.body.style.backgroundColor = "#0b1120";
          document.body.style.color = "#f8fafc";
        } else {
          document.body.classList.remove("dark");
          document.body.style.backgroundColor = "#f5f7fb";
          document.body.style.color = "#1f2937";
        }
      }

      // 4. Synchronize #root container
      const rootDiv = document.getElementById("root");
      if (rootDiv) {
        rootDiv.setAttribute("data-theme", t);
        if (isDarkMode) {
          rootDiv.classList.add("dark");
        } else {
          rootDiv.classList.remove("dark");
        }
      }

      // 5. Persist to localStorage
      localStorage.setItem("app-theme", t);
      localStorage.setItem("app_theme", t);

      // 6. Dispatch custom theme event
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: t } }));
    } catch (e) {
      console.error("Failed to apply theme to DOM:", e);
    }
  };

  useLayoutEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    const val = newTheme === "dark" ? "dark" : "light";
    setThemeState(val);
    applyThemeToDOM(val);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
