import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const periods = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/periods' }),
  schema: z.object({
    name: z.string(),
    order: z.number().int(),
    years: z.string(),
    music: z
      .array(
        z.object({
          title: z.string(),
          composer: z.string(),
          composed: z.string(),
          performer: z.string(),
          source: z.string(),
          sourceUrl: z.string().url(),
          license: z.string(),
          file: z.string(),
        })
      )
      .optional(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artists' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      birth: z.number().int(),
      death: z.number().int(),
      period: reference('periods'),
      portrait: image(),
      portraitSource: z.string().url(),
      portraitLicense: z.string(),
      hook: z.string(),
      timeline: z.array(z.object({ year: z.string(), event: z.string() })),
    }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      artist: reference('artists'),
      period: reference('periods'),
      year: z.string(),
      medium: z.string(),
      location: z.string(),
      image: image(),
      imageSource: z.string().url(),
      imageLicense: z.string(),
      teaser: z.string(),
    }),
});

export const collections = { periods, artists, works };
