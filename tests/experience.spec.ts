import { test, expect, type Page } from '@playwright/test';
import { ARTWORK_WIDTH, IDENTITY_COLOR_MATRIX, PAINT_OPTIONS } from '../src/data/cars';
import { calculateDriveGeometry, drivePositionAt } from '../src/animation/driveGeometry';
import { DRIVE_MOTION, driveDistanceProgress, driveProgressForDistance, sampleDrive } from '../src/animation/driveMotion';

async function ready(page: Page) {
  await page.goto('./');
  await expect(page.locator('.hero-shell')).toHaveAttribute('data-motion', 'cinematic');
  // Clean opening: headline + car only, all four stats hidden with counters at 0.
  await expect(page.locator('.metric-card').first()).toHaveCSS('opacity', '0');
  await expect(page.locator('.metric-count')).toHaveText(['0', '0', '0', '0']);
  await expect(page.locator('.vehicle-model.is-active .artwork-render')).toHaveCSS('opacity', '1');
  await page.evaluate(() => document.fonts.ready);
}

async function carX(page: Page) {
  return page.locator('.vehicle-travel').evaluate((element) => element.getBoundingClientRect().left);
}

async function scrollRange(page: Page) {
  return page.locator('.pin-spacer').evaluate((element) => element.getBoundingClientRect().height - (element.firstElementChild?.getBoundingClientRect().height ?? 0));
}

/** Let the smoothed scrub playhead converge before measuring. */
async function settle(page: Page, position: number) {
  await page.evaluate((top) => window.scrollTo(0, top), position);
  await expect.poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - position)).toBeLessThan(1);
  await page.waitForTimeout(520);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function cardOpacities(page: Page) {
  return page.locator('.metric-card').evaluateAll((cards) =>
    cards.map((card) => Number(getComputedStyle(card).opacity)),
  );
}

async function carBox(page: Page) {
  return page.locator('.vehicle-travel').evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, width: box.width };
  });
}

async function geometryFor(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: (document.querySelector('.road') as HTMLElement).clientWidth,
    vehicle: (document.querySelector('.vehicle-travel') as HTMLElement).offsetWidth,
  }));
  return calculateDriveGeometry(dimensions.viewport, dimensions.vehicle);
}

test('travel geometry preserves its edges and center while easing launch and braking', () => {
  for (const viewport of [320, 390, 700, 1024, 1280, 1440, 1920]) {
    for (const fraction of [0.3, 0.4, 0.48, 0.72]) {
      const geometry = calculateDriveGeometry(viewport, viewport * fraction);
      const points = [0, 0.25, 0.5, 0.75, 1].map((progress) => drivePositionAt(geometry, progress));
      expect(points[0]).toBeLessThan(0);
      expect(points[4] + geometry.carWidth).toBeGreaterThan(viewport);
      expect(points[2] + geometry.carWidth / 2).toBeCloseTo(viewport / 2, 8);
      const steps = points.slice(1).map((point, index) => point - points[index]);
      expect(steps[0]).toBeCloseTo(steps[3], 8);
      expect(steps[1]).toBeCloseTo(steps[2], 8);
      expect(steps[1]).toBeGreaterThan(steps[0]);
      expect(drivePositionAt(geometry, -1)).toBe(points[0]);
      expect(drivePositionAt(geometry, 2)).toBe(points[4]);
    }
  }
});

test('the shared drive curve is monotonic, smooth, symmetric, and invertible', () => {
  expect(driveDistanceProgress(0)).toBe(0);
  expect(driveDistanceProgress(0.5)).toBeCloseTo(0.5, 10);
  expect(driveDistanceProgress(1)).toBe(1);
  expect(sampleDrive(0).speed).toBe(0);
  expect(sampleDrive(1).speed).toBe(0);
  expect(sampleDrive(0.5).speed).toBe(1);

  for (let index = 1; index <= 100; index += 1) {
    const progress = index / 100;
    const value = driveDistanceProgress(progress);
    expect(value).toBeGreaterThanOrEqual(driveDistanceProgress(progress - 0.01));
    expect(value + driveDistanceProgress(1 - progress)).toBeCloseTo(1, 9);
    if (value > 0 && value < 1) {
      expect(driveProgressForDistance(value)).toBeCloseTo(progress, 8);
    }
  }

  const launchJoin = DRIVE_MOTION.rest + DRIVE_MOTION.ramp * (1 - DRIVE_MOTION.rest * 2);
  for (const join of [launchJoin, 1 - launchJoin]) {
    const before = sampleDrive(join - 0.00001);
    const after = sampleDrive(join + 0.00001);
    expect(Math.abs(before.speed - after.speed)).toBeLessThan(0.00001);
    expect(Math.abs(before.acceleration - after.acceleration)).toBeLessThan(0.00001);
  }
});

