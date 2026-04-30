/**
 * @file useTheme — Dark/light theme management hook.
 *
 * Reads the user's preference from localStorage (or falls back to system
 * `prefers-color-scheme`). Toggles a `dark` class on the root `<html>`
 * element for Tailwind dark mode support.
 *
 * @module hooks/useTheme
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'votewise-theme';

/**
 * @returns {{ theme: 'light'|'dark', toggleTheme: () => void, isDark: boolean }}
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;

    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme, isDark: theme === 'dark' };
};
