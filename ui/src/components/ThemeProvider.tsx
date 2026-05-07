import { createContext, useContext, useEffect, useState } from 'react';

// Types
type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: 'dark' | 'light';
  resolvedTheme: 'dark' | 'light';
  toggleTheme: () => void;
}

const initialState: ThemeContextValue = {
  theme: 'system',
  setTheme: () => null,
  systemTheme: 'light',
  resolvedTheme: 'light',
  toggleTheme: () => null,
};

// Context
const ThemeProviderContext = createContext<ThemeContextValue>(initialState);

// Provider
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  // Get initial theme from localStorage or default
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(storageKey);
    const initialTheme = (savedTheme as Theme) || defaultTheme;

    // Apply theme immediately on mount
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      const { body } = window.document;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      const resolvedTheme =
        initialTheme === 'system' ? systemTheme : initialTheme;

      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      body.classList.add(resolvedTheme);
      root.style.setProperty('color-scheme', resolvedTheme);
    }

    return initialTheme;
  });

  // Track system theme separately
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Watch for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate the resolved theme
  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const { body } = window.document;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Add new theme class
    root.classList.add(resolvedTheme);
    body.classList.add(resolvedTheme);

    // Set color-scheme property
    root.style.setProperty('color-scheme', resolvedTheme);
  }, [resolvedTheme]);

  // Theme toggling utility
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === 'dark') return 'light';
      if (prevTheme === 'light') return 'system';
      return 'dark';
    });
  };

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const value: ThemeContextValue = {
    theme,
    setTheme: (theme: Theme) => setTheme(theme),
    systemTheme,
    resolvedTheme,
    toggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Hook
export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// Utility hook for getting just the current theme value
export function useThemeValue() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
}

// Type guard
export function isValidTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light' || value === 'system';
}
