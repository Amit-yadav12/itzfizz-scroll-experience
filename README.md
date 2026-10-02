# ITZFIZZ — Scroll-Driven Hero

**Frontend development assignment · Amit Yadav**

A responsive automotive hero experience built around a pinned, scroll-controlled car journey. The layout takes its visual direction from the assignment reference while adding a configurable vehicle, light/night themes, and a staged reveal of the impact metrics.

## Features

- Full-screen hero with the ITZFIZZ headline and a green/charcoal driving banner.
- A pinned GSAP ScrollTrigger timeline: vertical scrolling drives the car horizontally from left to right.
- Four metrics that begin hidden and reveal progressively as the car moves; scrolling upward reverses the sequence.
- Three locally bundled vehicle visuals and four paint treatments.
- Light and night themes, with the preference saved between visits.
- Responsive layouts, keyboard-accessible controls, and a reduced-motion alternative.
- GitHub Actions workflow for validation and GitHub Pages deployment.

The percentages and descriptions are the assignment's reference content and are illustrative, not independently verified business results. Vehicle artwork is supplied as concept imagery and is not manufacturer photography.

## Tech stack

- React and TypeScript
- Vite
- Tailwind CSS
- GSAP and ScrollTrigger
- Lucide React

## Run locally

Use Node.js 22 LTS and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Available scripts

```bash
npm run dev          # Start the local development server
npm run typecheck    # Check TypeScript
npm run build        # Create the production build
npm run preview      # Preview the production build
npm run verify:build # Check the built files and assets
npm run test:e2e     # Run the Playwright browser tests
```

For the browser tests, install Chromium first:

```bash
npx playwright install chromium
npm run test:e2e
```

## Project structure

```text
src/
  animation/       Car travel geometry and motion
  components/      Hero, navigation, car, metric cards, controls
  data/            Vehicle, paint, and metric configuration
  hooks/           Scroll animation, theme, and paint transitions
  lib/             Car artwork helpers
  App.tsx          Application state and composition
  index.css        Design tokens, themes, and responsive styles
public/
  assets/          Local vehicle artwork
  favicon.svg
.github/workflows/
  deploy.yml       GitHub Pages build and deployment
scripts/           Build verification and test server
tests/             Playwright regression tests
```

## Customize

- Edit `src/data/cars.ts` to change vehicle options and paint treatments.
- Edit `src/data/metrics.ts` to change the four statistic cards.
- Edit the theme tokens and responsive styles in `src/index.css`.
- Adjust travel geometry in `src/animation/driveGeometry.ts` and scroll behavior in `src/animation/driveMotion.ts` and `src/hooks/useHeroAnimation.ts`.

Keep vehicle artwork consistently framed so each model fits the driving banner. When changing the animation, test both downward and upward scrolling, including resize and reduced-motion behavior.

## Deploy to GitHub Pages

1. Create a **public** GitHub repository (for example, `itzfizz-scroll-experience`).
2. Push the contents of this project to the repository's `main` branch. Do not commit `node_modules/` or `dist/`.
3. In the repository, open **Settings → Pages** and set the deployment source to **GitHub Actions**.
4. Open the **Actions** tab and check the `Validate and deploy to GitHub Pages` workflow. It builds and tests the project before deployment.
5. Once the deployment job succeeds, use the URL shown in its `github-pages` environment.

For a repository named `itzfizz-scroll-experience`, the expected project URL is:

```text
https://<your-github-username>.github.io/itzfizz-scroll-experience/
```

The Vite build uses relative asset paths so the site can run from a GitHub Pages repository subpath. The URL above is a template; the live page does not exist until the repository is published and the workflow completes.

## Before submitting

Run the type check, production build, build verification, and browser tests. After deploying, open the published page and check the initial state, car travel, metric reveals, reverse scrolling, both themes, and mobile layout.
