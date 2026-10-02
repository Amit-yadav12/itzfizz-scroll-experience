import { useEffect, useId, useState } from 'react';
import { ARTWORK_WIDTH, CAR_OPTIONS, IDENTITY_COLOR_MATRIX, TREAD_PITCH, type CarOption, type PaintOption } from '../data/cars';
import { usePaintTransition } from '../hooks/usePaintTransition';
import { loadCarCutout, type CarCutout } from '../lib/carCutout';

const TREAD_HEIGHT = 30;

/** Tread blocks translate along each contact patch. From directly above, only the
 *  tire edge beside the fender is visible, so the tread is drawn at the car's outer
 *  edge and clipped to the car's own silhouette. */
function RollingTread({ car, id, mask, edge }: { car: CarOption; id: string; mask: string; edge?: { top: number; bottom: number } }) {
  const { frontX, rearX, topY, bottomY, width, height } = car.wheelbase;
  const patternId = `${id}-rolling-tread`;
  const upper = edge ? edge.top - 2 : topY;
  const lower = edge ? edge.bottom - TREAD_HEIGHT + 2 : bottomY;
  const tire = edge ? TREAD_HEIGHT : height;

  return (
    <g className="rolling-tread-layer" aria-hidden="true" mask={mask}>
      <defs>
        <pattern id={patternId} className="rolling-tread-pattern" patternUnits="userSpaceOnUse" width={TREAD_PITCH} height="480" patternTransform="translate(0 0)">
          <path d={`M0 0H${TREAD_PITCH * 0.32}V480H0Z`} fill="#05070a" />
        </pattern>
      </defs>
      {[frontX, rearX].flatMap((x) => [upper, lower].map((y) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height={tire} rx="14" fill={`url(#${patternId})`} opacity="0.2" />
      )))}
    </g>
  );
}

interface CarArtworkProps {
  car: CarOption;
  paint: PaintOption;
  priority?: boolean;
  decorative?: boolean;
  loadRaster?: boolean;
}

function VectorFallback({ car, paint, id }: { car: CarOption; paint: PaintOption; id: string }) {
  const isSuv = car.id === 'atlas';
  const isGt = car.id === 'horizon';
  const body = isSuv
    ? 'M84 109Q73 89 130 73L863 70Q921 77 935 115L944 357Q938 397 881 409L135 405Q75 394 77 360Z'
    : 'M70 179Q81 91 173 76L327 70Q447 98 661 75L813 67Q902 68 924 117L951 205Q960 239 949 283L923 372Q903 409 814 414L665 406Q446 381 327 410L174 405Q85 391 70 306Q59 240 70 179Z';

  return (
    <g className="vector-fallback">
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor={paint.dark} /><stop offset="0.18" stopColor={paint.light} />
          <stop offset="0.29" stopColor={paint.hex} /><stop offset="0.7" stopColor={paint.hex} />
          <stop offset="0.9" stopColor={paint.dark} /><stop offset="1" stopColor={paint.light} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.9" y2="1">
          <stop stopColor="#819390" /><stop offset="0.23" stopColor="#283632" />
          <stop offset="0.58" stopColor="#101916" /><stop offset="0.83" stopColor="#34433c" /><stop offset="1" stopColor="#121813" />
        </linearGradient>
        <pattern id={`${id}-vents`} width="13" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 2H13" stroke="#040705" strokeWidth="6" /><path d="M0 7H13" stroke="#858b7e" strokeWidth="1" />
        </pattern>
      </defs>
      {[car.wheelbase.frontX, car.wheelbase.rearX].map((x) => (
        <g key={x} fill="#171c19">
          <rect x={x} y={car.wheelbase.topY} width={car.wheelbase.width} height={car.wheelbase.height} rx="14" />
          <rect x={x} y={car.wheelbase.bottomY} width={car.wheelbase.width} height={car.wheelbase.height} rx="14" />
        </g>
      ))}
      <path d={body} fill={`url(#${id}-paint)`} stroke={paint.dark} strokeWidth="5" />
      <path d="M92 158Q100 107 183 98L319 90M96 326Q106 378 180 383L322 392M804 89Q881 84 903 117M809 390Q883 398 909 361" fill="none" stroke={paint.light} strokeWidth="5" opacity=".7" />
      <path d={isSuv ? 'M357 113 849 111 861 370 351 367Q317 239 357 113Z' : isGt ? 'M424 111Q552 101 773 127L862 181V303L769 355Q563 380 422 369Q359 242 424 111Z' : 'M335 127Q515 95 711 127L837 178V304L710 357Q526 388 334 355Q269 240 335 127Z'} fill={`url(#${id}-glass)`} stroke="#171f19" strokeWidth="9" />
      <path d={isSuv ? 'M405 119 463 113 464 366 405 363Q362 239 405 119Z' : isGt ? 'M426 126 506 114Q468 240 507 370L427 355Q377 240 426 126Z' : 'M344 139 469 116Q421 239 467 369L344 343Q287 239 344 139Z'} fill="#8da09b" opacity=".34" />
      <path d={isSuv ? 'M481 128H808V352H481Z' : 'M487 141Q589 126 682 144V337Q573 351 487 337Q458 240 487 141Z'} fill="#121c18" stroke="#8b9890" strokeWidth="2" />
      <path d="M365 96 385 53Q390 39 418 41L430 54 402 99M365 382 385 425Q390 439 418 437L430 424 402 379" fill={`url(#${id}-paint)`} stroke={paint.dark} strokeWidth="4" />
      <path d="M131 137 207 112 186 150 120 176ZM122 307 187 334 206 371 131 346Z" fill="#142019" stroke="#aebcaf" strokeWidth="3" />
      <path d="M137 143 184 128M137 336 184 356" stroke="#edffdc" strokeWidth="5" />
      <path d="M169 184Q208 157 288 154M169 296Q208 323 288 326" stroke={paint.dark} strokeWidth="3" fill="none" />
      {!isSuv && <path d="M748 151 820 182 822 300 748 332Z" fill={`url(#${id}-vents)`} />}
      {isSuv && <g fill="#161f18"><rect x="456" y="91" width="350" height="8" rx="4" /><rect x="456" y="382" width="350" height="8" rx="4" /></g>}
      <path d="M897 130 918 168V311L899 350" stroke="#852922" strokeWidth="12" fill="none" />
      <path d="M903 133 917 172M917 308 904 348" stroke="#ff7559" strokeWidth="4" />
      <path d="M105 207Q94 240 105 273M929 191V290" stroke="#141c17" strokeWidth="12" fill="none" />
      <path d="M470 98 657 99M471 380 654 381" stroke={paint.light} strokeWidth="3" opacity=".65" />
    </g>
  );
}

