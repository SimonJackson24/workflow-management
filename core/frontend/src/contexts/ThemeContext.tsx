// core/frontend/src/contexts/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material';
import { deepmerge } from '@mui/utils';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const baseTheme = {
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    return savedMode || 'system';
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('themePrimaryColor') || '#1976d2';
  });

  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem('themeFontSize')) || 14;
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('themePrimaryColor', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('themeFontSize', fontSize.toString());
  }, [fontSize]);

  const getCurrentMode = (): 'light' | 'dark' => {
    if (mode === 'system') {
      return systemTheme;
    }
    return mode;
  };

  const theme = React.useMemo(() => {
    const currentMode = getCurrentMode();

    return createTheme(deepmerge(baseTheme, {
      palette: {
        mode: currentMode,
        primary: {
          main: primaryColor,
        },
        background: {
          default: currentMode === 'light' ? '#f5f5f5' : '#121212',
          paper: currentMode === 'light' ? '#ffffff' : '#1e1e1e',
        },
      },
      typography: {
        fontSize,
      },
    }));
  }, [mode, systemTheme, primaryColor, fontSize]);

  const toggleMode = () => {
    setMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        primaryColor,
        setPrimaryColor,
        fontSize,
        setFontSize,
      }}
    >
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
