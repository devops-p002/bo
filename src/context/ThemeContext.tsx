import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ThemeContext = createContext<any>(undefined);

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Available themes
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Provider component
export const ThemeProvider = ({ children }: any) => {
  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || THEMES.LIGHT;
  });

  // Update body class and localStorage when theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Update body classes
    const body = document.body;
    
    if (theme === THEMES.DARK) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
    
    // You could also update CSS variables here if you're using them
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    );
  };
  
  // Set a specific theme
  const setSpecificTheme = (newTheme: any) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    } else {
      console.error(`Invalid theme: ${newTheme}. Must be one of ${Object.values(THEMES).join(', ')}`);
    }
  };

  // Value object that will be available to consumers of this context
  const value = {
    theme,
    isDarkTheme: theme === THEMES.DARK,
    isLightTheme: theme === THEMES.LIGHT,
    toggleTheme,
    setTheme: setSpecificTheme,
    THEMES,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;