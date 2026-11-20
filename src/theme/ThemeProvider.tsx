import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import {
  accessibility,
  ColorPalette,
  darkColors,
  lightColors,
  rounded,
  shadows,
  spacing,
  typography,
} from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  typography: typeof typography;
  rounded: typeof rounded;
  spacing: typeof spacing;
  shadows: typeof shadows;
  accessibility: typeof accessibility;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark =
    mode === 'dark' || (mode === 'system' && deviceColorScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value: ThemeContextValue = {
    mode,
    isDark,
    colors,
    typography,
    rounded,
    spacing,
    shadows,
    accessibility,
    setMode,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
