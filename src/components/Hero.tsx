import { useRef } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import type { CarOption, PaintOption } from '../data/cars';
import { METRICS } from '../data/metrics';
import type { Theme } from '../hooks/useTheme';
import { useHeroAnimation } from '../hooks/useHeroAnimation';
import { Navbar } from './Navbar';
import { MetricCard } from './MetricCard';
import { CarVisual } from './CarVisual';
import { CarSelector } from './CarSelector';

interface HeroProps {
  car: CarOption;
  paint: PaintOption;
  theme: Theme;
  onToggleTheme: () => void;
  onCarChange: (car: CarOption) => void;
  onPaintChange: (paint: PaintOption) => void;
  onGarage: () => void;
  onReplay: () => void;
  onIdea: () => void;
  onShare: () => void;
}

const WELCOME = 'WELCOME';
const BRAND = 'ITZFIZZ';

export function Hero(props: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { beginDrive } = useHeroAnimation(heroRef);

  return (
    <section ref={heroRef} id="experience" className="hero-shell" aria-labelledby="hero-title">
      <Navbar theme={props.theme} onToggleTheme={props.onToggleTheme} onGarage={props.onGarage} onReplay={props.onReplay} onIdea={props.onIdea} />

      <div className="hero-scene">
        <div className="hero-introduction" data-intro="support">
          <p className="eyebrow"><span className="eyebrow-rule" aria-hidden="true" />A LITTLE MOTION. A BIG DIFFERENCE.</p>
          <p className="hero-support">Made to move.<br />{' '}Built to make an impact.</p>
        </div>

        <div className="metrics-cluster metrics-top" aria-label="Pick up point metrics">
          {METRICS.slice(0, 2).map((metric, offset) => (
            <MetricCard key={metric.id} metric={metric} index={offset} />
          ))}
        </div>

        <div className="road">
          <div className="band">
            <h1 id="hero-title" className="band-title" aria-label="Welcome ITZFIZZ">
              <span className="band-eyebrow" data-intro="support">WELCOME TO THE WORLD OF</span>
              <span className="band-line" aria-hidden="true">
                {WELCOME.split('').map((letter, index) => <span key={index} className="headline-letter">{letter}</span>)}
              </span>
              <span className="band-line band-line-brand" aria-hidden="true">
                {BRAND.split('').map((letter, index) => <span key={index} className="headline-letter">{letter}</span>)}
                <span className="band-asterisk">*</span>
              </span>
            </h1>
            <p className="band-caption" data-intro="support">Not just seen. <strong>Felt.</strong><ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" /></p>
            <div className="band-lines" aria-hidden="true"><span /><span /><span /></div>
            <div className="band-sheen" aria-hidden="true" />
          </div>
          <div className="band-cover" aria-hidden="true" />
          <div className="road-vignette" aria-hidden="true" />
          <div className="vehicle-travel">
            <div className="vehicle-trail" aria-hidden="true" />
            <div className="vehicle-appear">
              <div className="vehicle-light" aria-hidden="true" />
              <div className="vehicle-ground" aria-hidden="true" />
              <div className="vehicle-entrance">
                <div className="vehicle-shadow">
                  <CarVisual car={props.car} paint={props.paint} />
                </div>
              </div>
            </div>
          </div>
          <span className="road-mark road-mark-left" aria-hidden="true">+</span>
          <span className="road-mark road-mark-right" aria-hidden="true">+</span>
        </div>

        <div className="metrics-cluster metrics-bottom" aria-label="Customer phone call metrics">
          {METRICS.slice(2).map((metric, offset) => (
            <MetricCard key={metric.id} metric={metric} index={offset + 2} />
          ))}
        </div>

        <CarSelector car={props.car} paint={props.paint} onCarChange={props.onCarChange} onPaintChange={props.onPaintChange} onShare={props.onShare} />
      </div>

      <div className="hero-bottom flex items-center justify-between" data-intro="support">
        <button type="button" className="scroll-cue inline-flex items-center" onClick={beginDrive}>
          <span className="scroll-cue-icon"><ArrowDown size={17} strokeWidth={1.5} aria-hidden="true" /></span>
          <span className="scroll-label-motion">Scroll to drive<span>Watch the story unfold.</span></span>
          <span className="scroll-label-still">Explore the idea<span>Take it at your pace.</span></span>
        </button>
        <div className="journey-progress" aria-hidden="true">
          <span className="journey-phase">01 / IGNITION</span>
          <div className="journey-track"><span className="journey-fill" /></div>
          <span className="journey-end">04</span>
        </div>
        <p className="hero-footnote">GOOD DESIGN DOESN'T STAND STILL.<span>NEITHER DO WE.</span></p>
      </div>
    </section>
  );
}
