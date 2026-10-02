import { ArrowUpRight, MoveUpRight, RotateCcw } from 'lucide-react';
import { BrandMark } from './Navbar';

interface ConclusionProps {
  onGarage: () => void;
  onShare: () => void;
  onReplay: () => void;
}

export function Conclusion({ onGarage, onShare, onReplay }: ConclusionProps) {
  return (
    <section id="the-idea" className="conclusion" aria-labelledby="conclusion-title" tabIndex={-1}>
      <div className="conclusion-overline flex items-center justify-between">
        <p className="eyebrow">02 / KEEP THE MOMENTUM</p>
        <MoveUpRight className="conclusion-arrow" size={38} strokeWidth={1} aria-hidden="true" />
      </div>
      <div className="conclusion-main">
        <h2 id="conclusion-title">Good things<br />come to those<br />who <span>move.</span></h2>
        <div className="conclusion-action">
          <p>Different perspectives. New possibilities.<br />Your next great idea is only a little<br className="desktop-break" /> momentum away.</p>
          <button type="button" className="primary-button inline-flex items-center justify-between" onClick={onGarage}>Find your drive <ArrowUpRight size={19} strokeWidth={1.7} aria-hidden="true" /></button>
          <button type="button" className="text-button inline-flex items-center" onClick={onShare}>Share your configuration <ArrowUpRight size={14} aria-hidden="true" /></button>
        </div>
      </div>
      <footer className="site-footer">
        <div className="footer-brand"><BrandMark /><span>INDEPENDENT THINKING. FORWARD MOTION.</span></div>
        <p className="project-note">An exploration of design in motion.<br />Concept vehicles. Illustrative reference metrics.</p>
        <button type="button" className="replay-button inline-flex items-center" onClick={onReplay}><RotateCcw size={14} aria-hidden="true" />One more drive</button>
        <span className="footer-year">&copy; {new Date().getFullYear()} ITZFIZZ</span>
      </footer>
    </section>
  );
}