test('the whole car fits inside the band and has a solid, hole-free body', async ({ page }) => {
  await ready(page);
  const band = await page.locator('.road').evaluate((element) => element.getBoundingClientRect());
  const car = await page.locator('.vehicle-model.is-active image').evaluate((element) => element.getBoundingClientRect());
  expect(car.height).toBeLessThan(band.height * 0.9);
  expect(car.top).toBeGreaterThan(band.top);
  expect(car.bottom).toBeLessThan(band.bottom);

  // The cutout keeps true alpha: fully clear outside the car, fully opaque inside it.
  const alpha = await page.locator('.vehicle-model.is-active image').evaluate(async (element) => {
    const blob = await (await fetch(element.getAttribute('href')!)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(bitmap, 0, 0);
    const read = (x: number, y: number) => context.getImageData(Math.floor(x * bitmap.width), Math.floor(y * bitmap.height), 1, 1).data[3];
    return { corner: read(0.005, 0.005), center: read(0.5, 0.5) };
  });
  expect(alpha.corner).toBe(0);
  expect(alpha.center).toBe(255);
});

test('the clean opening shows headline and car with stats hidden', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await ready(page);
  await expect(page.getByRole('heading', { name: 'Welcome ITZFIZZ' })).toBeVisible();
  await expect(page.locator('.vehicle-travel')).toBeVisible();
  await expect(page.locator('.metric-card')).toHaveCount(4);
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  const heroHeight = await page.locator('.hero-shell').evaluate((element) => element.getBoundingClientRect().height);
  expect(Math.abs(heroHeight - page.viewportSize()!.height)).toBeLessThan(2);
  // Hidden cards still reserve layout (no shift when they reveal).
  for (const card of await page.locator('.metric-card').all()) {
    await expect(card).toHaveCSS('opacity', '0');
  }
  const boxes = await page.locator('.metric-position').evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    }),
  );
  expect(boxes).toEqual([true, true, true, true]);
  await expect(page.locator('#garage')).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('stats reveal progressively in stages synced to the drive', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);

  await settle(page, 0);
  expect(await cardOpacities(page)).toEqual([0, 0, 0, 0]);

  await settle(page, range * 0.3);
  const early = await cardOpacities(page);
  expect(early[0]).toBeGreaterThan(0.6);
  expect(early[1]).toBeLessThan(0.6);
  expect(early[3]).toBeLessThan(0.05);

  await settle(page, range * 0.55);
  const mid = await cardOpacities(page);
  expect(mid[0]).toBeGreaterThan(0.9);
  expect(mid[1]).toBeGreaterThan(0.6);
  expect(mid[3]).toBeLessThan(0.4);

  await settle(page, range);
  expect(await cardOpacities(page)).toEqual([1, 1, 1, 1]);
  await expect(page.locator('.metric-count')).toHaveText(['58', '27', '23', '40']);

  // Reverse: scrolling back up hides the story again in reverse order.
  await settle(page, range * 0.3);
  const reversed = await cardOpacities(page);
  expect(reversed[3]).toBeLessThan(0.05);
  expect(reversed[0]).toBeGreaterThan(0.6);

  await settle(page, 0);
  expect(await cardOpacities(page)).toEqual([0, 0, 0, 0]);
  await expect(page.locator('.metric-count')).toHaveText(['0', '0', '0', '0']);
});

