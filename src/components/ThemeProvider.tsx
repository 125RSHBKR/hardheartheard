'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'bw' | 'color';

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: 'bw', toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('bw');

  useEffect(() => {
    const stored = localStorage.getItem('hhh-theme') as Theme | null;
    const t = stored === 'color' ? 'color' : 'bw';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'bw' ? 'color' : 'bw';
    setTheme(next);
    localStorage.setItem('hhh-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
