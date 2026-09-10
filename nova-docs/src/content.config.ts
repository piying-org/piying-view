import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
    schema: docsSchema({
      extend: z.object({
        hideTitle: z.boolean().optional(),
      }),
    }),
  }),
}
