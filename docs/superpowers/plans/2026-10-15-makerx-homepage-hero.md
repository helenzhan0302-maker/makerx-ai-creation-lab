# MakerX HTML Dynamic Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the image-led homepage Hero with a 100svh HTML/CSS/SVG stage that carries the MakerX brand, restrained motion, and a scroll-led project archive.

**Architecture:** Keep the minimal static Astro site. The page owns semantic text and decorative SVG markup; `global.css` owns layout, tokens, responsive rules, and all motion; a small inline script only adds progressive-enhancement reveal behavior. The reference PNG stays available as a source/reference asset but is not used as the Hero content.

**Tech Stack:** Astro 7, native HTML, CSS keyframes, inline SVG, native `IntersectionObserver`, Node built-in test runner.

---

### Task 1: Update the homepage contract tests

**Files:**
- Modify: `tests/homepage.test.mjs`

- [ ] **Step 1: Assert the new HTML-stage contract**

Replace the image-led assertions with checks for the semantic brand, `100svh`, inline SVG, motion fallback, archive anchor, and the absence of the PNG reference in the page source:

```js
assert.match(page, /class="hero-stage"/);
assert.match(page, /MakerX/);
assert.match(page, /AI 造物实验室/);
assert.match(page, /把脑海里的想法，动手造出来。/);
assert.match(page, /<svg[^>]+aria-hidden="true"/s);
assert.match(styles, /min-height:\s*100svh/);
assert.match(styles, /prefers-reduced-motion/);
assert.doesNotMatch(page, /makerx-hero\.png/);
assert.doesNotMatch(page, /实验 001/);
```

- [ ] **Step 2: Run the test before implementation**

Run: `pnpm test`

Expected: FAIL because the current page still references the PNG and does not contain the new stage contract.

### Task 2: Rebuild the semantic homepage stage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the image Hero with semantic text and self-drawn SVG**

Implement one `section.hero-stage` with an in-stage header, four corner labels, one semantic `h1`, the Chinese subtitle and claim, an `aria-hidden` inline SVG for orbit paths and geometric decoration, and a text scroll link to `#projects`. Keep the archive section and footer below the stage. The page must not use `/assets/makerx-hero.png`.

- [ ] **Step 2: Keep progressive enhancement explicit**

Retain the inline reveal script, but make the default HTML visible and only apply the hidden initial state under `.js`. The observer must reveal every `[data-reveal]` item once; reduced motion must reveal them immediately.

### Task 3: Replace the image-led styles with the dynamic stage system

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add stage-specific design tokens**

Keep `--lab-sky`, `--brand-ink`, `--brand-cyan`, and `--brand-peri`; add stage sizing, orbit colors, and motion easing without introducing a dependency or an external font.

- [ ] **Step 2: Implement the 100svh layout**

Make `.hero-stage` `position: relative`, `min-height: 100svh`, `overflow: hidden`, and center its semantic content. Place navigation and corner labels absolutely within the stage, with responsive fallbacks for narrow screens.

- [ ] **Step 3: Animate only decorative transforms and opacity**

Add keyframes for `stage-enter`, `orbit-spin`, `object-float`, and `node-drift`. Use animation overrides so all content becomes static and visible under `prefers-reduced-motion: reduce`.

### Task 4: Update documentation and run static verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Record the new prototype contract**

Update the README to say the Hero is an HTML/CSS/SVG stage, the reference PNG is not rendered as the Hero, and the new local verification commands are the source of truth.

- [ ] **Step 2: Run focused tests**

Run: `pnpm test`

Expected: all homepage contract tests pass.

- [ ] **Step 3: Run Astro diagnostics and build**

Run: `pnpm check` and `pnpm build`

Expected: 0 diagnostics and a generated `dist/index.html`.

- [ ] **Step 4: Verify the running server**

Run: `Invoke-WebRequest http://localhost:4321/ -UseBasicParsing` and check the response status is `200`; inspect the returned HTML for `hero-stage`, `MakerX`, and the absence of `makerx-hero.png`.

### Task 5: Establish Git history and prepare GitHub delivery

**Files:**
- Create: `.gitignore`
- Create: `.gitattributes`
- Repository metadata: `.git/`

- [ ] **Step 1: Create safe repository defaults**

Ignore `node_modules/`, `.astro/`, `dist/`, local environment files, and editor/system files. Do not ignore source references, docs, tests, or the user-provided PNG.

- [ ] **Step 2: Initialize and inspect the repository**

Run: `git init`, `git status --short`, and `git diff --check`.

Expected: only project files are candidates for the initial commit; no generated dependency/build folders are staged.

- [ ] **Step 3: Create the initial versioned snapshot**

Run: `git add .` then `git commit -m "feat: rebuild MakerX homepage hero"`.

Expected: one local commit containing the verified prototype and documentation.

- [ ] **Step 4: Push only after a remote and GitHub authentication are available**

If `gh auth status` is authenticated, create or select the user-approved GitHub repository, add `origin`, and push the current branch. If authentication or the repository URL is missing, stop after the local commit and report the exact one-time action required; never invent a remote or publish to an unknown account.

### Self-review checklist

- The plan replaces the PNG Hero rather than layering HTML over it.
- The first viewport is exactly a full-height stage and does not show the archive before scroll.
- The visual language is self-drawn and does not copy assets from `haoqi.design`.
- The page remains accessible without JavaScript and static under reduced motion.
- Tests verify both presence of semantic stage content and absence of PNG Hero usage.
- GitHub publication is conditional on explicit repository/authentication state, with a local commit always available first.
