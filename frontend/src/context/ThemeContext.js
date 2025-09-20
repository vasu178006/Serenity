import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    primary: "#06B6D4",
    secondary: "#22D3EE",
    accent: "#67E8F9",
    background: "#1A1E1E",
    surface: "#273333",
    text: "#E2E8F0"
  });

  useEffect(() => {
    // Load theme from user preferences
    const userPrefs = localStorage.getItem('serenity_user_preferences');
    if (userPrefs) {
      const prefs = JSON.parse(userPrefs);
      if (prefs.theme_colors) {
        setTheme(prefs.theme_colors);
      }
    }
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    // Update CSS custom properties
    const root = document.documentElement;
    Object.entries(newTheme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  useEffect(() => {
    updateTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};