export function CarArtwork({ car, paint, priority = false, decorative = false, loadRaster = true }: CarArtworkProps) {
  const uniqueId = useId().replace(/:/g, '');
  const [cutout, setCutout] = useState<CarCutout | null>(null);
  const [failed, setFailed] = useState(false);
  const loaded = cutout !== null;
  const gradeId = `paint-grade-${uniqueId}`;
  const surfaceId = `car-surface-${uniqueId}`;

  useEffect(() => {
    if (!loadRaster || failed || cutout) return;
    let active = true;
    loadCarCutout(car.image)
      .then((result) => { if (active) setCutout(result); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [car.image, loadRaster, failed, cutout]);
  const reflectionId = `car-reflection-${uniqueId}`;
  const reflectionMaskId = `car-reflection-mask-${uniqueId}`;
  const paintRef = usePaintTransition(paint.colorMatrix);

  return (
    <svg
      className="car-artwork"
      viewBox="0 0 1000 480"
      width="1000"
      height="480"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${car.name} ${car.category}, ${paint.name}, viewed from above`}
    >
      <defs>
        <filter id={gradeId} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix ref={paintRef} className="paint-grade" type="matrix" values={IDENTITY_COLOR_MATRIX} />
        </filter>
        <linearGradient id={reflectionId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Artwork is drawn nose-left, then mirrored here so the car always faces the
          direction it travels. Mirroring inside the SVG keeps exported files correct. */}
      <g transform={`translate(${ARTWORK_WIDTH} 0) scale(-1 1)`}>
        <defs>
          <mask id={reflectionMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="480" style={{ maskType: 'alpha' }}>
            <use href={`#${surfaceId}`} />
          </mask>
        </defs>
        <g id={surfaceId}>
          <g className="artwork-fallback" style={{ opacity: loaded && !failed ? 0 : 1 }}>
            <VectorFallback car={car} paint={paint} id={uniqueId} />
          </g>
          {cutout && !failed && (
            <g className="artwork-render" data-paint={paint.id}>
              <image
                href={cutout.url}
                data-source={car.image}
                x={cutout.x} y={cutout.y} width={cutout.width} height={cutout.height}
                preserveAspectRatio="none"
                filter={`url(#${gradeId})`}
                data-priority={priority ? 'high' : 'auto'}
              />
            </g>
          )}
        </g>
        <g className="car-reflection" mask={`url(#${reflectionMaskId})`} opacity="0" aria-hidden="true">
          <g className="car-reflection-sweep">
            <rect x="0" y="0" width="280" height="480" fill={`url(#${reflectionId})`} />
          </g>
        </g>
        <RollingTread car={car} id={uniqueId} mask={`url(#${reflectionMaskId})`} edge={cutout ? { top: cutout.top, bottom: cutout.bottom } : undefined} />
      </g>
    </svg>
  );
}

export function CarVisual({ car, paint }: { car: CarOption; paint: PaintOption }) {
  const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set([car.id]));
  // Keep previously selected models mounted for instant, reversible crossfades.
  if (!visited.has(car.id)) setVisited((current) => new Set([...current, car.id]));

  return (
    <div className="vehicle-visual" role="img" aria-label={`${car.name}, ${car.category} in ${paint.name}. Original automotive concept render.`}>
      {CAR_OPTIONS.map((option) => (
        <div key={option.id} className={`vehicle-model ${option.id === car.id ? 'is-active' : ''}`} aria-hidden="true">
          <CarArtwork car={option} paint={paint} decorative priority={option.id === CAR_OPTIONS[0].id} loadRaster={visited.has(option.id) || option.id === car.id} />
        </div>
      ))}
    </div>
  );
}