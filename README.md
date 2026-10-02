# ITZFIZZ — Scroll-Driven Hero Experience

A scroll-driven automotive hero experience built with React, TypeScript, Tailwind CSS and GSAP. This project explores scroll-synchronized animation, interactive vehicle visuals and responsive interface design, inspired by the ITZFIZZ car animation reference.

<p align="center">
  <a href="https://itzfizz-car.netlify.app/"><strong>Live Demo ↗</strong></a> ·
  <a href="https://github.com/Amit-yadav12/itzfizz-scroll-experience"><strong>Source Code ↗</strong></a>
</p>

---

## Overview

ITZFIZZ is an interactive hero section in which vertical scrolling controls the horizontal movement of a car. The hero remains pinned during the main animation, while the headline, visual elements and impact metrics form a coordinated visual experience.

The implementation focuses on scroll-driven motion, visual consistency, responsive behaviour and maintainable frontend architecture.

## Live Preview

**Live website:** https://itzfizz-car.netlify.app/

**GitHub repository:** https://github.com/Amit-yadav12/itzfizz-scroll-experience

**Design reference:** https://paraschaturvedi.github.io/car-scroll-animation

## Key Features

- **Pinned hero experience:** Keeps the main composition in the viewport throughout the primary animation.
- **Scroll-controlled car movement:** Drives the car horizontally from left to right in response to vertical scrolling.
- **Progressive content reveal:** Introduces the impact metrics as the animation progresses.
- **Reversible timeline:** Supports forward and backward scrolling with synchronized animation states.
- **Animated introduction:** Uses subtle entrance transitions for the headline and visual elements.
- **Light and dark themes:** Provides distinct visual themes with a persistent user preference.
- **Vehicle customization:** Includes vehicle and paint selection controls.
- **Responsive layout:** Adapts the composition and animation to different viewport sizes.
- **Performance-conscious motion:** Prioritizes transform-based animation and controlled scroll updates.
- **Accessibility:** Includes reduced-motion considerations and accessible interface controls.

## Technology Stack

| Technology | Role |
|---|---|
| React | Component-based interface |
| TypeScript | Type-safe application code |
| Vite | Development server and build tooling |
| Tailwind CSS | Responsive styling |
| GSAP | Animation timelines |
| ScrollTrigger | Scroll-synchronized animation |
| Lucide React | Interface icons |
| Netlify | Live website hosting |
| GitHub | Source control |

## How the Animation Works

The primary interaction uses a pinned hero and a scroll-synchronized GSAP timeline.

1. The page opens with the headline and car in the initial composition.
2. The hero becomes pinned as the user enters the animation sequence.
3. Vertical scroll progress drives the car's horizontal movement.
4. The impact metrics are revealed progressively as the car travels.
5. The animation reverses naturally when the user scrolls upward.
6. After the sequence completes, normal page scrolling resumes.

The animation is designed around scroll progress rather than autoplay, allowing the user to control the pace of the experience.

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Amit-yadav12/itzfizz-scroll-experience.git
cd itzfizz-scroll-experience
```

Install the dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local development server |
| `npm run build` | Generates the production build |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs the configured lint checks |

## Project Structure

```text
itzfizz-scroll-experience/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── data/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── .github/
│   └── workflows/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Design and Interaction

The interface retains the distinctive green-and-black banner, oversized headline and colourful impact cards of the reference design.

The interaction is built around three visual priorities:

- Keeping the initial hero composition uncluttered.
- Making the car the central moving element.
- Revealing supporting information without disrupting the pinned layout.

The light and dark themes maintain the same underlying animation behaviour while adapting the visual presentation.

## Performance and Accessibility

The implementation considers the following:

- Transform-based animation for frequently updated visual elements.
- Scroll-linked animation instead of independent autoplay.
- Animation cleanup to prevent duplicate ScrollTriggers.
- Responsive adjustments for different screen sizes.
- Reduced-motion support.
- Accessible controls and visible focus states.
- Prevention of unnecessary layout shifts.

## Deployment

The live version is hosted on Netlify.

**Live URL:** https://itzfizz-car.netlify.app/

To deploy your own copy, connect the repository to Netlify and configure the build command and output directory according to the Vite project configuration.

For GitHub Pages, configure Vite's base path for the repository and use a compatible static deployment workflow.

## Assignment

**Scroll-Driven Hero Section Animation**

The project demonstrates frontend development concepts including scroll-based interactions, animation timelines, responsive layouts and performance-conscious UI implementation.

The objective is to recreate the reference's visual experience while exploring smooth, reversible motion and coordinated content reveals.

---

**Developer:** Amit Yadav  
**Project:** ITZFIZZ Scroll-Driven Hero Animation  
**Live Demo:** https://itzfizz-car.netlify.app/  
**Repository:** https://github.com/Amit-yadav12/itzfizz-scroll-experience
