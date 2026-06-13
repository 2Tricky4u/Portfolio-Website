# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site for Xavier Ogay (cybersecurity engineer). Static site built with **Astro 5**, deployed to **GitHub Pages** at `https://www.xavierogay.ch`. The project was rewritten from a hand-written HTML site into Astro; the old version lives on the `legacy-html-site` branch.

## Commands

```bash
npm run dev      # local dev server (astro dev)
npm run build    # production build → dist/  (runs astro check's type pass too via the integration)
npm run preview  # serve the built dist/ locally
npm run check    # astro check — type-check .astro/.ts and validate content collections
```

There is no test suite and no separate lint step — `astro check` (also run inside `build`) is the only validation gate. Run it before committing.

## Deployment

`.github/workflows/deploy.yml` builds with `withastro/action@v3` and deploys to GitHub Pages on every push to `main`. The custom domain is pinned by `public/CNAME` (xavierogay.ch); `public/.nojekyll` stops GitHub from running Jekyll over the Astro output. There is no manual deploy step — merging to `main` ships it.

## Architecture

**Content-driven, zero client framework.** All pages are `.astro`; interactivity is plain TypeScript in `src/scripts/` imported from `<script>` tags. There is no React/Vue/Svelte.

- `src/content.config.ts` defines two content collections, both loaded from Markdown via the glob loader with Zod schemas:
  - **`projects`** (`src/content/projects/*.md`) — `featured` + `order` control homepage placement; `cover` is an `image()` (optimized via `astro:assets`); `links.{github,pdf,demo}`.
  - **`writeups`** (`src/content/writeups/*.{md,mdx}`) — blog-style posts with `pubDate`, `draft`, `tags`.
  - **Only `featured: true` projects get their own page.** `src/pages/projects/[...slug].astro` calls `getStaticPaths` filtered to featured projects, so non-featured projects appear in the archive list but have no detail route — don't link to one.
- `src/pages/index.astro` is the single-page homepage, composed of section components (`Hero`, `Timeline`, `FeaturedProjects`, `ProjectArchive`, `WriteupsTeaser`, `Contact`) plus decorative `AsciiBand`/`ScanFx`. Writeups have their own routes under `src/pages/writeups/`.
- **Layouts:** `BaseLayout.astro` (head/SEO, fonts, Nav/Footer, global background + preloader + terminal easter egg) wraps everything; `ProseLayout.astro` wraps long-form project/writeup content.
- **Styling:** design tokens (color, type scale, 4px spacing scale, motion easings) live in `src/styles/tokens.css`; `global.css` imports it and holds resets + shared classes (`.section`, `.container`, `.mono`, `.btn`, `.link`). Components use scoped `<style>` blocks and reference `var(--…)` tokens — add new colors/spacing to `tokens.css` rather than hardcoding.

**Theme:** dark, terminal/reverse-engineering aesthetic — JetBrains Mono `.mono` accents, ASCII art backgrounds, scramble/reveal scroll animations, a hidden interactive terminal (`src/components/easter/Terminal.astro` + `src/scripts/terminal.ts`). The asm/shell token arrays in `index.astro` feed the decorative `AsciiBand` marquees.

## Things that will bite you

- **Contact form field names are load-bearing.** `src/scripts/contact-form.ts` POSTs `FormData` to a Google Apps Script endpoint that writes to a Sheet keyed by exact field `name`s. In `Contact.astro` the inputs are named `Name`, `email`, `Message` (note the capitalization) — **do not rename them** or the spreadsheet columns break silently. The Apps Script URL is also hardcoded there.
- **Email is de-obfuscated client-side.** The contact email is split into `data-user`/`data-domain` attributes and reassembled by JS (anti-scraping). Don't "fix" the placeholder text into a real `mailto:`.
- **Redirects in `astro.config.mjs` are deliberate.** `/writeups.html` → `/writeups/` (trailing slash matters — the generated stub would otherwise shadow the path and loop) and a legacy `/blog/post1` redirect preserve old inbound links. Preserve these when restructuring routes.
- **`rehypeInlineCodeColor`** in `astro.config.mjs` is a custom rehype plugin that colors inline `<code>` by pattern: leading `.` → `.sect` class (section names like `.text`), leading `-`/`--` → `.flag` class. Block code is left to Shiki (`one-dark-pro`). New prose styling for inline code should account for these classes.
