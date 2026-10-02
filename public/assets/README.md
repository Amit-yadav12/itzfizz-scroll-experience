# Original Vehicle Artwork

The three JPEG images in this directory were generated specifically for this project from original, unbranded vehicle prompts. They are concept renders, not manufacturer photographs or licensed production-car assets. No reference-site vehicle image, third-party automotive logo, or manufacturer branding is bundled.

- `velocity-coupe.jpg`: low, mid-engine sports coupe, orange studio render, approximately 156 KB.
- `horizon-gt.jpg`: long-hood grand touring coupe, orange studio render, approximately 111 KB.
- `atlas-suv.jpg`: boxier premium SUV with panoramic roof, orange studio render, approximately 123 KB.

At load, `src/lib/carCutout.ts` converts each render into a true-transparency cutout (only the backdrop connected to the image edge is removed, so reflections and glass stay solid) and fits the whole car inside the band. An SVG color matrix then grades the source orange finish for each selected paint. Color grading is illustrative and affects reflected light as well as the bodywork. All three assets share a normalized, left-facing top-down framing.

The inline SVG fallback artwork in `src/components/CarVisual.tsx` is original source artwork. It renders immediately while a JPEG loads and remains usable if the file cannot be loaded. The complete artwork is mirrored inside SVG to face right, its direction of forward travel. The top-down view does not expose a wheel face: seamless tread patterns represent rolling instead, translating by the exact road displacement and reversing with the same scroll timeline.

The realism refinement does not replace or recolor the supplied images. Its neutral surface reflection is alpha-masked to the same raster or fallback silhouette and animated using transforms and opacity. It is a lighting treatment over the existing concept render, not a real-time 3D simulation or newly generated manufacturer photograph.

Space Grotesk and Manrope are locally bundled Latin-subset variable fonts from Fontsource, distributed under the SIL Open Font License. The copyright notices and full license text are included in `public/FONT-LICENSES.txt`, which also ships in the production build.