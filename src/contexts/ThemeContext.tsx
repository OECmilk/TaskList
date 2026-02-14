'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId = 'standard';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  colors: [string, string, string, string]; // [lightest, light, medium, dark]
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'standard',
    name: 'Standard',
    colors: ['255,255,255', '243,244,246', '59,130,246', '31,41,55'],
  },
];

type ThemeContextType = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  palette: ThemePalette;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDOM(palette: ThemePalette) {
  const root = document.documentElement;
  root.setAttribute('data-theme', palette.id);
  root.style.setProperty('--theme-1', palette.colors[0]);
  root.style.setProperty('--theme-2', palette.colors[1]);
  root.style.setProperty('--theme-3', palette.colors[2]);
  root.style.setProperty('--theme-4', palette.colors[3]);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('standard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as ThemeId | null;
    if (stored && THEME_PALETTES.find(p => p.id === stored)) {
      setThemeIdState(stored);
      applyThemeToDOM(THEME_PALETTES.find(p => p.id === stored)!);
    } else {
      applyThemeToDOM(THEME_PALETTES[0]);
    }
    setMounted(true);
  }, []);

  const setThemeId = (id: ThemeId) => {
    const palette = THEME_PALETTES.find(p => p.id === id);
    if (!palette) return;
    setThemeIdState(id);
    localStorage.setItem('theme', id);
    applyThemeToDOM(palette);
  };

  const palette = THEME_PALETTES.find(p => p.id === themeId) || THEME_PALETTES[0];

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, palette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