test('all three models and four paint choices change the actual artwork', async ({ page }) => {
  await ready(page);
  const models = [
    ['Velocity, Sports coupe', 'velocity-coupe.jpg'],
    ['Horizon, Grand tourer', 'horizon-gt.jpg'],
    ['Atlas, Premium SUV', 'atlas-suv.jpg'],
  ];
  for (const [name, asset] of models) {
    await page.getByRole('radio', { name, exact: true }).check();
    await expect(page.locator('.vehicle-model.is-active image')).toHaveAttribute('data-source', `./assets/${asset}`);
    await expect(page.locator('.vehicle-model.is-active .artwork-render')).toHaveCSS('opacity', '1');
    for (const paint of ['Solar orange', 'Acid lime', 'Electric blue', 'Liquid graphite']) {
      await page.getByRole('radio', { name: paint, exact: true }).check();
      await expect(page.locator('.vehicle-visual')).toHaveAttribute('aria-label', new RegExp(paint));
      const option = PAINT_OPTIONS.find((item) => item.name === paint)!;
      await expect(page.locator('.vehicle-model.is-active .artwork-render')).toHaveAttribute('data-paint', option.id);
      await expect.poll(() => page.locator('.vehicle-model.is-active .paint-grade').getAttribute('values')).toBe(option.colorMatrix);
      expect(paint === 'Solar orange' ? option.colorMatrix === IDENTITY_COLOR_MATRIX : option.colorMatrix !== IDENTITY_COLOR_MATRIX).toBe(true);
    }
  }
});

test('vertical scroll maps to the shared acceleration curve without changing the composition', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);
  const geometry = await geometryFor(page);

  await settle(page, 0);
  const start = await carBox(page);
  expect(start.left).toBeLessThan(0);
  expect(start.right).toBeGreaterThan(0);

  const samples: number[] = [];
  for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
    await settle(page, range * fraction);
    const left = (await carBox(page)).left;
    expect(Math.abs(left - drivePositionAt(geometry, fraction))).toBeLessThan(2.5);
    samples.push(left);
  }

  for (let index = 1; index < samples.length; index += 1) {
    expect(samples[index]).toBeGreaterThan(samples[index - 1]);
  }

  const midpoint = await (async () => { await settle(page, range * 0.5); return carBox(page); })();
  expect(Math.abs((midpoint.left + midpoint.right) / 2 - geometry.viewportWidth / 2)).toBeLessThan(2.5);

  await settle(page, range);
  const finish = await carBox(page);
  expect(finish.right).toBeGreaterThan(geometry.viewportWidth);
  expect(finish.left).toBeLessThan(geometry.viewportWidth);

  const steps = samples.slice(1).map((value, index) => value - samples[index]);
  expect(Math.abs(steps[0] - steps[3])).toBeLessThan(2.5);
  expect(Math.abs(steps[1] - steps[2])).toBeLessThan(2.5);
  expect(steps[1]).toBeGreaterThan(steps[0]);
});

test('the pinned composition holds position while the car travels', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);
  const anchors = ['.hero-shell', '.road', '.band', '.metrics-top', '.metrics-bottom', '.band-title', '.site-header', '#garage'];
  await settle(page, 0);
  const before = await page.evaluate((selectors) => selectors.map((selector) => document.querySelector(selector)!.getBoundingClientRect().top), anchors);

  for (const fraction of [0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0]) {
    await settle(page, range * fraction);
    const during = await page.evaluate((selectors) => selectors.map((selector) => document.querySelector(selector)!.getBoundingClientRect().top), anchors);
    during.forEach((top, index) => expect(Math.abs(top - before[index])).toBeLessThan(2));
    // Card wrappers never leave the viewport even while the cards animate inside them.
    for (const slot of await page.locator('.metric-position').all()) await expect(slot).toBeInViewport();
  }
});

test('only scrolling moves the car, and release happens after its journey', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);
  const geometry = await geometryFor(page);
  const position = await carX(page);
  await page.waitForTimeout(700);
  expect(Math.abs((await carX(page)) - position)).toBeLessThan(0.1);

  await settle(page, range * 0.5);
  await expect(page.locator('.hero-shell')).toHaveCSS('position', 'fixed');
  const midpoint = await carX(page);
  await page.waitForTimeout(400);
  expect(Math.abs((await carX(page)) - midpoint)).toBeLessThan(0.1);

  await settle(page, range + 60);
  expect(Math.abs((await carX(page)) - geometry.endX)).toBeLessThan(2.5);
  await expect(page.locator('.journey-phase')).toHaveText('04 / ARRIVAL');
  const releasedTop = await page.locator('.hero-shell').evaluate((element) => element.getBoundingClientRect().top);
  expect(releasedTop).toBeLessThan(-40);

  await settle(page, range * 0.5);
  await expect(page.locator('.hero-shell')).toHaveCSS('position', 'fixed');
  expect(Math.abs((await carX(page)) - drivePositionAt(geometry, 0.5))).toBeLessThan(2.5);
});

