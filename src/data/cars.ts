export type CarId = 'velocity' | 'horizon' | 'atlas';
export type PaintId = 'orange' | 'lime' | 'blue' | 'graphite';

export interface Wheelbase {
  frontX: number;
  rearX: number;
  topY: number;
  bottomY: number;
  width: number;
  height: number;
}

export interface CarOption {
  id: CarId;
  name: string;
  category: string;
  shortLabel: string;
  number: string;
  image: string;
  silhouette: string;
  description: string;
  /** Contact-patch boxes in artwork space, used for rolling tread motion. */
  wheelbase: Wheelbase;
}

/** Artwork is authored nose-left, then mirrored so the car faces its direction of travel. */
export const ARTWORK_WIDTH = 1000;
export const TREAD_PITCH = 15;

export interface PaintOption {
  id: PaintId;
  name: string;
  hex: string;
  light: string;
  dark: string;
  colorMatrix: string;
}

export const IDENTITY_COLOR_MATRIX = '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0';

// All artwork is local and unbranded. Paths are relative for project Pages sites.
export const CAR_OPTIONS: readonly CarOption[] = [
  {
    id: 'velocity',
    name: 'Velocity',
    category: 'Sports coupe',
    shortLabel: 'Sport',
    number: '01',
    image: './assets/velocity-coupe.jpg',
    silhouette: 'M4 26 8 21 24 18 36 10Q42 7 53 9L68 18 81 20 87 25 86 29H76A7 7 0 0 0 62 29H28A7 7 0 0 0 14 29H5Z',
    description: 'A low-slung silhouette. An instinct for the extraordinary.',
    wheelbase: { frontX: 148, rearX: 724, topY: 56, bottomY: 378, width: 124, height: 46 },
  },
  {
    id: 'horizon',
    name: 'Horizon',
    category: 'Grand tourer',
    shortLabel: 'GT',
    number: '02',
    image: './assets/horizon-gt.jpg',
    silhouette: 'M4 25 9 21 28 18 40 9Q47 6 59 10L72 19 83 22 87 27 86 30H76A7 7 0 0 0 62 30H29A7 7 0 0 0 15 30H5Z',
    description: 'The long way home has never looked so good.',
    wheelbase: { frontX: 158, rearX: 716, topY: 54, bottomY: 376, width: 122, height: 48 },
  },
  {
    id: 'atlas',
    name: 'Atlas',
    category: 'Premium SUV',
    shortLabel: 'SUV',
    number: '03',
    image: './assets/atlas-suv.jpg',
    silhouette: 'M5 28V19L11 16 28 15 36 5H72L80 11 85 14V30H75A7 7 0 0 0 61 30H29A7 7 0 0 0 15 30H6Z',
    description: 'A bold point of view. Room for every possibility.',
    wheelbase: { frontX: 146, rearX: 712, topY: 46, bottomY: 384, width: 132, height: 52 },
  },
];

export const PAINT_OPTIONS: readonly PaintOption[] = [
  { id: 'orange', name: 'Solar orange', hex: '#ec773b', light: '#ffd3a5', dark: '#833c16', colorMatrix: IDENTITY_COLOR_MATRIX },
  { id: 'lime', name: 'Acid lime', hex: '#bedf49', light: '#eefaa4', dark: '#587019', colorMatrix: '.9 .1 0 0 0 1.1 .1 -.2 0 0 .25 .05 .7 0 0 0 0 0 1 0' },
  { id: 'blue', name: 'Electric blue', hex: '#4268e8', light: '#b0ccff', dark: '#152c78', colorMatrix: '.18 .36 .46 0 0 .35 .55 .1 0 0 1.15 -.1 -.05 0 0 0 0 0 1 0' },
  { id: 'graphite', name: 'Liquid graphite', hex: '#515651', light: '#c4c9c5', dark: '#181c19', colorMatrix: '.18 .7 .12 0 0 .19 .7 .11 0 0 .17 .7 .13 0 0 0 0 0 1 0' },
];

export function readInitialConfiguration() {
  const params = new URLSearchParams(window.location.search);
  return {
    car: CAR_OPTIONS.find((option) => option.id === params.get('car')) ?? CAR_OPTIONS[0],
    paint: PAINT_OPTIONS.find((option) => option.id === params.get('paint')) ?? PAINT_OPTIONS[0],
  };
}