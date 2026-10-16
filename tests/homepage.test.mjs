import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
/** @param {string} relativePath */
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('homepage uses the approved HTML stage contract', () => {
  const page = read('src/pages/index.astro');
  const styles = read('src/styles/global.css');

  assert.match(page, /class="hero-stage"/);
  assert.match(page, /MakerX/);
  assert.match(page, /aria-label="MakerX"/);
  assert.match(page, /class="wordmark-face"/);
  assert.match(page, /class="wordmark-x-glass"/);
  assert.doesNotMatch(page, /class="wordmark-x"/);
  assert.match(page, /AI 造物实验室/);
  assert.match(page, /把脑海里的想法，动手造出来。/);
  assert.match(page, /<svg[^>]+aria-hidden="true"/s);
  assert.match(page, /class="cursor-trail"/);
  assert.match(page, /pointermove/);
  assert.match(page, /id="projects"/);
  assert.doesNotMatch(page, /makerx-hero\.png/);
  assert.doesNotMatch(page, /实验 001/);
  assert.match(styles, /min-height:\s*100svh/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /white-space:\s*nowrap/);
  assert.match(page, /href="#project-list"/);
  assert.match(page, /const baseUrl = import\.meta\.env\.BASE_URL;/);
  assert.match(page, /href=\{`\$\{baseUrl\}lab\/001-ai-planet\/`\}/);
  assert.match(read('astro.config.mjs'), /base:\s*['"]\/makerx['"]/);
  assert.match(page, /aiBaseProject\.title/);
  assert.match(read('src/content/projects/001-ai-base.md'), /title: AI星球/);
});

test('reference image remains available without being used as Hero markup', () => {
  assert.equal(fs.existsSync(path.join(root, 'references/MakerX AI造物实验室.png')), true);
});
