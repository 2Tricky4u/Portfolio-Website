import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      period: z.string(),
      org: z.string().optional(),
      tags: z.array(z.string()),
      featured: z.boolean().default(false),
      order: z.number().default(99),
      cover: image().optional(),
      links: z
        .object({
          github: z.string().url().optional(),
          pdf: z.string().optional(),
          demo: z.string().url().optional(),
        })
        .default({}),
    }),
});

const writeups = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writeups' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, writeups };
