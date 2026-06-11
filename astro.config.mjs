// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

/**
 * Colour inline `<code>` by meaning, mirroring the old writeup styling:
 *   `.text`, `.rodata`, …  → .sect  (teal)
 *   `-O0`, `--strip-all`,  → .flag  (khaki)
 * Block code (inside <pre>) is left to Shiki.
 */
function rehypeInlineCodeColor() {
  function textOf(node) {
    if (node.type === 'text') return node.value;
    if (node.children) return node.children.map(textOf).join('');
    return '';
  }
  function visit(node, parent) {
    if (
      node.type === 'element' &&
      node.tagName === 'code' &&
      parent &&
      parent.tagName !== 'pre'
    ) {
      const text = textOf(node).trim();
      let cls = null;
      if (/^\.\w/.test(text)) cls = 'sect';
      else if (/^--?[A-Za-z]/.test(text)) cls = 'flag';
      if (cls) {
        node.properties = node.properties || {};
        const existing = node.properties.className;
        node.properties.className = Array.isArray(existing) ? [...existing, cls] : [cls];
      }
    }
    if (node.children) for (const child of node.children) visit(child, node);
  }
  return (tree) => visit(tree, null);
}

export default defineConfig({
  site: 'https://www.xavierogay.ch',
  integrations: [mdx(), sitemap()],
  redirects: {
    // Trailing slashes matter: the generated /writeups.html stub shadows the
    // bare /writeups path, so the target must be /writeups/ to avoid a loop.
    '/writeups.html': '/writeups/',
    '/blog/post1': '/writeups/practical-binary-analysis-ch1/',
  },
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
    },
    rehypePlugins: [rehypeInlineCodeColor],
  },
});