test('all selectable wheels remain distance-linked when a model changes mid-drive', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);
  const geometry = await geometryFor(page);
  await expect(page.locator('.rolling-tread-pattern')).toHaveCount(3);
  await settle(page, range * 0.5);
  const expectedOffset = -geometry.treadDistance * ARTWORK_WIDTH * driveDistanceProgress(0.5);

  for (const name of ['Horizon, Grand tourer', 'Atlas, Premium SUV', 'Velocity, Sports coupe']) {
    await page.getByRole('radio', { name, exact: true }).check();
    const value = await page.locator('.vehicle-model.is-active .rolling-tread-pattern').getAttribute('patternTransform');
    const offset = Number(value?.match(/translate\(([-\d.]+)/)?.[1]);
    expect(Number.isFinite(offset)).toBe(true);
    expect(Math.abs(offset - expectedOffset)).toBeLessThan(4);
    expect(Math.abs((await carX(page)) - drivePositionAt(geometry, 0.5))).toBeLessThan(2.5);
  }

  await settle(page, 0);
  for (const pattern of await page.locator('.rolling-tread-pattern').all()) {
    await expect(pattern).toHaveAttribute('patternTransform', 'translate(0 0)');
  }
});

test('wheel slip stays zero through acceleration, cruise, braking, and reversal', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);
  const geometry = await geometryFor(page);
  for (const progress of [0.12, 0.32, 0.62, 0.88, 0.62, 0.32, 0.12]) {
    await settle(page, range * progress);
    const left = await carX(page);
    const expected = -(left - geometry.startX) / geometry.carWidth * ARTWORK_WIDTH;
    for (const pattern of await page.locator('.rolling-tread-pattern').all()) {
      const value = await pattern.getAttribute('patternTransform');
      const offset = Number(value?.match(/translate\(([-\d.]+)/)?.[1]);
      expect(Math.abs(offset - expected)).toBeLessThan(1);
    }
  }
});

test('suspension, shadows, and surface lighting restore the same state on reverse scroll', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);
  const snapshot = () => page.evaluate(() => {
    const selectors = ['.vehicle-entrance', '.vehicle-ground', '.vehicle-light', '.vehicle-trail', '.vehicle-model.is-active .car-reflection', '.vehicle-model.is-active .car-reflection-sweep'];
    return selectors.map((selector) => {
      const element = document.querySelector(selector)!;
      const style = getComputedStyle(element);
      return { transform: style.transform, opacity: style.opacity };
    });
  });

  await settle(page, range * 0.3);
  const forward = await snapshot();
  await settle(page, range * 0.8);
  await settle(page, range * 0.3);
  expect(await snapshot()).toEqual(forward);

  await settle(page, 0);
  const neutral = await page.locator('.vehicle-entrance').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return [matrix.m11, matrix.m22, matrix.m12, matrix.m13, matrix.m41, matrix.m42];
  });
  expect(neutral).toEqual([1, 1, 0, 0, 0, 0]);
  await expect(page.locator('.vehicle-model.is-active .car-reflection')).toHaveCSS('opacity', '0');
});

test('a fast fling reaches the final state before the hero leaves the viewport', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);
  const geometry = await geometryFor(page);
  await page.evaluate((top) => window.scrollTo(0, top), range + 40);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(Math.abs((await carX(page)) - geometry.endX)).toBeLessThan(1.5);
  expect(await cardOpacities(page)).toEqual([1, 1, 1, 1]);
  await expect(page.locator('.metric-count')).toHaveText(['58', '27', '23', '40']);
});

test('the timeline reverses, and configuration changes preserve scroll position', async ({ page }) => {
  await ready(page);
  const startX = await carX(page);
  const range = await scrollRange(page);
  await settle(page, range * 0.56);
  await expect.poll(() => carX(page)).toBeGreaterThan(startX + 25);
  await expect(page.locator('.journey-phase')).toHaveText('03 / REVEAL');
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole('radio', { name: 'Horizon, Grand tourer' }).check();
  await page.getByRole('radio', { name: 'Electric blue', exact: true }).check();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThan(2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => Math.abs((await carX(page)) - startX)).toBeLessThan(2);
  await expect(page.locator('.journey-phase')).toHaveText('01 / IGNITION');
});

