import { useEffect, useState } from 'react';

export type Theme = 'light' | 'night';

function initialTheme(): Theme {
  const query = new URLSearchParams(window.location.search).get('theme');
  if (query === 'light' || query === 'night') return query;
  try {
    const saved = localStorage.getItem('itzfizz-theme');
    if (saved === 'light' || saved === 'night') return saved;
  } catch {
    // Storage can be unavailable in private or embedded browser contexts.
  }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#171a17' : '#f5f5ef');
    const url = new URL(window.location.href);
    if (url.searchParams.has('theme')) {
      url.searchParams.set('theme', theme);
      window.history.replaceState(window.history.state, '', url);
    }
    try {
      localStorage.setItem('itzfizz-theme', theme);
    } catch {
      // The theme still works without persistent storage.
    }
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((current) => current === 'light' ? 'night' : 'light') };
}