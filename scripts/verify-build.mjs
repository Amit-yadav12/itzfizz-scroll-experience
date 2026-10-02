import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const html = await readFile('dist/index.html', 'utf8');
assert(html.includes('ITZFIZZ | Made to Move'), 'The production title is missing.');
assert(!html.includes('/src/main.tsx'), 'The production page still points to source files.');
assert(!/\b(?:src|href)=["']\/(?!\/)/.test(html), 'A root-absolute HTML asset would break a Pages project site.');
assert(!html.includes('fonts.googleapis.com'), 'Fonts must be self-hosted.');
assert(html.includes('data:font/woff2'), 'The bundled Latin font assets are missing.');
for (const path of ['favicon.svg', 'assets/velocity-coupe.jpg', 'assets/horizon-gt.jpg', 'assets/atlas-suv.jpg']) {
  assert((await stat(`dist/${path}`)).size > 0, `Missing production asset: ${path}`);
  assert(html.includes(`./${path}`), `Missing relative asset reference: ${path}`);
}
await stat('dist/.nojekyll');
await stat('dist/FONT-LICENSES.txt');
await stat('dist/ICON-LICENSE.txt');
console.log('Production artifact checks passed: relative URLs, local artwork, embedded fonts, and no source-server references.');