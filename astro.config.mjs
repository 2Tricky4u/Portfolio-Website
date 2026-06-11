// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.xavierogay.ch',
  integrations: [mdx(), sitemap()],
  redirects: {
    '/writeups.html': '/writeups',
    '/blog/post1': '/writeups/practical-binary-analysis-ch1',
  },
  markdown: {
    shikiConfig: {
      theme: 'vesper',
    },
  },
});
