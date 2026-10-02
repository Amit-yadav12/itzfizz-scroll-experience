import { ArrowUpRight } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
  onGarage: () => void;
  onReplay: () => void;
  onIdea: () => void;
}

export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`}>
      itzfizz<span className="brand-spark" aria-hidden="true">*</span>
    </span>
  );
}

export function Navbar({ theme, onToggleTheme, onGarage, onReplay, onIdea }: NavbarProps) {
  return (
    <header className="site-header flex items-center justify-between" data-intro="nav">
      <a href="#experience" className="brand-link" aria-label="ITZFIZZ, back to the experience" onClick={(event) => { event.preventDefault(); onReplay(); }}>
        <BrandMark />
      </a>
      <nav className="main-navigation flex items-center" aria-label="Main navigation">
        <a className="nav-link nav-link-active" href="#experience" onClick={(event) => { event.preventDefault(); onReplay(); }}><span aria-hidden="true" />The experience</a>
        <a className="nav-link" href="#garage" onClick={(event) => { event.preventDefault(); onGarage(); }}>The garage</a>
        <a className="nav-link" href="#the-idea" onClick={(event) => { event.preventDefault(); onIdea(); }}>The idea</a>
      </nav>
      <div className="nav-actions flex items-center">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button className="nav-cta inline-flex items-center justify-between" onClick={onGarage} type="button">
          Make it yours <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}