import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      className="theme-toggle inline-flex items-center justify-center"
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'light' ? 'night' : 'light'} mode`}
      aria-pressed={theme === 'night'}
      title={`${theme === 'light' ? 'Night' : 'Light'} mode`}
    >
      <Sun size={17} strokeWidth={1.7} className="theme-sun" aria-hidden="true" />
      <Moon size={17} strokeWidth={1.7} className="theme-moon" aria-hidden="true" />
    </button>
  );
}