test('slow, quick and interrupted scrolls settle into a visible final composition', async ({ page }) => {
  await ready(page);
  const range = await scrollRange(page);
  for (const fraction of [0.05, 0.08, 0.15, 0.88, 0.3, 0.72, 0.1, 1]) {
    await page.evaluate((position) => window.scrollTo(0, position), range * fraction);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(900);
  await expect(page.locator('.journey-phase')).toHaveText('04 / ARRIVAL');
  const geometry = await geometryFor(page);
  await expect.poll(async () => Math.abs((await carX(page)) - geometry.endX)).toBeLessThan(2.5);
  await expect(page.locator('.metric-count')).toHaveText(['58', '27', '23', '40']);
  await expect(page.locator('.vehicle-travel')).toBeInViewport();
  await expect(page.locator('.band-cover')).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('.journey-phase')).toHaveText('01 / IGNITION');
});

test('both themes persist across reloads', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Switch to night mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('reduced motion removes pinning without removing content or controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('.hero-shell')).toHaveAttribute('data-motion', 'still');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.metric-count')).toHaveText(['58', '27', '23', '40']);
  await page.getByRole('radio', { name: 'Atlas, Premium SUV' }).check();
  await expect(page.locator('.vehicle-model.is-active image')).toHaveAttribute('data-source', './assets/atlas-suv.jpg');
  await page.getByRole('button', { name: /Explore the idea/ }).click();
  await expect(page.getByRole('heading', { name: /Good things/ })).toBeInViewport();
});

test('resizing across breakpoints does not duplicate pin spacers', async ({ page }) => {
  await ready(page);
  for (const width of [390, 1024, 1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.locator('.pin-spacer')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test('resizing a pinned journey preserves its fractional position', async ({ page }) => {
  await ready(page);
  await settle(page, (await scrollRange(page)) * 0.5);
  for (const viewport of [{ width: 1440, height: 650 }, { width: 390, height: 568 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    await expect(page.locator('.pin-spacer')).toHaveCount(1);
    await expect.poll(async () => {
      const geometry = await geometryFor(page);
      return Math.abs((await carX(page)) - drivePositionAt(geometry, 0.5));
    }).toBeLessThan(3);
    await expect(page.locator('.hero-shell')).toHaveCSS('position', 'fixed');
  }
});

test('sharing, keyboard dismissal, downloading and deep links work', async ({ page, context }) => {
  await ready(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('radio', { name: 'Atlas, Premium SUV' }).check();
  await page.getByRole('radio', { name: 'Acid lime', exact: true }).check();
  await page.getByRole('button', { name: 'Share your car configuration' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.artwork-render')).toHaveCSS('opacity', '1');
  const shareUrl = await dialog.getByLabel('Your configuration link').inputValue();
  expect(shareUrl).toContain('/itzfizz-assignment/');
  expect(shareUrl).toContain('car=atlas');
  expect(shareUrl).toContain('paint=lime');
  await dialog.getByRole('button', { name: 'Copy link', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Link copied' })).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Save artwork' }).click();
  expect((await downloadEvent).suggestedFilename()).toBe('itzfizz-atlas-lime.svg');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.goto(shareUrl);
  await expect(page.getByRole('radio', { name: 'Atlas, Premium SUV' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Acid lime', exact: true })).toBeChecked();
});

test('a failed raster asset leaves the local vector fallback visible', async ({ page }) => {
  await page.route('**/assets/velocity-coupe.jpg', (route) => route.abort());
  await page.goto('./');
  await expect(page.locator('.vehicle-model.is-active .artwork-fallback')).toHaveCSS('opacity', '1');
  await expect(page.locator('.vehicle-model.is-active .vector-fallback')).toBeVisible();
  await expect(page.locator('.vehicle-model.is-active image')).toHaveCount(0);
});

test('the production assets resolve from a GitHub Pages-style subpath', async ({ request }) => {
  for (const file of ['', 'favicon.svg', 'assets/velocity-coupe.jpg', 'assets/horizon-gt.jpg', 'assets/atlas-suv.jpg']) {
    const response = await request.get(`./${file}`);
    expect(response.ok()).toBe(true);
  }
});

test('the static fallback remains usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.getByRole('heading', { name: 'ITZFIZZ*', exact: true })).toBeVisible();
  await expect(page.getByText('Enable JavaScript', { exact: false })).toBeVisible();
  await context.close();
});