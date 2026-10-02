import type { CSSProperties } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { CAR_OPTIONS, PAINT_OPTIONS, type CarOption, type PaintOption } from '../data/cars';

interface CarSelectorProps {
  car: CarOption;
  paint: PaintOption;
  onCarChange: (car: CarOption) => void;
  onPaintChange: (paint: PaintOption) => void;
  onShare: () => void;
}

export function CarSelector({ car, paint, onCarChange, onPaintChange, onShare }: CarSelectorProps) {
  return (
    <section id="garage" className="car-selector" aria-labelledby="garage-label" data-intro="support">
      <div className="selector-heading flex items-center justify-between">
        <h2 id="garage-label">Your drive. Your rules.</h2>
        <button className="share-drive inline-flex items-center" type="button" onClick={onShare} aria-label="Share your car configuration">
          Share <ArrowUpRight size={13} aria-hidden="true" />
        </button>
      </div>
      <fieldset className="car-choices flex">
        <legend className="sr-only">Choose your vehicle</legend>
        {CAR_OPTIONS.map((option) => (
          <label key={option.id} className={`car-choice ${car.id === option.id ? 'is-selected' : ''}`}>
            <input type="radio" name="vehicle" value={option.id} checked={car.id === option.id} onChange={() => onCarChange(option)} aria-label={`${option.name}, ${option.category}`} />
            <svg className="car-silhouette" viewBox="0 0 92 39" fill="currentColor" aria-hidden="true">
              <path d={option.silhouette} />
              <circle cx="22" cy="29" r="4.5" /><circle cx="69" cy="29" r="4.5" />
            </svg>
            <span>{option.category}</span>
          </label>
        ))}
      </fieldset>
      <div className="paint-row flex items-center justify-between">
        <fieldset className="paint-choices flex items-center">
          <legend className="sr-only">Choose your paint color</legend>
          {PAINT_OPTIONS.map((option) => (
            <label key={option.id} className={`paint-choice ${paint.id === option.id ? 'is-selected' : ''}`} style={{ '--swatch': option.hex } as CSSProperties} title={option.name}>
              <input type="radio" name="paint" value={option.id} checked={paint.id === option.id} onChange={() => onPaintChange(option)} aria-label={option.name} />
              <span className="paint-swatch" aria-hidden="true">{paint.id === option.id && <Check size={12} strokeWidth={2.4} />}</span>
            </label>
          ))}
        </fieldset>
        <p className="paint-name" aria-live="polite">{paint.name}<span> / {car.number}</span></p>
      </div>
    </section>
  );
}