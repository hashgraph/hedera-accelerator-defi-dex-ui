import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DarkTheme, LightTheme, ThemeColors } from "./colors";

export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "hashio-dao-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    }
    // Default to dark
    return "dark";
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  // Set CSS variables when theme changes
  useEffect(() => {
    const theme = themeMode === "dark" ? DarkTheme : LightTheme;
    const root = document.documentElement;

    root.style.setProperty("--input-bg", theme.bgInput);
    root.style.setProperty("--text-color", theme.text);
    root.style.setProperty("--text-muted", theme.textMuted);
    root.style.setProperty("--border-color", theme.border);
    root.style.setProperty("--border-hover", theme.borderHover);
    root.style.setProperty("--bg-secondary", theme.bgSecondary);
    root.style.setProperty("--bg-card", theme.bgCard);
    root.style.setProperty("--bg-card-hover", theme.bgCardHover);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const theme = themeMode === "dark" ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, isDark: themeMode === "dark", theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
}

// Hook to get current theme colors
export function useTheme(): ThemeColors {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return dark theme as fallback if not in provider
    return DarkTheme;
  }
  return context.theme;
}
