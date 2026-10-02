/** Artwork box the car is fitted into (matches the SVG viewBox in CarVisual). */
const BOX_CENTER_X = 500;
const BOX_CENTER_Y = 240;
const FIT_WIDTH = 940;
const FIT_HEIGHT = 440;
/** Pixels at least this bright in every channel count as studio backdrop. */
const BACKDROP_MIN = 215;

export interface CarCutout {
  /** Object URL of a PNG with true transparency around the car. */
  url: string;
  /** Placement of the full source image so the car's bounds fit the artwork box. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Car's top and bottom extent in artwork space. */
  top: number;
  bottom: number;
}

const cache = new Map<string, Promise<CarCutout>>();

export function loadCarCutout(source: string): Promise<CarCutout> {
  let pending = cache.get(source);
  if (!pending) {
    pending = buildCutout(source);
    pending.catch(() => cache.delete(source));
    cache.set(source, pending);
  }
  return pending;
}

/**
 * Backdrop is only what is reachable from the image edge, so bright reflections,
 * glass highlights and pale paint inside the car are never made transparent.
 */
function findBackdrop(data: Uint8ClampedArray, width: number, height: number) {
  const backdrop = new Uint8Array(width * height);
  const stack = new Int32Array(width * height);
  let size = 0;

  const isBackdrop = (pixel: number) => {
    const index = pixel * 4;
    return data[index] >= BACKDROP_MIN && data[index + 1] >= BACKDROP_MIN && data[index + 2] >= BACKDROP_MIN;
  };
  const seed = (pixel: number) => {
    if (!backdrop[pixel] && isBackdrop(pixel)) {
      backdrop[pixel] = 1;
      stack[size++] = pixel;
    }
  };

  for (let x = 0; x < width; x += 1) { seed(x); seed((height - 1) * width + x); }
  for (let y = 0; y < height; y += 1) { seed(y * width); seed(y * width + width - 1); }

  while (size > 0) {
    const pixel = stack[--size];
    const x = pixel % width;
    if (x > 0) seed(pixel - 1);
    if (x < width - 1) seed(pixel + 1);
    if (pixel >= width) seed(pixel - width);
    if (pixel < width * (height - 1)) seed(pixel + width);
  }
  return backdrop;
}

async function buildCutout(source: string): Promise<CarCutout> {
  const image = new Image();
  image.decoding = 'async';
  image.src = source;
  await image.decode();

  const { naturalWidth: width, naturalHeight: height } = image;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is unavailable.');
  context.drawImage(image, 0, 0);
  const frame = context.getImageData(0, 0, width, height);
  const { data } = frame;

  const backdrop = findBackdrop(data, width, height);

  // One pixel of erosion removes the pale anti-aliasing fringe left by the backdrop.
  const solid = new Uint8Array(width * height);
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      if (backdrop[pixel]) continue;
      const row = pixel - width;
      const below = pixel + width;
      if (backdrop[row - 1] || backdrop[row] || backdrop[row + 1] || backdrop[pixel - 1] || backdrop[pixel + 1] || backdrop[below - 1] || backdrop[below] || backdrop[below + 1]) continue;
      solid[pixel] = 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) throw new Error('No vehicle found in the artwork.');

  // A 3 x 3 average of the mask gives a soft, natural edge.
  for (let y = Math.max(1, minY - 1); y <= Math.min(height - 2, maxY + 1); y += 1) {
    for (let x = Math.max(1, minX - 1); x <= Math.min(width - 2, maxX + 1); x += 1) {
      const pixel = y * width + x;
      const row = pixel - width;
      const below = pixel + width;
      const total = solid[row - 1] + solid[row] + solid[row + 1] + solid[pixel - 1] + solid[pixel] + solid[pixel + 1] + solid[below - 1] + solid[below] + solid[below + 1];
      data[pixel * 4 + 3] = (total * 255) / 9;
    }
  }
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const x = pixel % width;
    const y = (pixel / width) | 0;
    if (x < minX - 1 || x > maxX + 1 || y < minY - 1 || y > maxY + 1) data[pixel * 4 + 3] = 0;
  }
  context.putImageData(frame, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The cutout could not be encoded.');

  const boundsWidth = maxX - minX + 1;
  const boundsHeight = maxY - minY + 1;
  const scale = Math.min(FIT_WIDTH / boundsWidth, FIT_HEIGHT / boundsHeight);
  return {
    url: URL.createObjectURL(blob),
    x: BOX_CENTER_X - (minX + boundsWidth / 2) * scale,
    y: BOX_CENTER_Y - (minY + boundsHeight / 2) * scale,
    width: width * scale,
    height: height * scale,
    top: BOX_CENTER_Y - (boundsHeight * scale) / 2,
    bottom: BOX_CENTER_Y + (boundsHeight * scale) / 2,
  };
}
